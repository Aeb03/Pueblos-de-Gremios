#!/usr/bin/env node
'use strict';

// Pueblos de Gremios — simulador de balance de combate v1
// Herramienta de desarrollo. NO representa un combate persistente del juego.

const DEFAULT_RUNS = Number(process.argv[2] || 10000);
const SEED = Number(process.argv[3] || 1989);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rng, mean, std) {
  const u = Math.max(Number.EPSILON, rng());
  const v = Math.max(Number.EPSILON, rng());
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * std;
}

function makeUnit(spec) {
  return {
    ...spec,
    hpMax: spec.hp,
    hpCurrent: spec.hp,
    manaMax: spec.mana || 0,
    manaCurrent: spec.mana || 0,
    weapon: spec.weapon || 0,
    evasion: spec.evasion || 0,
    alive: true,
    stunned: 0,
    burn: 0,
    wound: 0,
    paralyzed: 0
  };
}

function cloneUnit(spec) {
  const base = makeUnit(spec);
  return JSON.parse(JSON.stringify(base));
}

const HEROES = {
  warrior: {
    id: 'warrior', name: 'Guerrero', role: 'warrior',
    hp: 120, attack: 10, defense: 7, initiative: 4, mana: 18,
    evasion: 0.02, weapon: 4, unlockedStates: []
  },
  explorer: {
    id: 'explorer', name: 'Explorador', role: 'explorer',
    hp: 90, attack: 14, defense: 3, initiative: 8, mana: 32,
    evasion: 0.14, weapon: 4, unlockedStates: []
  },
  healer: {
    id: 'healer', name: 'Sanador', role: 'healer',
    hp: 80, attack: 9, defense: 5, initiative: 5, mana: 58,
    evasion: 0.03, weapon: 3, unlockedStates: []
  },
  mage: {
    id: 'mage', name: 'Mago', role: 'mage',
    hp: 72, attack: 16, defense: 3, initiative: 6, mana: 64,
    evasion: 0.03, weapon: 3, unlockedStates: []
  }
};

const ENEMIES = {
  wolf: {
    id: 'wolf', name: 'Lobo', role: 'wolf', type: 'animal', rarity: 'common',
    hp: 34, attack: 9, defense: 2, initiative: 7, mana: 0,
    evasion: 0.05
  },
  boar: {
    id: 'boar', name: 'Jabalí', role: 'boar', type: 'animal', rarity: 'common',
    hp: 55, attack: 12, defense: 5, initiative: 3, mana: 0,
    evasion: 0.02
  },
  alphaWolf: {
    id: 'alphaWolf', name: 'Lobo Alfa', role: 'alpha', type: 'animal', rarity: 'rare',
    hp: 95, attack: 15, defense: 5, initiative: 8, mana: 0,
    evasion: 0.08
  },
  greatBoar: {
    id: 'greatBoar', name: 'Gran Jabalí', role: 'boss', type: 'animal', rarity: 'boss',
    hp: 280, attack: 21, defense: 10, initiative: 4, mana: 0,
    evasion: 0.02
  }
};

function alive(list) {
  return list.filter(unit => unit.alive && unit.hpCurrent > 0);
}

function applyDamage(target, amount) {
  target.hpCurrent = Math.max(0, target.hpCurrent - Math.max(0, amount));
  if (target.hpCurrent <= 0) target.alive = false;
}

function damageRoll(rng, attacker, target, multiplier = 1) {
  const raw = (attacker.attack + attacker.weapon) * multiplier - target.defense * 0.7;
  const mean = Math.max(1, raw);
  return Math.max(1, normal(rng, mean, Math.max(0.5, mean * 0.12)));
}

function hasLivingWarrior(party) {
  return party.some(u => u.alive && u.role === 'warrior');
}

function selectEnemyTarget(party) {
  return alive(party).sort((a, b) => (a.hpCurrent / a.hpMax) - (b.hpCurrent / b.hpMax))[0];
}

function selectHeroTarget(rng, foes) {
  const list = alive(foes);
  return list[Math.floor(rng() * list.length)];
}

function alphaAlive(foes) {
  return foes.some(u => u.alive && u.role === 'alpha');
}

