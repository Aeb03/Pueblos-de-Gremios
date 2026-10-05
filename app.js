const APP_VERSION='0.3.0';
const SAVE_KEY='pueblos-gremios-save-v0.2.0';

const EXPEDITION_DURATION_MS=30_000;
const CRAFT_DURATION_MS=20_000;
const MINING_XP_STEP=100;
const SMITHING_XP_STEP=100;
const CRAFT_IRON_COST=5;
const CRAFT_SMITHING_XP=40;
const SMITHY_UPGRADE_COIN_COST=100;
const SMITHY_UPGRADE_STONE_COST=10;
const SMITHY_UPGRADE_CRAFTED_REQUIRED=3;
const SMITHY_UPGRADE_PRESTIGE_REWARD=20;

const titles={
  city:'Villa del Roble',
  workers:'Trabajadores',
  smithy:'Herrería',
  expedition:'Expedición',
  kingdom:'Reino de Ardel',
  inventory:'Inventario',
  menu:'Menú'
};

const screens=[...document.querySelectorAll('.screen')];
const nav=[...document.querySelectorAll('.nav-btn')];
const title=document.getElementById('screenTitle');

const defaultState=()=>({
  version:APP_VERSION,
  city:{prestige:120},
  resources:{coins:1240,wood:86,iron:42,stone:0},
  inventory:{pickaxeHeads:0},
  workers:{
    mara:{miningXp:0},
    borin:{smithingXp:0}
  },
  buildings:{
    smithy:{level:1,craftedCount:0}
  },
  activeExpedition:null,
  activeCraft:null,
  lastMessage:'',
  lastSmithyMessage:''
});

function loadState(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return defaultState();

    const saved=JSON.parse(raw);
    const base=defaultState();

    return {
      ...base,
      ...saved,
      version:APP_VERSION,
      city:{...base.city,...(saved.city||{})},
      resources:{...base.resources,...(saved.resources||{})},
      inventory:{...base.inventory,...(saved.inventory||{})},
      workers:{
        ...base.workers,
        ...(saved.workers||{}),
        mara:{...base.workers.mara,...(saved.workers?.mara||{})},
        borin:{...base.workers.borin,...(saved.workers?.borin||{})}
      },
      buildings:{
        ...base.buildings,
        ...(saved.buildings||{}),
        smithy:{...base.buildings.smithy,...(saved.buildings?.smithy||{})}
      }
    };
  }catch{
    return defaultState();
  }
}

let state=loadState();

function saveState(){
  state.version=APP_VERSION;
  localStorage.setItem(SAVE_KEY,JSON.stringify(state));
}

function showScreen(name){
  screens.forEach(s=>s.classList.toggle('is-active',s.dataset.screen===name));
  const navTarget=name==='smithy'?'city':name;
  nav.forEach(b=>b.classList.toggle('is-active',b.dataset.target===navTarget));
  title.textContent=titles[name]||'Pueblos de Gremios';
  window.scrollTo({top:0,behavior:'smooth'});
  render();
}

nav.forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.target)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.go)));

const dialog=document.getElementById('buildingDialog');
const buildingName=document.getElementById('buildingName');
const buildingCopy=document.getElementById('buildingCopy');
const buildingResources=document.getElementById('buildingResources');
const buildingResourceEmpty=document.getElementById('buildingResourceEmpty');
let currentBuilding='';

const buildingInfo={
  Ayuntamiento:{
    copy:'Centro administrativo del asentamiento. Aquí se gestionará el crecimiento y el prestigio.',
    resources:[],
    empty:'No usa materiales productivos directos.'
  },
  Taberna:{
    copy:'Atención de aventureros, cocina, comida, bebida y rumores.',
    resources:[],
    empty:'Los alimentos, bebidas e ingredientes aparecerán aquí cuando incorporemos la producción de Taberna.'
  },
  Carpintería:{
    copy:'Madera, muebles, herramientas y componentes para otros edificios.',
    resources:[{icon:'🪵',label:'Madera',key:'wood'}],
    empty:''
  },
  Posada:{
    copy:'Alojamiento para aventureros, descanso y servicios de hospedaje.',
    resources:[],
    empty:'La Posada mostrará aquí ocupación y suministros cuando incorporemos su sistema.'
  }
};

