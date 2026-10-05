(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PG_CITY_PROGRESSION=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const CITY_PROGRESSION_SCHEMA_VERSION=1;
  const MAX_CITY_LEVEL=3;
  const LEVEL_THRESHOLDS=Object.freeze({1:0,2:9.5,3:25.5});
  const POPULATION_SLOTS=Object.freeze({1:3,2:4,3:5});
  const MESON_CAPACITY=Object.freeze({1:5});
  const DEVELOPMENT_REWARDS=Object.freeze({
    workerOuting:1,
    craft:.45,
    businessUpgrade:2.5
  });
  const CLASSES=Object.freeze(['warrior','explorer','healer','mage']);

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

  function levelFromDevelopment(development){
    const dev=Math.max(0,Number(development)||0);
    if(dev>=LEVEL_THRESHOLDS[3])return 3;
    if(dev>=LEVEL_THRESHOLDS[2])return 2;
    return 1;
  }

  function thresholdForLevel(level){
    const safe=clamp(Math.floor(Number(level)||1),1,MAX_CITY_LEVEL);
    return LEVEL_THRESHOLDS[safe];
  }

  function slotsForLevel(level){
    const safe=clamp(Math.floor(Number(level)||1),1,MAX_CITY_LEVEL);
    return POPULATION_SLOTS[safe];
  }

  function mesonCapacity(level=1){
    const safe=Math.max(1,Math.floor(Number(level)||1));
    return MESON_CAPACITY[safe]||MESON_CAPACITY[1];
  }

  function nextLevelInfo(city){
    const normalized=normalizeCityProgress(city);
    if(normalized.level>=MAX_CITY_LEVEL){
      return {level:null,threshold:null,remaining:0,maxed:true};
    }
    const level=normalized.level+1;
    const threshold=LEVEL_THRESHOLDS[level];
    return {
      level,
      threshold,
      remaining:Math.max(0,Number((threshold-normalized.development).toFixed(2))),
      maxed:false
    };
  }

  function normalizeMilestones(raw={}){
    return {
      level2Arrival:Boolean(raw.level2Arrival),
      level3Arrival:Boolean(raw.level3Arrival)
    };
  }

  function normalizeReachedAt(raw={}){
    const out={};
    for(const level of [2,3]){
      const value=Number(raw[level]);
      if(Number.isFinite(value)&&value>0)out[level]=value;
    }
    return out;
  }

  function normalizeCityProgress(city={}){
    const development=Math.max(0,Number(city.development)||0);
    const derivedLevel=levelFromDevelopment(development);
    const explicitLevel=clamp(Math.floor(Number(city.level)||1),1,MAX_CITY_LEVEL);
    const level=Math.max(explicitLevel,derivedLevel);

    return {
      ...city,
      cityProgressionSchemaVersion:CITY_PROGRESSION_SCHEMA_VERSION,
      level,
      development,
      populationMilestones:normalizeMilestones(city.populationMilestones),
      levelReachedAt:normalizeReachedAt(city.levelReachedAt)
    };
  }

  function addDevelopment(city,amount,at=Date.now()){
    const normalized=normalizeCityProgress(city);
    const delta=Math.max(0,Number(amount)||0);
    const previousLevel=normalized.level;
    normalized.development=Number((normalized.development+delta).toFixed(2));
    normalized.level=Math.max(previousLevel,levelFromDevelopment(normalized.development));

    const reached=[];
    for(let level=previousLevel+1;level<=normalized.level;level++){
      if(level>MAX_CITY_LEVEL)break;
      if(!normalized.levelReachedAt[level])normalized.levelReachedAt[level]=Number(at)||Date.now();
      reached.push(level);
    }

    return {city:normalized,reached,delta};
  }

  function markerForLevel(level){
    return `city-level-${level}`;
  }

  function hasMilestoneAdventurer(adventurers,level){
    const marker=markerForLevel(level);
    return Array.isArray(adventurers)&&adventurers.some(npc=>npc?.populationMilestone===marker);
  }

  function classCounts(adventurers){
    const counts={warrior:0,explorer:0,healer:0,mage:0};
    for(const npc of Array.isArray(adventurers)?adventurers:[]){
      if(npc?.active===false)continue;
      if(Object.prototype.hasOwnProperty.call(counts,npc?.classKey))counts[npc.classKey]++;
    }
    return counts;
  }

  function chooseBalancedClass(adventurers,rng=Math.random){
    const counts=classCounts(adventurers);
    const min=Math.min(...CLASSES.map(key=>counts[key]));
    const candidates=CLASSES.filter(key=>counts[key]===min);
    const roll=clamp(Number(rng())||0,0,0.999999999);
    return candidates[Math.floor(roll*candidates.length)]||candidates[0]||'warrior';
  }

  function arrivalPlan(city,adventurers,rng=Math.random){
    const normalized=normalizeCityProgress(city);
    const milestones={...normalized.populationMilestones};
    const arrivals=[];

    if(normalized.level>=2){
      const already=milestones.level2Arrival||hasMilestoneAdventurer(adventurers,2);
      if(already)milestones.level2Arrival=true;
      else arrivals.push({level:2,classKey:'mage',marker:markerForLevel(2)});
    }

    if(normalized.level>=3){
      const already=milestones.level3Arrival||hasMilestoneAdventurer(adventurers,3);
      if(already)milestones.level3Arrival=true;
      else{
        const projected=[...(Array.isArray(adventurers)?adventurers:[])];
        for(const pending of arrivals)projected.push({classKey:pending.classKey,active:true});
        arrivals.push({level:3,classKey:chooseBalancedClass(projected,rng),marker:markerForLevel(3)});
      }
    }

    normalized.populationMilestones=milestones;
    return {city:normalized,arrivals};
  }

  function markArrival(city,level){
    const normalized=normalizeCityProgress(city);
    if(level===2)normalized.populationMilestones.level2Arrival=true;
    if(level===3)normalized.populationMilestones.level3Arrival=true;
    return normalized;
  }

  function validateCityProgress(city,adventurers=[],mesonLevel=1){
    const normalized=normalizeCityProgress(city);
    const errors=[];
    const active=(Array.isArray(adventurers)?adventurers:[]).filter(n=>n?.active!==false);
    const slots=slotsForLevel(normalized.level);
    const capacity=mesonCapacity(mesonLevel);

    if(active.length>slots)errors.push('populationSlots');
    if(active.length>capacity)errors.push('mesonCapacity');
    if(normalized.level>=2&&!normalized.populationMilestones.level2Arrival&&!hasMilestoneAdventurer(adventurers,2))errors.push('level2Arrival');
    if(normalized.level>=3&&!normalized.populationMilestones.level3Arrival&&!hasMilestoneAdventurer(adventurers,3))errors.push('level3Arrival');

    return errors;
  }

  return {
    CITY_PROGRESSION_SCHEMA_VERSION,
    MAX_CITY_LEVEL,
    LEVEL_THRESHOLDS,
    POPULATION_SLOTS,
    MESON_CAPACITY,
    DEVELOPMENT_REWARDS,
    CLASSES,
    levelFromDevelopment,
    thresholdForLevel,
    slotsForLevel,
    mesonCapacity,
    nextLevelInfo,
    normalizeCityProgress,
    addDevelopment,
    markerForLevel,
    hasMilestoneAdventurer,
    classCounts,
    chooseBalancedClass,
    arrivalPlan,
    markArrival,
    validateCityProgress
  };
});
