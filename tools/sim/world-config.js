'use strict';

const TICK_MINUTES=5;
const MAX_MINUTES=90;

const PROFILES={
  efficient:{label:'Eficiente',worker:.98,adv:.65,shop:.26,restHp:.58,restMana:.36,missionBias:1.08,paidMission:.44},
  normal:{label:'Normal',worker:.86,adv:.55,shop:.18,restHp:.60,restMana:.40,missionBias:1.00,paidMission:.40},
  conservative:{label:'Conservador',worker:.78,adv:.45,shop:.12,restHp:.70,restMana:.50,missionBias:.92,paidMission:.34},
  aggressive:{label:'Agresivo',worker:.88,adv:.70,shop:.24,restHp:.45,restMana:.28,missionBias:1.05,paidMission:.48},
  poor:{label:'Mala gestión',worker:.58,adv:.38,shop:.08,restHp:.55,restMana:.34,missionBias:.82,paidMission:.30}
};

const CLASS={
  warrior:{hp:120,mana:18,attack:10,defense:7,initiative:4,evasion:.02},
  explorer:{hp:90,mana:32,attack:14,defense:3,initiative:8,evasion:.14},
  healer:{hp:80,mana:58,attack:9,defense:5,initiative:5,evasion:.03},
  mage:{hp:72,mana:64,attack:16,defense:3,initiative:6,evasion:.03}
};

const ITEM={
  dagger:{price:24,class:['explorer'],attack:2,defense:0,initiative:0,mana:0,durability:14,slot:'weapon'},
  bow:{price:28,class:['explorer'],attack:3,defense:0,initiative:1,mana:0,durability:14,slot:'weapon'},
  staff:{price:26,class:['healer','mage'],attack:1,defense:0,initiative:0,mana:12,durability:14,slot:'weapon'},
  shield:{price:22,class:['warrior'],attack:0,defense:3,initiative:-1,mana:0,durability:14,slot:'offhand'},
  leather:{price:24,class:['warrior','explorer','healer','mage'],attack:0,defense:3,initiative:0,mana:0,durability:16,slot:'body'},
  gloves:{price:12,class:['warrior','explorer','healer','mage'],attack:0,defense:1,initiative:0,mana:0,durability:12,slot:'hands'},
  boots:{price:12,class:['warrior','explorer','healer','mage'],attack:0,defense:0,initiative:1,mana:0,durability:12,slot:'feet'}
};

const REPAIR_RATE=.22;
const REPAIR_THRESHOLD=.35;

const RECIPES={
  dagger:{iron:3,firewood:1},
  bow:{wood:4,tendon:2},
  staff:{wood:3},
  shield:{wood:4,iron:1},
  leather:{skin:3,tendon:1},
  gloves:{skin:2},
  boots:{skin:2}
};

const ALPHA_CHANCE=[.02,.04,.07,.10,.14];
const BOSS_CHANCE=[.005,.01,.02,.04,.07];

module.exports={TICK_MINUTES,MAX_MINUTES,PROFILES,CLASS,ITEM,RECIPES,ALPHA_CHANCE,BOSS_CHANCE,REPAIR_RATE,REPAIR_THRESHOLD};