function renderBuildingResources(name){
  const info=buildingInfo[name]||{resources:[],empty:''};
  buildingResources.replaceChildren();

  info.resources.forEach(resource=>{
    const chip=document.createElement('div');
    chip.className='building-resource-chip';

    const label=document.createElement('span');
    label.textContent=`${resource.icon} ${resource.label}`;

    const value=document.createElement('strong');
    value.textContent=formatNumber(state.resources[resource.key]||0);

    chip.append(label,value);
    buildingResources.append(chip);
  });

  buildingResourceEmpty.textContent=info.resources.length?'':info.empty;
  buildingResourceEmpty.hidden=info.resources.length>0||!info.empty;
}

document.querySelectorAll('[data-building]').forEach(b=>b.addEventListener('click',()=>{
  const n=b.dataset.building;

  if(n==='Herrería'){
    showScreen('smithy');
    return;
  }

  currentBuilding=n;
  buildingName.textContent=n;
  buildingCopy.textContent=buildingInfo[n]?.copy||'Gestión del edificio.';
  renderBuildingResources(n);
  dialog.showModal();
}));

const els={
  coins:document.getElementById('coinsValue'),

  cityPrestige:document.getElementById('cityPrestige'),
  cityPrestigeProgress:document.getElementById('cityPrestigeProgress'),
  smithyLevelCity:document.getElementById('smithyLevelCity'),

  inventoryCoins:document.getElementById('inventoryCoins'),
  inventoryWood:document.getElementById('inventoryWood'),
  inventoryIron:document.getElementById('inventoryIron'),
  inventoryStone:document.getElementById('inventoryStone'),
  inventoryPickaxeHeads:document.getElementById('inventoryPickaxeHeads'),

  borinProfessionLevel:document.getElementById('borinProfessionLevel'),
  borinSmithingLevel:document.getElementById('borinSmithingLevel'),
  borinSmithingXp:document.getElementById('borinSmithingXp'),
  borinNextXp:document.getElementById('borinNextXp'),
  borinXpProgress:document.getElementById('borinXpProgress'),
  borinState:document.getElementById('borinState'),

  maraProfessionLevel:document.getElementById('maraProfessionLevel'),
  maraMiningLevel:document.getElementById('maraMiningLevel'),
  maraMiningXp:document.getElementById('maraMiningXp'),
  maraNextXp:document.getElementById('maraNextXp'),
  maraXpProgress:document.getElementById('maraXpProgress'),
  maraState:document.getElementById('maraState'),

  smithyLevelHero:document.getElementById('smithyLevelHero'),
  smithyIron:document.getElementById('smithyIron'),
  smithyStone:document.getElementById('smithyStone'),
  smithyBorinLevel:document.getElementById('smithyBorinLevel'),
  smithyBorinXp:document.getElementById('smithyBorinXp'),
  smithyBorinNextXp:document.getElementById('smithyBorinNextXp'),
  smithyBorinProgress:document.getElementById('smithyBorinProgress'),
  smithyBorinState:document.getElementById('smithyBorinState'),
  craftStatus:document.getElementById('craftStatus'),
  craftProgress:document.getElementById('craftProgress'),
  craftCountdown:document.getElementById('craftCountdown'),
  startCraft:document.getElementById('startCraft'),
  smithyFeedback:document.getElementById('smithyFeedback'),
  smithyPickaxeHeads:document.getElementById('smithyPickaxeHeads'),

  smithyUpgradeTitle:document.getElementById('smithyUpgradeTitle'),
  smithyUpgradeCopy:document.getElementById('smithyUpgradeCopy'),
  reqSmithing:document.getElementById('reqSmithing'),
  reqCrafted:document.getElementById('reqCrafted'),
  reqStone:document.getElementById('reqStone'),
  reqCoins:document.getElementById('reqCoins'),
  upgradeSmithy:document.getElementById('upgradeSmithy'),
  upgradeFeedback:document.getElementById('upgradeFeedback'),

  expeditionStatus:document.getElementById('expeditionStatus'),
  expeditionProgress:document.getElementById('expeditionProgress'),
  expeditionCountdown:document.getElementById('expeditionCountdown'),
  expeditionFeedback:document.getElementById('expeditionFeedback'),
  startExpedition:document.getElementById('startExpedition')
};

function miningLevel(){
  return Math.floor(state.workers.mara.miningXp/MINING_XP_STEP)+1;
}

function smithingLevel(){
  return Math.floor(state.workers.borin.smithingXp/SMITHING_XP_STEP)+1;
}

function formatNumber(value){
  return Number(value).toLocaleString('es-AR');
}

