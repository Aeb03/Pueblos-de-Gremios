'use strict';

const {
  TICK_MINUTES,MAX_MINUTES,PROFILES,CLASS,ITEM,RECIPES,ALPHA_CHANCE,BOSS_CHANCE
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

function newAdventurer(cls,id,rng){
  const b=CLASS[cls];
  return {
    id,cls,level:1,xp:0,xpLost:0,
    hpMax:b.hp,hp:b.hp,manaMax:b.mana,mana:b.mana,
    attack:b.attack,defense:b.defense,initiative:b.initiative,evasion:b.evasion,
    coins:randInt(rng,55,75),earned:0,spent:0,rests:0,repairs:0,downs:0,fights:0,
    equipment:new Set(),active:true
  };
}

function initialState(rng,profile){
  return {
    profile,
    city:{
      level:1,dev:0,level2At:null,level3At:null,
      foundersLevelAtCity3:null,foundersAtLeast2AtCity3:null,
      coins:240,missionPaid:0,sales:0,serviceRevenue:0,
      resources:{iron:8,stone:6,wood:10,firewood:6,meat:4,skin:1,tendon:1},
      stock:{dagger:0,bow:0,staff:0,shield:0,leather:0,gloves:0,boots:0},
      produced:{dagger:0,bow:0,staff:0,shield:0,leather:0,gloves:0,boots:0},
      textile:false,textileAt:null,presence:{wolf:25,boar:20},
      alphaSeen:0,bossSeen:0,alphaDefeated:0,bossDefeated:0,alphaPity:0,bossPity:0,
      missionsCompleted:0,workerOutings:0,blockedPurchases:0
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

const canCraft=(city,item)=>Object.entries(RECIPES[item]).every(([k,v])=>(city.resources[k]||0)>=v);
function craftStep(state,rng){
  const {city,profile}=state;
  const available=['dagger','bow','staff','shield'];
  if(city.textile)available.push('leather','gloves','boots');

  for(let slot=0;slot<(city.textile?3:2);slot++){
    if(rng()>profile.worker)continue;
    const candidates=available
      .filter(i=>city.stock[i]<(city.textile||!['leather','gloves','boots'].includes(i)?2:0)&&canCraft(city,i))
      .sort((a,b)=>city.stock[a]-city.stock[b]);
    if(!candidates.length)break;
    const item=candidates[0];
    for(const [k,v] of Object.entries(RECIPES[item]))city.resources[k]-=v;
    city.stock[item]++;city.produced[item]++;city.dev+=.45;
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

function equipScore(a){
  let s=0;
  for(const i of a.equipment){
    const it=ITEM[i];
    s+=it.attack*2+it.defense*2+it.initiative+it.mana*.15;
  }
  return s;
}

function buyStep(state,rng){
  const {city,adv,profile}=state;
  for(const a of adv){
    if(rng()>profile.shop)continue;
    const priorities=a.cls==='warrior'
      ?['shield','leather','gloves','boots']
      :a.cls==='explorer'
        ?['bow','dagger','boots','leather','gloves']
        :['staff','leather','boots','gloves'];

    for(const item of priorities){
      if(a.equipment.has(item)||city.stock[item]<=0||!ITEM[item].class.includes(a.cls))continue;
      if(a.coins<ITEM[item].price){city.blockedPurchases++;continue;}
      a.coins-=ITEM[item].price;a.spent+=ITEM[item].price;
      city.coins+=ITEM[item].price;city.sales+=ITEM[item].price;city.stock[item]--;
      a.equipment.add(item);break;
    }
  }
}

function restStep(state,a){
  const {city,profile}=state;
  const hpRatio=a.hp/a.hpMax,manaRatio=a.manaMax?a.mana/a.manaMax:1;
  if(hpRatio>=profile.restHp&&manaRatio>=profile.restMana)return false;

  const price=6;
  if(a.coins>=price){
    a.coins-=price;a.spent+=price;city.coins+=price;city.serviceRevenue+=price;
    a.hp=Math.min(a.hpMax,a.hp+Math.ceil(a.hpMax*.45));
    a.mana=Math.min(a.manaMax,a.mana+Math.ceil(a.manaMax*.55));
    a.rests++;
  }else{
    a.hp=Math.min(a.hpMax,a.hp+Math.ceil(a.hpMax*.18));
    a.mana=Math.min(a.manaMax,a.mana+Math.ceil(a.manaMax*.22));
  }
  return true;
}

function commonRisk(a,enemy,count){
  const itemBonus=equipScore(a),levelBonus=(a.level-1)*.08;
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
  win=clamp(win+itemBonus*.0015+levelBonus*.08,.60,.999);
  return {meanLoss,win};
}

function commonEncounter(state,a,enemy,rng){
  const {city}=state;
  const count=enemy==='wolf'?(rng()<.60?1:(rng()<.75?2:3)):(rng()<.80?1:2);
  const {meanLoss,win}=commonRisk(a,enemy,count);
  a.hp=Math.max(0,a.hp-Math.ceil(a.hpMax*meanLoss*(.65+rng()*.70)));
  a.mana=Math.max(0,a.mana-Math.ceil(a.manaMax*({warrior:.10,explorer:.22,healer:.26,mage:.30}[a.cls])*(.65+rng()*.70)));
  a.fights++;

  const won=rng()<win&&a.hp>0;
  if(!won||a.hp<=0){a.hp=0;loseXpOnDown(a);return false;}

  gainXp(a,(enemy==='wolf'?10:14)*count);

  if(rng()<state.profile.paidMission){
    const reward=Math.round((enemy==='wolf'?6:8)*count*state.profile.missionBias);
    if(city.coins>=reward){
      city.coins-=reward;city.missionPaid+=reward;a.coins+=reward;a.earned+=reward;
    }
    city.missionsCompleted++;city.dev+=.22;
  }else{
    a.earned+=(enemy==='wolf'?randInt(rng,2,5):randInt(rng,3,6))*count;
  }

  city.presence[enemy]=Math.max(0,city.presence[enemy]-(enemy==='wolf'?3:4)*count);
  return true;
}

const groupPower=group=>group.reduce((s,a)=>s+a.attack*2+a.defense*2+a.hpMax*.08+a.initiative+a.manaMax*.04+equipScore(a),0);

function groupEncounter(state,group,kind,rng){
  const {city}=state;
  const prepared=group.reduce((s,a)=>s+equipScore(a),0),levelAvg=mean(group.map(a=>a.level));
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

  const won=rng()<win;
  for(const a of group){
    const individual=clamp(hpLossMean*(.72+rng()*.56),0,.98);
    a.hp=Math.max(0,a.hp-Math.ceil(a.hpMax*individual));
    a.mana=Math.max(0,a.mana-Math.ceil(a.manaMax*manaUse*(.75+rng()*.35)));
    a.fights++;
    if(rng()<downChance/group.length||(!won&&rng()<.55)){a.hp=0;loseXpOnDown(a);}
  }
  if(!won)return false;

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

function threatStep(state,rng){
  const {city,adv}=state;
  city.presence.wolf=clamp(city.presence.wolf+3,0,100);
  city.presence.boar=clamp(city.presence.boar+2,0,100);

  if(city.level>=2){
    const p=ALPHA_CHANCE[presenceBand(city.presence.wolf)]+city.alphaPity;
    if(rng()<p){
      city.alphaSeen++;city.alphaPity=0;
      const group=adv.filter(a=>a.hp>0).sort((a,b)=>groupPower([b])-groupPower([a])).slice(0,3);
      if(group.length>=2)groupEncounter(state,group,'alpha',rng);
    }else city.alphaPity=clamp(city.alphaPity+.002,0,.03);
  }

  if(city.level>=3){
    const p=BOSS_CHANCE[presenceBand(city.presence.boar)]+city.bossPity;
    if(rng()<p){
      city.bossSeen++;city.bossPity=0;
      const group=adv.filter(a=>a.hp>0).sort((a,b)=>groupPower([b])-groupPower([a])).slice(0,3);
      if(group.length===3)groupEncounter(state,group,'boss',rng);
    }else city.bossPity=clamp(city.bossPity+.001,0,.015);
  }
}

function adventurerStep(state,rng){
  const {city,adv,profile}=state;
  for(const a of adv){
    if(a.hp<=0){
      const price=8;
      if(a.coins>=price){a.coins-=price;a.spent+=price;city.coins+=price;city.serviceRevenue+=price;}
      a.hp=Math.ceil(a.hpMax*.45);a.mana=Math.ceil(a.manaMax*.50);a.rests++;continue;
    }
    if(restStep(state,a)||rng()>profile.adv)continue;
    const enemy=city.presence.boar>city.presence.wolf&&rng()<.55?'boar':(rng()<.62?'wolf':'boar');
    commonEncounter(state,a,enemy,rng);
  }
}

function runCity(seed,profileKey){
  const rng=mulberry32(seed),profile=PROFILES[profileKey],state=initialState(rng,profile);
  for(let minute=TICK_MINUTES;minute<=MAX_MINUTES;minute+=TICK_MINUTES){
    workerStep(state,rng);craftStep(state,rng);maybeBuildTextile(state,minute);buyStep(state,rng);
    adventurerStep(state,rng);threatStep(state,rng);maybeLevelCity(state,minute,rng);
  }

  const {city,adv}=state,earned=adv.reduce((s,a)=>s+a.earned,0),spent=adv.reduce((s,a)=>s+a.spent,0);
  return {
    profile:profileKey,level:city.level,level2At:city.level2At,level3At:city.level3At,textileAt:city.textileAt,
    cityCoins:city.coins,cityDev:city.dev,advCount:adv.length,
    foundersLevelMean:mean(adv.slice(0,3).map(a=>a.level)),
    foundersLevelAtCity3:city.foundersLevelAtCity3,
    foundersAtLeast2AtCity3:city.foundersAtLeast2AtCity3,
    totalDowns:adv.reduce((s,a)=>s+a.downs,0),
    totalXpLost:adv.reduce((s,a)=>s+a.xpLost,0),
    rests:adv.reduce((s,a)=>s+a.rests,0),
    earnings:earned,spending:spent,
    reinvestRate:earned?spent/earned:0,
    spendShareOfAvailable:(earned+adv.length*65)>0?spent/(earned+adv.length*65):0,
    missionPaid:city.missionPaid,sales:city.sales,serviceRevenue:city.serviceRevenue,
    blockedPurchases:city.blockedPurchases,
    alphaSeen:city.alphaSeen,alphaDefeated:city.alphaDefeated,bossSeen:city.bossSeen,bossDefeated:city.bossDefeated,
    wolfPresence:city.presence.wolf,boarPresence:city.presence.boar,
    missionsCompleted:city.missionsCompleted,workerOutings:city.workerOutings,
    produced:Object.values(city.produced).reduce((a,b)=>a+b,0)
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
    restsMean:mean(rows.map(r=>r.rests)),reinvestRate:mean(rows.map(r=>r.reinvestRate)),
    spendShareOfAvailable:mean(rows.map(r=>r.spendShareOfAvailable)),
    cityCoinsMean:mean(rows.map(r=>r.cityCoins)),blockedPurchasesMean:mean(rows.map(r=>r.blockedPurchases)),
    alphaSeenRate:rows.filter(r=>r.alphaSeen>0).length/rows.length,
    bossSeenRate:rows.filter(r=>r.bossSeen>0).length/rows.length,
    bossDefeatRate:rows.filter(r=>r.bossDefeated>0).length/rows.length,
    wolfPresenceMean:mean(rows.map(r=>r.wolfPresence)),boarPresenceMean:mean(rows.map(r=>r.boarPresence)),
    missionsMean:mean(rows.map(r=>r.missionsCompleted)),workerOutingsMean:mean(rows.map(r=>r.workerOutings)),
    productionMean:mean(rows.map(r=>r.produced))
  };
}

module.exports={runCity,summarize,PROFILES,mean,median};
