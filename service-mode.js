/* The selected service changes planning and colors; the main dashboard keeps the whole route. */
const cleaningPlanDrafts=new Map();
const servicePlannerSelections=new Map();
function switchService(value,{render=true}={}){
 if(!['verde','pulizie'].includes(value))return false;
 if(value===activeService)return true;
 servicePlannerSelections.set(activeService,{selected:new Set(schedulePickerSelected),notes:new Map(scheduleItemNoteDrafts),search:$('scheduleSearch').value,mode:schedulePickerMode,letter:schedulePickerLetter});
 activeService=value;localStorage.setItem('overgreen-service',value);if(value==='pulizie')activateClient('eurospin');
 const saved=servicePlannerSelections.get(value);
 schedulePickerSelected=new Set(saved?.selected||[]);scheduleItemNoteDrafts.clear();for(const [id,note] of saved?.notes||[])scheduleItemNoteDrafts.set(id,note);
 schedulePickerMode=saved?.mode||'all';schedulePickerLetter=saved?.letter||'';$('scheduleSearch').value=saved?.search||'';
 $('scheduleItemNotesDrafts').dataset.selection='';storeFilter='all';
 renderedViews.delete('stores');renderedViews.delete('schedule');updateScheduleSelectedCount();if(render)setView(currentView);return true;
}
function syncServiceMode(){
 const scoped=admin()&&activeClient==='eurospin'&&['stores','schedule'].includes(currentView),cleaning=scoped&&activeService==='pulizie';
 $('serviceModeBar').hidden=!scoped;document.body.classList.toggle('service-cleaning',cleaning);
document.querySelectorAll('[data-service]').forEach(b=>{b.classList.toggle('active',b.dataset.service===activeService);b.setAttribute('aria-pressed',String(b.dataset.service===activeService))});
 $('serviceModeLabel').textContent=cleaning?'Sedi e programmazione pulizie':'Sedi e programmazione verde';
}
function cleaningStoreIndex(){const index=new Map();for(const row of cleaningRows()){if(!index.has(row.store_id))index.set(row.store_id,[]);index.get(row.store_id).push(row)}return index}
function cleaningPlanKey(storeId,day){return day+':'+storeId}
function mountCleaningPlanOptions(label,store,day,selected){
 let options=label.nextElementSibling;if(!options?.classList.contains('cleaning-plan-options'))options=null;
 if(!selected){options?.remove();return;}
 if(options)return;
 const wrap=document.createElement('div');wrap.innerHTML=cleaningPlanOptions(store,day);options=wrap.firstElementChild;
 options.querySelectorAll('[data-clean-codes]').forEach(input=>input.onchange=()=>cleaningPlanDrafts.set(cleaningPlanKey(store.id,day),selectedCleaningCodes(options)));
 label.after(options);
}
function cleaningPlannedCodes(store,day){
 if(cleaningPlanDrafts.has(cleaningPlanKey(store.id,day)))return cleaningPlanDrafts.get(cleaningPlanKey(store.id,day));
 const monthly=OvergreenCleaning.due(store,cleaningRows(),day).filter(x=>x.due&&x.code.startsWith('C/')).map(x=>x.code);
 return ['A/1','A/2',...monthly];
}
function cleaningPlanOptions(store,day){
 const codes=cleaningPlannedCodes(store,day),slot=OvergreenCleaning.slots(cleaningRows(),store.id,day.slice(0,4));
 return `<details class="cleaning-plan-options"><summary>Lavorazioni previste</summary>${cleaningCodeChoices(codes,'plan-'+store.id,slot.free===0&&!codes.includes('D/2'))}<small>Semestrali disponibili: ${slot.free} su 2. Confermerai le lavorazioni eseguite alla chiusura.</small></details>`;
}
function cleaningCodeChoices(codes,prefix,disableSemester=false){return [
 ['weekly','Settimanale · A/1 + A/2',['A/1','A/2']],['c1','Mensile · vetri dei servizi (C/1)',['C/1']],['c2','Mensile · pulizia esterna (C/2)',['C/2']],['d2','Semestrale · D/2',['D/2']]
 ].map(([key,label,values])=>`<label class="cleaning-task-choice"><input type="checkbox" data-clean-codes="${values.join(',')}" name="${prefix}-${key}" ${values.some(v=>codes.includes(v))?'checked':''} ${key==='d2'&&disableSemester?'disabled':''}><span>${label}</span></label>`).join('')}
