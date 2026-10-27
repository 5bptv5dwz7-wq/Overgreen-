/* The selected service changes planning and colors; the main dashboard keeps the whole route. */
const cleaningPlanDrafts=new Map();
function switchService(value){
 if(!['verde','pulizie'].includes(value)||value===activeService)return;
 if(schedulePickerSelected.size&&!confirm('Cambiare servizio e azzerare le sedi selezionate non ancora salvate?'))return;
 activeService=value;localStorage.setItem('overgreen-service',value);if(value==='pulizie')activateClient('eurospin');
 resetSchedulePickerSelection();cleaningPlanDrafts.clear();renderedViews.clear();syncServiceMode();setView(currentView);if(currentView==='dashboard')renderDashboard();
}
function syncServiceMode(){
 const cleaning=activeService==='pulizie';document.body.classList.toggle('service-cleaning',cleaning);
 document.querySelectorAll('[data-service]').forEach(b=>{b.classList.toggle('active',b.dataset.service===activeService);b.setAttribute('aria-pressed',String(b.dataset.service===activeService))});
 $('serviceModeLabel').textContent=cleaning?'Pulizie · programmazione dedicata':'Verde · programmazione ordinaria';
 // Hide green-specific filters while the same Sedi page shows cleaning sites.
 for(const id of ['sortSelect','bulkIntervalBtn','seedBtn','addStoreBtn'])$(id)?.classList.toggle('service-hidden',cleaning);
 if($('cleaningDashboardSummary'))$('cleaningDashboardSummary').hidden=!cleaning;
}
function cleaningPlannedCodes(store,day){
 if(cleaningPlanDrafts.has(store.id))return cleaningPlanDrafts.get(store.id);
 const monthly=OvergreenCleaning.due(store,cleaningRows(),day).filter(x=>x.due&&x.code.startsWith('C/')).map(x=>x.code);
 return ['A/1','A/2',...monthly];
}
function cleaningPlanOptions(store,day){
 const codes=cleaningPlannedCodes(store,day),slot=OvergreenCleaning.slots(cleaningRows(),store.id,day.slice(0,4));
 return `<details class="cleaning-plan-options"><summary>Previste: ${esc(codes.join(' + '))} · D/2 libere ${slot.free}/2</summary>${cleaningCodeChoices(codes,'plan-'+store.id,slot.free===0&&!codes.includes('D/2'))}</details>`;
}
function cleaningCodeChoices(codes,prefix,disableSemester=false){return [
 ['weekly','Settimanale · A/1 + A/2',['A/1','A/2']],['c1','Mensile · C/1',['C/1']],['c2','Mensile · C/2',['C/2']],['d2','Semestrale · D/2',['D/2']]
 ].map(([key,label,values])=>`<label class="cleaning-task-choice"><input type="checkbox" data-clean-codes="${values.join(',')}" name="${prefix}-${key}" ${values.some(v=>codes.includes(v))?'checked':''} ${key==='d2'&&disableSemester?'disabled':''}><span>${label}</span></label>`).join('')}
