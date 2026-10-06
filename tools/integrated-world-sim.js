#!/usr/bin/env node
'use strict';

require('../game-data.js');
const DATA=globalThis.PG_DATA;
const ADV=require('../adventurer-core.js');
const COMBAT=require('../activity-combat.js');
const CITY=require('../city-progression.js');
const DESIGN=require('../world-design-data.js');
const WORLD=require('../world-loop.js');

function mulberry32(seed){
  let a=seed>>>0;
  return function(){
    a|=0;
    a=(a+0x6D2B79F5)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;

function createNpc(city,classKey,index,rng){
  return ADV.createAdventurer(DATA,{
    id:'sim-'+index,
    firstName:['Kael','Lyra','Neris','Rhea','Corin'][index%5],
    lastName:'Sim',
    fullName:['Kael','Lyra','Neris','Rhea','Corin'][index%5]+' Sim',
    city,
    classKey,
    combatStyle:classKey==='explorer'?(rng()<.5?'bow':'daggers'):null,
    personalityKey:['prudent','bold','loyal','ambitious','frugal'][index%5],
    coins:55+Math.floor(rng()*21),
    createdAt:1
  });
}

function initial(seed){
  const rng=mulberry32(seed);
  const city={
    id:'sim-city',
    name:'Villa Sim',
    tier:'Pueblo',
    prestige:0,
    level:1,
    development:0,
    cityProgressionSchemaVersion:CITY.CITY_PROGRESSION_SCHEMA_VERSION,
    populationMilestones:{level2Arrival:false,level3Arrival:false},
    levelReachedAt:{},
    founded:true,
    foundedAt:1,
    foundingPackGenerated:true
  };
  const state={
    city,
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
    adventurers:[
      createNpc(city,'warrior',0,rng),
      createNpc(city,'explorer',1,rng),
      createNpc(city,'healer',2,rng)
    ]
  };
  WORLD.normalizeState(state,DATA,DESIGN);
  return {state,rng};
}

function reconcilePopulation(state,rng){
  state.city=CITY.normalizeCityProgress(state.city);
  if(state.city.level>=2&&!state.city.populationMilestones.level2Arrival){
    state.adventurers.push(createNpc(state.city,'mage',3,rng));
    state.city.populationMilestones.level2Arrival=true;
  }
  if(state.city.level>=3&&!state.city.populationMilestones.level3Arrival){
    const classes=['warrior','explorer','healer','mage'];
    const counts=Object.fromEntries(classes.map(k=>[k,0]));
    for(const a of state.adventurers)counts[a.classKey]=(counts[a.classKey]||0)+1;
    const min=Math.min(...classes.map(k=>counts[k]));
    const candidates=classes.filter(k=>counts[k]===min);
    const cls=candidates[Math.floor(rng()*candidates.length)];
    state.adventurers.push(createNpc(state.city,cls,4,rng));
    state.city.populationMilestones.level3Arrival=true;
  }
}

function canQueue(state,key){
  const r=DESIGN.recipes[key];
  if(!r)return false;
  if(r.shop==='textile'&&!state.worldSystems.textile.built)return false;
  if(r.materials){
    for(const [k,v] of Object.entries(r.materials))if((state.resources[k]||0)<v)return false;
  }
  if(r.components){
    for(const [k,v] of Object.entries(r.components))if((state.worldSystems.production.stock[k]||0)<v)return false;
  }
  return true;
}

function playerPolicy(state,rng){
  // El jugador mantiene activos los tres oficios de recolección sin castigar offline.
  for(const kind of ['mine','wood','hunt']){
    if(rng()<.58)WORLD.workerOuting(state,kind,DESIGN,rng);
  }

  // Producción básica para desbloquear herramientas y luego oferta comercial.
  const queue=state.worldSystems.production.queue;
  const hasQueued=key=>queue.some(j=>j.recipeKey===key);
  const stock=state.worldSystems.production.stock;

  const priorities=['nails','scissors','toolHandle','pickaxeHead','axeHead','dagger','huntingKnife','huntingBow','simpleStaff','woodenShield'];
  for(const key of priorities){
    if(queue.length>=5)break;
    if(hasQueued(key)||!canQueue(state,key))continue;

    const enough=
      (key==='nails'&&(stock.nails||0)<2)||
      (key==='scissors'&&(stock.scissors||0)<1)||
      (key==='toolHandle'&&(stock.toolHandle||0)<3)||
      (key==='pickaxeHead'&&(stock.pickaxeHead||0)<1)||
      (key==='axeHead'&&(stock.axeHead||0)<1)||
      !['nails','scissors','toolHandle','pickaxeHead','axeHead'].includes(key);
    if(enough)WORLD.enqueueRecipe(state,key,DESIGN,'neutral');
  }

  if((stock.pickaxeHead||0)>0&&(stock.toolHandle||0)>0&&(stock.ironPickaxe||0)<1&&!hasQueued('ironPickaxe')){
    WORLD.enqueueRecipe(state,'ironPickaxe',DESIGN);
  }
  if((stock.axeHead||0)>0&&(stock.toolHandle||0)>0&&(stock.workAxe||0)<1&&!hasQueued('workAxe')){
    WORLD.enqueueRecipe(state,'workAxe',DESIGN);
  }

  // Equipar mejoras de trabajadores cuando están disponibles.
  if((stock.ironPickaxe||0)>0&&state.workers.mara.worldTool.id!=='ironPickaxe')WORLD.equipWorkerTool(state,'mara','ironPickaxe',DESIGN);
  if((stock.workAxe||0)>0&&state.workers.logger.worldTool.id!=='workAxe')WORLD.equipWorkerTool(state,'logger','workAxe',DESIGN);
  if((stock.huntingKnife||0)>0&&!state.workers.hunter.harvestTool)WORLD.equipWorkerTool(state,'hunter','huntingKnife',DESIGN);
  if((state.worldSystems.production.goods.huntingBow||[]).length>0&&state.workers.hunter.worldTool.id!=='huntingBow'){
    WORLD.equipWorkerTool(state,'hunter','huntingBow',DESIGN);
  }

  // Desbloqueo de Textilería.
  if(state.city.level>=2&&!state.worldSystems.textile.built){
    WORLD.buildTextile(state,DESIGN);
  }
  if(state.worldSystems.textile.built){
    for(const origin of ['wolf','boar','neutral','alphaWolf','greatBoar']){
      if((state.resources[DESIGN.materialOrigins[origin].raw]||0)>0&&rng()<.55){
        WORLD.tanHide(state,origin,DESIGN);
      }
    }
    const origins=['wolf','boar','neutral','alphaWolf','greatBoar'].filter(o=>(state.resources[DESIGN.materialOrigins[o].tanned]||0)>0);
    if(origins.length&&queue.filter(j=>j.shop==='textile').length<2){
      const origin=origins[0];
      const recipe=(state.resources[DESIGN.materialOrigins[origin].tanned]||0)>=3&&rng()<.45?'leatherProtection':(rng()<.5?'leatherGloves':'leatherBoots');
      WORLD.enqueueRecipe(state,recipe,DESIGN,origin);
    }
  }

  // Mantener alguna misión real en el tablón.
  const active=state.worldSystems.guild.missions.filter(m=>m.status==='open'||m.status==='accepted');
  if(active.length<1&&WORLD.availableTreasury(state)>75){
    const wolf=state.worldSystems.threat.presence.wolf;
    const boar=state.worldSystems.threat.presence.boar;
    const enemyKey=wolf>=boar?'wolf':'boar';
    WORLD.publishHuntMission(state,{enemyKey,count:1,reward:DESIGN.mission.baseRewards[enemyKey]},DESIGN);
  }

  if(rng()<.12){
    WORLD.repairWorkerTools(state,DESIGN);
  }
}

function run(seed,minutes=240){
  const {state,rng}=initial(seed);
  const deps={COMBAT,CITY,onCityProgress:reconcilePopulation};

  for(let minute=0;minute<minutes;minute+=10){
    playerPolicy(state,rng);
    WORLD.advanceWorld(state,10,deps,DATA,DESIGN,rng);
  }

  const ws=state.worldSystems;
  return {
    cityLevel:state.city.level,
    development:state.city.development,
    coins:state.resources.coins,
    adventurers:state.adventurers.length,
    meanLevel:mean(state.adventurers.map(a=>a.level)),
    downs:state.adventurers.reduce((n,a)=>n+(a.history.incapacitations||0),0),
    activities:state.adventurers.reduce((n,a)=>n+(a.history.activities||0),0),
    rests:ws.meson.restsSold,
    meals:ws.meson.platesSold,
    rations:ws.meson.rationsSold,
    missionsCompleted:ws.guild.completed,
    missionsFailed:ws.guild.failed,
    lootPaid:ws.market.valuePaid,
    textile:ws.textile.built,
    gearSoldValue:ws.market.salesRevenue,
    wolfPresence:ws.threat.presence.wolf,
    boarPresence:ws.threat.presence.boar,
    incidents:ws.threat.incidents,
    cityAttacks:ws.threat.cityAttacks,
    workerInjuries:ws.map.workerInjuries,
    escorts:ws.map.escorts,
    events:ws.chronology.events.length
  };
}

function summarize(rows){
  return {
    runs:rows.length,
    cityLevelMean:mean(rows.map(r=>r.cityLevel)),
    level3Rate:rows.filter(r=>r.cityLevel>=3).length/rows.length,
    coinsMean:mean(rows.map(r=>r.coins)),
    adventurersMean:mean(rows.map(r=>r.adventurers)),
    adventurerLevelMean:mean(rows.map(r=>r.meanLevel)),
    downsMean:mean(rows.map(r=>r.downs)),
    activitiesMean:mean(rows.map(r=>r.activities)),
    restsMean:mean(rows.map(r=>r.rests)),
    mealsMean:mean(rows.map(r=>r.meals)),
    rationsMean:mean(rows.map(r=>r.rations)),
    missionsCompletedMean:mean(rows.map(r=>r.missionsCompleted)),
    missionsFailedMean:mean(rows.map(r=>r.missionsFailed)),
    lootPaidMean:mean(rows.map(r=>r.lootPaid)),
    textileRate:rows.filter(r=>r.textile).length/rows.length,
    gearSoldValueMean:mean(rows.map(r=>r.gearSoldValue)),
    wolfPresenceMean:mean(rows.map(r=>r.wolfPresence)),
    boarPresenceMean:mean(rows.map(r=>r.boarPresence)),
    incidentsMean:mean(rows.map(r=>r.incidents)),
    cityAttacksMean:mean(rows.map(r=>r.cityAttacks)),
    workerInjuriesMean:mean(rows.map(r=>r.workerInjuries)),
    escortsMean:mean(rows.map(r=>r.escorts))
  };
}

const runs=Math.max(1,Number(process.argv[2])||100);
const seed=Math.max(1,Number(process.argv[3])||1989);
const minutes=Math.max(10,Number(process.argv[4])||240);
const rows=[];
for(let i=0;i<runs;i++)rows.push(run(seed+i*97,minutes));
const result=summarize(rows);
console.log('INTEGRATED_WORLD_SIM');
console.log(JSON.stringify(result,null,2));
