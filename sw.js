const CACHE='pueblos-gremios-v0.9.2a';
const ASSETS=[
  './index.html?v=0.9.2a',
  './styles.css?v=0.9.2a',
  './activity.css?v=0.9.2a',
  './world-loop.css?v=0.9.2a',
  './game-data.js?v=0.9.2a',
  './adventurer-core.js?v=0.9.2a',
  './city-progression.js?v=0.9.2a',
  './activity-combat.js?v=0.9.2a',
  './world-design-data.js?v=0.9.2a',
  './world-loop.js?v=0.9.2a',
  './management-ui.js?v=0.9.2a',
  './city-controls.js?v=0.9.2a',
  './city-life.js?v=0.9.2a',
  './city-life.css?v=0.9.2a',
  './app.js?v=0.9.2a',
  './manifest.webmanifest?v=0.9.2a',
  './icons/icon.svg?v=0.9.2a'
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
          caches.open(CACHE).then(c=>c.put('./index.html?v=0.9.2a',clone));
          return r;
        })
        .catch(()=>caches.match('./index.html?v=0.9.2a'))
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
