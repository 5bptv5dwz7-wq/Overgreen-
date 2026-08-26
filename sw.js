const CACHE='overgreen-v112-36';
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));});

// V112-36 — Web Push + apertura corretta della PWA dal percorso di registrazione.
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