function selectedCleaningCodes(root){return [...root.querySelectorAll('[data-clean-codes]:checked')].flatMap(x=>x.dataset.cleanCodes.split(','))}
async function cleaningPlanOperation(payload,add=false){
 const day=add?payload.expected_day:payload.day;
 const cleaning_stores=(payload.stores||[]).map(id=>{const s=stores.find(x=>x.id===id);if(!s||!OvergreenCleaning.active(s,day))throw Error('Affidamento pulizie non attivo per una delle sedi.');const codes=cleaningPlannedCodes(s,day);if(!codes.length)throw Error('Seleziona almeno una lavorazione prevista per '+s.nome);return {id,codes,note:(typeof payload.item_notes?.[id]==='string'?payload.item_notes[id]:payload.item_notes?.[id]?.nota)||null}});
 const data={...payload,cleaning_stores};const key='overgreen-cleaning-plan:'+attachmentMediaScope()+':'+JSON.stringify([data,add]);let id=sessionStorage.getItem(key);if(!id){id=crypto.randomUUID();sessionStorage.setItem(key,id)}
 const r=await sb.rpc('overgreen_cleaning_plan_v309',{p_request_id:id,p_payload:data,p_add:add});if(r.error)throw r.error;sessionStorage.removeItem(key);return r.data;
}
function renderCleaningClosure(extra){
 const box=$('cleaningClosureChoices');if(!box)return;const isCleaning=OvergreenCleaning.contract(extra);box.hidden=!isCleaning;
 $('closeExtraForm').querySelectorAll('.continue-help').forEach(el=>el.hidden=isCleaning);
 if(!isCleaning){box.replaceChildren();return;}
 const date=$('closeExtraClosedAt').value?.slice(0,10)||extra.giorno_intervento||today(),slot=OvergreenCleaning.slots(cleaningRows().filter(e=>e.id!==extra.id),extra.store_id,date.slice(0,4));const codes=extra.cleaning_done_codes||extra.cleaning_codes;
 box.innerHTML=`<legend>Lavorazioni eseguite</legend><p>Seleziona ciò che hai effettivamente fatto in questa visita.</p>${cleaningCodeChoices(codes,'close',!slot.free)}<p class="muted">Semestrali disponibili per questa visita nel ${date.slice(0,4)}: ${slot.free}. Le voci non selezionate restano da fare.</p>`;
 $('closeExtraCancelBtn').classList.add('hidden');$('closeExtraPartialStatus')?.classList.add('hidden');$('closeExtraTitle').textContent='Registra ordinario · Pulizie';$('closeExtraLinkedInfo').innerHTML='<strong>Visita pulizie</strong><small>Una sola visita, anche con più lavorazioni. Lo storico del verde resta separato.</small>';$('closeExtraNightWork').classList.add('hidden');$('closeStructuredWorkWrap')?.classList.add('hidden');$('closeExtraPartialBtn').classList.add('hidden');
}
function validateCleaningExecution(extra,day,codes){
 const store=stores.find(s=>s.id===extra.store_id);
 if(!OvergreenCleaning.active(store||{},day))throw new Error('Affidamento pulizie non attivo nella data scelta.');
 if(codes.includes('D/2')&&!OvergreenCleaning.slots(cleaningRows().filter(e=>e.id!==extra.id),extra.store_id,day.slice(0,4)).free)throw new Error('Nessuna semestrale disponibile nel '+day.slice(0,4)+'. Verifica la data o togli la semestrale.');
}
$('closeExtraClosedAt').addEventListener('change',()=>{
 const extra=cleaningClosureRecord($('closeExtraId').value);if(!OvergreenCleaning.contract(extra))return;
 const chosen=selectedCleaningCodes($('cleaningClosureChoices'));renderCleaningClosure({...extra,cleaning_done_codes:chosen});
});
document.querySelectorAll('[data-service]').forEach(b=>b.onclick=()=>switchService(b.dataset.service));

