const CACHE='pueblos-gremios-v0.9.0c';
const ASSETS=[
  './index.html?v=0.9.0c',
  './styles.css?v=0.9.0c',
  './activity.css?v=0.9.0c',
  './game-data.js?v=0.9.0c',
  './adventurer-core.js?v=0.9.0c',
  './city-progression.js?v=0.9.0c',
  './activity-combat.js?v=0.9.0c',
  './app.js?v=0.9.0c',
  './manifest.webmanifest?v=0.9.0c',
  './icons/icon.svg?v=0.9.0c'
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
          caches.open(CACHE).then(c=>c.put('./index.html?v=0.9.0c',clone));
          return r;
        })
        .catch(()=>caches.match('./index.html?v=0.9.0c'))
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
