const CACHE='pueblos-gremios-v0.9.1b';
const ASSETS=[
  './index.html?v=0.9.1b',
  './styles.css?v=0.9.1b',
  './activity.css?v=0.9.1b',
  './world-loop.css?v=0.9.1b',
  './game-data.js?v=0.9.1b',
  './adventurer-core.js?v=0.9.1b',
  './city-progression.js?v=0.9.1b',
  './activity-combat.js?v=0.9.1b',
  './world-design-data.js?v=0.9.1b',
  './world-loop.js?v=0.9.1b',
  './management-ui.js?v=0.9.1b',
  './city-controls.js?v=0.9.1b',
  './city-life.js?v=0.9.1b',
  './city-life.css?v=0.9.1b',
  './app.js?v=0.9.1b',
  './manifest.webmanifest?v=0.9.1b',
  './icons/icon.svg?v=0.9.1b'
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
          caches.open(CACHE).then(c=>c.put('./index.html?v=0.9.1b',clone));
          return r;
        })
        .catch(()=>caches.match('./index.html?v=0.9.1b'))
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
