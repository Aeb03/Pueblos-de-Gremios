const APP_VERSION='0.9.0g1';
const SAVE_KEY='pueblos-gremios-save-v0.8.0';
const DATA=globalThis.PG_DATA;
const ADV=globalThis.PG_ADVENTURER_CORE;
const CITY=globalThis.PG_CITY_PROGRESSION;
const COMBAT=globalThis.PG_ACTIVITY_COMBAT;
const DESIGN=globalThis.PG_WORLD_DESIGN;
const WORLD=globalThis.PG_WORLD_LOOP;

if(!ADV)throw new Error('PG_ADVENTURER_CORE no está disponible.');
if(!CITY)throw new Error('PG_CITY_PROGRESSION no está disponible.');
if(!COMBAT)throw new Error('PG_ACTIVITY_COMBAT no está disponible.');
if(!DESIGN)throw new Error('PG_WORLD_DESIGN no está disponible.');
if(!WORLD)throw new Error('PG_WORLD_LOOP no está disponible.');

const EXPEDITION_DURATION_MS=30_000;
const CRAFT_DURATION_MS=DATA.recipes.pickaxeHead.durationMs;
const ASSEMBLY_DURATION_MS=DATA.recipes.ironPickaxe.durationMs;
const CARPENTRY_DURATION_MS=DATA.recipes.woodenHandle.durationMs;

const MINING_XP_STEP=100;
const SMITHING_XP_STEP=100;
const CARPENTRY_XP_STEP=100;

const CRAFT_IRON_COST=DATA.recipes.pickaxeHead.materials.iron;
const CRAFT_SMITHING_XP=DATA.recipes.pickaxeHead.xp;
const CRAFT_STAMINA_COST=DATA.recipes.pickaxeHead.stamina;

const ASSEMBLY_SMITHING_XP=DATA.recipes.ironPickaxe.xp;
const ASSEMBLY_STAMINA_COST=DATA.recipes.ironPickaxe.stamina;

const SWORD_IRON_COST=DATA.recipes.ironSword.materials.iron;
const SWORD_DURATION_MS=DATA.recipes.ironSword.durationMs;
const SWORD_STAMINA_COST=DATA.recipes.ironSword.stamina;
const SWORD_SMITHING_XP=DATA.recipes.ironSword.xp;
const SWORD_RECIPE_LEVEL=DATA.recipes.ironSword.requiredLevel;

const HANDLE_WOOD_COST=DATA.recipes.woodenHandle.materials.wood;
const HANDLE_CARPENTRY_XP=DATA.recipes.woodenHandle.xp;
const HANDLE_STAMINA_COST=DATA.recipes.woodenHandle.stamina;

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

const SMITHY_VISIT_MIN_MS=45_000;
const SMITHY_VISIT_MAX_MS=90_000;
const SMITHY_VISIT_DURATION_MS=15_000;
const SMITHY_BOOK_DETAIL_LIMIT=20;
const SMITHY_OFFLINE_VISIT_CAP=6;
const LEGACY_SMITHY_TRAFFIC_ENABLED=false;

const titles={
  city:'Ciudad',
  workers:'Trabajadores',
  carpenter:'Carpintería',
  smithy:'Herrería',
  inn:'Mesón',
  expedition:'Expedición',
  kingdom:'Reino de Ardel',
  townHall:'Ayuntamiento',
  guildHall:'Sede del Gremio',
  textile:'Textilería',
  map:'Mapa local',
  inventory:'Inventario',
  menu:'Menú'
};

const screens=[...document.querySelectorAll('.screen')];
const nav=[...document.querySelectorAll('.nav-btn')];
const title=document.getElementById('screenTitle');

const defaultState=()=>({
  version:APP_VERSION,
  adventurerSchemaVersion:ADV.ADVENTURER_SCHEMA_VERSION,
  world:{
    id:DATA.world.id,
    name:DATA.world.name,
    kingdom:{...DATA.world.kingdom}
  },
  city:{
    id:null,
    name:'',
    tier:DATA.founding.startingTier,
    prestige:DATA.founding.startingPrestige,
    level:1,
    development:0,
    cityProgressionSchemaVersion:CITY.CITY_PROGRESSION_SCHEMA_VERSION,
    populationMilestones:{level2Arrival:false,level3Arrival:false},
    levelReachedAt:{},
    founded:false,
    foundedAt:null,
    foundingPackGenerated:false
  },
  resources:{...DATA.founding.resources},
  inventory:{},
  shops:{
    smithy:{
      storage:{
        pickaxeHeads:0,
        ironPickaxes:0,
        ironSwords:[]
      },
      storageCapacity:20,
      exhibitionCapacity:3
    },
    carpenter:{
      storage:{
        woodenHandles:0
      },
      storageCapacity:20
    }
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
    smithy:{level:DATA.shops.smithy.startingLevel,craftedCount:0},
    meson:{level:DATA.shops.meson.startingLevel,capacity:CITY.mesonCapacity(DATA.shops.meson.startingLevel)}
  },
  adventurers:[],
  smithyTraffic:{
    nextVisitAt:null,
    activeVisitor:null
  },
  smithyBook:{
    entries:[],
    unread:0,
    archive:{visits:0,purchases:0,noPurchase:0,revenue:0}
  },
  activeExpedition:null,
  activeCraft:null,
  activeCarpentry:null,
  activityLog:[],
  lastMessage:'',
  lastSmithyMessage:'',
  lastCarpentryMessage:'',
  lastInnMessage:'',
  lastCityMessage:'',
  lastActivityMessage:''
});

function loadState(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return defaultState();

    const saved=JSON.parse(raw);
    const base=defaultState();

    const merged={
      ...base,
      ...saved,
      version:APP_VERSION,
      world:{
        ...base.world,
        ...(saved.world||{}),
        kingdom:{...base.world.kingdom,...(saved.world?.kingdom||{})}
      },
      city:{...base.city,...(saved.city||{})},
      resources:{...base.resources,...(saved.resources||{})},
      inventory:{...base.inventory,...(saved.inventory||{})},
      shops:{
        ...base.shops,
        ...(saved.shops||{}),
        smithy:{
          ...base.shops.smithy,
          ...(saved.shops?.smithy||{}),
          storage:{
            ...base.shops.smithy.storage,
            ...(saved.shops?.smithy?.storage||{})
          }
        },
        carpenter:{
          ...base.shops.carpenter,
          ...(saved.shops?.carpenter||{}),
          storage:{
            ...base.shops.carpenter.storage,
            ...(saved.shops?.carpenter?.storage||{})
          }
        }
      },
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
        smithy:{...base.buildings.smithy,...(saved.buildings?.smithy||{})},
        meson:{...base.buildings.meson,...(saved.buildings?.meson||{})}
      },
      adventurers:Array.isArray(saved.adventurers)
        ?saved.adventurers.map(npc=>ADV.normalizeAdventurer(npc,DATA))
        :[],
      smithyTraffic:{...base.smithyTraffic,...(saved.smithyTraffic||{})},
      smithyBook:{
        ...base.smithyBook,
        ...(saved.smithyBook||{}),
        archive:{...base.smithyBook.archive,...(saved.smithyBook?.archive||{})}
      }
    };

    const hasNewSmithyStorage=Boolean(saved.shops?.smithy?.storage);
    const hasNewCarpenterStorage=Boolean(saved.shops?.carpenter?.storage);

    if(!hasNewSmithyStorage){
      merged.shops.smithy.storage.pickaxeHeads=Number(saved.inventory?.pickaxeHeads)||0;
      merged.shops.smithy.storage.ironPickaxes=Number(saved.inventory?.ironPickaxes)||0;
      merged.shops.smithy.storage.ironSwords=Array.isArray(saved.inventory?.ironSwords)
        ?saved.inventory.ironSwords
        :[];
    }

    if(!hasNewCarpenterStorage){
      merged.shops.carpenter.storage.woodenHandles=Number(saved.inventory?.woodenHandles)||0;
    }

    merged.shops.smithy.storage.ironSwords=Array.isArray(merged.shops.smithy.storage.ironSwords)
      ?merged.shops.smithy.storage.ironSwords.map(sword=>({...sword,listed:Boolean(sword.listed)}))
      :[];

    delete merged.inventory.pickaxeHeads;
    delete merged.inventory.ironPickaxes;
    delete merged.inventory.ironSwords;
    delete merged.inventory.woodenHandles;

    merged.smithyBook.entries=Array.isArray(merged.smithyBook.entries)?merged.smithyBook.entries:[];
    merged.smithyBook.unread=merged.smithyBook.entries.filter(entry=>entry.unread).length;
    merged.activityLog=Array.isArray(merged.activityLog)?merged.activityLog.slice(0,12):[];
    merged.adventurerSchemaVersion=ADV.ADVENTURER_SCHEMA_VERSION;
    merged.city=CITY.normalizeCityProgress(merged.city);
    merged.buildings.meson.level=Math.max(1,Number(merged.buildings.meson.level)||1);
    merged.buildings.meson.capacity=CITY.mesonCapacity(merged.buildings.meson.level);
    return WORLD.normalizeState(merged,DATA,DESIGN);
  }catch{
    return defaultState();
  }
}

let state=WORLD.normalizeState(loadState(),DATA,DESIGN);

function saveState(){
  state.version=APP_VERSION;
  state.adventurerSchemaVersion=ADV.ADVENTURER_SCHEMA_VERSION;
  WORLD.normalizeState(state,DATA,DESIGN);
  localStorage.setItem(SAVE_KEY,JSON.stringify(state));
}

if(state.city.founded){
  reconcileCityPopulation();
  saveState();
}


function smithyStorage(){
  return state.shops.smithy.storage;
}

function carpenterStorage(){
  return state.shops.carpenter.storage;
}

function smithyStorageUsed(){
  const storage=smithyStorage();
  return storage.pickaxeHeads+storage.ironPickaxes+storage.ironSwords.length;
}

function smithyStorageFree(){
  return Math.max(0,state.shops.smithy.storageCapacity-smithyStorageUsed());
}

function smithyHasStorageSpace(units=1){
  return smithyStorageFree()>=units;
}

function smithyListedSwords(){
  return smithyStorage().ironSwords.filter(sword=>sword.listed);
}


function randomChoice(list){
  return list[randomInt(0,list.length-1)];
}

