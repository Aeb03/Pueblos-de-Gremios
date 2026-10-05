'use strict';

const TICK_MINUTES=5;
const MAX_MINUTES=90;

const PROFILES={
  efficient:{label:'Eficiente',worker:.98,adv:.65,shop:.26,sellLoot:.72,restHp:.58,restMana:.36,missionBias:1.08,paidMission:.44},
  normal:{label:'Normal',worker:.86,adv:.55,shop:.18,sellLoot:.62,restHp:.60,restMana:.40,missionBias:1.00,paidMission:.40},
  conservative:{label:'Conservador',worker:.78,adv:.45,shop:.12,sellLoot:.55,restHp:.70,restMana:.50,missionBias:.92,paidMission:.34},
  aggressive:{label:'Agresivo',worker:.88,adv:.70,shop:.24,sellLoot:.68,restHp:.45,restMana:.28,missionBias:1.05,paidMission:.48},
  poor:{label:'Mala gestión',worker:.58,adv:.38,shop:.08,sellLoot:.40,restHp:.55,restMana:.34,missionBias:.82,paidMission:.30}
};

const CLASS={
  warrior:{hp:120,mana:18,attack:10,defense:7,initiative:4,evasion:.02},
  explorer:{hp:90,mana:32,attack:14,defense:3,initiative:8,evasion:.14},
  healer:{hp:80,mana:58,attack:9,defense:5,initiative:5,evasion:.03},
  mage:{hp:72,mana:64,attack:16,defense:3,initiative:6,evasion:.03}
};

const ITEM={
  // Equipo fundador: sus aportes ya están incluidos en la estadística base visible.
  // La durabilidad representa la pérdida de ese paquete funcional si se rompe.
  founderWarriorWeapon:{price:0,class:['warrior'],attack:0,defense:0,initiative:0,mana:0,durability:8,slot:'weapon',founder:true,purchasable:false,breakPenalty:6},
  founderWarriorArmor:{price:0,class:['warrior'],attack:0,defense:0,initiative:0,mana:0,durability:10,slot:'body',founder:true,purchasable:false,breakPenalty:2},
  founderExplorerBow:{price:0,class:['explorer'],attack:0,defense:0,initiative:0,mana:0,durability:8,slot:'weapon',founder:true,purchasable:false,breakPenalty:6},
  founderExplorerDaggers:{price:0,class:['explorer'],attack:0,defense:0,initiative:0,mana:0,durability:8,slot:'weapon',founder:true,purchasable:false,breakPenalty:6},
  founderExplorerClothes:{price:0,class:['explorer'],attack:0,defense:0,initiative:0,mana:0,durability:10,slot:'body',founder:true,purchasable:false,breakPenalty:2},
  founderHealerStaff:{price:0,class:['healer'],attack:0,defense:0,initiative:0,mana:0,durability:8,slot:'weapon',founder:true,purchasable:false,breakPenalty:5},
  founderHealerClothes:{price:0,class:['healer'],attack:0,defense:0,initiative:0,mana:0,durability:10,slot:'body',founder:true,purchasable:false,breakPenalty:2},
  founderMageFocus:{price:0,class:['mage'],attack:0,defense:0,initiative:0,mana:0,durability:8,slot:'weapon',founder:true,purchasable:false,breakPenalty:5},
  founderMageRobe:{price:0,class:['mage'],attack:0,defense:0,initiative:0,mana:0,durability:10,slot:'body',founder:true,purchasable:false,breakPenalty:1},

  dagger:{price:24,class:['explorer'],attack:2,defense:0,initiative:0,mana:0,durability:9,slot:'weapon',purchasable:true},
  bow:{price:28,class:['explorer'],attack:3,defense:0,initiative:1,mana:0,durability:9,slot:'weapon',purchasable:true},
  staff:{price:26,class:['healer','mage'],attack:1,defense:0,initiative:0,mana:12,durability:9,slot:'weapon',purchasable:true},
  shield:{price:22,class:['warrior'],attack:0,defense:3,initiative:-1,mana:0,durability:10,slot:'offhand',purchasable:true},
  leather:{price:24,class:['warrior','explorer','healer','mage'],attack:0,defense:3,initiative:0,mana:0,durability:12,slot:'body',purchasable:true,textile:true},
  gloves:{price:12,class:['warrior','explorer','healer','mage'],attack:0,defense:1,initiative:0,mana:0,durability:8,slot:'hands',purchasable:true,textile:true},
  boots:{price:12,class:['warrior','explorer','healer','mage'],attack:0,defense:0,initiative:1,mana:0,durability:8,slot:'feet',purchasable:true,textile:true}
};

const TEXTILE_ORIGIN={
  neutral:{resource:'skin',label:'Común',priceMul:1,defense:0,initiative:0,evasion:0,damageReduction:0},
  wolf:{resource:'wolfSkin',label:'Lobo',priceMul:1.10,defense:0,initiative:1,evasion:0,damageReduction:0},
  boar:{resource:'boarSkin',label:'Jabalí',priceMul:1.12,defense:1,initiative:0,evasion:0,damageReduction:0},
  alphaWolf:{resource:'alphaWolfSkin',label:'Lobo Alfa',priceMul:1.35,defense:0,initiative:2,evasion:0,damageReduction:0},
  greatBoar:{resource:'greatBoarSkin',label:'Gran Jabalí',priceMul:1.55,defense:2,initiative:0,evasion:0,damageReduction:.05}
};

const REPAIR_RATE=.22;
const REPAIR_THRESHOLD=.40;

const RECIPES={
  dagger:{iron:3,firewood:1},
  bow:{wood:4,tendon:2},
  staff:{wood:3},
  shield:{wood:4,iron:1},
  leather:{hide:3,tendon:1},
  gloves:{hide:1},
  boots:{hide:1}
};

const FOOD={
  plate:{price:2,meat:.75,firewood:.15,hpRestore:.08,manaRestore:.10},
  ration:{price:3,meat:.75,firewood:.10,hpProtection:.08,manaProtection:.05}
};

const MATERIAL={
  meat:{price:2,target:[8,12,16]},
  tendon:{price:4,target:[4,7,10]},
  wolfSkin:{price:5,target:[3,7,10]},
  boarSkin:{price:6,target:[3,7,10]},
  wolfFang:{price:7,target:[1,3,4]},
  boarTusk:{price:8,target:[1,3,4]},
  alphaWolfSkin:{price:16,target:[0,2,3],rare:true},
  alphaFang:{price:18,target:[0,1,2],rare:true},
  greatBoarSkin:{price:25,target:[0,0,2],boss:true},
  greatBoarTendon:{price:14,target:[0,0,2],boss:true},
  greatBoarTusk:{price:20,target:[0,0,2],boss:true}
};

const CITY_LOOT_MIN_TREASURY=55;

const ALPHA_CHANCE=[.02,.04,.07,.10,.14];
const BOSS_CHANCE=[.005,.01,.02,.04,.07];

module.exports={TICK_MINUTES,MAX_MINUTES,PROFILES,CLASS,ITEM,TEXTILE_ORIGIN,RECIPES,FOOD,MATERIAL,CITY_LOOT_MIN_TREASURY,ALPHA_CHANCE,BOSS_CHANCE,REPAIR_RATE,REPAIR_THRESHOLD};
