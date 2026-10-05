(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PG_ACTIVITY_COMBAT=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const COMBAT_SCHEMA_VERSION=1;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const clone=value=>JSON.parse(JSON.stringify(value));

  const BASE_RISK={
    wolf:{
      warrior:{loss:.105,win:.995},
      explorer:{loss:.080,win:.995},
      healer:{loss:.150,win:.965},
      mage:{loss:.125,win:.980}
    },
    boar:{
      warrior:{loss:.180,win:.985},
      explorer:{loss:.155,win:.980},
      healer:{loss:.245,win:.925},
      mage:{loss:.205,win:.960}
    }
  };

  // La presión de grupo no escala linealmente: varios enemigos a la vez
  // deben ser una decisión peligrosa para un aventurero Nv. 1 con equipo inicial.
  const GROUP_PRESSURE={
    wolf:{
      1:{lossMultiplier:1,winPenalty:0,manaMultiplier:1},
      2:{lossMultiplier:1.75,winPenalty:.08,manaMultiplier:1.10},
      3:{lossMultiplier:3.10,winPenalty:.21,manaMultiplier:1.22}
    },
    boar:{
      1:{lossMultiplier:1,winPenalty:0,manaMultiplier:1},
      2:{lossMultiplier:1.90,winPenalty:.18,manaMultiplier:1.15}
    }
  };

  function enemyConfig(data,enemyKey){
    const enemy=data.activityCombat?.enemies?.[enemyKey];
    if(!enemy)throw new Error('Enemigo inválido');
    return enemy;
  }

  function xpNeed(data,level){
    return Number(data.adventurerProgression?.xpToNext?.[level])||0;
  }

  function statsForLevel(data,classKey,level){
    const role=data.adventurerRoles[classKey]||data.adventurerRoles.warrior;
    const stats={
      hp:Number(role.baseStats.hp)||1,
      attack:Number(role.baseStats.attack)||1,
      defense:Number(role.baseStats.defense)||0,
      initiative:Number(role.baseStats.initiative)||0,
      mana:Number(role.baseStats.mana)||0
    };
    const growth=data.adventurerProgression?.statGrowth?.[classKey]||{};
    const safeLevel=Math.max(1,Math.floor(Number(level)||1));

    for(let reached=2;reached<=safeLevel;reached++){
      stats.hp+=Number(growth.hp)||0;
      stats.defense+=Number(growth.defense)||0;
      stats.initiative+=Number(growth.initiative)||0;
      stats.mana+=Number(growth.mana)||0;
      const every=Math.max(0,Math.floor(Number(growth.attackEvery)||0));
      if(!every||reached%every===0)stats.attack+=Number(growth.attack)||0;
    }
    return stats;
  }

  function weaponUpgradeBonus(adventurer,data){
    const role=data.adventurerRoles[adventurer.classKey]||{};
    const starter=Number(role.weaponDamage)||0;
    const current=Number(adventurer.weaponDamage)||starter;
    return Math.max(0,current-starter);
  }

  function previewEncounter(adventurer,enemyKey,count,data){
    const enemy=enemyConfig(data,enemyKey);
    const safeCount=clamp(Math.floor(Number(count)||1),1,Number(enemy.maxCount)||1);
    const classKey=adventurer.classKey;
    const risk=BASE_RISK[enemyKey]?.[classKey];
    if(!risk)throw new Error('Combinación de combate inválida');

    const level=Math.max(1,Math.floor(Number(adventurer.level)||1));
    const levelBonus=(level-1)*.08;
    const weaponBonus=weaponUpgradeBonus(adventurer,data);

    const pressure=GROUP_PRESSURE[enemyKey]?.[safeCount]||GROUP_PRESSURE[enemyKey]?.[1]||{
      lossMultiplier:1,winPenalty:0,manaMultiplier:1
    };

    let meanHpLossRate=risk.loss*pressure.lossMultiplier;
    let winChance=risk.win-pressure.winPenalty;

    meanHpLossRate*=clamp(1-levelBonus-weaponBonus*.018,.45,1);
    winChance=clamp(winChance+levelBonus*.08+weaponBonus*.0015,.55,.999);

    const manaBase=Number(data.activityCombat?.manaUse?.[classKey])||0;
    const meanManaUseRate=clamp(manaBase*pressure.manaMultiplier,0,1);

    return {
      combatSchemaVersion:COMBAT_SCHEMA_VERSION,
      enemyKey,
      enemyName:enemy.name,
      enemyType:enemy.type,
      count:safeCount,
      winChance,
      meanHpLossRate,
      meanManaUseRate,
      xpReward:(Number(enemy.xp)||0)*safeCount,
      enemySnapshot:{
        hp:enemy.hp,
        attack:enemy.attack,
        defense:enemy.defense,
        initiative:enemy.initiative
      },
      adventurerSnapshot:{
        id:adventurer.id,
        classKey,
        level,
        hpCurrent:Number(adventurer.hpCurrent)||0,
        hpMax:Number(adventurer.hpMax)||1,
        manaCurrent:Number(adventurer.manaCurrent)||0,
        manaMax:Number(adventurer.manaMax)||0,
        stats:clone(adventurer.stats||{}),
        weaponDamage:Number(adventurer.weaponDamage)||0
      }
    };
  }

  function applyLevelUps(adventurer,data){
    const maxLevel=Math.max(1,Number(data.adventurerProgression?.maxPlayableLevel)||4);
    const reached=[];

    while(adventurer.level<maxLevel){
      const need=xpNeed(data,adventurer.level);
      if(!need||adventurer.xp<need)break;

      adventurer.xp-=need;
      adventurer.level++;
      const previousHpMax=adventurer.hpMax;
      const previousManaMax=adventurer.manaMax;
      const stats=statsForLevel(data,adventurer.classKey,adventurer.level);

      adventurer.stats=stats;
      adventurer.hpMax=stats.hp;
      adventurer.manaMax=stats.mana;
      adventurer.hpCurrent=Math.min(
        adventurer.hpMax,
        adventurer.hpCurrent+Math.ceil(adventurer.hpMax*.15)
      );
      adventurer.manaCurrent=Math.min(
        adventurer.manaMax,
        adventurer.manaCurrent+Math.ceil(adventurer.manaMax*.20)
      );

      if(previousHpMax<=0)adventurer.hpCurrent=adventurer.hpMax;
      if(previousManaMax<0)adventurer.manaCurrent=adventurer.manaMax;
      reached.push(adventurer.level);
    }

    return reached;
  }

  function loseXpOnIncapacitation(adventurer,data){
    const rate=Number(data.adventurerProgression?.zeroHpXpLossRate)||.20;
    const need=xpNeed(data,adventurer.level);
    const loss=Math.min(
      Math.max(0,Number(adventurer.xp)||0),
      Math.ceil(need*rate)
    );
    adventurer.xp=Math.max(0,adventurer.xp-loss);
    return loss;
  }

  function normalizeHistory(adventurer){
    adventurer.history={
      activities:0,
      victories:0,
      defeats:0,
      incapacitations:0,
      xpLost:0,
      ...(adventurer.history||{})
    };
  }

  function resolveEncounter(adventurer,enemyKey,count,data,rng=Math.random){
    const next=clone(adventurer);
    normalizeHistory(next);

    const preview=previewEncounter(next,enemyKey,count,data);
    const hpVariance=.65+clamp(Number(rng())||0,0,.999999)*.70;
    const manaVariance=.65+clamp(Number(rng())||0,0,.999999)*.70;

    const hpBefore=next.hpCurrent;
    let hpLoss=Math.min(
      next.hpCurrent,
      Math.max(1,Math.ceil(next.hpMax*preview.meanHpLossRate*hpVariance))
    );
    const manaLoss=Math.min(
      next.manaCurrent,
      Math.ceil(next.manaMax*preview.meanManaUseRate*manaVariance)
    );

    next.hpCurrent=Math.max(0,next.hpCurrent-hpLoss);
    next.manaCurrent=Math.max(0,next.manaCurrent-manaLoss);

    const victoryRoll=clamp(Number(rng())||0,0,.999999);
    const won=victoryRoll<preview.winChance&&next.hpCurrent>0;

    let xpGained=0;
    let xpLost=0;
    let levelsGained=[];

    next.history.activities++;

    if(won){
      xpGained=preview.xpReward;
      next.xp=Math.max(0,Number(next.xp)||0)+xpGained;
      next.history.victories++;
      next.status='Disponible';
      levelsGained=applyLevelUps(next,data);
    }else{
      next.hpCurrent=0;
      hpLoss=hpBefore;
      next.status='Incapacitado';
      next.history.defeats++;
      next.history.incapacitations++;
      xpLost=loseXpOnIncapacitation(next,data);
      next.history.xpLost+=xpLost;
    }

    return {
      combatSchemaVersion:COMBAT_SCHEMA_VERSION,
      preview,
      won,
      hpLoss,
      manaLoss,
      xpGained,
      xpLost,
      levelsGained,
      victoryRoll,
      adventurer:next
    };
  }

  function recoverForTest(adventurer){
    const next=clone(adventurer);
    next.hpCurrent=next.hpMax;
    next.manaCurrent=next.manaMax;
    next.status='Disponible';
    return next;
  }

  return {
    COMBAT_SCHEMA_VERSION,
    BASE_RISK,
    GROUP_PRESSURE,
    statsForLevel,
    previewEncounter,
    resolveEncounter,
    loseXpOnIncapacitation,
    recoverForTest
  };
});
