(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PG_ADVENTURER_CORE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const ADVENTURER_SCHEMA_VERSION=1;

  const LEGACY_STARTER_DAMAGE={warrior:7,explorer:7,healer:5,mage:3};

  const STARTER_EQUIPMENT={
    warrior:{
      weapon:{id:'founder-warrior-weapon',name:'Arma de práctica',slot:'weapon',founder:true,durability:8,maxDurability:8,damage:4},
      body:{id:'founder-warrior-armor',name:'Protección rudimentaria',slot:'body',founder:true,durability:10,maxDurability:10}
    },
    explorerBow:{
      weapon:{id:'founder-explorer-bow',name:'Arco rudimentario',slot:'weapon',founder:true,durability:8,maxDurability:8,damage:4},
      body:{id:'founder-explorer-clothes',name:'Ropa de viaje',slot:'body',founder:true,durability:10,maxDurability:10}
    },
    explorerDaggers:{
      weapon:{id:'founder-explorer-daggers',name:'Dagas rudimentarias',slot:'weapon',founder:true,durability:8,maxDurability:8,damage:4},
      body:{id:'founder-explorer-clothes',name:'Ropa de viaje',slot:'body',founder:true,durability:10,maxDurability:10}
    },
    healer:{
      weapon:{id:'founder-healer-staff',name:'Bastón de novicio',slot:'weapon',founder:true,durability:8,maxDurability:8,damage:3},
      body:{id:'founder-healer-clothes',name:'Vestiduras sencillas',slot:'body',founder:true,durability:10,maxDurability:10}
    },
    mage:{
      weapon:{id:'founder-mage-focus',name:'Foco de aprendiz',slot:'weapon',founder:true,durability:8,maxDurability:8,damage:3},
      body:{id:'founder-mage-robe',name:'Túnica sencilla',slot:'body',founder:true,durability:10,maxDurability:10}
    }
  };

  const clone=value=>JSON.parse(JSON.stringify(value));

  function clamp(value,min,max){
    return Math.max(min,Math.min(max,value));
  }

  function classKeyOf(npc,data){
    const candidate=npc?.classKey||npc?.roleKey;
    return data?.adventurerRoles?.[candidate]?candidate:'warrior';
  }

  function combatStyleFor(classKey,preferred){
    if(classKey!=='explorer')return classKey==='warrior'?'protector':classKey==='healer'?'sacred':'arcane';
    return preferred==='daggers'?'daggers':'bow';
  }

  function starterEquipmentFor(classKey,combatStyle='bow'){
    if(classKey==='explorer'){
      return clone(combatStyle==='daggers'?STARTER_EQUIPMENT.explorerDaggers:STARTER_EQUIPMENT.explorerBow);
    }
    return clone(STARTER_EQUIPMENT[classKey]||STARTER_EQUIPMENT.warrior);
  }

  function baseStatsFor(classKey,data){
    const role=data.adventurerRoles[classKey]||data.adventurerRoles.warrior;
    return {
      hp:Number(role.baseStats.hp)||1,
      attack:Number(role.baseStats.attack)||1,
      defense:Number(role.baseStats.defense)||0,
      initiative:Number(role.baseStats.initiative)||0,
      mana:Number(role.baseStats.mana)||0
    };
  }

  function equipmentWeaponDamage(equipment,fallback=0){
    const damage=Number(equipment?.weapon?.damage);
    return Number.isFinite(damage)?damage:fallback;
  }

  function normalizeEquipment(npc,classKey,combatStyle,role){
    const starter=starterEquipmentFor(classKey,combatStyle);
    const previousDamage=Number(npc?.weaponDamage);
    const starterDamage=Number(role?.weaponDamage)||Number(starter.weapon?.damage)||0;
    const previousWeapon=npc?.equipment?.weapon;

    if(previousWeapon&&previousWeapon.id&&previousWeapon.id!=='starter-weapon'){
      starter.weapon={
        ...clone(previousWeapon),
        slot:'weapon',
        founder:Boolean(previousWeapon.founder),
        durability:Number.isFinite(Number(previousWeapon.durability))?Number(previousWeapon.durability):null,
        maxDurability:Number.isFinite(Number(previousWeapon.maxDurability))?Number(previousWeapon.maxDurability):null,
        damage:Number(previousWeapon.damage)||previousDamage||starterDamage
      };
    }else if(Number.isFinite(previousDamage)&&previousDamage>(LEGACY_STARTER_DAMAGE[classKey]??starterDamage)){
      starter.weapon={
        id:'legacy-acquired-weapon',
        name:'Arma adquirida previamente',
        slot:'weapon',
        founder:false,
        durability:null,
        maxDurability:null,
        damage:previousDamage,
        quality:Number(npc?.weaponQuality)||50
      };
    }

    if(npc?.equipment?.body&&npc.equipment.body.id){
      starter.body={...starter.body,...clone(npc.equipment.body),slot:'body'};
    }

    return starter;
  }

  function normalizeAdventurer(npc,data){
    const classKey=classKeyOf(npc,data);
    const role=data.adventurerRoles[classKey];
    const stats=baseStatsFor(classKey,data);
    const combatStyle=combatStyleFor(classKey,npc?.combatStyle);

    const oldMax=Math.max(1,Number(npc?.hpMax)||Number(npc?.stats?.hp)||stats.hp);
    const oldCurrent=clamp(Number(npc?.hpCurrent)||oldMax,0,oldMax);
    const hpRatio=oldCurrent/oldMax;

    const oldManaMax=Math.max(0,Number(npc?.manaMax)||Number(npc?.stats?.mana)||stats.mana);
    const oldManaCurrent=clamp(
      Number.isFinite(Number(npc?.manaCurrent))?Number(npc.manaCurrent):oldManaMax,
      0,
      Math.max(1,oldManaMax)
    );
    const manaRatio=oldManaMax>0?oldManaCurrent/oldManaMax:1;

    const equipment=normalizeEquipment(npc,classKey,combatStyle,role);
    const personalityKey=npc?.personalityKey||'prudent';
    const personality=data.personalities?.[personalityKey];

    const normalized={
      ...clone(npc||{}),
      adventurerSchemaVersion:ADVENTURER_SCHEMA_VERSION,
      classKey,
      roleKey:classKey,
      role:role.label,
      combatStyle,
      level:Math.max(1,Number(npc?.level)||1),
      xp:Math.max(0,Number(npc?.xp)||0),
      stats,
      hpMax:stats.hp,
      hpCurrent:Math.round(stats.hp*hpRatio),
      manaMax:stats.mana,
      manaCurrent:Math.round(stats.mana*manaRatio),
      evasion:Number(role.evasion)||0,
      coins:Math.max(0,Number(npc?.coins)||0),
      personalityKey,
      personality:npc?.personality||personality?.label||'Prudente',
      traits:{...(personality?.traits||{}),...(npc?.traits||{})},
      status:npc?.status||'Disponible',
      active:npc?.active!==false,
      equipment,
      inventory:Array.isArray(npc?.inventory)?clone(npc.inventory):[],
      injuries:Array.isArray(npc?.injuries)?clone(npc.injuries):[],
      statusEffects:Array.isArray(npc?.statusEffects)?clone(npc.statusEffects):[],
      abilities:Array.isArray(npc?.abilities)?clone(npc.abilities):[],
      needs:{
        recovery:0,
        equipment:0,
        supplies:0,
        specialization:null,
        ...(npc?.needs||{})
      },
      mood:npc?.mood||'Estable',
      history:{
        activities:0,
        victories:0,
        defeats:0,
        incapacitations:0,
        xpLost:0,
        ...(npc?.history||{})
      }
    };

    normalized.weaponDamage=equipmentWeaponDamage(equipment,Number(role.weaponDamage)||0);
    normalized.weaponQuality=Number(npc?.weaponQuality)||Number(equipment.weapon?.quality)||50;

    normalized.purchaseProfile={
      affinity:Number(npc?.purchaseProfile?.affinity??role.smithyAffinity??.5),
      needRange:Array.isArray(npc?.purchaseProfile?.needRange)
        ?[...npc.purchaseProfile.needRange]
        :[...(personality?.needRange||[.45,.80])],
      weights:{
        ...(personality?.purchaseWeights||{need:.30,affinity:.15,upgrade:.25,value:.18,affordability:.12}),
        ...(npc?.purchaseProfile?.weights||{})
      }
    };

    return normalized;
  }

  function createAdventurer(data,input){
    const role=data.adventurerRoles[input.classKey];
    if(!role)throw new Error('Clase de aventurero inválida');

    const combatStyle=combatStyleFor(input.classKey,input.combatStyle);
    const personality=data.personalities[input.personalityKey]||data.personalities.prudent;
    const base={
      id:input.id,
      firstName:input.firstName,
      lastName:input.lastName,
      fullName:input.fullName,
      originCityId:input.city.id,
      originCityName:input.city.name,
      originTier:input.city.tier,
      currentCityId:input.city.id,
      currentCityName:input.city.name,
      classKey:input.classKey,
      roleKey:input.classKey,
      role:role.label,
      combatStyle,
      personalityKey:personality.id,
      personality:personality.label,
      traits:{...personality.traits},
      level:1,
      xp:0,
      coins:input.coins,
      visits:0,
      purchases:0,
      active:true,
      status:'Disponible',
      createdAt:input.createdAt,
      equipment:starterEquipmentFor(input.classKey,combatStyle),
      inventory:[],
      injuries:[],
      statusEffects:[],
      abilities:[],
      mood:'Estable',
      needs:{recovery:0,equipment:0,supplies:0,specialization:null},
      history:{activities:0,victories:0,defeats:0,incapacitations:0,xpLost:0}
    };
    return normalizeAdventurer(base,data);
  }

  function validateAdventurer(npc,data){
    const errors=[];
    if(!npc?.id)errors.push('id');
    if(!npc?.fullName)errors.push('fullName');
    if(!data?.adventurerRoles?.[npc?.classKey])errors.push('classKey');
    for(const key of ['hp','attack','defense','initiative','mana']){
      if(!Number.isFinite(Number(npc?.stats?.[key])))errors.push('stats.'+key);
    }
    if(!Number.isFinite(Number(npc?.hpCurrent))||!Number.isFinite(Number(npc?.hpMax)))errors.push('hp');
    if(!Number.isFinite(Number(npc?.manaCurrent))||!Number.isFinite(Number(npc?.manaMax)))errors.push('mana');
    if(!npc?.equipment?.weapon||!npc?.equipment?.body)errors.push('equipment');
    if(!Array.isArray(npc?.inventory))errors.push('inventory');
    if(!Array.isArray(npc?.injuries))errors.push('injuries');
    return errors;
  }

  return {
    ADVENTURER_SCHEMA_VERSION,
    LEGACY_STARTER_DAMAGE,
    STARTER_EQUIPMENT,
    combatStyleFor,
    starterEquipmentFor,
    baseStatsFor,
    normalizeAdventurer,
    createAdventurer,
    validateAdventurer
  };
});