function shuffled(list){
  const copy=[...list];
  for(let i=copy.length-1;i>0;i--){
    const j=randomInt(0,i);
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}

function uniqueAdventurerName(existingFullNames){
  const maxAttempts=500;
  for(let attempt=0;attempt<maxAttempts;attempt++){
    const firstName=randomChoice(DATA.adventurerNames);
    const lastName=randomChoice(DATA.adventurerSurnames);
    const fullName=`${firstName} ${lastName}`;
    if(!existingFullNames.has(fullName))return {firstName,lastName,fullName};
  }
  const fallback=`Viajero ${Date.now().toString(36)}`;
  return {firstName:'Viajero',lastName:fallback.split(' ')[1],fullName:fallback};
}

function generateAdventurer({city,roleKey,existingFullNames,combatStyle=null,populationMilestone=null}){
  const role=DATA.adventurerRoles[roleKey];
  const personality=randomChoice(Object.values(DATA.personalities));
  const name=uniqueAdventurerName(existingFullNames);
  existingFullNames.add(name.fullName);

  const [coinMin,coinMax]=DATA.founding.adventurerCoinRange||[55,75];
  const selectedStyle=roleKey==='explorer'
    ?(combatStyle||randomChoice(['bow','daggers']))
    :combatStyle;

  const npc=ADV.createAdventurer(DATA,{
    id:createActionId(),
    firstName:name.firstName,
    lastName:name.lastName,
    fullName:name.fullName,
    city,
    classKey:roleKey,
    combatStyle:selectedStyle,
    personalityKey:personality.id,
    coins:randomInt(coinMin,coinMax),
    createdAt:Date.now()
  });

  if(populationMilestone)npc.populationMilestone=populationMilestone;
  return npc;
}

function generateFoundingAdventurers(city,count=DATA.founding.adventurerCount){
  const existingNames=new Set(state.adventurers.map(npc=>npc.fullName));
  const founderClasses=DATA.founding.founderClassKeys||['warrior','explorer','healer'];
  const result=[];

  for(let i=0;i<count;i++){
    const roleKey=founderClasses[i%founderClasses.length];
    result.push(generateAdventurer({city,roleKey,existingFullNames:existingNames}));
  }

  return result;
}
function activeAdventurerCount(){
  return state.adventurers.filter(npc=>npc.active!==false).length;
}

function reconcileCityPopulation(){
  if(!state.city.founded)return [];

  state.city=CITY.normalizeCityProgress(state.city);
  state.buildings.meson={
    ...(state.buildings.meson||{}),
    level:Math.max(1,Number(state.buildings.meson?.level)||1)
  };
  state.buildings.meson.capacity=CITY.mesonCapacity(state.buildings.meson.level);

  const plan=CITY.arrivalPlan(state.city,state.adventurers,Math.random);
  state.city=plan.city;

  const arrivals=[];
  const existingNames=new Set(state.adventurers.map(npc=>npc.fullName));
  const levelSlots=CITY.slotsForLevel(state.city.level);
  const capacity=Math.min(levelSlots,state.buildings.meson.capacity);

  for(const arrival of plan.arrivals){
    if(activeAdventurerCount()>=capacity)break;
    if(CITY.hasMilestoneAdventurer(state.adventurers,arrival.level)){
      state.city=CITY.markArrival(state.city,arrival.level);
      continue;
    }

    const npc=generateAdventurer({
      city:state.city,
      roleKey:arrival.classKey,
      existingFullNames:existingNames,
      populationMilestone:arrival.marker
    });
    npc.arrivalLevel=arrival.level;
    npc.arrivalReason=arrival.level===2
      ?'Primer recién llegado por crecimiento de la ciudad'
      :'Nuevo residente atraído por el desarrollo de la ciudad';

    state.adventurers.push(npc);
    state.city=CITY.markArrival(state.city,arrival.level);
    arrivals.push(npc);
  }

  return arrivals;
}

function cityProgressNote(reached=[],arrivals=[]){
  const parts=[];
  if(reached.length){
    for(const level of reached)parts.push(`🏘️ Ciudad Nv. ${level} alcanzada.`);
  }
  for(const npc of arrivals){
    parts.push(`🧭 ${npc.fullName}, ${npc.role}, llegó como nuevo residente.`);
  }
  return parts.length?` ${parts.join(' ')}`:'';
}

function addCityDevelopment(amount,source='actividad'){
  if(!state.city.founded)return {reached:[],arrivals:[],note:''};

  const result=CITY.addDevelopment(state.city,amount,Date.now());
  state.city=result.city;
  state.city.lastDevelopmentSource=source;
  const arrivals=reconcileCityPopulation();

  return {
    ...result,
    arrivals,
    note:cityProgressNote(result.reached,arrivals)
  };
}

function getAdventurer(id){
  return state.adventurers.find(npc=>npc.id===id)||null;
}

function sanitizeCityName(value){
  const clean=String(value||'').trim().replace(/\s+/g,' ');
  return clean.slice(0,28);
}

function updateFoundationGate(){
  const gate=document.getElementById('foundationGate');
  if(!gate)return;
  gate.hidden=Boolean(state.city.founded);
}

function foundCity(){
  if(state.city.founded)return;

  const input=document.getElementById('foundationCityName');
  const feedback=document.getElementById('foundationFeedback');
  const name=sanitizeCityName(input?.value)||'Villa del Roble';

  const city={
    id:createActionId(),
    name,
    tier:DATA.founding.startingTier,
    prestige:DATA.founding.startingPrestige,
    level:1,
    development:0,
    cityProgressionSchemaVersion:CITY.CITY_PROGRESSION_SCHEMA_VERSION,
    populationMilestones:{level2Arrival:false,level3Arrival:false},
    levelReachedAt:{},
    founded:true,
    foundedAt:Date.now(),
    foundingPackGenerated:true
  };

  state.city=city;
  state.resources={...DATA.founding.resources};
  state.adventurers=generateFoundingAdventurers(city);
  state.smithyTraffic={nextVisitAt:null,activeVisitor:null};
  state.smithyBook={entries:[],unread:0,archive:{visits:0,purchases:0,noPurchase:0,revenue:0}};
  state.worldSystems=null;
  state.accountLedger={
    seasonId:'era-prueba-1',
    founderPackClaimed:true,
    cityLineageId:city.id
  };
  WORLD.normalizeState(state,DATA,DESIGN);
  state.worldSystems.chronology.events.unshift({
    id:createActionId(),
    atMinute:0,
    day:1,
    type:'foundation',
    text:name+' fue fundada con su único Pack de Fundación de la Era.',
    meta:{cityId:city.id}
  });
  saveState();
  updateFoundationGate();

  if(feedback)feedback.textContent=`${name} fue fundada con ${state.adventurers.length} aventureros de origen.`;
  showScreen('city');
}

function resetTestWorld(){
  const ok=globalThis.confirm('¿Reiniciar el Reino de prueba? Se borrará el progreso local de esta prueba y volverás a fundar la ciudad.');
  if(!ok)return;
  localStorage.removeItem(SAVE_KEY);
  state=WORLD.normalizeState(defaultState(),DATA,DESIGN);
  updateFoundationGate();
  const input=document.getElementById('foundationCityName');
  if(input)input.value='Villa del Roble';
  render();
}

function isLocalTestHost(){
  const params=new URLSearchParams(location.search);
  if(params.get('test')==='1')return true;
  return location.hostname==='127.0.0.1'||location.hostname==='localhost';
}

function reachNextCityLevelForLocalTest(){
  if(!isLocalTestHost())return;
  if(!state.city.founded){
    if(els.testProgressFeedback)els.testProgressFeedback.textContent='Primero fundá la ciudad.';
    return;
  }

  const next=CITY.nextLevelInfo(state.city);
  if(next.maxed){
    if(els.testProgressFeedback)els.testProgressFeedback.textContent='Ciudad Nv. 3 ya alcanzada.';
    return;
  }

  const result=addCityDevelopment(next.remaining,'herramienta local de prueba');
  if(els.testProgressFeedback){
    const names=result.arrivals.map(npc=>npc.fullName).join(', ');
    els.testProgressFeedback.textContent=`Ciudad Nv. ${state.city.level} alcanzada.${names?` Nuevo residente: ${names}.`:''}`;
  }
  saveState();
  render();
}

function recoverAdventurersForLocalTest(){
  if(!isLocalTestHost())return;
  state.adventurers=state.adventurers.map(npc=>COMBAT.recoverForTest(npc));
  state.lastActivityMessage='Recuperación local aplicada: Vida y Maná completos para continuar la prueba.';
  if(els.testProgressFeedback)els.testProgressFeedback.textContent=state.lastActivityMessage;
  saveState();
  render();
}

function currentScreen(){
  return document.querySelector('.screen.is-active')?.dataset.screen||'city';
}

function markSmithyBookRead(){
  let changed=false;
  state.smithyBook.entries.forEach(entry=>{
    if(entry.unread){
      entry.unread=false;
      changed=true;
    }
  });
  if(state.smithyBook.unread!==0){
    state.smithyBook.unread=0;
    changed=true;
  }
  if(changed)saveState();
}

function showScreen(name){
  screens.forEach(s=>s.classList.toggle('is-active',s.dataset.screen===name));
  const navTarget=['smithy','carpenter','inn','townHall','guildHall','textile'].includes(name)?'city':name;
  nav.forEach(b=>b.classList.toggle('is-active',b.dataset.target===navTarget));
  title.textContent=name==='city'&&state.city.founded
    ?state.city.name
    :(titles[name]||'Pueblos de Gremios');
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
    copy:'Centro administrativo del asentamiento. El desarrollo real de la ciudad determina su nivel y nuevos residentes.',
    resources:[],
    empty:'Las actividades productivas y mejoras aportan Desarrollo.'
  },
  Mesón:{
    copy:'Nara reúne comida, alojamiento, descanso y vida social en un solo negocio. Su capacidad sostiene la población aventurera.',
    resources:[],
    empty:'Mesón Nv. 1: capacidad para 5 aventureros residentes.'
  },
  'Sede del Gremio':{
    copy:'Centro de encargos, registro de aventureros y futura coordinación de misiones.',
    resources:[],
    empty:'La gestión de misiones se incorporará en el bloque correspondiente.'
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

  if(n==='Mesón'){
    showScreen('inn');
    return;
  }

  if(n==='Ayuntamiento'){
    showScreen('townHall');
    return;
  }

  if(n==='Sede del Gremio'){
    showScreen('guildHall');
    return;
  }

  if(n==='Textilería'){
    showScreen('textile');
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

  cityLevelBadge:document.getElementById('cityLevelBadge'),
  cityDevelopment:document.getElementById('cityDevelopment'),
  cityDevelopmentTarget:document.getElementById('cityDevelopmentTarget'),
  cityDevelopmentProgress:document.getElementById('cityDevelopmentProgress'),
  cityPopulationSummary:document.getElementById('cityPopulationSummary'),
  cityProgressHint:document.getElementById('cityProgressHint'),
  kingdomCityName:document.getElementById('kingdomCityName'),
  kingdomFoundingMeta:document.getElementById('kingdomFoundingMeta'),
  kingdomAdventurerCount:document.getElementById('kingdomAdventurerCount'),
  kingdomAdventurerList:document.getElementById('kingdomAdventurerList'),
  activityState:document.getElementById('activityState'),
  activityAdventurerSelect:document.getElementById('activityAdventurerSelect'),
  activityEnemySelect:document.getElementById('activityEnemySelect'),
  activityEnemyCount:document.getElementById('activityEnemyCount'),
  activityPreview:document.getElementById('activityPreview'),
  resolveAdventurerActivity:document.getElementById('resolveAdventurerActivity'),
  activityResult:document.getElementById('activityResult'),
  activityLogList:document.getElementById('activityLogList'),
  localTestTools:document.getElementById('localTestTools'),
  manualCombatLab:document.getElementById('manualCombatLab'),
  testReachNextCityLevel:document.getElementById('testReachNextCityLevel'),
  testRecoverAdventurers:document.getElementById('testRecoverAdventurers'),
  testProgressFeedback:document.getElementById('testProgressFeedback'),

  cityTextileButton:document.getElementById('cityTextileButton'),
  cityTextileLevel:document.getElementById('cityTextileLevel'),
  loggerState:document.getElementById('loggerState'),
  hunterState:document.getElementById('hunterState'),

  worldClockKingdom:document.getElementById('worldClockKingdom'),
  worldEventList:document.getElementById('worldEventList'),
  mesonServiceSummary:document.getElementById('mesonServiceSummary'),
  mesonAdventurerList:document.getElementById('mesonAdventurerList'),

  townHallCityLevel:document.getElementById('townHallCityLevel'),
  townHallCoins:document.getElementById('townHallCoins'),
  townHallReserved:document.getElementById('townHallReserved'),
  townHallAvailable:document.getElementById('townHallAvailable'),
  townHallDevelopment:document.getElementById('townHallDevelopment'),
  townHallAlerts:document.getElementById('townHallAlerts'),
  townHallEra:document.getElementById('townHallEra'),
  townHallDiamonds:document.getElementById('townHallDiamonds'),

  guildEnemySelect:document.getElementById('guildEnemySelect'),
  guildEnemyCount:document.getElementById('guildEnemyCount'),
  guildRewardInput:document.getElementById('guildRewardInput'),
  guildRewardHint:document.getElementById('guildRewardHint'),
  publishGuildMission:document.getElementById('publishGuildMission'),
  guildFeedback:document.getElementById('guildFeedback'),
  deliveryResourceSelect:document.getElementById('deliveryResourceSelect'),
  deliveryQtyInput:document.getElementById('deliveryQtyInput'),
  deliveryRewardInput:document.getElementById('deliveryRewardInput'),
  deliveryHint:document.getElementById('deliveryHint'),
  publishDeliveryMission:document.getElementById('publishDeliveryMission'),
  deliveryFeedback:document.getElementById('deliveryFeedback'),
  escortWorkerSelect:document.getElementById('escortWorkerSelect'),
  escortRewardInput:document.getElementById('escortRewardInput'),
  escortHint:document.getElementById('escortHint'),
  publishEscortMission:document.getElementById('publishEscortMission'),
  escortFeedback:document.getElementById('escortFeedback'),
  guildMissionCount:document.getElementById('guildMissionCount'),
  guildMissionList:document.getElementById('guildMissionList'),

  textileBadge:document.getElementById('textileBadge'),
  textileBuildPanel:document.getElementById('textileBuildPanel'),
  textileProductionPanel:document.getElementById('textileProductionPanel'),
  buildTextile:document.getElementById('buildTextile'),
  textileFeedback:document.getElementById('textileFeedback'),
  tannedStockSummary:document.getElementById('tannedStockSummary'),
  tanningActions:document.getElementById('tanningActions'),
  textileOriginSelect:document.getElementById('textileOriginSelect'),
  textileStockList:document.getElementById('textileStockList'),

  mapWorldTime:document.getElementById('mapWorldTime'),
  wolfPresence:document.getElementById('wolfPresence'),
  wolfPresenceProgress:document.getElementById('wolfPresenceProgress'),
  boarPresence:document.getElementById('boarPresence'),
  boarPresenceProgress:document.getElementById('boarPresenceProgress'),
  mapMineOuting:document.getElementById('mapMineOuting'),
  mapWoodOuting:document.getElementById('mapWoodOuting'),
  mapHuntOuting:document.getElementById('mapHuntOuting'),
  mapOutingFeedback:document.getElementById('mapOutingFeedback'),
  mapWorkerToolsSummary:document.getElementById('mapWorkerToolsSummary'),
  repairWorkerTools:document.getElementById('repairWorkerTools'),
  equipMaraPickaxe:document.getElementById('equipMaraPickaxe'),
  equipLoggerAxe:document.getElementById('equipLoggerAxe'),
  equipHunterBow:document.getElementById('equipHunterBow'),
  equipHunterKnife:document.getElementById('equipHunterKnife'),
  mapZoneList:document.getElementById('mapZoneList'),
  mapActiveAdventurers:document.getElementById('mapActiveAdventurers'),

  simulationClock:document.getElementById('simulationClock'),
  simulationEventCount:document.getElementById('simulationEventCount'),
  advanceWorld10:document.getElementById('advanceWorld10'),
  advanceWorld30:document.getElementById('advanceWorld30'),
  advanceWorld120:document.getElementById('advanceWorld120'),
  simulationFeedback:document.getElementById('simulationFeedback'),

  smithyWorldQueue:document.getElementById('smithyWorldQueue'),
  smithyWorldFeedback:document.getElementById('smithyWorldFeedback'),
  carpenterWorldQueue:document.getElementById('carpenterWorldQueue'),
  carpenterWorldFeedback:document.getElementById('carpenterWorldFeedback'),
  worldResourceGrid:document.getElementById('worldResourceGrid'),
  worldProductionStock:document.getElementById('worldProductionStock'),

  smithyLevelCity:document.getElementById('smithyLevelCity'),
  smithyVisitBadge:document.getElementById('smithyVisitBadge'),

  inventoryCoins:document.getElementById('inventoryCoins'),
  inventoryWood:document.getElementById('inventoryWood'),
  inventoryIron:document.getElementById('inventoryIron'),
  inventoryStone:document.getElementById('inventoryStone'),
  inventoryMaraTool:document.getElementById('inventoryMaraTool'),
  swordInventoryList:document.getElementById('swordInventoryList'),

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
  smithyIronSwords:document.getElementById('smithyIronSwords'),
  smithyStorageUsed:document.getElementById('smithyStorageUsed'),
  smithyStorageCapacity:document.getElementById('smithyStorageCapacity'),
  smithyExhibitionCapacity:document.getElementById('smithyExhibitionCapacity'),
  swordExcellentChance:document.getElementById('swordExcellentChance'),
  swordQualityDistribution:document.getElementById('swordQualityDistribution'),
  startSwordCraft:document.getElementById('startSwordCraft'),
  smithyVisitorState:document.getElementById('smithyVisitorState'),
  smithyVisitorCard:document.getElementById('smithyVisitorCard'),
  smithyExhibitionCount:document.getElementById('smithyExhibitionCount'),
  smithyExhibitionList:document.getElementById('smithyExhibitionList'),
  smithyBookSummary:document.getElementById('smithyBookSummary'),
  smithyBookList:document.getElementById('smithyBookList'),
  clearSmithyBook:document.getElementById('clearSmithyBook'),

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

function swordQualityChances(){
  const skillAbove=Math.max(0,smithingLevel()-SWORD_RECIPE_LEVEL);
  const buildingAbove=Math.max(0,state.buildings.smithy.level-1);

  const excellent=Math.min(20,2+(skillAbove*2)+(buildingAbove*2));
  const good=Math.min(55,18+(skillAbove*4)+(buildingAbove*5));
  const mediocre=Math.max(2,25-(skillAbove*5)-(buildingAbove*4));
  const normal=Math.max(0,100-excellent-good-mediocre);

  return {mediocre,normal,good,excellent};
}

function rollSwordQualityTier(){
  const chances=swordQualityChances();
  const roll=Math.random()*100;

  if(roll<chances.mediocre)return 'mediocre';
  if(roll<chances.mediocre+chances.normal)return 'normal';
  if(roll<chances.mediocre+chances.normal+chances.good)return 'good';
  return 'excellent';
}

function randomInt(min,max){
  return min+Math.floor(Math.random()*(max-min+1));
}

function roundToFive(value){
  return Math.max(5,Math.round(value/5)*5);
}

function createIronSword(){
  const tier=rollSwordQualityTier();
  const specs={
    mediocre:{label:'Mediocre',score:[35,49],damage:7,durability:[72,88],valueMultiplier:.78},
    normal:{label:'Normal',score:[50,64],damage:8,durability:[90,105],valueMultiplier:1},
    good:{label:'Buena',score:[65,79],damage:9,durability:[106,122],valueMultiplier:1.25},
    excellent:{label:'Excelente',score:[80,95],damage:10,durability:[123,142],valueMultiplier:1.65}
  }[tier];

  const qualityScore=randomInt(specs.score[0],specs.score[1]);
  const durability=randomInt(specs.durability[0],specs.durability[1]);
  const estimatedValue=roundToFive(
    (110+(specs.damage*8)+(durability*.45)+(qualityScore*.9))*specs.valueMultiplier
  );

  return {
    id:createActionId(),
    type:'ironSword',
    name:DATA.items.ironSword.name,
    qualityTier:tier,
    qualityLabel:specs.label,
    qualityScore,
    damage:specs.damage,
    durability,
    estimatedValue,
    salePrice:estimatedValue,
    listed:false,
    createdAt:Date.now()
  };
}

function randomVisitDelay(){
  return randomInt(SMITHY_VISIT_MIN_MS,SMITHY_VISIT_MAX_MS);
}

function clamp(value,min,max){
  return Math.max(min,Math.min(max,value));
}

function formatClock(timestamp){
  return new Date(timestamp).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
}

function visitorContext(need){
  if(need>=.82)return 'Su arma está muy desgastada y busca reemplazo.';
  if(need>=.62)return 'Se prepara para una expedición y revisa posibles mejoras.';
  return 'Está recorriendo la ciudad y compara equipo sin urgencia.';
}

function createSmithyVisitor(startedAt=Date.now()){
  const candidates=state.adventurers.filter(npc=>npc.active);
  if(!candidates.length)return null;

  const npc=randomChoice(candidates);
  const profile=npc.purchaseProfile;
  const needMin=profile.needRange[0];
  const needMax=profile.needRange[1];
  const need=needMin+(Math.random()*(needMax-needMin));

  npc.coins=Math.min(1200,npc.coins+randomInt(10,35));
  npc.visits+=1;

  return {
    id:createActionId(),
    npcId:npc.id,
    name:npc.fullName,
    role:npc.role,
    personality:npc.personality,
    need:Number(need.toFixed(2)),
    context:visitorContext(need),
    coinsAtVisit:npc.coins,
    weaponDamage:npc.weaponDamage,
    startedAt,
    endsAt:startedAt+SMITHY_VISIT_DURATION_MS,
    offers:smithyStorage().ironSwords
      .filter(sword=>sword.listed)
      .map(sword=>({id:sword.id,price:sword.salePrice}))
  };
}

function evaluateSwordForVisitor(visitor,sword,price){
  const npc=getAdventurer(visitor.npcId);
  if(!npc)return {score:0,affordable:false,upgradeDelta:0,parts:{}};

  const profile=npc.purchaseProfile;
  const upgradeDelta=sword.damage-npc.weaponDamage;
  const upgrade=clamp(35+(upgradeDelta*22)+((sword.qualityScore-50)*.35),0,100);
  const value=clamp((sword.estimatedValue/Math.max(1,price))*72,0,100);
  const affordability=price>npc.coins
    ?0
    :clamp(105-((price/npc.coins)*60),25,100);

  const parts={
    need:visitor.need*100,
    affinity:profile.affinity*100,
    upgrade,
    value,
    affordability
  };

  const score=Object.entries(profile.weights)
    .reduce((total,[key,weight])=>total+(parts[key]*weight),0)
    +randomInt(-5,5);

  return {
    score:Math.round(score),
    affordable:price<=npc.coins,
    upgradeDelta,
    parts
  };
}

function archiveSmithyEntry(entry){
  const archive=state.smithyBook.archive;
  archive.visits+=1;
  if(entry.type==='sale'){
    archive.purchases+=1;
    archive.revenue+=Number(entry.price)||0;
  }else{
    archive.noPurchase+=1;
  }
}

function addSmithyBookEntry(entry){
  const isOpen=currentScreen()==='smithy';
  const normalized={
    id:createActionId(),
    timestamp:Date.now(),
    unread:!isOpen,
    ...entry
  };

  state.smithyBook.entries.unshift(normalized);
  if(normalized.unread)state.smithyBook.unread+=1;

  while(state.smithyBook.entries.length>SMITHY_BOOK_DETAIL_LIMIT){
    const old=state.smithyBook.entries.pop();
    if(old.unread)state.smithyBook.unread=Math.max(0,state.smithyBook.unread-1);
    archiveSmithyEntry(old);
  }
}

function resolveSmithyVisitor(visitor,nextBase=Date.now()){
  const npc=getAdventurer(visitor?.npcId);
  if(!visitor||!npc){
    state.smithyTraffic.activeVisitor=null;
    state.smithyTraffic.nextVisitAt=nextBase+randomVisitDelay();
    saveState();
    return;
  }
  const offers=visitor.offers
    .map(offer=>{
      const sword=smithyStorage().ironSwords.find(item=>item.id===offer.id);
      return sword?{sword,price:offer.price}:null;
    })
    .filter(Boolean);

  let type='no-sale';
  let text='';
  let price=0;

  if(!offers.length){
    text='No compró: no había Espadas de hierro en Exhibición cuando entró.';
  }else{
    const evaluated=offers
      .map(({sword,price:offerPrice})=>({
        sword,
        price:offerPrice,
        evaluation:evaluateSwordForVisitor(visitor,sword,offerPrice)
      }))
      .sort((a,b)=>b.evaluation.score-a.evaluation.score);

    const best=evaluated[0];

    if(best.evaluation.affordable&&best.evaluation.score>=62){
      type='sale';
      price=best.price;
      state.resources.coins+=price;
      npc.coins-=price;
      npc.weaponDamage=best.sword.damage;
      npc.weaponQuality=best.sword.qualityScore;
      npc.equipment.weapon={
        id:best.sword.id,
        name:best.sword.name,
        slot:'weapon',
        founder:false,
        damage:best.sword.damage,
        quality:best.sword.qualityScore,
        durability:null,
        maxDurability:null
      };
      npc.purchases+=1;
      smithyStorage().ironSwords=smithyStorage().ironSwords.filter(item=>item.id!==best.sword.id);
      swordInventorySignature='';
      smithyExhibitionSignature='';
      text=`Compró ${best.sword.name} · ${best.sword.qualityLabel} (${best.sword.qualityScore}) por ${formatNumber(price)} 🪙. Motivo: la mejora, su necesidad actual y el precio formaron una compra suficientemente atractiva.`;
    }else if(!evaluated.some(item=>item.evaluation.affordable)){
      text='No compró: todas las piezas que le interesaban superaban sus monedas disponibles.';
    }else if(best.price>best.sword.estimatedValue*1.25){
      text=`No compró: la pieza que más le interesó costaba ${formatNumber(best.price)} 🪙 y consideró el precio alto para lo que obtenía.`;
    }else if(best.evaluation.upgradeDelta<=0){
      text='No compró: ninguna pieza mejoraba lo suficiente el arma que ya llevaba.';
    }else if(visitor.need<.55){
      text='No compró: encontró una posible mejora, pero su necesidad actual era baja y prefirió guardar sus monedas.';
    }else{
      text='No compró: evaluó la mejora, la calidad y el precio, pero la intención final de compra no fue suficiente.';
    }
  }

  addSmithyBookEntry({
    type,
    npcId:visitor.npcId,
    npcName:visitor.name,
    role:visitor.role,
    personality:visitor.personality,
    context:visitor.context,
    text,
    price,
    timestamp:visitor.endsAt||Date.now()
  });

  state.smithyTraffic.activeVisitor=null;
  state.smithyTraffic.nextVisitAt=nextBase+randomVisitDelay();
  saveState();
}

function startLiveSmithyVisit(){
  if(!state.city.founded||state.smithyTraffic.activeVisitor||!state.adventurers.length)return false;
  const visitor=createSmithyVisitor(Date.now());
  if(!visitor)return false;
  state.smithyTraffic.activeVisitor=visitor;
  saveState();
  return true;
}

function simulateOfflineSmithyVisit(at){
  const visitor=createSmithyVisitor(at);
  if(!visitor)return;
  visitor.endsAt=at;
  resolveSmithyVisitor(visitor,at);
}

function catchUpSmithyTraffic(){
  if(!state.city.founded||!state.adventurers.length)return;
  const now=Date.now();

  if(state.smithyTraffic.activeVisitor&&now>=state.smithyTraffic.activeVisitor.endsAt){
    const expiredVisitor=state.smithyTraffic.activeVisitor;
    resolveSmithyVisitor(expiredVisitor,expiredVisitor.endsAt);
  }

  if(state.smithyTraffic.activeVisitor)return;

  let due=Number(state.smithyTraffic.nextVisitAt)||now+randomVisitDelay();
  let count=0;

  while(due<=now-(SMITHY_VISIT_DURATION_MS*2)&&count<SMITHY_OFFLINE_VISIT_CAP){
    simulateOfflineSmithyVisit(due);
    due=state.smithyTraffic.nextVisitAt;
    count+=1;
  }

  if(due<=now-(SMITHY_VISIT_DURATION_MS*2)){
    state.smithyTraffic.nextVisitAt=now+randomVisitDelay();
    saveState();
  }
}

function tickSmithyTraffic(){
  if(!state.city.founded||!state.adventurers.length)return;
  const now=Date.now();
  const active=state.smithyTraffic.activeVisitor;

  if(active){
    if(now>=active.endsAt)resolveSmithyVisitor(active);
    return;
  }

  if(now>=state.smithyTraffic.nextVisitAt&&!document.hidden){
    startLiveSmithyVisit();
  }
}

function clearReadSmithyBook(){
  const keep=[];
  state.smithyBook.entries.forEach(entry=>{
    if(entry.unread){
      keep.push(entry);
    }else{
      archiveSmithyEntry(entry);
    }
  });
  state.smithyBook.entries=keep;
  saveState();
  renderSmithyBook(true);
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
      state.lastInnMessage=`${name} terminó de descansar, recuperó 100/100 de Resistencia y salió automáticamente de el Mesón.`;
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
    state.lastInnMessage=`${name} terminó de descansar, recuperó 100/100 de Resistencia y salió automáticamente de el Mesón.`;
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
    state.lastInnMessage=`${name} dejó el Mesón. Seguirá recuperando Resistencia lentamente mientras esté libre.`;
  }else{
    if(worker.stamina>=STAMINA_MAX){
      state.lastInnMessage=`${name} ya tiene la Resistencia completa.`;
      render();
      return;
    }

    worker.restingAtInn=true;
    worker.staminaUpdatedAt=Date.now();
    state.lastInnMessage=`${name} está descansando en el Mesón. Su recuperación está acelerada.`;
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
    state.lastMessage='Mara está descansando en el Mesón. Terminá su descanso antes de enviarla.';
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

  const cityProgress=addCityDevelopment(CITY.DEVELOPMENT_REWARDS.workerOuting,'expedición de trabajador');
  state.lastMessage=`Expedición completada: +${baseIron} hierro, +${stone} piedra y +${miningXp} XP de Minería.${special}${cityProgress.note}`;
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

  if(smithyStorage().ironPickaxes<1){
    state.lastMessage='Todavía no hay un Pico de hierro terminado en el Almacén de Herrería.';
    render();
    return;
  }

  smithyStorage().ironPickaxes-=1;
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
    state.lastCarpentryMessage='Eldon está descansando en el Mesón.';
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

  carpenterStorage().woodenHandles+=handles;
  state.workers.eldon.carpentryXp+=xp;
  state.activeCarpentry=null;
  state.workers.eldon.staminaUpdatedAt=job.endsAt||Date.now();
  const cityProgress=addCityDevelopment(CITY.DEVELOPMENT_REWARDS.craft,'producción de Carpintería');
  state.lastCarpentryMessage=`Carpintería completada: +${handles} mango de pico y +${xp} XP de Carpintería.${cityProgress.note}`;
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
    state.lastSmithyMessage='Borin está descansando en el Mesón. Terminá su descanso antes de ponerlo a trabajar.';
    render();
    return;
  }

  if(recipe==='pickaxeHead'){
    if(!smithyHasStorageSpace(1)){
      state.lastSmithyMessage='El Almacén de Herrería está lleno. Liberá espacio antes de fabricar otra pieza.';
      render();
      return;
    }

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
  }else if(recipe==='ironSword'){
    if(!smithyHasStorageSpace(1)){
      state.lastSmithyMessage='El Almacén de Herrería está lleno. Liberá espacio antes de forjar otra espada.';
      render();
      return;
    }

    if(smithingLevel()<SWORD_RECIPE_LEVEL){
      state.lastSmithyMessage=`Borin necesita Herrería Nv. ${SWORD_RECIPE_LEVEL} para intentar esta receta.`;
      render();
      return;
    }

    if(borin.stamina<SWORD_STAMINA_COST){
      state.lastSmithyMessage=`Borin necesita ${SWORD_STAMINA_COST} de Resistencia para forjar la espada.`;
      render();
      return;
    }

    if(state.resources.iron<SWORD_IRON_COST){
      state.lastSmithyMessage=`Faltan ${SWORD_IRON_COST-state.resources.iron} de hierro para forjar la espada.`;
      render();
      return;
    }

    state.resources.iron-=SWORD_IRON_COST;
    borin.stamina-=SWORD_STAMINA_COST;

    const now=Date.now();
    borin.staminaUpdatedAt=now;
    const sword=createIronSword();

    state.activeCraft={
      id:createActionId(),
      recipe:'ironSword',
      label:'Forjando Espada de hierro',
      worker:'borin',
      startedAt:now,
      endsAt:now+SWORD_DURATION_MS,
      result:{ironSwords:[sword],smithingXp:SWORD_SMITHING_XP}
    };

    state.lastSmithyMessage='Borin comenzó a forjar una Espada de hierro. La calidad final ya quedó determinada y no puede repetirse recargando la app.';
  }else if(recipe==='ironPickaxe'){
    if(borin.stamina<ASSEMBLY_STAMINA_COST){
      state.lastSmithyMessage=`Borin necesita ${ASSEMBLY_STAMINA_COST} de Resistencia para ensamblar el pico.`;
      render();
      return;
    }

    if(smithyStorage().pickaxeHeads<1||carpenterStorage().woodenHandles<1){
      state.lastSmithyMessage='Para ensamblar el Pico de hierro hace falta 1 cabeza y 1 mango.';
      render();
      return;
    }

    smithyStorage().pickaxeHeads-=1;
    carpenterStorage().woodenHandles-=1;
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
  const swords=Array.isArray(craft.result?.ironSwords)?craft.result.ironSwords:[];
  const xp=Number(craft.result?.smithingXp)||0;

  smithyStorage().pickaxeHeads+=heads;
  smithyStorage().ironPickaxes+=pickaxes;
  smithyStorage().ironSwords.push(...swords);
  state.workers.borin.smithingXp+=xp;

  if(heads>0){
    state.buildings.smithy.craftedCount+=heads;
  }

  state.activeCraft=null;
  state.workers.borin.staminaUpdatedAt=craft.endsAt||Date.now();

  const cityProgress=addCityDevelopment(CITY.DEVELOPMENT_REWARDS.craft,'producción de Herrería');

  if(swords.length>0){
    const sword=swords[0];
    state.lastSmithyMessage=`Espada terminada: calidad ${sword.qualityLabel} (${sword.qualityScore}), daño ${sword.damage}, durabilidad ${sword.durability}. +${xp} XP de Herrería.${cityProgress.note}`;
  }else if(pickaxes>0){
    state.lastSmithyMessage=`Ensamblaje completado: +${pickaxes} Pico de hierro y +${xp} XP de Herrería.${cityProgress.note}`;
  }else{
    state.lastSmithyMessage=`Fabricación completada: +${heads} cabeza de pico y +${xp} XP de Herrería.${cityProgress.note}`;
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
  const cityProgress=addCityDevelopment(CITY.DEVELOPMENT_REWARDS.businessUpgrade,'mejora de negocio');
  state.lastSmithyMessage=`Herrería mejorada a Nv. 2. +${CITY.DEVELOPMENT_REWARDS.businessUpgrade} Desarrollo de ciudad.${cityProgress.note}`;
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
      :'Descansar en Mesón';
  }

  feedbackEl.textContent=state.lastInnMessage||'Libre: +1 cada 10 s. En Mesón: +5 cada 10 s.';
}

let swordInventorySignature='';
let smithyExhibitionSignature='';
let smithyBookSignature='';

function renderSwordInventory(){
  const swords=smithyStorage().ironSwords;
  const signature=swords.map(s=>`${s.id}:${s.salePrice}:${s.listed?1:0}`).join('|');

  if(signature===swordInventorySignature)return;
  swordInventorySignature=signature;
  els.swordInventoryList.replaceChildren();

  if(!swords.length){
    const empty=document.createElement('p');
    empty.className='muted';
    empty.textContent='Todavía no hay Espadas de hierro en el Almacén de Herrería.';
    els.swordInventoryList.append(empty);
    return;
  }

  swords.forEach((sword,index)=>{
    const row=document.createElement('article');
    row.className=`smithy-sword-row quality-${sword.qualityTier}`;

    const top=document.createElement('div');
    top.className='smithy-sword-top';
    top.innerHTML=`
      <strong>⚔️ Espada #${index+1}</strong>
      <span>${sword.qualityLabel} · ${sword.qualityScore}</span>
    `;

    const facts=document.createElement('div');
    facts.className='smithy-sword-facts';
    facts.innerHTML=`
      <span>Daño <b>${sword.damage}</b></span>
      <span>Dur. <b>${sword.durability}</b></span>
      <span>Valor <b>${formatNumber(sword.estimatedValue)} 🪙</b></span>
    `;

    const actions=document.createElement('div');
    actions.className='smithy-sword-actions';

    const price=document.createElement('label');
    price.className='compact-price';
    price.innerHTML=`<span>Precio</span><input type="number" min="5" max="9999" step="5" value="${sword.salePrice}" data-sword-price="${sword.id}" aria-label="Precio de venta de Espada #${index+1}">`;

    const listButton=document.createElement('button');
    listButton.className='small-action';
    listButton.dataset.swordList=sword.id;
    listButton.textContent=sword.listed?'Quitar':'Exhibir';

    actions.append(price,listButton);
    row.append(top,facts,actions);
    els.swordInventoryList.append(row);
  });
}

function renderSmithyExhibition(){
  const listed=smithyListedSwords();
  const signature=listed.map(s=>`${s.id}:${s.salePrice}`).join('|');

  els.smithyExhibitionCount.textContent=`${listed.length} ${listed.length===1?'pieza':'piezas'}`;

  if(signature===smithyExhibitionSignature)return;
  smithyExhibitionSignature=signature;
  els.smithyExhibitionList.replaceChildren();

  if(!listed.length){
    const empty=document.createElement('p');
    empty.className='muted';
    empty.textContent='No hay objetos en Exhibición. Podés colocar una espada desde Almacén.';
    els.smithyExhibitionList.append(empty);
    return;
  }

  listed.forEach(sword=>{
    const row=document.createElement('div');
    row.className='exhibition-row';
    row.innerHTML=`<span>⚔️ ${sword.qualityLabel} · ${sword.qualityScore} · Daño ${sword.damage}</span><strong>${formatNumber(sword.salePrice)} 🪙</strong>`;
    els.smithyExhibitionList.append(row);
  });
}

function renderSmithyVisitor(){
  const visitor=state.smithyTraffic.activeVisitor;
  const unread=state.smithyBook.unread;

  if(visitor){
    els.smithyVisitBadge.hidden=false;
    els.smithyVisitBadge.textContent='👤 Cliente';
    els.smithyVisitorState.textContent='Mirando Exhibición';
    els.smithyVisitorState.classList.add('is-busy');
    els.smithyVisitorCard.innerHTML=`
      <div class="visitor-name"><strong>${visitor.name}</strong><span>${visitor.role} · ${visitor.personality}</span></div>
      <div class="visitor-thoughts">
        <span>🪙 ${formatNumber(visitor.coinsAtVisit)}</span>
        <span>⚔️ Arma actual: daño ${visitor.weaponDamage}</span>
        <span>Necesidad: ${Math.round(visitor.need*100)}%</span>
      </div>
      <p>${visitor.context}</p>
      <small>Está evaluando ${visitor.offers.length} ${visitor.offers.length===1?'pieza':'piezas'} de la Exhibición.</small>
    `;
  }else{
    els.smithyVisitorState.textContent='Sin visitantes';
    els.smithyVisitorState.classList.remove('is-busy');
    els.smithyVisitorCard.innerHTML='<p class="muted">No hay nadie en la Herrería ahora. Las visitas continúan aunque estés en otra pantalla y sus resultados quedan anotados.</p>';

    if(unread>0){
      els.smithyVisitBadge.hidden=false;
      els.smithyVisitBadge.textContent=`📖 ${unread} ${unread===1?'nueva':'nuevas'}`;
    }else{
      els.smithyVisitBadge.hidden=true;
    }
  }
}

function renderSmithyBook(force=false){
  const archive=state.smithyBook.archive;
  const entries=state.smithyBook.entries;
  const signature=`${archive.visits}:${archive.purchases}:${archive.noPurchase}:${archive.revenue}|`+
    entries.map(e=>`${e.id}:${e.unread?1:0}`).join('|');

  if(!force&&signature===smithyBookSignature)return;
  smithyBookSignature=signature;

  els.smithyBookSummary.innerHTML=archive.visits>0
    ?`<strong>Resumen archivado</strong><span>${archive.visits} visitas · ${archive.purchases} ventas · ${archive.noPurchase} sin compra · ${formatNumber(archive.revenue)} 🪙 ingresadas</span>`
    :'<span class="muted">Todavía no hay visitas archivadas.</span>';

  els.smithyBookList.replaceChildren();

  if(!entries.length){
    const empty=document.createElement('p');
    empty.className='muted';
    empty.textContent='El libro todavía no tiene anotaciones.';
    els.smithyBookList.append(empty);
    return;
  }

  entries.forEach(entry=>{
    const item=document.createElement('article');
    item.className=`book-entry ${entry.unread?'is-unread':''}`;
    item.innerHTML=`
      <div class="book-entry-head">
        <strong>${entry.type==='sale'?'🪙':'👤'} ${entry.npcName} · ${entry.role}</strong>
        <time>${formatClock(entry.timestamp)}</time>
      </div>
      <small>${entry.personality} · ${entry.context}</small>
      <p>${entry.text}</p>
    `;
    els.smithyBookList.append(item);
  });
}

function renderFoundingAdventurers(){
  if(!els.kingdomAdventurerList)return;

  const activeCount=activeAdventurerCount();
  const levelSlots=CITY.slotsForLevel(state.city.level||1);
  const mesonCapacity=state.buildings.meson?.capacity||CITY.mesonCapacity(1);
  const residentLimit=Math.min(levelSlots,mesonCapacity);
  const next=CITY.nextLevelInfo(state.city);

  els.kingdomCityName.textContent=state.city.founded
    ?`${state.city.name} · Ciudad Nv. ${state.city.level}`
    :'Sin fundar';
  els.kingdomFoundingMeta.textContent=state.city.founded
    ?`Fundada en ${state.world.kingdom.name}. Desarrollo ${state.city.development.toFixed(2)}${next.maxed?' · nivel máximo de esta prueba':` / ${next.threshold}`}. Mesón Nv. ${state.buildings.meson.level}: ${activeCount}/${mesonCapacity} residentes.`
    :'El Pack inicial se genera al fundar la ciudad.';
  els.kingdomAdventurerCount.textContent=`${activeCount}/${residentLimit} plazas activas`;

  els.kingdomAdventurerList.replaceChildren();

  if(!state.adventurers.length){
    const empty=document.createElement('p');
    empty.className='muted';
    empty.textContent='Todavía no hay aventureros porque la ciudad no fue fundada.';
    els.kingdomAdventurerList.append(empty);
    return;
  }

  state.adventurers.forEach(npc=>{
    const card=document.createElement('article');
    card.className='founding-adventurer';
    card.innerHTML=`
      <div class="founding-adventurer-head">
        <div class="avatar">${npc.firstName.slice(0,1)}${npc.lastName.slice(0,1)}</div>
        <div>
          <strong>${npc.fullName}</strong>
          <span>${npc.role} · Nv. ${npc.level} · ${npc.personality} · ${npc.status}</span>
        </div>
      </div>
      <div class="founding-adventurer-stats">
        <span>❤️ ${npc.hpCurrent}/${npc.hpMax}</span>
        <span>⚔️ ${npc.stats.attack}</span>
        <span>🛡️ ${npc.stats.defense}</span>
        <span>⚡ ${npc.stats.initiative}</span>
        <span>🔷 ${npc.manaCurrent}/${npc.manaMax}</span>
      </div>
      <small>${DATA.adventurerRoles[npc.classKey]?.identity||npc.role} · Evasión ${Math.round((npc.evasion||0)*100)}%</small>
      <small>Originario de ${npc.originTier} ${npc.originCityName} · 🪙 ${formatNumber(npc.coins)} · XP ${npc.xp}/${DATA.adventurerProgression.xpToNext[npc.level]||'—'}</small>
      ${npc.populationMilestone?'<small class="arrival-note">🧭 '+(npc.populationMilestone==='city-level-2'?'Llegó al alcanzar Ciudad Nv. 2':'Llegó al alcanzar Ciudad Nv. 3')+'</small>':''}
    `;
    els.kingdomAdventurerList.append(card);
  });
}

const WORLD_DEPS={COMBAT};

function addWorldEvent(type,text,meta={}){
  if(!state.worldSystems?.chronology)return;
  state.worldSystems.chronology.events.unshift({
    id:createActionId(),
    atMinute:state.worldSystems.clockMinutes||0,
    day:state.worldSystems.day||1,
    type,
    text,
    meta
  });
  state.worldSystems.chronology.events=state.worldSystems.chronology.events.slice(0,80);
}

function syncCityFromIntegratedWorld(){
  const previousLevel=Number(state.city.level)||1;
  state.city=CITY.normalizeCityProgress(state.city);
  const currentLevel=Number(state.city.level)||1;

  if(currentLevel>previousLevel){
    for(let level=previousLevel+1;level<=currentLevel;level++){
      state.city.levelReachedAt[level]=state.city.levelReachedAt[level]||Date.now();
      addWorldEvent('city-level','La ciudad alcanzó Nv. '+level+'.');
    }
  }

  const arrivals=reconcileCityPopulation();
  for(const npc of arrivals){
    addWorldEvent('arrival',npc.fullName+' llegó a la ciudad como '+npc.role+'.',{adventurerId:npc.id});
  }
}

function worldEventClass(type){
  if(['combat-loss','city-attack','threat','special-loss'].includes(type))return 'is-danger';
  if(['mission-accept','queue','worker-outing','escort'].includes(type))return 'is-warning';
  if(['combat-win','special-win','craft','loot','meson','repair','building','arrival','city-level'].includes(type))return 'is-good';
  return '';
}

function appendWorldRow(container,{title,subtitle='',right='',className='',button=null}){
  if(!container)return null;
  const row=document.createElement('div');
  row.className='world-event-row '+className;

  const left=document.createElement('span');
  const strong=document.createElement('strong');
  strong.textContent=title;
  left.append(strong);
  if(subtitle){
    const small=document.createElement('small');
    small.textContent=subtitle;
    left.append(small);
  }

  const rightWrap=document.createElement('span');
  rightWrap.className='event-right';
  if(right){
    const r=document.createElement('strong');
    r.textContent=right;
    rightWrap.append(r);
  }
  if(button){
    const b=document.createElement('button');
    b.type='button';
    b.className='small-action';
    b.textContent=button.label;
    if(button.dataset){
      for(const [key,value] of Object.entries(button.dataset))b.dataset[key]=value;
    }
    rightWrap.append(b);
  }

  row.append(left,rightWrap);
  container.append(row);
  return row;
}

function renderWorldEvents(){
  if(!els.worldEventList)return;
  els.worldEventList.replaceChildren();
  const events=state.worldSystems.chronology.events.slice(0,12);
  if(!events.length){
    appendWorldRow(els.worldEventList,{title:'Todavía no hay acontecimientos',subtitle:'Avanzá el mundo desde Menú para iniciar la simulación.'});
    return;
  }
  for(const event of events){
    appendWorldRow(els.worldEventList,{
      title:event.text,
      subtitle:WORLD.formatWorldTime(event.atMinute),
      right:event.type,
      className:worldEventClass(event.type)
    });
  }
}

function renderMesonIntegrated(){
  if(!els.mesonAdventurerList)return;
  const meson=state.worldSystems.meson;
  const total=meson.platesSold+meson.rationsSold+meson.restsSold+meson.lodgingSold;
  els.mesonServiceSummary.textContent=total+' servicios';
  els.mesonAdventurerList.replaceChildren();

  for(const npc of state.adventurers){
    const need=WORLD.recoveryNeed(npc,DESIGN);
    const reason=npc.hpCurrent<=0
      ?'Incapacitado'
      :(need.needsRest?'Necesita recuperación':(need.moderate?'Desgaste moderado':'Preparado'));
    appendWorldRow(els.mesonAdventurerList,{
      title:npc.fullName+' · '+reason,
      subtitle:'PV '+npc.hpCurrent+'/'+npc.hpMax+' · Maná '+npc.manaCurrent+'/'+npc.manaMax+
        (npc.rationPrepared?' · Ración preparada':''),
      right:'🪙 '+formatNumber(npc.coins)
    });
  }
}

function renderTownHallIntegrated(){
  if(!els.townHallCoins)return;
  const snap=WORLD.townHallSnapshot(state,DESIGN);
  els.townHallCityLevel.textContent='Ciudad Nv. '+snap.cityLevel;
  els.townHallCoins.textContent=formatNumber(snap.coins);
  els.townHallReserved.textContent=formatNumber(snap.reserved);
  els.townHallAvailable.textContent=formatNumber(snap.available);
  els.townHallDevelopment.textContent=Number(snap.development).toFixed(2);
  els.townHallEra.textContent=snap.season.id;
  els.townHallDiamonds.textContent=formatNumber(snap.season.diamonds||0);

  els.townHallAlerts.replaceChildren();
  if(!snap.alerts.length){
    appendWorldRow(els.townHallAlerts,{title:'Sin alertas críticas',subtitle:'La ciudad funciona dentro de parámetros normales.',className:'is-good'});
  }else{
    for(const alert of snap.alerts){
      appendWorldRow(els.townHallAlerts,{
        title:alert.text,
        subtitle:alert.type,
        className:alert.severity==='critical'||alert.severity==='imminent'?'is-danger':'is-warning'
      });
    }
  }
}

function missionStatusLabel(status){
  return {
    open:'Publicada',
    accepted:'Aceptada',
    completed:'Completada',
    failed:'Fallida'
  }[status]||status;
}

function updateGuildRewardHint(){
  if(!els.guildEnemySelect||!els.guildRewardInput)return;
  const enemyKey=els.guildEnemySelect.value||'wolf';
  const maxCount=enemyKey==='wolf'?3:2;
  let count=Math.max(1,Math.floor(Number(els.guildEnemyCount.value)||1));
  count=Math.min(count,maxCount);
  els.guildEnemyCount.value=String(count);
  Array.from(els.guildEnemyCount.options).forEach(option=>{
    option.disabled=Number(option.value)>maxCount;
  });
  const reference=(DESIGN.mission.baseRewards[enemyKey]||6)*count;
  const min=Math.ceil(reference*DESIGN.mission.manualValueRange[0]);
  const max=Math.floor(reference*DESIGN.mission.manualValueRange[1]);
  els.guildRewardHint.textContent='Recomendado '+reference+' · permitido '+min+'–'+max+' monedas.';
  if(document.activeElement!==els.guildRewardInput){
    els.guildRewardInput.value=String(reference);
  }
}

function updateDeliveryHint(){
  if(!els.deliveryResourceSelect)return;
  const key=els.deliveryResourceSelect.value||'meat';
  const qty=Math.max(1,Math.floor(Number(els.deliveryQtyInput.value)||1));
  const cfg=DESIGN.resources[key];
  const level=Math.max(1,Math.min(3,Number(state.city.level)||1));
  const target=Number(DESIGN.market.targets[level]?.[key])||0;
  const have=Number(state.resources[key])||0;
  const need=Math.max(0,target-have);
  const reference=Math.max(1,(cfg?.price||1)*qty);
  const min=Math.ceil(reference*DESIGN.mission.manualValueRange[0]);
  const max=Math.floor(reference*DESIGN.mission.manualValueRange[1]);
  els.deliveryHint.textContent='Demanda '+Math.round(need*100)/100+' · recomendado '+reference+' · permitido '+min+'–'+max+'.';
  els.publishDeliveryMission.disabled=need<qty;
  if(document.activeElement!==els.deliveryRewardInput)els.deliveryRewardInput.value=String(reference);
}

function updateEscortHint(){
  if(!els.escortHint)return;
  const bands=['wolf','boar'].map(species=>WORLD.threatBand(state.worldSystems.threat.presence[species],DESIGN));
  const danger=Math.max(...bands.map(b=>DESIGN.threat.bands.findIndex(x=>x.id===b.id)));
  const enabled=danger>=2;
  const reference=10+Math.max(0,danger)*3;
  els.escortHint.textContent=enabled
    ?'Amenaza suficiente para escolta · recomendado '+reference+' monedas.'
    :'Amenaza baja: todavía no hace falta pagar una escolta.';
  els.publishEscortMission.disabled=!enabled;
  if(document.activeElement!==els.escortRewardInput)els.escortRewardInput.value=String(reference);
}

function renderGuildIntegrated(){
  if(!els.guildMissionList)return;
  updateGuildRewardHint();
  updateDeliveryHint();
  updateEscortHint();
  const missions=state.worldSystems.guild.missions;
  const active=missions.filter(m=>m.status==='open'||m.status==='accepted');
  const slots=state.buildings.guildHall?.missionSlots||DESIGN.mission.startingConcurrent;
  els.guildMissionCount.textContent=active.length+'/'+slots;
  els.guildMissionList.replaceChildren();

  if(!missions.length){
    appendWorldRow(els.guildMissionList,{title:'Tablón vacío',subtitle:'Publicá una misión de control para crear una oportunidad real.'});
    return;
  }

  for(const mission of missions.slice(0,12)){
    const npc=mission.acceptedBy?getAdventurer(mission.acceptedBy):null;
    let objective='';
    if(mission.type==='delivery'){
      objective=mission.qty+'× '+(DESIGN.resources[mission.resourceKey]?.name||mission.resourceKey);
    }else if(mission.type==='escort'){
      objective='Escolta · '+mission.workerKind;
    }else{
      const enemy=DESIGN.enemies[mission.enemyKey];
      objective=mission.count+'× '+(enemy?.name||mission.enemyKey);
    }
    const subtitle=[
      objective,
      '🪙 '+mission.reward,
      npc?'Aceptada por '+npc.fullName:''
    ].filter(Boolean).join(' · ');

    appendWorldRow(els.guildMissionList,{
      title:mission.id+' · '+missionStatusLabel(mission.status),
      subtitle,
      right:mission.status==='open'?(mission.active?'Activa':'Pausada'):'',
      className:mission.status==='completed'?'is-good':mission.status==='failed'?'is-danger':'',
      button:mission.status==='open'
        ?{label:mission.active?'Pausar':'Activar',dataset:{missionToggle:mission.id}}
        :null
    });
  }
}

function rawOriginQty(origin){
  const cfg=DESIGN.materialOrigins[origin];
  return cfg?Number(state.resources[cfg.raw]||0):0;
}

function tannedOriginQty(origin){
  const cfg=DESIGN.materialOrigins[origin];
  return cfg?Number(state.resources[cfg.tanned]||0):0;
}

function renderTextileIntegrated(){
  if(!els.textileBadge)return;
  const textile=state.worldSystems.textile;
  const unlocked=(state.city.level||1)>=DESIGN.buildings.textile.unlockCityLevel;
  els.cityTextileButton.hidden=!unlocked&&!textile.built;
  els.cityTextileLevel.textContent=textile.built?'Nv. 1':(unlocked?'Construir':'Bloqueada');

  els.textileBadge.textContent=textile.built
    ?'Textilería · Nv. 1'
    :(unlocked?'Textilería · Disponible':'Textilería · Requiere Ciudad Nv. 2');
  els.textileBuildPanel.hidden=textile.built;
  els.textileProductionPanel.hidden=!textile.built;

  if(!textile.built){
    const stock=state.worldSystems.production.stock;
    const cost=DESIGN.buildings.textile.buildCost;
    const ready=WORLD.availableTreasury(state)>=cost.coins&&
      (state.resources.wood||0)>=cost.wood&&
      (state.resources.stone||0)>=cost.stone&&
      (stock.nails||0)>=cost.nails&&
      (stock.scissors||0)>=cost.scissors&&unlocked;
    els.buildTextile.disabled=!ready;
  }

  if(!textile.built)return;

  els.tanningActions.replaceChildren();
  const origins=Object.keys(DESIGN.materialOrigins);
  for(const origin of origins){
    const cfg=DESIGN.materialOrigins[origin];
    const raw=rawOriginQty(origin);
    const b=document.createElement('button');
    b.type='button';
    b.className='small-action';
    b.dataset.tanOrigin=origin;
    b.disabled=raw<1;
    b.textContent=cfg.label+' · piel '+raw;
    els.tanningActions.append(b);
  }

  const totalTanned=origins.reduce((sum,o)=>sum+tannedOriginQty(o),0);
  els.tannedStockSummary.textContent=totalTanned+' cueros';

  const previous=els.textileOriginSelect.value;
  els.textileOriginSelect.replaceChildren();
  for(const origin of origins){
    const qty=tannedOriginQty(origin);
    if(qty<=0)continue;
    const option=document.createElement('option');
    option.value=origin;
    option.textContent=DESIGN.materialOrigins[origin].label+' · '+qty+' cuero';
    els.textileOriginSelect.append(option);
  }
  if(Array.from(els.textileOriginSelect.options).some(o=>o.value===previous)){
    els.textileOriginSelect.value=previous;
  }

  els.textileStockList.replaceChildren();
  const goods=state.worldSystems.production.goods;
  let any=false;
  for(const key of ['leatherProtection','leatherGloves','leatherBoots']){
    for(const product of goods[key]||[]){
      any=true;
      appendWorldRow(els.textileStockList,{
        title:product.name,
        subtitle:product.qualityLabel+' · Dur. '+product.durability+'/'+product.maxDurability,
        right:'🪙 '+product.salePrice
      });
    }
  }
  if(!any)appendWorldRow(els.textileStockList,{title:'Sin productos terminados',subtitle:'Curtí pieles y poné trabajos en cola.'});
}

function renderMapIntegrated(){
  if(!els.mapWorldTime)return;
  const snap=WORLD.mapSnapshot(state,DESIGN);
  els.mapWorldTime.textContent=WORLD.formatWorldTime(state.worldSystems.clockMinutes);
  els.wolfPresence.textContent=Math.round(snap.presence.wolf.value)+'/100 · '+snap.presence.wolf.band.label;
  els.wolfPresenceProgress.value=snap.presence.wolf.value;
  els.boarPresence.textContent=Math.round(snap.presence.boar.value)+'/100 · '+snap.presence.boar.band.label;
  els.boarPresenceProgress.value=snap.presence.boar.value;

  els.mapZoneList.replaceChildren();
  for(const zone of snap.zones){
    appendWorldRow(els.mapZoneList,{
      title:zone.name,
      subtitle:zone.kind+' · distancia '+zone.distance+(zone.requires?' · requiere '+zone.requires:''),
      right:zone.enemy?(DESIGN.enemies[zone.enemy]?.name||zone.enemy):''
    });
  }

  els.mapActiveAdventurers.replaceChildren();
  if(!snap.activeAdventurers.length){
    appendWorldRow(els.mapActiveAdventurers,{title:'Todos en la ciudad',subtitle:'Nadie está resolviendo una salida ahora mismo.'});
  }else{
    for(const entry of snap.activeAdventurers){
      const enemy=DESIGN.enemies[entry.activity.enemyKey];
      appendWorldRow(els.mapActiveAdventurers,{
        title:entry.name,
        subtitle:entry.activity.kind+' · '+entry.activity.count+'× '+(enemy?.name||entry.activity.enemyKey),
        right:'regresa '+WORLD.formatWorldTime(entry.activity.resolvesAtMinute)
      });
    }
  }

  if(els.mapWorkerToolsSummary){
    els.mapWorkerToolsSummary.replaceChildren();
    const workerTools=[
      ['Mara',state.workers.mara.worldTool],
      ['Leñador',state.workers.logger.worldTool],
      ['Cazador',state.workers.hunter.worldTool],
      ['Cazador · cosecha',state.workers.hunter.harvestTool]
    ];
    for(const [name,tool] of workerTools){
      if(!tool)continue;
      appendWorldRow(els.mapWorkerToolsSummary,{
        title:name+' · '+tool.name,
        subtitle:tool.tier==='improved'?'Herramienta mejorada':'Herramienta fundadora',
        right:'Dur. '+tool.durability+'/'+tool.maxDurability,
        className:tool.durability<=0?'is-danger':(tool.durability<=tool.maxDurability*.35?'is-warning':'')
      });
    }

    const stock=state.worldSystems.production.stock;
    els.equipMaraPickaxe.disabled=(stock.ironPickaxe||0)<1;
    els.equipLoggerAxe.disabled=(stock.workAxe||0)<1;
    els.equipHunterKnife.disabled=(stock.huntingKnife||0)<1;
    els.equipHunterBow.disabled=(state.worldSystems.production.goods.huntingBow||[]).length<1;

    const damaged=workerTools.some(([,tool])=>tool&&tool.durability<tool.maxDurability);
    els.repairWorkerTools.disabled=!damaged||WORLD.availableTreasury(state)<2;
  }
}

function renderProductionIntegrated(){
  if(els.smithyWorldQueue){
    const queue=state.worldSystems.production.queue;
    els.smithyWorldQueue.textContent='Cola '+queue.filter(j=>j.shop==='smithy').length+'/5';
    els.carpenterWorldQueue.textContent='Cola '+queue.filter(j=>j.shop==='carpenter').length+'/5';
  }

  if(els.worldResourceGrid){
    els.worldResourceGrid.replaceChildren();
    const keys=['firewood','meat','skin','tendon','wolfSkin','boarSkin','alphaWolfSkin','greatBoarSkin'];
    for(const key of keys){
      const item=DESIGN.resources[key];
      const div=document.createElement('div');
      const label=document.createElement('span');
      const value=document.createElement('strong');
      label.textContent=item?.name||key;
      value.textContent=String(Math.round((state.resources[key]||0)*100)/100);
      div.append(label,value);
      els.worldResourceGrid.append(div);
    }
  }

  if(els.worldProductionStock){
    els.worldProductionStock.replaceChildren();
    const stock=state.worldSystems.production.stock;
    for(const key of ['nails','arrowheads','pickaxeHead','axeHead','ironPickaxe','workAxe','huntingKnife','scissors','toolHandle','arrowBundle']){
      const qty=stock[key]||0;
      const div=document.createElement('div');
      const label=document.createElement('span');
      const value=document.createElement('strong');
      label.textContent=DESIGN.recipes[key]?.name||key;
      value.textContent=String(qty);
      div.append(label,value);
      els.worldProductionStock.append(div);
    }
  }
}

function renderSimulationIntegrated(){
  if(!els.simulationClock)return;
  els.simulationClock.textContent=WORLD.formatWorldTime(state.worldSystems.clockMinutes);
  els.simulationEventCount.textContent=state.worldSystems.chronology.events.length+' eventos';
  els.worldClockKingdom.textContent=WORLD.formatWorldTime(state.worldSystems.clockMinutes);
}

function renderIntegratedWorld(){
  WORLD.normalizeState(state,DATA,DESIGN);
  renderWorldEvents();
  renderMesonIntegrated();
  renderTownHallIntegrated();
  renderGuildIntegrated();
  renderTextileIntegrated();
  renderMapIntegrated();
  renderProductionIntegrated();
  renderSimulationIntegrated();
}

function advanceIntegratedWorld(minutes){
  if(!state.city.founded){
    if(els.simulationFeedback)els.simulationFeedback.textContent='Primero fundá la ciudad.';
    return;
  }
  const result=WORLD.advanceWorld(state,minutes,WORLD_DEPS,DATA,DESIGN,Math.random);
  syncCityFromIntegratedWorld();
  saveState();
  if(els.simulationFeedback){
    const last=result.events[0]?.text||'El mundo avanzó sin novedades importantes.';
    els.simulationFeedback.textContent='Avanzaron '+result.minutes+' min. '+last;
  }
  render();
}

function publishGuildMissionAction(){
  const enemyKey=els.guildEnemySelect.value||'wolf';
  const count=Math.max(1,Math.floor(Number(els.guildEnemyCount.value)||1));
  const reward=Math.max(1,Math.round(Number(els.guildRewardInput.value)||1));
  const result=WORLD.publishHuntMission(state,{enemyKey,count,reward},DESIGN);
  els.guildFeedback.textContent=result.ok?'Misión publicada. Los aventureros decidirán si la aceptan.':result.reason;
  if(result.ok)saveState();
  render();
}

function publishDeliveryMissionAction(){
  const resourceKey=els.deliveryResourceSelect.value||'meat';
  const qty=Math.max(1,Math.floor(Number(els.deliveryQtyInput.value)||1));
  const reward=Math.max(1,Math.round(Number(els.deliveryRewardInput.value)||1));
  const result=WORLD.publishDeliveryMission(state,{resourceKey,qty,reward},DESIGN);
  els.deliveryFeedback.textContent=result.ok
    ?'Entrega publicada. Sólo la aceptará quien tenga ese material.'
    :result.reason;
  if(result.ok)saveState();
  render();
}

function publishEscortMissionAction(){
  const workerKind=els.escortWorkerSelect.value||'mine';
  const reward=Math.max(1,Math.round(Number(els.escortRewardInput.value)||1));
  const result=WORLD.publishEscortMission(state,{workerKind,reward},DESIGN);
  els.escortFeedback.textContent=result.ok
    ?'Escolta publicada. Un aventurero decidirá si toma el riesgo.'
    :result.reason;
  if(result.ok)saveState();
  render();
}

function buildTextileAction(){
  const result=WORLD.buildTextile(state,DESIGN);
  els.textileFeedback.textContent=result.ok?'Textilería construida.':result.reason;
  if(result.ok){
    syncCityFromIntegratedWorld();
    saveState();
  }
  render();
}

function enqueueApprovedRecipe(recipeKey){
  const recipe=DESIGN.recipes[recipeKey];
  if(!recipe)return;
  let origin='neutral';
  if(recipe.shop==='textile'){
    origin=els.textileOriginSelect?.value||'neutral';
    if(!els.textileOriginSelect?.options.length){
      els.textileFeedback.textContent='No hay cuero curtido disponible.';
      return;
    }
  }
  const result=WORLD.enqueueRecipe(state,recipeKey,DESIGN,origin);
  const feedback=recipe.shop==='smithy'
    ?els.smithyWorldFeedback
    :(recipe.shop==='carpenter'?els.carpenterWorldFeedback:els.textileFeedback);
  if(feedback)feedback.textContent=result.ok
    ?recipe.name+' agregado a la cola. Materiales reservados.'
    :result.reason;
  if(result.ok)saveState();
  render();
}

function integratedWorkerOuting(kind){
  const result=WORLD.workerOuting(state,kind,DESIGN,Math.random);
  if(result.ok){
    syncCityFromIntegratedWorld();
    const gained=Object.entries(result.gained).map(([k,v])=>(DESIGN.resources[k]?.name||k)+' +'+v).join(' · ');
    els.mapOutingFeedback.textContent=gained+
      (result.special?' · '+result.special:'')+
      (result.escort?' · salida escoltada':'')+
      (result.injured?' · trabajador herido':'');
    saveState();
  }else{
    els.mapOutingFeedback.textContent=result.reason||'No se pudo realizar la salida.';
  }
  render();
}

function equipIntegratedWorkerTool(workerKey,toolKey){
  const result=WORLD.equipWorkerTool(state,workerKey,toolKey,DESIGN);
  els.mapOutingFeedback.textContent=result.ok
    ?result.tool.name+' equipado.'
    :result.reason;
  if(result.ok)saveState();
  render();
}

function repairIntegratedWorkerTools(){
  const result=WORLD.repairWorkerTools(state,DESIGN);
  els.mapOutingFeedback.textContent=result.ok
    ?'Herramientas reparadas: '+result.repaired.join(', ')+'.'
    :result.reason;
  if(result.ok)saveState();
  render();
}

let activityAdventurerSignature='';

function selectedActivityAdventurer(){
  const selectedId=els.activityAdventurerSelect?.value;
  return getAdventurer(selectedId)||state.adventurers.find(npc=>npc.active!==false)||null;
}

function appendActivityPreviewRow(labelText,valueText){
  const row=document.createElement('div');
  const label=document.createElement('span');
  const value=document.createElement('strong');
  label.textContent=labelText;
  value.textContent=valueText;
  row.append(label,value);
  els.activityPreview.append(row);
}

function renderActivityLog(){
  if(!els.activityLogList)return;
  els.activityLogList.replaceChildren();

  if(!state.activityLog.length){
    const empty=document.createElement('p');
    empty.className='muted';
    empty.textContent='Todavía no hay salidas resueltas.';
    els.activityLogList.append(empty);
    return;
  }

  state.activityLog.forEach(entry=>{
    const row=document.createElement('div');
    row.className='activity-log-row '+(entry.won?'is-win':'is-loss');

    const left=document.createElement('span');
    const leftStrong=document.createElement('strong');
    const leftSmall=document.createElement('small');
    leftStrong.textContent=(entry.won?'✅ ':'⚠️ ')+entry.adventurerName;
    leftSmall.textContent=entry.enemyCount+'× '+entry.enemyName+' · Nv. '+entry.levelAfter;
    left.append(leftStrong,leftSmall);

    const right=document.createElement('span');
    const rightStrong=document.createElement('b');
    const rightSmall=document.createElement('small');
    rightStrong.textContent=entry.won?('+'+entry.xpGained+' XP'):('-'+entry.xpLost+' XP');
    rightSmall.textContent='-'+entry.hpLoss+' PV · -'+entry.manaLoss+' Maná';
    right.append(rightStrong,rightSmall);

    row.append(left,right);
    els.activityLogList.append(row);
  });
}

function renderAdventurerActivity(){
  if(!els.activityAdventurerSelect)return;

  const active=state.adventurers.filter(npc=>npc.active!==false);
  const signature=active.map(npc=>[
    npc.id,npc.level,npc.hpCurrent,npc.manaCurrent,npc.status
  ].join(':')).join('|');
  const previous=els.activityAdventurerSelect.value;

  if(signature!==activityAdventurerSignature){
    activityAdventurerSignature=signature;
    els.activityAdventurerSelect.replaceChildren();

    active.forEach(npc=>{
      const option=document.createElement('option');
      option.value=npc.id;
      option.textContent=npc.fullName+' · '+npc.role+' Nv. '+npc.level+' · '+npc.hpCurrent+'/'+npc.hpMax+' PV';
      els.activityAdventurerSelect.append(option);
    });

    if(active.some(npc=>npc.id===previous))els.activityAdventurerSelect.value=previous;
  }

  const npc=selectedActivityAdventurer();
  els.activityPreview.replaceChildren();

  if(!npc){
    const empty=document.createElement('p');
    empty.className='muted';
    empty.textContent='No hay aventureros disponibles.';
    els.activityPreview.append(empty);
    els.resolveAdventurerActivity.disabled=true;
    renderActivityLog();
    return;
  }

  const enemyKey=els.activityEnemySelect.value||'wolf';
  const enemy=DATA.activityCombat.enemies[enemyKey];
  let count=Math.max(1,Math.floor(Number(els.activityEnemyCount.value)||1));
  count=Math.min(count,enemy.maxCount);
  els.activityEnemyCount.value=String(count);

  Array.from(els.activityEnemyCount.options).forEach(option=>{
    option.disabled=Number(option.value)>enemy.maxCount;
  });

  const preview=COMBAT.previewEncounter(npc,enemyKey,count,DATA);
  const hpExpected=Math.ceil(npc.hpMax*preview.meanHpLossRate);
  const manaExpected=Math.ceil(npc.manaMax*preview.meanManaUseRate);
  const chance=Math.round(preview.winChance*1000)/10;

  appendActivityPreviewRow('Victoria estimada',chance+'%');
  appendActivityPreviewRow('Desgaste medio','~'+hpExpected+' PV · ~'+manaExpected+' Maná');
  appendActivityPreviewRow('Recompensa','+'+preview.xpReward+' XP');
  appendActivityPreviewRow(
    'Enemigo',
    'PV '+preview.enemySnapshot.hp+' · ATQ '+preview.enemySnapshot.attack+' · DEF '+preview.enemySnapshot.defense
  );

  const incapacitated=npc.hpCurrent<=0||npc.status==='Incapacitado';
  els.resolveAdventurerActivity.disabled=incapacitated;
  els.resolveAdventurerActivity.textContent=incapacitated?'Aventurero incapacitado':'Resolver salida';
  els.activityState.textContent=incapacitated?'Incapacitado':'Lista';
  els.activityState.classList.toggle('is-busy',incapacitated);
  els.activityResult.textContent=state.lastActivityMessage||'Elegí aventurero y objetivo. La resolución es instantánea.';
  renderActivityLog();
}

function resolveAdventurerActivity(){
  const npc=selectedActivityAdventurer();
  if(!npc)return;

  if(npc.hpCurrent<=0||npc.status==='Incapacitado'){
    state.lastActivityMessage=npc.fullName+' está incapacitado. La recuperación real llegará en v0.9.0d.';
    render();
    return;
  }

  const enemyKey=els.activityEnemySelect.value||'wolf';
  const enemy=DATA.activityCombat.enemies[enemyKey];
  const count=Math.min(
    Math.max(1,Math.floor(Number(els.activityEnemyCount.value)||1)),
    enemy.maxCount
  );
  const result=COMBAT.resolveEncounter(npc,enemyKey,count,DATA,Math.random);
  const index=state.adventurers.findIndex(item=>item.id===npc.id);
  if(index<0)return;

  state.adventurers[index]=result.adventurer;
  state.activityLog.unshift({
    id:createActionId(),
    at:Date.now(),
    adventurerId:npc.id,
    adventurerName:npc.fullName,
    enemyKey,
    enemyName:result.preview.enemyName,
    enemyCount:result.preview.count,
    won:result.won,
    hpLoss:result.hpLoss,
    manaLoss:result.manaLoss,
    xpGained:result.xpGained,
    xpLost:result.xpLost,
    levelAfter:result.adventurer.level
  });
  state.activityLog=state.activityLog.slice(0,12);

  if(result.won){
    const levelText=result.levelsGained.length
      ?' Subió a Nv. '+result.adventurer.level+'.'
      :'';
    state.lastActivityMessage='✅ '+npc.fullName+' venció '+result.preview.count+'× '+result.preview.enemyName+
      ': -'+result.hpLoss+' PV, -'+result.manaLoss+' Maná, +'+result.xpGained+' XP.'+levelText;
  }else{
    state.lastActivityMessage='⚠️ '+npc.fullName+' fue incapacitado por '+result.preview.count+'× '+
      result.preview.enemyName+'. Perdió '+result.xpLost+' XP del nivel actual, pero conserva su nivel.';
  }

  activityAdventurerSignature='';
  saveState();
  render();
}

function render(){
  updateFoundationGate();
  if(els.localTestTools)els.localTestTools.hidden=!isLocalTestHost();
  if(els.manualCombatLab)els.manualCombatLab.hidden=!isLocalTestHost();
  WORLD.normalizeState(state,DATA,DESIGN);
  resolveExpiredExpedition();
  resolveExpiredCraft();
  resolveExpiredCarpentry();
  syncAllWorkerStamina();
  if(LEGACY_SMITHY_TRAFFIC_ENABLED)tickSmithyTraffic();

  els.coins.textContent=formatNumber(state.resources.coins);

  const cityNext=CITY.nextLevelInfo(state.city);
  const activeResidents=activeAdventurerCount();
  const citySlots=CITY.slotsForLevel(state.city.level);
  const mesonCapacity=state.buildings.meson.capacity;
  const residentLimit=Math.min(citySlots,mesonCapacity);

  els.cityLevelBadge.textContent=`Ciudad Nv. ${state.city.level}`;
  els.cityDevelopment.textContent=state.city.development.toFixed(2);
  els.cityDevelopmentTarget.textContent=cityNext.maxed?'MAX':cityNext.threshold;
  els.cityDevelopmentProgress.max=cityNext.maxed
    ?CITY.thresholdForLevel(CITY.MAX_CITY_LEVEL)
    :cityNext.threshold;
  els.cityDevelopmentProgress.value=Math.min(state.city.development,els.cityDevelopmentProgress.max);
  els.cityPopulationSummary.textContent=`Aventureros ${activeResidents}/${residentLimit} · Mesón ${activeResidents}/${mesonCapacity}`;
  els.cityProgressHint.textContent=cityNext.maxed
    ?'Nivel máximo disponible en v0.9.0g1. La población queda limitada a 5 residentes.'
    :`Faltan ${cityNext.remaining.toFixed(2)} de Desarrollo para Ciudad Nv. ${cityNext.level}. Expediciones, producción y mejoras hacen crecer la ciudad.`;
  els.smithyLevelCity.textContent=state.buildings.smithy.level;
  if(currentScreen()==='city')title.textContent=state.city.founded?state.city.name:'Nueva ciudad';
  renderFoundingAdventurers();
  renderAdventurerActivity();
  renderIntegratedWorld();

  els.inventoryCoins.textContent=formatNumber(state.resources.coins);
  els.inventoryWood.textContent=formatNumber(state.resources.wood);
  els.inventoryIron.textContent=formatNumber(state.resources.iron);
  els.inventoryStone.textContent=formatNumber(state.resources.stone);
  els.inventoryMaraTool.textContent=hasIronPickaxeEquipped()?'Pico de hierro':'Sin equipar';
  renderSwordInventory();
  renderSmithyExhibition();
  renderSmithyVisitor();
  renderSmithyBook();

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
    els.expeditionStatus.textContent=resting?'En el Mesón':'Lista para partir';
    els.expeditionProgress.value=0;
    els.expeditionCountdown.textContent='';

    if(resting){
      els.startExpedition.disabled=true;
      els.startExpedition.textContent='Mara está descansando';
    }else if(!enoughStamina){
      els.startExpedition.disabled=true;
      els.startExpedition.textContent='Sin res.';
    }else{
      els.startExpedition.disabled=false;
      els.startExpedition.textContent='Iniciar expedición';
    }
  }

  const pickaxeEquipped=hasIronPickaxeEquipped();
  els.expeditionTool.textContent=pickaxeEquipped?'Pico de hierro equipado':'Sin pico';
  els.hardVeinChance.textContent=pickaxeEquipped?'15%':'No disponible';
  els.expeditionPickaxes.textContent=formatNumber(smithyStorage().ironPickaxes);

  if(pickaxeEquipped){
    els.equipIronPickaxe.disabled=true;
    els.equipIronPickaxe.textContent='Pico de hierro equipado';
  }else if(exp||state.workers.mara.restingAtInn){
    els.equipIronPickaxe.disabled=true;
    els.equipIronPickaxe.textContent='Mara no está disponible';
  }else if(smithyStorage().ironPickaxes<1){
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
  els.carpenterHandles.textContent=formatNumber(carpenterStorage().woodenHandles);

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
    els.carpenterEldonState.textContent=resting?'En el Mesón':'Disponible';
    els.carpenterEldonState.classList.toggle('is-busy',resting);
    els.carpentryStatus.textContent=resting?'Eldon descansando':'Lista para fabricar';
    els.carpentryProgress.value=0;
    els.carpentryCountdown.textContent='';

    if(resting){
      els.startHandleCraft.disabled=true;
      els.startHandleCraft.textContent='Eldon está descansando';
    }else if(!enoughStamina){
      els.startHandleCraft.disabled=true;
      els.startHandleCraft.textContent='Sin res.';
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
  els.smithyPickaxeHeads.textContent=formatNumber(smithyStorage().pickaxeHeads);
  els.smithyHandles.textContent=formatNumber(carpenterStorage().woodenHandles);
  els.smithyIronPickaxes.textContent=formatNumber(smithyStorage().ironPickaxes);
  els.smithyIronSwords.textContent=formatNumber(smithyStorage().ironSwords.length);
  els.smithyStorageUsed.textContent=formatNumber(smithyStorageUsed());
  els.smithyStorageCapacity.textContent=formatNumber(state.shops.smithy.storageCapacity);
  els.smithyExhibitionCapacity.textContent=formatNumber(state.shops.smithy.exhibitionCapacity);

  const qualityChances=swordQualityChances();
  els.swordExcellentChance.textContent=`${qualityChances.excellent}%`;
  els.swordQualityDistribution.textContent=
    `Mediocre ${qualityChances.mediocre}% · Normal ${qualityChances.normal}% · Buena ${qualityChances.good}% · Excelente ${qualityChances.excellent}%`;

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
    els.startHeadCraft.textContent='Ocupado';
    els.startPickaxeAssembly.disabled=true;
    els.startPickaxeAssembly.textContent='Ocupado';
    els.startSwordCraft.disabled=true;
    els.startSwordCraft.textContent='Ocupado';
  }else{
    const resting=state.workers.borin.restingAtInn;
    const headStamina=state.workers.borin.stamina>=CRAFT_STAMINA_COST;
    const assemblyStamina=state.workers.borin.stamina>=ASSEMBLY_STAMINA_COST;
    const enoughIron=state.resources.iron>=CRAFT_IRON_COST;
    const hasComponents=smithyStorage().pickaxeHeads>=1&&carpenterStorage().woodenHandles>=1;
    const swordUnlocked=smithingLevel()>=SWORD_RECIPE_LEVEL;
    const swordStamina=state.workers.borin.stamina>=SWORD_STAMINA_COST;
    const swordIron=state.resources.iron>=SWORD_IRON_COST;
    const storageSpace=smithyHasStorageSpace(1);

    els.borinState.textContent=resting?'Descansando':'Disponible';
    els.borinState.classList.toggle('is-busy',resting);
    els.smithyBorinState.textContent=resting?'En el Mesón':'Disponible';
    els.smithyBorinState.classList.toggle('is-busy',resting);
    els.craftStatus.textContent=resting?'Borin descansando':'Lista para trabajar';
    els.craftProgress.value=0;
    els.craftCountdown.textContent='';

    if(resting){
      els.startHeadCraft.disabled=true;
      els.startHeadCraft.textContent='Descansando';
      els.startPickaxeAssembly.disabled=true;
      els.startPickaxeAssembly.textContent='Descansando';
      els.startSwordCraft.disabled=true;
      els.startSwordCraft.textContent='Descansando';
    }else{
      els.startHeadCraft.disabled=!headStamina||!enoughIron||!storageSpace;
      els.startHeadCraft.textContent=!storageSpace
        ?'Almacén lleno'
        :!headStamina
          ?'Sin res.'
          :!enoughIron
            ?`Falta hierro`
            :'Fabricar';

      els.startPickaxeAssembly.disabled=!assemblyStamina||!hasComponents;
      els.startPickaxeAssembly.textContent=!assemblyStamina
        ?'Sin res.'
        :!hasComponents
          ?'Faltan piezas'
          :'Ensamblar';

      els.startSwordCraft.disabled=!swordUnlocked||!swordStamina||!swordIron||!storageSpace;
      els.startSwordCraft.textContent=!storageSpace
        ?'Almacén lleno'
        :!swordUnlocked
          ?`Requiere Nv. ${SWORD_RECIPE_LEVEL}`
          :!swordStamina
            ?'Sin res.'
            :!swordIron
              ?`Falta hierro`
              :'Forjar';
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

let activeSmithyTab='craft';

function setSmithyTab(tab){
  activeSmithyTab=tab;
  if(tab==='book'){
    markSmithyBookRead();
    renderSmithyBook(true);
    renderSmithyVisitor();
  }
  document.querySelectorAll('[data-smithy-tab]').forEach(button=>{
    button.classList.toggle('is-active',button.dataset.smithyTab===tab);
  });
  document.querySelectorAll('[data-smithy-panel]').forEach(panel=>{
    const active=panel.dataset.smithyPanel===tab;
    panel.classList.toggle('is-active',active);
    panel.hidden=!active;
  });
}

document.querySelectorAll('[data-smithy-tab]').forEach(button=>{
  button.addEventListener('click',()=>setSmithyTab(button.dataset.smithyTab));
});
setSmithyTab(activeSmithyTab);

els.startExpedition.addEventListener('click',startExpedition);
els.equipIronPickaxe.addEventListener('click',equipIronPickaxe);
els.startHandleCraft.addEventListener('click',startHandleCraft);
els.startHeadCraft.addEventListener('click',()=>startSmithyCraft('pickaxeHead'));
els.startPickaxeAssembly.addEventListener('click',()=>startSmithyCraft('ironPickaxe'));
els.startSwordCraft.addEventListener('click',()=>startSmithyCraft('ironSword'));
els.toggleMaraInnRest.addEventListener('click',()=>toggleInnRest('mara'));
els.toggleBorinInnRest.addEventListener('click',()=>toggleInnRest('borin'));
els.toggleEldonInnRest.addEventListener('click',()=>toggleInnRest('eldon'));
els.upgradeSmithy.addEventListener('click',upgradeSmithy);
if(els.testReachNextCityLevel)els.testReachNextCityLevel.addEventListener('click',reachNextCityLevelForLocalTest);
if(els.testRecoverAdventurers)els.testRecoverAdventurers.addEventListener('click',recoverAdventurersForLocalTest);
if(els.resolveAdventurerActivity)els.resolveAdventurerActivity.addEventListener('click',resolveAdventurerActivity);
if(els.activityAdventurerSelect)els.activityAdventurerSelect.addEventListener('change',render);
if(els.activityEnemySelect)els.activityEnemySelect.addEventListener('change',render);
if(els.activityEnemyCount)els.activityEnemyCount.addEventListener('change',render);

if(els.advanceWorld10)els.advanceWorld10.addEventListener('click',()=>advanceIntegratedWorld(10));
if(els.advanceWorld30)els.advanceWorld30.addEventListener('click',()=>advanceIntegratedWorld(30));
if(els.advanceWorld120)els.advanceWorld120.addEventListener('click',()=>advanceIntegratedWorld(120));

if(els.publishGuildMission)els.publishGuildMission.addEventListener('click',publishGuildMissionAction);
if(els.guildEnemySelect)els.guildEnemySelect.addEventListener('change',updateGuildRewardHint);
if(els.guildEnemyCount)els.guildEnemyCount.addEventListener('change',updateGuildRewardHint);
if(els.publishDeliveryMission)els.publishDeliveryMission.addEventListener('click',publishDeliveryMissionAction);
if(els.deliveryResourceSelect)els.deliveryResourceSelect.addEventListener('change',updateDeliveryHint);
if(els.deliveryQtyInput)els.deliveryQtyInput.addEventListener('input',updateDeliveryHint);
if(els.publishEscortMission)els.publishEscortMission.addEventListener('click',publishEscortMissionAction);
if(els.escortWorkerSelect)els.escortWorkerSelect.addEventListener('change',updateEscortHint);
if(els.guildMissionList)els.guildMissionList.addEventListener('click',event=>{
  const button=event.target.closest('[data-mission-toggle]');
  if(!button)return;
  const result=WORLD.toggleMission(state,button.dataset.missionToggle);
  if(result.ok){
    saveState();
    render();
  }
});

if(els.buildTextile)els.buildTextile.addEventListener('click',buildTextileAction);
if(els.tanningActions)els.tanningActions.addEventListener('click',event=>{
  const button=event.target.closest('[data-tan-origin]');
  if(!button)return;
  const result=WORLD.tanHide(state,button.dataset.tanOrigin,DESIGN);
  els.textileFeedback.textContent=result.ok?'Piel curtida conservando su origen.':result.reason;
  if(result.ok){
    syncCityFromIntegratedWorld();
    saveState();
  }
  render();
});

document.querySelectorAll('[data-world-recipe]').forEach(button=>{
  button.addEventListener('click',()=>enqueueApprovedRecipe(button.dataset.worldRecipe));
});

if(els.mapMineOuting)els.mapMineOuting.addEventListener('click',()=>integratedWorkerOuting('mine'));
if(els.mapWoodOuting)els.mapWoodOuting.addEventListener('click',()=>integratedWorkerOuting('wood'));
if(els.mapHuntOuting)els.mapHuntOuting.addEventListener('click',()=>integratedWorkerOuting('hunt'));
if(els.equipMaraPickaxe)els.equipMaraPickaxe.addEventListener('click',()=>equipIntegratedWorkerTool('mara','ironPickaxe'));
if(els.equipLoggerAxe)els.equipLoggerAxe.addEventListener('click',()=>equipIntegratedWorkerTool('logger','workAxe'));
if(els.equipHunterBow)els.equipHunterBow.addEventListener('click',()=>equipIntegratedWorkerTool('hunter','huntingBow'));
if(els.equipHunterKnife)els.equipHunterKnife.addEventListener('click',()=>equipIntegratedWorkerTool('hunter','huntingKnife'));
if(els.repairWorkerTools)els.repairWorkerTools.addEventListener('click',repairIntegratedWorkerTools);

els.swordInventoryList.addEventListener('change',event=>{
  const input=event.target.closest('[data-sword-price]');
  if(!input)return;

  const sword=smithyStorage().ironSwords.find(item=>item.id===input.dataset.swordPrice);
  if(!sword)return;

  const price=Math.max(5,Math.min(9999,Math.round(Number(input.value)||sword.estimatedValue)));
  sword.salePrice=price;
  input.value=price;
  swordInventorySignature='';
  smithyExhibitionSignature='';
  saveState();
});

els.swordInventoryList.addEventListener('click',event=>{
  const button=event.target.closest('[data-sword-list]');
  if(!button)return;

  const sword=smithyStorage().ironSwords.find(item=>item.id===button.dataset.swordList);
  if(!sword)return;

  if(!sword.listed&&smithyListedSwords().length>=state.shops.smithy.exhibitionCapacity){
    state.lastSmithyMessage=`La Exhibición está completa (${state.shops.smithy.exhibitionCapacity}/${state.shops.smithy.exhibitionCapacity}). Quitá una pieza antes de exponer otra.`;
    setSmithyTab('sale');
    render();
    return;
  }

  sword.listed=!sword.listed;
  swordInventorySignature='';
  smithyExhibitionSignature='';
  saveState();
  render();
});

els.clearSmithyBook.addEventListener('click',clearReadSmithyBook);

if(LEGACY_SMITHY_TRAFFIC_ENABLED)catchUpSmithyTraffic();
document.getElementById('foundCityBtn')?.addEventListener('click',foundCity);
document.getElementById('foundationCityName')?.addEventListener('keydown',event=>{
  if(event.key==='Enter')foundCity();
});
document.getElementById('resetWorldBtn')?.addEventListener('click',resetTestWorld);

setInterval(render,500);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){
    if(LEGACY_SMITHY_TRAFFIC_ENABLED)catchUpSmithyTraffic();
    render();
  }
});
window.addEventListener('focus',()=>{
  if(LEGACY_SMITHY_TRAFFIC_ENABLED)catchUpSmithyTraffic();
  render();
});

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
  if(isLocalTestHost()){
    // En localhost priorizamos siempre los archivos reales del branch de prueba.
    // Evita que un Service Worker de una versión anterior oculte cambios de desarrollo.
    window.addEventListener('load',async()=>{
      try{
        const regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg=>reg.unregister()));
        if('caches' in globalThis){
          const keys=await caches.keys();
          await Promise.all(keys.map(key=>caches.delete(key)));
        }
      }catch{}
    });
  }else{
    let refreshing=false;

    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(refreshing)return;
      refreshing=true;
      window.location.reload();
    });

    window.addEventListener('load',async()=>{
      try{
        const reg=await navigator.serviceWorker.register('./sw.js?v=0.9.0g1',{updateViaCache:'none'});
        await reg.update();
      }catch{}
    });
  }
}

render();
