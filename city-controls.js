(function(root){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const signatures=new Map();
function panel(host,id){let p=document.getElementById(id);if(!p){p=document.createElement('article');p.id=id;p.className='panel management-section';host.append(p);}return p;}
function update(p,signature,html){if(signatures.get(p.id)===signature||p.contains(document.activeElement)&&document.activeElement.matches('input,select'))return;signatures.set(p.id,signature);p.innerHTML=html;}
const field=(name,label,value)=>`<label><input type="checkbox" data-plan-field="${name}" ${value?'checked':''}> ${label}</label>`;
function render(state,design,world){
 for(const [screen,key] of [['smithy','smithy'],['carpenter','carpenter'],['textile','textile'],['inn','meson'],['guildHall','guildHall'],['townHall','townHall']]){
  const host=document.querySelector(`[data-screen="${screen}"]`);if(!host)continue;
  const p=panel(host,screen+'-upgrades');const q=world.upgradeQuote(state,key,design);
  update(p,JSON.stringify([q,state.buildings[key]]),`<h3>Mejoras · ${esc(design.buildings[key].name)}</h3><p>Nivel actual ${state.buildings[key]?.level||0}</p>${q.cost?`<p>Próximo: Nv.${q.next} · ${esc(q.benefit)}</p><p>${q.cost.coins} monedas · ${q.cost.wood} Madera · ${q.cost.stone} Piedra</p>`:''}<p class="muted">${esc(q.reason||'Se usan sólo fondos disponibles, nunca recompensas reservadas.')}</p><button class="small-action" data-manage-action="upgrade" data-building-key="${key}" ${q.ok?'':'disabled'}>Mejorar edificio</button>`);
 }
 const inn=document.querySelector('[data-screen="inn"]');const kitchen=state.worldSystems.meson.kitchen;
 if(inn){const p=panel(inn,'inn-kitchen');update(p,JSON.stringify([kitchen,state.worldSystems.production.queue.filter(j=>j.shop==='meson'),state.worldSystems.production.stock.simpleMeal,state.worldSystems.production.stock.travelRation]),`<h3>Cocina de Nara</h3><p>Platos: <strong>${state.worldSystems.production.stock.simpleMeal||0}</strong> · Raciones: <strong>${state.worldSystems.production.stock.travelRation||0}</strong></p><p class="muted">Los aventureros pagan por comida preparada. Los platos de trabajo son un gasto interno de la ciudad.</p><button class="small-action" data-manage-action="kitchen" data-enabled="${!kitchen.enabled}">${kitchen.enabled?'Pausar cocina automática':'Mantener automáticamente 2 platos y 2 raciones'}</button><div class="production-grid"><button class="small-action" data-world-recipe="simpleMeal">Preparar plato · 0,75 Carne + 0,15 Leña</button><button class="small-action" data-world-recipe="travelRation">Preparar ración · 0,75 Carne + 0,10 Leña</button></div><div id="kitchenQueue"></div>`);
 const queue=p.querySelector('#kitchenQueue');if(queue){const jobs=state.worldSystems.production.queue.filter(j=>j.shop==='meson');if(queue.dataset.jobs!==jobs.map(j=>j.id).join('|')){queue.dataset.jobs=jobs.map(j=>j.id).join('|');queue.replaceChildren();for(const j of state.worldSystems.production.queue.filter(j=>j.shop==='meson')){const info=world.activityProgress(state,j),div=document.createElement('div');div.className='job-progress';div.dataset.job=j.id;div.innerHTML=`<strong>${esc(design.recipes[j.recipeKey].name)}</strong><small>${info.remainingSeconds} s restantes</small><progress max="100" value="${info.percent}"></progress><button class="small-action" data-manage-action="cancel-production" data-job="${esc(j.id)}">Cancelar · ${state.worldSystems.clockMinutes<=j.startedAtMinute?'devuelve materiales':'sin devolución de materiales usados'}</button>`;queue.append(div);}}for(const div of queue.children){const job=jobs.find(j=>j.id===div.dataset.job);if(!job)continue;const info=world.activityProgress(state,job);div.querySelector('progress').value=info.percent;div.querySelector('small').textContent=info.remainingSeconds+' s restantes';div.querySelector('button').textContent='Cancelar y pausar cocina · '+(state.worldSystems.clockMinutes<=job.startedAtMinute?'devuelve materiales':'sin devolución de materiales usados');}}}
 for(const screen of ['workers','map']){
  const host=document.querySelector(`[data-screen="${screen}"]`);if(!host)continue;const p=panel(host,screen+'-plans');
  const sign=JSON.stringify([state.worldSystems.workerPlans,['mara','logger','hunter'].map(k=>state.workers[k]),state.worldSystems.production.stock]);
  update(p,sign,`<h3>Planes de trabajo</h3><p class="muted">Repetir trabajo → descanso → regreso. Las rutas peligrosas, heridas o herramientas rotas pausan el plan. La comida es opcional.</p>`+['mine','wood','hunt'].map(kind=>{
   const key={mine:'mara',wood:'logger',hunt:'hunter'}[kind],w=state.workers[key],plan=state.worldSystems.workerPlans[kind]||{},target=plan.target||{mine:'iron',wood:'wood',hunt:'meat'}[kind];
   const targets={mine:{iron:'Hierro + Piedra',stone:'Piedra + Hierro',hardVein:'Veta Dura · requiere Pico de hierro'},wood:{wood:'Madera + Leña',firewood:'Leña + Madera'},hunt:{meat:'Carne + Piel + Tendón',skin:'Piel + Carne',tendon:'Tendón + Carne'}}[kind];
   const tool={mine:'ironPickaxe',wood:'workAxe',hunt:'huntingBow'}[kind];
   return `<div class="management-card" data-plan-kind="${kind}"><strong>${esc(w.name||w.profession||'Mara')} · ${Math.round(w.stamina||0)}/100 Resistencia</strong><p>${esc(plan.reason||'Plan manual')} · ${plan.enabled?'Automático':'Pausado'}</p><label>Prioridad <select data-plan-target>${Object.entries(targets).map(([k,label])=>`<option value="${k}" ${k===target?'selected':''}>${label}</option>`).join('')}</select></label>${field('autoRepair','Reparar automáticamente (reserva mínima de 55 monedas)',plan.autoRepair!==false)}${field('meal','Usar un plato preparado al descansar',plan.meal!==false)}${field('sharpen','Preparar herramienta antes de salir · 2 monedas',!!plan.sharpen)}<div class="production-grid"><button class="small-action" data-manage-action="plan" data-kind="${kind}" data-enabled="${!plan.enabled}">${plan.enabled?'Pausar plan':'Guardar y activar plan'}</button><button class="small-action" data-manage-action="plan-save" data-kind="${kind}">Guardar prioridad</button><button class="small-action" data-manage-action="cancel-worker" data-kind="${kind}" ${w.currentJob?'':'disabled'}>Cancelar salida</button><button class="small-action" data-manage-action="repair-worker" data-worker="${key}">Reparar · desde 2 monedas</button><button class="small-action" data-manage-action="sharpen-worker" data-worker="${key}">Preparar · 2 monedas</button><button class="small-action" data-manage-action="equip-worker" data-worker="${key}" data-tool="${tool}">Equipar ${esc(design.workerTools[tool].name)}</button></div><small>${esc(w.worldTool.name)} · ${esc(w.worldTool.qualityLabel||'Fundadora')} · Durabilidad ${w.worldTool.durability}/${w.worldTool.maxDurability}</small></div>`;
  }).join(''));
 }
 const guild=document.querySelector('[data-screen="guildHall"]');if(guild){const p=panel(guild,'guildHall-groups');const groups=new Map();for(const n of state.adventurers){const a=n.autonomy.currentActivity;if(a?.kind==='group')groups.set(a.groupId,a);}
 const sign=JSON.stringify([...groups.values()].map(a=>[a.groupId,a.members]))+JSON.stringify(state.worldSystems.chronology.records);
 update(p,sign,`<h3>Grupos de aventureros</h3><p>Los aventureros eligen compañeros según su estado y el peligro. Lobo Alfa desde Ciudad Nv.2; Gran Jabalí desde Nv.3.</p>`+(groups.size?[...groups.values()].map(a=>`<article class="management-card"><strong>${esc(design.enemies[a.enemyKey]?.name)}</strong><p>${a.members.map(id=>esc(state.adventurers.find(n=>n.id===id)?.fullName)).join(' · ')}</p><p>Salida conjunta · preparado según equipo, recuperación y raciones disponibles.</p></article>`).join(''):'<p class="muted">No hay un grupo fuera de la ciudad ahora. Podés ver sus salidas en el mapa.</p>')+['firstAlphaWolfDefeat','firstGreatBoarDefeat'].filter(k=>state.worldSystems.chronology.records[k]).map(k=>`<p>Primera victoria: ${k==='firstAlphaWolfDefeat'?'Lobo Alfa':'Gran Jabalí'} · ${state.worldSystems.chronology.records[k].members.map(n=>esc(n.name)).join(', ')}</p>`).join(''));
 }
}
function action(dataset,card,state,design,world){
 switch(dataset.manageAction){
 case 'withdraw-mission':return world.withdrawMission(state,dataset.mission);
 case 'upgrade':return world.upgradeBuilding(state,dataset.buildingKey,design);
 case 'cancel-production':return world.cancelProduction(state,dataset.job,design);
 case 'cancel-worker':return world.cancelWorkerOuting(state,dataset.kind);
 case 'kitchen':return world.setKitchen(state,dataset.enabled==='true');
 case 'components':return world.prepareComponents(state,dataset.recipe,design);
 case 'repair-worker':return world.repairWorkerTools(state,design,dataset.worker);
 case 'equip-worker':return world.equipWorkerTool(state,dataset.worker,dataset.tool,design);
 case 'plan':case 'plan-save':{
 const host=document.querySelector(`.screen.is-active [data-plan-kind="${dataset.kind}"]`);const config={target:host.querySelector('[data-plan-target]').value};for(const input of host.querySelectorAll('[data-plan-field]'))config[input.dataset.planField]=input.checked;
 if(dataset.manageAction==='plan')config.enabled=dataset.enabled==='true';return world.setWorkerPlan(state,dataset.kind,config);}
 default:return null;
 }
}
root.PG_CITY_CONTROLS={render,action};
})(globalThis);
