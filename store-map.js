/* Eurospin operational map. Read-only; missing coordinates remain explicit. */
(()=>{
 'use strict';
 const G=window.OvergreenLocations;
 let map,layer,dialog,selected=null,filter='all',query='',leafletPromise,origin,opener;
 const labels={all:'Tutte',due:'Da fare',scheduled:'Programmate',reminder:'Sollecitate',missing:'Senza posizione'};
 const color=s=>isStoreProgrammed(s.id)?'#3976d4':activeStoreReminder(s)?'#be3946':isOverdueStore(s)?'#d97706':'#168263';
 const state=s=>isStoreProgrammed(s.id)?(activeStoreReminder(s)?'In programma · Sollecitata':'In programma'):activeStoreReminder(s)?'Sollecitata':isOverdueStore(s)?'Oltre intervallo / da avviare':storeHasInterval(s)?'Nei tempi':'Su richiesta';
 const rows=()=>stores.filter(s=>clientType(s)==='eurospin');
 function filtered(){return rows().filter(s=>(`${s.nome} ${s.citta||''} ${s.indirizzo||''}`).toLocaleLowerCase('it').includes(query)).filter(s=>filter==='due'?isOverdueStore(s):filter==='scheduled'?isStoreProgrammed(s.id):filter==='reminder'?!!activeStoreReminder(s):filter==='missing'?!G.confirmedPoint(s):true)}
 function leaflet(){
  if(window.L)return Promise.resolve(window.L);
  if(!leafletPromise)leafletPromise=new Promise((resolve,reject)=>{
   const css=document.createElement('link');css.rel='stylesheet';css.href='vendor/leaflet/leaflet.css';document.head.append(css);
   const js=document.createElement('script');js.src='vendor/leaflet/leaflet.js';
   const timer=setTimeout(()=>reject(new Error('Caricamento mappa scaduto. Chiudi e riprova.')),12000);
   js.onload=()=>{clearTimeout(timer);resolve(window.L)};js.onerror=()=>{clearTimeout(timer);reject(new Error('Mappa non disponibile. Controlla la connessione e riprova.'))};document.head.append(js);
  }).catch(e=>{leafletPromise=null;throw e});return leafletPromise;
 }
 function leave(action){dialog.close();if(action)action()}
 function choose(s,fly=true){selected=s.id;renderDetail(s);if(map&&fly){const p=G.confirmedPoint(s);if(p)map.setView([p.lat,p.lon],Math.max(13,map.getZoom()))}drawPins();renderList()}
 function renderDetail(s){
  const box=dialog.querySelector('.ogm-detail');box.hidden=!s;if(!s)return;
  box.innerHTML=`<div class="ogm-detail-head"><span class="ogm-tag" style="--pin:${color(s)}">${esc(state(s))}</span><button type="button" aria-label="Chiudi dettaglio" class="ogm-dismiss">×</button></div><h3>${esc(s.nome)}</h3><p>${esc([s.indirizzo,s.citta].filter(Boolean).join(' · ')||'Indirizzo non inserito')}</p><div class="ogm-facts"><span>Ultimo passaggio<strong>${esc(fmt(s.ultimo_passaggio))}</strong></span><span>Frequenza<strong>${storeHasInterval(s)?Number(s.intervallo_giorni)+' giorni':'Su richiesta'}</strong></span></div>${!G.confirmedPoint(s)?'<p class="ogm-warning">Posizione da completare: apri la sede e conferma il punto sulla mappa.</p>':''}<div class="ogm-actions"><button type="button" data-go>Naviga ↗</button><button type="button" data-history>Storico</button><button type="button" data-site>Apri sede</button></div>`;
  box.querySelector('.ogm-dismiss').onclick=()=>{selected=null;renderDetail(null);drawPins();renderList()};
  box.querySelector('[data-go]').onclick=()=>openStoreMaps(s);
  box.querySelector('[data-history]').onclick=()=>leave(()=>showHistory(s));
  box.querySelector('[data-site]').onclick=()=>leave(()=>openStore(s));
 }
 function renderList(){
  const list=dialog.querySelector('.ogm-list');list.replaceChildren();
  const results=filtered().sort((a,b)=>a.nome.localeCompare(b.nome,'it'));
  if(!results.length){list.textContent='Nessuna sede per questi filtri.';return}
  for(const s of results){const b=document.createElement('button');b.type='button';b.className='ogm-row';b.classList.toggle('selected',selected===s.id);b.innerHTML=`<i style="--pin:${color(s)}"></i><span><strong>${esc(s.nome)}</strong><small>${esc(s.citta||s.indirizzo||'')} · ${G.confirmedPoint(s)?esc(state(s)):'Senza posizione'}</small></span><span aria-hidden="true">›</span>`;b.onclick=()=>choose(s);list.append(b)}
 }
 function drawPins(){
  if(!map)return;layer.clearLayers();const L=window.L;
  const points=filtered().map(s=>({s,p:G.confirmedPoint(s)})).filter(x=>x.p);
  for(const {s,p} of points){
   const marker=L.marker([p.lat,p.lon],{title:s.nome,icon:L.divIcon({className:'ogm-marker',html:`<span class="ogm-pin ${selected===s.id?'selected':''}" style="--pin:${color(s)}"></span>`,iconSize:[40,40],iconAnchor:[20,20]})}).addTo(layer);
   marker.on('click',()=>choose(s,false));
   if(map.getZoom()>=12){
    const label=document.createElement('span');label.textContent=s.nome;
    marker.bindTooltip(label,{permanent:true,direction:'top',offset:[0,-12],className:'ogm-store-label',opacity:1,interactive:false});
   }
  }
 }
 function fit(){if(!map)return;const p=filtered().map(G.confirmedPoint).filter(Boolean);if(p.length)map.fitBounds(p.map(x=>[x.lat,x.lon]),{padding:[45,45],maxZoom:13});else map.setView([45,9.5],6)}
 function refresh(fitMap=false){
  const list=filtered(),mapped=list.filter(G.confirmedPoint).length;
  dialog.querySelector('.ogm-count').textContent=`${mapped} sulla mappa · ${list.length} sedi`;
  const missing=rows().filter(s=>!G.confirmedPoint(s)).length;
  dialog.querySelector('[data-map-filter="missing"]').textContent='Senza posizione · '+missing;
  const note=dialog.querySelector('.ogm-missing');note.hidden=!missing;note.textContent=`${missing} sedi senza posizione · Mostra`;
  dialog.querySelectorAll('[data-map-filter]').forEach(b=>{const active=b.dataset.mapFilter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
  if(!list.some(s=>s.id===selected)){selected=null;renderDetail(null)}
  renderList();drawPins();if(fitMap)fit();
 }
 function create(){
  dialog=document.createElement('dialog');dialog.id='eurospinMapDialog';dialog.className='ogm';dialog.setAttribute('aria-labelledby','ogm-title');
  dialog.innerHTML=`<div class="ogm-shell"><header class="ogm-header"><div><small>OVERGREEN / TERRITORIO</small><h2 id="ogm-title">Punti vendita <span>Eurospin</span></h2></div><button type="button" class="ogm-close" aria-label="Chiudi mappa">×</button></header><div class="ogm-search"><input type="search" aria-label="Cerca punto vendita" placeholder="Cerca città, punto vendita o indirizzo…"><button type="button" class="ogm-list-toggle" aria-expanded="false">Elenco</button></div><div class="ogm-filters">${Object.entries(labels).map(([key,label])=>`<button type="button" data-map-filter="${key}">${label}</button>`).join('')}</div><div class="ogm-body"><aside class="ogm-sidebar"><div class="ogm-count" aria-live="polite"></div><button type="button" class="ogm-missing"></button><div class="ogm-list"></div></aside><div class="ogm-stage"><div id="ogm-canvas" aria-label="Mappa dei punti vendita Eurospin"></div><div class="ogm-tools"><button type="button" data-fit aria-label="Inquadra tutte le sedi">⊞ Tutte</button><button type="button" data-gps aria-label="Mostra la mia posizione">◎ Dove sono</button></div><div class="ogm-message" role="status">Caricamento mappa…</div><div class="ogm-legend"><span style="--pin:#be3946">Solleciti</span><span style="--pin:#d97706">Da fare</span><span style="--pin:#3976d4">Programmate</span><span style="--pin:#168263">Altre sedi</span></div></div><section class="ogm-detail" aria-live="polite" hidden></section></div></div>`;
  document.body.append(dialog);
  dialog.querySelector('.ogm-close').onclick=()=>leave();
  dialog.addEventListener('close',()=>{if(map){map.remove();map=null;layer=null}origin=null;document.body.classList.remove('ogm-open');opener?.focus()});
  dialog.querySelector('input').oninput=e=>{query=e.target.value.trim().toLocaleLowerCase('it');refresh(true)};
  dialog.querySelectorAll('[data-map-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.mapFilter;refresh(true)});
  dialog.querySelector('.ogm-missing').onclick=()=>{filter='missing';dialog.classList.add('ogm-show-list');dialog.querySelector('.ogm-list-toggle').setAttribute('aria-expanded','true');refresh()};
  dialog.querySelector('.ogm-list-toggle').onclick=e=>{const open=dialog.classList.toggle('ogm-show-list');e.currentTarget.setAttribute('aria-expanded',String(open));map?.invalidateSize()};
  dialog.querySelector('[data-fit]').onclick=fit;
  dialog.querySelector('[data-gps]').onclick=()=>{
   const msg=dialog.querySelector('.ogm-message');msg.hidden=false;msg.textContent='Ricerca della tua posizione…';
   if(!navigator.geolocation){msg.textContent='Geolocalizzazione non disponibile.';return}
   navigator.geolocation.getCurrentPosition(pos=>{if(!dialog.open||!map)return;msg.hidden=true;if(origin)origin.remove();origin=window.L.circleMarker([pos.coords.latitude,pos.coords.longitude],{radius:8,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1}).addTo(map);map.setView([pos.coords.latitude,pos.coords.longitude],12)},()=>{if(dialog.open){msg.hidden=false;msg.textContent='Posizione non disponibile: verifica il permesso GPS.'}},{timeout:10000,maximumAge:60000});
  };
 }
 async function open(){
  if(!admin())return;if(!dialog)create();if(dialog.open)return;
  opener=document.activeElement;selected=null;filter='all';query='';dialog.querySelector('input').value='';dialog.classList.remove('ogm-show-list');dialog.querySelector('.ogm-list-toggle').setAttribute('aria-expanded','false');renderDetail(null);
  dialog.showModal();document.body.classList.add('ogm-open');refresh();
  const msg=dialog.querySelector('.ogm-message');msg.hidden=false;msg.textContent='Caricamento mappa…';
  try{const L=await leaflet();if(!dialog.open||map)return;map=L.map('ogm-canvas',{zoomControl:false}).setView([45,9.5],6);L.control.zoom({position:'bottomright'}).addTo(map);
   const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}).addTo(map);
   tiles.on('tileerror',()=>{msg.hidden=false;msg.textContent='Sfondo non disponibile: verifica la connessione. L’elenco resta utilizzabile.'});
   layer=L.layerGroup().addTo(map);map.on('zoomend',drawPins);msg.hidden=true;map.invalidateSize();refresh(true);
  }catch(e){msg.hidden=false;msg.textContent=e.message}
 }
 window.OvergreenStoreMap={open};
 const button=document.createElement('button');button.type='button';button.className='ogm-launch admin-only';button.innerHTML='<span>◎</span><span><strong>Mappa Eurospin</strong><small>Tutte le sedi, un solo colpo d’occhio</small></span><span>↗</span>';button.onclick=open;
 document.getElementById('storesView').prepend(button);
})();
