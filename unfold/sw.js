const CACHE='unfold-2026-10-26-v5';
const SCOPE=new URL(self.registration.scope);
const MOVEMENTS=['chest','extension','rotation','squeeze','rolls','crossbody','wall','kneeextend','ankles','hamstring','pelvic','kneerolls','heelslide','quads','legraise','calf','breathing','hip','neckturn','necktilt','sidebend','wristext','wristflex','forearmturn','glute','hipflexor','quadstretch','atlas-neck-upper','atlas-shoulder-chest','atlas-back-floor','atlas-hips','atlas-thighs','atlas-lower-leg','atlas-hands-sides','atlas-hips-feet'];
const SHELL=['./','./index.html','./launch.html','./styles.css?v=5','./app.js?v=5','./data.js?v=5','./engine.js?v=5','./motion.js?v=5','./manifest.webmanifest','./icon.svg'];
const ASSETS=['./assets/seated.webp','./assets/floor.webp','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable.png',...MOVEMENTS.map(id=>'./assets/motion/'+id+'.webp')];
async function match(request){try{return await (await caches.open(CACHE)).match(request);}catch{return undefined;}}
async function put(request,response){if(!response.ok||response.status!==200)return;try{await (await caches.open(CACHE)).put(request,response.clone());}catch{/* Storage failure must never prevent online loading. */}}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 try{
  const cache=await caches.open(CACHE);
  await cache.addAll(SHELL.map(path=>new Request(new URL(path,SCOPE),{cache:'reload'})));
  // A missing illustration must not block an otherwise usable app update.
  await Promise.allSettled(ASSETS.map(path=>cache.add(new Request(new URL(path,SCOPE),{cache:'reload'}))));
 }catch{/* The online app remains usable if offline storage is unavailable. */}
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 try{
  // Keep an older working cache if this installation could not save its shell.
  if(await match(new URL('./launch.html',SCOPE))){const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('unfold-')&&key!==CACHE).map(key=>caches.delete(key)));}
 }catch{}
 await self.clients.claim();
 const clients=await self.clients.matchAll({type:'window'});clients.forEach(client=>client.postMessage({type:'UNFOLD_OFFLINE_READY'}));
})()));
async function navigation(request){
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),5000);
 try{
  // Always check for the current launch page. Versioned modules stay together.
  const response=await fetch(request,{cache:'no-store',signal:abort.signal});
  if(response.ok){await put(request,response);return response;}
  const saved=await match(request)||await match(new URL('./launch.html',SCOPE));
  return saved||response;
 }catch{
  const saved=await match(request)||await match(new URL('./launch.html',SCOPE))||await match(new URL('./index.html',SCOPE));
  return saved||new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unfold</title><body style="font:17px -apple-system,sans-serif;color:#173c30;padding:65px 25px"><h1>Let’s get Unfold open.</h1><p>Connect to the internet to load your routines.</p><button style="font:inherit;padding:14px" onclick="location.reload()">Try again</button>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
 }finally{clearTimeout(timer);}
}
async function resource(request){
 // Exact matching is essential: app.js?v=5 must never receive cached v4 code.
 const saved=await match(request);if(saved)return saved;
 try{const response=await fetch(request);await put(request,response);return response;}catch{return Response.error();}
}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;
 event.respondWith(event.request.mode==='navigate'?navigation(event.request):resource(event.request));
});