function selectedCleaningCodes(root){return [...root.querySelectorAll('[data-clean-codes]:checked')].flatMap(x=>x.dataset.cleanCodes.split(','))}
function renderCleaningSchedulePicker(target='scheduleStores',day=$('scheduleDate').value||tomorrow(),add=false){
 const box=$(target);if(!box)return;box.replaceChildren();const q=String($(add?'addScheduleSearch':'scheduleSearch').value||'').trim().toLowerCase();
 const selected=add?new Set([...cleaningAddSelection]):schedulePickerSelected;
 const sites=stores.filter(s=>clientType(s)==='eurospin'&&OvergreenCleaning.active(s,day)&&(!q||[s.nome,s.citta,s.indirizzo].join(' ').toLowerCase().includes(q))).sort((a,b)=>a.nome.localeCompare(b.nome,'it'));
 if(!add){const tools=document.createElement('div');tools.className='actions';tools.innerHTML='<button type="button" class="secondary" data-all>Seleziona risultati</button><button type="button" class="secondary" data-clear>Azzera selezione</button>';tools.querySelector('[data-all]').onclick=()=>{sites.forEach(s=>selected.add(s.id));renderCleaningSchedulePicker(target,day,add)};tools.querySelector('[data-clear]').onclick=()=>{selected.clear();renderCleaningSchedulePicker(target,day,add)};box.appendChild(tools)}
 for(const st of sites){
  const row=document.createElement('div');row.className='cleaning-picker-site';const planned=cleaningRows().find(e=>e.store_id===st.id&&e.giorno_intervento===day&&!['annullato','completato'].includes(e.stato));
  row.innerHTML=`<label><input type="checkbox" data-clean-store value="${st.id}" ${selected.has(st.id)?'checked':''}><span><strong>${esc(st.nome)}</strong><small>${esc([st.citta,st.indirizzo].filter(Boolean).join(' · '))}${planned?' · Pulizia già in programma':''}</small></span></label>${cleaningPlanOptions(st,day)}`;
  row.querySelector('[data-clean-store]').onchange=e=>{if(add){e.target.checked?cleaningAddSelection.add(st.id):cleaningAddSelection.delete(st.id)}else setSchedulePickerValue(st.id,e.target.checked)};
  row.querySelectorAll('[data-clean-codes]').forEach(input=>input.onchange=()=>{cleaningPlanDrafts.set(st.id,selectedCleaningCodes(row));row.querySelector('summary').textContent='Previste: '+cleaningPlanDrafts.get(st.id).join(' + ')});box.appendChild(row);
 }
 const available=add?existingExtrasForSchedulePicker($('addScheduleId').value):standaloneExtrasForPlanner();
 for(const e of available.filter(e=>e.categoria_target==='pulizie'&&clientType(e)==='eurospin'&&!OvergreenCleaning.contract(e)&&(!q||schedulePlannerExtraSearchText(e).includes(q)))){const l=document.createElement('label'),value='extra:'+e.id;l.innerHTML=`<input type="checkbox" data-clean-store value="${value}" ${selected.has(value)?'checked':''}><span>${esc(e.titolo)} · Target</span>`;l.querySelector('input').onchange=ev=>{if(add){ev.target.checked?cleaningAddSelection.add(value):cleaningAddSelection.delete(value)}else setSchedulePickerValue(value,ev.target.checked)};box.appendChild(l)}
 if(!sites.length){const p=document.createElement('p');p.textContent='Nessun PV con affidamento pulizie attivo in questa data. Gestisci le sedi dal menu Affidamenti pulizie.';box.appendChild(p)}
 if(!add)updateScheduleSelectedCount();
}
let cleaningAddSelection=new Set();
async function cleaningPlanOperation(payload,add=false){
 const day=add?payload.expected_day:payload.day;
 const cleaning_stores=(payload.stores||[]).map(id=>{const s=stores.find(x=>x.id===id);if(!s||!OvergreenCleaning.active(s,day))throw Error('Affidamento pulizie non attivo per una delle sedi.');const codes=cleaningPlannedCodes(s,day);if(!codes.length)throw Error('Seleziona almeno una lavorazione prevista per '+s.nome);return {id,codes,note:payload.item_notes?.[id]?.nota||null}});
 const data={...payload,cleaning_stores};const key='overgreen-cleaning-plan:'+attachmentMediaScope()+':'+JSON.stringify([data,add]);let id=sessionStorage.getItem(key);if(!id){id=crypto.randomUUID();sessionStorage.setItem(key,id)}
 const r=await sb.rpc('overgreen_cleaning_plan_v309',{p_request_id:id,p_payload:data,p_add:add});if(r.error)throw r.error;sessionStorage.removeItem(key);return r.data;
}
function renderCleaningStores(){
 const root=$('storesList');if(!root)return;root.replaceChildren();const q=String($('searchInput').value||'').toLowerCase();
 for(const s of stores.filter(s=>clientType(s)==='eurospin'&&OvergreenCleaning.active(s,today())&&(!q||[s.nome,s.citta,s.indirizzo].join(' ').toLowerCase().includes(q)))){
 const slot=OvergreenCleaning.slots(cleaningRows(),s.id,today().slice(0,4)),due=OvergreenCleaning.due(s,cleaningRows(),today()).filter(x=>x.due),card=document.createElement('article');card.className='card cleaning-site-card';card.innerHTML=`<h3>${esc(s.nome)}</h3><p>${esc([s.citta,s.indirizzo].filter(Boolean).join(' · '))}</p><p>${due.length?'Da fare: '+due.map(x=>x.code).join(' · '):'Nessuna lavorazione scaduta'}</p><p>D/2: ${slot.free} libere · ${slot.reserved} prenotate · ${slot.used} eseguite</p><div class="actions"><button data-plan>Programma pulizia</button><button class="secondary" data-history>Storico pulizie</button><button class="secondary" data-contract>Affidamento</button></div>`;
 card.querySelector('[data-plan]').onclick=()=>{setView('schedule');schedulePickerSelected.add(s.id);renderSchedulePicker()};card.querySelector('[data-history]').onclick=()=>{cleaningStoreFilter=s.id;cleaningTab='history';setView('cleaning')};card.querySelector('[data-contract]').onclick=()=>cleaningContractOpen(s.id);root.appendChild(card);
 }
 if(!root.children.length)root.innerHTML='<p>Nessun punto vendita affidato per le pulizie. Apri Altro → Affidamenti pulizie.</p>';
}
function renderCleaningDashboardSummary(){
 syncServiceMode();const box=$('cleaningDashboardSummary');if(!box||activeService!=='pulizie')return;
 const sites=stores.filter(s=>OvergreenCleaning.active(s,today())),due=sites.filter(s=>OvergreenCleaning.due(s,cleaningRows(),today()).some(x=>x.due));
 box.innerHTML=`<div><strong>🧹 Pulizie</strong><p>${sites.length} PV affidati · ${due.length} con lavorazioni da programmare</p><small>Il giro qui sotto resta completo: verde, pulizie e altri incarichi.</small></div>${admin()?'<button data-plan-clean>Programma pulizie</button>':''}`;box.querySelector('[data-plan-clean]')?.addEventListener('click',()=>setView('schedule'));
}
function renderCleaningClosure(extra){
 const box=$('cleaningClosureChoices');if(!box)return;const isCleaning=OvergreenCleaning.contract(extra);box.hidden=!isCleaning;
 if(!isCleaning){box.replaceChildren();return;}
 const date=extra.giorno_intervento||today(),slot=OvergreenCleaning.slots(cleaningRows(),extra.store_id,date.slice(0,4));const codes=extra.cleaning_done_codes||extra.cleaning_codes;
 box.innerHTML=`<legend>Lavorazioni eseguite</legend><p>Seleziona ciò che hai effettivamente fatto in questa visita.</p>${cleaningCodeChoices(codes,'close',!extra.cleaning_slot&&!slot.free)}<p class="muted">D/2: ${slot.free} disponibilità libere${extra.cleaning_slot?' · una semestrale prenotata per questa visita':''}. Le voci non selezionate restano da fare.</p>`;
 $('closeExtraTitle').textContent='Chiudi pulizia';$('closeExtraLinkedInfo').innerHTML='<strong>Visita pulizie</strong><small>Una sola visita, anche con più lavorazioni. Lo storico del verde resta separato.</small>';$('closeExtraNightWork').classList.add('hidden');$('closeStructuredWorkWrap')?.classList.add('hidden');$('closeExtraPartialBtn').classList.add('hidden');
}
document.querySelectorAll('[data-service]').forEach(b=>b.onclick=()=>switchService(b.dataset.service));
$('addScheduleItemsDialog')?.addEventListener('close',()=>cleaningAddSelection.clear());
syncServiceMode();
function renderCleaningAffidamenti(){
 const root=$('cleaningContent'),q=String(cleaningSearch||'').toLowerCase();root.replaceChildren();
 const sites=stores.filter(s=>clientType(s)==='eurospin'&&(!q||[s.nome,s.citta].join(' ').toLowerCase().includes(q))).sort((a,b)=>a.nome.localeCompare(b.nome,'it'));
 for(const s of sites){const row=document.createElement('article');row.className='cleaning-contract-row';row.innerHTML=`<label><input type="checkbox" ${s.cleaning_enabled?'checked':''}><span><strong>${esc(s.nome)}</strong><small>${s.cleaning_enabled?'Affidamento dal '+fmt(s.cleaning_start)+(s.cleaning_end?' al '+fmt(s.cleaning_end):''):'Pulizie ordinarie non affidate'}</small></span></label><button class="secondary" type="button">Date / impostazioni</button>`;row.querySelector('input').onchange=e=>{const checked=e.target.checked;e.target.checked=!!s.cleaning_enabled;cleaningContractOpen(s.id);$('cleaningContractActive').checked=checked};row.querySelector('button').onclick=()=>cleaningContractOpen(s.id);root.appendChild(row)}
 if(!sites.length)root.textContent='Nessun punto vendita corrisponde alla ricerca.';
}
