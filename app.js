const titles={city:'Villa del Roble',workers:'Trabajadores',expedition:'Expedición',kingdom:'Reino de Ardel',menu:'Menú'};
const screens=[...document.querySelectorAll('.screen')];
const nav=[...document.querySelectorAll('.nav-btn')];
const title=document.getElementById('screenTitle');
function showScreen(name){screens.forEach(s=>s.classList.toggle('is-active',s.dataset.screen===name));nav.forEach(b=>b.classList.toggle('is-active',b.dataset.target===name));title.textContent=titles[name]||'Pueblos de Gremios';window.scrollTo({top:0,behavior:'smooth'});}
nav.forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.target)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.go)));
const dialog=document.getElementById('buildingDialog');
const buildingName=document.getElementById('buildingName');
const buildingCopy=document.getElementById('buildingCopy');
const copy={Ayuntamiento:'Centro administrativo del asentamiento. Aquí se gestionará el crecimiento y el prestigio.',Taberna:'Atención de aventureros, cocina, descanso, rumores y pedidos.',Herrería:'Producción de herramientas, armas y encargos especiales.',Carpintería:'Madera, muebles, herramientas y componentes para otros edificios.',Posada:'Alojamiento para aventureros, descanso y servicios de hospedaje.'};
document.querySelectorAll('[data-building]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.building;buildingName.textContent=n;buildingCopy.textContent=copy[n]||'Gestión del edificio.';dialog.showModal();}));
const expeditionBtn=document.getElementById('startExpedition');
const expeditionFeedback=document.getElementById('expeditionFeedback');
expeditionBtn.addEventListener('click',()=>{expeditionBtn.disabled=true;expeditionBtn.textContent='Expedición iniciada';expeditionFeedback.textContent='Mara partió hacia la Cantera del Este. Esta es una simulación local de la v0.1.1h2.';});
let deferredPrompt=null;
const installBtn=document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.disabled=false;});
installBtn.addEventListener('click',async()=>{if(!deferredPrompt){installBtn.querySelector('span').textContent='Usá “Instalar app” del navegador';return;}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;});
if('serviceWorker' in navigator){
  let refreshing=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;window.location.reload();});
  window.addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./sw.js?v=0.1.1h2',{updateViaCache:'none'});
      await reg.update();
    }catch{}
  });
}
