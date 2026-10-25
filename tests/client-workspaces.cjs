const fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
const root=require('node:path').resolve(__dirname,'..')+'/',html=fs.readFileSync(root+'index.html','utf8'),{window,document}=parseHTML(html);
const store=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const c={window,document,console,localStorage:store(),sessionStorage:store(),navigator:{userAgent:'test',onLine:true},location:{href:'https://example.test/',origin:'https://example.test/',search:'',pathname:'/'},history:{replaceState(){}},File,Blob,URL,URLSearchParams,crypto:require('node:crypto').webcrypto,performance,AbortController,AbortSignal,TextEncoder,TextDecoder,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},queueMicrotask,requestAnimationFrame:fn=>fn(),matchMedia:()=>({matches:false,addEventListener(){}}),fetch:async()=>({ok:true,json:async()=>({}),text:async()=>''}),indexedDB:require('fake-indexeddb').indexedDB,alert(){},confirm:()=>true,MutationObserver:window.MutationObserver};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return (this.querySelector('option[selected]')||this.querySelector('option'))?.value||''},set(value){for(const o of this.querySelectorAll('option'))if(o.value===String(value))o.setAttribute('selected','');else o.removeAttribute('selected')}});
window.HTMLElement.prototype.showModal=function(){this.setAttribute('open','')};window.HTMLElement.prototype.close=function(){this.removeAttribute('open')};window.HTMLElement.prototype.reset=function(){};window.HTMLElement.prototype.scrollIntoView=function(){};
window.fetch=c.fetch;window.matchMedia=c.matchMedia;window.setInterval=c.setInterval;window.setTimeout=c.setTimeout;window.clearTimeout=c.clearTimeout;window.URL=URL;
window.supabase={createClient:()=>({auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}})},functions:{invoke:async()=>({data:{users:[]}})},from:()=>({select(){return this},eq(){return this},order(){return this},then(resolve){return Promise.resolve({data:[]}).then(resolve)}})})};
vm.createContext(c);
for(const script of document.querySelectorAll('script[src]')){const src=script.getAttribute('src').split('?')[0];if(src.startsWith('http'))continue;vm.runInContext(fs.readFileSync(root+src,'utf8'),c,{filename:src});for(const key of Object.keys(window))if(key.startsWith('Overgreen')||key==='ensureLibraries')c[key]=window[key]}

