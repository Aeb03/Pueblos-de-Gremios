'use strict';

const assert=require('assert');
const CITY=require('../city-progression');

function npc(classKey,marker=null){
  return {classKey,active:true,populationMilestone:marker};
}

(function thresholdsAndLevels(){
  let city=CITY.normalizeCityProgress({level:1,development:9.4});
  assert.strictEqual(city.level,1);

  let result=CITY.addDevelopment(city,.1,1000);
  assert.strictEqual(result.city.level,2);
  assert.deepStrictEqual(result.reached,[2]);
  assert.strictEqual(result.city.levelReachedAt[2],1000);

  result=CITY.addDevelopment(result.city,16,2000);
  assert.strictEqual(result.city.level,3);
  assert.deepStrictEqual(result.reached,[3]);
  assert.strictEqual(result.city.levelReachedAt[3],2000);
})();

(function guaranteedMageAtLevel2(){
  const founders=[npc('warrior'),npc('explorer'),npc('healer')];
  const city=CITY.normalizeCityProgress({level:2,development:9.5});
  const plan=CITY.arrivalPlan(city,founders,()=>.5);

  assert.strictEqual(plan.arrivals.length,1);
  assert.strictEqual(plan.arrivals[0].level,2);
  assert.strictEqual(plan.arrivals[0].classKey,'mage');
  assert.strictEqual(plan.arrivals[0].marker,'city-level-2');
})();

(function reloadDoesNotDuplicateLevel2(){
  const adventurers=[
    npc('warrior'),
    npc('explorer'),
    npc('healer'),
    npc('mage','city-level-2')
  ];
  const city=CITY.normalizeCityProgress({level:2,development:10,populationMilestones:{level2Arrival:false}});
  const first=CITY.arrivalPlan(city,adventurers,()=>.2);

  assert.strictEqual(first.arrivals.length,0);
  assert.strictEqual(first.city.populationMilestones.level2Arrival,true);

  const second=CITY.arrivalPlan(first.city,adventurers,()=>.8);
  assert.strictEqual(second.arrivals.length,0);
})();

(function balancedFifthResident(){
  const four=[
    npc('warrior'),
    npc('explorer'),
    npc('healer'),
    npc('mage','city-level-2')
  ];
  const city=CITY.normalizeCityProgress({
    level:3,
    development:25.5,
    populationMilestones:{level2Arrival:true,level3Arrival:false}
  });
  const plan=CITY.arrivalPlan(city,four,()=>0);

  assert.strictEqual(plan.arrivals.length,1);
  assert.strictEqual(plan.arrivals[0].level,3);
  assert.ok(CITY.CLASSES.includes(plan.arrivals[0].classKey));

  const skewed=[npc('warrior'),npc('warrior'),npc('explorer'),npc('healer'),npc('mage')];
  assert.notStrictEqual(CITY.chooseBalancedClass(skewed,()=>0),'warrior');
})();

(function level1To3PlanIsControlled(){
  const founders=[npc('warrior'),npc('explorer'),npc('healer')];
  const city=CITY.normalizeCityProgress({level:3,development:25.5});
  const plan=CITY.arrivalPlan(city,founders,()=>.99);

  assert.strictEqual(plan.arrivals.length,2);
  assert.strictEqual(plan.arrivals[0].classKey,'mage');
  assert.strictEqual(plan.arrivals[0].marker,'city-level-2');
  assert.strictEqual(plan.arrivals[1].marker,'city-level-3');
})();

(function capacityAndValidation(){
  assert.strictEqual(CITY.slotsForLevel(1),3);
  assert.strictEqual(CITY.slotsForLevel(2),4);
  assert.strictEqual(CITY.slotsForLevel(3),5);
  assert.strictEqual(CITY.mesonCapacity(1),5);

  let city=CITY.normalizeCityProgress({
    level:3,
    development:25.5,
    populationMilestones:{level2Arrival:true,level3Arrival:true}
  });
  const residents=[
    npc('warrior'),
    npc('explorer'),
    npc('healer'),
    npc('mage','city-level-2'),
    npc('warrior','city-level-3')
  ];
  assert.deepStrictEqual(CITY.validateCityProgress(city,residents,1),[]);
})();

(function migrationKeepsExplicitLevel(){
  const city=CITY.normalizeCityProgress({level:2,development:0});
  assert.strictEqual(city.level,2);
  assert.strictEqual(city.development,0);
  assert.strictEqual(city.cityProgressionSchemaVersion,1);
})();

console.log('test-city-progression: OK');
