#!/usr/bin/env node
'use strict';

const assert=require('node:assert/strict');

require('../game-data.js');
const DATA=globalThis.PG_DATA;
const CORE=require('../adventurer-core.js');

function city(){
  return {id:'city-1',name:'Villa Prueba',tier:'Pueblo'};
}

function testLegacyMigration(){
  const legacy={
    id:'old-1',
    firstName:'Kael',
    lastName:'Doran',
    fullName:'Kael Doran',
    roleKey:'warrior',
    role:'Guerrero',
    level:2,
    xp:17,
    stats:{hp:108,attack:8,defense:8,speed:4,support:1},
    hpMax:108,
    hpCurrent:54,
    coins:211,
    weaponDamage:9,
    weaponQuality:61,
    personalityKey:'prudent',
    personality:'Prudente',
    equipment:{weapon:{id:'starter-weapon',name:'Equipo inicial',damage:7,quality:50}},
    inventory:[{id:'old-drop',qty:1}]
  };

  const npc=CORE.normalizeAdventurer(legacy,DATA);
  assert.equal(npc.adventurerSchemaVersion,1);
  assert.equal(npc.classKey,'warrior');
  assert.deepEqual(npc.stats,{hp:120,attack:10,defense:7,initiative:4,mana:18});
  assert.equal(npc.hpMax,120);
  assert.equal(npc.hpCurrent,60,'debe conservar la proporción de Vida del save anterior');
  assert.equal(npc.manaMax,18);
  assert.equal(npc.manaCurrent,18);
  assert.equal(npc.level,2);
  assert.equal(npc.xp,17);
  assert.equal(npc.coins,211);
  assert.equal(npc.equipment.weapon.id,'legacy-acquired-weapon');
  assert.equal(npc.equipment.weapon.damage,9);
  assert.equal(npc.weaponDamage,9);
  assert.equal(npc.inventory.length,1);
  assert.deepEqual(CORE.validateAdventurer(npc,DATA),[]);

  const second=CORE.normalizeAdventurer(npc,DATA);
  assert.deepEqual(second,npc,'la migración debe ser idempotente');
}

function testFreshClasses(){
  const explorer=CORE.createAdventurer(DATA,{
    id:'e1',firstName:'Lysa',lastName:'Wren',fullName:'Lysa Wren',
    city:city(),classKey:'explorer',combatStyle:'daggers',personalityKey:'bold',
    coins:64,createdAt:1
  });
  assert.deepEqual(explorer.stats,{hp:90,attack:14,defense:3,initiative:8,mana:32});
  assert.equal(explorer.evasion,.14);
  assert.equal(explorer.equipment.weapon.id,'founder-explorer-daggers');
  assert.equal(explorer.equipment.weapon.durability,8);
  assert.equal(explorer.equipment.body.durability,10);
  assert.equal(explorer.coins,64);
  assert.equal(explorer.inventory.length,0);
  assert.deepEqual(CORE.validateAdventurer(explorer,DATA),[]);

  const healer=CORE.createAdventurer(DATA,{
    id:'h1',firstName:'Nora',lastName:'Hale',fullName:'Nora Hale',
    city:city(),classKey:'healer',personalityKey:'loyal',
    coins:60,createdAt:1
  });
  assert.deepEqual(healer.stats,{hp:80,attack:9,defense:5,initiative:5,mana:58});
  assert.equal(healer.equipment.weapon.id,'founder-healer-staff');

  const mage=CORE.createAdventurer(DATA,{
    id:'m1',firstName:'Rhea',lastName:'Voss',fullName:'Rhea Voss',
    city:city(),classKey:'mage',personalityKey:'ambitious',
    coins:70,createdAt:1
  });
  assert.deepEqual(mage.stats,{hp:72,attack:16,defense:3,initiative:6,mana:64});
  assert.equal(mage.evasion,.03);
  assert.equal(mage.equipment.weapon.id,'founder-mage-focus');
  assert.deepEqual(CORE.validateAdventurer(mage,DATA),[]);
}

function testProgressionData(){
  assert.deepEqual(DATA.founding.founderClassKeys,['warrior','explorer','healer']);
  assert.deepEqual(DATA.founding.adventurerCoinRange,[55,75]);
  assert.equal(DATA.adventurerProgression.xpToNext[1],45);
  assert.equal(DATA.adventurerProgression.xpToNext[2],90);
  assert.equal(DATA.adventurerProgression.xpToNext[3],150);
  assert.ok(DATA.adventurerRoles.mage,'Mago debe existir en datos aunque no sea fundador');
}

testLegacyMigration();
testFreshClasses();
testProgressionData();

console.log('v0.9.0a adventurer-core: 3 suites OK');
