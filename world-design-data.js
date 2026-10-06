(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PG_WORLD_DESIGN=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const WORLD_DESIGN_SCHEMA_VERSION=1;

  const resources={
    coins:{id:'coins',name:'Monedas',price:1},
    iron:{id:'iron',name:'Hierro',price:3},
    stone:{id:'stone',name:'Piedra',price:2},
    wood:{id:'wood',name:'Madera',price:1},
    firewood:{id:'firewood',name:'Leña',price:1},
    meat:{id:'meat',name:'Carne',price:2},
    skin:{id:'skin',name:'Piel común',price:4},
    tendon:{id:'tendon',name:'Tendón',price:4},
    wolfSkin:{id:'wolfSkin',name:'Piel de Lobo',price:5,origin:'wolf'},
    boarSkin:{id:'boarSkin',name:'Piel de Jabalí',price:6,origin:'boar'},
    wolfFang:{id:'wolfFang',name:'Colmillo de Lobo',price:7},
    boarTusk:{id:'boarTusk',name:'Colmillo de Jabalí',price:8},
    alphaWolfSkin:{id:'alphaWolfSkin',name:'Piel de Lobo Alfa',price:16,origin:'alphaWolf',rare:true},
    alphaFang:{id:'alphaFang',name:'Colmillo Alfa',price:18,rare:true},
    greatBoarSkin:{id:'greatBoarSkin',name:'Piel de Gran Jabalí',price:25,origin:'greatBoar',boss:true},
    greatBoarTendon:{id:'greatBoarTendon',name:'Tendón de Gran Jabalí',price:14,boss:true},
    greatBoarTusk:{id:'greatBoarTusk',name:'Colmillo de Gran Jabalí',price:20,boss:true},
    tannedNeutral:{id:'tannedNeutral',name:'Cuero curtido común',price:6,origin:'neutral'},
    tannedWolf:{id:'tannedWolf',name:'Cuero curtido de Lobo',price:7,origin:'wolf'},
    tannedBoar:{id:'tannedBoar',name:'Cuero curtido de Jabalí',price:8,origin:'boar'},
    tannedAlphaWolf:{id:'tannedAlphaWolf',name:'Cuero curtido Alfa',price:22,origin:'alphaWolf',rare:true},
    tannedGreatBoar:{id:'tannedGreatBoar',name:'Cuero curtido de Gran Jabalí',price:34,origin:'greatBoar',boss:true}
  };

  const food={
    simpleMeal:{id:'simpleMeal',name:'Plato sencillo',price:2,meat:1,firewood:1,hpRestore:.08,manaRestore:.10},
    travelRation:{id:'travelRation',name:'Ración de viaje',price:3,meat:1,firewood:1,hpProtection:.08,manaProtection:.05}
  };

  const materialOrigins={
    neutral:{id:'neutral',label:'Común',raw:'skin',tanned:'tannedNeutral',priceMul:1,defense:0,initiative:0,damageReduction:0},
    wolf:{id:'wolf',label:'Lobo',raw:'wolfSkin',tanned:'tannedWolf',priceMul:1.10,defense:0,initiative:1,damageReduction:0},
    boar:{id:'boar',label:'Jabalí',raw:'boarSkin',tanned:'tannedBoar',priceMul:1.12,defense:1,initiative:0,damageReduction:0},
    alphaWolf:{id:'alphaWolf',label:'Lobo Alfa',raw:'alphaWolfSkin',tanned:'tannedAlphaWolf',priceMul:1.35,defense:0,initiative:2,damageReduction:0},
    greatBoar:{id:'greatBoar',label:'Gran Jabalí',raw:'greatBoarSkin',tanned:'tannedGreatBoar',priceMul:1.55,defense:2,initiative:0,damageReduction:.05}
  };

  const equipment={
    legacySword:{id:'legacySword',name:'Espada conservada',shop:'smithy',slot:'weapon',classes:['warrior','explorer']},
    dagger:{id:'dagger',name:'Daga de hierro',shop:'smithy',slot:'weapon',price:24,durability:9,attack:2,classes:['explorer']},
    huntingKnife:{id:'huntingKnife',name:'Cuchillo de caza',shop:'smithy',slot:'tool',price:18,durability:10},
    huntingBow:{id:'huntingBow',name:'Arco de caza',shop:'carpenter',slot:'weapon',price:28,durability:9,attack:3,initiative:1,classes:['explorer']},
    simpleStaff:{id:'simpleStaff',name:'Bastón simple',shop:'carpenter',slot:'weapon',price:26,durability:9,attack:1,mana:12,classes:['healer','mage']},
    woodenShield:{id:'woodenShield',name:'Escudo de madera',shop:'carpenter',slot:'offhand',price:22,durability:10,defense:3,initiative:-1},
    leatherProtection:{id:'leatherProtection',name:'Protección ligera',shop:'textile',slot:'body',price:24,durability:12,defense:3,textile:true},
    leatherGloves:{id:'leatherGloves',name:'Guantes de cuero',shop:'textile',slot:'hands',price:12,durability:8,defense:1,textile:true},
    leatherBoots:{id:'leatherBoots',name:'Botas de cuero',shop:'textile',slot:'feet',price:12,durability:8,initiative:1,textile:true}
  };

  const workerTools={
    roughPick:{id:'roughPick',name:'Pico rudimentario',worker:'mara',durability:8,tier:'rough',resourceBonus:0},
    ironPickaxe:{id:'ironPickaxe',name:'Pico de hierro',worker:'mara',durability:14,tier:'improved',resourceBonus:1,hardVein:true},
    roughAxe:{id:'roughAxe',name:'Hacha rudimentaria',worker:'logger',durability:8,tier:'rough',resourceBonus:0},
    workAxe:{id:'workAxe',name:'Hacha de trabajo',worker:'logger',durability:14,tier:'improved',resourceBonus:1,hardTrees:true},
    roughHuntingGear:{id:'roughHuntingGear',name:'Equipo de caza rudimentario',worker:'hunter',durability:8,tier:'rough',resourceBonus:0},
    huntingBow:{id:'huntingBow',name:'Arco de caza',worker:'hunter',durability:14,tier:'improved',resourceBonus:1,hardPrey:true},
    huntingKnife:{id:'huntingKnife',name:'Cuchillo de caza',worker:'hunter',durability:14,tier:'improved',harvestBonus:1}
  };

  const recipes={
    simpleMeal:{id:"simpleMeal",name:"Plato sencillo",shop:"meson",materials:{meat:1,firewood:1},worldMinutes:3,outputQty:1},
    travelRation:{id:"travelRation",name:"Ración de viaje",shop:"meson",materials:{meat:1,firewood:1},worldMinutes:3,outputQty:1},
    nails:{id:'nails',name:'Clavos · lote de 8',shop:'smithy',materials:{iron:1,firewood:1},durationSec:10,outputQty:1,referencePrice:8},
    arrowheads:{id:'arrowheads',name:'Puntas de flecha · lote de 6',shop:'smithy',materials:{iron:2,firewood:1},durationSec:12,outputQty:1,referencePrice:10},
    pickaxeHead:{id:'pickaxeHead',name:'Cabeza de pico',shop:'smithy',materials:{iron:4,firewood:1},durationSec:18,outputQty:1,referencePrice:14},
    axeHead:{id:'axeHead',name:'Cabeza de hacha',shop:'smithy',materials:{iron:4,firewood:1},durationSec:18,outputQty:1,referencePrice:14},
    ironPickaxe:{id:'ironPickaxe',name:'Pico de hierro',shop:'smithy',components:{pickaxeHead:1,toolHandle:1},durationSec:10,outputQty:1,referencePrice:28},
    workAxe:{id:'workAxe',name:'Hacha de trabajo',shop:'smithy',components:{axeHead:1,toolHandle:1},durationSec:10,outputQty:1,referencePrice:28},
    dagger:{id:'dagger',name:'Daga de hierro',shop:'smithy',materials:{iron:3,firewood:1},durationSec:20,outputQty:1,referencePrice:24},
    huntingKnife:{id:'huntingKnife',name:'Cuchillo de caza',shop:'smithy',materials:{iron:2,firewood:1},durationSec:16,outputQty:1,referencePrice:18},
    scissors:{id:'scissors',name:'Tijeras',shop:'smithy',materials:{iron:2,firewood:1},durationSec:16,outputQty:1,referencePrice:18},
    toolHandle:{id:'toolHandle',name:'Mango de herramienta',shop:'carpenter',materials:{wood:2},durationSec:10,outputQty:1,referencePrice:6},
    huntingBow:{id:'huntingBow',name:'Arco de caza',shop:'carpenter',materials:{wood:4,tendon:2},durationSec:25,outputQty:1,referencePrice:28},
    arrowBundle:{id:'arrowBundle',name:'Haz de 12 flechas',shop:'carpenter',components:{arrowheads:2},materials:{wood:2},durationSec:18,outputQty:1,referencePrice:16},
    simpleStaff:{id:'simpleStaff',name:'Bastón simple',shop:'carpenter',materials:{wood:3},durationSec:18,outputQty:1,referencePrice:26},
    woodenShield:{id:'woodenShield',name:'Escudo de madera',shop:'carpenter',materials:{wood:4},components:{nails:1},durationSec:22,outputQty:1,referencePrice:22},
    tannedHide:{id:'tannedHide',name:'Cuero curtido',shop:'textile',rawOrigin:true,durationSec:12,outputQty:1},
    leatherProtection:{id:'leatherProtection',name:'Protección ligera',shop:'textile',tannedHide:3,materials:{tendon:1},durationSec:28,outputQty:1,referencePrice:24},
    leatherGloves:{id:'leatherGloves',name:'Guantes',shop:'textile',tannedHide:1,durationSec:15,outputQty:1,referencePrice:12},
    leatherBoots:{id:'leatherBoots',name:'Botas',shop:'textile',tannedHide:1,durationSec:15,outputQty:1,referencePrice:12},
    leatherStraps:{id:'leatherStraps',name:'Correas de cuero',shop:'textile',tannedHide:1,durationSec:15,outputQty:1,referencePrice:6}
  };

  const services={
    sharpening:{id:'sharpening',name:'Afilado básico',shop:'smithy',price:2,durationSec:8,weaponDamageBonus:1,toolResourceBonus:1,expiresAfterActivity:true},
    bowTuning:{id:'bowTuning',name:'Ajuste de arco',shop:'carpenter',price:2,durationSec:8,expiresAfterActivity:true},
    rest:{id:'rest',name:'Descanso',shop:'meson',price:8,restoreHp:.55,restoreMana:.65},
    lodging:{id:'lodging',name:'Alojamiento',shop:'meson',price:4}
  };

  const enemies={
    wolf:{id:'wolf',name:'Lobo',type:'animal',minCityLevel:1,hp:34,attack:9,defense:2,initiative:7,xp:10,presenceDrop:3,
      drops:[['meat',.70,1,1],['wolfSkin',.55,1,1],['wolfFang',.15,1,1]]},
    boar:{id:'boar',name:'Jabalí',type:'animal',minCityLevel:1,hp:55,attack:12,defense:5,initiative:3,xp:14,presenceDrop:4,
      drops:[['meat',.90,1,2],['boarSkin',.65,1,1],['tendon',.40,1,1],['boarTusk',.12,1,1]]},
    alphaWolf:{id:'alphaWolf',name:'Lobo Alfa',type:'animal',rarity:'rare',minCityLevel:2,hp:95,attack:15,defense:5,initiative:8,xp:38,presenceDrop:18,
      drops:[['meat',1,1,2],['alphaWolfSkin',1,1,1],['alphaFang',.30,1,1]]},
    greatBoar:{id:'greatBoar',name:'Gran Jabalí',type:'animal',rarity:'boss',minCityLevel:3,hp:280,attack:21,defense:10,initiative:4,xp:90,presenceDrop:25,
      drops:[['meat',1,3,5],['greatBoarSkin',1,1,1],['greatBoarTendon',.50,1,1],['greatBoarTusk',.40,1,1]]}
  };

  const threat={
    bands:[
      {id:'controlled',min:0,max:39,label:'Controlado'},
      {id:'growing',min:40,max:59,label:'Creciendo'},
      {id:'high',min:60,max:79,label:'Alto'},
      {id:'critical',min:80,max:94,label:'Crítico'},
      {id:'imminent',min:95,max:100,label:'Inminente'}
    ],
    growthPerTick:{wolf:3,boar:2},
    alphaChance:[.02,.04,.07,.10,.14],
    bossChance:[.005,.01,.02,.04,.07]
  };

  const mission={
    manualValueRange:[.70,1.30],
    startingConcurrent:2,
    types:{
      hunt:{id:'hunt',label:'Caza / control'},
      delivery:{id:'delivery',label:'Entrega por demanda'},
      escort:{id:'escort',label:'Escolta'}
    },
    baseRewards:{wolf:6,boar:8,alphaWolf:36,greatBoar:60}
  };

  const market={
    cityLootMinTreasury:55,
    targets:{
      1:{meat:8,tendon:4,wolfSkin:3,boarSkin:3,wolfFang:1,boarTusk:1},
      2:{meat:12,tendon:7,wolfSkin:7,boarSkin:7,wolfFang:3,boarTusk:3,alphaWolfSkin:2,alphaFang:1},
      3:{meat:16,tendon:10,wolfSkin:10,boarSkin:10,wolfFang:4,boarTusk:4,alphaWolfSkin:3,alphaFang:2,greatBoarSkin:2,greatBoarTendon:2,greatBoarTusk:2}
    }
  };

  const autonomy={
    baseReturnHp:.60,
    baseReturnMana:.40,
    decisionIntervalMinutes:10,
    personalityReturnShift:{
      prudent:{hp:.08,mana:.08},
      conservative:{hp:.10,mana:.10},
      bold:{hp:-.12,mana:-.10},
      ambitious:{hp:-.06,mana:-.06},
      frugal:{hp:-.03,mana:-.02},
      loyal:{hp:0,mana:0}
    }
  };

  const buildings={
    townHall:{id:'townHall',name:'Ayuntamiento',startingLevel:1},
    smithy:{id:'smithy',name:'Herrería',startingLevel:1,queueCapacity:5},
    carpenter:{id:'carpenter',name:'Carpintería',startingLevel:1,queueCapacity:5},
    meson:{id:'meson',name:'Mesón',startingLevel:1,capacity:5},
    guildHall:{id:'guildHall',name:'Sede del Gremio',startingLevel:1,missionSlots:2},
    textile:{id:'textile',name:'Textilería',startingLevel:0,unlockCityLevel:2,
      buildCost:{coins:40,wood:10,stone:8,nails:1,scissors:1}}
  };

  const map={
    zones:[
      {id:'cityCenter',name:'Centro de la ciudad',kind:'city',distance:0},
      {id:'northForest',name:'Bosque del Norte',kind:'forest',distance:1,enemy:'wolf'},
      {id:'stoneHills',name:'Colinas Pedregosas',kind:'hills',distance:1,enemy:'boar'},
      {id:'hardVein',name:'Veta Dura',kind:'mine',distance:2,requires:'ironPickaxe'},
      {id:'oldRoad',name:'Camino Viejo',kind:'route',distance:2}
    ]
  };

  const worldScale={
    cityLevelBands:[
      {min:1,max:10,scope:'city',label:'Territorio local'},
      {min:11,max:20,scope:'kingdom-shared',label:'Primeras zonas compartidas del Reino'},
      {min:21,max:40,scope:'kingdom-region',label:'Regiones del Reino'},
      {min:41,max:60,scope:'kingdom-wide',label:'Grandes regiones del Reino'},
      {min:61,max:80,scope:'kingdom-elite',label:'Regiones élite del Reino'},
      {min:81,max:99,scope:'world',label:'Regiones mundiales'},
      {min:100,max:100,scope:'era-endgame',label:'Final de Era'}
    ],
    transport:{
      horse:{id:'horse',label:'Caballo',use:'viaje individual rápido'},
      carriage:{id:'carriage',label:'Carruaje',use:'grupo, provisiones y carga'}
    }
  };

  const specialization={
    schools:[
      {id:'druid',name:'Círculo Druídico'},
      {id:'arcane',name:'Academia Arcana'},
      {id:'archery',name:'Escuela de Arquería'},
      {id:'guardian',name:'Orden de Guardianes'}
    ],
    economyGuideline:'1 alcanzable; 2 inversión importante; 3 difícil; 4+ excepcional'
  };

  const season={
    targetMonths:3,
    maxLevelReference:100,
    persistent:['records','achievements','titles','cosmetics','chronicles','diamonds'],
    reset:['world-material','city-material','resources','local-progression'],
    diamonds:{persistent:true,payToWinCapRequired:true},
    recordCategories:[
      'bestWorldCapital','bestKingdomCapital','bestBusiness','bestSmithy',
      'bestCraftedItem','firstBossDefeat','firstFinalBossDefeat','legendaryAdventurers'
    ]
  };

  const founderProtection={
    oneFullPackPerPlayerPerSeason:true,
    refoundReusesValue:true,
    populationMilestonesOneTime:true,
    developmentResetOnly:true
  };

  return {
    WORLD_DESIGN_SCHEMA_VERSION,
    resources,
    food,
    materialOrigins,
    equipment,
    workerTools,
    recipes,
    services,
    enemies,
    threat,
    mission,
    market,
    autonomy,
    buildings,
    map,
    worldScale,
    specialization,
    season,
    founderProtection
  };
});
