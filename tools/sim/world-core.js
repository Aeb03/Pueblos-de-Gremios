'use strict';

const {
  TICK_MINUTES,MAX_MINUTES,PROFILES,CLASS,ITEM,TEXTILE_ORIGIN,RECIPES,FOOD,MATERIAL,CITY_LOOT_MIN_TREASURY,
  ALPHA_CHANCE,BOSS_CHANCE,REPAIR_RATE,REPAIR_THRESHOLD
}=require('./world-config');

function mulberry32(seed){
  let a=seed>>>0;
  return function(){
    a|=0;a=(a+0x6D2B79F5)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const randInt=(rng,min,max)=>Math.floor(rng()*(max-min+1))+min;
const choice=(rng,list)=>list[Math.floor(rng()*list.length)];
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
function median(xs){
  if(!xs.length)return 0;
  const a=[...xs].sort((x,y)=>x-y),m=Math.floor(a.length/2);
  return a.length%2?a[m]:(a[m-1]+a[m])/2;
}

function styleForClass(cls,rng){
  if(cls==='explorer')return rng()<.5?'bow':'dagger';
  if(cls==='warrior')return 'protector';
  if(cls==='healer')return 'sacred';
  return 'arcane';
}

function founderEquipment(cls,combatStyle){
  const equipment={};
  const add=(key)=>{
    const it=ITEM[key];
    equipment[key]={durability:it.durability,maxDurability:it.durability,founder:true,origin:'neutral'};
  };

  if(cls==='warrior'){
    add('founderWarriorWeapon');
    add('founderWarriorArmor');
  }else if(cls==='explorer'){
    add(combatStyle==='bow'?'founderExplorerBow':'founderExplorerDaggers');
    add('founderExplorerClothes');
  }else if(cls==='healer'){
    add('founderHealerStaff');
    add('founderHealerClothes');
  }else if(cls==='mage'){
    add('founderMageFocus');
    add('founderMageRobe');
  }
  return equipment;
}

function newAdventurer(cls,id,rng){
  const b=CLASS[cls];
  const combatStyle=styleForClass(cls,rng);
  return {
    id,cls,combatStyle,level:1,xp:0,xpLost:0,
    hpMax:b.hp,hp:b.hp,manaMax:b.mana,mana:b.mana,
    attack:b.attack,defense:b.defense,initiative:b.initiative,evasion:b.evasion,
    coins:randInt(rng,55,75),earned:0,spent:0,rests:0,repairs:0,founderRepairs:0,downs:0,fights:0,
    meals:0,rations:0,rationPrepared:false,
    loot:{},lootGenerated:0,lootSold:0,lootOfferMemory:{},
    spending:{gear:0,rest:0,repair:0,consumable:0},
    equipment:founderEquipment(cls,combatStyle),
    active:true
  };
}

function initialState(rng,profile){
  return {
    profile,
    city:{
      level:1,dev:0,marketTick:0,level2At:null,level3At:null,
      foundersLevelAtCity3:null,foundersAtLeast2AtCity3:null,
      coins:240,missionPaid:0,sales:0,serviceRevenue:0,repairRevenue:0,lootPurchases:0,
      resources:{
        iron:8,stone:6,wood:10,firewood:6,meat:4,skin:1,tendon:1,
        wolfSkin:0,boarSkin:0,wolfFang:0,boarTusk:0,
        alphaWolfSkin:0,alphaFang:0,greatBoarSkin:0,greatBoarTendon:0,greatBoarTusk:0
      },
      stock:{dagger:0,bow:0,staff:0,shield:0,leather:0,gloves:0,boots:0},
      variantStock:{
        leather:{neutral:0,wolf:0,boar:0,alphaWolf:0,greatBoar:0},
        gloves:{neutral:0,wolf:0,boar:0,alphaWolf:0,greatBoar:0},
        boots:{neutral:0,wolf:0,boar:0,alphaWolf:0,greatBoar:0}
      },
      produced:{dagger:0,bow:0,staff:0,shield:0,leather:0,gloves:0,boots:0},
      textileProduced:{neutral:0,wolf:0,boar:0,alphaWolf:0,greatBoar:0},
      textileSold:{neutral:0,wolf:0,boar:0,alphaWolf:0,greatBoar:0},
      textile:false,textileAt:null,presence:{wolf:25,boar:20},
      alphaSeen:0,bossSeen:0,alphaDefeated:0,bossDefeated:0,alphaPity:0,bossPity:0,
      missionsCompleted:0,workerOutings:0,blockedPurchases:0,repairBlocked:0,
      demand:{attempts:0,fulfilled:0,stockMiss:0,coinMiss:0},
      food:{platesSold:0,rationsSold:0,stockMiss:0},
      lootMarket:{offerUnits:0,acceptedUnits:0,noDemandUnits:0,treasuryRejectUnits:0,valuePaid:0},
      threatIncidents:0,cityAttacks:0,workerInjuries:0,resourceLossValue:0
    },
    adv:[
      newAdventurer('warrior','A1',rng),
      newAdventurer('explorer','A2',rng),
      newAdventurer('healer','A3',rng)
    ]
  };
}

function xpNeed(level){return level===1?45:level===2?90:150;}

function gainXp(a,amount){
  a.xp+=amount;
  while(a.level<4&&a.xp>=xpNeed(a.level)){
    a.xp-=xpNeed(a.level);a.level++;
    if(a.cls==='warrior'){a.hpMax+=6;if(a.level%2===0)a.attack++;a.manaMax++;}
    if(a.cls==='explorer'){a.hpMax+=4;a.attack++;a.manaMax+=2;}
    if(a.cls==='healer'){a.hpMax+=3;if(a.level%2===0)a.attack++;a.manaMax+=4;}
    if(a.cls==='mage'){a.hpMax+=3;a.attack++;a.manaMax+=4;}
    a.hp=Math.min(a.hpMax,a.hp+Math.ceil(a.hpMax*.15));
    a.mana=Math.min(a.manaMax,a.mana+Math.ceil(a.manaMax*.20));
  }
}

function loseXpOnDown(a){
  const loss=Math.min(a.xp,Math.ceil(xpNeed(a.level)*.20));
  a.xp-=loss;a.xpLost+=loss;a.downs++;
}

function maybeLevelCity(state,minute,rng){
  const {city,adv}=state;
  if(city.level===1&&city.dev>=9.5){
    city.level=2;city.level2At=minute;
    adv.push(newAdventurer('mage',`A${adv.length+1}`,rng));
  }
  if(city.level===2&&city.dev>=25.5){
    city.level=3;city.level3At=minute;
    city.foundersLevelAtCity3=mean(adv.slice(0,3).map(a=>a.level));
    city.foundersAtLeast2AtCity3=adv.slice(0,3).filter(a=>a.level>=2).length/3;
    const cls=choice(rng,['warrior','explorer','healer','mage']);
    adv.push(newAdventurer(cls,`A${adv.length+1}`,rng));
  }
}

function workerStep(state,rng){
  const {city,profile}=state;
  for(const job of ['mine','wood','hunt']){
    if(rng()>profile.worker)continue;
    city.workerOutings++;city.dev+=1;
    if(job==='mine'){
      city.resources.iron+=randInt(rng,5,7);
      city.resources.stone+=randInt(rng,3,4);
    }else if(job==='wood'){
      city.resources.wood+=randInt(rng,6,8);
      city.resources.firewood+=randInt(rng,3,4);
    }else{
      city.resources.meat+=randInt(rng,4,6);
      city.resources.skin+=randInt(rng,2,3);
      city.resources.tendon+=randInt(rng,1,2);
    }
  }
}

function hideOriginsWithQty(city,qty){
  return Object.entries(TEXTILE_ORIGIN)
    .filter(([,cfg])=>(city.resources[cfg.resource]||0)>=qty)
    .map(([origin])=>origin);
}

function hasInput(city,key,qty){
  if(key==='hide')return hideOriginsWithQty(city,qty).length>0;
  return (city.resources[key]||0)>=qty;
}

function consumeInput(city,key,qty,origin='neutral'){
  if(key==='hide'){
    const resource=TEXTILE_ORIGIN[origin].resource;
    city.resources[resource]-=qty;
    return;
  }
  city.resources[key]-=qty;
}

const canCraft=(city,item)=>Object.entries(RECIPES[item]).every(([k,v])=>hasInput(city,k,v));

function chooseTextileOrigin(city,item,qty,rng){
  const available=hideOriginsWithQty(city,qty);
  if(!available.length)return null;

  // Materiales Raro/Boss sólo se consumen deliberadamente y en piezas pequeñas,
  // evitando que la producción automática queme la primera piel especial sin control.
  if(item!=='leather'){
    if(available.includes('greatBoar')&&city.level>=3&&city.variantStock[item].greatBoar===0&&rng()<.55)return 'greatBoar';
    if(available.includes('alphaWolf')&&city.level>=2&&city.variantStock[item].alphaWolf===0&&rng()<.50)return 'alphaWolf';
  }

  const common=available.filter(x=>x==='wolf'||x==='boar');
  if(common.length){
    common.sort((a,b)=>(city.textileProduced[a]||0)-(city.textileProduced[b]||0));
    if(common.length===2&&city.textileProduced[common[0]]===city.textileProduced[common[1]])return rng()<.5?common[0]:common[1];
    return common[0];
  }

  if(available.includes('neutral'))return 'neutral';
  if(available.includes('alphaWolf'))return 'alphaWolf';
  if(available.includes('greatBoar'))return 'greatBoar';
  return available[0];
}

function craftStep(state,rng){
  const {city,profile}=state;
  const available=['dagger','bow','staff','shield'];
  if(city.textile)available.push('leather','gloves','boots');

  for(let slot=0;slot<(city.textile?3:2);slot++){
    if(rng()>profile.worker)continue;
    const candidates=available
      .filter(i=>city.stock[i]<2&&canCraft(city,i))
      .sort((a,b)=>city.stock[a]-city.stock[b]);
    if(!candidates.length)break;

    const item=candidates[0];
    let origin='neutral';
    const hideQty=RECIPES[item].hide||0;

    if(ITEM[item].textile){
      origin=chooseTextileOrigin(city,item,hideQty,rng);
      if(!origin)continue;
    }

    for(const [k,v] of Object.entries(RECIPES[item]))consumeInput(city,k,v,origin);

    city.stock[item]++;
    city.produced[item]++;
    if(ITEM[item].textile){
      city.variantStock[item][origin]++;
      city.textileProduced[origin]++;
    }
    city.dev+=.45;
  }
}

function maybeBuildTextile(state,minute){
  const {city}=state,r=city.resources;
  if(city.level<2||city.textile)return;
  if(city.coins>=40&&r.wood>=10&&r.stone>=8&&r.iron>=1){
    city.coins-=40;r.wood-=10;r.stone-=8;r.iron-=1;
    city.textile=true;city.textileAt=minute;city.dev+=2.5;
  }
}

function equipmentEntries(a){
  return Object.entries(a.equipment);
}

function slotEntry(a,slot){
  return equipmentEntries(a).find(([key])=>ITEM[key].slot===slot)||null;
}

function hasCommercialSlot(a,slot){
  const entry=slotEntry(a,slot);
  return !!entry&&!ITEM[entry[0]].founder;
}

function originConfig(origin='neutral'){
  return TEXTILE_ORIGIN[origin]||TEXTILE_ORIGIN.neutral;
}

function itemStats(key,eq={}){
  const it=ITEM[key];
  const origin=it.textile?originConfig(eq.origin):TEXTILE_ORIGIN.neutral;
  return {
    attack:it.attack||0,
    defense:(it.defense||0)+(origin.defense||0),
    initiative:(it.initiative||0)+(origin.initiative||0),
    mana:it.mana||0,
    evasion:(it.evasion||0)+(origin.evasion||0),
    damageReduction:origin.damageReduction||0
  };
}

function equipScore(a){
  let s=0;
  for(const [key,eq] of equipmentEntries(a)){
    const it=ITEM[key];
    if(it.founder){
      if(eq.durability<=0)s-=it.breakPenalty||0;
      continue;
    }
    if(eq.durability<=0)continue;
    const stats=itemStats(key,eq);
    s+=stats.attack*2+stats.defense*2+stats.initiative+stats.mana*.15+stats.evasion*20+stats.damageReduction*30;
  }
  return s;
}

function equipmentOriginEffects(a){
  let resilience=0,tempo=0;
  for(const [key,eq] of equipmentEntries(a)){
    if(eq.durability<=0||!ITEM[key].textile)continue;
    const origin=originConfig(eq.origin);
    resilience+=(origin.defense||0)*.025+(origin.damageReduction||0);
    tempo+=(origin.initiative||0)*.025+(origin.evasion||0)*.30;
  }
  return {resilience:clamp(resilience,0,.22),tempo:clamp(tempo,0,.18)};
}

function originPreference(a,origin){
  const o=originConfig(origin);
  const defWeight=a.cls==='warrior'?1.45:(a.cls==='explorer'?.80:1.10);
  const iniWeight=a.cls==='explorer'?1.50:(a.cls==='warrior'?.55:1.00);
  const special=(o.damageReduction||0)*18;
  return (o.defense||0)*defWeight+(o.initiative||0)*iniWeight+(o.evasion||0)*20+special;
}

function variantPrice(item,origin='neutral'){
  return Math.max(1,Math.round(ITEM[item].price*originConfig(origin).priceMul));
}

function bestTextileVariant(city,a,item){
  const variants=city.variantStock[item];
  if(!variants)return null;
  const options=Object.entries(variants)
    .filter(([,qty])=>qty>0)
    .map(([origin])=>{
      const price=variantPrice(item,origin);
      const preference=originPreference(a,origin);
      const affordability=a.coins>=price?0.35:-.45;
      return {origin,price,score:preference+affordability};
    })
    .sort((x,y)=>y.score-x.score);
  return options[0]||null;
}

function itemNeedScore(a,item,city){
  const it=ITEM[item];
  if(!it.purchasable||!it.class.includes(a.cls)||hasCommercialSlot(a,it.slot))return 0;

  const hpRatio=a.hp/a.hpMax;
  let score=.25;

  if(it.slot==='weapon'){
    if(a.cls==='explorer'){
      if(item!==a.combatStyle)return 0;
      score=1.00;
    }else if(item==='staff'&&(a.cls==='healer'||a.cls==='mage')){
      score=1.00;
    }else return 0;
  }else if(item==='shield'){
    score=a.cls==='warrior'?.95:0;
  }else if(item==='leather'){
    score=.50+(hpRatio<.70?.20:0)+(a.downs>0?.10:0)+(city.level>=2?.05:0);
  }else if(item==='boots'){
    score=(a.cls==='explorer'?.62:.38)+(a.downs>0?.05:0);
  }else if(item==='gloves'){
    score=.34+(a.cls==='warrior'?.08:0);
  }

  if(it.textile){
    const variant=bestTextileVariant(city,a,item);
    if(variant)score+=Math.min(.22,originPreference(a,variant.origin)*.06);
  }

  return clamp(score,0,1.35);
}

function removeFounderInSlot(a,slot){
  const entry=slotEntry(a,slot);
  if(entry&&ITEM[entry[0]].founder)delete a.equipment[entry[0]];
}

function buyStep(state,rng){
  const {city,adv,profile}=state;
  for(const a of adv){
    const candidates=Object.keys(ITEM)
      .filter(item=>ITEM[item].purchasable)
      .map(item=>({item,score:itemNeedScore(a,item,city)}))
      .filter(x=>x.score>=.40)
      .sort((x,y)=>y.score-x.score);
    if(!candidates.length)continue;

    const wanted=candidates[0];
    const actChance=clamp(profile.shop*(.75+wanted.score*.75),0,1);
    if(rng()>actChance)continue;

    city.demand.attempts++;
    const item=wanted.item,it=ITEM[item];

    if(city.stock[item]<=0){
      city.demand.stockMiss++;
      continue;
    }

    let origin='neutral';
    let price=it.price;
    if(it.textile){
      const variant=bestTextileVariant(city,a,item);
      if(!variant){
        city.demand.stockMiss++;
        continue;
      }
      origin=variant.origin;
      price=variant.price;
    }

    if(a.coins<price){
      city.blockedPurchases++;city.demand.coinMiss++;
      continue;
    }

    a.coins-=price;a.spent+=price;a.spending.gear+=price;
    city.coins+=price;city.sales+=price;city.stock[item]--;
    if(it.textile){
      city.variantStock[item][origin]--;
      city.textileSold[origin]++;
    }

    removeFounderInSlot(a,it.slot);
    a.equipment[item]={durability:it.durability,maxDurability:it.durability,origin,founder:false};
    city.demand.fulfilled++;
  }
}

function repairStep(state,a,rng){
  const {city,profile}=state;
  const needs=equipmentEntries(a)
    .filter(([key,eq])=>eq.durability/eq.maxDurability<=REPAIR_THRESHOLD)
    .sort((x,y)=>(x[1].durability/x[1].maxDurability)-(y[1].durability/y[1].maxDurability));

  if(!needs.length)return false;
  const [key,eq]=needs[0],it=ITEM[key];
  const ratio=eq.durability/eq.maxDurability;
  const urgency=ratio<=0?1:.75;
  if(rng()>clamp(profile.shop*3*urgency,.25,1))return false;

  const repairBase=it.founder?8:it.price;
  const price=Math.max(2,Math.round(repairBase*REPAIR_RATE));
  if(a.coins<price){city.repairBlocked++;return false;}

  a.coins-=price;a.spent+=price;a.spending.repair+=price;a.repairs++;
  if(it.founder)a.founderRepairs++;
  city.coins+=price;city.serviceRevenue+=price;city.repairRevenue+=price;
  eq.durability=eq.maxDurability;
  return true;
}

function wearEquipment(a,intensity,rng){
  for(const [,eq] of equipmentEntries(a)){
    if(eq.durability<=0)continue;
    if(rng()<clamp(.80*intensity,0,1)){
      let wear=1;
      if(intensity>=1.8&&rng()<.45)wear++;
      eq.durability=Math.max(0,eq.durability-wear);
    }
  }
}

function recordSpend(a,kind,amount){
  a.coins-=amount;a.spent+=amount;a.spending[kind]+=amount;
}

function restStep(state,a){
  const {city,profile}=state;
  const hpRatio=a.hp/a.hpMax,manaRatio=a.manaMax?a.mana/a.manaMax:1;
  if(hpRatio>=profile.restHp&&manaRatio>=profile.restMana)return false;

  const price=4;
  if(a.coins>=price){
    recordSpend(a,'rest',price);city.coins+=price;city.serviceRevenue+=price;
    a.hp=Math.min(a.hpMax,a.hp+Math.ceil(a.hpMax*.45));
    a.mana=Math.min(a.manaMax,a.mana+Math.ceil(a.manaMax*.55));
    a.rests++;
  }else{
    a.hp=Math.min(a.hpMax,a.hp+Math.ceil(a.hpMax*.18));
    a.mana=Math.min(a.manaMax,a.mana+Math.ceil(a.manaMax*.22));
  }
  return true;
}

function addLoot(a,key,qty=1){
  a.loot[key]=(a.loot[key]||0)+qty;
  a.lootGenerated+=qty;
}
function rollCommonLoot(a,enemy,count,rng){
  for(let i=0;i<count;i++){
    if(enemy==='wolf'){
      if(rng()<.70)addLoot(a,'meat',1);
      if(rng()<.55)addLoot(a,'wolfSkin',1);
      if(rng()<.15)addLoot(a,'wolfFang',1);
    }else{
      if(rng()<.90)addLoot(a,'meat',randInt(rng,1,2));
      if(rng()<.65)addLoot(a,'boarSkin',1);
      if(rng()<.40)addLoot(a,'tendon',1);
      if(rng()<.12)addLoot(a,'boarTusk',1);
    }
  }
}
function rollAlphaLoot(group,rng){
  const living=group.filter(a=>a.hp>0);
  if(!living.length)return;
  const owner=choice(rng,living);
  addLoot(owner,'meat',randInt(rng,1,2));
  addLoot(owner,'alphaWolfSkin',1);
  if(rng()<.30)addLoot(owner,'alphaFang',1);
  for(let i=0;i<2;i++)rollCommonLoot(choice(rng,living),'wolf',1,rng);
}
function rollBossLoot(group,rng){
  const living=group.filter(a=>a.hp>0);
  if(!living.length)return;
  const owner=choice(rng,living);
  addLoot(owner,'meat',randInt(rng,3,5));
  addLoot(owner,'greatBoarSkin',1);
  if(rng()<.50)addLoot(owner,'greatBoarTendon',1);
  if(rng()<.40)addLoot(owner,'greatBoarTusk',1);
}
function materialTarget(city,key){
  const cfg=MATERIAL[key];
  if(!cfg)return 0;
  return cfg.target[Math.max(0,Math.min(2,city.level-1))]||0;
}
function sellLootStep(state,a,rng){
  const {city,profile}=state;
  if(rng()>profile.sellLoot)return false;

  let sold=false;
  for(const [key,qtyRaw] of Object.entries(a.loot)){
    let qty=Math.floor(qtyRaw||0);
    if(qty<=0||!MATERIAL[key])continue;

    const memory=a.lootOfferMemory[key]||{knownQty:0,retryAt:0};
    const hasNewLoot=qty>memory.knownQty;
    if(!hasNewLoot&&city.marketTick<memory.retryAt)continue;

    city.lootMarket.offerUnits+=qty;
    const target=materialTarget(city,key);
    const have=city.resources[key]||0;
    const need=Math.max(0,target-have);

    if(need<=0){
      city.lootMarket.noDemandUnits+=qty;
      a.lootOfferMemory[key]={knownQty:qty,retryAt:city.marketTick+3};
      continue;
    }

    const price=MATERIAL[key].price;
    const spendable=Math.max(0,city.coins-CITY_LOOT_MIN_TREASURY);
    const affordable=Math.floor(spendable/price);
    const accepted=Math.min(qty,need,affordable);

    if(accepted<=0){
      city.lootMarket.treasuryRejectUnits+=qty;
      a.lootOfferMemory[key]={knownQty:qty,retryAt:city.marketTick+2};
      continue;
    }

    const value=accepted*price;
    city.coins-=value;
    city.lootPurchases+=value;
    city.lootMarket.valuePaid+=value;
    city.lootMarket.acceptedUnits+=accepted;
    city.resources[key]=(city.resources[key]||0)+accepted;
    a.coins+=value;a.earned+=value;
    a.loot[key]-=accepted;
    a.lootSold+=accepted;
    sold=true;

    const remaining=qty-accepted;
    if(remaining<=0){
      delete a.lootOfferMemory[key];
    }else{
      if(accepted>=need)city.lootMarket.noDemandUnits+=remaining;
      else city.lootMarket.treasuryRejectUnits+=remaining;
      a.lootOfferMemory[key]={knownQty:remaining,retryAt:city.marketTick+(accepted>=need?3:2)};
    }
  }
  return sold;
}
function canServeFood(city,kind){
  const f=FOOD[kind];
  return city.resources.meat>=f.meat&&city.resources.firewood>=f.firewood;
}
function serveFood(state,a,kind){
  const {city}=state,f=FOOD[kind];
  if(!canServeFood(city,kind)){city.food.stockMiss++;return false;}
  if(a.coins<f.price)return false;

  city.resources.meat-=f.meat;
  city.resources.firewood-=f.firewood;
  recordSpend(a,'consumable',f.price);
  city.coins+=f.price;city.serviceRevenue+=f.price;

  if(kind==='plate'){
    a.hp=Math.min(a.hpMax,a.hp+Math.ceil(a.hpMax*f.hpRestore));
    a.mana=Math.min(a.manaMax,a.mana+Math.ceil(a.manaMax*f.manaRestore));
    a.meals++;city.food.platesSold++;
  }else{
    a.rationPrepared=true;a.rations++;city.food.rationsSold++;
  }
  return true;
}
function plateStep(state,a,rng){
  const hp=a.hp/a.hpMax,mana=a.manaMax?a.mana/a.manaMax:1;
  if(hp<state.profile.restHp||mana<state.profile.restMana)return false;
  if(hp>=.88&&mana>=.80)return false;
  if(rng()>.22)return false;
  return serveFood(state,a,'plate');
}
function rationStep(state,a,rng,important=false){
  if(a.rationPrepared)return false;
  const chance=important?.70:clamp(.06+state.profile.shop*.35,.10,.24);
  if(rng()>chance)return false;
  return serveFood(state,a,'ration');
}
function prepLossFactor(a){
  if(!a.rationPrepared)return {hp:1,mana:1};
  a.rationPrepared=false;
  return {hp:1-FOOD.ration.hpProtection,mana:1-FOOD.ration.manaProtection};
}

function commonRisk(a,enemy,count){
  const itemBonus=equipScore(a),levelBonus=(a.level-1)*.08;
  const origin=equipmentOriginEffects(a);
  let meanLoss,win;
  if(enemy==='wolf'){
    meanLoss={warrior:.105,explorer:.080,healer:.150,mage:.125}[a.cls];
    win={warrior:.995,explorer:.995,healer:.965,mage:.980}[a.cls];
  }else{
    meanLoss={warrior:.180,explorer:.155,healer:.245,mage:.205}[a.cls];
    win={warrior:.985,explorer:.980,healer:.925,mage:.960}[a.cls];
  }
  meanLoss*=1+Math.max(0,count-1)*.55;
  win-=Math.max(0,count-1)*(enemy==='wolf'?.055:.08);
  meanLoss*=clamp(1-itemBonus*.018-levelBonus,.45,1);
  meanLoss*=1-origin.resilience;
  win=clamp(win+itemBonus*.0015+levelBonus*.08+origin.tempo*.10,.60,.999);
  return {meanLoss,win,manaFactor:1-origin.tempo*.55};
}

function commonEncounter(state,a,enemy,rng){
  const {city}=state;
  const count=enemy==='wolf'?(rng()<.60?1:(rng()<.75?2:3)):(rng()<.80?1:2);
  const {meanLoss,win,manaFactor}=commonRisk(a,enemy,count);
  const prep=prepLossFactor(a);
  a.hp=Math.max(0,a.hp-Math.ceil(a.hpMax*meanLoss*(.65+rng()*.70)*prep.hp));
  a.mana=Math.max(0,a.mana-Math.ceil(a.manaMax*({warrior:.10,explorer:.22,healer:.26,mage:.30}[a.cls])*(.65+rng()*.70)*prep.mana*manaFactor));
  a.fights++;wearEquipment(a,1,rng);

  const won=rng()<win&&a.hp>0;
  if(!won||a.hp<=0){a.hp=0;loseXpOnDown(a);return false;}

  gainXp(a,(enemy==='wolf'?10:14)*count);
  rollCommonLoot(a,enemy,count,rng);

  if(rng()<state.profile.paidMission){
    const reward=Math.round((enemy==='wolf'?6:8)*count*state.profile.missionBias);
    if(city.coins>=reward){
      city.coins-=reward;city.missionPaid+=reward;a.coins+=reward;a.earned+=reward;
    }
    city.missionsCompleted++;city.dev+=.22;
  }

  city.presence[enemy]=Math.max(0,city.presence[enemy]-(enemy==='wolf'?3:4)*count);
  return true;
}

const groupPower=group=>group.reduce((s,a)=>s+a.attack*2+a.defense*2+a.hpMax*.08+a.initiative+a.manaMax*.04+equipScore(a),0);

function groupEncounter(state,group,kind,rng){
  const {city}=state;
  const prepared=group.reduce((s,a)=>s+equipScore(a),0),levelAvg=mean(group.map(a=>a.level));
  const resilience=mean(group.map(a=>equipmentOriginEffects(a).resilience));
  const tempo=mean(group.map(a=>equipmentOriginEffects(a).tempo));
  let win,hpLossMean,downChance,manaUse,xpTotal,reward,presenceDrop;

  if(kind==='alpha'){
    win=clamp(.985+prepared*.0008+(levelAvg-1)*.01,.90,.999);
    hpLossMean=clamp(.16-prepared*.0015-(levelAvg-1)*.02,.07,.18);
    downChance=clamp(.025-prepared*.0003,0,.04);
    manaUse=.52;xpTotal=38;reward=36;presenceDrop=18;
  }else{
    const prepIndex=clamp(prepared/18,0,1);
    win=.987+prepIndex*.013;
    hpLossMean=.566+prepIndex*(.346-.566)-(levelAvg-1)*.04;
    downChance=.658+prepIndex*(.062-.658)-(levelAvg-1)*.06;
    manaUse=.84+prepIndex*(.82-.84);
    xpTotal=90;reward=60;presenceDrop=25;
  }

  hpLossMean*=1-resilience;
  manaUse*=1-tempo*.55;
  win=clamp(win+tempo*.08,.80,.9999);

  for(const a of group)rationStep(state,a,rng,true);

  const won=rng()<win;
  for(const a of group){
    const prep=prepLossFactor(a);
    const individual=clamp(hpLossMean*(.72+rng()*.56)*prep.hp,0,.98);
    a.hp=Math.max(0,a.hp-Math.ceil(a.hpMax*individual));
    a.mana=Math.max(0,a.mana-Math.ceil(a.manaMax*manaUse*(.75+rng()*.35)*prep.mana));
    a.fights++;wearEquipment(a,kind==='boss'?2:1.35,rng);
    if(rng()<downChance/group.length||(!won&&rng()<.55)){a.hp=0;loseXpOnDown(a);}
  }
  if(!won)return false;

  if(kind==='alpha')rollAlphaLoot(group,rng);
  else rollBossLoot(group,rng);

  const living=group.filter(a=>a.hp>0),share=living.length?xpTotal/living.length:0;
  for(const a of living)gainXp(a,share);

  if(city.coins>=reward){
    city.coins-=reward;city.missionPaid+=reward;
    for(const a of group){a.coins+=reward/group.length;a.earned+=reward/group.length;}
  }

  city.missionsCompleted++;city.dev+=kind==='boss'?1.8:1.0;
  if(kind==='alpha'){
    city.presence.wolf=Math.max(0,city.presence.wolf-presenceDrop);city.alphaDefeated++;
  }else{
    city.presence.boar=Math.max(0,city.presence.boar-presenceDrop);city.bossDefeated++;
  }
  return true;
}

function presenceBand(v){return v<40?0:v<60?1:v<80?2:v<95?3:4;}

function loseResource(city,key,amount,valueEach=1){
  const actual=Math.min(city.resources[key]||0,amount);
  city.resources[key]-=actual;
  city.resourceLossValue+=actual*valueEach;
}
function threatConsequences(state,rng){
  const {city}=state;
  for(const species of ['wolf','boar']){
    const band=presenceBand(city.presence[species]);
    const incidentChance=[0,.02,.06,.12,.20][band];
    if(rng()<incidentChance){
      city.threatIncidents++;
      if(species==='wolf'){
        loseResource(city,'meat',randInt(rng,1,3),2);
        if(rng()<.25)city.workerInjuries++;
      }else{
        loseResource(city,'wood',randInt(rng,1,3),1);
        if(rng()<.35)city.workerInjuries++;
      }
    }

    if(band===4&&rng()<.08){
      city.cityAttacks++;
      const coinLoss=Math.min(city.coins,randInt(rng,6,15));
      city.coins-=coinLoss;city.resourceLossValue+=coinLoss;
      loseResource(city,'meat',randInt(rng,1,4),2);
      loseResource(city,'wood',randInt(rng,1,3),1);
      if(rng()<.55)city.workerInjuries++;
    }
  }
}

function threatStep(state,rng,{allowResponse=true}={}){
  const {city,adv}=state;
  city.presence.wolf=clamp(city.presence.wolf+3,0,100);
  city.presence.boar=clamp(city.presence.boar+2,0,100);

  if(city.level>=2){
    const p=ALPHA_CHANCE[presenceBand(city.presence.wolf)]+city.alphaPity;
    if(rng()<p){
      city.alphaSeen++;city.alphaPity=0;
      if(allowResponse){
        const group=adv.filter(a=>a.hp>0).sort((a,b)=>groupPower([b])-groupPower([a])).slice(0,3);
        if(group.length>=2)groupEncounter(state,group,'alpha',rng);
      }
    }else city.alphaPity=clamp(city.alphaPity+.002,0,.03);
  }

  if(city.level>=3){
    const p=BOSS_CHANCE[presenceBand(city.presence.boar)]+city.bossPity;
    if(rng()<p){
      city.bossSeen++;city.bossPity=0;
      if(allowResponse){
        const group=adv.filter(a=>a.hp>0).sort((a,b)=>groupPower([b])-groupPower([a])).slice(0,3);
        if(group.length===3)groupEncounter(state,group,'boss',rng);
      }
    }else city.bossPity=clamp(city.bossPity+.001,0,.015);
  }

  threatConsequences(state,rng);
}

function adventurerStep(state,rng){
  const {city,adv,profile}=state;
  for(const a of adv){
    sellLootStep(state,a,rng);
    repairStep(state,a,rng);

    if(a.hp<=0){
      const price=8;
      if(a.coins>=price){
        recordSpend(a,'rest',price);city.coins+=price;city.serviceRevenue+=price;
      }
      a.hp=Math.ceil(a.hpMax*.45);a.mana=Math.ceil(a.manaMax*.50);a.rests++;continue;
    }
    if(restStep(state,a))continue;
    plateStep(state,a,rng);
    if(rng()>profile.adv)continue;
    rationStep(state,a,rng,false);
    const enemy=city.presence.boar>city.presence.wolf&&rng()<.55?'boar':(rng()<.62?'wolf':'boar');
    commonEncounter(state,a,enemy,rng);
  }
}

function spendTotals(adv){
  const out={gear:0,rest:0,repair:0,consumable:0};
  for(const a of adv)for(const k of Object.keys(out))out[k]+=a.spending[k]||0;
  return out;
}

function runCity(seed,profileKey){
  const rng=mulberry32(seed),profile=PROFILES[profileKey],state=initialState(rng,profile);
  for(let minute=TICK_MINUTES;minute<=MAX_MINUTES;minute+=TICK_MINUTES){
    state.city.marketTick++;
    workerStep(state,rng);craftStep(state,rng);maybeBuildTextile(state,minute);buyStep(state,rng);
    adventurerStep(state,rng);threatStep(state,rng);maybeLevelCity(state,minute,rng);
  }

  const {city,adv}=state,earned=adv.reduce((s,a)=>s+a.earned,0),spent=adv.reduce((s,a)=>s+a.spent,0);
  const spend=spendTotals(adv),recurring=spend.rest+spend.repair+spend.consumable;
  return {
    profile:profileKey,level:city.level,level2At:city.level2At,level3At:city.level3At,textileAt:city.textileAt,
    cityCoins:city.coins,cityDev:city.dev,advCount:adv.length,
    foundersLevelMean:mean(adv.slice(0,3).map(a=>a.level)),
    foundersLevelAtCity3:city.foundersLevelAtCity3,
    foundersAtLeast2AtCity3:city.foundersAtLeast2AtCity3,
    totalDowns:adv.reduce((s,a)=>s+a.downs,0),
    totalXpLost:adv.reduce((s,a)=>s+a.xpLost,0),
    totalFights:adv.reduce((s,a)=>s+a.fights,0),
    rests:adv.reduce((s,a)=>s+a.rests,0),repairs:adv.reduce((s,a)=>s+a.repairs,0),
    meals:adv.reduce((s,a)=>s+a.meals,0),rations:adv.reduce((s,a)=>s+a.rations,0),
    earnings:earned,spending:spent,gearSpend:spend.gear,restSpend:spend.rest,repairSpend:spend.repair,foodSpend:spend.consumable,
    recurringSpend:recurring,
    reinvestRate:earned?spent/earned:0,
    recurringReinvestRate:earned?recurring/earned:0,
    spendShareOfAvailable:(earned+adv.length*65)>0?spent/(earned+adv.length*65):0,
    missionPaid:city.missionPaid,sales:city.sales,serviceRevenue:city.serviceRevenue,repairRevenue:city.repairRevenue,
    lootPurchases:city.lootPurchases,
    lootGeneratedUnits:adv.reduce((s,a)=>s+a.lootGenerated,0),
    lootSoldUnits:adv.reduce((s,a)=>s+a.lootSold,0),
    lootRetainedUnits:adv.reduce((s,a)=>s+Object.values(a.loot).reduce((x,y)=>x+(y||0),0),0),
    lootOfferUnits:city.lootMarket.offerUnits,lootAcceptedUnits:city.lootMarket.acceptedUnits,
    lootNoDemandUnits:city.lootMarket.noDemandUnits,lootTreasuryRejectUnits:city.lootMarket.treasuryRejectUnits,
    platesSold:city.food.platesSold,rationsSold:city.food.rationsSold,foodStockMiss:city.food.stockMiss,
    blockedPurchases:city.blockedPurchases,repairBlocked:city.repairBlocked,
    demandAttempts:city.demand.attempts,demandFulfilled:city.demand.fulfilled,
    demandStockMiss:city.demand.stockMiss,demandCoinMiss:city.demand.coinMiss,
    alphaSeen:city.alphaSeen,alphaDefeated:city.alphaDefeated,bossSeen:city.bossSeen,bossDefeated:city.bossDefeated,
    wolfPresence:city.presence.wolf,boarPresence:city.presence.boar,
    threatIncidents:city.threatIncidents,cityAttacks:city.cityAttacks,workerInjuries:city.workerInjuries,
    resourceLossValue:city.resourceLossValue,
    missionsCompleted:city.missionsCompleted,workerOutings:city.workerOutings,
    produced:Object.values(city.produced).reduce((a,b)=>a+b,0)
  };
}

function runThreatNeglect(seed,profileKey='normal',minutes=180){
  const rng=mulberry32(seed),profile=PROFILES[profileKey],state=initialState(rng,profile);
  for(let minute=TICK_MINUTES;minute<=minutes;minute+=TICK_MINUTES){
    state.city.marketTick++;
    workerStep(state,rng);craftStep(state,rng);maybeBuildTextile(state,minute);buyStep(state,rng);
    threatStep(state,rng,{allowResponse:false});maybeLevelCity(state,minute,rng);
  }
  const {city}=state;
  return {
    profile:profileKey,minutes,level:city.level,wolfPresence:city.presence.wolf,boarPresence:city.presence.boar,
    alphaSeen:city.alphaSeen,bossSeen:city.bossSeen,threatIncidents:city.threatIncidents,
    cityAttacks:city.cityAttacks,workerInjuries:city.workerInjuries,resourceLossValue:city.resourceLossValue,
    cityCoins:city.coins
  };
}

function summarize(profileKey,rows){
  const completed2=rows.filter(r=>r.level2At!==null),completed3=rows.filter(r=>r.level3At!==null),textile=rows.filter(r=>r.textileAt!==null);
  return {
    profile:profileKey,label:PROFILES[profileKey].label,runs:rows.length,
    level2Rate:completed2.length/rows.length,level2Mean:mean(completed2.map(r=>r.level2At)),level2Median:median(completed2.map(r=>r.level2At)),
    level3Rate:completed3.length/rows.length,level3Mean:mean(completed3.map(r=>r.level3At)),level3Median:median(completed3.map(r=>r.level3At)),
    textileRate:textile.length/rows.length,textileMean:mean(textile.map(r=>r.textileAt)),
    foundersLevelMean:mean(rows.map(r=>r.foundersLevelMean)),
    foundersLevelAtCity3:mean(rows.filter(r=>r.foundersLevelAtCity3!==null).map(r=>r.foundersLevelAtCity3)),
    foundersAtLeast2AtCity3:mean(rows.filter(r=>r.foundersAtLeast2AtCity3!==null).map(r=>r.foundersAtLeast2AtCity3)),
    downsMean:mean(rows.map(r=>r.totalDowns)),xpLostMean:mean(rows.map(r=>r.totalXpLost)),
    fightsMean:mean(rows.map(r=>r.totalFights)),
    restsMean:mean(rows.map(r=>r.rests)),repairsMean:mean(rows.map(r=>r.repairs)),
    mealsMean:mean(rows.map(r=>r.meals)),rationsMean:mean(rows.map(r=>r.rations)),
    gearSpendMean:mean(rows.map(r=>r.gearSpend)),restSpendMean:mean(rows.map(r=>r.restSpend)),
    repairSpendMean:mean(rows.map(r=>r.repairSpend)),foodSpendMean:mean(rows.map(r=>r.foodSpend)),
    recurringSpendMean:mean(rows.map(r=>r.recurringSpend)),
    reinvestRate:mean(rows.map(r=>r.reinvestRate)),recurringReinvestRate:mean(rows.map(r=>r.recurringReinvestRate)),
    spendShareOfAvailable:mean(rows.map(r=>r.spendShareOfAvailable)),
    cityCoinsMean:mean(rows.map(r=>r.cityCoins)),blockedPurchasesMean:mean(rows.map(r=>r.blockedPurchases)),
    demandAttemptsMean:mean(rows.map(r=>r.demandAttempts)),
    demandFulfilledRate:rows.reduce((s,r)=>s+r.demandAttempts,0)?rows.reduce((s,r)=>s+r.demandFulfilled,0)/rows.reduce((s,r)=>s+r.demandAttempts,0):0,
    demandStockMissRate:rows.reduce((s,r)=>s+r.demandAttempts,0)?rows.reduce((s,r)=>s+r.demandStockMiss,0)/rows.reduce((s,r)=>s+r.demandAttempts,0):0,
    demandCoinMissRate:rows.reduce((s,r)=>s+r.demandAttempts,0)?rows.reduce((s,r)=>s+r.demandCoinMiss,0)/rows.reduce((s,r)=>s+r.demandAttempts,0):0,
    lootGeneratedMean:mean(rows.map(r=>r.lootGeneratedUnits)),
    lootSoldRate:rows.reduce((s,r)=>s+r.lootGeneratedUnits,0)?rows.reduce((s,r)=>s+r.lootSoldUnits,0)/rows.reduce((s,r)=>s+r.lootGeneratedUnits,0):0,
    lootRetainedMean:mean(rows.map(r=>r.lootRetainedUnits)),
    lootOfferUnitsMean:mean(rows.map(r=>r.lootOfferUnits)),
    lootAcceptedRate:rows.reduce((s,r)=>s+r.lootOfferUnits,0)?rows.reduce((s,r)=>s+r.lootAcceptedUnits,0)/rows.reduce((s,r)=>s+r.lootOfferUnits,0):0,
    lootNoDemandRate:rows.reduce((s,r)=>s+r.lootOfferUnits,0)?rows.reduce((s,r)=>s+r.lootNoDemandUnits,0)/rows.reduce((s,r)=>s+r.lootOfferUnits,0):0,
    lootTreasuryRejectRate:rows.reduce((s,r)=>s+r.lootOfferUnits,0)?rows.reduce((s,r)=>s+r.lootTreasuryRejectUnits,0)/rows.reduce((s,r)=>s+r.lootOfferUnits,0):0,
    lootPurchaseValueMean:mean(rows.map(r=>r.lootPurchases)),
    alphaSeenRate:rows.filter(r=>r.alphaSeen>0).length/rows.length,
    bossSeenRate:rows.filter(r=>r.bossSeen>0).length/rows.length,
    bossDefeatRate:rows.filter(r=>r.bossDefeated>0).length/rows.length,
    wolfPresenceMean:mean(rows.map(r=>r.wolfPresence)),boarPresenceMean:mean(rows.map(r=>r.boarPresence)),
    threatIncidentsMean:mean(rows.map(r=>r.threatIncidents)),cityAttacksMean:mean(rows.map(r=>r.cityAttacks)),
    missionsMean:mean(rows.map(r=>r.missionsCompleted)),workerOutingsMean:mean(rows.map(r=>r.workerOutings)),
    productionMean:mean(rows.map(r=>r.produced))
  };
}

function summarizeThreat(rows){
  return {
    runs:rows.length,minutes:rows[0]?.minutes||0,
    wolfPresenceMean:mean(rows.map(r=>r.wolfPresence)),boarPresenceMean:mean(rows.map(r=>r.boarPresence)),
    incidentMean:mean(rows.map(r=>r.threatIncidents)),
    incidentRate:rows.filter(r=>r.threatIncidents>0).length/rows.length,
    attackMean:mean(rows.map(r=>r.cityAttacks)),
    attackRate:rows.filter(r=>r.cityAttacks>0).length/rows.length,
    workerInjuryMean:mean(rows.map(r=>r.workerInjuries)),
    lossMean:mean(rows.map(r=>r.resourceLossValue)),
    alphaSeenRate:rows.filter(r=>r.alphaSeen>0).length/rows.length,
    bossSeenRate:rows.filter(r=>r.bossSeen>0).length/rows.length
  };
}

module.exports={runCity,runThreatNeglect,summarize,summarizeThreat,PROFILES,mean,median};
