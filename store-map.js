/* Operational map and shared schedule draft; writes use the existing planner form. */
(()=>{
 'use strict';
 const G=window.OvergreenLocations;
 let map,layer,dialog,selected=null,filter='all',query='',leafletPromise,origin,opener,planning=false,routeView=false,baseLayer=null,baseMode='satellite';
 const labels={all:'Tutte',due:'Da fare',scheduled:'Programmate',reminder:'Sollecitate',missing:'Senza posizione'};
 const color=s=>isStoreProgrammed(s.id)?'#3976d4':activeStoreReminder(s)?'#be3946':isOverdueStore(s)?'#d97706':'#168263';
 const state=s=>isStoreProgrammed(s.id)?(activeStoreReminder(s)?'In programma · Sollecitata':'In programma'):activeStoreReminder(s)?'Sollecitata':isOverdueStore(s)?'Oltre intervallo / da avviare':storeHasInterval(s)?'Nei tempi':'Su richiesta';
 const rows=()=>stores.filter(s=>planning?planningMatches(s):clientType(s)==='eurospin');
 const routeStores=()=>selectedScheduleStoreIds().filter(id=>!id.startsWith('extra:')).map(id=>stores.find(s=>s.id===id)).filter(Boolean);
 const isPicked=s=>planning&&schedulePickerSelected.has(s.id);
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
 function applyBasemap(mode){
  baseMode=mode==='map'?'map':'satellite';
  dialog.querySelectorAll('[data-basemap]').forEach(b=>{const active=b.dataset.basemap===baseMode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
  try{localStorage.setItem('overgreen-map-base',baseMode)}catch{}
  if(!map)return;if(baseLayer)baseLayer.remove();
  const satellite=baseMode==='satellite';
  baseLayer=window.L.tileLayer(satellite?'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}':'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
   maxZoom:19,zIndex:1,attribution:satellite?'Imagery © Esri, Vantor, Earthstar Geographics, GIS User Community':'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(map);
  const msg=dialog.querySelector('.ogm-message');msg.hidden=true;
  baseLayer.on('tileerror',()=>{if(!dialog.open)return;msg.hidden=false;msg.textContent='Una parte della mappa non è disponibile. Controlla la connessione o cambia tra Mappa e Satellite.'});
 }
 function leave(action){dialog.close();if(action)action()}
 function choose(s,fly=true){if(planning){toggleStop(s);return}selected=s.id;renderDetail(s);if(map&&fly){const p=G.confirmedPoint(s);if(p)map.setView([p.lat,p.lon],Math.max(13,map.getZoom()))}drawPins();renderList()}
 function toggleStop(s){
  if(!admin()||document.getElementById('scheduleForm')?.dataset.saving==='true')return;
  setSchedulePickerValue(s.id,!schedulePickerSelected.has(s.id));renderSchedulePicker();
 }
 function moveStop(id,delta){
  if(!admin()||document.getElementById('scheduleForm')?.dataset.saving==='true')return;
  const route=routeStores(),index=route.findIndex(s=>s.id===id),other=route[index+delta];if(index<0||!other)return;
  const values=selectedScheduleStoreIds(),a=values.indexOf(id),b=values.indexOf(other.id);
  [values[a],values[b]]=[values[b],values[a]];
  schedulePickerSelected.clear();values.forEach(value=>schedulePickerSelected.add(value));renderSchedulePicker();
 }
 function showRoute(){
  routeView=true;dialog.classList.add('ogm-show-list');dialog.querySelector('.ogm-list-toggle').setAttribute('aria-expanded','true');renderList();map?.invalidateSize();
 }
 function renderRouteList(list){
  const route=routeStores();
  if(!route.length){list.textContent='Tocca i puntini sulla mappa per aggiungere le prime tappe.';return}
  route.forEach((s,index)=>{
   const row=document.createElement('div');row.className='ogm-route-row';
   row.innerHTML=`<span class="ogm-route-number">${index+1}</span><button type="button" class="ogm-route-focus"><strong>${esc(s.nome)}</strong><small>${G.confirmedPoint(s)?esc(s.citta||s.indirizzo||''):'Senza posizione · linea interrotta'}</small></button><div class="ogm-route-controls"><button type="button" data-up aria-label="Anticipa ${esc(s.nome)}" ${index===0?'disabled':''}>↑</button><button type="button" data-down aria-label="Posticipa ${esc(s.nome)}" ${index===route.length-1?'disabled':''}>↓</button><button type="button" data-remove aria-label="Rimuovi ${esc(s.nome)}">×</button></div>`;
   row.querySelector('.ogm-route-focus').onclick=()=>{const p=G.confirmedPoint(s);if(p&&map){dialog.classList.remove('ogm-show-list');dialog.querySelector('.ogm-list-toggle').setAttribute('aria-expanded','false');map.invalidateSize();map.setView([p.lat,p.lon],Math.max(12,map.getZoom()))}};
   row.querySelector('[data-up]').onclick=()=>moveStop(s.id,-1);row.querySelector('[data-down]').onclick=()=>moveStop(s.id,1);row.querySelector('[data-remove]').onclick=()=>toggleStop(s);list.append(row);
  });
 }
 function renderPlanSummary(){
  if(!planning)return;
  const route=routeStores(),extraCount=selectedScheduleStoreIds().filter(id=>id.startsWith('extra:')).length,missing=route.filter(s=>!G.confirmedPoint(s)).length;
  const ep=window.OvergreenRouteEndpoints?.get()||{};
  dialog.querySelector('.ogm-plan-count').textContent=`${route.length} tappe selezionate${ep.start?' · P':''}${ep.end?' · R':''}`;
  dialog.querySelector('.ogm-plan-note').textContent='Linea indicativa, non percorso stradale'+(missing?` · ${missing} senza posizione`:'')+(extraCount?` · ${extraCount} extra conservati nel modulo, dopo le sedi`:'');
  dialog.querySelector('[data-route-list]').textContent=`Giro (${route.length})`;
  const chips=dialog.querySelector('.ogm-plan-chips');chips.replaceChildren();
  function endpointChip(p,title){if(!p)return;const b=document.createElement('button');b.type='button';b.textContent=title+' · '+p.label;b.onclick=()=>{if(map)map.setView([p.lat,p.lon],12)};chips.append(b)}
  endpointChip(ep.start,'Partenza');
  route.forEach((s,i)=>{const chip=document.createElement('button');chip.type='button';chip.textContent=`${i+1} · ${s.nome}`;chip.onclick=showRoute;chips.append(chip)});
  endpointChip(ep.end,'Ritorno');
 }
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
  if(planning&&routeView){renderRouteList(list);return}
  const results=filtered().sort((a,b)=>a.nome.localeCompare(b.nome,'it'));
  if(!results.length){list.textContent='Nessuna sede per questi filtri.';return}
  for(const s of results){const b=document.createElement('button');b.type='button';b.className='ogm-row';b.classList.toggle('selected',planning?isPicked(s):selected===s.id);b.innerHTML=`<i style="--pin:${color(s)}"></i><span><strong>${esc(s.nome)}</strong><small>${esc(s.citta||s.indirizzo||'')} · ${G.confirmedPoint(s)?esc(state(s)):'Senza posizione'}</small></span><span aria-hidden="true">${planning?(isPicked(s)?'✓':'+'):'›'}</span>`;if(planning)b.setAttribute('aria-pressed',String(isPicked(s)));b.onclick=()=>choose(s);list.append(b)}
 }
 function drawPins(){
  if(!map)return;layer.clearLayers();const L=window.L;
  const route=planning?routeStores():[],order=new Map(route.map((s,i)=>[s.id,i+1]));
  const endpoints=planning?(window.OvergreenRouteEndpoints?.get()||{}):{};
  const path=[...(endpoints.start?[endpoints.start]:[]),...route.map(G.confirmedPoint),...(endpoints.end?[endpoints.end]:[])];
  // Preserve gaps where work stops have no coordinates.
  if(planning)for(let i=1;i<path.length;i++){
   const a=path[i-1],b=path[i];
   if(a&&b){const segment=[[a.lat,a.lon],[b.lat,b.lon]];L.polyline(segment,{color:'#fff',weight:7,opacity:.9,interactive:false}).addTo(layer);L.polyline(segment,{color:'#2563eb',weight:4,opacity:.9,interactive:false}).addTo(layer)}
  }
  const same=endpoints.start&&endpoints.end&&endpoints.start.lat===endpoints.end.lat&&endpoints.start.lon===endpoints.end.lon;
  for(const [key,title] of [['start',same?'P/R':'P'],['end','R']]){
   const p=endpoints[key];if(!p||(same&&key==='end'))continue;
   const marker=L.marker([p.lat,p.lon],{title:p.label,zIndexOffset:1100,icon:L.divIcon({className:'ogm-marker',html:`<span class="ogm-endpoint-pin">${title}</span>`,iconSize:[40,40],iconAnchor:[20,20]})}).addTo(layer);
   const label=document.createElement('span');label.textContent=(same?'Partenza e ritorno':key==='start'?'Partenza':'Ritorno')+' · '+p.label;
   marker.bindTooltip(label,{permanent:map.getZoom()>=9,direction:'top',offset:[0,-14],className:'ogm-store-label',opacity:1});
  }
  const visible=planning?[...new Map([...filtered(),...route].map(s=>[s.id,s])).values()]:filtered();
  const points=visible.map(s=>({s,p:G.confirmedPoint(s)})).filter(x=>x.p);
  for(const {s,p} of points){
   const n=order.get(s.id);
   const marker=L.marker([p.lat,p.lon],{title:n?`${n} · ${s.nome}`:s.nome,zIndexOffset:n?1000:0,icon:L.divIcon({className:'ogm-marker',html:n?`<span class="ogm-route-pin">${n}</span>`:`<span class="ogm-pin ${selected===s.id?'selected':''}" style="--pin:${color(s)}"></span>`,iconSize:[40,40],iconAnchor:[20,20]})}).addTo(layer);
   marker.on('click',()=>choose(s,false));
   if(map.getZoom()>=9){
    const label=document.createElement('span');label.textContent=n?`${n} · ${s.nome}`:s.nome;
    marker.bindTooltip(label,{permanent:true,direction:'top',offset:[0,-12],className:'ogm-store-label',opacity:1,interactive:false});
   }
  }
 }
 function fit(){if(!map)return;const ep=planning?(window.OvergreenRouteEndpoints?.get()||{}):{};const p=[...filtered().map(G.confirmedPoint),...(planning?routeStores().map(G.confirmedPoint):[]),ep.start,ep.end].filter(Boolean);if(p.length)map.fitBounds(p.map(x=>[x.lat,x.lon]),{padding:[45,45],maxZoom:13});else map.setView([45,9.5],6)}
 function refresh(fitMap=false){
  const list=filtered(),mapped=list.filter(G.confirmedPoint).length;
  dialog.querySelector('.ogm-count').textContent=`${mapped} sulla mappa · ${list.length} sedi`;
  const missing=rows().filter(s=>!G.confirmedPoint(s)).length;
  dialog.querySelector('[data-map-filter="missing"]').textContent='Senza posizione · '+missing;
  const note=dialog.querySelector('.ogm-missing');note.hidden=!missing;note.textContent=`${missing} sedi senza posizione · Mostra`;
  dialog.querySelectorAll('[data-map-filter]').forEach(b=>{const active=b.dataset.mapFilter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
  if(!list.some(s=>s.id===selected)){selected=null;renderDetail(null)}
  renderList();drawPins();renderPlanSummary();if(fitMap)fit();
 }
 function create(){
  dialog=document.createElement('dialog');dialog.id='eurospinMapDialog';dialog.className='ogm';dialog.setAttribute('aria-labelledby','ogm-title');
  dialog.innerHTML=`<div class="ogm-shell"><header class="ogm-header"><div><small>OVERGREEN / TERRITORIO</small><h2 id="ogm-title">Punti vendita <span>Eurospin</span></h2></div><button type="button" class="ogm-close" aria-label="Chiudi mappa">×</button></header><div class="ogm-search"><input type="search" aria-label="Cerca punto vendita" placeholder="Cerca città, punto vendita o indirizzo…"><button type="button" class="ogm-list-toggle" aria-expanded="false">Elenco</button></div><div class="ogm-filters">${Object.entries(labels).map(([key,label])=>`<button type="button" data-map-filter="${key}">${label}</button>`).join('')}</div><div class="ogm-body"><aside class="ogm-sidebar"><div class="ogm-count" aria-live="polite"></div><button type="button" class="ogm-missing"></button><div class="ogm-list"></div></aside><div class="ogm-stage"><div id="ogm-canvas" aria-label="Mappa dei punti vendita Eurospin"></div><div class="ogm-tools"><button type="button" data-fit aria-label="Inquadra tutte le sedi">⊞ Tutte</button><button type="button" data-gps aria-label="Mostra la mia posizione">◎ Dove sono</button></div><div class="ogm-message" role="status">Caricamento mappa…</div><div class="ogm-legend"><span style="--pin:#be3946">Solleciti</span><span style="--pin:#d97706">Da fare</span><span style="--pin:#3976d4">Programmate</span><span style="--pin:#168263">Altre sedi</span></div></div><section class="ogm-detail" aria-live="polite" hidden></section></div></div>`;
  const routeButton=document.createElement('button');routeButton.type='button';routeButton.dataset.routeList='';routeButton.className='ogm-list-toggle ogm-route-toggle';routeButton.textContent='Giro';routeButton.onclick=showRoute;dialog.querySelector('.ogm-search').append(routeButton);
  const footer=document.createElement('section');footer.className='ogm-plan-footer';footer.hidden=true;
  footer.innerHTML='<div class="ogm-plan-top"><div><strong class="ogm-plan-count" aria-live="polite"></strong><small>Tocca un puntino per aggiungerlo o toglierlo dal giro.</small></div><button type="button" data-plan-done>Continua →</button></div><div class="ogm-plan-chips"></div><small class="ogm-plan-note"></small>';
  dialog.querySelector('.ogm-shell').append(footer);
  footer.querySelector('[data-plan-done]').onclick=()=>leave(()=>{document.getElementById('scheduleForm').scrollIntoView({behavior:'smooth',block:'start'});});
  const bases=document.createElement('div');bases.className='ogm-basemap';bases.innerHTML='<button type="button" data-basemap="map">Mappa</button><button type="button" data-basemap="satellite">Satellite</button>';dialog.querySelector('.ogm-stage').append(bases);bases.querySelectorAll('button').forEach(b=>b.onclick=()=>applyBasemap(b.dataset.basemap));
  const epPanel=document.createElement('details');epPanel.className='route-endpoints-panel';epPanel.innerHTML='<summary>Partenza e ritorno</summary>';const epContent=document.createElement('div');epPanel.append(epContent);footer.prepend(epPanel);window.OvergreenRouteEndpoints?.createEditor(epContent,'draft');
  document.body.append(dialog);
  dialog.querySelector('.ogm-close').onclick=()=>leave();
  dialog.addEventListener('close',()=>{if(map){map.remove();map=null;layer=null;baseLayer=null}origin=null;document.body.classList.remove('ogm-open');opener?.focus()});
  dialog.querySelector('input').oninput=e=>{query=e.target.value.trim().toLocaleLowerCase('it');refresh(true)};
  dialog.querySelectorAll('[data-map-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.mapFilter;refresh(true)});
  dialog.querySelector('.ogm-missing').onclick=()=>{filter='missing';routeView=false;dialog.classList.add('ogm-show-list');dialog.querySelector('.ogm-list-toggle').setAttribute('aria-expanded','true');refresh()};
  dialog.querySelector('.ogm-list-toggle').onclick=e=>{routeView=false;renderList();const open=dialog.classList.toggle('ogm-show-list');e.currentTarget.setAttribute('aria-expanded',String(open));map?.invalidateSize()};
  dialog.querySelector('[data-fit]').onclick=fit;
  dialog.querySelector('[data-gps]').onclick=()=>{
   const msg=dialog.querySelector('.ogm-message');msg.hidden=false;msg.textContent='Ricerca della tua posizione…';
   if(!navigator.geolocation){msg.textContent='Geolocalizzazione non disponibile.';return}
   navigator.geolocation.getCurrentPosition(pos=>{if(!dialog.open||!map)return;msg.hidden=true;if(origin)origin.remove();origin=window.L.circleMarker([pos.coords.latitude,pos.coords.longitude],{radius:8,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1}).addTo(map);map.setView([pos.coords.latitude,pos.coords.longitude],12)},()=>{if(dialog.open){msg.hidden=false;msg.textContent='Posizione non disponibile: verifica il permesso GPS.'}},{timeout:10000,maximumAge:60000});
  };
 }
 async function open(options={}){
  if(!admin()||document.getElementById('scheduleForm')?.dataset.saving==='true')return;if(!dialog)create();if(dialog.open)return;
  planning=options.planning===true;routeView=false;dialog.classList.toggle('ogm-planning',planning);
  dialog.querySelector('.ogm-plan-footer').hidden=!planning;dialog.querySelector('[data-route-list]').hidden=!planning;
  dialog.querySelector('#ogm-title').textContent=planning?'Componi il giro · '+fmt(document.getElementById('scheduleDate').value):'Punti vendita Eurospin';
  dialog.querySelector('.ogm-legend').hidden=planning;
  opener=document.activeElement;selected=null;filter='all';query='';dialog.querySelector('input').value='';dialog.classList.remove('ogm-show-list');dialog.querySelector('.ogm-list-toggle').setAttribute('aria-expanded','false');renderDetail(null);
  dialog.showModal();document.body.classList.add('ogm-open');refresh();
  const msg=dialog.querySelector('.ogm-message');msg.hidden=false;msg.textContent='Caricamento mappa…';
  try{const L=await leaflet();if(!dialog.open||map)return;map=L.map('ogm-canvas',{zoomControl:false}).setView([45,9.5],6);L.control.zoom({position:'bottomright'}).addTo(map);
   try{baseMode=localStorage.getItem('overgreen-map-base')||'satellite'}catch{}applyBasemap(baseMode);
   layer=L.layerGroup().addTo(map);map.on('zoomend',drawPins);msg.hidden=true;map.invalidateSize();refresh(true);
  }catch(e){msg.hidden=false;msg.textContent=e.message}
 }
 window.OvergreenStoreMap={open,sync(){if(dialog?.open&&planning)refresh()}};
 const button=document.createElement('button');button.type='button';button.className='ogm-launch admin-only';button.innerHTML='<span>◎</span><span><strong>Mappa Eurospin</strong><small>Tutte le sedi, un solo colpo d’occhio</small></span><span>↗</span>';button.onclick=open;
 document.getElementById('storesView').prepend(button);
 const planButton=document.createElement('button');planButton.id='scheduleMapBtn';planButton.type='button';planButton.className='ogm-plan-launch';planButton.innerHTML='◎ Seleziona sulla mappa <span>Componi il giro toccando le sedi</span>';planButton.onclick=()=>open({planning:true});
 document.getElementById('scheduleForm').querySelector('.planner-search-wrap').before(planButton);
})();
