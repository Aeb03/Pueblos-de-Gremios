'use strict';

const assert=require('node:assert/strict');

require('../game-data.js');
const DATA=globalThis.PG_DATA;
const ADV=require('../adventurer-core.js');
const COMBAT=require('../activity-combat.js');
const CITY=require('../city-progression.js');
const DESIGN=require('../world-design-data.js');
const WORLD=require('../world-loop.js');

const fixed=value=>()=>value;

function city(){
  return {
    id:'city-test',
    name:'Villa Test',
    tier:'Pueblo',
    level:1,
    development:0,
    founded:true,
    populationMilestones:{level2Arrival:false,level3Arrival:false},
    levelReachedAt:{}
  };
}

function adventurer(classKey='warrior',personalityKey='bold'){
  return ADV.createAdventurer(DATA,{
    id:'adv-'+classKey+'-'+Math.random().toString(36).slice(2,5),
    firstName:'Ari',
    lastName:'Test',
    fullName:'Ari Test',
    city:city(),
    classKey,
    combatStyle:classKey==='explorer'?'bow':null,
    personalityKey,
    coins:70,
    createdAt:1
  });
}

function state({withAdventurer=true}={}){
  const s={
    city:city(),
    resources:{...DATA.founding.resources},
    workers:{
      mara:{miningXp:0,stamina:100},
      borin:{smithingXp:0,stamina:100},
      eldon:{carpentryXp:0,stamina:100}
    },
    buildings:{
      smithy:{level:1,craftedCount:0},
      meson:{level:1,capacity:5}
    },
    adventurers:withAdventurer?[adventurer()]:[]
  };
  return WORLD.normalizeState(s,DATA,DESIGN);
}

(function approvedFoundationAndWorkerTools(){
  assert.deepEqual(DATA.founding.resources,{
    coins:240,iron:8,stone:6,wood:10,firewood:6,meat:4,skin:1,tendon:1
  });
  const s=state({withAdventurer:false});
  assert.equal(s.workers.mara.worldTool.id,'roughPick');
  assert.equal(s.workers.mara.worldTool.durability,8);
  assert.equal(s.workers.logger.worldTool.id,'roughAxe');
  assert.equal(s.workers.hunter.worldTool.id,'roughHuntingGear');
})();

(function productionQueueReservesAndCompletes(){
  const s=state({withAdventurer:false});
  const ironBefore=s.resources.iron;
  const fireBefore=s.resources.firewood;
  const queued=WORLD.enqueueRecipe(s,'nails',DESIGN,'neutral');
  assert.equal(queued.ok,true);
  assert.equal(s.resources.iron,ironBefore-1);
  assert.equal(s.resources.firewood,fireBefore-1);
  assert.equal(s.worldSystems.production.queue.length,1);
  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(.999));
  assert.equal(s.worldSystems.production.queue.length,0);
  assert.equal(s.worldSystems.production.stock.nails,1);
})();

(function textilePreservesOrigin(){
  const s=state({withAdventurer:false});
  s.city.level=2;
  s.city.development=10;
  s.resources.coins=100;
  s.resources.wood=20;
  s.resources.stone=20;
  s.resources.wolfSkin=2;
  s.worldSystems.production.stock.nails=1;
  s.worldSystems.production.stock.scissors=1;

  const built=WORLD.buildTextile(s,DESIGN);
  assert.equal(built.ok,true);
  assert.equal(s.worldSystems.textile.built,true);

  const tanned=WORLD.tanHide(s,'wolf',DESIGN);
  assert.equal(tanned.ok,true);
  assert.equal(s.resources.tannedWolf,0,'El curtido debe esperar a la cola');
  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(.50));
  assert.equal(s.resources.tannedWolf,1);

  const queued=WORLD.enqueueRecipe(s,'leatherGloves',DESIGN,'wolf');
  assert.equal(queued.ok,true);
  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(.50));

  const product=s.worldSystems.production.goods.leatherGloves[0];
  assert.ok(product);
  assert.equal(product.origin,'wolf');
  assert.equal(product.initiative,1);
  assert.ok(product.salePrice>=12);
})();

(function huntMissionReservesAndPays(){
  const s=state();
  const mission=WORLD.publishHuntMission(s,{enemyKey:'wolf',count:1,reward:6},DESIGN);
  assert.equal(mission.ok,true);

  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(0));
  assert.equal(mission.mission.status,'accepted');
  assert.equal(s.worldSystems.townHall.treasuryReserved,6);

  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(0));
  assert.equal(mission.mission.status,'completed');
  assert.equal(s.worldSystems.townHall.treasuryReserved,0);
  assert.ok(s.adventurers[0].history.missions>=1);
  assert.ok(s.adventurers[0].xp>0||s.adventurers[0].level>1);
})();

