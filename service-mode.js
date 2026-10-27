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
 for(const id of ['sortSelect','bulkIntervalBtn','seedBtn','addStoreBtn'])$(id)?.classList.remove('service-hidden');
 if($('cleaningDashboardSummary'))$('cleaningDashboardSummary').hidden=!cleaning;
}
function cleaningPlannedCodes(store,day){
 if(cleaningPlanDrafts.has(store.id))return cleaningPlanDrafts.get(store.id);
 const monthly=OvergreenCleaning.due(store,cleaningRows(),day).filter(x=>x.due&&x.code.startsWith('C/')).map(x=>x.code);
 return ['A/1','A/2',...monthly];
}
function cleaningPlanOptions(store,day){
 const codes=cleaningPlannedCodes(store,day),slot=OvergreenCleaning.slots(cleaningRows(),store.id,day.slice(0,4));
 return `<details class="cleaning-plan-options"><summary>Lavorazioni previste</summary>${cleaningCodeChoices(codes,'plan-'+store.id,slot.free===0&&!codes.includes('D/2'))}<small>Semestrali disponibili: ${slot.free} su 2. Confermerai le lavorazioni eseguite alla chiusura.</small></details>`;
}
function cleaningCodeChoices(codes,prefix,disableSemester=false){return [
 ['weekly','Settimanale · A/1 + A/2',['A/1','A/2']],['c1','Mensile · C/1',['C/1']],['c2','Mensile · C/2',['C/2']],['d2','Semestrale · D/2',['D/2']]
 ].map(([key,label,values])=>`<label class="cleaning-task-choice"><input type="checkbox" data-clean-codes="${values.join(',')}" name="${prefix}-${key}" ${values.some(v=>codes.includes(v))?'checked':''} ${key==='d2'&&disableSemester?'disabled':''}><span>${label}</span></label>`).join('')}
function selectedCleaningCodes(root){return [...root.querySelectorAll('[data-clean-codes]:checked')].flatMap(x=>x.dataset.cleanCodes.split(','))}
async function cleaningPlanOperation(payload,add=false){
 const day=add?payload.expected_day:payload.day;
 const cleaning_stores=(payload.stores||[]).map(id=>{const s=stores.find(x=>x.id===id);if(!s||!OvergreenCleaning.active(s,day))throw Error('Affidamento pulizie non attivo per una delle sedi.');const codes=cleaningPlannedCodes(s,day);if(!codes.length)throw Error('Seleziona almeno una lavorazione prevista per '+s.nome);return {id,codes,note:payload.item_notes?.[id]?.nota||null}});
 const data={...payload,cleaning_stores};const key='overgreen-cleaning-plan:'+attachmentMediaScope()+':'+JSON.stringify([data,add]);let id=sessionStorage.getItem(key);if(!id){id=crypto.randomUUID();sessionStorage.setItem(key,id)}
 const r=await sb.rpc('overgreen_cleaning_plan_v309',{p_request_id:id,p_payload:data,p_add:add});if(r.error)throw r.error;sessionStorage.removeItem(key);return r.data;
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

syncServiceMode();
function renderCleaningAffidamenti(){
 const root=$('cleaningContent'),q=String(cleaningSearch||'').toLowerCase();root.replaceChildren();
 const sites=stores.filter(s=>clientType(s)==='eurospin'&&(!q||[s.nome,s.citta].join(' ').toLowerCase().includes(q))).sort((a,b)=>a.nome.localeCompare(b.nome,'it'));
 for(const s of sites){const row=document.createElement('article');row.className='cleaning-contract-row';row.innerHTML=`<label><input type="checkbox" ${s.cleaning_enabled?'checked':''}><span><strong>${esc(s.nome)}</strong><small>${s.cleaning_enabled?'Affidamento dal '+fmt(s.cleaning_start)+(s.cleaning_end?' al '+fmt(s.cleaning_end):''):'Pulizie ordinarie non affidate'}</small></span></label><button class="secondary" type="button">Date / impostazioni</button>`;row.querySelector('input').onchange=e=>{const checked=e.target.checked;e.target.checked=!!s.cleaning_enabled;cleaningContractOpen(s.id);$('cleaningContractActive').checked=checked};row.querySelector('button').onclick=()=>cleaningContractOpen(s.id);root.appendChild(row)}
 if(!sites.length)root.textContent='Nessun punto vendita corrisponde alla ricerca.';
}

function cleaningStoreProgrammed(id){return cleaningRows().some(e=>e.store_id===id&&OvergreenCleaning.contract(e)&&!['completato','annullato'].includes(e.stato)&&(e.schedule_id||e.giorno_intervento))}
function cleaningStoreView(s){
 const last=cleaningRows().filter(e=>e.store_id===s.id&&e.stato==='completato'&&OvergreenCleaning.codes(e).some(c=>c==='A/1'||c==='A/2')).map(OvergreenCleaning.day).filter(Boolean).sort().pop();
 return {...s,ultimo_passaggio:last||null,intervallo_giorni:7};
}
function openCleaningOrdinary(s){
 const existing=cleaningRows().find(e=>e.store_id===s.id&&OvergreenCleaning.contract(e)&&OvergreenCleaning.day(e)===today()&&!['completato','annullato','in_attesa'].includes(e.stato));
 if(existing)return openExtraClosureDialog(existing);
 cleaningOpen(s.id);cleaningRegisterMode=true;
 $('cleaningEditDialog').querySelector('h2').textContent='Registra ordinario · '+s.nome;
 $('cleaningEditForm').querySelector('[type=submit]').textContent='Continua alla chiusura';
 $('cleaningVisitMode').closest('label').hidden=true;
}
function showCleaningStoreHistory(s){
 currentHistoryStoreId=s.id;$('historyTitle').textContent=s.nome;
 const rows=cleaningRows().filter(e=>e.store_id===s.id&&OvergreenCleaning.contract(e)).sort((a,b)=>String(OvergreenCleaning.day(b)).localeCompare(String(OvergreenCleaning.day(a))));
 const root=$('historyList');root.innerHTML=`<div class="history-summary"><div><strong>${rows.length}</strong><span>interventi</span></div><div><strong>${rows.filter(e=>e.stato==='completato').length}</strong><span>convalidati</span></div><div><strong>${attachments.filter(a=>a.tipo==='foto_generica'&&rows.some(e=>e.id===a.extra_id)).length}</strong><span>foto</span></div></div><div class="history-subtitle">Cronologia interventi</div>`;
 rows.forEach(e=>root.appendChild(extraCard(e)));if(!rows.length)root.insertAdjacentHTML('beforeend','<div class="history-empty"><strong>Nessun intervento</strong><span>Gli interventi registrati compariranno qui.</span></div>');
 if(!$('historyDialog').open)openDialog('historyDialog');
}