function heroAction(rng, actor, party, foes) {
  const targets = alive(foes);
  if (!targets.length) return;

  if (actor.role === 'healer') {
    const injured = alive(party)
      .filter(u => u.hpCurrent / u.hpMax < 0.60)
      .sort((a, b) => (a.hpCurrent / a.hpMax) - (b.hpCurrent / b.hpMax));

    if (injured.length && actor.manaCurrent >= 10) {
      const target = injured[0];
      const heal = 20 + (rng() * 4 - 2);
      target.hpCurrent = Math.min(target.hpMax, target.hpCurrent + heal);
      actor.manaCurrent -= 10;
      return;
    }

    const target = selectHeroTarget(rng, foes);
    applyDamage(target, damageRoll(rng, actor, target, 1.0));
    return;
  }

  if (actor.role === 'mage') {
    const target = selectHeroTarget(rng, foes);
    if (actor.manaCurrent >= 10) {
      const roll = rng();
      if (roll < 0.38) {
        actor.manaCurrent -= 10;
        applyDamage(target, damageRoll(rng, actor, target, 1.15));
        if (actor.unlockedStates?.includes('burn') && rng() < 0.25) target.burn = Math.max(target.burn, 2);
      } else if (roll < 0.68) {
        actor.manaCurrent -= 10;
        applyDamage(target, damageRoll(rng, actor, target, 1.05));
        if (actor.unlockedStates?.includes('paralysis') && rng() < 0.18) target.paralyzed = Math.max(target.paralyzed, 1);
      } else {
        actor.manaCurrent -= 8;
        applyDamage(target, damageRoll(rng, actor, target, 1.25));
      }
    } else {
      applyDamage(target, damageRoll(rng, actor, target, 0.80));
    }
    return;
  }

  if (actor.role === 'explorer') {
    const target = selectHeroTarget(rng, foes);
    const boosted = actor.manaCurrent >= 6;
    if (boosted) actor.manaCurrent -= 6;
    applyDamage(target, damageRoll(rng, actor, target, boosted ? 1.25 : 1.0));
    return;
  }

  if (actor.role === 'warrior') {
    const target = selectHeroTarget(rng, foes);
    let multiplier = 1.05;
    if (actor.manaCurrent >= 3 && rng() < 0.35) {
      actor.manaCurrent -= 3;
      multiplier = 1.15;
      if (actor.unlockedStates?.includes('stun') && rng() < 0.15) target.stunned = Math.max(target.stunned, 1);
    }
    applyDamage(target, damageRoll(rng, actor, target, multiplier));
  }
}

function enemyAction(rng, actor, party, foes) {
  const targets = alive(party);
  if (!targets.length) return;

  const target = selectEnemyTarget(party);
  if (!target) return;
  if (rng() < target.evasion) return;

  let multiplier = 1;

  if (actor.role === 'wolf') {
    if (alphaAlive(foes)) multiplier *= 1.10;
    const pack = alive(foes).filter(u => u.role === 'wolf' || u.role === 'alpha').length;
    multiplier *= 1 + Math.min(0.15, Math.max(0, pack - 1) * 0.05);
    if (rng() < 0.15) target.wound = Math.max(target.wound, 2);
  }

  if (actor.role === 'boar') {
    if (rng() < 0.35) multiplier = 1.25;
    if (actor.hpCurrent / actor.hpMax < 0.35 && rng() < 0.25) multiplier = 1.40;
  }

  if (actor.role === 'alpha') {
    multiplier = 1.15;
    if (rng() < 0.25) target.wound = Math.max(target.wound, 2);
  }

  if (actor.role === 'boss') {
    if (actor.hpCurrent / actor.hpMax < 0.30) multiplier *= 1.20;
    const move = rng();

    if (move < 0.25) {
      multiplier *= 1.50;
    } else if (move < 0.50) {
      for (const member of targets) {
        if (rng() < member.evasion) continue;
        let splash = damageRoll(rng, actor, member, 0.60);
        if (hasLivingWarrior(party) && member.role !== 'warrior') splash *= 0.85;
        applyDamage(member, splash);
      }
      return;
    } else {
      multiplier *= 1.30;
      if (rng() < 0.25) target.wound = Math.max(target.wound, 2);
    }
  }

  let damage = damageRoll(rng, actor, target, multiplier);
  if (hasLivingWarrior(party) && target.role !== 'warrior') damage *= 0.85;
  applyDamage(target, damage);
}

function applyOngoingStates(unit) {
  if (!unit.alive) return;

  if (unit.burn > 0) {
    applyDamage(unit, unit.hpMax * 0.035);
    unit.burn -= 1;
  }

  if (unit.wound > 0) {
    applyDamage(unit, unit.hpMax * 0.02);
    unit.wound -= 1;
  }
}

