const CACHE='pueblos-gremios-v0.9.1c';
const ASSETS=[
  './index.html?v=0.9.1c',
  './styles.css?v=0.9.1c',
  './activity.css?v=0.9.1c',
  './world-loop.css?v=0.9.1c',
  './game-data.js?v=0.9.1c',
  './adventurer-core.js?v=0.9.1c',
  './city-progression.js?v=0.9.1c',
  './activity-combat.js?v=0.9.1c',
  './world-design-data.js?v=0.9.1c',
  './world-loop.js?v=0.9.1c',
  './management-ui.js?v=0.9.1c',
  './city-controls.js?v=0.9.1c',
  './city-life.js?v=0.9.1c',
  './city-life.css?v=0.9.1c',
  './app.js?v=0.9.1c',
  './manifest.webmanifest?v=0.9.1c',
  './icons/icon.svg?v=0.9.1c'
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
          caches.open(CACHE).then(c=>c.put('./index.html?v=0.9.1c',clone));
          return r;
        })
        .catch(()=>caches.match('./index.html?v=0.9.1c'))
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
