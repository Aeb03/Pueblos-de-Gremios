const APP_VERSION='0.8.1';
const SAVE_KEY='pueblos-gremios-save-v0.8.0';
const DATA=globalThis.PG_DATA;

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

const titles={
  city:'Ciudad',
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
    smithy:{level:DATA.shops.smithy.startingLevel,craftedCount:0}
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
        smithy:{...base.buildings.smithy,...(saved.buildings?.smithy||{})}
      },
      adventurers:Array.isArray(saved.adventurers)?saved.adventurers:[],
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
    return merged;
  }catch{
    return defaultState();
  }
}

let state=loadState();

function saveState(){
  state.version=APP_VERSION;
  localStorage.setItem(SAVE_KEY,JSON.stringify(state));
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

function rollAdventurerStats(role){
  const variationBudget=2;
  const stats={...role.baseStats};
  const keys=['attack','defense','speed','support'];
  for(let i=0;i<variationBudget;i++){
    const up=randomChoice(keys);
    const down=randomChoice(keys.filter(key=>key!==up&&stats[key]>2));
    stats[up]+=1;
    stats[down]-=1;
  }
  stats.hp+=randomInt(-4,4);
  return stats;
}

function generateAdventurer({city,roleKey,existingFullNames}){
  const role=DATA.adventurerRoles[roleKey];
  const personality=randomChoice(Object.values(DATA.personalities));
  const name=uniqueAdventurerName(existingFullNames);
  existingFullNames.add(name.fullName);
  const stats=rollAdventurerStats(role);
  const weaponQuality=randomInt(45,58);

  return {
    id:createActionId(),
    firstName:name.firstName,
    lastName:name.lastName,
    fullName:name.fullName,
    originCityId:city.id,
    originCityName:city.name,
    originTier:city.tier,
    currentCityId:city.id,
    currentCityName:city.name,
    level:1,
    xp:0,
    roleKey:role.id,
    role:role.label,
    personalityKey:personality.id,
    personality:personality.label,
    traits:{...personality.traits},
    stats,
    hpMax:stats.hp,
    hpCurrent:stats.hp,
    coins:randomInt(150,260),
    weaponDamage:role.weaponDamage,
    weaponQuality,
    visits:0,
    purchases:0,
    active:true,
    status:'Disponible',
    equipment:{
      weapon:{
        id:'starter-weapon',
        name:'Equipo inicial',
        damage:role.weaponDamage,
        quality:weaponQuality
      }
    },
    inventory:[],
    createdAt:Date.now(),
    purchaseProfile:{
      affinity:role.smithyAffinity,
      needRange:[...personality.needRange],
      weights:{...personality.purchaseWeights}
    }
  };
}

function generateFoundingAdventurers(city,count=DATA.founding.adventurerCount){
  const existingNames=new Set(state.adventurers.map(npc=>npc.fullName));
  const roleKeys=shuffled(Object.keys(DATA.adventurerRoles));
  const result=[];

  for(let i=0;i<count;i++){
    const roleKey=roleKeys[i%roleKeys.length];
    result.push(generateAdventurer({city,roleKey,existingFullNames:existingNames}));
  }

  return result;
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
    founded:true,
    foundedAt:Date.now(),
    foundingPackGenerated:true
  };

  state.city=city;
  state.resources={...DATA.founding.resources};
  state.adventurers=generateFoundingAdventurers(city);
  state.smithyTraffic={nextVisitAt:Date.now()+randomVisitDelay(),activeVisitor:null};
  state.smithyBook={entries:[],unread:0,archive:{visits:0,purchases:0,noPurchase:0,revenue:0}};
  saveState();
  updateFoundationGate();

  if(feedback)feedback.textContent=`${name} fue fundada con ${state.adventurers.length} aventureros de origen.`;
  showScreen('city');
}

