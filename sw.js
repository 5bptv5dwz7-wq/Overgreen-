const CACHE='overgreen-v311';
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('overgreen-v')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  // Non memorizzare API Supabase, URL firmati o risorse di domini esterni.
  if(url.origin!==self.location.origin)return;
  const immutable=url.searchParams.has('v')&&/\.(?:js|css|png|svg|woff2)$/.test(url.pathname);
  const writes=[];
  const network=async(cached)=>{
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),cached?6000:25000);
    try{
      const response=await fetch(e.request,{cache:immutable?'default':'no-cache',signal:controller.signal});
      if(response.ok){const copy=response.clone();writes.push(caches.open(CACHE).then(cache=>cache.put(e.request,copy)).catch(()=>{}))}
      if(cached&&response.status>=500)return cached;
      return response;
    }finally{clearTimeout(timer)}
  };
  const response=(async()=>{
    const cache=await caches.open(CACHE),cached=await cache.match(e.request);
    if(immutable&&cached)return cached;
    try{return await network(cached)}catch(err){if(cached)return cached;throw err}
  })();
  e.respondWith(response);e.waitUntil(response.then(()=>Promise.all(writes)).catch(()=>{}));
});

// V186 — Target N° dei report cliente extra in alto a destra come Genera chiusura.
// V183 — PDF completo Intesa: unione di report singoli completi, uno per ogni intervento; filtro cliente applicato anche ai report attività.
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text?.()||'Nuova attività completata'}}
  const title=data.title||'Overgreen';
  const options={
    body:data.body||'Un dipendente ha completato un lavoro.',
    icon:data.icon||'icon-192.png',
    badge:data.badge||'icon-192.png',
    tag:data.tag||undefined,
    renotify:true,
    data:{url:data.url||''}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();

  // La PWA può essere pubblicata in una sottocartella GitHub Pages.
  // registration.scope punta alla vera root dell'app, mentre location.origin
  // punterebbe alla root del dominio e causerebbe un 404.
  const scope=self.registration.scope;
  const relative=event.notification.data?.url||'';
  let target=scope;
  try{target=new URL(relative,scope).href}catch{}

  event.waitUntil((async()=>{
    const list=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of list){
      if(client.url.startsWith(scope)){
        try{if('navigate' in client)await client.navigate(target)}catch{}
        if('focus' in client)return client.focus();
        return;
      }
    }
    if(clients.openWindow)return clients.openWindow(target);
  })());
});