function formatRemaining(ms){
  const total=Math.max(0,Math.ceil(ms/1000));
  const min=Math.floor(total/60);
  const sec=total%60;
  return min>0?`${min}:${String(sec).padStart(2,'0')}`:`${sec} s`;
}

function createActionId(){
  if(globalThis.crypto?.randomUUID)return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function rollReward(){
  return {
    iron:4+Math.floor(Math.random()*4),
    stone:2+Math.floor(Math.random()*3),
    miningXp:20
  };
}

function startExpedition(){
  resolveExpiredExpedition();
  if(state.activeExpedition)return;

  const now=Date.now();
  state.activeExpedition={
    id:createActionId(),
    zone:'Cantera del Este',
    worker:'mara',
    startedAt:now,
    endsAt:now+EXPEDITION_DURATION_MS,
    rewards:rollReward()
  };
  state.lastMessage='Mara partió hacia la Cantera del Este.';
  saveState();
  render();
}

function completeExpedition(expedition){
  state.resources.iron+=expedition.rewards.iron;
  state.resources.stone+=expedition.rewards.stone;
  state.workers.mara.miningXp+=expedition.rewards.miningXp;
  state.activeExpedition=null;
  state.lastMessage=`Expedición completada: +${expedition.rewards.iron} hierro, +${expedition.rewards.stone} piedra y +${expedition.rewards.miningXp} XP de Minería.`;
  saveState();
}

function resolveExpiredExpedition(){
  if(!state.activeExpedition)return false;
  if(Date.now()<state.activeExpedition.endsAt)return false;
  const completed={...state.activeExpedition,rewards:{...state.activeExpedition.rewards}};
  completeExpedition(completed);
  return true;
}

function startCraft(){
  resolveExpiredCraft();

  if(state.activeCraft)return;

  if(state.resources.iron<CRAFT_IRON_COST){
    state.lastSmithyMessage=`Faltan ${CRAFT_IRON_COST-state.resources.iron} de hierro para iniciar la fabricación.`;
    render();
    return;
  }

  state.resources.iron-=CRAFT_IRON_COST;
  const now=Date.now();

  state.activeCraft={
    id:createActionId(),
    recipe:'pickaxeHead',
    worker:'borin',
    startedAt:now,
    endsAt:now+CRAFT_DURATION_MS,
    result:{pickaxeHeads:1,smithingXp:CRAFT_SMITHING_XP}
  };

  state.lastSmithyMessage='Borin comenzó a forjar una cabeza de pico.';
  saveState();
  render();
}

function completeCraft(craft){
  state.inventory.pickaxeHeads+=craft.result.pickaxeHeads;
  state.workers.borin.smithingXp+=craft.result.smithingXp;
  state.buildings.smithy.craftedCount+=craft.result.pickaxeHeads;
  state.activeCraft=null;
  state.lastSmithyMessage=`Fabricación completada: +1 cabeza de pico y +${craft.result.smithingXp} XP de Herrería.`;
  saveState();
}

function resolveExpiredCraft(){
  if(!state.activeCraft)return false;
  if(Date.now()<state.activeCraft.endsAt)return false;
  const completed={
    ...state.activeCraft,
    result:{...state.activeCraft.result}
  };
  completeCraft(completed);
  return true;
}

function smithyUpgradeRequirements(){
  return {
    skill:smithingLevel()>=2,
    crafted:state.buildings.smithy.craftedCount>=SMITHY_UPGRADE_CRAFTED_REQUIRED,
    stone:state.resources.stone>=SMITHY_UPGRADE_STONE_COST,
    coins:state.resources.coins>=SMITHY_UPGRADE_COIN_COST
  };
}

function canUpgradeSmithy(){
  if(state.buildings.smithy.level>=2)return false;
  if(state.activeCraft)return false;
  return Object.values(smithyUpgradeRequirements()).every(Boolean);
}

function upgradeSmithy(){
  resolveExpiredCraft();

  if(state.buildings.smithy.level>=2){
    state.lastSmithyMessage='La Herrería ya alcanzó el nivel disponible en esta versión.';
    render();
    return;
  }

  if(!canUpgradeSmithy()){
    state.lastSmithyMessage=state.activeCraft
      ?'Borin debe terminar la fabricación antes de mejorar la Herrería.'
      :'Todavía faltan requisitos para mejorar la Herrería.';
    render();
    return;
  }

  state.resources.coins-=SMITHY_UPGRADE_COIN_COST;
  state.resources.stone-=SMITHY_UPGRADE_STONE_COST;
  state.buildings.smithy.level=2;
  state.city.prestige+=SMITHY_UPGRADE_PRESTIGE_REWARD;
  state.lastSmithyMessage=`Herrería mejorada a Nv. 2. La ciudad ganó +${SMITHY_UPGRADE_PRESTIGE_REWARD} Prestigio.`;
  saveState();
  render();
}

function renderSkillProgress(xp,step,levelEls){
  const level=Math.floor(xp/step)+1;
  const levelBase=(level-1)*step;
  const nextLevelXp=level*step;
  const xpIntoLevel=xp-levelBase;

  levelEls.level.forEach(el=>el.textContent=level);
  levelEls.xp.forEach(el=>el.textContent=xp);
  levelEls.next.forEach(el=>el.textContent=nextLevelXp);
  levelEls.progress.forEach(el=>{
    el.max=step;
    el.value=xpIntoLevel;
  });
}

function setRequirementState(key,met){
  const row=document.querySelector(`[data-smithy-requirement="${key}"]`);
  if(row)row.classList.toggle('is-met',met);
}

function render(){
  resolveExpiredExpedition();
  resolveExpiredCraft();

  els.coins.textContent=formatNumber(state.resources.coins);

  els.cityPrestige.textContent=formatNumber(state.city.prestige);
  els.cityPrestigeProgress.value=state.city.prestige;
  els.smithyLevelCity.textContent=state.buildings.smithy.level;

  els.inventoryCoins.textContent=formatNumber(state.resources.coins);
  els.inventoryWood.textContent=formatNumber(state.resources.wood);
  els.inventoryIron.textContent=formatNumber(state.resources.iron);
  els.inventoryStone.textContent=formatNumber(state.resources.stone);
  els.inventoryPickaxeHeads.textContent=formatNumber(state.inventory.pickaxeHeads);

  if(dialog.open&&currentBuilding)renderBuildingResources(currentBuilding);

  renderSkillProgress(
    state.workers.mara.miningXp,
    MINING_XP_STEP,
    {
      level:[els.maraProfessionLevel,els.maraMiningLevel],
      xp:[els.maraMiningXp],
      next:[els.maraNextXp],
      progress:[els.maraXpProgress]
    }
  );

  renderSkillProgress(
    state.workers.borin.smithingXp,
    SMITHING_XP_STEP,
    {
      level:[els.borinProfessionLevel,els.borinSmithingLevel,els.smithyBorinLevel],
      xp:[els.borinSmithingXp,els.smithyBorinXp],
      next:[els.borinNextXp,els.smithyBorinNextXp],
      progress:[els.borinXpProgress,els.smithyBorinProgress]
    }
  );

  const exp=state.activeExpedition;
  if(exp){
    const now=Date.now();
    const elapsed=now-exp.startedAt;
    const duration=exp.endsAt-exp.startedAt;
    const progress=Math.max(0,Math.min(100,(elapsed/duration)*100));

    els.maraState.textContent='En expedición';
    els.maraState.classList.add('is-busy');
    els.expeditionStatus.textContent='En curso';
    els.expeditionProgress.value=progress;
    els.expeditionCountdown.textContent=`Regresa en ${formatRemaining(exp.endsAt-now)}`;
    els.startExpedition.disabled=true;
    els.startExpedition.textContent='Mara está en expedición';
  }else{
    els.maraState.textContent='Disponible';
    els.maraState.classList.remove('is-busy');
    els.expeditionStatus.textContent='Lista para partir';
    els.expeditionProgress.value=0;
    els.expeditionCountdown.textContent='';
    els.startExpedition.disabled=false;
    els.startExpedition.textContent='Iniciar expedición';
  }

  els.expeditionFeedback.textContent=state.lastMessage||'El progreso se guarda automáticamente en este dispositivo.';

  els.smithyLevelHero.textContent=state.buildings.smithy.level;
  els.smithyIron.textContent=formatNumber(state.resources.iron);
  els.smithyStone.textContent=formatNumber(state.resources.stone);
  els.smithyPickaxeHeads.textContent=formatNumber(state.inventory.pickaxeHeads);

  const craft=state.activeCraft;
  if(craft){
    const now=Date.now();
    const elapsed=now-craft.startedAt;
    const duration=craft.endsAt-craft.startedAt;
    const progress=Math.max(0,Math.min(100,(elapsed/duration)*100));

    els.borinState.textContent='Trabajando';
    els.borinState.classList.add('is-busy');
    els.smithyBorinState.textContent='Forjando';
    els.smithyBorinState.classList.add('is-busy');
    els.craftStatus.textContent='En fabricación';
    els.craftProgress.value=progress;
    els.craftCountdown.textContent=`Termina en ${formatRemaining(craft.endsAt-now)}`;
    els.startCraft.disabled=true;
    els.startCraft.textContent='Borin está forjando';
  }else{
    els.borinState.textContent='Disponible';
    els.borinState.classList.remove('is-busy');
    els.smithyBorinState.textContent='Disponible';
    els.smithyBorinState.classList.remove('is-busy');
    els.craftStatus.textContent='Lista para fabricar';
    els.craftProgress.value=0;
    els.craftCountdown.textContent='';

    const enoughIron=state.resources.iron>=CRAFT_IRON_COST;
    els.startCraft.disabled=!enoughIron;
    els.startCraft.textContent=enoughIron
      ?'Fabricar cabeza de pico'
      :`Faltan ${CRAFT_IRON_COST-state.resources.iron} hierro`;
  }

  const requirements=smithyUpgradeRequirements();
  const smithyAlreadyUpgraded=state.buildings.smithy.level>=2;

  if(smithyAlreadyUpgraded){
    els.reqSmithing.textContent='✓';
    els.reqCrafted.textContent='✓';
    els.reqStone.textContent='✓';
    els.reqCoins.textContent='✓';
    ['skill','crafted','stone','coins'].forEach(key=>setRequirementState(key,true));
  }else{
    els.reqSmithing.textContent=`${Math.min(smithingLevel(),2)}/2`;
    els.reqCrafted.textContent=`${Math.min(state.buildings.smithy.craftedCount,SMITHY_UPGRADE_CRAFTED_REQUIRED)}/${SMITHY_UPGRADE_CRAFTED_REQUIRED}`;
    els.reqStone.textContent=`${Math.min(state.resources.stone,SMITHY_UPGRADE_STONE_COST)}/${SMITHY_UPGRADE_STONE_COST}`;
    els.reqCoins.textContent=`${Math.min(state.resources.coins,SMITHY_UPGRADE_COIN_COST)}/${SMITHY_UPGRADE_COIN_COST}`;
    Object.entries(requirements).forEach(([key,met])=>setRequirementState(key,met));
  }

  if(smithyAlreadyUpgraded){
    els.smithyUpgradeTitle.textContent='Herrería Nv. 2 alcanzada';
    els.smithyUpgradeCopy.textContent='La próxima mejora se habilitará cuando ampliemos la progresión del edificio.';
    els.upgradeSmithy.disabled=true;
    els.upgradeSmithy.textContent='Nivel máximo de esta versión';
    els.upgradeFeedback.textContent=`Prestigio aportado por esta mejora: +${SMITHY_UPGRADE_PRESTIGE_REWARD}.`;
  }else{
    els.smithyUpgradeTitle.textContent='Mejorar Herrería a Nv. 2';
    els.smithyUpgradeCopy.textContent='La mejora representa el crecimiento real del negocio y aumenta el Prestigio de la ciudad.';
    els.upgradeSmithy.disabled=!canUpgradeSmithy();
    els.upgradeSmithy.textContent=state.activeCraft?'Borin está trabajando':'Mejorar Herrería';
    els.upgradeFeedback.textContent=state.lastSmithyMessage||'Completá los requisitos para habilitar la mejora.';
  }

  els.smithyFeedback.textContent=state.lastSmithyMessage||'El hierro se descuenta al iniciar el trabajo y el resultado queda guardado aunque cierres la app.';
}

els.startExpedition.addEventListener('click',startExpedition);
els.startCraft.addEventListener('click',startCraft);
els.upgradeSmithy.addEventListener('click',upgradeSmithy);

setInterval(render,500);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
window.addEventListener('focus',render);

let deferredPrompt=null;
const installBtn=document.getElementById('installBtn');
const isStandalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;

if(isStandalone){
  installBtn.innerHTML='✅<span>PWA instalada</span>';
  installBtn.disabled=true;
}else{
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredPrompt=e;
    installBtn.disabled=false;
  });

  installBtn.addEventListener('click',async()=>{
    if(!deferredPrompt){
      installBtn.querySelector('span').textContent='Usá “Instalar app” del navegador';
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt=null;
  });
}

if('serviceWorker' in navigator){
  let refreshing=false;

  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(refreshing)return;
    refreshing=true;
    window.location.reload();
  });

  window.addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./sw.js?v=0.3.0',{updateViaCache:'none'});
      await reg.update();
    }catch{}
  });
}

render();
