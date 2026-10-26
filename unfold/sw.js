const CACHE='unfold-2026-10-26-v1';
const FILES=['./','./index.html','./styles.css','./app.js','./data.js','./engine.js','./manifest.webmanifest','./icon.svg','./assets/seated.webp','./assets/floor.webp','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('unfold-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>event.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});
