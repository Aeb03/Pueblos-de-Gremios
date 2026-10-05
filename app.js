const APP_VERSION='0.2.1';
const SAVE_KEY='pueblos-gremios-save-v0.2.0';
const EXPEDITION_DURATION_MS=30_000;
const MINING_XP_STEP=100;

const titles={
  city:'Villa del Roble',
  workers:'Trabajadores',
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
  resources:{coins:1240,wood:86,iron:42,stone:0},
  workers:{mara:{miningXp:0}},
  activeExpedition:null,
  lastMessage:''
});

function loadState(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return defaultState();
    const saved=JSON.parse(raw);
    return {
      ...defaultState(),
      ...saved,
      version:APP_VERSION,
      resources:{...defaultState().resources,...(saved.resources||{})},
      workers:{
        ...defaultState().workers,
        ...(saved.workers||{}),
        mara:{...defaultState().workers.mara,...(saved.workers?.mara||{})}
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
  nav.forEach(b=>b.classList.toggle('is-active',b.dataset.target===name));
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
  Herrería:{
    copy:'Producción de herramientas, armas y encargos especiales.',
    resources:[
      {icon:'⛏️',label:'Hierro',key:'iron'},
      {icon:'🪨',label:'Piedra',key:'stone'}
    ],
    empty:''
  },
  Carpintería:{
    copy:'Madera, muebles, herramientas y componentes para otros edificios.',
    resources:[
      {icon:'🪵',label:'Madera',key:'wood'}
    ],
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
  currentBuilding=n;
  buildingName.textContent=n;
  buildingCopy.textContent=buildingInfo[n]?.copy||'Gestión del edificio.';
  renderBuildingResources(n);
  dialog.showModal();
}));

const els={
  coins:document.getElementById('coinsValue'),
  inventoryCoins:document.getElementById('inventoryCoins'),
  inventoryWood:document.getElementById('inventoryWood'),
  inventoryIron:document.getElementById('inventoryIron'),
  inventoryStone:document.getElementById('inventoryStone'),
  maraProfessionLevel:document.getElementById('maraProfessionLevel'),
  maraMiningLevel:document.getElementById('maraMiningLevel'),
  maraMiningXp:document.getElementById('maraMiningXp'),
  maraNextXp:document.getElementById('maraNextXp'),
  maraXpProgress:document.getElementById('maraXpProgress'),
  maraState:document.getElementById('maraState'),
  expeditionStatus:document.getElementById('expeditionStatus'),
  expeditionProgress:document.getElementById('expeditionProgress'),
  expeditionCountdown:document.getElementById('expeditionCountdown'),
  expeditionFeedback:document.getElementById('expeditionFeedback'),
  startExpedition:document.getElementById('startExpedition')
};

function miningLevel(){
  return Math.floor(state.workers.mara.miningXp/MINING_XP_STEP)+1;
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

function createExpeditionId(){
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
    id:createExpeditionId(),
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

function render(){
  resolveExpiredExpedition();

  els.coins.textContent=formatNumber(state.resources.coins);
  els.inventoryCoins.textContent=formatNumber(state.resources.coins);
  els.inventoryWood.textContent=formatNumber(state.resources.wood);
  els.inventoryIron.textContent=formatNumber(state.resources.iron);
  els.inventoryStone.textContent=formatNumber(state.resources.stone);

  if(dialog.open&&currentBuilding)renderBuildingResources(currentBuilding);

  const level=miningLevel();
  const levelBase=(level-1)*MINING_XP_STEP;
  const nextLevelXp=level*MINING_XP_STEP;
  const xpIntoLevel=state.workers.mara.miningXp-levelBase;

  els.maraProfessionLevel.textContent=level;
  els.maraMiningLevel.textContent=level;
  els.maraMiningXp.textContent=state.workers.mara.miningXp;
  els.maraNextXp.textContent=nextLevelXp;
  els.maraXpProgress.max=MINING_XP_STEP;
  els.maraXpProgress.value=xpIntoLevel;

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
}

els.startExpedition.addEventListener('click',startExpedition);

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
      const reg=await navigator.serviceWorker.register('./sw.js?v=0.2.1',{updateViaCache:'none'});
      await reg.update();
    }catch{}
  });
}

render();
