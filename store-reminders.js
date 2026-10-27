// V234: an explicit customer request is independent of the routine visit interval.
let storeReminders=[];
function reminderService(service){return ['verde','pulizie'].includes(service)?service:typeof serviceForView==='function'?serviceForView():'verde'}
function activeStoreReminder(store,service){service=reminderService(service);return storeReminders.find(r=>r.store_id===store?.id&&r.active&&(r.service||'verde')===service)||null}
function compareStoreReminders(a,b,service){
 const ra=activeStoreReminder(a,service),rb=activeStoreReminder(b,service);
 return compareReminderDates(ra,rb);
}
function compareReminderDates(ra,rb){
 if(!ra||!rb)return ra?-1:rb?1:0;
 const day=today(),rank=r=>r.due_date&&r.due_date<day?0:!r.due_date?1:r.due_date===day?2:3;
 return rank(ra)-rank(rb)||String(ra.due_date||'').localeCompare(String(rb.due_date||''))||String(ra.requested_at).localeCompare(String(rb.requested_at));
}
function storeReminderLabel(r){return !r.due_date?'Il prima possibile':r.due_date<today()?`Data superata · da eseguire il ${fmt(r.due_date)}`:r.due_date===today()?'Da eseguire OGGI':`Da eseguire il ${fmt(r.due_date)}`}
function storeReminderMarkup(store,plannedDate=null,service){
 const r=activeStoreReminder(store,service);if(!r)return '';
 const conflict=r.due_date&&plannedDate&&r.due_date!==plannedDate;
 return `<div class="store-reminder-badge ${!r.due_date||r.due_date<=today()?'is-urgent':''}"><strong>⚑ SOLLECITO · ${esc(storeReminderLabel(r))}</strong>${r.note?`<small>${esc(r.note)}</small>`:''}${conflict?`<small class="reminder-conflict">⚠ Programmato il ${fmt(plannedDate)}: data diversa da quella comunicata (${fmt(r.due_date)}).</small>`:''}</div>`;
}
function storeReminderPlanStatus(store,service){
 service=reminderService(service);const r=activeStoreReminder(store,service);if(!r)return 'Nessun sollecito';
 if(service==='pulizie'){const visits=cleaningRows().filter(e=>e.store_id===store.id&&OvergreenCleaning.contract(e)&&!['completato','annullato'].includes(e.stato));if(visits.some(e=>e.stato==='in_attesa'))return 'Passaggio eseguito · in attesa di convalida';const dates=visits.map(OvergreenCleaning.day).filter(Boolean).sort();return dates.length?'In programma: '+dates.map(fmt).join(', '):'Da programmare'}
 const pending=interventions.some(i=>i.store_id===store.id&&i.stato==='in_attesa'&&!i.multi_day_open&&Date.parse(i.closed_at||i.created_at)>=Date.parse(r.requested_at)&&(i.data_fine||i.data_intervento)>=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(r.requested_at)));
 if(pending)return 'Passaggio eseguito · in attesa di convalida';
 const dates=scheduleItems.filter(i=>i.store_id===store.id&&i.tipo==='ordinario'&&effectiveScheduleState(i)==='da_fare').map(i=>schedules.find(s=>s.id===i.schedule_id)?.giorno).filter(Boolean).sort();
 if(!dates.length)return 'Da programmare';
 if(r.due_date&&dates.includes(r.due_date))return `✓ Programmato nella data comunicata: ${fmt(r.due_date)}`;
 return `In programma: ${dates.map(fmt).join(', ')}${r.due_date?' · ⚠ data comunicata non coperta':''}`;
}
function renderStoreReminderPanels(){
 const byId=new Map(stores.map(s=>[s.id,s]));
 const allRows=storeReminders.filter(r=>r.active&&byId.has(r.store_id)).sort(compareReminderDates).map(r=>({store:byId.get(r.store_id),service:r.service||'verde'}));
 for(const id of ['dashboardReminders','scheduleReminders']){
  const rows=id==='dashboardReminders'?allRows:allRows.filter(row=>workspaceMatches(row.store)&&row.service===reminderService());const host=$(id);if(!host)continue;host.hidden=!rows.length;host.innerHTML='';if(!rows.length)continue;
  host.innerHTML=`<h2>⚑ PV sollecitati <span>${rows.length}</span></h2><p class="muted">Priorità richieste dal cliente · passaggi ordinari</p>`;
  const fragment=document.createDocumentFragment();
  for(const {store:st,service} of rows){
   const card=document.createElement('article');card.className='reminder-panel-row';card.dataset.serviceReminder=service;
   card.innerHTML=`<strong>${esc(st.nome)} · ${service==='pulizie'?'Pulizie':'Verde'}</strong>${storeReminderMarkup(st,null,service)}<p>${esc(storeReminderPlanStatus(st,service))}</p><div class="actions"><button type="button" class="secondary" data-reminder-site>Apri sede</button>${admin()?'<button type="button" data-reminder-plan>Prepara programma</button><button type="button" class="secondary" data-reminder-edit>Modifica sollecito</button>':''}</div>`;
   card.querySelector('[data-reminder-site]').onclick=()=>showStoreDetail(st,service);
   card.querySelector('[data-reminder-edit]')?.addEventListener('click',()=>openStoreReminder(st,service));
   card.querySelector('[data-reminder-plan]')?.addEventListener('click',()=>prepareStoreReminderPlan(st,service));
   fragment.appendChild(card);
  }
  host.appendChild(fragment);
 }
}
function prepareStoreReminderPlan(store,service){
 if(!admin())return;service=reminderService(service);const r=activeStoreReminder(store,service);if(!r)return;
 if(typeof activateClient==='function')activateClient(clientType(store));
 if(typeof switchService==='function')switchService(service,{render:false});
 $('scheduleDate').value=r.due_date&&r.due_date>=today()?r.due_date:today();
 schedulePickerSelected.add(store.id);schedulePickerMode='selected';schedulePickerLetter='';$('scheduleSearch').value='';$('schedulePickerClient').value='all';setView('schedule');renderSchedulePicker();updateScheduleSelectedCount();
 $('scheduleForm').scrollIntoView({behavior:'smooth',block:'start'});toast('Sede selezionata: scegli la squadra e conferma il programma');
}
function openStoreReminder(store,service){
 if(!admin()||!store)return;service=reminderService(service);
 const r=activeStoreReminder(store,service);$('storeReminderForm').dataset.service=service;$('storeReminderId').value=store.id;$('storeReminderTitle').textContent=`Sollecito ${service==='pulizie'?'pulizie':'verde'} · ${store.nome}`;
 $('storeReminderDate').value=r?.due_date||'';$('storeReminderNote').value=r?.note||'';$('removeStoreReminder').hidden=!r;
 openDialog('storeReminderDialog');
}
async function saveStoreReminder(remove=false){
 if(!admin())return;
 const id=$('storeReminderId').value,st=stores.find(s=>s.id===id);if(!st)return;
 if(remove&&!confirm(`Rimuovere il sollecito di ${st.nome}?`))return;
 await withFormBusy('storeReminderForm',async()=>{
  try{
   const r=await sb.rpc($('storeReminderForm').dataset.service==='pulizie'?'overgreen_set_cleaning_reminder_v311':'overgreen_set_store_reminder_v234',{p_store_id:id,p_due_date:remove?null:($('storeReminderDate').value||null),p_note:remove?null:($('storeReminderNote').value.trim()||null),p_active:!remove});
   if(r.error)throw r.error;
   $('storeReminderDialog').close();await loadAll();toast(remove?'Sollecito rimosso':'Sollecito salvato e visibile alla squadra');
  }catch(error){alert('Sollecito non salvato: '+error.message)}
 });
}
document.getElementById('storeReminderForm').addEventListener('submit',e=>{e.preventDefault();void saveStoreReminder()});
document.getElementById('removeStoreReminder').addEventListener('click',()=>void saveStoreReminder(true));

function storeDailyReminderRows(day=today()){
 const limit=new Date(Date.parse(day+'T00:00:00Z')+10*86400000).toISOString().slice(0,10);
 return stores.filter(st=>{const r=activeStoreReminder(st);return r&&(!r.due_date||r.due_date<=limit)}).sort(compareStoreReminders);
}