c.Event=window.Event;c.assert=require('node:assert/strict');
vm.runInContext(`(async()=>{
 sb.rpc=async()=>({data:null});session={user:{id:'test-admin',email:'test@example.invalid'}};profile=realProfile={id:'test-admin',nome:'Admin',ruolo:'admin',attivo:true};profiles=[profile];
 stores=[{id:'se',nome:'EURO ONLY',client_type:'eurospin',attivo:true},{id:'si',nome:'INTESA ONLY',client_type:'intesa',attivo:true}];
 extras=[{id:'ee',titolo:'EURO EXTRA',client_type:'eurospin',store_id:'se',stato:'completato',giorno_intervento:today(),closed_at:new Date().toISOString()},{id:'ei',titolo:'INTESA TICKET',client_type:'intesa',store_id:'si',stato:'completato',giorno_intervento:today(),closed_at:new Date().toISOString()}];
 interventions=[{id:'ie',store_id:'se',stato:'convalidato',data_intervento:today()},{id:'ii',store_id:'si',stato:'convalidato',data_intervento:today()}];
 schedules=[{id:'mixed',giorno:today()}];scheduleItems=[{id:'ise',schedule_id:'mixed',store_id:'se',tipo:'ordinario',stato:'da_fare',posizione:1},{id:'isi',schedule_id:'mixed',store_id:'si',tipo:'ordinario',stato:'da_fare',posizione:2}];scheduleMembers=[{schedule_id:'mixed',profile_id:profile.id}];
 workContacts=[{id:'ce',nome:'EURO CONTACT',client_type:'eurospin'},{id:'ci',nome:'INTESA CONTACT',client_type:'intesa'}];
 savedRoutes=[{id:'route',nome:'Mixed route',member_ids:[]}];savedRouteItems=[{route_id:'route',store_id:'se'},{route_id:'route',store_id:'si'}];
 for(const client of ['eurospin','intesa']){
  const other=client==='eurospin'?'INTESA':'EURO',mine=client==='eurospin'?'EURO':'INTESA';
  enterClient(client,'stores');assert.equal(activeClient,client);assert.equal(storeClientFilter,client);assert(!$('storesList')?.textContent.includes(other+' ONLY'));
  setView('schedule');assert.equal($('schedulePickerClient').value,client);assert($('scheduleList').textContent.includes(mine+' ONLY'));assert(!$('scheduleList').textContent.includes(other+' ONLY'));
  assert.equal(schedulePdfGroups(today(),today())[0].jobs.length,1);
  assert.equal(scheduleAllItems('mixed').length,1);assert.equal(workspaceRouteItems('route').length,1);
  renderSavedRoutes();assert(!$('savedRoutesList').textContent.includes(other+' ONLY'));
  setView('extras');assert($('extrasList').textContent.includes(mine));assert(!$('extrasList').textContent.includes(other));
  $('newExtraBtn').click();assert.equal($('extraClient').value,client);assert.equal($('extraClosureProfile').value,client);assert($('extraClient').closest('label').classList.contains('workspace-fixed-client'));assert($('extraClosureProfile').closest('label').classList.contains('workspace-fixed-client'));
  assert.equal($('extraIntesaOrdinaryModeWrap').classList.contains('hidden'),client!=='intesa');assert.equal($('extraEurospinOrdinaryModeWrap').classList.contains('hidden'),client!=='eurospin');
  assert(![...$('extraStore').options].some(o=>o.textContent.includes(other+' ONLY')));$('extraDialog').close();
  setView('reports');assert.equal(dailyReportData().ordinary.length,1);assert.equal(dailyReportData().extra.length,1);
  setView('stats');assert.equal(statsExecutedRows().length,2);assert(statsExecutedRows().every(r=>r.client===client));
  setView('contacts');assert($('contactsList').textContent.includes(mine+' CONTACT'));assert(!$('contactsList').textContent.includes(other+' CONTACT'));
  assert(globalSearchMatches('ONLY').every(r=>r.t.includes(mine)));
  companyDocuments=[{id:'d1',category:'modulistica',client_type:'eurospin'},{id:'d2',category:'modulistica',client_type:'intesa'}];assert.equal(companyArchiveFiltered().length,1);
 }
 // Mixed planning deliberately exposes both clients and retains click order.
 enterClient('eurospin','schedule');toggleMixedPlanning();$('schedulePickerClient').value='all';renderSchedulePicker();assert($('scheduleStores').textContent.includes('INTESA ONLY'));setSchedulePickerValue('se',true);setSchedulePickerValue('si',true);assert.deepEqual([...selectedScheduleStoreIds()],['se','si']);assert.equal(schedulePdfGroups(today(),today())[0].jobs.length,2);assert.equal(scheduleIsMixed('mixed'),true);resetSchedulePickerSelection();
 // A dashboard remains aggregated after visiting either workspace.
 setView('dashboard');assert.equal(globalSearchMatches('ONLY').length,4);assert.equal(stores.length,2);assert.equal(extras.length,2);
 assert.equal($('dashboardView').firstElementChild.classList.contains('dashboard-grid'),true);
 assert.equal($('dashboardNext').querySelectorAll('.dashboard-day').length,7);
 assert.match($('dashboardNext').querySelector('summary').textContent,/4 lavori/);
 assert.match($('dashboardNext').querySelector('summary').textContent,/Eurospin 2 · Intesa 2/);
 ensureCloudSettingsUi();assert.equal($('syncFloatingBadge')?.parentElement?.tagName,'MAIN');
 const job=$('dashboardNext').querySelector('.ordinary');
 assert.equal(job.querySelector('.dashboard-job-tags .client-badge')?.textContent.includes('Eurospin'),true);
 assert(job.querySelector(':scope > .actions [data-done]'));assert(job.querySelector(':scope > .actions [data-map]'));
 assert(job.querySelector('.dashboard-job-more [data-share]'));assert(!job.querySelector('.dashboard-job-more').hasAttribute('open'));
 let selectedNote=null;openScheduleItemNote=item=>selectedNote=item.id;
 [...job.querySelectorAll('.dashboard-job-more button')].find(b=>b.textContent.includes('Appunto')).click();assert.equal(selectedNote,'ise');
 // Deep links select the record's workspace and invalidate a cached opposite view.
 openExtraById('ee');assert.equal(activeClient,'eurospin');assert.equal(currentView,'extras');assert(!$('extrasList').textContent.includes('INTESA'));
 openExtraById('ei');assert.equal(activeClient,'intesa');assert(!$('extrasList').textContent.includes('EURO'));
 // Ordinary inclusion controls use the selected client's existing closure rules.
 $('newExtraBtn').click();$('extraIntesaOrdinaryMode').checked=true;$('extraIntesaOrdinaryMode').dispatchEvent(new window.Event('change'));assert.equal($('extraClosureProfile').value,'intesa_ordinario');$('extraDialog').close();
 // A PDF for the other client must not overwrite the selected client.
 $('newExtraBtn').click();const file={};Object.defineProperty($('extraPdf'),'files',{configurable:true,value:[file]});readPdfText=async()=> 'EUROSPIN SPESA INTELLIGENTE Richiesta intervento n. 123 del 08/09/2026 Buongiorno, potatura siepe.';await autoFillExtraFromPdf(file);assert.equal($('extraClient').value,'intesa');assert.match($('extraPdfAutoReadStatus').textContent,/altro cliente/);
 // Employee navigation and registry permissions, including team assignments.
 $('extraDialog').close();profile=realProfile={id:'worker',nome:'Worker',ruolo:'dipendente',attivo:true};profiles.push(profile);
 extras.forEach(e=>e.stato='programmato');extraWorkers=[{extra_id:'ee',profile_id:'worker'}];scheduleMembers=[{schedule_id:'mixed',profile_id:'worker'}];extras.find(e=>e.id==='ei').schedule_item_id='isi';
 syncImpersonationUi();
 for(const el of document.querySelectorAll('[data-view="stores"],[data-view="schedule"],[data-bottom-view="schedule"],[data-more-view="stores"]'))assert(el.classList.contains('hidden'));
 for(const view of ['stores','schedule']){setView(view);assert.equal(currentView,'dashboard')}
 enterClient('eurospin','extras');assert.equal(currentView,'extras');assert(!canWorkOnExtra(extras[0]));assert.equal($('extrasList').querySelector('[data-close-extra]'),null);assert($('extrasList').textContent.includes('Sola lettura'));
 openExtraById('ee');assert.equal(currentView,'extras');assert(!canWorkOnExtra(extras[0]));
 setView('dashboard');assert(canWorkOnExtra(extras[0]));assert(canWorkOnExtra(extras[1]));assert(assignedExtraIds().has('ei'));assert($('dashboardNext').querySelector('[data-close-extra-dashboard]'));
 assert(!canWorkOnExtra({id:'unassigned',stato:'programmato'}));
 profile=realProfile={id:'admin',nome:'Admin',ruolo:'admin',attivo:true};syncImpersonationUi();setView('stores');assert.equal(currentView,'stores');assert(!document.querySelector('[data-view="stores"]').classList.contains('hidden'));
 console.log('PASS workspace navigation, forms, reports, search, mixed schedules, routes, PDF isolation and dashboard');
})()`,c).catch(error=>{console.error(error);process.exitCode=1});