function simulateBattle(seed, partySpecs, foeSpecs, options = {}) {
  const rng = mulberry32(seed);
  const party = partySpecs.map(cloneUnit);
  const foes = foeSpecs.map(cloneUnit);
  const maxWindows = options.maxWindows || 30;

  let windows = 0;
  while (windows < maxWindows && alive(party).length && alive(foes).length) {
    windows += 1;
    const actors = [...alive(party), ...alive(foes)]
      .map(unit => ({
        unit,
        score: unit.initiative * (unit.paralyzed ? 0.75 : 1) + rng() * 2
      }))
      .sort((a, b) => b.score - a.score);

    for (const unit of [...alive(party), ...alive(foes)]) applyOngoingStates(unit);

    for (const { unit } of actors) {
      if (!unit.alive) continue;
      if (!alive(party).length || !alive(foes).length) break;

      if (unit.stunned > 0) {
        unit.stunned -= 1;
        continue;
      }

      if (unit.paralyzed > 0) unit.paralyzed -= 1;

      if (party.includes(unit)) heroAction(rng, unit, party, foes);
      else enemyAction(rng, unit, party, foes);
    }
  }

  const partyHpMax = party.reduce((sum, u) => sum + u.hpMax, 0);
  const partyHpRemaining = party.reduce((sum, u) => sum + Math.max(0, u.hpCurrent), 0);
  const manaMax = party.reduce((sum, u) => sum + u.manaMax, 0);
  const manaRemaining = party.reduce((sum, u) => sum + u.manaCurrent, 0);

  return {
    win: alive(party).length > 0 && alive(foes).length === 0,
    hpLossRatio: partyHpMax ? 1 - (partyHpRemaining / partyHpMax) : 1,
    manaUseRatio: manaMax ? 1 - (manaRemaining / manaMax) : 0,
    downs: party.filter(u => !u.alive).length,
    windows
  };
}

function gear(spec, { attack = 0, defense = 0, initiative = 0, mana = 0, evasion = 0 } = {}) {
  return {
    ...spec,
    weapon: (spec.weapon || 0) + attack,
    defense: spec.defense + defense,
    initiative: spec.initiative + initiative,
    mana: (spec.mana || 0) + mana,
    evasion: (spec.evasion || 0) + evasion
  };
}

function pct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function runScenario(name, party, foes, runs, seedBase) {
  const rows = [];
  for (let i = 0; i < runs; i += 1) {
    rows.push(simulateBattle(seedBase + i * 97, party, foes));
  }

  const avg = key => rows.reduce((s, r) => s + r[key], 0) / rows.length;
  const report = {
    scenario: name,
    runs,
    winRate: rows.filter(r => r.win).length / rows.length,
    avgHpLoss: avg('hpLossRatio'),
    anyDown: rows.filter(r => r.downs > 0).length / rows.length,
    avgDowns: avg('downs'),
    avgManaUse: avg('manaUseRatio'),
    avgWindows: avg('windows')
  };

  console.log(`\n${name}`);
  console.log(`  corridas: ${runs}`);
  console.log(`  victoria: ${pct(report.winRate)}`);
  console.log(`  desgaste Vida: ${pct(report.avgHpLoss)}`);
  console.log(`  al menos 1 incapacitado: ${pct(report.anyDown)}`);
  console.log(`  incapacitados medios: ${report.avgDowns.toFixed(3)}`);
  console.log(`  Maná consumido: ${pct(report.avgManaUse)}`);
  console.log(`  ventanas abstractas: ${report.avgWindows.toFixed(2)}`);

  return report;
}

function main() {
  console.log('Pueblos de Gremios — simulador de balance de combate v1');
  console.log(`semilla base: ${SEED}`);
  console.log(`corridas por escenario: ${DEFAULT_RUNS}`);
  console.log('NOTA: herramienta de balance; no es el motor persistente del juego.');
  console.log('Nv.1: ningún Estado ofensivo de clase se considera desbloqueado todavía.');

  const trio = [HEROES.warrior, HEROES.explorer, HEROES.healer];
  const quartet = [...trio, HEROES.mage];
  const preparedTrio = [
    gear(HEROES.warrior, { attack: 1, defense: 2 }),
    gear(HEROES.explorer, { attack: 2, defense: 1, initiative: 1 }),
    gear(HEROES.healer, { attack: 1, defense: 1, mana: 12 })
  ];

  const scenarios = [
    ['Guerrero Nv.1 vs Lobo', [HEROES.warrior], [ENEMIES.wolf]],
    ['Explorador Nv.1 vs Lobo', [HEROES.explorer], [ENEMIES.wolf]],
    ['Trío fundador vs 3 Lobos', trio, [ENEMIES.wolf, ENEMIES.wolf, ENEMIES.wolf]],
    ['Trío fundador vs 2 Jabalíes', trio, [ENEMIES.boar, ENEMIES.boar]],
    ['Trío fundador vs Lobo Alfa + 2 Lobos', trio, [ENEMIES.alphaWolf, ENEMIES.wolf, ENEMIES.wolf]],
    ['Trío fundador vs Gran Jabalí', trio, [ENEMIES.greatBoar]],
    ['Trío preparado vs Gran Jabalí', preparedTrio, [ENEMIES.greatBoar]],
    ['Cuatro clases básicas vs Gran Jabalí', quartet, [ENEMIES.greatBoar]]
  ];

  const reports = scenarios.map((scenario, index) =>
    runScenario(scenario[0], scenario[1], scenario[2], DEFAULT_RUNS, SEED + index * 1000003)
  );

  console.log('\nRESUMEN JSON');
  console.log(JSON.stringify({ seed: SEED, runsPerScenario: DEFAULT_RUNS, reports }, null, 2));
}

if (require.main === module) main();

module.exports = {
  HEROES,
  ENEMIES,
  simulateBattle,
  runScenario
};