function resetTestWorld(){
  const ok=globalThis.confirm('¿Reiniciar el Reino de prueba? Se borrará el progreso local de v0.8.0 y volverás a fundar la ciudad.');
  if(!ok)return;
  localStorage.removeItem(SAVE_KEY);
  state=defaultState();
  updateFoundationGate();
  const input=document.getElementById('foundationCityName');
  if(input)input.value='Villa del Roble';
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
  const navTarget=['smithy','carpenter','inn'].includes(name)?'city':name;
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
  cityTierBadge:document.getElementById('cityTierBadge'),
  kingdomCityName:document.getElementById('kingdomCityName'),
  kingdomFoundingMeta:document.getElementById('kingdomFoundingMeta'),
  kingdomAdventurerCount:document.getElementById('kingdomAdventurerCount'),
  kingdomAdventurerList:document.getElementById('kingdomAdventurerList'),
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

  carpenterStorage().woodenHandles+=handles;
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

  if(swords.length>0){
    const sword=swords[0];
    state.lastSmithyMessage=`Espada terminada: calidad ${sword.qualityLabel} (${sword.qualityScore}), daño ${sword.damage}, durabilidad ${sword.durability}. +${xp} XP de Herrería.`;
  }else if(pickaxes>0){
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

  els.kingdomCityName.textContent=state.city.founded
    ?`${state.city.name} · ${state.city.tier}`
    :'Sin fundar';
  els.kingdomFoundingMeta.textContent=state.city.founded
    ?`Fundada en ${state.world.kingdom.name}. Pack inicial generado: ${state.adventurers.length} aventureros.`
    :'El Pack inicial se genera al fundar la ciudad.';
  els.kingdomAdventurerCount.textContent=`${state.adventurers.filter(n=>n.active).length} activos`;

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
          <span>${npc.role} · Nv. ${npc.level} · ${npc.personality}</span>
        </div>
      </div>
      <div class="founding-adventurer-stats">
        <span>❤️ ${npc.hpCurrent}/${npc.hpMax}</span>
        <span>⚔️ ${npc.stats.attack}</span>
        <span>🛡️ ${npc.stats.defense}</span>
        <span>💨 ${npc.stats.speed}</span>
        <span>✨ ${npc.stats.support}</span>
      </div>
      <small>Originario de ${npc.originTier} ${npc.originCityName} · 🪙 ${formatNumber(npc.coins)}</small>
    `;
    els.kingdomAdventurerList.append(card);
  });
}

function render(){
  updateFoundationGate();
  resolveExpiredExpedition();
  resolveExpiredCraft();
  resolveExpiredCarpentry();
  syncAllWorkerStamina();
  tickSmithyTraffic();

  els.coins.textContent=formatNumber(state.resources.coins);

  els.cityPrestige.textContent=formatNumber(state.city.prestige);
  els.cityPrestigeProgress.value=state.city.prestige;
  if(els.cityTierBadge)els.cityTierBadge.textContent=state.city.tier;
  els.smithyLevelCity.textContent=state.buildings.smithy.level;
  if(currentScreen()==='city')title.textContent=state.city.founded?state.city.name:'Nueva ciudad';
  renderFoundingAdventurers();

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
    els.expeditionStatus.textContent=resting?'En la Posada':'Lista para partir';
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
    els.smithyBorinState.textContent=resting?'En la Posada':'Disponible';
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

catchUpSmithyTraffic();
document.getElementById('foundCityBtn')?.addEventListener('click',foundCity);
document.getElementById('foundationCityName')?.addEventListener('keydown',event=>{
  if(event.key==='Enter')foundCity();
});
document.getElementById('resetWorldBtn')?.addEventListener('click',resetTestWorld);

setInterval(render,500);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){
    catchUpSmithyTraffic();
    render();
  }
});
window.addEventListener('focus',()=>{
  catchUpSmithyTraffic();
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
  let refreshing=false;

  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(refreshing)return;
    refreshing=true;
    window.location.reload();
  });

  window.addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./sw.js?v=0.8.1',{updateViaCache:'none'});
      await reg.update();
    }catch{}
  });
}

render();
