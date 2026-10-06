const CACHE='pueblos-gremios-v0.9.1d';
const ASSETS=[
  './index.html?v=0.9.1d',
  './styles.css?v=0.9.1d',
  './activity.css?v=0.9.1d',
  './world-loop.css?v=0.9.1d',
  './game-data.js?v=0.9.1d',
  './adventurer-core.js?v=0.9.1d',
  './city-progression.js?v=0.9.1d',
  './activity-combat.js?v=0.9.1d',
  './world-design-data.js?v=0.9.1d',
  './world-loop.js?v=0.9.1d',
  './management-ui.js?v=0.9.1d',
  './city-controls.js?v=0.9.1d',
  './city-life.js?v=0.9.1d',
  './city-life.css?v=0.9.1d',
  './app.js?v=0.9.1d',
  './manifest.webmanifest?v=0.9.1d',
  './icons/icon.svg?v=0.9.1d'
];

self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',e=>e.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isNavigation=e.request.mode==='navigate';

  if(isNavigation){
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .then(r=>{
          const clone=r.clone();
          caches.open(CACHE).then(c=>c.put('./index.html?v=0.9.1d',clone));
          return r;
        })
        .catch(()=>caches.match('./index.html?v=0.9.1d'))
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return r;
      })
      .catch(()=>caches.match(e.request))
  );
});
