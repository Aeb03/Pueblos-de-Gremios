(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PG_WORLD_LOOP=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const WORLD_LOOP_SCHEMA_VERSION=1;
  const TICK_MINUTES=10;
  const MAX_LOG=80;

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const clone=value=>JSON.parse(JSON.stringify(value));
  const randInt=(rng,min,max)=>Math.floor(clamp(Number(rng())||0,0,.999999)*(max-min+1))+min;
  const choice=(rng,list)=>list.length?list[Math.floor(clamp(Number(rng())||0,0,.999999)*list.length)]:null;

  function nowId(prefix='evt'){
    return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
  }

  function ensureResourceBag(resources,design){
    const out={...(resources||{})};
    for(const key of Object.keys(design.resources||{})){
      if(!Number.isFinite(Number(out[key])))out[key]=0;
      else out[key]=Number(out[key]);
    }
    return out;
  }

  function emptyProduction(){
    return {
      stock:{
        simpleMeal:0,travelRation:0,
        nails:0,arrowheads:0,pickaxeHead:0,axeHead:0,ironPickaxe:0,workAxe:0,
        huntingKnife:0,scissors:0,toolHandle:0,arrowBundle:0
      },
      goods:{
        dagger:[],huntingBow:[],simpleStaff:[],woodenShield:[],
        leatherProtection:[],leatherGloves:[],leatherBoots:[],legacySword:[]
      },
      queue:[],
      qualityLog:[],
      policies:{smithy:'store',carpenter:'store',textile:'store'}
    };
  }

  function emptyTextile(){
    return {
      built:false,
      level:0,
      tannedProduced:{neutral:0,wolf:0,boar:0,alphaWolf:0,greatBoar:0},
      goodsProduced:{neutral:0,wolf:0,boar:0,alphaWolf:0,greatBoar:0}
    };
  }

  function emptyWorldSystems(){
    return {
      schemaVersion:WORLD_LOOP_SCHEMA_VERSION,
      clockMinutes:0,
      day:1,
      lastAdvanceAt:null,
      profile:'normal',
      guild:{
        level:1,
        missions:[],
        nextMissionSeq:1,
        completed:0,
        failed:0
      },
      threat:{
        presence:{wolf:25,boar:20},
        alphaPity:0,
        bossPity:0,
        alphaSeen:0,
        alphaDefeated:0,
        bossSeen:0,
        bossDefeated:0,
        incidents:0,
        cityAttacks:0
      },
      production:emptyProduction(),
      textile:emptyTextile(),
      meson:{
        level:1,
        platesSold:0,
        rationsSold:0,
        restsSold:0,
        lodgingSold:0,
        stockMiss:0,
        revenue:0
      },
      market:{
        lootOffers:[],
        acceptedUnits:0,
        rejectedUnits:0,
        valuePaid:0,
        salesRevenue:0
      },
      map:{
        workerOutings:0,
        escorts:0,
        workerInjuries:0,
        routeIncidents:0
      },
      townHall:{
        treasuryReserved:0,
        alerts:[]
      },
      chronology:{
        events:[],
        records:{}
      },
      season:{
        id:'era-prueba-1',
        diamonds:0,
        startedAt:Date.now()
      },
      schools:{built:[],kingdomCoverage:{}},
      transport:{horses:0,carriages:0},
      kingdom:{needs:[],sharedZonesUnlocked:false},
      world:{globalZonesUnlocked:false,endgameUnlocked:false}
    };
  }

  function ensureEquipmentDurability(npc){
    npc.equipment=npc.equipment&&typeof npc.equipment==='object'?npc.equipment:{};
    for(const eq of Object.values(npc.equipment)){
      if(!eq||typeof eq!=='object')continue;
      if(eq.durability==null&&eq.maxDurability!=null)eq.durability=Number(eq.maxDurability);
      if(eq.maxDurability==null&&eq.durability!=null)eq.maxDurability=Number(eq.durability);
    }
  }

  function ensureAdventurer(npc){
    npc.loot=npc.loot&&typeof npc.loot==='object'?npc.loot:{};
    npc.lootOfferMemory=npc.lootOfferMemory&&typeof npc.lootOfferMemory==='object'?npc.lootOfferMemory:{};
    npc.spending={
      gear:0,rest:0,repair:0,consumable:0,
      ...(npc.spending||{})
    };
    npc.inventory=Array.isArray(npc.inventory)?npc.inventory:[];
    npc.rationPrepared=Boolean(npc.rationPrepared);
    npc.preparation={
      sharpening:false,
      bowTuning:false,
      ...(npc.preparation||{})
    };
    npc.autonomy={
      intent:'idle',
      currentActivity:null,
      lastDecisionAt:0,
      lastReturnReason:null,
      ...(npc.autonomy||{})
    };
    npc.history={
      activities:0,victories:0,defeats:0,incapacitations:0,xpLost:0,
      meals:0,rations:0,rests:0,repairs:0,lootSold:0,missions:0,
      ...(npc.history||{})
    };
    ensureEquipmentDurability(npc);
    return npc;
  }

  function refreshCombatStats(npc,data){
    const core=globalThis.PG_ADVENTURER_CORE;
    if(!core||!data.adventurerRoles[npc.classKey])return;
    const stats=core.statsForLevel(npc.classKey,npc.level,data);
    for(const eq of Object.values(npc.equipment||{})){
      if(!eq||eq.founder||eq.durability===0)continue;
      for(const key of ['attack','defense','initiative','mana'])stats[key]+=Number(eq[key])||0;
    }
    npc.stats=stats;
    npc.manaMax=stats.mana;
    npc.manaCurrent=Math.min(npc.manaMax,npc.manaCurrent);
  }

  function makeWorkerTool(toolKey,design){
    const cfg=design.workerTools[toolKey];
    return {
      id:cfg.id,
      name:cfg.name,
      durability:cfg.durability,
      maxDurability:cfg.durability,
      tier:cfg.tier
    };
  }

  function normalizeWorkerTool(current,defaultKey,design){
    if(current&&current.id&&design.workerTools[current.id]){
      const cfg=design.workerTools[current.id];
      return {
        ...makeWorkerTool(current.id,design),
        ...current,
        durability:clamp(Number(current.durability??cfg.durability),0,cfg.durability+Math.max(0,current.qualityBonus||0)*2),
        maxDurability:Math.max(1,cfg.durability+(current.qualityBonus||0)*2)
      };
    }
    return makeWorkerTool(defaultKey,design);
  }

  function normalizeState(state,data,design){
    const next=state;
    next.resources=ensureResourceBag(next.resources,design);
    next.worldSystems={
      ...emptyWorldSystems(),
      ...(next.worldSystems||{})
    };

    const ws=next.worldSystems;
    ws.schemaVersion=WORLD_LOOP_SCHEMA_VERSION;
    ws.guild={...emptyWorldSystems().guild,...(ws.guild||{})};
    ws.guild.missions=Array.isArray(ws.guild.missions)?ws.guild.missions:[];
    ws.threat={...emptyWorldSystems().threat,...(ws.threat||{})};
    ws.threat.presence={wolf:25,boar:20,...(ws.threat.presence||{})};
    ws.production={
      ...emptyProduction(),
      ...(ws.production||{}),
      stock:{...emptyProduction().stock,...(ws.production?.stock||{})},
      goods:{...emptyProduction().goods,...(ws.production?.goods||{})}
    };
    ws.production.toolItems=ws.production.toolItems||{};
    for(const key of Object.keys(ws.production.goods)){
      ws.production.goods[key]=Array.isArray(ws.production.goods[key])?ws.production.goods[key]:[];
    }
    ws.textile={...emptyTextile(),...(ws.textile||{})};
    ws.textile.tannedProduced={...emptyTextile().tannedProduced,...(ws.textile?.tannedProduced||{})};
    ws.textile.goodsProduced={...emptyTextile().goodsProduced,...(ws.textile?.goodsProduced||{})};
    ws.meson={...emptyWorldSystems().meson,...(ws.meson||{})};
    ws.meson.kitchen={enabled:true,targets:{simpleMeal:2,travelRation:2},...(ws.meson.kitchen||{})};
    ws.workerPlans=ws.workerPlans||{};
    ws.market={...emptyWorldSystems().market,...(ws.market||{})};
    ws.market.lootOffers=Array.isArray(ws.market.lootOffers)?ws.market.lootOffers:[];
    ws.map={...emptyWorldSystems().map,...(ws.map||{})};
    ws.map.workerJobs=Array.isArray(ws.map.workerJobs)?ws.map.workerJobs:[];
    ws.townHall={...emptyWorldSystems().townHall,...(ws.townHall||{})};
    ws.townHall.alerts=Array.isArray(ws.townHall.alerts)?ws.townHall.alerts:[];
    ws.chronology={...emptyWorldSystems().chronology,...(ws.chronology||{})};
    ws.chronology.events=Array.isArray(ws.chronology.events)?ws.chronology.events.slice(0,MAX_LOG):[];
    ws.chronology.highlights=Array.isArray(ws.chronology.highlights)?ws.chronology.highlights.slice(0,30):[];
    ws.chronology.records=ws.chronology.records&&typeof ws.chronology.records==='object'?ws.chronology.records:{};
    ws.season={...emptyWorldSystems().season,...(ws.season||{})};
    ws.schools={...emptyWorldSystems().schools,...(ws.schools||{})};
    ws.transport={...emptyWorldSystems().transport,...(ws.transport||{})};
    ws.kingdom={...emptyWorldSystems().kingdom,...(ws.kingdom||{})};
    ws.world={...emptyWorldSystems().world,...(ws.world||{})};

    next.buildings={
      ...(next.buildings||{}),
      townHall:{level:1,...(next.buildings?.townHall||{})},
      carpenter:{level:1,...(next.buildings?.carpenter||{})},
      guildHall:{level:1,missionSlots:design.buildings.guildHall.missionSlots,...(next.buildings?.guildHall||{})},
      textile:{level:ws.textile.built?Math.max(1,ws.textile.level):0,built:ws.textile.built,...(next.buildings?.textile||{})}
    };

    next.buildings.guildHall.missionSlots=2+Math.max(0,(next.buildings.guildHall.level||1)-1);

    next.workers={
      ...(next.workers||{}),
      nara:{name:'Nara',profession:'Mesonera',level:1,cookingXp:0,hospitalityXp:0,...(next.workers?.nara||{})},
      mara:{
        ...(next.workers?.mara||{}),
        worldTool:normalizeWorkerTool(next.workers?.mara?.worldTool,'roughPick',design)
      },
      logger:{
        profession:'Leñador',level:1,outings:0,status:'Disponible',stamina:100,woodcuttingXp:0,
        ...(next.workers?.logger||{}),
        worldTool:normalizeWorkerTool(next.workers?.logger?.worldTool,'roughAxe',design)
      },
      hunter:{
        profession:'Cazador',level:1,outings:0,status:'Disponible',stamina:100,huntingXp:0,
        ...(next.workers?.hunter||{}),
        worldTool:normalizeWorkerTool(next.workers?.hunter?.worldTool,'roughHuntingGear',design),
        harvestTool:next.workers?.hunter?.harvestTool
          ?normalizeWorkerTool(next.workers.hunter.harvestTool,'huntingKnife',design)
          :null
      }
    };

    for(const [key,name] of Object.entries({borin:'Borin',eldon:'Eldon',nara:'Nara',mara:'Mara',logger:'Leñador',hunter:'Cazador'})){next.workers[key].name=next.workers[key].name||name;}
    migrateBusinessStorage(next,design);
    for(const p of Object.values(ws.production.goods).flat())migrateQuality(p,design);
    next.accountLedger={
      seasonId:ws.season.id,
      founderPackClaimed:Boolean(next.city?.founded),
      cityLineageId:next.accountLedger?.cityLineageId||next.city?.id||null,
      ...(next.accountLedger||{})
    };

    next.adventurers=Array.isArray(next.adventurers)?next.adventurers.map(npc=>{ensureAdventurer(npc);for(const p of [...Object.values(npc.equipment||{}),...(npc.inventory||[])])migrateQuality(p,design);if(npc.equipment.weapon&&!npc.equipment.weapon.founder){const base={warrior:4,explorer:4,healer:3,mage:3}[npc.classKey]||3;npc.weaponDamage=base+(npc.equipment.weapon.attack||0);npc.equipment.weapon.damage=npc.weaponDamage;}refreshCombatStats(npc,data);return npc;}):[];
    updateUnlocks(next,design);
    updateAlerts(next,design);
    return next;
  }

  function migrateBusinessStorage(state,design){
    const old=state.shops?.smithy?.storage;
    const carpenter=state.shops?.carpenter?.storage;
    const stock=state.worldSystems.production.stock;
    for(const [oldKey,key] of [['pickaxeHeads','pickaxeHead'],['ironPickaxes','ironPickaxe']]){
      if(old?.[oldKey]>0){stock[key]=(stock[key]||0)+old[oldKey];old[oldKey]=0;}
    }
    if(carpenter?.woodenHandles>0){stock.toolHandle=(stock.toolHandle||0)+carpenter.woodenHandles;carpenter.woodenHandles=0;}
    for(const sword of old?.ironSwords||[]){
      if(state.worldSystems.production.goods.legacySword.some(p=>p.id===sword.id))continue;
      const reference=Number(sword.estimatedValue)||Number(sword.salePrice)||24;
      state.worldSystems.production.goods.legacySword.push({...clone(sword),catalogId:'legacySword',ownerShop:'smithy',slot:'weapon',origin:'neutral',quality:sword.qualityScore||50,referencePrice:reference,salePrice:clamp(Number(sword.salePrice)||reference,Math.ceil(reference*.7),Math.floor(reference*1.3)),attack:Math.max(0,(sword.damage||4)-4),maxDurability:sword.maxDurability||sword.durability,listed:Boolean(sword.listed)});
    }
    if(old)old.ironSwords=[];
  }

  function logEvent(state,type,text,meta={}){
    const ws=state.worldSystems;
    ws.chronology.events.unshift({
      id:nowId(type),
      atMinute:ws.clockMinutes,
      day:ws.day,
      type,
      text,
      meta
    });
    ws.chronology.events=ws.chronology.events.slice(0,MAX_LOG);
    if(['city-level','level-up','market','special-win','special-loss','worker-injury','building','record'].includes(type))ws.chronology.highlights=[ws.chronology.events[0],...(ws.chronology.highlights||[])].slice(0,30);
  }

  function threatBand(value,design){
    const v=clamp(Number(value)||0,0,100);
    return design.threat.bands.find(b=>v>=b.min&&v<=b.max)||design.threat.bands[0];
  }

  function availableTreasury(state){
    return Math.max(0,(Number(state.resources.coins)||0)-(Number(state.worldSystems.townHall.treasuryReserved)||0));
  }

  function personalityShift(npc,design){
    const key=npc.personalityKey||'prudent';
    return design.autonomy.personalityReturnShift[key]||{hp:0,mana:0};
  }

  function returnThresholds(npc,design){
    const shift=personalityShift(npc,design);
    return {
      hp:clamp(design.autonomy.baseReturnHp+(shift.hp||0),.35,.82),
      mana:clamp(design.autonomy.baseReturnMana+(shift.mana||0),.20,.70)
    };
  }

  function recoveryNeed(npc,design){
    const hpRatio=npc.hpMax?npc.hpCurrent/npc.hpMax:0;
    const manaRatio=npc.manaMax?npc.manaCurrent/npc.manaMax:1;
    const threshold=returnThresholds(npc,design);
    return {
      hpRatio,manaRatio,
      needsRest:npc.hpCurrent<=0||hpRatio<threshold.hp||manaRatio<threshold.mana,
      moderate:hpRatio<.88||manaRatio<.80,
      threshold
    };
  }

  function canServeFood(state,kind,design){
    const cfg=design.food[kind];
    return (state.worldSystems.production.stock[kind]||0)>0;
  }

  function spendNpc(npc,bucket,amount){
    npc.coins=Math.max(0,(Number(npc.coins)||0)-amount);
    npc.spending[bucket]=(npc.spending[bucket]||0)+amount;
  }

  function serveMeal(state,npc,design){
    const cfg=design.food.simpleMeal;
    if(!canServeFood(state,'simpleMeal',design)||npc.coins<cfg.price){
      state.worldSystems.meson.stockMiss++;
      return false;
    }
    state.worldSystems.production.stock[cfg.id]--;
    spendNpc(npc,'consumable',cfg.price);
    state.resources.coins+=cfg.price;
    state.worldSystems.meson.revenue+=cfg.price;
    state.worldSystems.meson.platesSold++;
    if(state.workers.nara)state.workers.nara.cookingXp+=5;
    npc.history.meals++;
    npc.hpCurrent=Math.min(npc.hpMax,npc.hpCurrent+Math.ceil(npc.hpMax*cfg.hpRestore));
    npc.manaCurrent=Math.min(npc.manaMax,npc.manaCurrent+Math.ceil(npc.manaMax*cfg.manaRestore));
    logEvent(state,'meson',npc.fullName+' pidió un Plato sencillo para recuperarse.');
    return true;
  }

  function buyRation(state,npc,design){
    const cfg=design.food.travelRation;
    if(npc.rationPrepared)return false;
    if(!canServeFood(state,'travelRation',design)||npc.coins<cfg.price){
      state.worldSystems.meson.stockMiss++;
      return false;
    }
    state.worldSystems.production.stock[cfg.id]--;
    spendNpc(npc,'consumable',cfg.price);
    state.resources.coins+=cfg.price;
    state.worldSystems.meson.revenue+=cfg.price;
    state.worldSystems.meson.rationsSold++;
    if(state.workers.nara)state.workers.nara.cookingXp+=5;
    npc.history.rations++;
    npc.rationPrepared=true;
    logEvent(state,'meson',npc.fullName+' compró una Ración de viaje.');
    return true;
  }

  function buySharpening(state,npc,design){
    if(npc.preparation?.sharpening)return false;
    const compatible=npc.classKey==='warrior'||(npc.classKey==='explorer'&&npc.combatStyle!=='bow');
    if(!compatible)return false;
    const cfg=design.services.sharpening;
    if(npc.coins<cfg.price)return false;
    spendNpc(npc,'consumable',cfg.price);
    state.resources.coins+=cfg.price;
    npc.preparation.sharpening=true;
    logEvent(state,'service',npc.fullName+' pagó un Afilado básico antes de salir.');
    return true;
  }

  function buyBowTuning(state,npc,design){
    if(npc.preparation?.bowTuning)return false;
    if(npc.classKey!=='explorer'||npc.combatStyle!=='bow')return false;
    const cfg=design.services.bowTuning;
    if(npc.coins<cfg.price)return false;
    spendNpc(npc,'consumable',cfg.price);
    state.resources.coins+=cfg.price;
    npc.preparation.bowTuning=true;
    logEvent(state,'service',npc.fullName+' ajustó su arco antes de salir.');
    return true;
  }

  function restAtMeson(state,npc,design){
    const cfg=design.services.rest;
    if(npc.coins<cfg.price)return false;
    spendNpc(npc,'rest',cfg.price);
    state.resources.coins+=cfg.price;
    state.worldSystems.meson.revenue+=cfg.price;
    state.worldSystems.meson.restsSold++;
    if(state.workers.nara)state.workers.nara.hospitalityXp+=5;
    npc.history.rests++;
    const wasDown=npc.hpCurrent<=0||npc.status==='Incapacitado';
    const thresholds=returnThresholds(npc,design);
    npc.hpCurrent=Math.min(npc.hpMax,Math.max(npc.hpCurrent+Math.ceil(npc.hpMax*cfg.restoreHp),Math.ceil(npc.hpMax*(thresholds.hp+.05))));
    npc.manaCurrent=Math.min(npc.manaMax,Math.max(npc.manaCurrent+Math.ceil(npc.manaMax*cfg.restoreMana),Math.ceil(npc.manaMax*(thresholds.mana+.05))));
    npc.status='Disponible';
    npc.autonomy.intent='rested';
    npc.autonomy.lastReturnReason=wasDown?'incapacitación':'recuperación';
    logEvent(state,'meson',npc.fullName+' descansó en el Mesón y volvió a estar disponible.');
    return true;
  }

  function beginSlowRecovery(state,npc){
    const occupied=state.adventurers.filter(n=>n.autonomy.currentActivity?.kind==='recovery').length;
    if(occupied>=(state.buildings.meson.capacity||5))return false;
    npc.autonomy.currentActivity={kind:'recovery',startedAtMinute:state.worldSystems.clockMinutes,resolvesAtMinute:state.worldSystems.clockMinutes+TICK_MINUTES*3};
    npc.autonomy.intent='convalescing';
    npc.status='En convalecencia';
    state.worldSystems.meson.convalescences=(state.worldSystems.meson.convalescences||0)+1;
    logEvent(state,'meson',npc.fullName+' quedó alojado para recuperarse lentamente: no puede pagar el descanso rápido.');
    return true;
  }

  function finishSlowRecovery(state,npc,design){
    const thresholds=returnThresholds(npc,design);
    npc.hpCurrent=Math.max(npc.hpCurrent,Math.ceil(npc.hpMax*(thresholds.hp+.05)));
    npc.manaCurrent=Math.max(npc.manaCurrent,Math.ceil(npc.manaMax*(thresholds.mana+.05)));
    npc.history.freeRests=(npc.history.freeRests||0)+1;
    npc.autonomy.currentActivity=null;
    npc.autonomy.intent='rested';
    npc.status='Disponible';
    npc.mood='Estable';
    logEvent(state,'meson',npc.fullName+' terminó su convalecencia en el Mesón.');
  }

  function rawOriginAvailable(state,design){
    return Object.values(design.materialOrigins)
      .filter(cfg=>(state.resources[cfg.raw]||0)>0)
      .sort((a,b)=>{
        const priority={greatBoar:5,alphaWolf:4,wolf:3,boar:3,neutral:1};
        return (priority[b.id]||0)-(priority[a.id]||0);
      });
  }

  function tanHide(state,origin,design){
    return enqueueRecipe(state,'tannedHide',design,origin);
  }

  function finishTanning(state,origin,design){
    const cfg=design.materialOrigins[origin];
    state.resources[cfg.tanned]=(state.resources[cfg.tanned]||0)+1;
    state.worldSystems.textile.tannedProduced[origin]=(state.worldSystems.textile.tannedProduced[origin]||0)+1;
    state.city.development=Number(((state.city.development||0)+.10).toFixed(2));
    logEvent(state,'textile','Se curtió 1 piel de '+cfg.label+' conservando su origen.');
    return {ok:true,origin,resource:cfg.tanned};
  }

  function productQuality(rng){
    const roll=clamp(Number(rng())||0,0,.999999);
    if(roll>.93)return {score:90+Math.floor((roll-.93)/.07*10),label:'Excelente',multiplier:1.18};
    if(roll>.68)return {score:72+Math.floor((roll-.68)/.25*18),label:'Buena',multiplier:1.08};
    if(roll>.18)return {score:50+Math.floor((roll-.18)/.50*22),label:'Normal',multiplier:1};
    return {score:38+Math.floor(roll/.18*12),label:'Baja',multiplier:.88};
  }

  function craftEquipmentObject(itemKey,origin,quality,design){
    const item=design.equipment[itemKey];
    const originCfg=design.materialOrigins[origin]||design.materialOrigins.neutral;
    const price=Math.max(1,Math.round(item.price*originCfg.priceMul*quality.multiplier));
    return {
      id:nowId(itemKey),
      catalogId:itemKey,
      name:item.name+(origin!=='neutral'?' · '+originCfg.label:''),
      slot:item.slot,
      founder:false,
      durability:item.durability+qualityTier(quality.label)*2,
      maxDurability:item.durability+qualityTier(quality.label)*2,
      attack:(item.attack||0)+((item.attack||0)>0?qualityTier(quality.label):0),
      defense:(item.defense||0)+((item.defense||0)>0?qualityTier(quality.label):0)+(item.textile?(originCfg.defense||0):0),
      initiative:(item.initiative||0)+((item.initiative||0)>0?qualityTier(quality.label):0)+(item.textile?(originCfg.initiative||0):0),
      mana:(item.mana||0)+((item.mana||0)>0?qualityTier(quality.label)*4:0),
      damageReduction:item.textile?(originCfg.damageReduction||0):0,
      origin,
      qualityStatsVersion:1,
      qualityBonus:qualityTier(quality.label),
      quality:quality.score,
      qualityLabel:quality.label,
      referencePrice:price,
      salePrice:price,
      listed:false,
      ownerShop:item.shop
    };
  }

  function consumeRecipeMaterials(state,recipe,origin,design){
    if(recipe.rawOrigin){
      const raw=design.materialOrigins[origin]?.raw;
      if(!raw||(state.resources[raw]||0)<1)return false;
    }
    if(recipe.materials){
      for(const [key,qty] of Object.entries(recipe.materials)){
        if((state.resources[key]||0)<qty)return false;
      }
    }
    if(recipe.components){
      for(const [key,qty] of Object.entries(recipe.components)){
        if((state.worldSystems.production.stock[key]||0)<qty)return false;
      }
    }
    if(recipe.tannedHide){
      const cfg=design.materialOrigins[origin];
      if(!cfg||(state.resources[cfg.tanned]||0)<recipe.tannedHide)return false;
    }

    if(recipe.rawOrigin)state.resources[design.materialOrigins[origin].raw]-=1;
    if(recipe.materials)for(const [key,qty] of Object.entries(recipe.materials))state.resources[key]-=qty;
    if(recipe.components)for(const [key,qty] of Object.entries(recipe.components))state.worldSystems.production.stock[key]-=qty;
    if(recipe.tannedHide)state.resources[design.materialOrigins[origin].tanned]-=recipe.tannedHide;
    return true;
  }

  function craftRecipe(state,recipeKey,design,rng=Math.random,origin='neutral'){
    const recipe=design.recipes[recipeKey];
    if(!recipe)return {ok:false,reason:'Receta inexistente'};
    if(recipe.shop==='textile'&&!state.worldSystems.textile.built)return {ok:false,reason:'Textilería no construida'};
    if(!consumeRecipeMaterials(state,recipe,origin,design))return {ok:false,reason:'Faltan materiales o componentes'};

    const quality=productQuality(rng);
    if(design.equipment[recipeKey]&&Array.isArray(state.worldSystems.production.goods[recipeKey])){
      const product=craftEquipmentObject(recipeKey,origin,quality,design);
      state.worldSystems.production.goods[recipeKey].push(product);
      if(recipe.shop==='textile'){
        state.worldSystems.textile.goodsProduced[origin]=(state.worldSystems.textile.goodsProduced[origin]||0)+1;
      }
    }else{
      state.worldSystems.production.stock[recipeKey]=(state.worldSystems.production.stock[recipeKey]||0)+(recipe.outputQty||1);
    }

    state.worldSystems.production.qualityLog.unshift({recipeKey,quality:quality.label,score:quality.score,origin});
    state.worldSystems.production.qualityLog=state.worldSystems.production.qualityLog.slice(0,20);
    state.city.development=Number(((state.city.development||0)+.45).toFixed(2));
    logEvent(state,'craft','Producción completada: '+recipe.name+' · '+quality.label+'.');
    return {ok:true,recipeKey,quality,origin};
  }

  function finishReservedRecipe(state,job,design,rng){
    const recipe=design.recipes[job.recipeKey];
    if(!recipe)return {ok:false,reason:'Receta inexistente'};
    if(recipe.id==='tannedHide')return finishTanning(state,job.origin,design);
    const quality=productQuality(rng);
    if(recipe.shop==='meson'){state.worldSystems.production.stock[job.recipeKey]=(state.worldSystems.production.stock[job.recipeKey]||0)+1;state.workers.nara.cookingXp+=5;state.city.development=Number(((state.city.development||0)+.03).toFixed(2));logEvent(state,'kitchen','Nara terminó '+recipe.name+'.');return {ok:true};}

    if(design.equipment[job.recipeKey]&&Array.isArray(state.worldSystems.production.goods[job.recipeKey])){
      const product=craftEquipmentObject(job.recipeKey,job.origin||'neutral',quality,design);
      product.listed=job.policy==='sell';
      state.worldSystems.production.goods[job.recipeKey].push(product);
      if(job.policy==='recycle')recycleProduct(state,product.id,design);
      if(recipe.shop==='textile'){
        state.worldSystems.textile.goodsProduced[job.origin||'neutral']=
          (state.worldSystems.textile.goodsProduced[job.origin||'neutral']||0)+1;
      }
    }else{
      state.worldSystems.production.stock[job.recipeKey]=
        (state.worldSystems.production.stock[job.recipeKey]||0)+(recipe.outputQty||1);
    }

    state.worldSystems.production.qualityLog.unshift({
      recipeKey:job.recipeKey,
      quality:quality.label,
      score:quality.score,
      origin:job.origin||'neutral'
    });
    state.worldSystems.production.qualityLog=state.worldSystems.production.qualityLog.slice(0,20);

    if(recipe.shop==='smithy'){
      state.workers.borin.smithingXp=(state.workers.borin.smithingXp||0)+20;
      state.buildings.smithy.craftedCount=(state.buildings.smithy.craftedCount||0)+1;
    }
    if(recipe.shop==='carpenter')state.workers.eldon.carpentryXp=(state.workers.eldon.carpentryXp||0)+20;
    if(design.workerTools[job.recipeKey]&&job.recipeKey!=='huntingBow'){const item=makeWorkerTool(job.recipeKey,design),tier=qualityTier(quality.label);item.qualityBonus=tier;item.qualityLabel=quality.label;item.maxDurability=Math.max(1,item.maxDurability+tier*2);item.durability=item.maxDurability;(state.worldSystems.production.toolItems[job.recipeKey]??=[]).push(item);}
    const currentBest=state.worldSystems.chronology.records.bestCraftedItem;
    if(!currentBest||quality.score>currentBest.score){
      state.worldSystems.chronology.records.bestCraftedItem={
        recipeKey:job.recipeKey,
        name:recipe.name,
        score:quality.score,
        quality:quality.label,
        origin:job.origin||'neutral',
        atMinute:state.worldSystems.clockMinutes
      };
      logEvent(state,'record','Nuevo récord de fabricación: '+recipe.name+' · '+quality.label+' ('+quality.score+').');
    }

    state.city.development=Number(((state.city.development||0)+.45).toFixed(2));
    logEvent(state,'craft','Producción terminada: '+recipe.name+' · '+quality.label+'.');
    return {ok:true,quality};
  }

  function enqueueRecipe(state,recipeKey,design,origin='neutral'){
    const recipe=design.recipes[recipeKey];
    if(!recipe)return {ok:false,reason:'Receta inexistente'};
    if(recipe.shop==='textile'&&!state.worldSystems.textile.built)return {ok:false,reason:'Textilería no construida'};
    const crafter=recipe.shop==='smithy'?state.workers.borin:recipe.shop==='carpenter'?state.workers.eldon:null;
    if(crafter?.restingAtInn)return {ok:false,reason:'El trabajador está descansando en el Mesón'};
    if(crafter&&(crafter.stamina||0)<10)return {ok:false,reason:'El trabajador necesita recuperar Resistencia'};

    const queue=state.worldSystems.production.queue;
    const capacity=5+Math.max(0,(state.buildings[recipe.shop]?.level||1)-1);
    const activeForShop=queue.filter(job=>job.shop===recipe.shop).length;
    if(activeForShop>=capacity)return {ok:false,reason:'Cola de '+recipe.shop+' completa ('+capacity+')'};

    if(!consumeRecipeMaterials(state,recipe,origin,design)){
      return {ok:false,reason:'Faltan materiales o componentes'};
    }

    const durationMinutes=Math.max(
      recipe.worldMinutes||TICK_MINUTES,
      recipe.worldMinutes||Math.ceil((Number(recipe.durationSec)||10)/60/TICK_MINUTES)*TICK_MINUTES
    );
    const previous=queue.filter(j=>j.shop===recipe.shop).at(-1);
    const startsAt=Math.max(state.worldSystems.clockMinutes,previous?.readyAtMinute||0);
    const job={
      id:nowId('job'),
      recipeKey,
      shop:recipe.shop,
      origin,
      startedAtMinute:startsAt,
      readyAtMinute:startsAt+durationMinutes,
      policy:state.worldSystems.production.policies?.[recipe.shop]||'store',
      reservation:recipeReservation(recipe,origin,design)
    };
    queue.push(job);
    if(crafter)crafter.stamina-=10;
    logEvent(state,'queue','Trabajo reservado: '+recipe.name+'. Materiales apartados.');
    return {ok:true,job};
  }

  function enqueueBatch(state,recipeKey,design,origin='neutral',quantity=1){
    const qty=Number(quantity);
    if(!Number.isInteger(qty)||qty<1||qty>5)return {ok:false,reason:'Elegí entre 1 y 5 trabajos'};
    const temporary=clone(state);
    for(let i=0;i<qty;i++){
      const result=enqueueRecipe(temporary,recipeKey,design,origin);
      if(!result.ok)return result;
    }
    state.resources=temporary.resources;
    state.workers=temporary.workers;
    state.worldSystems.production=temporary.worldSystems.production;
    state.worldSystems.chronology=temporary.worldSystems.chronology;
    return {ok:true,quantity:qty};
  }

  function processProductionQueue(state,design,rng){
    const queue=state.worldSystems.production.queue;
    const due=queue.filter(job=>job.readyAtMinute<=state.worldSystems.clockMinutes);
    for(const job of due)finishReservedRecipe(state,job,design,rng);
    state.worldSystems.production.queue=queue.filter(job=>job.readyAtMinute>state.worldSystems.clockMinutes);
    return due.length;
  }

  function buildTextile(state,design){
    if(state.worldSystems.textile.built)return {ok:false,reason:'La Textilería ya está construida'};
    if((state.city.level||1)<design.buildings.textile.unlockCityLevel)return {ok:false,reason:'Requiere Ciudad Nv. 2'};
    const cost=design.buildings.textile.buildCost;
    if(availableTreasury(state)<cost.coins)return {ok:false,reason:'Faltan monedas disponibles'};
    if((state.resources.wood||0)<cost.wood||(state.resources.stone||0)<cost.stone)return {ok:false,reason:'Faltan madera o piedra'};
    if((state.worldSystems.production.stock.nails||0)<cost.nails)return {ok:false,reason:'Falta un lote de clavos'};
    if((state.worldSystems.production.stock.scissors||0)<cost.scissors)return {ok:false,reason:'Faltan Tijeras'};

    state.resources.coins-=cost.coins;
    state.resources.wood-=cost.wood;
    state.resources.stone-=cost.stone;
    state.worldSystems.production.stock.nails-=cost.nails;
    state.worldSystems.production.stock.scissors-=cost.scissors;
    state.worldSystems.textile.built=true;
    state.worldSystems.textile.level=1;
    state.buildings.textile={level:1,built:true};
    state.city.development=Number(((state.city.development||0)+2.5).toFixed(2));
    logEvent(state,'building','Textilería construida. Ya puede conservar el origen de cada piel.');
    return {ok:true};
  }

  function missionReference(enemyKey,count,design){
    return Math.max(1,(design.mission.baseRewards[enemyKey]||6)*Math.max(1,count||1));
  }

  function activeMissionCount(state){
    return state.worldSystems.guild.missions.filter(m=>m.repeat||m.status==='open'||m.status==='accepted').length;
  }

  function hasMissionSlot(state,design){
    const slots=2+Math.max(0,(state.buildings.guildHall?.level||1)-1);
    return activeMissionCount(state)<slots;
  }

  function validateReward(reference,reward,design){
    const chosen=reward==null?reference:Math.round(Number(reward)||reference);
    const min=Math.ceil(reference*design.mission.manualValueRange[0]);
    const max=Math.floor(reference*design.mission.manualValueRange[1]);
    return {chosen,min,max,ok:chosen>=min&&chosen<=max};
  }

  function publishDeliveryMission(state,{resourceKey='meat',qty=1,reward=null}={},design){
    if(!hasMissionSlot(state,design))return {ok:false,reason:'No hay espacio de misiones disponible'};
    const cfg=design.resources[resourceKey];
    if(!cfg)return {ok:false,reason:'Recurso inválido'};
    const amount=Math.max(1,Math.floor(Number(qty)||1));
    const target=stockTarget(state,resourceKey,design);
    const have=Number(state.resources[resourceKey])||0;
    const need=Math.max(0,target-have);
    if(need<amount)return {ok:false,reason:'La ciudad no tiene una demanda real de '+amount+' unidades'};

    const reference=Math.max(1,(cfg.price||1)*amount);
    const price=validateReward(reference,reward,design);
    if(!price.ok)return {ok:false,reason:'La recompensa debe estar entre '+price.min+' y '+price.max+' monedas'};

    const mission={
      id:'mission-'+state.worldSystems.guild.nextMissionSeq++,
      type:'delivery',
      resourceKey,
      qty:amount,
      reward:price.chosen,
      reference,
      status:'open',
      active:true,
      repeat:true,
      cycles:0,
      acceptedBy:null,
      createdAtMinute:state.worldSystems.clockMinutes
    };
    state.worldSystems.guild.missions.unshift(mission);
    logEvent(state,'guild','La Sede publicó una entrega de '+amount+'× '+cfg.name+'.');
    return {ok:true,mission};
  }

  function publishEscortMission(state,{workerKind='mine',reward=null}={},design){
    if(!hasMissionSlot(state,design))return {ok:false,reason:'No hay espacio de misiones disponible'};
    if(!workerForKind(state,workerKind))return {ok:false,reason:'Trabajador inexistente'};
    const danger=workerDanger(state,workerKind,design);
    if(danger<2)return {ok:false,reason:'La amenaza actual no justifica una misión de escolta'};

    const reference=10+danger*3;
    const price=validateReward(reference,reward,design);
    if(!price.ok)return {ok:false,reason:'La recompensa debe estar entre '+price.min+' y '+price.max+' monedas'};

    const mission={
      id:'mission-'+state.worldSystems.guild.nextMissionSeq++,
      type:'escort',
      workerKind,
      reward:price.chosen,
      reference,
      status:'open',
      active:true,
      repeat:true,
      cycles:0,
      acceptedBy:null,
      createdAtMinute:state.worldSystems.clockMinutes
    };
    state.worldSystems.guild.missions.unshift(mission);
    logEvent(state,'guild','La Sede publicó una escolta para una salida de '+workerKind+'.');
    return {ok:true,mission};
  }

  function publishHuntMission(state,{enemyKey='wolf',count=1,reward=null}={},design){
    if(!hasMissionSlot(state,design))return {ok:false,reason:'No hay espacio de misiones disponible'};
    if(!['wolf','boar'].includes(enemyKey))return {ok:false,reason:'Objetivo de caza no disponible'};
    if(!Number.isInteger(Number(count))||count<1||count>(enemyKey==='wolf'?3:2))return {ok:false,reason:'Cantidad de enemigos inválida'};

    const reference=missionReference(enemyKey,count,design);
    const price=validateReward(reference,reward,design);
    if(!price.ok)return {ok:false,reason:'La recompensa debe estar entre '+price.min+' y '+price.max+' monedas'};

    const mission={
      id:'mission-'+state.worldSystems.guild.nextMissionSeq++,
      type:'hunt',
      enemyKey,
      count:Math.max(1,Math.floor(Number(count)||1)),
      reward:price.chosen,
      reference,
      status:'open',
      active:true,
      repeat:true,
      cycles:0,
      acceptedBy:null,
      createdAtMinute:state.worldSystems.clockMinutes,
      completedAtMinute:null
    };
    state.worldSystems.guild.missions.unshift(mission);
    logEvent(state,'guild','La Sede publicó una misión: '+mission.count+'× '+design.enemies[enemyKey].name+'.');
    return {ok:true,mission};
  }

  function toggleMission(state,missionId){
    const mission=state.worldSystems.guild.missions.find(m=>m.id===missionId);
    if(!mission)return {ok:false,reason:'Misión inexistente'};
    mission.active=!mission.active;
    return {ok:true,mission};
  }

  function missionRisk(npc,mission,deps,data,design){
    const enemyKey=mission.enemyKey;
    if(enemyKey==='wolf'||enemyKey==='boar'){
      const enemy=design.enemies[enemyKey];
      const count=Math.min(mission.count,enemyKey==='wolf'?3:2);
      const preview=deps.COMBAT.previewEncounter(npc,enemyKey,count,data);
      return {win:preview.winChance,loss:preview.meanHpLossRate};
    }
    if(enemyKey==='alphaWolf')return {win:.82,loss:.34};
    return {win:.68,loss:.50};
  }

  function acceptanceScore(npc,mission,deps,data,design){
    const risk=missionRisk(npc,mission,deps,data,design);
    const traits=npc.traits||{};
    const courage=(Number(traits.courage)||50)/100;
    const prudence=(Number(traits.prudence)||50)/100;
    const rewardRatio=mission.reward/Math.max(1,mission.reference);
    const health=npc.hpMax?npc.hpCurrent/npc.hpMax:0;
    return (
      risk.win*.42+
      courage*.18+
      rewardRatio*.20+
      health*.16-
      prudence*risk.loss*.22
    );
  }

  function reserveMission(state,mission,npc){
    if(availableTreasury(state)<mission.reward)return false;
    state.worldSystems.townHall.treasuryReserved+=mission.reward;
    mission.status='accepted';
    mission.acceptedBy=npc.id;
    mission.acceptedAtMinute=state.worldSystems.clockMinutes;
    npc.autonomy.intent='mission';
    return true;
  }

  function releaseMissionReservation(state,mission,pay=false,npc=null){
    state.worldSystems.townHall.treasuryReserved=Math.max(
      0,
      state.worldSystems.townHall.treasuryReserved-(mission.reward||0)
    );
    if(pay&&npc){
      state.resources.coins=Math.max(0,state.resources.coins-mission.reward);
      npc.coins=(Number(npc.coins)||0)+mission.reward;
    }
  }

  function compatibleProduct(npc,product,design){
    const item=design.equipment[product.catalogId];
    if(!item)return false;
    return !item.classes||item.classes.includes(npc.classKey);
  }

  function productScore(product){
    if(!product||product.founder)return 0;
    if(Number.isFinite(Number(product.durability))&&product.durability<=0)return -1;
    return (product.attack||0)*2+(product.defense||0)*2+(product.initiative||0)+
      (product.mana||0)*.15+(product.damageReduction||0)*30+(Number(product.quality)||50)*.01;
  }

  function productForNeed(state,npc,design){
    const goods=state.worldSystems.production.goods;
    const candidates=[];
    for(const [key,list] of Object.entries(goods)){
      for(const product of list){
        if(!product.listed||!compatibleProduct(npc,product,design))continue;
        const item=design.equipment[key];
        if(!item)continue;
        const slotKey=product.slot==='weapon'?'weapon':product.slot;
        const current=npc.equipment?.[slotKey];
        const upgrade=productScore(product)-productScore(current);
        if(current&&Number(current.durability)>0&&upgrade<.75)continue;
        candidates.push({product,item,list,key,upgrade});
      }
    }
    candidates.sort((a,b)=>b.upgrade-a.upgrade||productScore(b.product)-productScore(a.product));
    const reserve=design.services.rest.price+(npc.personalityKey==='frugal'?12:2);
    return candidates.find(c=>npc.coins>=c.product.salePrice+reserve)||null;
  }

  function equipPurchased(npc,product){
    const slot=product.slot;
    const key=slot==='weapon'?'weapon':slot;
    const old=npc.equipment[key];
    if(old)npc.inventory.push(clone(old));
    npc.equipment[key]=clone(product);
    for(const stat of ['attack','defense','initiative','mana']){
      const before=old&&!old.founder&&old.durability!==0?(Number(old[stat])||0):0;
      const delta=(Number(product[stat])||0)-before;
      npc.stats[stat]=(npc.stats[stat]||0)+delta;
      if(stat==='mana'){npc.manaMax+=delta;npc.manaCurrent=Math.min(npc.manaMax,npc.manaCurrent+Math.max(0,delta));}
    }
    if(slot==='weapon'){
      const founderDamage={warrior:4,explorer:4,healer:3,mage:3}[npc.classKey]||3;
      npc.weaponDamage=founderDamage+(Number(product.attack)||0);
      npc.equipment[key].damage=npc.weaponDamage;
    }
  }

  function buyGearStep(state,npc,design,rng){
    if(rng()>.16)return false;
    const found=productForNeed(state,npc,design);
    if(!found)return false;
    const price=found.product.salePrice;
    spendNpc(npc,'gear',price);
    state.resources.coins+=price;
    state.worldSystems.market.salesRevenue+=price;
    equipPurchased(npc,found.product);
    found.list.splice(found.list.indexOf(found.product),1);
    logEvent(state,'market',npc.fullName+' compró '+found.product.name+' por '+price+' monedas.',{adventurerId:npc.id,shop:found.product.ownerShop||design.equipment[found.product.catalogId]?.shop});
    return true;
  }

  function repairPrice(eq){
    const reference=Number(eq.referencePrice)||18;
    return Math.max(2,Math.ceil(reference*.22));
  }

  function repairStep(state,npc,rng){
    if(rng()>.70)return false;
    const entries=Object.values(npc.equipment||{}).filter(Boolean);
    const target=entries
      .filter(eq=>Number.isFinite(Number(eq.durability))&&Number(eq.maxDurability)>0)
      .sort((a,b)=>(a.durability/a.maxDurability)-(b.durability/b.maxDurability))[0];
    if(!target||target.durability/target.maxDurability>.40)return false;
    const price=repairPrice(target);
    if(npc.coins<price)return false;
    spendNpc(npc,'repair',price);
    state.resources.coins+=price;
    target.durability=target.maxDurability;
    npc.history.repairs++;
    logEvent(state,'repair',npc.fullName+' reparó '+(target.name||'su equipo')+'.');
    return true;
  }

  function setProductSale(state,productId,{listed,price}={},design){
    const product=Object.values(state.worldSystems.production.goods).flat().find(p=>p.id===productId);
    if(!product)return {ok:false,reason:'El producto ya no está en el negocio'};
    const reference=product.referencePrice;
    const chosen=price==null?product.salePrice:Number(price);
    const min=Math.ceil(reference*.70),max=Math.floor(reference*1.30);
    if(!Number.isInteger(chosen)||chosen<min||chosen>max)return {ok:false,reason:'Precio permitido: '+min+'–'+max};
    product.salePrice=chosen;
    if(listed!=null)product.listed=Boolean(listed);
    return {ok:true,product};
  }

  function recycleProduct(state,productId,design){
    for(const list of Object.values(state.worldSystems.production.goods)){
      const i=list.findIndex(p=>p.id===productId);
      if(i<0)continue;
      const product=list[i],recipe=design.recipes[product.catalogId];
      if(!recipe)return {ok:false,reason:'La pieza no tiene receta de reciclaje'};
      const recovered={};
      for(const [key,qty] of Object.entries(recipe.materials||{})){
        if(key==='firewood')continue;
        const amount=Math.floor(qty*.5);
        if(amount){state.resources[key]=(state.resources[key]||0)+amount;recovered[key]=amount;}
      }
      if(recipe.tannedHide){
        const key=design.materialOrigins[product.origin].tanned;
        const amount=Math.floor(recipe.tannedHide*.5);
        if(amount){state.resources[key]=(state.resources[key]||0)+amount;recovered[key]=amount;}
      }
      list.splice(i,1);
      logEvent(state,'recycle','El taller recicló '+product.name+'.',{recovered});
      return {ok:true,recovered};
    }
    return {ok:false,reason:'El producto ya no está en el negocio'};
  }

  function setProductionPolicy(state,shop,policy){
    if(!['smithy','carpenter','textile'].includes(shop)||!['store','sell','recycle'].includes(policy))return {ok:false};
    state.worldSystems.production.policies={...(state.worldSystems.production.policies||{}),[shop]:policy};
    return {ok:true};
  }

  function computeCombatMods(npc,design){
    let damageReduction=0;
    let winBonus=0;
    let lossMultiplier=1;
    let manaMultiplier=1;

    for(const eq of Object.values(npc.equipment||{})){
      if(!eq||typeof eq!=='object')continue;
      if(Number.isFinite(Number(eq.durability))&&eq.durability<=0){
        if(eq.slot==='weapon'){winBonus-=.08;lossMultiplier*=1.12;}
        if(eq.slot==='body'){lossMultiplier*=1.16;}
        continue;
      }
      if(eq.founder)continue;
      damageReduction+=Number(eq.damageReduction)||0;
      winBonus+=(Number(eq.initiative)||0)*.003;
      lossMultiplier*=clamp(1-(Number(eq.defense)||0)*.018,.82,1);
      if(Number(eq.mana)>0)manaMultiplier*=.95;
    }

    if(npc.preparation?.bowTuning)winBonus+=.012;
    return {
      attackBonus:npc.preparation?.sharpening?1:0,
      damageReduction:clamp(damageReduction,0,.20),
      winBonus:clamp(winBonus,-.20,.15),
      lossMultiplier:clamp(lossMultiplier,.55,1.5),
      manaMultiplier:clamp(manaMultiplier,.70,1.20)
    };
  }

  function wearEquipment(npc,rng,weight=1){
    for(const eq of Object.values(npc.equipment||{})){
      if(!eq||!Number.isFinite(Number(eq.durability))||eq.durability<=0)continue;
      const chance=eq.slot==='weapon'?.95:.55;
      if(rng()>chance)continue;
      const wear=Math.max(1,Math.round(weight));
      eq.durability=Math.max(0,eq.durability-wear);
    }
  }

  function usePreparationBeforeCombat(npc,design){
    const effect={hpFactor:1,manaFactor:1};
    if(npc.rationPrepared){
      effect.hpFactor=1-design.food.travelRation.hpProtection;
      effect.manaFactor=1-design.food.travelRation.manaProtection;
      npc.rationPrepared=false;
    }
    return effect;
  }

  function rollDrops(npc,enemyKey,count,design,rng){
    const enemy=design.enemies[enemyKey];
    if(!enemy)return {};
    const gained={};
    for(let kill=0;kill<count;kill++){
      for(const [key,chance,min,max] of enemy.drops||[]){
        if(rng()>chance)continue;
        const qty=randInt(rng,min,max);
        npc.loot[key]=(npc.loot[key]||0)+qty;
        gained[key]=(gained[key]||0)+qty;
      }
    }

    if(enemyKey==='alphaWolf'){
      for(let extra=0;extra<2;extra++){
        for(const [key,chance,min,max] of design.enemies.wolf.drops){
          if(rng()>chance)continue;
          const qty=randInt(rng,min,max);
          npc.loot[key]=(npc.loot[key]||0)+qty;
          gained[key]=(gained[key]||0)+qty;
        }
      }
    }
    return gained;
  }

  function stockTarget(state,key,design){
    const level=clamp(Math.floor(Number(state.city.level)||1),1,3);
    return Number(design.market.targets[level]?.[key])||0;
  }

  function sellLootStep(state,npc,design){
    let sold=0;
    const tick=Math.floor((state.worldSystems.clockMinutes||0)/TICK_MINUTES);

    for(const [key,qtyRaw] of Object.entries(npc.loot||{})){
      const qty=Math.floor(Number(qtyRaw)||0);
      if(qty<=0||!design.resources[key])continue;

      const memory=npc.lootOfferMemory[key];
      if(memory&&Number(memory.retryAt)>tick&&Number(memory.knownQty)===qty)continue;

      const target=stockTarget(state,key,design);
      const have=Number(state.resources[key])||0;
      const need=Math.max(0,target-have);
      if(need<=0){
        npc.lootOfferMemory[key]={knownQty:qty,retryAt:tick+3,reason:'no-demand'};
        state.worldSystems.market.rejectedUnits+=qty;
        continue;
      }

      const price=design.resources[key].price||1;
      const spendable=Math.max(0,availableTreasury(state)-design.market.cityLootMinTreasury);
      const affordable=Math.floor(spendable/price);
      const accepted=Math.min(qty,need,affordable);

      if(accepted<=0){
        npc.lootOfferMemory[key]={knownQty:qty,retryAt:tick+2,reason:'treasury'};
        state.worldSystems.market.rejectedUnits+=qty;
        continue;
      }

      const value=accepted*price;
      state.resources.coins-=value;
      state.resources[key]=(state.resources[key]||0)+accepted;
      npc.coins=(Number(npc.coins)||0)+value;
      npc.loot[key]-=accepted;
      npc.history.lootSold+=accepted;
      state.worldSystems.market.acceptedUnits+=accepted;
      state.worldSystems.market.valuePaid+=value;
      sold+=accepted;

      const remaining=qty-accepted;
      if(remaining<=0){
        delete npc.lootOfferMemory[key];
      }else{
        npc.lootOfferMemory[key]={
          knownQty:remaining,
          retryAt:tick+(accepted>=need?3:2),
          reason:accepted>=need?'no-demand':'treasury'
        };
      }

      logEvent(state,'loot',npc.fullName+' vendió '+accepted+'× '+design.resources[key].name+' a la ciudad.');
    }
    return sold;
  }

  function completeMission(state,mission,npc,won){
    if(!mission||mission.status!=='accepted')return;
    if(won){
      releaseMissionReservation(state,mission,true,npc);
      mission.status='completed';
      mission.completedAtMinute=state.worldSystems.clockMinutes;
      state.worldSystems.guild.completed++;
      npc.history.missions++;
      const devGain=mission.type==='delivery'?.12:
        mission.type==='escort'?.18:
        (mission.enemyKey==='greatBoar'?1.8:mission.enemyKey==='alphaWolf'?1:.22);
      state.city.development=Number(((state.city.development||0)+devGain).toFixed(2));
      logEvent(state,'guild',npc.fullName+' completó la misión '+mission.id+' y cobró '+mission.reward+' monedas.');
    }else{
      releaseMissionReservation(state,mission,false,npc);
      mission.status='failed';
      state.worldSystems.guild.failed++;
      logEvent(state,'guild',npc.fullName+' no pudo completar la misión '+mission.id+'. La recompensa volvió a quedar disponible.');
    }
  }

  function calculateCommonOutcome(npc,enemyKey,count,deps,data,design,rng){
    const snapshot=clone(npc);
    snapshot.combatMods=computeCombatMods(snapshot,design);
    const prep=usePreparationBeforeCombat(snapshot,design);
    const result=deps.COMBAT.resolveEncounter(snapshot,enemyKey,count,data,rng);
    if(result.won){
      const savedHp=Math.floor(result.hpLoss*(1-prep.hpFactor));
      const savedMana=Math.floor(result.manaLoss*(1-prep.manaFactor));
      result.adventurer.hpCurrent=Math.min(result.adventurer.hpMax,result.adventurer.hpCurrent+savedHp);
      result.adventurer.manaCurrent=Math.min(result.adventurer.manaMax,result.adventurer.manaCurrent+savedMana);
      result.hpLoss-=savedHp;
      result.manaLoss-=savedMana;
    }
    return result;
  }

  function resolveCommonActivity(state,npc,activity,deps,data,design,rng){
    const enemyKey=activity.enemyKey;
    const count=activity.count;
    // El resultado se calcula una sola vez al partir. Los saves antiguos
    // sin resultado se resuelven aquí para mantener compatibilidad.
    const result=activity.resolution||calculateCommonOutcome(npc,enemyKey,count,deps,data,design,rng);
    const gained=result.won?rollDrops(result.adventurer,enemyKey,count,design,rng):{};
    wearEquipment(result.adventurer,rng,1);
    if(result.adventurer.preparation){
      result.adventurer.preparation.sharpening=false;
      result.adventurer.preparation.bowTuning=false;
    }

    const previousLevel=npc.level;
    Object.assign(npc,result.adventurer);
    if(npc.level>previousLevel)logEvent(state,'level-up',npc.fullName+' alcanzó Nv.'+npc.level+' tras su salida.',{adventurerId:npc.id});
    npc.mood=result.won?'Animado':'Abatido';
    npc.lastActivity={enemyKey,count,won:result.won,hpLoss:result.hpLoss,manaLoss:result.manaLoss,drops:gained,atMinute:state.worldSystems.clockMinutes};
    npc.autonomy.currentActivity=null;
    npc.autonomy.intent=result.won?'returning':'incapacitated';

    if(result.won){
      state.worldSystems.threat.presence[enemyKey]=Math.max(
        0,
        state.worldSystems.threat.presence[enemyKey]-(design.enemies[enemyKey].presenceDrop||1)*count
      );
    }

    const mission=activity.missionId
      ?state.worldSystems.guild.missions.find(m=>m.id===activity.missionId)
      :null;
    if(mission?.type==='escort'&&result.won){
      const worker=workerForKind(state,mission.workerKind);
      delete worker.escortMissionId;
      const outing=workerOuting(state,mission.workerKind,design,rng,{forcedEscortId:npc.id});
      result.won=outing.ok;
    }else if(mission?.type==='escort'){
      delete workerForKind(state,mission.workerKind).escortMissionId;
    }
    if(mission)completeMission(state,mission,npc,result.won);

    logEvent(
      state,
      result.won?'combat-win':'combat-loss',
      result.won
        ?npc.fullName+' regresó tras vencer '+count+'× '+design.enemies[enemyKey].name+'.'
        :npc.fullName+' fue incapacitado durante una salida contra '+design.enemies[enemyKey].name+'.',
      {adventurerId:npc.id,enemyKey,count,hpLoss:result.hpLoss,manaLoss:result.manaLoss,xpGained:result.xpGained,xpLost:result.xpLost,drops:gained}
    );
    return result;
  }

  function groupPower(npc){
    const s=npc.stats||{};
    return (s.attack||0)*2+(s.defense||0)*2+(npc.hpMax||0)*.08+(s.initiative||0)+(npc.manaMax||0)*.04;
  }

  function resolveSpecialEncounter(state,group,enemyKey,deps,data,design,rng){
    const kind=enemyKey==='alphaWolf'?'rare':'boss';
    const prepared=group.reduce((sum,npc)=>{
      const mods=computeCombatMods(npc,design);
      return sum+groupPower(npc)*(1+mods.winBonus)+(mods.attackBonus||0)*2;
    },0);
    const levelAvg=group.reduce((sum,npc)=>sum+(npc.level||1),0)/Math.max(1,group.length);
    let winChance,hpLoss,manaUse,xp;

    if(kind==='rare'){
      winChance=clamp(.78+(prepared-95)*.0015+(levelAvg-1)*.02,.55,.96);
      hpLoss=clamp(.30-(prepared-95)*.001-(levelAvg-1)*.02,.16,.48);
      manaUse=.48;xp=design.enemies.alphaWolf.xp;
    }else{
      winChance=clamp(.58+(prepared-125)*.0018+(levelAvg-1)*.03,.30,.90);
      hpLoss=clamp(.52-(prepared-125)*.0013-(levelAvg-1)*.03,.28,.75);
      manaUse=.72;xp=design.enemies.greatBoar.xp;
    }

    const won=rng()<winChance;

    for(const npc of group){
      const prep=usePreparationBeforeCombat(npc,design);
      const localLoss=clamp(hpLoss*(.75+rng()*.50)*prep.hpFactor,0,.98);
      const localMana=clamp(manaUse*(.80+rng()*.35)*prep.manaFactor,0,1);
      npc.hpCurrent=Math.max(0,npc.hpCurrent-Math.ceil(npc.hpMax*localLoss));
      npc.manaCurrent=Math.max(0,npc.manaCurrent-Math.ceil(npc.manaMax*localMana));
      wearEquipment(npc,rng,kind==='boss'?2:1);
      npc.history.activities++;
      if(npc.preparation){npc.preparation.sharpening=false;npc.preparation.bowTuning=false;}
      npc.mood=won?'Animado':'Abatido';
      if(npc.hpCurrent<=0||(!won&&rng()<.55)){
        npc.hpCurrent=0;
        npc.status='Incapacitado';
        npc.history.defeats++;
        npc.history.incapacitations++;
        const lost=deps.COMBAT.loseXpOnIncapacitation(npc,data);
        npc.history.xpLost=(npc.history.xpLost||0)+lost;
      }else if(npc.hpCurrent>0){
        npc.status='Disponible';
      }
    }

    if(won){
      const living=group.filter(npc=>npc.hpCurrent>0);
      const share=Math.max(1,Math.round(xp/Math.max(1,living.length)));
      for(const npc of living){
        npc.xp=(npc.xp||0)+share;
        npc.history.victories++;
        deps.COMBAT.applyLevelUps(npc,data);
      }
      const carrier=choice(rng,living.length?living:group);
      rollDrops(carrier,enemyKey,1,design,rng);
      if(kind==='rare'){
        state.worldSystems.threat.alphaDefeated++;
        state.worldSystems.threat.presence.wolf=Math.max(0,state.worldSystems.threat.presence.wolf-design.enemies.alphaWolf.presenceDrop);
        if(!state.worldSystems.chronology.records.firstAlphaWolfDefeat){
          state.worldSystems.chronology.records.firstAlphaWolfDefeat={
            atMinute:state.worldSystems.clockMinutes,
            members:group.map(n=>({id:n.id,name:n.fullName}))
          };
          logEvent(state,'record','Primera derrota del Lobo Alfa registrada en las Crónicas.');
        }
      }else{
        state.worldSystems.threat.bossDefeated++;
        state.worldSystems.threat.presence.boar=Math.max(0,state.worldSystems.threat.presence.boar-design.enemies.greatBoar.presenceDrop);
        if(!state.worldSystems.chronology.records.firstGreatBoarDefeat){
          state.worldSystems.chronology.records.firstGreatBoarDefeat={
            atMinute:state.worldSystems.clockMinutes,
            members:group.map(n=>({id:n.id,name:n.fullName}))
          };
          logEvent(state,'record','Primera derrota del Gran Jabalí registrada en las Crónicas.');
        }
      }
      logEvent(state,'special-win','Un grupo derrotó a '+design.enemies[enemyKey].name+'.',{members:group.map(n=>n.id)});
    }else{
      logEvent(state,'special-loss','El grupo no pudo derrotar a '+design.enemies[enemyKey].name+'.',{members:group.map(n=>n.id)});
    }
    return won;
  }

  function startSpecialActivity(state,group,enemyKey,deps,data,design,rng){
    for(const npc of group){
      repairStep(state,npc,rng);
      buyRation(state,npc,design);
    }
    const temporary=clone(state);
    const simulated=group.map(n=>temporary.adventurers.find(a=>a.id===n.id));
    const won=resolveSpecialEncounter(temporary,simulated,enemyKey,deps,data,design,rng);
    const groupId=nowId('group');
    const resolution={won,members:simulated.map(n=>clone(n)),enemyKey};
    for(const npc of group){
      npc.autonomy.currentActivity={kind:'group',groupId,enemyKey,count:1,
        members:group.map(n=>n.id),resolution,
        snapshot:{adventurers:group.map(n=>clone({...n,autonomy:{...n.autonomy,currentActivity:null}})),enemy:clone(design.enemies[enemyKey]),presence:clone(state.worldSystems.threat.presence)},
        startedAtMinute:state.worldSystems.clockMinutes,
        resolvesAtMinute:state.worldSystems.clockMinutes+TICK_MINUTES*2};
      npc.status='En grupo';
      npc.autonomy.intent='group';
    }
    logEvent(state,'outing','Se preparó un grupo para enfrentar a '+design.enemies[enemyKey].name+'.',{members:group.map(n=>n.id),enemyKey});
  }

  function resolveGroupActivity(state,activity,design){
    const {won,members,enemyKey}=activity.resolution;
    for(const outcome of members){
      const npc=state.adventurers.find(n=>n.id===outcome.id);
      if(!npc||npc.autonomy.currentActivity?.groupId!==activity.groupId)continue;
      const previousLevel=npc.level;Object.assign(npc,clone(outcome));
      if(npc.level>previousLevel)logEvent(state,'level-up',npc.fullName+' alcanzó Nv.'+npc.level+' en una expedición de grupo.',{adventurerId:npc.id});
      npc.autonomy.currentActivity=null;
      npc.autonomy.intent=won?'returning':'incapacitated';
      npc.lastActivity={enemyKey,count:1,won,atMinute:state.worldSystems.clockMinutes};
    }
    const kind=enemyKey==='alphaWolf'?'rare':'boss';
    if(won){
      const species=kind==='rare'?'wolf':'boar';
      state.worldSystems.threat.presence[species]=Math.max(0,state.worldSystems.threat.presence[species]-design.enemies[enemyKey].presenceDrop);
      state.worldSystems.threat[kind==='rare'?'alphaDefeated':'bossDefeated']++;
      const key=kind==='rare'?'firstAlphaWolfDefeat':'firstGreatBoarDefeat';
      if(!state.worldSystems.chronology.records[key]){
        state.worldSystems.chronology.records[key]={atMinute:state.worldSystems.clockMinutes,members:members.map(n=>({id:n.id,name:n.fullName}))};
        logEvent(state,'record','Primera derrota de '+design.enemies[enemyKey].name+' registrada.');
      }
    }
    logEvent(state,won?'special-win':'special-loss',
      members.map(n=>n.fullName).join(', ')+(won?' derrotaron a ':' regresaron sin vencer a ')+design.enemies[enemyKey].name+'.',
      {members:members.map(n=>n.id),enemyKey,won});
  }

  function startNpcActivity(state,npc,{enemyKey,count,missionId=null},deps,data,design,rng){
    npc.autonomy.currentActivity={
      kind:missionId?'mission':'spontaneous',
      enemyKey,
      count,
      missionId,
      snapshot:{adventurer:clone(npc),enemy:clone(design.enemies[enemyKey]),count,presence:clone(state.worldSystems.threat.presence),zone:enemyKey==='wolf'?'northForest':'stoneHills'},
      resolution:calculateCommonOutcome(npc,enemyKey,count,deps,data,design,rng),
      startedAtMinute:state.worldSystems.clockMinutes,
      resolvesAtMinute:state.worldSystems.clockMinutes+TICK_MINUTES
    };
    npc.autonomy.intent=missionId?'mission':'outing';
    npc.status=missionId?'En misión':'En salida';
  }

  function tryMissionDecision(state,npc,deps,data,design,rng){
    const candidates=state.worldSystems.guild.missions
      .filter(m=>m.active&&m.status==='open')
      .sort((a,b)=>b.reward/b.reference-a.reward/a.reference);

    for(const mission of candidates){
      if(mission.type==='delivery'){
        const have=Math.floor(Number(npc.loot?.[mission.resourceKey])||0);
        if(have<mission.qty)continue;
        const greed=(Number(npc.traits?.greed)||50)/100;
        const rewardRatio=mission.reward/Math.max(1,mission.reference);
        if((.48+greed*.22+rewardRatio*.18)<.62+rng()*.20)continue;
        if(!missionNeeded(state,mission,design))continue;
        if(!reserveMission(state,mission,npc))continue;
        npc.autonomy.currentActivity={
          kind:'delivery',
          missionId:mission.id,
          startedAtMinute:state.worldSystems.clockMinutes,
          resolvesAtMinute:state.worldSystems.clockMinutes+TICK_MINUTES
        };
        npc.status='En misión';
        logEvent(state,'mission-accept',npc.fullName+' aceptó la entrega '+mission.id+'.');
        return true;
      }

      if(mission.type==='escort'){
        const worker=workerForKind(state,mission.workerKind);
        if(worker?.restingAtInn||(worker?.stamina??100)<20)continue;
        if(!worker||worker.currentJob||worker.escortMissionId||worker.injuredUntil>state.worldSystems.clockMinutes||worker.worldTool.durability<=0)continue;
        const wolf=state.worldSystems.threat.presence.wolf;
        const boar=state.worldSystems.threat.presence.boar;
        const enemyKey=mission.workerKind==='mine'?'boar':'wolf';
        const proxy={...mission,enemyKey,count:1};
        const score=acceptanceScore(npc,proxy,deps,data,design);
        if(score<.58+rng()*.18)continue;
        if(!missionNeeded(state,mission,design))continue;
        if(!reserveMission(state,mission,npc))continue;
        buyRation(state,npc,design);
        startNpcActivity(state,npc,{enemyKey,count:1,missionId:mission.id},deps,data,design,rng);
        workerForKind(state,mission.workerKind).escortMissionId=mission.id;
        workerForKind(state,mission.workerKind).stamina=(workerForKind(state,mission.workerKind).stamina??100)-20;
        npc.autonomy.currentActivity.kind='escort';
        logEvent(state,'mission-accept',npc.fullName+' aceptó la escolta '+mission.id+'.');
        return true;
      }

      if(mission.type!=='hunt'||(mission.enemyKey!=='wolf'&&mission.enemyKey!=='boar'))continue;
      const score=acceptanceScore(npc,mission,deps,data,design);
      if(score<.56+rng()*.18)continue;
      if(!missionNeeded(state,mission,design))continue;
        if(!reserveMission(state,mission,npc))continue;
      if((mission.count>=2||mission.enemyKey!=='wolf')&&rng()<.65)buyRation(state,npc,design);
      if(mission.count>=2||mission.enemyKey==='boar'){
        if(rng()<.55)buySharpening(state,npc,design);
        if(rng()<.55)buyBowTuning(state,npc,design);
      }
      startNpcActivity(state,npc,{enemyKey:mission.enemyKey,count:mission.count,missionId:mission.id},deps,data,design,rng);
      logEvent(state,'mission-accept',npc.fullName+' aceptó '+mission.id+'.');
      return true;
    }
    return false;
  }

  function spontaneousDecision(state,npc,deps,data,design,rng){
    const traits=npc.traits||{};
    const courage=(Number(traits.courage)||50)/100;
    const ambition=(Number(traits.ambition)||50)/100;
    const chance=.10+courage*.10+ambition*.07;
    if(rng()>chance)return false;

    const wolf=state.worldSystems.threat.presence.wolf;
    const boar=state.worldSystems.threat.presence.boar;
    const enemyKey=boar>wolf&&rng()<.55?'boar':(rng()<.64?'wolf':'boar');
    const count=enemyKey==='wolf'
      ?(rng()<.68?1:(rng()<.82?2:3))
      :(rng()<.82?1:2);

    const predicted=missionRisk(npc,{enemyKey,count},deps,data,design);
    const prudence=(Number(npc.traits?.prudence)||50)/100;
    if(predicted.win<.58+prudence*.22)return false;
    if(count>=2&&rng()<.55)buyRation(state,npc,design);
    if(count>=2){
      if(rng()<.45)buySharpening(state,npc,design);
      if(rng()<.45)buyBowTuning(state,npc,design);
    }
    startNpcActivity(state,npc,{enemyKey,count},deps,data,design,rng);
    logEvent(state,'outing',npc.fullName+' salió por iniciativa propia contra '+count+'× '+design.enemies[enemyKey].name+'.');
    return true;
  }

  function serviceAndMarketDecision(state,npc,design,rng){
    const need=recoveryNeed(npc,design);
    if(need.needsRest){
      if(restAtMeson(state,npc,design))return true;
      if(beginSlowRecovery(state,npc))return true;
      npc.autonomy.intent='needs-rest';
      return true;
    }
    repairStep(state,npc,rng);
    if(need.moderate&&rng()<.35){
      if(serveMeal(state,npc,design))return true;
    }
    if(buyGearStep(state,npc,design,rng))return true;
    return false;
  }

  function resolveDeliveryActivity(state,npc,activity,design){
    const mission=state.worldSystems.guild.missions.find(m=>m.id===activity.missionId);
    if(!mission){
      npc.autonomy.currentActivity=null;
      npc.status='Disponible';
      return false;
    }
    const have=Math.floor(Number(npc.loot?.[mission.resourceKey])||0);
    const ok=have>=mission.qty;
    if(ok){
      npc.loot[mission.resourceKey]-=mission.qty;
      state.resources[mission.resourceKey]=(state.resources[mission.resourceKey]||0)+mission.qty;
    }
    completeMission(state,mission,npc,ok);
    npc.autonomy.currentActivity=null;
    npc.autonomy.intent=ok?'returning':'idle';
    npc.status='Disponible';
    return ok;
  }

  function resolveDueActivities(state,deps,data,design,rng){
    for(const npc of state.adventurers){
      const activity=npc.autonomy?.currentActivity;
      if(!activity||activity.resolvesAtMinute>state.worldSystems.clockMinutes)continue;
      if(activity.kind==='recovery'){
        finishSlowRecovery(state,npc,design);
      }else if(activity.kind==='group'){
        resolveGroupActivity(state,activity,design);
      }else if(activity.kind==='delivery'){
        resolveDeliveryActivity(state,npc,activity,design);
      }else if(activity.enemyKey==='wolf'||activity.enemyKey==='boar'){
        resolveCommonActivity(state,npc,activity,deps,data,design,rng);
      }
    }
  }

  function autonomyStep(state,deps,data,design,rng){
    for(const npc of state.adventurers){
      ensureAdventurer(npc);
      npc.needs={...(npc.needs||{}),recovery:Math.round((1-npc.hpCurrent/npc.hpMax)*100),equipment:Object.values(npc.equipment||{}).some(e=>e&&e.durability===0)?100:0};
      if(npc.autonomy.currentActivity)continue;
      npc.status=npc.hpCurrent<=0?'Incapacitado':'Disponible';
      const deliveryPending=state.worldSystems.guild.missions.some(m=>m.type==='delivery'&&m.active&&m.status==='open'&&(npc.loot[m.resourceKey]||0)>=m.qty);
      if(!deliveryPending||(recoveryNeed(npc,design).needsRest&&npc.coins<design.services.rest.price))sellLootStep(state,npc,design);
      if(serviceAndMarketDecision(state,npc,design,rng))continue;
      if(npc.hpCurrent<=0)continue;
      if(tryMissionDecision(state,npc,deps,data,design,rng))continue;
      sellLootStep(state,npc,design);
      spontaneousDecision(state,npc,deps,data,design,rng);
      npc.autonomy.lastDecisionAt=state.worldSystems.clockMinutes;
    }
  }

  function maybeSpecialEncounters(state,deps,data,design,rng){
    const cityLevel=Number(state.city.level)||1;
    const healthy=state.adventurers
      .filter(npc=>npc.hpCurrent>npc.hpMax*.60&&npc.manaCurrent>npc.manaMax*.40&&!npc.autonomy.currentActivity)
      .sort((a,b)=>groupPower(b)-groupPower(a));

    const wolfBand=threatBand(state.worldSystems.threat.presence.wolf,design);
    const boarBand=threatBand(state.worldSystems.threat.presence.boar,design);
    const bandIndex=id=>design.threat.bands.findIndex(b=>b.id===id);

    if(cityLevel>=2&&healthy.length>=2){
      const p=(design.threat.alphaChance[bandIndex(wolfBand.id)]||0)+state.worldSystems.threat.alphaPity;
      if(rng()<p){
        state.worldSystems.threat.alphaSeen++;
        state.worldSystems.threat.alphaPity=0;
        startSpecialActivity(state,healthy.slice(0,3),'alphaWolf',deps,data,design,rng);
        return;
      }else state.worldSystems.threat.alphaPity=clamp(state.worldSystems.threat.alphaPity+.002,0,.03);
    }

    if(cityLevel>=3&&healthy.length>=3){
      const p=(design.threat.bossChance[bandIndex(boarBand.id)]||0)+state.worldSystems.threat.bossPity;
      if(rng()<p){
        state.worldSystems.threat.bossSeen++;
        state.worldSystems.threat.bossPity=0;
        startSpecialActivity(state,healthy.slice(0,3),'greatBoar',deps,data,design,rng);
      }else state.worldSystems.threat.bossPity=clamp(state.worldSystems.threat.bossPity+.001,0,.015);
    }
  }

  function threatConsequences(state,design,rng){
    for(const species of ['wolf','boar']){
      const band=threatBand(state.worldSystems.threat.presence[species],design);
      const chance={controlled:0,growing:.02,high:.06,critical:.12,imminent:.20}[band.id]||0;
      if(rng()<chance){
        state.worldSystems.threat.incidents++;
        state.worldSystems.map.routeIncidents++;
        if(species==='wolf'){
          const loss=Math.min(state.resources.meat||0,randInt(rng,1,3));
          state.resources.meat-=loss;
        }else{
          const loss=Math.min(state.resources.wood||0,randInt(rng,1,3));
          state.resources.wood-=loss;
        }
        logEvent(state,'threat','Incidente por amenaza de '+design.enemies[species].name+'.');
      }

      if(band.id==='imminent'&&rng()<.08){
        state.worldSystems.threat.cityAttacks++;
        const coinLoss=Math.min(availableTreasury(state),randInt(rng,6,15));
        state.resources.coins-=coinLoss;
        logEvent(state,'city-attack','La amenaza llegó a la ciudad. Se perdieron '+coinLoss+' monedas.');
      }
    }
  }

  function threatStep(state,deps,data,design,rng){
    state.worldSystems.threat.presence.wolf=clamp(
      state.worldSystems.threat.presence.wolf+design.threat.growthPerTick.wolf,
      0,100
    );
    state.worldSystems.threat.presence.boar=clamp(
      state.worldSystems.threat.presence.boar+design.threat.growthPerTick.boar,
      0,100
    );
    maybeSpecialEncounters(state,deps,data,design,rng);
    threatConsequences(state,design,rng);
  }

  function workerForKind(state,kind){
    if(kind==='mine')return state.workers.mara;
    if(kind==='wood')return state.workers.logger;
    if(kind==='hunt')return state.workers.hunter;
    return null;
  }

  function workerToolForKind(state,kind){
    return workerForKind(state,kind)?.worldTool||null;
  }

  function equipWorkerTool(state,workerKey,toolKey,design){
    const cfg=design.workerTools[toolKey];
    const worker=state.workers[workerKey];
    if(!cfg||!worker)return {ok:false,reason:'Herramienta o trabajador inválido'};
    if(worker.currentJob||worker.escortMissionId)return {ok:false,reason:'Esperá a que regrese el trabajador'};
    if(cfg.worker!==workerKey)return {ok:false,reason:'La herramienta no corresponde a ese trabajador'};

    let available=false,quality=null;
    if(toolKey==='huntingBow'){
      const goods=state.worldSystems.production.goods.huntingBow||[];
      if(goods.length){
        quality=goods.shift();
        available=true;
      }
    }else{
      const stock=state.worldSystems.production.stock;
      if((stock[toolKey]||0)>0){
        stock[toolKey]--;
        quality=(state.worldSystems.production.toolItems[toolKey]||[]).shift();
        available=true;
      }
    }
    if(!available)return {ok:false,reason:'No hay '+cfg.name+' disponible'};

    const equipped=makeWorkerTool(toolKey,design);if(quality){equipped.qualityLabel=quality.qualityLabel;equipped.qualityBonus=quality.qualityBonus||0;equipped.maxDurability=Math.max(1,equipped.maxDurability+equipped.qualityBonus*2);equipped.durability=equipped.maxDurability;}
    if(worker.worldTool)worker.previousTools=[...(worker.previousTools||[]),clone(toolKey==='huntingKnife'?worker.harvestTool:worker.worldTool)].filter(Boolean).slice(-12);
    if(toolKey==='huntingKnife')worker.harvestTool=equipped;
    else worker.worldTool=equipped;
    logEvent(state,'worker-tool',(worker.profession||workerKey)+' recibió '+cfg.name+'.');
    return {ok:true,tool:equipped};
  }

  function repairWorkerTools(state,design,workerKey=null){
    const keys=workerKey?[workerKey]:['mara','logger','hunter'];
    const repaired=[];
    for(const key of keys){
      const worker=state.workers[key];
      if(!worker||worker.currentJob||worker.escortMissionId)continue;
      for(const field of ['worldTool','harvestTool']){
        const tool=worker[field];
        if(!tool||tool.durability>=tool.maxDurability)continue;
        const price=2;
        if(availableTreasury(state)<price)continue;
        state.resources.coins-=price;
        tool.durability=tool.maxDurability;
        repaired.push(tool.name);
      }
    }
    if(repaired.length)logEvent(state,'repair','Se repararon herramientas de trabajo: '+repaired.join(', ')+'.');
    return {ok:repaired.length>0,repaired,reason:repaired.length?'':'No hay herramientas dañadas o faltan monedas'};
  }

  function prepareWorkerTool(state,workerKey,design){
    const worker=state.workers[workerKey];
    if(!worker||worker.worldTool.durability<=0)return {ok:false,reason:'Repará la herramienta antes de prepararla'};
    if(worker.currentJob||worker.escortMissionId)return {ok:false,reason:'Esperá a que el trabajador regrese'};
    if(worker.toolPrepared)return {ok:false,reason:'La herramienta ya está preparada para la próxima salida'};
    const price=design.services.sharpening.price;
    if(availableTreasury(state)<price)return {ok:false,reason:'Faltan monedas disponibles'};
    state.resources.coins-=price;
    worker.toolPrepared=true;
    logEvent(state,'service','Se preparó '+worker.worldTool.name+' para una salida de trabajo.');
    return {ok:true};
  }

  function workerDanger(state,kind,design){
    const species=kind==='mine'?'boar':'wolf';
    const band=threatBand(state.worldSystems.threat.presence[species],design);
    return design.threat.bands.findIndex(b=>b.id===band.id);
  }

  function startWorkerOuting(state,kind,design){
    const worker=workerForKind(state,kind);
    if(!worker||worker.worldTool.durability<=0)return {ok:false,reason:'Repará la herramienta antes de salir'};
    if(worker.restingAtInn)return {ok:false,reason:'El trabajador está descansando en el Mesón'};
    if((worker.stamina??100)<20)return {ok:false,reason:'El trabajador necesita recuperar Resistencia'};
    if(worker.currentJob||worker.escortMissionId)return {ok:false,reason:'El trabajador ya está ocupado'};
    if(worker.injuredUntil>state.worldSystems.clockMinutes)return {ok:false,reason:'El trabajador se está recuperando'};
    const job={id:nowId('worker'),kind,target:state.worldSystems.workerPlans[kind]?.target,startedAtMinute:state.worldSystems.clockMinutes,resolvesAtMinute:state.worldSystems.clockMinutes+TICK_MINUTES};
    worker.currentJob=job.id;
    worker.stamina=(worker.stamina??100)-20;
    state.worldSystems.map.workerJobs.push(job);
    logEvent(state,'worker-start',(worker.profession||'Mara')+' partió a trabajar.',{kind});
    return {ok:true,job};
  }

  function resolveWorkerJobs(state,design,rng){
    let completed=0;
    for(const job of [...state.worldSystems.map.workerJobs]){
      if(job.resolvesAtMinute>state.worldSystems.clockMinutes)continue;
      delete workerForKind(state,job.kind).currentJob;
      workerOuting(state,job.kind,design,rng,{target:job.target});
      state.worldSystems.map.workerJobs=state.worldSystems.map.workerJobs.filter(j=>j.id!==job.id);completed++;
    }
    return completed;
  }

  function workerOuting(state,kind,design,rng=Math.random,options={}){
    const worker=workerForKind(state,kind);
    const tool=workerToolForKind(state,kind);
    if(!worker||!tool)return {ok:false,reason:'Trabajador o herramienta no disponible'};
    if(worker.currentJob||worker.escortMissionId)return {ok:false,reason:'Trabajador ocupado'};
    if(worker.injuredUntil>state.worldSystems.clockMinutes)return {ok:false,reason:'Trabajador recuperándose'};
    if(tool.durability<=0)return {ok:false,reason:tool.name+' está agotado. Debe repararse antes de otra salida.'};

    const toolCfg=design.workerTools[tool.id]||{};
    const result={ok:true,kind,gained:{},escort:null,injured:false,tool:tool.name,toolWear:1};
    const danger=workerDanger(state,kind,design);

    if(options.forcedEscortId){
      const escort=state.adventurers.find(npc=>npc.id===options.forcedEscortId);
      result.escort=options.forcedEscortId;
      state.worldSystems.map.escorts++;
      logEvent(state,'escort',(escort?.fullName||'Un aventurero')+' escoltó la salida de trabajo.');
    }else if(danger>=2&&rng()<.30+danger*.08){
      result.injured=true;
      worker.injuredUntil=state.worldSystems.clockMinutes+TICK_MINUTES*2;
      state.worldSystems.map.workerInjuries++;
      logEvent(state,'worker-injury','La salida de trabajo sufrió un incidente por falta de escolta.');
    }

    const prepared=Boolean(worker.toolPrepared);
    const bonus=(Number(toolCfg.resourceBonus)||0)+(Number(tool.qualityBonus)||0)+(prepared?1:0);
    worker.toolPrepared=false;
    if(kind==='mine'){
      result.gained.iron=randInt(rng,5,7)+bonus;
      result.gained.stone=randInt(rng,3,4);
      if(toolCfg.hardVein&&(prepared||rng()<.15)){
        result.gained.iron+=randInt(rng,3,5);
        result.special='Veta dura';
      }
    }else if(kind==='wood'){
      result.gained.wood=randInt(rng,6,8)+bonus;
      result.gained.firewood=randInt(rng,3,4)+bonus;
      if(toolCfg.hardTrees&&rng()<.15){
        result.gained.wood+=randInt(rng,2,3);
        result.special='Árboles duros';
      }
      state.workers.logger.outings++;
    }else if(kind==='hunt'){
      result.gained.meat=randInt(rng,4,6)+bonus;
      result.gained.skin=randInt(rng,2,3);
      result.gained.tendon=randInt(rng,1,2);
      if(toolCfg.hardPrey&&rng()<.18){
        result.gained.meat+=1;
        result.gained.skin+=1;
        result.special='Presa difícil';
      }
      const knife=state.workers.hunter.harvestTool;
      if(knife&&knife.durability>0&&design.workerTools[knife.id]?.harvestBonus){
        result.gained.skin+=1;
        if(rng()<.55)result.gained.tendon+=1;
        knife.durability=Math.max(0,knife.durability-1);
      }
      state.workers.hunter.outings++;
    }else return {ok:false,reason:'Salida inexistente'};

    const priority=options.target||state.worldSystems.workerPlans[kind]?.target;
    const primary={mine:'iron',wood:'wood',hunt:'meat'}[kind];
    if(priority&&priority!==primary&&Number.isFinite(result.gained[priority])&&result.gained[primary]>1){result.gained[priority]++;result.gained[primary]--;}
    if(priority==='hardVein'&&toolCfg.hardVein){result.gained.iron+=2;result.special='Veta Dura';}
    if(result.injured){
      for(const key of Object.keys(result.gained))result.gained[key]=Math.max(0,Math.floor(result.gained[key]*.5));
    }

    tool.durability=Math.max(0,tool.durability-1);
    for(const [key,qty] of Object.entries(result.gained))state.resources[key]=(state.resources[key]||0)+qty;
    const skill=kind==='mine'?'miningXp':kind==='wood'?'woodcuttingXp':'huntingXp';
    worker[skill]=(worker[skill]||0)+40;
    state.worldSystems.map.workerOutings++;
    state.city.development=Number(((state.city.development||0)+1).toFixed(2));
    logEvent(state,'worker-outing','Salida de '+kind+' completada con '+tool.name+'.',result);
    return result;
  }

  function updateUnlocks(state,design){
    const level=Number(state.city?.level)||1;
    state.worldSystems.kingdom.sharedZonesUnlocked=level>=11;
    state.worldSystems.world.globalZonesUnlocked=level>=81;
    state.worldSystems.world.endgameUnlocked=level>=100;
  }

  function updateAlerts(state,design){
    const alerts=[];
    for(const species of ['wolf','boar']){
      const value=state.worldSystems.threat.presence[species];
      const band=threatBand(value,design);
      if(['high','critical','imminent'].includes(band.id)){
        alerts.push({
          type:'threat',
          severity:band.id,
          text:design.enemies[species].name+': '+value+'/100 · '+band.label
        });
      }
    }
    for(const npc of state.adventurers||[]){
      if(npc.autonomy?.intent==='needs-rest')alerts.push({type:'meson',severity:'warning',text:npc.fullName+' necesita descansar y no puede pagarlo.'});
    }
    if((state.city.level||1)>=2&&!state.worldSystems.textile.built){
      alerts.push({type:'building',severity:'info',text:'Textilería disponible para construir.'});
    }
    if(state.worldSystems.townHall.treasuryReserved>0){
      alerts.push({type:'treasury',severity:'info',text:'Tesorería reservada: '+state.worldSystems.townHall.treasuryReserved+' monedas.'});
    }
    state.worldSystems.townHall.alerts=alerts;
  }

  function syncCityProgress(state,deps,rng){
    if(!deps.CITY)return;
    const previousLevel=Number(state.city.level)||1;
    state.city=deps.CITY.normalizeCityProgress(state.city);
    for(let level=previousLevel+1;level<=state.city.level;level++){
      state.city.levelReachedAt[level]=state.city.levelReachedAt[level]||Date.now();
      logEvent(state,'city-level','La ciudad alcanzó Nv. '+level+'.');
    }
    if(deps.onCityProgress)deps.onCityProgress(state,rng);
  }

  function stepWorld(state,deps,data,design,rng=Math.random,minutes=TICK_MINUTES){
    normalizeState(state,data,design);
    state.worldSystems.clockMinutes+=minutes;
    for(const [key,worker] of Object.entries(state.workers)){
      const busy=worker.currentJob||worker.escortMissionId||state.worldSystems.production.queue.some(j=>(key==='borin'&&j.shop==='smithy')||(key==='eldon'&&j.shop==='carpenter'));
      if(busy)continue;
      worker.stamina=Math.min(100,(worker.stamina??100)+(worker.restingAtInn?15:3));
      if(worker.stamina>=100)worker.restingAtInn=false;
    }
    state.worldSystems.day=1+Math.floor(state.worldSystems.clockMinutes/(24*60));
    resolveWorkerJobs(state,design,rng);
    processProductionQueue(state,design,rng);
    syncCityProgress(state,deps,rng);
    resolveDueActivities(state,deps,data,design,rng);
    syncCityProgress(state,deps,rng);
    renewMissions(state,design);
    kitchenStep(state,design);
    workerPlanStep(state,design);
    autonomyStep(state,deps,data,design,rng);
    threatStep(state,deps,data,design,rng);
    updateUnlocks(state,design);
    updateAlerts(state,design);
    return state;
  }

  function advanceWorld(state,minutes,deps,data,design,rng=Math.random){
    normalizeState(state,data,design);
    const safe=Math.max(TICK_MINUTES,Math.floor(Number(minutes)||TICK_MINUTES));
    const steps=Math.max(1,Math.ceil(safe/TICK_MINUTES));
    for(let i=0;i<steps;i++)stepWorld(state,deps,data,design,rng);
    state.worldSystems.lastAdvanceAt=Date.now();
    return {
      state,
      steps,
      minutes:steps*TICK_MINUTES,
      events:state.worldSystems.chronology.events.slice(0,12)
    };
  }

  function pulseActiveWorld(state,now,active,deps,data,design,rng=Math.random){
    let ws=state.worldSystems;
    if(!ws.continuousClock){
      ws.clockMinutes+=(ws.activeMilliseconds||0)/3000;
      ws.continuousClock=true;
    }
    const last=ws.lastPulseAt;
    ws.lastPulseAt=now;
    if(!active||!state.city.founded||!Number.isFinite(last))return {advanced:false};
    const elapsed=now-last;
    // La suspensión no convierte la ausencia en ataques ni trabajo offline.
    if(elapsed<=0||elapsed>5000)return {advanced:false};
    ws.clockMinutes=(Math.round(ws.clockMinutes*3000)+elapsed)/3000;
    ws.activeMilliseconds=(ws.activeMilliseconds||0)+elapsed;
    ws.day=1+Math.floor(ws.clockMinutes/(24*60));
    const jobsBefore=ws.map.workerJobs.length;
    const activitiesBefore=state.adventurers.filter(n=>n.autonomy?.currentActivity).length;
    const returnedWorkers=resolveWorkerJobs(state,design,rng);
    const finished=processProductionQueue(state,design,rng);
    kitchenStep(state,design);
    workerPlanStep(state,design);
    resolveDueActivities(state,deps,data,design,rng);
    let decisionTick=false;
    while(ws.activeMilliseconds>=30000){
      ws.activeMilliseconds-=30000;
      stepWorld(state,deps,data,design,rng,0);
      ws=state.worldSystems;
      decisionTick=true;
    }
    const changed=finished||returnedWorkers||jobsBefore!==ws.map.workerJobs.length||activitiesBefore!==state.adventurers.filter(n=>n.autonomy?.currentActivity).length;
    if(changed){syncCityProgress(state,deps,rng);updateUnlocks(state,design);updateAlerts(state,design);}
    ws.clockCheckpointMs=(ws.clockCheckpointMs||0)+elapsed;
    const checkpoint=ws.clockCheckpointMs>=5000;
    if(checkpoint)ws.clockCheckpointMs%=5000;
    return {advanced:!!(changed||decisionTick||checkpoint)};
  }

  function activityProgress(state,activity){
    const end=Number(activity.readyAtMinute??activity.resolvesAtMinute);
    const start=Number(activity.startedAtMinute??end-TICK_MINUTES);
    const current=state.worldSystems.clockMinutes;
    const percent=Math.max(0,Math.min(100,(current-start)/Math.max(.001,end-start)*100));
    return {percent,waiting:current<start,remainingSeconds:Math.max(0,Math.ceil((end-current)*3))};
  }



  function migrateQuality(p,design){
    if(!p||p.founder||p.qualityStatsVersion||!design.equipment[p.catalogId]||p.catalogId==='legacySword')return;
    const item=design.equipment[p.catalogId],tier=qualityTier(p.qualityLabel);p.qualityBonus=tier;p.qualityStatsVersion=1;
    for(const key of ['attack','defense','initiative'])if((item[key]||0)>0)p[key]=(p[key]||0)+tier;
    if((item.mana||0)>0)p.mana=(p.mana||0)+tier*4;
    p.maxDurability=Math.max(1,(p.maxDurability||item.durability)+tier*2);p.durability=p.durability===0?0:Math.max(0,Math.min(p.maxDurability,(p.durability||0)+tier*2));
  }
  function withdrawMission(state,id){
    const m=state.worldSystems.guild.missions.find(m=>m.id===id);if(!m)return {ok:false,reason:'Misión inexistente'};
    m.active=false;m.repeat=false;if(m.status!=='accepted')m.status='archived';
    logEvent(state,'guild','La ciudad retiró '+id+(m.status==='accepted'?'; la salida ya aceptada se completará.':'.'));
    return {ok:true};
  }

  function qualityTier(label){return {Baja:-1,Normal:0,Buena:1,Excelente:2}[label]||0;}
  function recipeReservation(recipe,origin,design){
    const resources={...(recipe.materials||{})},components={...(recipe.components||{})};
    const o=design.materialOrigins[origin]||design.materialOrigins.neutral;
    if(recipe.rawOrigin)resources[o.raw]=(resources[o.raw]||0)+1;
    if(recipe.tannedHide)resources[o.tanned]=(resources[o.tanned]||0)+recipe.tannedHide;
    return {resources,components};
  }
  function cancelProduction(state,id,design){
    const job=state.worldSystems.production.queue.find(j=>j.id===id);
    if(!job)return {ok:false,reason:'Ese trabajo ya terminó o fue cancelado'};
    const refund=state.worldSystems.clockMinutes<=job.startedAtMinute?1:0;
    if(job.shop==='meson')state.worldSystems.meson.kitchen.enabled=false;
    const reserved=job.reservation||recipeReservation(design.recipes[job.recipeKey],job.origin||'neutral',design);
    if(refund){for(const [k,q] of Object.entries(reserved.resources))state.resources[k]=(state.resources[k]||0)+q;for(const [k,q] of Object.entries(reserved.components))state.worldSystems.production.stock[k]=(state.worldSystems.production.stock[k]||0)+q;}
    state.worldSystems.production.queue=state.worldSystems.production.queue.filter(j=>j.id!==id);
    let cursor=state.worldSystems.clockMinutes;
    for(const next of state.worldSystems.production.queue.filter(j=>j.shop===job.shop)){if(next.startedAtMinute>cursor){const duration=next.readyAtMinute-next.startedAtMinute;next.startedAtMinute=cursor;next.readyAtMinute=cursor+duration;}cursor=next.readyAtMinute;}
    logEvent(state,'cancel','Se canceló '+design.recipes[job.recipeKey].name+(refund?'; materiales devueltos.':'; los materiales ya usados no se recuperan.'));
    return {ok:true,refunded:!!refund};
  }
  function cancelWorkerOuting(state,kind){
    const worker=workerForKind(state,kind),job=state.worldSystems.map.workerJobs.find(j=>j.kind===kind);
    if(!worker||!job)return {ok:false,reason:'No hay una salida de trabajo que cancelar'};
    state.worldSystems.map.workerJobs=state.worldSystems.map.workerJobs.filter(j=>j.id!==job.id);delete worker.currentJob;
    if(state.worldSystems.workerPlans[kind])state.worldSystems.workerPlans[kind].enabled=false;
    logEvent(state,'cancel',(worker.name||worker.profession||'Mara')+' regresó sin recolectar; se pausó su plan.');return {ok:true};
  }
  function upgradeQuote(state,key,design){
    const building=state.buildings[key];const next=(building?.level||0)+1;
    if(!building||building.level<1)return {ok:false,reason:'Primero construí el edificio'};
    if(next>3)return {ok:false,reason:'Máximo Nv.3 para esta partida'};
    if(next>(state.city.level||1))return {ok:false,reason:'Requiere Ciudad Nv.'+next};
    const cost={coins:next===2?30:60,wood:next===2?6:10,stone:next===2?4:8};
    const benefit=key==='guildHall'?(2+(next-1))+' misiones simultáneas':key==='meson'?(5+(next-1)*2)+' plazas de alojamiento':key==='townHall'?'Ayuntamiento Nv.'+next+' · obras registradas':(5+next-1)+' trabajos en cola';
    const missing=Object.entries(cost).filter(([k,q])=>(k==='coins'?availableTreasury(state):(state.resources[k]||0))<q).map(([k,q])=>design.resources[k].name+' '+(k==='coins'?availableTreasury(state):(state.resources[k]||0))+'/'+q);
    const affordable=!missing.length;
    return {ok:affordable,next,cost,benefit,reason:affordable?'':'Falta: '+missing.join(' · ')};
  }
  function upgradeBuilding(state,key,design){
    const quote=upgradeQuote(state,key,design);if(!quote.ok)return quote;
    for(const [k,q] of Object.entries(quote.cost))state.resources[k]-=q;
    const b=state.buildings[key];b.level=quote.next;
    if(key==='guildHall')b.missionSlots=2+(b.level-1);
    if(key==='meson'){b.capacity=5+(b.level-1)*2;state.worldSystems.meson.level=b.level;}
    if(key==='textile')state.worldSystems.textile.level=b.level;
    state.city.development=Number(((state.city.development||0)+.8).toFixed(2));
    logEvent(state,'building',design.buildings[key].name+' mejoró a Nv.'+b.level+'. '+quote.benefit+'.');return {ok:true};
  }
  function setKitchen(state,enabled){state.worldSystems.meson.kitchen.enabled=!!enabled;return {ok:true};}
  function kitchenStep(state,design){
    const kitchen=state.worldSystems.meson.kitchen;if(!kitchen?.enabled||!state.adventurers.length&&!Object.values(state.worldSystems.workerPlans||{}).some(p=>p.enabled))return;
    for(const key of ['simpleMeal','travelRation']){
      const planned=(state.worldSystems.production.stock[key]||0)+state.worldSystems.production.queue.filter(j=>j.recipeKey===key).length;
      if(planned<(kitchen.targets[key]||2))enqueueRecipe(state,key,design);
    }
  }
  function setWorkerPlan(state,kind,config){
    if(!workerForKind(state,kind))return {ok:false,reason:'Trabajador inexistente'};
    const allowed={mine:['iron','stone','hardVein'],wood:['wood','firewood'],hunt:['meat','skin','tendon']}[kind];
    const old=state.worldSystems.workerPlans[kind]||{};
    if(config.target&&!allowed.includes(config.target))return {ok:false,reason:'Objetivo no disponible'};
    state.worldSystems.workerPlans[kind]={enabled:false,target:allowed[0],autoRepair:true,meal:true,sharpen:false,...old,...config};
    return {ok:true};
  }
  function workerPlanStep(state,design){
    for(const [kind,plan] of Object.entries(state.worldSystems.workerPlans||{})){
      if(!plan.enabled)continue;const w=workerForKind(state,kind);if(!w||w.currentJob||w.escortMissionId)continue;
      const stop=reason=>{plan.reason=reason;};
      if(w.injuredUntil>state.worldSystems.clockMinutes){stop('Recuperándose de una herida');continue;}
      if(workerDanger(state,kind,design)>=2){stop('Ruta peligrosa: necesita escolta');continue;}
      if(plan.target==='hardVein'&&!design.workerTools[w.worldTool.id]?.hardVein){stop('La Veta Dura requiere Pico de hierro');continue;}
      if(w.worldTool.durability<=0){if(plan.autoRepair&&availableTreasury(state)>=57)repairWorkerTools(state,design,kind==='mine'?'mara':kind==='wood'?'logger':'hunter');if(w.worldTool.durability<=0){stop('Herramienta rota: falta reparación');continue;}}
      if(w.restingAtInn&&w.stamina<80){stop('Descansando en el Mesón');continue;}
      if(w.stamina<20){w.restingAtInn=true;if(plan.meal&&(state.worldSystems.production.stock.simpleMeal||0)>0){state.worldSystems.production.stock.simpleMeal--;w.stamina=Math.min(100,w.stamina+20);state.worldSystems.meson.workerMeals=(state.worldSystems.meson.workerMeals||0)+1;logEvent(state,'worker-meal',(w.name||w.profession||'Mara')+' recibió un plato de trabajo financiado por la ciudad.');}stop('Descansando en el Mesón');continue;}
      w.restingAtInn=false;
      if(plan.sharpen&&!w.toolPrepared&&availableTreasury(state)>=57)prepareWorkerTool(state,kind==='mine'?'mara':kind==='wood'?'logger':'hunter',design);
      const result=startWorkerOuting(state,kind,design);stop(result.ok?'Trabajando · prioridad '+plan.target:result.reason);
    }
  }
  function prepareComponents(state,recipeKey,design){
    const r=design.recipes[recipeKey];if(!r)return {ok:false,reason:'Receta inexistente'};
    const temp=clone(state);let count=0;
    for(const [k,q] of Object.entries(r.components||{})){
      const queued=temp.worldSystems.production.queue.filter(j=>j.recipeKey===k).length;
      const missing=Math.max(0,q-(temp.worldSystems.production.stock[k]||0)-queued);
      for(let i=0;i<missing;i++){const result=enqueueRecipe(temp,k,design);if(!result.ok)return result;count++;}
    }
    if(!count)return {ok:false,reason:'Los componentes ya están disponibles o en preparación'};
    state.resources=temp.resources;state.workers=temp.workers;state.worldSystems.production=temp.worldSystems.production;state.worldSystems.chronology=temp.worldSystems.chronology;
    return {ok:true,reason:'Componentes en cola. Fabricá el objeto cuando terminen.'};
  }
  function missionNeeded(state,m,design){
    if(m.type==='delivery')return stockTarget(state,m.resourceKey,design)-(state.resources[m.resourceKey]||0)>=m.qty;
    if(m.type==='escort')return workerDanger(state,m.workerKind,design)>=2;
    return (state.worldSystems.threat.presence[m.enemyKey]||0)>=design.enemies[m.enemyKey].presenceDrop*m.count;
  }
  function renewMissions(state,design){
    for(const m of state.worldSystems.guild.missions){
      if(!m.repeat||!m.active||!['completed','failed'].includes(m.status))continue;
      if(state.worldSystems.clockMinutes<((m.completedAtMinute??m.acceptedAtMinute)||0)+TICK_MINUTES)continue;
      if(!missionNeeded(state,m,design))continue;
      m.cycles=(m.cycles||0)+1;m.status='open';m.acceptedBy=null;m.acceptedAtMinute=null;
    }
  }

  function townHallSnapshot(state,design){
    const ws=state.worldSystems;
    return {
      coins:state.resources.coins||0,
      reserved:ws.townHall.treasuryReserved||0,
      available:availableTreasury(state),
      cityLevel:state.city.level||1,
      development:state.city.development||0,
      buildings:Object.entries(state.buildings||{}).map(([id,b])=>({id,level:b.level||0,built:b.built!==false})),
      alerts:clone(ws.townHall.alerts),
      season:clone(ws.season)
    };
  }

  function mapSnapshot(state,design){
    return {
      zones:clone(design.map.zones),
      presence:{
        wolf:{
          value:state.worldSystems.threat.presence.wolf,
          band:threatBand(state.worldSystems.threat.presence.wolf,design)
        },
        boar:{
          value:state.worldSystems.threat.presence.boar,
          band:threatBand(state.worldSystems.threat.presence.boar,design)
        }
      },
      activeAdventurers:state.adventurers
        .filter(npc=>npc.autonomy?.currentActivity&&npc.autonomy.currentActivity.kind!=='recovery')
        .map(npc=>({id:npc.id,name:npc.fullName,activity:clone(npc.autonomy.currentActivity)}))
    };
  }

  function formatWorldTime(minutes,showSeconds=false){
    const total=Math.max(0,Math.floor(Number(minutes)||0));
    const day=1+Math.floor(total/(24*60));
    const local=total%(24*60);
    const h=Math.floor(local/60);
    const m=local%60;
    return 'Día '+day+' · '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+(showSeconds?':'+String(Math.floor((Number(minutes)||0)*60)%60).padStart(2,'0'):'');
  }

  return {
    WORLD_LOOP_SCHEMA_VERSION,
    TICK_MINUTES,
    normalizeState,
    advanceWorld,
    stepWorld,
    pulseActiveWorld,
    recipeReservation,
    cancelProduction,
    cancelWorkerOuting,
    upgradeQuote,
    upgradeBuilding,
    withdrawMission,
    setWorkerPlan,
    setKitchen,
    prepareComponents,
    qualityTier,
    activityProgress,
    workerOuting,
    startWorkerOuting,
    workerDanger,
    prepareWorkerTool,
    setProductSale,
    recycleProduct,
    setProductionPolicy,
    equipWorkerTool,
    repairWorkerTools,
    publishHuntMission,
    publishDeliveryMission,
    publishEscortMission,
    toggleMission,
    craftRecipe,
    enqueueRecipe,
    enqueueBatch,
    buildTextile,
    tanHide,
    threatBand,
    returnThresholds,
    recoveryNeed,
    availableTreasury,
    townHallSnapshot,
    mapSnapshot,
    formatWorldTime,
    computeCombatMods
  };
});
