const APP_VERSION='0.5.0';
const SAVE_KEY='pueblos-gremios-save-v0.2.0';

const EXPEDITION_DURATION_MS=30_000;
const CRAFT_DURATION_MS=20_000;
const ASSEMBLY_DURATION_MS=15_000;
const CARPENTRY_DURATION_MS=20_000;

const MINING_XP_STEP=100;
const SMITHING_XP_STEP=100;
const CARPENTRY_XP_STEP=100;

const CRAFT_IRON_COST=5;
const CRAFT_SMITHING_XP=40;
const CRAFT_STAMINA_COST=15;

const ASSEMBLY_SMITHING_XP=20;
const ASSEMBLY_STAMINA_COST=10;

const HANDLE_WOOD_COST=3;
const HANDLE_CARPENTRY_XP=40;
const HANDLE_STAMINA_COST=15;

const SMITHY_UPGRADE_COIN_COST=100;
const SMITHY_UPGRADE_STONE_COST=10;
const SMITHY_UPGRADE_CRAFTED_REQUIRED=3;
const SMITHY_UPGRADE_PRESTIGE_REWARD=20;

const STAMINA_MAX=100;
const EXPEDITION_STAMINA_COST=20;
const STAMINA_TICK_MS=10_000;
const PASSIVE_STAMINA_PER_TICK=1;
const INN_STAMINA_PER_TICK=5;

const HARD_VEIN_CHANCE=0.15;
const HARD_VEIN_IRON_MIN=5;
const HARD_VEIN_IRON_MAX=8;

