globalThis.PG_DATA={
  world:{
    id:'mundo-prueba-01',
    name:'Mundo de prueba',
    kingdom:{id:'ardel',name:'Reino de Ardel'}
  },

  founding:{
    startingTier:'Pueblo',
    startingPrestige:0,
    adventurerCount:3,
    founderClassKeys:['warrior','explorer','healer'],
    adventurerCoinRange:[55,75],
    resources:{coins:900,wood:50,iron:24,stone:8}
  },

  adventurerProgression:{
    schemaVersion:1,
    xpToNext:{1:45,2:90,3:150},
    zeroHpXpLossRate:.20,
    mainStats:['hp','attack','defense','initiative','mana']
  },

  shops:{
    townHall:{id:'townHall',name:'Ayuntamiento',type:'administration',startingLevel:1},
    tavern:{id:'tavern',name:'Taberna',type:'service',startingLevel:1},
    smithy:{id:'smithy',name:'Herrería',type:'production',startingLevel:1},
    carpenter:{id:'carpenter',name:'Carpintería',type:'production',startingLevel:1},
    inn:{id:'inn',name:'Posada',type:'service',startingLevel:1},
    guildHall:{id:'guildHall',name:'Sede del Gremio',type:'adventurer-market',startingLevel:1,implemented:false}
  },

  items:{
    wood:{id:'wood',name:'Madera',kind:'material'},
    iron:{id:'iron',name:'Hierro',kind:'material'},
    stone:{id:'stone',name:'Piedra',kind:'material'},
    pickaxeHead:{id:'pickaxeHead',name:'Cabeza de pico de hierro',kind:'component',ownerShop:'smithy'},
    woodenHandle:{id:'woodenHandle',name:'Mango de pico',kind:'component',ownerShop:'carpenter'},
    ironPickaxe:{id:'ironPickaxe',name:'Pico de hierro',kind:'worker-equipment',ownerShop:'smithy'},
    ironSword:{id:'ironSword',name:'Espada de hierro',kind:'adventurer-equipment',ownerShop:'smithy'},
    simpleWorkbench:{id:'simpleWorkbench',name:'Banco de trabajo simple',kind:'furniture',ownerShop:'carpenter',implemented:false}
  },

  recipes:{
    pickaxeHead:{
      id:'pickaxeHead',
      shop:'smithy',
      output:'pickaxeHead',
      materials:{iron:5},
      durationMs:20000,
      stamina:15,
      xp:40,
      requiredLevel:1,
      implemented:true
    },
    woodenHandle:{
      id:'woodenHandle',
      shop:'carpenter',
      output:'woodenHandle',
      materials:{wood:3},
      durationMs:20000,
      stamina:15,
      xp:40,
      requiredLevel:1,
      implemented:true
    },
    ironPickaxe:{
      id:'ironPickaxe',
      shop:'smithy',
      output:'ironPickaxe',
      components:{pickaxeHead:1,woodenHandle:1},
      durationMs:15000,
      stamina:10,
      xp:20,
      requiredLevel:1,
      implemented:true
    },
    ironSword:{
      id:'ironSword',
      shop:'smithy',
      output:'ironSword',
      materials:{iron:8},
      durationMs:30000,
      stamina:20,
      xp:50,
      requiredLevel:2,
      implemented:true
    },
    simpleWorkbench:{
      id:'simpleWorkbench',
      shop:'carpenter',
      output:'simpleWorkbench',
      materials:{wood:10,iron:2},
      durationMs:45000,
      stamina:20,
      xp:55,
      requiredLevel:2,
      implemented:false
    }
  },

  adventurerNames:[
    'Kael','Lyra','Darek','Arlen','Neris','Taren','Sira','Eron','Mira','Varek',
    'Lian','Rhea','Corin','Nadia','Elias','Talia','Bren','Iria','Galen','Nora',
    'Rian','Selene','Orin','Vela','Dariel','Maia','Koren','Asha','Theron','Lysa'
  ],

  adventurerSurnames:[
    'Doran','Varen','Thorne','Meral','Voss','Eldran','Kaeris','Soren','Valen','Roth',
    'Arden','Briar','Corven','Damar','Everen','Faron','Grell','Hale','Iver','Joren',
    'Kest','Loran','Marden','Noren','Orlan','Perrin','Ravel','Saren','Toren','Wren'
  ],

  adventurerRoles:{
    warrior:{
      id:'warrior',
      label:'Guerrero',
      identity:'Protector',
      baseStats:{hp:120,attack:10,defense:7,initiative:4,mana:18},
      evasion:.02,
      weaponDamage:4,
      smithyAffinity:.92,
      stateAffinity:['wound','stun']
    },
    explorer:{
      id:'explorer',
      label:'Explorador',
      identity:'Daño físico / Evasión',
      baseStats:{hp:90,attack:14,defense:3,initiative:8,mana:32},
      evasion:.14,
      weaponDamage:4,
      smithyAffinity:.82,
      combatStyles:['bow','daggers'],
      stateAffinity:['wound','poison','paralysis']
    },
    healer:{
      id:'healer',
      label:'Sanador',
      identity:'Soporte sagrado',
      baseStats:{hp:80,attack:9,defense:5,initiative:5,mana:58},
      evasion:.03,
      weaponDamage:3,
      smithyAffinity:.56,
      stateAffinity:[]
    },
    mage:{
      id:'mage',
      label:'Mago',
      identity:'Daño arcano / elemental',
      baseStats:{hp:72,attack:16,defense:3,initiative:6,mana:64},
      evasion:.03,
      weaponDamage:3,
      smithyAffinity:.48,
      stateAffinity:['burn','paralysis'],
      founder:false
    }
  },
  personalities:{
    prudent:{
      id:'prudent',
      label:'Prudente',
      traits:{courage:42,greed:35,prudence:86,ambition:55,loyalty:62},
      needRange:[.48,.82],
      purchaseWeights:{need:.34,affinity:.14,upgrade:.22,value:.18,affordability:.12}
    },
    ambitious:{
      id:'ambitious',
      label:'Ambicioso',
      traits:{courage:76,greed:48,prudence:38,ambition:91,loyalty:42},
      needRange:[.52,.92],
      purchaseWeights:{need:.29,affinity:.15,upgrade:.36,value:.10,affordability:.10}
    },
    frugal:{
      id:'frugal',
      label:'Ahorrador',
      traits:{courage:50,greed:64,prudence:72,ambition:48,loyalty:54},
      needRange:[.40,.78],
      purchaseWeights:{need:.24,affinity:.13,upgrade:.20,value:.28,affordability:.15}
    },
    bold:{
      id:'bold',
      label:'Audaz',
      traits:{courage:92,greed:38,prudence:24,ambition:72,loyalty:46},
      needRange:[.58,.96],
      purchaseWeights:{need:.34,affinity:.18,upgrade:.30,value:.10,affordability:.08}
    },
    loyal:{
      id:'loyal',
      label:'Leal',
      traits:{courage:64,greed:24,prudence:58,ambition:46,loyalty:92},
      needRange:[.46,.84],
      purchaseWeights:{need:.31,affinity:.17,upgrade:.24,value:.16,affordability:.12}
    }
  }
};