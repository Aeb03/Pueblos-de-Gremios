(function(root){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={smithy:'Herrería',carpenter:'Carpintería',textile:'Textilería'};
  const tabs={smithy:'summary',carpenter:'summary',textile:'summary',inn:'summary',guildHall:'board',townHall:'summary',map:'territory'};
  const panels={smithy:['summary','upgrades','production','store','storage','services','activity'],carpenter:['summary','upgrades','production','store','storage','services','activity'],textile:['summary','tanning','production','store','storage','activity'],inn:['summary','services','guests','activity'],guildHall:['board','missions','adventurers','rewards'],townHall:['summary','treasury','development','buildings','workers','alerts'],map:['territory','workers','outings']};
  for(const key of Object.keys(panels))if(key!=='map'&&!panels[key].includes('upgrades'))panels[key].push('upgrades');panels.inn.splice(1,0,'production');panels.guildHall.push('groups');
  const titles={upgrades:'Mejoras',groups:'Grupos',summary:'Resumen',production:'Producción',store:'Tienda',storage:'Almacén',services:'Servicios',activity:'Actividad',tanning:'Curtido',guests:'Huéspedes',board:'Tablón',missions:'Misiones',adventurers:'Aventureros',rewards:'Recompensas',treasury:'Tesorería',development:'Desarrollo',buildings:'Edificios',workers:'Trabajadores',alerts:'Alertas',territory:'Territorio',outings:'Salidas'};
  const signatures=new Map();
  let callbacks=null;
  function init(actions){
    callbacks=actions;
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-manage-tab]');
      if(b){tabs[b.dataset.manageShop]=b.dataset.manageTab;signatures.delete(b.dataset.manageShop);actions.render();return;}
      const action=e.target.closest('[data-manage-action]');
      if(action)actions.action(action.dataset,action.closest('.management-card'));
    });
    document.addEventListener('change',e=>{
      if(e.target.matches('[data-manage-policy]'))actions.policy(e.target.dataset.managePolicy,e.target.value);
    });
  }
  function row(title,copy,right=''){return `<div class="world-event-row"><span><strong>${esc(title)}</strong><small>${esc(copy)}</small></span><span class="event-right">${esc(right)}</span></div>`;}
  function events(state,filter){const list=state.worldSystems.chronology.events.filter(filter).slice(0,12);return list.length?list.map(e=>row(e.text,'Día '+e.day)).join(''):'<p class="muted">Todavía no hay actividad registrada.</p>';}
  function policy(shop,state){return `<label class="activity-field">Destino de los próximos productos de equipo<select data-manage-policy="${shop}"><option value="store" ${!['sell','recycle'].includes(state.worldSystems.production.policies?.[shop])?'selected':''}>Almacenar</option><option value="sell" ${state.worldSystems.production.policies?.[shop]==='sell'?'selected':''}>Poner a la venta al terminar</option><option value="recycle" ${state.worldSystems.production.policies?.[shop]==='recycle'?'selected':''}>Reciclar equipo terminado</option></select></label><p class="muted">Los componentes quedan en el almacén del taller. La venta automática usa el valor de referencia.</p>`;}
  function queue(shop,state,design,world){const jobs=state.worldSystems.production.queue.filter(j=>j.shop===shop);return `<h3>Cola · ${jobs.length}/${5+Math.max(0,(state.buildings[shop]?.level||1)-1)}</h3>${jobs.length?jobs.map(j=>{const p=world.activityProgress(state,j);return `<div class="job-progress" data-progress-job="${esc(j.id)}"><strong>${esc(design.recipes[j.recipeKey]?.name)}</strong><small data-progress-remaining>${p.waiting?'En espera':'En fabricación'} · ${p.remainingSeconds} s para terminar</small><progress max="100" value="${p.percent}" aria-label="Avance de ${esc(design.recipes[j.recipeKey]?.name)}"></progress><button class="small-action" data-manage-action="cancel-production" data-job="${esc(j.id)}">Cancelar · ${state.worldSystems.clockMinutes<=j.startedAtMinute?'devuelve materiales':'sin devolución de materiales usados'}</button></div>`;}).join(''):'<p class="muted">El taller está disponible.</p>'}`;}
  function products(shop,state,design,store){const goods=Object.values(state.worldSystems.production.goods).flat().filter(p=>(p.ownerShop||design.equipment[p.catalogId]?.shop)===shop);return goods.length?goods.map(p=>`<article class="management-card"><strong>${esc(p.name)} · ${esc(p.qualityLabel)}</strong><p class="muted">Durabilidad ${p.durability}/${p.maxDurability} · ${p.listed?'En venta':'Almacenado'} · Origen ${esc(design.materialOrigins[p.origin]?.label||'Común')}</p><small>Calidad ${esc(p.qualityLabel)}: ${p.qualityBonus>0?'mejora los atributos positivos y la durabilidad respecto de Normal':p.qualityBonus<0?'reduce los atributos y la durabilidad respecto de Normal':'atributos base de fabricación'}. El origen aporta sus propios efectos.</small><p>⚔️ +${p.attack||0} · 🛡️ +${p.defense||0} · ⚡ ${p.initiative||0} · 🔷 +${p.mana||0}</p>${store?`<label class="price-field">Precio <input type="number" min="${Math.ceil(p.referencePrice*.7)}" max="${Math.floor(p.referencePrice*1.3)}" value="${p.salePrice}" data-product-price="${esc(p.id)}"></label><small>Permitido ${Math.ceil(p.referencePrice*.7)}–${Math.floor(p.referencePrice*1.3)} monedas</small><div class="production-grid"><button class="small-action" data-manage-action="price" data-product="${esc(p.id)}">Guardar precio</button><button class="small-action" data-manage-action="listing" data-product="${esc(p.id)}" data-listed="${p.listed?'false':'true'}">${p.listed?'Retirar de venta':'Poner a la venta'}</button><button class="small-action" data-manage-action="recycle" data-product="${esc(p.id)}">Reciclar pieza</button></div>`:`<strong>Valor: ${p.referencePrice} monedas</strong>`}</article>`).join(''):'<p class="muted">No hay productos terminados. Fabricá en Producción y decidí cuáles poner a la venta.</p>';}
  function production(shop,state,design,world){
    const recipes=Object.values(design.recipes).filter(r=>r.shop===shop&&r.id!=='tannedHide');
    const toolbar=policy(shop,state)+queue(shop,state,design,world)+`<label class="price-field">Cantidad por pedido <input type="number" min="1" max="5" value="1" data-craft-quantity></label><p class="muted">Cada pieza ocupa un trabajo. El taller los completa de uno en uno; Cada trabajo muestra su avance continuo y el tiempo restante.</p>`;
    return toolbar+recipes.map(r=>{
      const costs=Object.entries(r.materials||{}).map(([k,q])=>q+' '+design.resources[k].name).concat(Object.entries(r.components||{}).map(([k,q])=>q+' '+design.recipes[k].name));
      if(r.tannedHide)costs.push(r.tannedHide+' cueros del mismo origen');
      const missing=Object.entries(r.materials||{}).filter(([k,q])=>(state.resources[k]||0)<q).map(([k,q])=>design.resources[k].name+' ('+(state.resources[k]||0)+'/'+q+')');
      const componentHelp=r.components?`<button class="small-action" data-manage-action="components" data-recipe="${r.id}">Preparar componentes que faltan</button>`:'';
      return `<article class="management-card recipe-row"><strong>${esc(r.name)}</strong><button class="small-action" data-world-recipe="${r.id}">Fabricar</button><small>${esc(costs.join(' · '))}${missing.length?' · Falta: '+esc(missing.join(', ')):''}</small>${componentHelp}</article>`;
    }).join('');
  }
  function business(shop,state,design,world){const tab=tabs[shop],queueHtml=queue(shop,state,design,world);if(tab==='upgrades')return '';if(tab==='tanning')return queueHtml;if(tab==='production')return production(shop,state,design,world);if(tab==='store')return products(shop,state,design,true);if(tab==='storage')return (shop==='textile'?Object.values(design.materialOrigins).map(o=>row('Cuero curtido · '+o.label,'Material del taller',state.resources[o.tanned]||0)).join(''):'')+Object.entries(state.worldSystems.production.stock).filter(([k])=>design.recipes[k]?.shop===shop).map(([k,q])=>row(design.recipes[k].name,'Componente del taller',q)).join('')+products(shop,state,design,false);if(tab==='activity')return events(state,e=>e.type==='market'||e.type==='repair'||e.type==='service'||e.type==='craft');if(tab==='services')return (shop==='smithy'?Object.entries(state.workers).filter(([,w])=>w.worldTool&&w.worldTool.id!=='huntingBow').map(([key,w])=>`<article class="management-card"><strong>${esc(w.profession||'Mara')} · ${esc(w.worldTool.name)}</strong><small>${w.toolPrepared?'Preparada: +1 recurso principal en la próxima salida':'Afilado/preparación: 2 monedas · una sola salida'}</small><button class="small-action" data-manage-action="sharpen-worker" data-worker="${key}" ${w.toolPrepared?'disabled':''}>Preparar herramienta</button></article>`).join(''):'')+`<h3>${shop==='smithy'?'Reparación y afilado':'Reparación de madera y ajuste de arco'}</h3><p>Los aventureros solicitan el servicio cuando necesitan reparar o preparar su equipo. El pago entra en la tesorería.</p>${events(state,e=>['repair','service'].includes(e.type))}`;if(tab==='summary')return `<h3>${shop==='smithy'?'Borin · Herrero':shop==='carpenter'?'Eldon · Carpintero':'Taller textil'}</h3>${queueHtml}<p>El taller guarda cada objeto fabricado hasta que decidas venderlo. Sus clientes son los aventureros de la ciudad.</p>`;return '';}
  function placeTabs(shop,host){let nav=host.querySelector('.management-tabs');if(!nav){nav=document.createElement('nav');nav.className='management-tabs';nav.setAttribute('aria-label','Secciones del lugar');host.insertBefore(nav,host.querySelector('.hero-card')?.nextSibling||host.firstChild);}if(nav.dataset.activeTab===tabs[shop])return;nav.dataset.activeTab=tabs[shop];nav.innerHTML=panels[shop].map(t=>`<button class="small-action ${tabs[shop]===t?'is-active':''}" data-manage-shop="${shop}" data-manage-tab="${t}">${titles[t]}</button>`).join('');}
  function showSections(shop,tab){const rules={
    inn:{summary:['.hero-card','#mesonSummaryPanel'],services:['#mesonSummaryPanel','#innMaraPanel','#innBorinPanel','#innEldonPanel','#innGathererRestPanel'],guests:['#mesonSummaryPanel'],activity:['#mesonActivityPanel']},
    guildHall:{board:['#guildPublishPanel','#guildDeliveryPanel','#guildEscortPanel'],missions:['#guildMissionsPanel'],adventurers:['#guildResidentsPanel'],rewards:['#guildRewardsPanel']},
    townHall:{summary:['#townHallFundsPanel','#townHallOverviewPanel'],treasury:['#townHallFundsPanel'],development:['#townHallOverviewPanel'],buildings:['#townHallOverviewPanel'],workers:['#townHallOverviewPanel'],alerts:['#townHallAlertPanel']},
    map:{territory:['#mapThreatPanel','#mapZonesPanel'],workers:['#mapWorkersPanel','#mapToolsPanel'],outings:['#mapOutingsPanel']}
  };for(const key of Object.keys(rules))rules[key].upgrades=['#'+key+'-upgrades'];rules.inn.production=['#inn-kitchen'];rules.guildHall.groups=['#guildHall-groups'];rules.map.workers.push('#map-plans');const host=document.querySelector(`[data-screen="${shop}"]`);for(const section of host.querySelectorAll('.management-section'))section.hidden=!(rules[shop][tab]||[]).some(sel=>section.matches(sel));}
  function render(state,design,world){
    if(root.PG_CITY_CONTROLS)root.PG_CITY_CONTROLS.render(state,design,world);
    for(const shop of Object.keys(panels)){
      const host=document.querySelector(`[data-screen="${shop}"]`);if(!host)continue;
      placeTabs(shop,host);
      if(!host.querySelector('.management-message')){const message=document.createElement('p');message.className='feedback management-message';message.setAttribute('role','status');host.append(message);}
      const feedback=document.getElementById(shop==='smithy'?'smithyWorldFeedback':shop==='carpenter'?'carpenterWorldFeedback':shop==='textile'?'textileFeedback':'');
      if(feedback&&feedback.parentElement!==host)host.append(feedback);
      if(['inn','guildHall','townHall','map'].includes(shop)){showSections(shop,tabs[shop]);continue;}
      if(shop==='textile'){
        host.querySelector('.management-tabs').hidden=!state.worldSystems.textile.built;
        const production=document.getElementById('textileProductionPanel');
        if(production){
          production.hidden=!state.worldSystems.textile.built||!['tanning','production'].includes(tabs.textile);
          document.getElementById('tanningActions').hidden=tabs.textile!=='tanning';
          production.querySelectorAll('[data-world-recipe]').forEach(b=>b.hidden=true);
          document.getElementById('textileStockList').hidden=true;
        }
        if(!state.worldSystems.textile.built)continue;
      }
      let area=host.querySelector('.business-management');if(!area){area=document.createElement('article');area.className='panel business-management';host.append(area);}
      area.hidden=tabs[shop]==='upgrades';const upgrades=document.getElementById(shop+'-upgrades');if(upgrades)upgrades.hidden=tabs[shop]!=='upgrades';
      const signature=JSON.stringify([tabs[shop],state.worldSystems.production,state.worldSystems.chronology.events]);
      for(const node of area.querySelectorAll('[data-progress-job]')){
        const job=state.worldSystems.production.queue.find(j=>j.id===node.dataset.progressJob);
        if(!job)continue;const p=world.activityProgress(state,job);
        node.querySelector('progress').value=p.percent;
        node.querySelector('[data-manage-action="cancel-production"]').textContent='Cancelar · '+(state.worldSystems.clockMinutes<=job.startedAtMinute?'devuelve materiales':'sin devolución de materiales usados');
        node.querySelector('[data-progress-remaining]').textContent=(p.waiting?'En espera':'En fabricación')+' · '+p.remainingSeconds+' s para terminar';
      }
      if(signatures.get(shop)===signature||(area.contains(document.activeElement)&&document.activeElement.matches('input,select')))continue;
      signatures.set(shop,signature);area.innerHTML=business(shop,state,design,world);
    }
  }
  root.PG_MANAGEMENT_UI={init,render};
})(globalThis);