const titles={
  city:'Villa del Roble',
  workers:'Trabajadores',
  carpenter:'Carpintería',
  smithy:'Herrería',
  inn:'Posada',
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
  inventory:{
    pickaxeHeads:0,
    woodenHandles:0,
    ironPickaxes:0
  },
  workers:{
    mara:{
      miningXp:0,
      stamina:STAMINA_MAX,
      staminaUpdatedAt:Date.now(),
      restingAtInn:false,
      equippedPickaxe:null
    },
    borin:{
      smithingXp:0,
      stamina:STAMINA_MAX,
      staminaUpdatedAt:Date.now(),
      restingAtInn:false
    },
    eldon:{
      carpentryXp:0,
      stamina:STAMINA_MAX,
      staminaUpdatedAt:Date.now(),
      restingAtInn:false
    }
  },
  buildings:{
    smithy:{level:1,craftedCount:0}
  },
  activeExpedition:null,
  activeCraft:null,
  activeCarpentry:null,
  lastMessage:'',
  lastSmithyMessage:'',
  lastCarpentryMessage:'',
  lastInnMessage:''
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
        borin:{...base.workers.borin,...(saved.workers?.borin||{})},
        eldon:{...base.workers.eldon,...(saved.workers?.eldon||{})}
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
  const navTarget=['smithy','carpenter','inn'].includes(name)?'city':name;
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
  Posada:{
    copy:'Alojamiento para aventureros, descanso y servicios de hospedaje.',
    resources:[],
    empty:'Los trabajadores pueden descansar aquí para recuperar Resistencia más rápido.'
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

  if(n==='Carpintería'){
    showScreen('carpenter');
    return;
  }

  if(n==='Posada'){
    showScreen('inn');
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
  inventoryHandles:document.getElementById('inventoryHandles'),
  inventoryIronPickaxes:document.getElementById('inventoryIronPickaxes'),
  inventoryMaraTool:document.getElementById('inventoryMaraTool'),

  borinProfessionLevel:document.getElementById('borinProfessionLevel'),
  borinSmithingLevel:document.getElementById('borinSmithingLevel'),
  borinSmithingXp:document.getElementById('borinSmithingXp'),
  borinNextXp:document.getElementById('borinNextXp'),
  borinXpProgress:document.getElementById('borinXpProgress'),
  borinStaminaWorker:document.getElementById('borinStaminaWorker'),
  borinStaminaWorkerProgress:document.getElementById('borinStaminaWorkerProgress'),
  borinState:document.getElementById('borinState'),

  maraProfessionLevel:document.getElementById('maraProfessionLevel'),
  maraMiningLevel:document.getElementById('maraMiningLevel'),
  maraMiningXp:document.getElementById('maraMiningXp'),
  maraNextXp:document.getElementById('maraNextXp'),
  maraXpProgress:document.getElementById('maraXpProgress'),
  maraStaminaWorker:document.getElementById('maraStaminaWorker'),
  maraStaminaWorkerProgress:document.getElementById('maraStaminaWorkerProgress'),
  maraState:document.getElementById('maraState'),

  eldonProfessionLevel:document.getElementById('eldonProfessionLevel'),
  eldonCarpentryLevel:document.getElementById('eldonCarpentryLevel'),
  eldonCarpentryXp:document.getElementById('eldonCarpentryXp'),
  eldonNextXp:document.getElementById('eldonNextXp'),
  eldonXpProgress:document.getElementById('eldonXpProgress'),
  eldonStaminaWorker:document.getElementById('eldonStaminaWorker'),
  eldonStaminaWorkerProgress:document.getElementById('eldonStaminaWorkerProgress'),
  eldonState:document.getElementById('eldonState'),

  carpenterWood:document.getElementById('carpenterWood'),
  carpenterHandles:document.getElementById('carpenterHandles'),
  carpenterEldonLevel:document.getElementById('carpenterEldonLevel'),
  carpenterEldonState:document.getElementById('carpenterEldonState'),
  carpenterEldonXp:document.getElementById('carpenterEldonXp'),
  carpenterEldonNextXp:document.getElementById('carpenterEldonNextXp'),
  carpenterEldonProgress:document.getElementById('carpenterEldonProgress'),
  carpenterEldonStamina:document.getElementById('carpenterEldonStamina'),
  carpenterEldonStaminaProgress:document.getElementById('carpenterEldonStaminaProgress'),
  carpentryStatus:document.getElementById('carpentryStatus'),
  carpentryProgress:document.getElementById('carpentryProgress'),
  carpentryCountdown:document.getElementById('carpentryCountdown'),
  startHandleCraft:document.getElementById('startHandleCraft'),
  carpentryFeedback:document.getElementById('carpentryFeedback'),

  smithyLevelHero:document.getElementById('smithyLevelHero'),
  smithyIron:document.getElementById('smithyIron'),
  smithyStone:document.getElementById('smithyStone'),
  smithyBorinLevel:document.getElementById('smithyBorinLevel'),
  smithyBorinXp:document.getElementById('smithyBorinXp'),
  smithyBorinNextXp:document.getElementById('smithyBorinNextXp'),
  smithyBorinProgress:document.getElementById('smithyBorinProgress'),
  smithyBorinStamina:document.getElementById('smithyBorinStamina'),
  smithyBorinStaminaProgress:document.getElementById('smithyBorinStaminaProgress'),
  smithyBorinState:document.getElementById('smithyBorinState'),
  craftStatus:document.getElementById('craftStatus'),
  craftProgress:document.getElementById('craftProgress'),
  craftCountdown:document.getElementById('craftCountdown'),
  startHeadCraft:document.getElementById('startHeadCraft'),
  startPickaxeAssembly:document.getElementById('startPickaxeAssembly'),
  smithyFeedback:document.getElementById('smithyFeedback'),
  smithyPickaxeHeads:document.getElementById('smithyPickaxeHeads'),
  smithyHandles:document.getElementById('smithyHandles'),
  smithyIronPickaxes:document.getElementById('smithyIronPickaxes'),

  smithyUpgradeTitle:document.getElementById('smithyUpgradeTitle'),
  smithyUpgradeCopy:document.getElementById('smithyUpgradeCopy'),
  reqSmithing:document.getElementById('reqSmithing'),
  reqCrafted:document.getElementById('reqCrafted'),
  reqStone:document.getElementById('reqStone'),
  reqCoins:document.getElementById('reqCoins'),
  upgradeSmithy:document.getElementById('upgradeSmithy'),
  upgradeFeedback:document.getElementById('upgradeFeedback'),

  innMaraLevel:document.getElementById('innMaraLevel'),
  innMaraState:document.getElementById('innMaraState'),
  innMaraStamina:document.getElementById('innMaraStamina'),
  innMaraStaminaProgress:document.getElementById('innMaraStaminaProgress'),
  toggleMaraInnRest:document.getElementById('toggleMaraInnRest'),
  maraInnFeedback:document.getElementById('maraInnFeedback'),

  innBorinLevel:document.getElementById('innBorinLevel'),
  innBorinState:document.getElementById('innBorinState'),
  innBorinStamina:document.getElementById('innBorinStamina'),
  innBorinStaminaProgress:document.getElementById('innBorinStaminaProgress'),
  toggleBorinInnRest:document.getElementById('toggleBorinInnRest'),
  borinInnFeedback:document.getElementById('borinInnFeedback'),

  innEldonLevel:document.getElementById('innEldonLevel'),
  innEldonState:document.getElementById('innEldonState'),
  innEldonStamina:document.getElementById('innEldonStamina'),
  innEldonStaminaProgress:document.getElementById('innEldonStaminaProgress'),
  toggleEldonInnRest:document.getElementById('toggleEldonInnRest'),
  eldonInnFeedback:document.getElementById('eldonInnFeedback'),

  expeditionStamina:document.getElementById('expeditionStamina'),
  expeditionStaminaProgress:document.getElementById('expeditionStaminaProgress'),
  expeditionTool:document.getElementById('expeditionTool'),
  hardVeinChance:document.getElementById('hardVeinChance'),
  expeditionPickaxes:document.getElementById('expeditionPickaxes'),
  equipIronPickaxe:document.getElementById('equipIronPickaxe'),
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

function carpentryLevel(){
  return Math.floor(state.workers.eldon.carpentryXp/CARPENTRY_XP_STEP)+1;
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

function workerName(workerKey){
  return {mara:'Mara',borin:'Borin',eldon:'Eldon'}[workerKey]||workerKey;
}

function hasIronPickaxeEquipped(){
  return state.workers.mara.equippedPickaxe==='ironPickaxe';
}

function rollReward(){
  const hardVein=hasIronPickaxeEquipped()&&Math.random()<HARD_VEIN_CHANCE;
  const hardVeinIron=hardVein
    ?HARD_VEIN_IRON_MIN+Math.floor(Math.random()*(HARD_VEIN_IRON_MAX-HARD_VEIN_IRON_MIN+1))
    :0;

  return {
    iron:4+Math.floor(Math.random()*4),
    stone:2+Math.floor(Math.random()*3),
    miningXp:20,
    hardVein,
    hardVeinIron
  };
}

function isWorkerBusy(workerKey){
  return (workerKey==='mara'&&Boolean(state.activeExpedition))
    ||(workerKey==='borin'&&Boolean(state.activeCraft))
    ||(workerKey==='eldon'&&Boolean(state.activeCarpentry));
}

function syncWorkerStamina(workerKey){
  const worker=state.workers[workerKey];
  if(!worker||isWorkerBusy(workerKey))return false;

  const now=Date.now();
  const updatedAt=Number(worker.staminaUpdatedAt)||now;
  const name=workerName(workerKey);

  if(worker.stamina>=STAMINA_MAX){
    const leftInn=Boolean(worker.restingAtInn);
    worker.stamina=STAMINA_MAX;
    worker.staminaUpdatedAt=now;

    if(leftInn){
      worker.restingAtInn=false;
      state.lastInnMessage=`${name} terminó de descansar, recuperó 100/100 de Resistencia y salió automáticamente de la Posada.`;
      saveState();
      return true;
    }

    return false;
  }

  const ticks=Math.floor(Math.max(0,now-updatedAt)/STAMINA_TICK_MS);
  if(ticks<=0)return false;

  const gainPerTick=worker.restingAtInn?INN_STAMINA_PER_TICK:PASSIVE_STAMINA_PER_TICK;
  const previous=worker.stamina;
  const wasResting=Boolean(worker.restingAtInn);

  worker.stamina=Math.min(STAMINA_MAX,worker.stamina+(ticks*gainPerTick));
  worker.staminaUpdatedAt=worker.stamina>=STAMINA_MAX
    ?now
    :updatedAt+(ticks*STAMINA_TICK_MS);

  if(worker.stamina>=STAMINA_MAX&&wasResting){
    worker.restingAtInn=false;
    state.lastInnMessage=`${name} terminó de descansar, recuperó 100/100 de Resistencia y salió automáticamente de la Posada.`;
  }

  if(worker.stamina!==previous||worker.restingAtInn!==wasResting){
    saveState();
    return true;
  }

  return false;
}

function syncAllWorkerStamina(){
  syncWorkerStamina('mara');
  syncWorkerStamina('borin');
  syncWorkerStamina('eldon');
}

function toggleInnRest(workerKey){
  resolveExpiredExpedition();
  resolveExpiredCraft();
  resolveExpiredCarpentry();
  syncWorkerStamina(workerKey);

  const worker=state.workers[workerKey];
  const name=workerName(workerKey);

  if(isWorkerBusy(workerKey)){
    state.lastInnMessage=`${name} está trabajando y no puede descansar todavía.`;
    render();
    return;
  }

  if(worker.restingAtInn){
    worker.restingAtInn=false;
    worker.staminaUpdatedAt=Date.now();
    state.lastInnMessage=`${name} dejó la Posada. Seguirá recuperando Resistencia lentamente mientras esté libre.`;
  }else{
    if(worker.stamina>=STAMINA_MAX){
      state.lastInnMessage=`${name} ya tiene la Resistencia completa.`;
      render();
      return;
    }

    worker.restingAtInn=true;
    worker.staminaUpdatedAt=Date.now();
    state.lastInnMessage=`${name} está descansando en la Posada. Su recuperación está acelerada.`;
  }

  saveState();
  render();
}

function startExpedition(){
  resolveExpiredExpedition();
  syncWorkerStamina('mara');
  if(state.activeExpedition)return;

  const mara=state.workers.mara;

  if(mara.restingAtInn){
    state.lastMessage='Mara está descansando en la Posada. Terminá su descanso antes de enviarla.';
    render();
    return;
  }

  if(mara.stamina<EXPEDITION_STAMINA_COST){
    state.lastMessage=`Mara necesita ${EXPEDITION_STAMINA_COST} de Resistencia para esta expedición.`;
    render();
    return;
  }

  const now=Date.now();
  mara.stamina-=EXPEDITION_STAMINA_COST;
  mara.staminaUpdatedAt=now;

  state.activeExpedition={
    id:createActionId(),
    zone:'Cantera del Este',
    worker:'mara',
    startedAt:now,
    endsAt:now+EXPEDITION_DURATION_MS,
    toolAtStart:mara.equippedPickaxe,
    rewards:rollReward()
  };

  state.lastMessage=hasIronPickaxeEquipped()
    ?'Mara partió con su Pico de hierro. La Veta dura ya fue sorteada para esta expedición.'
    :'Mara partió sin pico: la Veta dura no puede aparecer.';
  saveState();
  render();
}

function completeExpedition(expedition){
  const extraIron=Number(expedition.rewards?.hardVeinIron)||0;
  const baseIron=Number(expedition.rewards?.iron)||0;
  const stone=Number(expedition.rewards?.stone)||0;
  const miningXp=Number(expedition.rewards?.miningXp)||0;

  state.resources.iron+=baseIron+extraIron;
  state.resources.stone+=stone;
  state.workers.mara.miningXp+=miningXp;
  state.activeExpedition=null;
  state.workers.mara.staminaUpdatedAt=expedition.endsAt||Date.now();

  const special=extraIron>0
    ?` ¡Veta dura encontrada! +${extraIron} hierro adicional.`
    :'';

  state.lastMessage=`Expedición completada: +${baseIron} hierro, +${stone} piedra y +${miningXp} XP de Minería.${special}`;
  saveState();
}

function resolveExpiredExpedition(){
  if(!state.activeExpedition)return false;
  if(Date.now()<state.activeExpedition.endsAt)return false;

  const completed={
    ...state.activeExpedition,
    rewards:{...(state.activeExpedition.rewards||{})}
  };

  completeExpedition(completed);
  return true;
}

function equipIronPickaxe(){
  resolveExpiredExpedition();

  if(hasIronPickaxeEquipped())return;

  if(state.activeExpedition||state.workers.mara.restingAtInn){
    state.lastMessage='Mara debe estar disponible en la ciudad para equiparse.';
    render();
    return;
  }

  if(state.inventory.ironPickaxes<1){
    state.lastMessage='Todavía no hay un Pico de hierro terminado en el inventario.';
    render();
    return;
  }

  state.inventory.ironPickaxes-=1;
  state.workers.mara.equippedPickaxe='ironPickaxe';
  state.lastMessage='Mara equipó el Pico de hierro. La Veta dura ahora tiene 15% de probabilidad en cada expedición.';
  saveState();
  render();
}

function startHandleCraft(){
  resolveExpiredCarpentry();
  syncWorkerStamina('eldon');

  if(state.activeCarpentry)return;

  const eldon=state.workers.eldon;

  if(eldon.restingAtInn){
    state.lastCarpentryMessage='Eldon está descansando en la Posada.';
    render();
    return;
  }

  if(eldon.stamina<HANDLE_STAMINA_COST){
    state.lastCarpentryMessage=`Eldon necesita ${HANDLE_STAMINA_COST} de Resistencia para fabricar el mango.`;
    render();
    return;
  }

  if(state.resources.wood<HANDLE_WOOD_COST){
    state.lastCarpentryMessage=`Faltan ${HANDLE_WOOD_COST-state.resources.wood} de madera.`;
    render();
    return;
  }

  state.resources.wood-=HANDLE_WOOD_COST;
  eldon.stamina-=HANDLE_STAMINA_COST;

  const now=Date.now();
  eldon.staminaUpdatedAt=now;

  state.activeCarpentry={
    id:createActionId(),
    recipe:'woodenHandle',
    worker:'eldon',
    startedAt:now,
    endsAt:now+CARPENTRY_DURATION_MS,
    result:{woodenHandles:1,carpentryXp:HANDLE_CARPENTRY_XP}
  };

  state.lastCarpentryMessage='Eldon comenzó a fabricar un mango de pico.';
  saveState();
  render();
}

function completeCarpentry(job){
  const handles=Number(job.result?.woodenHandles)||0;
  const xp=Number(job.result?.carpentryXp)||0;

  state.inventory.woodenHandles+=handles;
  state.workers.eldon.carpentryXp+=xp;
  state.activeCarpentry=null;
  state.workers.eldon.staminaUpdatedAt=job.endsAt||Date.now();
  state.lastCarpentryMessage=`Carpintería completada: +${handles} mango de pico y +${xp} XP de Carpintería.`;
  saveState();
}

function resolveExpiredCarpentry(){
  if(!state.activeCarpentry)return false;
  if(Date.now()<state.activeCarpentry.endsAt)return false;

  const completed={
    ...state.activeCarpentry,
    result:{...(state.activeCarpentry.result||{})}
  };

  completeCarpentry(completed);
  return true;
}

function startSmithyCraft(recipe){
  resolveExpiredCraft();
  syncWorkerStamina('borin');

  if(state.activeCraft)return;

  const borin=state.workers.borin;

  if(borin.restingAtInn){
    state.lastSmithyMessage='Borin está descansando en la Posada. Terminá su descanso antes de ponerlo a trabajar.';
    render();
    return;
  }

  if(recipe==='pickaxeHead'){
    if(borin.stamina<CRAFT_STAMINA_COST){
      state.lastSmithyMessage=`Borin necesita ${CRAFT_STAMINA_COST} de Resistencia para fabricar esta pieza.`;
      render();
      return;
    }

    if(state.resources.iron<CRAFT_IRON_COST){
      state.lastSmithyMessage=`Faltan ${CRAFT_IRON_COST-state.resources.iron} de hierro para iniciar la fabricación.`;
      render();
      return;
    }

    state.resources.iron-=CRAFT_IRON_COST;
    borin.stamina-=CRAFT_STAMINA_COST;

    const now=Date.now();
    borin.staminaUpdatedAt=now;

    state.activeCraft={
      id:createActionId(),
      recipe:'pickaxeHead',
      label:'Forjando cabeza de pico',
      worker:'borin',
      startedAt:now,
      endsAt:now+CRAFT_DURATION_MS,
      result:{pickaxeHeads:1,smithingXp:CRAFT_SMITHING_XP}
    };

    state.lastSmithyMessage='Borin comenzó a forjar una cabeza de pico.';
  }else if(recipe==='ironPickaxe'){
    if(borin.stamina<ASSEMBLY_STAMINA_COST){
      state.lastSmithyMessage=`Borin necesita ${ASSEMBLY_STAMINA_COST} de Resistencia para ensamblar el pico.`;
      render();
      return;
    }

    if(state.inventory.pickaxeHeads<1||state.inventory.woodenHandles<1){
      state.lastSmithyMessage='Para ensamblar el Pico de hierro hace falta 1 cabeza y 1 mango.';
      render();
      return;
    }

    state.inventory.pickaxeHeads-=1;
    state.inventory.woodenHandles-=1;
    borin.stamina-=ASSEMBLY_STAMINA_COST;

    const now=Date.now();
    borin.staminaUpdatedAt=now;

    state.activeCraft={
      id:createActionId(),
      recipe:'ironPickaxe',
      label:'Ensamblando Pico de hierro',
      worker:'borin',
      startedAt:now,
      endsAt:now+ASSEMBLY_DURATION_MS,
      result:{ironPickaxes:1,smithingXp:ASSEMBLY_SMITHING_XP}
    };

    state.lastSmithyMessage='Borin comenzó a ensamblar el Pico de hierro usando una cabeza y un mango.';
  }

  saveState();
  render();
}

function completeCraft(craft){
  const heads=Number(craft.result?.pickaxeHeads)||0;
  const pickaxes=Number(craft.result?.ironPickaxes)||0;
  const xp=Number(craft.result?.smithingXp)||0;

  state.inventory.pickaxeHeads+=heads;
  state.inventory.ironPickaxes+=pickaxes;
  state.workers.borin.smithingXp+=xp;

  if(heads>0){
    state.buildings.smithy.craftedCount+=heads;
  }

  state.activeCraft=null;
  state.workers.borin.staminaUpdatedAt=craft.endsAt||Date.now();

  if(pickaxes>0){
    state.lastSmithyMessage=`Ensamblaje completado: +${pickaxes} Pico de hierro y +${xp} XP de Herrería.`;
  }else{
    state.lastSmithyMessage=`Fabricación completada: +${heads} cabeza de pico y +${xp} XP de Herrería.`;
  }

  saveState();
}

function resolveExpiredCraft(){
  if(!state.activeCraft)return false;
  if(Date.now()<state.activeCraft.endsAt)return false;

  const completed={
    ...state.activeCraft,
    result:{...(state.activeCraft.result||{})}
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

function renderInnWorker(workerKey,stateEl,buttonEl,feedbackEl){
  const worker=state.workers[workerKey];
  const name=workerName(workerKey);

  if(isWorkerBusy(workerKey)){
    stateEl.textContent=workerKey==='mara'?'En expedición':'Trabajando';
    stateEl.classList.add('is-busy');
    buttonEl.disabled=true;
    buttonEl.textContent=`${name} está trabajando`;
  }else if(worker.restingAtInn){
    stateEl.textContent='Descansando';
    stateEl.classList.add('is-busy');
    buttonEl.disabled=false;
    buttonEl.textContent='Terminar descanso';
  }else{
    stateEl.textContent='Disponible';
    stateEl.classList.remove('is-busy');
    buttonEl.disabled=worker.stamina>=STAMINA_MAX;
    buttonEl.textContent=worker.stamina>=STAMINA_MAX
      ?'Resistencia completa'
      :'Descansar en Posada';
  }

  feedbackEl.textContent=state.lastInnMessage||'Libre: +1 cada 10 s. En Posada: +5 cada 10 s.';
}

function render(){
  resolveExpiredExpedition();
  resolveExpiredCraft();
  resolveExpiredCarpentry();
  syncAllWorkerStamina();

  els.coins.textContent=formatNumber(state.resources.coins);

  els.cityPrestige.textContent=formatNumber(state.city.prestige);
  els.cityPrestigeProgress.value=state.city.prestige;
  els.smithyLevelCity.textContent=state.buildings.smithy.level;

  els.inventoryCoins.textContent=formatNumber(state.resources.coins);
  els.inventoryWood.textContent=formatNumber(state.resources.wood);
  els.inventoryIron.textContent=formatNumber(state.resources.iron);
  els.inventoryStone.textContent=formatNumber(state.resources.stone);
  els.inventoryPickaxeHeads.textContent=formatNumber(state.inventory.pickaxeHeads);
  els.inventoryHandles.textContent=formatNumber(state.inventory.woodenHandles);
  els.inventoryIronPickaxes.textContent=formatNumber(state.inventory.ironPickaxes);
  els.inventoryMaraTool.textContent=hasIronPickaxeEquipped()?'Pico de hierro':'Sin equipar';

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

  renderSkillProgress(
    state.workers.eldon.carpentryXp,
    CARPENTRY_XP_STEP,
    {
      level:[els.eldonProfessionLevel,els.eldonCarpentryLevel,els.carpenterEldonLevel],
      xp:[els.eldonCarpentryXp,els.carpenterEldonXp],
      next:[els.eldonNextXp,els.carpenterEldonNextXp],
      progress:[els.eldonXpProgress,els.carpenterEldonProgress]
    }
  );

  els.maraStaminaWorker.textContent=Math.floor(state.workers.mara.stamina);
  els.maraStaminaWorkerProgress.value=state.workers.mara.stamina;
  els.expeditionStamina.textContent=Math.floor(state.workers.mara.stamina);
  els.expeditionStaminaProgress.value=state.workers.mara.stamina;
  els.innMaraStamina.textContent=Math.floor(state.workers.mara.stamina);
  els.innMaraStaminaProgress.value=state.workers.mara.stamina;
  els.innMaraLevel.textContent=miningLevel();

  els.borinStaminaWorker.textContent=Math.floor(state.workers.borin.stamina);
  els.borinStaminaWorkerProgress.value=state.workers.borin.stamina;
  els.smithyBorinStamina.textContent=Math.floor(state.workers.borin.stamina);
  els.smithyBorinStaminaProgress.value=state.workers.borin.stamina;
  els.innBorinStamina.textContent=Math.floor(state.workers.borin.stamina);
  els.innBorinStaminaProgress.value=state.workers.borin.stamina;
  els.innBorinLevel.textContent=smithingLevel();

  els.eldonStaminaWorker.textContent=Math.floor(state.workers.eldon.stamina);
  els.eldonStaminaWorkerProgress.value=state.workers.eldon.stamina;
  els.carpenterEldonStamina.textContent=Math.floor(state.workers.eldon.stamina);
  els.carpenterEldonStaminaProgress.value=state.workers.eldon.stamina;
  els.innEldonStamina.textContent=Math.floor(state.workers.eldon.stamina);
  els.innEldonStaminaProgress.value=state.workers.eldon.stamina;
  els.innEldonLevel.textContent=carpentryLevel();

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
    const resting=state.workers.mara.restingAtInn;
    const enoughStamina=state.workers.mara.stamina>=EXPEDITION_STAMINA_COST;

    els.maraState.textContent=resting?'Descansando':'Disponible';
    els.maraState.classList.toggle('is-busy',resting);
    els.expeditionStatus.textContent=resting?'En la Posada':'Lista para partir';
    els.expeditionProgress.value=0;
    els.expeditionCountdown.textContent='';

    if(resting){
      els.startExpedition.disabled=true;
      els.startExpedition.textContent='Mara está descansando';
    }else if(!enoughStamina){
      els.startExpedition.disabled=true;
      els.startExpedition.textContent='Falta Resistencia';
    }else{
      els.startExpedition.disabled=false;
      els.startExpedition.textContent='Iniciar expedición';
    }
  }

  const pickaxeEquipped=hasIronPickaxeEquipped();
  els.expeditionTool.textContent=pickaxeEquipped?'Pico de hierro equipado':'Sin pico';
  els.hardVeinChance.textContent=pickaxeEquipped?'15%':'No disponible';
  els.expeditionPickaxes.textContent=formatNumber(state.inventory.ironPickaxes);

  if(pickaxeEquipped){
    els.equipIronPickaxe.disabled=true;
    els.equipIronPickaxe.textContent='Pico de hierro equipado';
  }else if(exp||state.workers.mara.restingAtInn){
    els.equipIronPickaxe.disabled=true;
    els.equipIronPickaxe.textContent='Mara no está disponible';
  }else if(state.inventory.ironPickaxes<1){
    els.equipIronPickaxe.disabled=true;
    els.equipIronPickaxe.textContent='No hay Pico de hierro';
  }else{
    els.equipIronPickaxe.disabled=false;
    els.equipIronPickaxe.textContent='Equipar Pico de hierro';
  }

  els.expeditionFeedback.textContent=state.lastMessage||
    `Esta salida cuesta ${EXPEDITION_STAMINA_COST} de Resistencia.`;

  const carpenterJob=state.activeCarpentry;
  els.carpenterWood.textContent=formatNumber(state.resources.wood);
  els.carpenterHandles.textContent=formatNumber(state.inventory.woodenHandles);

  if(carpenterJob){
    const now=Date.now();
    const duration=carpenterJob.endsAt-carpenterJob.startedAt;
    const elapsed=now-carpenterJob.startedAt;
    const progress=Math.max(0,Math.min(100,(elapsed/duration)*100));

    els.eldonState.textContent='Trabajando';
    els.eldonState.classList.add('is-busy');
    els.carpenterEldonState.textContent='Trabajando';
    els.carpenterEldonState.classList.add('is-busy');
    els.carpentryStatus.textContent='Fabricando mango';
    els.carpentryProgress.value=progress;
    els.carpentryCountdown.textContent=`Termina en ${formatRemaining(carpenterJob.endsAt-now)}`;
    els.startHandleCraft.disabled=true;
    els.startHandleCraft.textContent='Eldon está trabajando';
  }else{
    const resting=state.workers.eldon.restingAtInn;
    const enoughStamina=state.workers.eldon.stamina>=HANDLE_STAMINA_COST;
    const enoughWood=state.resources.wood>=HANDLE_WOOD_COST;

    els.eldonState.textContent=resting?'Descansando':'Disponible';
    els.eldonState.classList.toggle('is-busy',resting);
    els.carpenterEldonState.textContent=resting?'En la Posada':'Disponible';
    els.carpenterEldonState.classList.toggle('is-busy',resting);
    els.carpentryStatus.textContent=resting?'Eldon descansando':'Lista para fabricar';
    els.carpentryProgress.value=0;
    els.carpentryCountdown.textContent='';

    if(resting){
      els.startHandleCraft.disabled=true;
      els.startHandleCraft.textContent='Eldon está descansando';
    }else if(!enoughStamina){
      els.startHandleCraft.disabled=true;
      els.startHandleCraft.textContent='Falta Resistencia';
    }else if(!enoughWood){
      els.startHandleCraft.disabled=true;
      els.startHandleCraft.textContent=`Faltan ${HANDLE_WOOD_COST-state.resources.wood} madera`;
    }else{
      els.startHandleCraft.disabled=false;
      els.startHandleCraft.textContent='Fabricar mango';
    }
  }

  els.carpentryFeedback.textContent=state.lastCarpentryMessage||
    'El mango será un componente real del Pico de hierro.';

  els.smithyLevelHero.textContent=state.buildings.smithy.level;
  els.smithyIron.textContent=formatNumber(state.resources.iron);
  els.smithyStone.textContent=formatNumber(state.resources.stone);
  els.smithyPickaxeHeads.textContent=formatNumber(state.inventory.pickaxeHeads);
  els.smithyHandles.textContent=formatNumber(state.inventory.woodenHandles);
  els.smithyIronPickaxes.textContent=formatNumber(state.inventory.ironPickaxes);

  const craft=state.activeCraft;

  if(craft){
    const now=Date.now();
    const elapsed=now-craft.startedAt;
    const duration=craft.endsAt-craft.startedAt;
    const progress=Math.max(0,Math.min(100,(elapsed/duration)*100));

    els.borinState.textContent='Trabajando';
    els.borinState.classList.add('is-busy');
    els.smithyBorinState.textContent='Trabajando';
    els.smithyBorinState.classList.add('is-busy');
    els.craftStatus.textContent=craft.label||(craft.recipe==='ironPickaxe'?'Ensamblando Pico':'Forjando cabeza');
    els.craftProgress.value=progress;
    els.craftCountdown.textContent=`Termina en ${formatRemaining(craft.endsAt-now)}`;
    els.startHeadCraft.disabled=true;
    els.startHeadCraft.textContent='Borin está trabajando';
    els.startPickaxeAssembly.disabled=true;
    els.startPickaxeAssembly.textContent='Borin está trabajando';
  }else{
    const resting=state.workers.borin.restingAtInn;
    const headStamina=state.workers.borin.stamina>=CRAFT_STAMINA_COST;
    const assemblyStamina=state.workers.borin.stamina>=ASSEMBLY_STAMINA_COST;
    const enoughIron=state.resources.iron>=CRAFT_IRON_COST;
    const hasComponents=state.inventory.pickaxeHeads>=1&&state.inventory.woodenHandles>=1;

    els.borinState.textContent=resting?'Descansando':'Disponible';
    els.borinState.classList.toggle('is-busy',resting);
    els.smithyBorinState.textContent=resting?'En la Posada':'Disponible';
    els.smithyBorinState.classList.toggle('is-busy',resting);
    els.craftStatus.textContent=resting?'Borin descansando':'Lista para trabajar';
    els.craftProgress.value=0;
    els.craftCountdown.textContent='';

    if(resting){
      els.startHeadCraft.disabled=true;
      els.startHeadCraft.textContent='Borin está descansando';
      els.startPickaxeAssembly.disabled=true;
      els.startPickaxeAssembly.textContent='Borin está descansando';
    }else{
      els.startHeadCraft.disabled=!headStamina||!enoughIron;
      els.startHeadCraft.textContent=!headStamina
        ?'Falta Resistencia'
        :!enoughIron
          ?`Faltan ${CRAFT_IRON_COST-state.resources.iron} hierro`
          :'Fabricar cabeza de pico';

      els.startPickaxeAssembly.disabled=!assemblyStamina||!hasComponents;
      els.startPickaxeAssembly.textContent=!assemblyStamina
        ?'Falta Resistencia'
        :!hasComponents
          ?'Falta cabeza o mango'
          :'Ensamblar Pico de hierro';
    }
  }

  els.smithyFeedback.textContent=state.lastSmithyMessage||
    'La Herrería ensambla el objeto final usando componentes de distintos oficios.';

  renderInnWorker('mara',els.innMaraState,els.toggleMaraInnRest,els.maraInnFeedback);
  renderInnWorker('borin',els.innBorinState,els.toggleBorinInnRest,els.borinInnFeedback);
  renderInnWorker('eldon',els.innEldonState,els.toggleEldonInnRest,els.eldonInnFeedback);

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
}

els.startExpedition.addEventListener('click',startExpedition);
els.equipIronPickaxe.addEventListener('click',equipIronPickaxe);
els.startHandleCraft.addEventListener('click',startHandleCraft);
els.startHeadCraft.addEventListener('click',()=>startSmithyCraft('pickaxeHead'));
els.startPickaxeAssembly.addEventListener('click',()=>startSmithyCraft('ironPickaxe'));
els.toggleMaraInnRest.addEventListener('click',()=>toggleInnRest('mara'));
els.toggleBorinInnRest.addEventListener('click',()=>toggleInnRest('borin'));
els.toggleEldonInnRest.addEventListener('click',()=>toggleInnRest('eldon'));
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
      const reg=await navigator.serviceWorker.register('./sw.js?v=0.5.0',{updateViaCache:'none'});
      await reg.update();
    }catch{}
  });
}

render();
