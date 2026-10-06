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
        nails:0,arrowheads:0,pickaxeHead:0,axeHead:0,ironPickaxe:0,workAxe:0,
        huntingKnife:0,scissors:0,toolHandle:0,arrowBundle:0
      },
      goods:{
        dagger:[],huntingBow:[],simpleStaff:[],woodenShield:[],
        leatherProtection:[],leatherGloves:[],leatherBoots:[]
      },
      queue:[],
      qualityLog:[]
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
    for(const key of Object.keys(ws.production.goods)){
      ws.production.goods[key]=Array.isArray(ws.production.goods[key])?ws.production.goods[key]:[];
    }
    ws.textile={...emptyTextile(),...(ws.textile||{})};
    ws.textile.tannedProduced={...emptyTextile().tannedProduced,...(ws.textile?.tannedProduced||{})};
    ws.textile.goodsProduced={...emptyTextile().goodsProduced,...(ws.textile?.goodsProduced||{})};
    ws.meson={...emptyWorldSystems().meson,...(ws.meson||{})};
    ws.market={...emptyWorldSystems().market,...(ws.market||{})};
    ws.market.lootOffers=Array.isArray(ws.market.lootOffers)?ws.market.lootOffers:[];
    ws.map={...emptyWorldSystems().map,...(ws.map||{})};
    ws.townHall={...emptyWorldSystems().townHall,...(ws.townHall||{})};
    ws.townHall.alerts=Array.isArray(ws.townHall.alerts)?ws.townHall.alerts:[];
    ws.chronology={...emptyWorldSystems().chronology,...(ws.chronology||{})};
    ws.chronology.events=Array.isArray(ws.chronology.events)?ws.chronology.events.slice(0,MAX_LOG):[];
    ws.chronology.records=ws.chronology.records&&typeof ws.chronology.records==='object'?ws.chronology.records:{};
    ws.season={...emptyWorldSystems().season,...(ws.season||{})};
    ws.schools={...emptyWorldSystems().schools,...(ws.schools||{})};
    ws.transport={...emptyWorldSystems().transport,...(ws.transport||{})};
    ws.kingdom={...emptyWorldSystems().kingdom,...(ws.kingdom||{})};
    ws.world={...emptyWorldSystems().world,...(ws.world||{})};

    next.buildings={
      ...(next.buildings||{}),
      townHall:{level:1,...(next.buildings?.townHall||{})},
      guildHall:{level:1,missionSlots:design.buildings.guildHall.missionSlots,...(next.buildings?.guildHall||{})},
      textile:{level:ws.textile.built?Math.max(1,ws.textile.level):0,built:ws.textile.built,...(next.buildings?.textile||{})}
    };

    next.workers={
      ...(next.workers||{}),
      logger:{profession:'Leñador',level:1,outings:0,status:'Disponible',...(next.workers?.logger||{})},
      hunter:{profession:'Cazador',level:1,outings:0,status:'Disponible',...(next.workers?.hunter||{})}
    };

    next.accountLedger={
      seasonId:ws.season.id,
      founderPackClaimed:Boolean(next.city?.founded),
      cityLineageId:next.accountLedger?.cityLineageId||next.city?.id||null,
      ...(next.accountLedger||{})
    };

    next.adventurers=Array.isArray(next.adventurers)?next.adventurers.map(ensureAdventurer):[];
    updateUnlocks(next,design);
    updateAlerts(next,design);
    return next;
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
    return (state.resources.meat||0)>=cfg.meat&&(state.resources.firewood||0)>=cfg.firewood;
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
    state.resources.meat-=cfg.meat;
    state.resources.firewood-=cfg.firewood;
    spendNpc(npc,'consumable',cfg.price);
    state.resources.coins+=cfg.price;
    state.worldSystems.meson.revenue+=cfg.price;
    state.worldSystems.meson.platesSold++;
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
    state.resources.meat-=cfg.meat;
    state.resources.firewood-=cfg.firewood;
    spendNpc(npc,'consumable',cfg.price);
    state.resources.coins+=cfg.price;
    state.worldSystems.meson.revenue+=cfg.price;
    state.worldSystems.meson.rationsSold++;
    npc.history.rations++;
    npc.rationPrepared=true;
    logEvent(state,'meson',npc.fullName+' compró una Ración de viaje.');
    return true;
  }

  function restAtMeson(state,npc,design){
    const cfg=design.services.rest;
    if(npc.coins<cfg.price)return false;
    spendNpc(npc,'rest',cfg.price);
    state.resources.coins+=cfg.price;
    state.worldSystems.meson.revenue+=cfg.price;
    state.worldSystems.meson.restsSold++;
    npc.history.rests++;
    const wasDown=npc.hpCurrent<=0||npc.status==='Incapacitado';
    npc.hpCurrent=Math.min(npc.hpMax,Math.max(npc.hpCurrent,Math.ceil(npc.hpMax*cfg.restoreHp)));
    npc.manaCurrent=Math.min(npc.manaMax,Math.max(npc.manaCurrent,Math.ceil(npc.manaMax*cfg.restoreMana)));
    npc.status='Disponible';
    npc.autonomy.intent='rested';
    npc.autonomy.lastReturnReason=wasDown?'incapacitación':'recuperación';
    logEvent(state,'meson',npc.fullName+' descansó en el Mesón y volvió a estar disponible.');
    return true;
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
    const cfg=design.materialOrigins[origin];
    if(!cfg||!state.worldSystems.textile.built)return {ok:false,reason:'Textilería no disponible'};
    if((state.resources[cfg.raw]||0)<1)return {ok:false,reason:'No hay piel de ese origen'};
    state.resources[cfg.raw]-=1;
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
      durability:item.durability,
      maxDurability:item.durability,
      attack:item.attack||0,
      defense:(item.defense||0)+(item.textile?(originCfg.defense||0):0),
      initiative:(item.initiative||0)+(item.textile?(originCfg.initiative||0):0),
      mana:item.mana||0,
      damageReduction:item.textile?(originCfg.damageReduction||0):0,
      origin,
      quality:quality.score,
      qualityLabel:quality.label,
      referencePrice:price,
      salePrice:price,
      listed:true
    };
  }

  function consumeRecipeMaterials(state,recipe,origin,design){
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

    if(recipe.materials)for(const [key,qty] of Object.entries(recipe.materials))state.resources[key]-=qty;
    if(recipe.components)for(const [key,qty] of Object.entries(recipe.components))state.worldSystems.production.stock[key]-=qty;
    if(recipe.tannedHide)state.resources[design.materialOrigins[origin].tanned]-=recipe.tannedHide;
    return true;
  }

  function craftRecipe(state,recipeKey,design,rng=Math.random,origin='neutral'){
    const recipe=design.recipes[recipeKey];
    if(!recipe)return {ok:false,reason:'Receta inexistente'};
    if(recipe.shop==='textile'&&!state.worldSystems.textile.built)return {ok:false,reason:'Textilería no construida'};
    if(recipe.id==='tannedHide')return tanHide(state,origin,design);
    if(!consumeRecipeMaterials(state,recipe,origin,design))return {ok:false,reason:'Faltan materiales o componentes'};

    const quality=productQuality(rng);
    if(design.equipment[recipeKey]){
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

  function publishHuntMission(state,{enemyKey='wolf',count=1,reward=null}={},design){
    const slots=(state.buildings.guildHall?.missionSlots||design.mission.startingConcurrent);
    const open=state.worldSystems.guild.missions.filter(m=>m.status==='open'||m.status==='accepted');
    if(open.length>=slots)return {ok:false,reason:'No hay espacio de misiones disponible'};

    const reference=missionReference(enemyKey,count,design);
    const chosen=reward==null?reference:Math.round(Number(reward)||reference);
    const min=Math.ceil(reference*design.mission.manualValueRange[0]);
    const max=Math.floor(reference*design.mission.manualValueRange[1]);
    if(chosen<min||chosen>max)return {ok:false,reason:'La recompensa debe estar entre '+min+' y '+max+' monedas'};

    const mission={
      id:'mission-'+state.worldSystems.guild.nextMissionSeq++,
      type:'hunt',
      enemyKey,
      count:Math.max(1,Math.floor(Number(count)||1)),
      reward:chosen,
      reference,
      status:'open',
      active:true,
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
    if(!mission||mission.status!=='open')return {ok:false};
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

  function productForNeed(state,npc,design){
    const goods=state.worldSystems.production.goods;
    const candidates=[];
    for(const [key,list] of Object.entries(goods)){
      for(const product of list){
        if(!product.listed||!compatibleProduct(npc,product,design))continue;
        const item=design.equipment[key];
        if(!item)continue;
        candidates.push({product,item,list,key});
      }
    }
    candidates.sort((a,b)=>{
      const aScore=(a.product.attack||0)*2+(a.product.defense||0)*2+(a.product.initiative||0)+(a.product.mana||0)*.15+(a.product.damageReduction||0)*30;
      const bScore=(b.product.attack||0)*2+(b.product.defense||0)*2+(b.product.initiative||0)+(b.product.mana||0)*.15+(b.product.damageReduction||0)*30;
      return bScore-aScore;
    });
    return candidates.find(c=>npc.coins>=c.product.salePrice)||null;
  }

  function equipPurchased(npc,product){
    const slot=product.slot;
    const key=slot==='weapon'?'weapon':slot;
    npc.equipment[key]=clone(product);
    if(slot==='weapon')npc.weaponDamage=Math.max(1,(npc.weaponDamage||0)+(product.attack||0));
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
    logEvent(state,'market',npc.fullName+' compró '+found.product.name+' por '+price+' monedas.');
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
      winBonus+=(Number(eq.attack)||0)*.004+(Number(eq.initiative)||0)*.003;
      lossMultiplier*=clamp(1-(Number(eq.defense)||0)*.018,.82,1);
      if(Number(eq.mana)>0)manaMultiplier*=.95;
    }

    if(npc.preparation?.sharpening)winBonus+=.015;
    return {
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
    for(const [key,qtyRaw] of Object.entries(npc.loot||{})){
      const qty=Math.floor(Number(qtyRaw)||0);
      if(qty<=0||!design.resources[key])continue;

      const target=stockTarget(state,key,design);
      const have=Number(state.resources[key])||0;
      const need=Math.max(0,target-have);
      if(need<=0)continue;

      const price=design.resources[key].price||1;
      const spendable=Math.max(0,availableTreasury(state)-design.market.cityLootMinTreasury);
      const affordable=Math.floor(spendable/price);
      const accepted=Math.min(qty,need,affordable);
      if(accepted<=0)continue;

      const value=accepted*price;
      state.resources.coins-=value;
      state.resources[key]=(state.resources[key]||0)+accepted;
      npc.coins=(Number(npc.coins)||0)+value;
      npc.loot[key]-=accepted;
      npc.history.lootSold+=accepted;
      state.worldSystems.market.acceptedUnits+=accepted;
      state.worldSystems.market.valuePaid+=value;
      sold+=accepted;
      logEvent(state,'loot',npc.fullName+' vendió '+accepted+'× '+design.resources[key].name+' a la ciudad.');
    }
    return sold;
  }

  function completeMission(state,mission,npc,won){
    if(!mission)return;
    if(won){
      releaseMissionReservation(state,mission,true,npc);
      mission.status='completed';
      mission.completedAtMinute=state.worldSystems.clockMinutes;
      state.worldSystems.guild.completed++;
      npc.history.missions++;
      state.city.development=Number(((state.city.development||0)+(mission.enemyKey==='greatBoar'?1.8:mission.enemyKey==='alphaWolf'?1:.22)).toFixed(2));
      logEvent(state,'guild',npc.fullName+' completó la misión '+mission.id+' y cobró '+mission.reward+' monedas.');
    }else{
      releaseMissionReservation(state,mission,false,npc);
      mission.status='failed';
      state.worldSystems.guild.failed++;
      logEvent(state,'guild',npc.fullName+' no pudo completar la misión '+mission.id+'. La recompensa volvió a quedar disponible.');
    }
  }

  function resolveCommonActivity(state,npc,activity,deps,data,design,rng){
    const enemyKey=activity.enemyKey;
    const maxCount=enemyKey==='wolf'?3:2;
    const count=Math.min(activity.count,maxCount);
    npc.combatMods=computeCombatMods(npc,design);
    const prep=usePreparationBeforeCombat(npc,design);

    const beforeHp=npc.hpCurrent;
    const beforeMana=npc.manaCurrent;
    let result=deps.COMBAT.resolveEncounter(npc,enemyKey,count,data,rng);
    result.adventurer.hpCurrent=Math.max(
      0,
      Math.round(beforeHp-(beforeHp-result.adventurer.hpCurrent)*prep.hpFactor)
    );
    result.adventurer.manaCurrent=Math.max(
      0,
      Math.round(beforeMana-(beforeMana-result.adventurer.manaCurrent)*prep.manaFactor)
    );
    if(!result.won)result.adventurer.hpCurrent=0;

    const gained=result.won?rollDrops(result.adventurer,enemyKey,count,design,rng):{};
    wearEquipment(result.adventurer,rng,1);
    if(result.adventurer.preparation)result.adventurer.preparation.sharpening=false;

    Object.assign(npc,result.adventurer);
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
    const prepared=group.reduce((sum,npc)=>sum+groupPower(npc),0);
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

    group.forEach(npc=>buyRation(state,npc,design));
    const won=rng()<winChance;

    for(const npc of group){
      const prep=usePreparationBeforeCombat(npc,design);
      const localLoss=clamp(hpLoss*(.75+rng()*.50)*prep.hpFactor,0,.98);
      const localMana=clamp(manaUse*(.80+rng()*.35)*prep.manaFactor,0,1);
      npc.hpCurrent=Math.max(0,npc.hpCurrent-Math.ceil(npc.hpMax*localLoss));
      npc.manaCurrent=Math.max(0,npc.manaCurrent-Math.ceil(npc.manaMax*localMana));
      wearEquipment(npc,rng,kind==='boss'?2:1);
      npc.history.activities++;
      if(!won&&rng()<.55){
        npc.hpCurrent=0;
        npc.status='Incapacitado';
        npc.history.defeats++;
        npc.history.incapacitations++;
      }
    }

    if(won){
      const living=group.filter(npc=>npc.hpCurrent>0);
      const share=Math.max(1,Math.round(xp/Math.max(1,living.length)));
      for(const npc of living){
        npc.xp=(npc.xp||0)+share;
        npc.history.victories++;
      }
      const carrier=choice(rng,living.length?living:group);
      rollDrops(carrier,enemyKey,1,design,rng);
      if(kind==='rare'){
        state.worldSystems.threat.alphaDefeated++;
        state.worldSystems.threat.presence.wolf=Math.max(0,state.worldSystems.threat.presence.wolf-design.enemies.alphaWolf.presenceDrop);
      }else{
        state.worldSystems.threat.bossDefeated++;
        state.worldSystems.threat.presence.boar=Math.max(0,state.worldSystems.threat.presence.boar-design.enemies.greatBoar.presenceDrop);
      }
      logEvent(state,'special-win','Un grupo derrotó a '+design.enemies[enemyKey].name+'.',{members:group.map(n=>n.id)});
    }else{
      logEvent(state,'special-loss','El grupo no pudo derrotar a '+design.enemies[enemyKey].name+'.',{members:group.map(n=>n.id)});
    }
    return won;
  }

  function startNpcActivity(state,npc,{enemyKey,count,missionId=null}){
    npc.autonomy.currentActivity={
      kind:missionId?'mission':'spontaneous',
      enemyKey,
      count,
      missionId,
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
      if(mission.enemyKey!=='wolf'&&mission.enemyKey!=='boar')continue;
      const score=acceptanceScore(npc,mission,deps,data,design);
      if(score<.56+rng()*.18)continue;
      if(!reserveMission(state,mission,npc))continue;
      if((mission.count>=2||mission.enemyKey!=='wolf')&&rng()<.65)buyRation(state,npc,design);
      startNpcActivity(state,npc,{enemyKey:mission.enemyKey,count:mission.count,missionId:mission.id});
      logEvent(state,'mission-accept',npc.fullName+' aceptó '+mission.id+'.');
      return true;
    }
    return false;
  }

  function spontaneousDecision(state,npc,design,rng){
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

    if(count>=2&&rng()<.55)buyRation(state,npc,design);
    startNpcActivity(state,npc,{enemyKey,count});
    logEvent(state,'outing',npc.fullName+' salió por iniciativa propia contra '+count+'× '+design.enemies[enemyKey].name+'.');
    return true;
  }

  function serviceAndMarketDecision(state,npc,design,rng){
    sellLootStep(state,npc,design);
    repairStep(state,npc,rng);
    const need=recoveryNeed(npc,design);
    if(need.needsRest){
      if(restAtMeson(state,npc,design))return true;
      npc.autonomy.intent='needs-rest';
      return true;
    }
    if(need.moderate&&rng()<.35){
      if(serveMeal(state,npc,design))return true;
    }
    if(buyGearStep(state,npc,design,rng))return true;
    return false;
  }

  function resolveDueActivities(state,deps,data,design,rng){
    for(const npc of state.adventurers){
      const activity=npc.autonomy?.currentActivity;
      if(!activity||activity.resolvesAtMinute>state.worldSystems.clockMinutes)continue;
      if(activity.enemyKey==='wolf'||activity.enemyKey==='boar'){
        resolveCommonActivity(state,npc,activity,deps,data,design,rng);
      }
    }
  }

  function autonomyStep(state,deps,data,design,rng){
    for(const npc of state.adventurers){
      ensureAdventurer(npc);
      if(npc.autonomy.currentActivity)continue;
      npc.status=npc.hpCurrent<=0?'Incapacitado':'Disponible';
      if(serviceAndMarketDecision(state,npc,design,rng))continue;
      if(npc.hpCurrent<=0)continue;
      if(tryMissionDecision(state,npc,deps,data,design,rng))continue;
      spontaneousDecision(state,npc,design,rng);
      npc.autonomy.lastDecisionAt=state.worldSystems.clockMinutes;
    }
  }

  function maybeSpecialEncounters(state,deps,data,design,rng){
    const cityLevel=Number(state.city.level)||1;
    const healthy=state.adventurers
      .filter(npc=>npc.hpCurrent>npc.hpMax*.60&&!npc.autonomy.currentActivity)
      .sort((a,b)=>groupPower(b)-groupPower(a));

    const wolfBand=threatBand(state.worldSystems.threat.presence.wolf,design);
    const boarBand=threatBand(state.worldSystems.threat.presence.boar,design);
    const bandIndex=id=>design.threat.bands.findIndex(b=>b.id===id);

    if(cityLevel>=2&&healthy.length>=2){
      const p=(design.threat.alphaChance[bandIndex(wolfBand.id)]||0)+state.worldSystems.threat.alphaPity;
      if(rng()<p){
        state.worldSystems.threat.alphaSeen++;
        state.worldSystems.threat.alphaPity=0;
        resolveSpecialEncounter(state,healthy.slice(0,3),'alphaWolf',deps,data,design,rng);
      }else state.worldSystems.threat.alphaPity=clamp(state.worldSystems.threat.alphaPity+.002,0,.03);
    }

    if(cityLevel>=3&&healthy.length>=3){
      const p=(design.threat.bossChance[bandIndex(boarBand.id)]||0)+state.worldSystems.threat.bossPity;
      if(rng()<p){
        state.worldSystems.threat.bossSeen++;
        state.worldSystems.threat.bossPity=0;
        resolveSpecialEncounter(state,healthy.slice(0,3),'greatBoar',deps,data,design,rng);
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
        if(rng()<(species==='wolf'?.25:.35))state.worldSystems.map.workerInjuries++;
        logEvent(state,'threat','Incidente por amenaza de '+design.enemies[species].name+'.');
      }

      if(band.id==='imminent'&&rng()<.08){
        state.worldSystems.threat.cityAttacks++;
        const coinLoss=Math.min(state.resources.coins||0,randInt(rng,6,15));
        state.resources.coins-=coinLoss;
        logEvent(state,'city-attack','La amenaza llegó a la ciudad. Se perdieron '+coinLoss+' monedas y hubo daños temporales.');
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

  function workerOuting(state,kind,design,rng=Math.random){
    const result={ok:true,kind,gained:{},escort:null,injured:false};
    const wolfBand=threatBand(state.worldSystems.threat.presence.wolf,design);
    const boarBand=threatBand(state.worldSystems.threat.presence.boar,design);
    const danger=Math.max(
      design.threat.bands.findIndex(b=>b.id===wolfBand.id),
      design.threat.bands.findIndex(b=>b.id===boarBand.id)
    );

    if(danger>=2){
      const escort=state.adventurers
        .filter(npc=>npc.hpCurrent>npc.hpMax*.65&&!npc.autonomy.currentActivity)
        .sort((a,b)=>groupPower(b)-groupPower(a))[0];
      if(escort){
        result.escort=escort.id;
        state.worldSystems.map.escorts++;
        logEvent(state,'escort',escort.fullName+' escoltó la salida de trabajo.');
      }else if(rng()<.30+danger*.08){
        result.injured=true;
        state.worldSystems.map.workerInjuries++;
      }
    }

    if(kind==='mine'){
      result.gained.iron=randInt(rng,5,7);
      result.gained.stone=randInt(rng,3,4);
    }else if(kind==='wood'){
      result.gained.wood=randInt(rng,6,8);
      result.gained.firewood=randInt(rng,3,4);
      state.workers.logger.outings++;
    }else if(kind==='hunt'){
      result.gained.meat=randInt(rng,4,6);
      result.gained.skin=randInt(rng,2,3);
      result.gained.tendon=randInt(rng,1,2);
      state.workers.hunter.outings++;
    }else return {ok:false,reason:'Salida inexistente'};

    if(result.injured){
      for(const key of Object.keys(result.gained))result.gained[key]=Math.max(0,Math.floor(result.gained[key]*.5));
    }

    for(const [key,qty] of Object.entries(result.gained))state.resources[key]=(state.resources[key]||0)+qty;
    state.worldSystems.map.workerOutings++;
    state.city.development=Number(((state.city.development||0)+1).toFixed(2));
    logEvent(state,'worker-outing','Salida de '+kind+' completada.',result);
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
    if((state.city.level||1)>=2&&!state.worldSystems.textile.built){
      alerts.push({type:'building',severity:'info',text:'Textilería disponible para construir.'});
    }
    if(state.worldSystems.townHall.treasuryReserved>0){
      alerts.push({type:'treasury',severity:'info',text:'Tesorería reservada: '+state.worldSystems.townHall.treasuryReserved+' monedas.'});
    }
    state.worldSystems.townHall.alerts=alerts;
  }

  function stepWorld(state,deps,data,design,rng=Math.random){
    normalizeState(state,data,design);
    state.worldSystems.clockMinutes+=TICK_MINUTES;
    state.worldSystems.day=1+Math.floor(state.worldSystems.clockMinutes/(24*60));
    resolveDueActivities(state,deps,data,design,rng);
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
        .filter(npc=>npc.autonomy?.currentActivity)
        .map(npc=>({id:npc.id,name:npc.fullName,activity:clone(npc.autonomy.currentActivity)}))
    };
  }

  function formatWorldTime(minutes){
    const total=Math.max(0,Math.floor(Number(minutes)||0));
    const day=1+Math.floor(total/(24*60));
    const local=total%(24*60);
    const h=Math.floor(local/60);
    const m=local%60;
    return 'Día '+day+' · '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
  }

  return {
    WORLD_LOOP_SCHEMA_VERSION,
    TICK_MINUTES,
    normalizeState,
    advanceWorld,
    stepWorld,
    workerOuting,
    publishHuntMission,
    toggleMission,
    craftRecipe,
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
