#!/usr/bin/env node
'use strict';

const {runCity,runThreatNeglect,runTextileOriginTrial,summarize,summarizeThreat,PROFILES}=require('./sim/world-core');

const RUNS_PER_PROFILE=Number(process.argv[2]||1000);
const SEED=Number(process.argv[3]||1989);
const pct=v=>`${(v*100).toFixed(1)}%`;

function main(){
  console.log('Pueblos de Gremios — simulador de ciclo Nv.1–3 v2');
  console.log(`Semilla base: ${SEED}`);
  console.log(`Corridas por perfil: ${RUNS_PER_PROFILE}`);
  console.log('Combate persistente: NO. Resolución abstracta para medir ritmo/economía.\n');

  const reports=[];
  let profileIndex=0;

  for(const profileKey of Object.keys(PROFILES)){
    const rows=[];
    for(let i=0;i<RUNS_PER_PROFILE;i++){
      rows.push(runCity(SEED+profileIndex*1000003+i*7919,profileKey));
    }

    const r=summarize(profileKey,rows);
    reports.push(r);
    profileIndex++;

    console.log(PROFILES[profileKey].label);
    console.log(`  Nv.2: ${pct(r.level2Rate)} | media ${r.level2Mean.toFixed(1)} min | mediana ${r.level2Median.toFixed(1)}`);
    console.log(`  Nv.3: ${pct(r.level3Rate)} | media ${r.level3Mean.toFixed(1)} min | mediana ${r.level3Median.toFixed(1)}`);
    console.log(`  Textilería: ${pct(r.textileRate)} | media ${r.textileMean.toFixed(1)} min`);
    console.log(`  Fundadores al llegar a Nv.3: nivel medio ${r.foundersLevelAtCity3.toFixed(2)} | Nv.2+ ${pct(r.foundersAtLeast2AtCity3)} | al min 90 ${r.foundersLevelMean.toFixed(2)}`);
    console.log(`  Incapacitaciones: ${r.downsMean.toFixed(2)} | XP perdida: ${r.xpLostMean.toFixed(1)} | combates: ${r.fightsMean.toFixed(1)}`);
    console.log(`  Descansos: ${r.restsMean.toFixed(2)} | reparaciones: ${r.repairsMean.toFixed(2)} | fundador reparado: ${r.founderRepairsMean.toFixed(2)} | roturas fundador: ${r.founderBreaksMean.toFixed(2)}`);
    console.log(`  Platos: ${r.mealsMean.toFixed(2)} | raciones: ${r.rationsMean.toFixed(2)}`);
    console.log(`  Gasto equipo/descanso/reparación/comida: ${r.gearSpendMean.toFixed(1)} / ${r.restSpendMean.toFixed(1)} / ${r.repairSpendMean.toFixed(1)} / ${r.foodSpendMean.toFixed(1)}`);
    console.log(`  Reinversión total: ${pct(r.reinvestRate)} | recurrente: ${pct(r.recurringReinvestRate)}`);
    console.log(`  Demanda satisfecha: ${pct(r.demandFulfilledRate)} | sin stock: ${pct(r.demandStockMissRate)} | sin dinero: ${pct(r.demandCoinMissRate)}`);
    console.log(`  Botín generado: ${r.lootGeneratedMean.toFixed(1)} u | vendido: ${pct(r.lootSoldRate)} | retenido: ${r.lootRetainedMean.toFixed(1)} u`);
    console.log(`  Ofertas al mercado: ${r.lootOfferUnitsMean.toFixed(1)} u | aceptado/ofrecido: ${pct(r.lootAcceptedRate)} | sin demanda: ${pct(r.lootNoDemandRate)} | tesorería: ${pct(r.lootTreasuryRejectRate)} | pagado: ${r.lootPurchaseValueMean.toFixed(1)}`);
    console.log(`  Monedas ciudad final: ${r.cityCoinsMean.toFixed(1)} | compras bloqueadas: ${r.blockedPurchasesMean.toFixed(1)}`);
    console.log(`  Alfa visto: ${pct(r.alphaSeenRate)} | Boss visto: ${pct(r.bossSeenRate)} | Boss derrotado: ${pct(r.bossDefeatRate)}`);
    console.log(`  Textil producido N/W/B/A/G: ${r.textileProducedMean.neutral.toFixed(1)} / ${r.textileProducedMean.wolf.toFixed(1)} / ${r.textileProducedMean.boar.toFixed(1)} / ${r.textileProducedMean.alphaWolf.toFixed(2)} / ${r.textileProducedMean.greatBoar.toFixed(2)}`);
    console.log(`  Textil vendido N/W/B/A/G: ${r.textileSoldMean.neutral.toFixed(1)} / ${r.textileSoldMean.wolf.toFixed(1)} / ${r.textileSoldMean.boar.toFixed(1)} / ${r.textileSoldMean.alphaWolf.toFixed(2)} / ${r.textileSoldMean.greatBoar.toFixed(2)}`);
    console.log(`  Presencia final Lobo/Jabalí: ${r.wolfPresenceMean.toFixed(1)} / ${r.boarPresenceMean.toFixed(1)} | incidentes: ${r.threatIncidentsMean.toFixed(2)} | ataques: ${r.cityAttacksMean.toFixed(2)}\n`);
  }

  const neglectRows=[];
  for(let i=0;i<RUNS_PER_PROFILE;i++){
    neglectRows.push(runThreatNeglect(SEED+90000000+i*6151,'normal',180));
  }
  const threat=summarizeThreat(neglectRows);

  const originTrials=[];
  for(const cls of ['warrior','explorer','healer','mage']){
    for(const origin of ['neutral','wolf','boar','alphaWolf','greatBoar']){
      originTrials.push(runTextileOriginTrial(SEED+70000000+originTrials.length*1009,cls,origin,5000,'boar',2));
    }
  }

  console.log('PRUEBA CONTROLADA — Protección ligera por origen vs 2 Jabalíes');
  for(const cls of ['warrior','explorer','healer','mage']){
    const rows=originTrials.filter(x=>x.cls===cls);
    console.log(`  ${cls}: `+rows.map(x=>`${x.origin} V${pct(x.winRate)} HP${pct(x.hpLossMean)} Mana${pct(x.manaUseMean)}`).join(' | '));
  }
  console.log('');

  console.log('PRUEBA ESPECIAL — 180 min sin controlar fauna');
  console.log(`  Presencia final Lobo/Jabalí: ${threat.wolfPresenceMean.toFixed(1)} / ${threat.boarPresenceMean.toFixed(1)}`);
  console.log(`  Con incidentes: ${pct(threat.incidentRate)} | media ${threat.incidentMean.toFixed(2)}`);
  console.log(`  Con ataque a ciudad: ${pct(threat.attackRate)} | media ${threat.attackMean.toFixed(2)}`);
  console.log(`  Lesiones de trabajadores: ${threat.workerInjuryMean.toFixed(2)} | pérdidas equivalentes: ${threat.lossMean.toFixed(1)}`);
  console.log(`  Alfa visto: ${pct(threat.alphaSeenRate)} | Boss visto: ${pct(threat.bossSeenRate)}\n`);

  console.log('RESUMEN_JSON');
  console.log(JSON.stringify({seed:SEED,runsPerProfile:RUNS_PER_PROFILE,reports,originTrials,threatNeglect:threat},null,2));
}

if(require.main===module)main();