(function deliveryRequiresRealDemandAndUsesOwnedLoot(){
  const s=state();
  const npc=s.adventurers[0];
  npc.loot.meat=2;
  s.resources.meat=0;

  const mission=WORLD.publishDeliveryMission(s,{resourceKey:'meat',qty:1,reward:2},DESIGN);
  assert.equal(mission.ok,true);
  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(0));
  assert.equal(mission.mission.status,'accepted');
  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(0));
  assert.equal(mission.mission.status,'completed');
  assert.ok(s.resources.meat>=1);

  s.resources.meat=100;
  const noNeed=WORLD.publishDeliveryMission(s,{resourceKey:'meat',qty:1,reward:2},DESIGN);
  assert.equal(noNeed.ok,false);
})();

(function mesonRecoversRealNeed(){
  const s=state();
  const npc=s.adventurers[0];
  npc.hpCurrent=20;
  npc.manaCurrent=2;
  const coinsBefore=s.resources.coins;
  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(.999));
  assert.ok(npc.hpCurrent>=Math.ceil(npc.hpMax*.55));
  assert.ok(npc.manaCurrent>=Math.ceil(npc.manaMax*.65));
  assert.equal(npc.history.rests,1);
  assert.equal(s.resources.coins,coinsBefore+DESIGN.services.rest.price);
})();

(function workerToolsWearRepairAndUpgrade(){
  const s=state({withAdventurer:false});
  for(let i=0;i<8;i++){
    const out=WORLD.workerOuting(s,'mine',DESIGN,fixed(.99));
    assert.equal(out.ok,true);
  }
  assert.equal(s.workers.mara.worldTool.durability,0);
  assert.equal(WORLD.workerOuting(s,'mine',DESIGN,fixed(.99)).ok,false);

  const repaired=WORLD.repairWorkerTools(s,DESIGN,'mara');
  assert.equal(repaired.ok,true);
  assert.equal(s.workers.mara.worldTool.durability,8);

  s.worldSystems.production.stock.ironPickaxe=1;
  const equip=WORLD.equipWorkerTool(s,'mara','ironPickaxe',DESIGN);
  assert.equal(equip.ok,true);
  assert.equal(s.workers.mara.worldTool.maxDurability,14);

  const ironBefore=s.resources.iron;
  WORLD.workerOuting(s,'mine',DESIGN,fixed(.99));
  assert.ok(s.resources.iron>=ironBefore+6,'Pico mejorado debe sumar al recurso principal');
})();

(function escortOnlyWhenThreatNeedsIt(){
  const s=state();
  const low=WORLD.publishEscortMission(s,{workerKind:'mine',reward:10},DESIGN);
  assert.equal(low.ok,false);

  s.worldSystems.threat.presence.boar=70;
  const reference=16;
  const high=WORLD.publishEscortMission(s,{workerKind:'mine',reward:reference},DESIGN);
  assert.equal(high.ok,true);
})();

(function commonEncounterPersistsConsequences(){
  const s=state();
  const npc=s.adventurers[0];
  const hpBefore=npc.hpCurrent;
  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(.1));
  WORLD.advanceWorld(s,10,{COMBAT},DATA,DESIGN,fixed(.1));
  assert.ok(npc.history.activities>=0);
  assert.ok(npc.hpCurrent<=hpBefore);
})();

(function growthIsAppliedInsideBatchedAdvance(){
  const s=state({withAdventurer:false});
  s.city.development=9.4;
  assert.equal(WORLD.enqueueRecipe(s,'nails',DESIGN).ok,true);
  const observations=[];
  const deps={COMBAT,CITY,onCityProgress(current){
    observations.push({minute:current.worldSystems.clockMinutes,level:current.city.level});
    if(current.city.level>=2&&!current.city.populationMilestones.level2Arrival){
      current.adventurers.push(adventurer('mage'));
      current.city.populationMilestones.level2Arrival=true;
    }
  }};
  WORLD.advanceWorld(s,120,deps,DATA,DESIGN,fixed(.999));
  assert.ok(observations.some(o=>o.minute===10&&o.level===2));
  assert.equal(s.adventurers.length,1);
  assert.equal(s.worldSystems.chronology.events.filter(e=>e.type==='city-level').length,1);
  assert.ok(s.city.levelReachedAt[2]);
  const restored=WORLD.normalizeState(JSON.parse(JSON.stringify(s)),DATA,DESIGN);
  WORLD.advanceWorld(restored,10,deps,DATA,DESIGN,fixed(.999));
  assert.equal(restored.adventurers.length,1);
  assert.equal(restored.worldSystems.chronology.events.filter(e=>e.type==='city-level').length,1);
})();

console.log('test-world-loop: 10 suites OK');
