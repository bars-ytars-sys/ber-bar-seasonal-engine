// Scope is restricted to this guide. Never intercept the main resort website.
const scope = new URL(self.registration.scope);
const prefix = 'berbar-guest:'+scope.pathname+':';
const cacheName = prefix+'20261029-light';
const shell = ["./", "assets/tree.svg", "style.css?v=20261029-light", "phone.css?v=20261013-phone", "experience.css?v=20261026-menu", "interactive-map.css?v=20261023-map", "guest-updates.css?v=20261027-contact", "connection.js?v=20261029-light", "app.js?v=20261029-light", "./data.js?v=20261027-contact", "./guest-rules.js?v=20261026-menu", "./house-photo.js", "./interactive-map.js?v=20261029-light", "./map-data.js?v=20261029-light", "./experience.js?v=20261026-menu", "assets/fonts/noto-serif-display.woff", "assets/fonts/rubik-cyrillic.woff2", "assets/fonts/rubik-latin.woff2"];
const key = input => {const u=new URL(typeof input==='string'?input:input.url,scope);u.search='';u.hash='';if(u.pathname===scope.pathname+'index.html')u.pathname=scope.pathname;return u.href;};
const allowed = url => url.origin===scope.origin && url.pathname.startsWith(scope.pathname);
const image = url => /\.(?:webp|png|jpe?g|svg|woff2?)$/i.test(url.pathname);
async function store(request,response) {
  if (!response.ok || response.type==='opaque') return;
  try {
  const cache=await caches.open(cacheName);
  await cache.put(key(request),response.clone());
  const keys=await cache.keys();
  const extras=keys.filter(r=>!shell.some(file=>key(file)===r.url));
  for(const old of extras.slice(0,Math.max(0,extras.length-70)))await cache.delete(old);
  } catch { /* Quota/storage errors must not break a successful network response. */ }
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(cacheName);
  // Only the small application shell; never all houses, map images or PDFs.
  await Promise.all(shell.map(async file=>{
    const url=new URL(file,scope),response=await fetch(url,{cache:'force-cache'});
    if(!response.ok)throw new Error('Guide shell unavailable');
    await cache.put(key(url.href),response);
  }));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const name of await caches.keys())if(name.startsWith(prefix)&&name!==cacheName)await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||!allowed(url)||request.headers.has('range')||/\.pdf$/i.test(url.pathname))return;
  event.respondWith((async()=>{
    const cached=await (await caches.open(cacheName)).match(key(request));
    if(cached&&image(url)){
      if(Date.now()-Date.parse(cached.headers.get('date')||'')>86400000)event.waitUntil(fetch(request).then(r=>store(request,r)).catch(()=>{}));
      return cached;
    }
    // Fresh text/prices when online; use the saved guide promptly on a stalled connection.
    const network=fetch(request).then(async response=>{await store(request,response);return response;});
    event.waitUntil(network.then(()=>{},()=>{}));
    if(cached){
      let timer;
      const fallback=new Promise(resolve=>{timer=setTimeout(()=>resolve(cached),2200);});
      try{return await Promise.race([network.catch(()=>cached),fallback]);}finally{clearTimeout(timer);}
    }
    try{return await network;}catch{return new Response('Нет связи. Откройте путеводитель при подключении к интернету.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='SAVE_VIEWED_IMAGES'||!Array.isArray(event.data.urls))return;
  event.waitUntil(Promise.all(event.data.urls.slice(0,15).map(async input=>{
    try{const url=new URL(input);if(allowed(url)&&image(url))await store(url.href,await fetch(url,{cache:'force-cache'}));}catch{}
  })));
});
