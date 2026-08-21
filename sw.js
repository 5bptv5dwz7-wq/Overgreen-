const CACHE='overgreen-v112-33';
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));});

// V112-33 — ricezione notifiche Web Push anche con app chiusa.
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
    data:{url:data.url||'./'}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'./',self.location.origin).href;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async list=>{
    for(const client of list){if('focus' in client){await client.focus();if('navigate' in client)await client.navigate(target);return}}
    if(clients.openWindow)return clients.openWindow(target);
  }));
});