syncServiceMode();
function renderCleaningAffidamenti(){
 const root=$('cleaningContent'),q=String(cleaningSearch||'').toLowerCase();root.replaceChildren();
 const sites=stores.filter(s=>clientType(s)==='eurospin'&&(!q||[s.nome,s.citta].join(' ').toLowerCase().includes(q))).sort((a,b)=>a.nome.localeCompare(b.nome,'it'));
 for(const s of sites){const row=document.createElement('article');row.className='cleaning-contract-row';row.innerHTML=`<label><input type="checkbox" ${s.cleaning_enabled?'checked':''}><span><strong>${esc(s.nome)}</strong><small>${s.cleaning_enabled?'Affidamento dal '+fmt(s.cleaning_start)+(s.cleaning_end?' al '+fmt(s.cleaning_end):''):'Pulizie ordinarie non affidate'}</small></span></label><button class="secondary" type="button">Date / impostazioni</button>`;row.querySelector('input').onchange=e=>{const checked=e.target.checked;e.target.checked=!!s.cleaning_enabled;cleaningContractOpen(s.id);$('cleaningContractActive').checked=checked};row.querySelector('button').onclick=()=>cleaningContractOpen(s.id);root.appendChild(row)}
 if(!sites.length)root.textContent='Nessun punto vendita corrisponde alla ricerca.';
}

function cleaningStoreProgrammed(id,rows=cleaningRows()){return rows.some(e=>e.store_id===id&&OvergreenCleaning.contract(e)&&!['completato','annullato'].includes(e.stato)&&(e.schedule_id||e.giorno_intervento))}
function cleaningStoreView(s,rows=cleaningRows()){
 const last=rows.filter(e=>e.store_id===s.id&&e.stato==='completato'&&OvergreenCleaning.codes(e).some(c=>c==='A/1'||c==='A/2')).map(OvergreenCleaning.day).filter(Boolean).sort().pop();
 return {...s,ultimo_passaggio:last||null,intervallo_giorni:7};
}
let cleaningOrdinaryDraft=null;
function cleaningOrdinaryDraftKey(storeId){return 'overgreen-ordinary-cleaning:'+attachmentMediaScope()+':'+storeId}
function openCleaningOrdinary(s){
 if(!admin())return;
 const key=cleaningOrdinaryDraftKey(s.id),savedId=sessionStorage.getItem(key);
 const saved=cleaningRows().find(e=>e.id===savedId);
 if(saved&&['in_attesa','completato'].includes(saved.stato)){sessionStorage.removeItem(key);showCleaningStoreHistory(s);toast('Questo intervento è già stato inviato.');return;}
 const existing=saved&&saved.stato!=='annullato'?saved:cleaningRows().find(e=>e.store_id===s.id&&OvergreenCleaning.contract(e)&&OvergreenCleaning.day(e)===today()&&!['completato','annullato','in_attesa'].includes(e.stato));
 if(existing){cleaningOrdinaryDraft=null;return openExtraClosureDialog(existing)}
 let id=saved?.stato==='annullato'?null:sessionStorage.getItem(key);if(!id){id=crypto.randomUUID();sessionStorage.setItem(key,id)}
 cleaningOrdinaryDraft={id,store_id:s.id,client_type:'eurospin',categoria_target:'pulizie',closure_profile:'eurospin',stato:'ricevuto',titolo:'Ordinario · Pulizie',cleaning_codes:['A/1','A/2'],cleaning_period:today(),giorno_intervento:today(),_unsavedCleaning:true};
 openExtraClosureDialog(cleaningOrdinaryDraft);
}
function cleaningClosureRecord(id){return extras.find(e=>e.id===id)||(cleaningOrdinaryDraft?.id===id?cleaningOrdinaryDraft:null)}
async function materializeCleaningOrdinary(draft,day,codes,notes){
 const result=await sb.rpc('overgreen_cleaning_create_v308',{p_id:draft.id,p_store:draft.store_id,p_day:day,p_codes:codes,p_description:notes,p_existing:null});
 if(result.error)throw result.error;
 const row=result.data;if(!row?.id)throw new Error('Registrazione non confermata. Riprova.');
 const index=extras.findIndex(e=>e.id===row.id);if(index<0)extras.push(row);else extras[index]=row;
 // Retain the confirmed ID if an upload or the closure fails: retries reuse this visit.
 sessionStorage.setItem(cleaningOrdinaryDraftKey(draft.store_id),row.id);
 cleaningOrdinaryDraft=null;return row;
}
function showCleaningStoreHistory(s){
 currentHistoryStoreId=s.id;$('historyDialog').dataset.service='pulizie';$('historyTitle').textContent=s.nome;
 const rows=cleaningRows().filter(e=>e.store_id===s.id&&OvergreenCleaning.contract(e)).sort((a,b)=>String(OvergreenCleaning.day(b)).localeCompare(String(OvergreenCleaning.day(a))));
 const root=$('historyList');root.innerHTML=`<div class="history-summary"><div><strong>${rows.length}</strong><span>interventi</span></div><div><strong>${rows.filter(e=>e.stato==='completato').length}</strong><span>convalidati</span></div><div><strong>${attachments.filter(a=>a.tipo==='foto_generica'&&rows.some(e=>e.id===a.extra_id)).length}</strong><span>foto</span></div></div><div class="history-subtitle">Cronologia interventi</div>`;
 rows.forEach(e=>root.appendChild(extraCard(e)));if(!rows.length)root.insertAdjacentHTML('beforeend','<div class="history-empty"><strong>Nessun intervento</strong><span>Gli interventi registrati compariranno qui.</span></div>');
 if(!$('historyDialog').open)openDialog('historyDialog');
}

