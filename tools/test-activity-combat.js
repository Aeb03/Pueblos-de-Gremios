'use strict';

const assert=require('assert');
require('../game-data.js');
const DATA=globalThis.PG_DATA;
const ADV=require('../adventurer-core');
const COMBAT=require('../activity-combat');

function rngSequence(values){
  let i=0;
  return ()=>values[Math.min(i++,values.length-1)];
}

function city(){
  return {id:'city-1',name:'Villa Test',tier:'Pueblo'};
}

function make(classKey='warrior'){
  return ADV.createAdventurer(DATA,{
    id:'a-'+classKey,
    firstName:'A',
    lastName:'Test',
    fullName:'A Test',
    city:city(),
    classKey,
    combatStyle:classKey==='explorer'?'bow':null,
    personalityKey:'prudent',
    coins:60,
    createdAt:1
  });
}

(function previewWolf(){
  const a=make('warrior');
  const p=COMBAT.previewEncounter(a,'wolf',1,DATA);
  assert.strictEqual(p.enemyName,'Lobo');
  assert.strictEqual(p.count,1);
  assert.strictEqual(p.xpReward,10);
  assert.ok(p.winChance>.99);
  assert.ok(p.meanHpLossRate>.09&&p.meanHpLossRate<.12);
})();

(function multiEnemyPressure(){
  const a=make('warrior');
  const wolves=COMBAT.previewEncounter(a,'wolf',3,DATA);
  const boars=COMBAT.previewEncounter(a,'boar',2,DATA);

  assert.ok(wolves.meanHpLossRate>.37&&wolves.meanHpLossRate<.38);
  assert.ok(wolves.winChance>.72&&wolves.winChance<.73);
  assert.ok(boars.meanHpLossRate>.40&&boars.meanHpLossRate<.41);
  assert.ok(boars.winChance>.73&&boars.winChance<.74);
})();

(function victoryPersistsDamageAndXp(){
  const a=make('explorer');
  const result=COMBAT.resolveEncounter(a,'wolf',1,DATA,rngSequence([.5,.5,.1]));
  assert.strictEqual(result.won,true);
  assert.strictEqual(result.xpGained,10);
  assert.strictEqual(result.adventurer.xp,10);
  assert.ok(result.adventurer.hpCurrent<a.hpCurrent);
  assert.ok(result.adventurer.manaCurrent<a.manaCurrent);
  assert.strictEqual(result.adventurer.history.activities,1);
  assert.strictEqual(result.adventurer.history.victories,1);
})();

(function levelUpUsesApprovedGrowth(){
  const a=make('warrior');
  a.xp=44;
  const result=COMBAT.resolveEncounter(a,'wolf',1,DATA,rngSequence([.1,.1,.01]));
  assert.strictEqual(result.won,true);
  assert.strictEqual(result.adventurer.level,2);
  assert.deepStrictEqual(result.levelsGained,[2]);
  assert.strictEqual(result.adventurer.stats.hp,126);
  assert.strictEqual(result.adventurer.stats.attack,11);
  assert.strictEqual(result.adventurer.stats.defense,7);
  assert.strictEqual(result.adventurer.stats.mana,19);

  const reloaded=ADV.normalizeAdventurer(result.adventurer,DATA);
  assert.strictEqual(reloaded.level,2);
  assert.strictEqual(reloaded.hpMax,126);
  assert.strictEqual(reloaded.stats.attack,11);
})();

(function defeatLosesCurrentLevelXpOnly(){
  const a=make('healer');
  a.xp=20;
  const result=COMBAT.resolveEncounter(a,'boar',2,DATA,rngSequence([.9,.9,.999]));
  assert.strictEqual(result.won,false);
  assert.strictEqual(result.adventurer.hpCurrent,0);
  assert.strictEqual(result.hpLoss,a.hpCurrent,'una derrota que incapacita debe registrar la pérdida total de PV');
  assert.strictEqual(result.adventurer.status,'Incapacitado');
  assert.strictEqual(result.xpLost,9);
  assert.strictEqual(result.adventurer.xp,11);
  assert.strictEqual(result.adventurer.level,1);
  assert.strictEqual(result.adventurer.history.incapacitations,1);

  const reloaded=ADV.normalizeAdventurer(result.adventurer,DATA);
  assert.strictEqual(reloaded.hpCurrent,0);
  assert.strictEqual(reloaded.status,'Incapacitado');
})();

(function xpLossCannotGoBelowZero(){
  const a=make('mage');
  a.xp=3;
  const result=COMBAT.resolveEncounter(a,'boar',2,DATA,rngSequence([.9,.9,.999]));
  assert.strictEqual(result.won,false);
  assert.strictEqual(result.xpLost,3);
  assert.strictEqual(result.adventurer.xp,0);
})();

(function testRecoveryIsExplicitAndPure(){
  const a=make('warrior');
  a.hpCurrent=0;
  a.manaCurrent=1;
  a.status='Incapacitado';
  const recovered=COMBAT.recoverForTest(a);
  assert.strictEqual(recovered.hpCurrent,recovered.hpMax);
  assert.strictEqual(recovered.manaCurrent,recovered.manaMax);
  assert.strictEqual(recovered.status,'Disponible');
  assert.strictEqual(a.hpCurrent,0);
})();

console.log('test-activity-combat: OK');