function cleaningOrdinaryCard(e){
 const st=stores.find(s=>s.id===e.store_id),c=document.createElement('article');c.className='card history-item cleaning-ordinary-card';c.dataset.extraCardId=e.id;
 const done=e.stato==='completato',pending=e.stato==='in_attesa',cancelled=e.stato==='annullato';
 const state=done?'Convalidato':pending?'In attesa di convalida':cancelled?'Annullato':'Da eseguire';
 const codes=OvergreenCleaning.codes(e),labels=[];
 if(codes.some(code=>code==='A/1'||code==='A/2'))labels.push('Settimanale');
 if(codes.includes('C/1'))labels.push('Mensile · vetri dei servizi');
 if(codes.includes('C/2'))labels.push('Mensile · pulizia esterna');
 if(codes.includes('D/2'))labels.push('Semestrale');
 const pics=attachments.filter(a=>a.extra_id===e.id&&a.tipo==='foto_generica');
 const names=extraWorkers.filter(w=>w.extra_id===e.id).map(w=>profiles.find(p=>p.id===w.profile_id)?.nome).filter(Boolean);
 c.innerHTML=`<div class="history-head"><div><strong>${esc(fmt(OvergreenCleaning.day(e)))}</strong><h3>Ordinario · Pulizie</h3><small>${esc(st?.nome||e.nome_esterno||'')}</small></div><span class="badge-state">${state}</span></div><p><strong>${done||pending?'Lavorazioni eseguite':'Lavorazioni previste'}</strong><br>${labels.map(esc).join(' · ')}</p>${names.length?`<p class="muted">Operatori: ${names.map(esc).join(' · ')}</p>`:''}${e.closed_at?`<p class="muted">Registrato: ${esc(closureText(e))}</p>`:''}<div class="history-note">${esc(e.note_lorenzo||e.descrizione||'Nessuna nota')}</div><div class="pending-photo-head"><strong>Foto del lavoro</strong><span>${pics.length}</span></div><div class="pending-review-photos" data-extra-photos>${pics.length?'<span class="history-loading">Caricamento foto…</span>':'<p class="muted">Nessuna foto allegata.</p>'}</div><div class="actions"><button class="secondary" data-map>Maps</button>${!done&&!pending&&!cancelled&&canWorkOnExtra(e)?'<button data-register>Registra ordinario</button>':''}${admin()&&pending?'<button data-approve>Convalida</button>':''}${admin()&&done?'<button class="secondary" data-edit>Modifica intervento</button>':''}</div>`;
 c.querySelector('[data-map]').onclick=()=>openExtraMaps(e,st);
 c.querySelector('[data-register]')?.addEventListener('click',()=>openExtraClosureDialog(e));
 c.querySelector('[data-approve]')?.addEventListener('click',()=>approveExtra(e));
 c.querySelector('[data-edit]')?.addEventListener('click',()=>openExtraClosureEdit(e));
 if(pics.length)hydrateExtraPhotos(c,pics);return c;
}
