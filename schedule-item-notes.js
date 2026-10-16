// Notes belong to one scheduled visit, never to the permanent store record.
const scheduleItemNoteDrafts=new Map();
function scheduleItemNoteMarkup(item){const note=String(item?.nota||'').trim();return note?`<aside class="schedule-item-note"><strong>📌 APPUNTO PER QUESTO PASSAGGIO</strong><p>${esc(note)}</p></aside>`:''}
function selectedScheduleItemNotes(){return Object.fromEntries([...schedulePickerSelected].filter(id=>!id.startsWith('extra:')&&String(scheduleItemNoteDrafts.get(id)||'').trim()).map(id=>[id,scheduleItemNoteDrafts.get(id).trim()]))}
function renderScheduleItemNoteDrafts(){
 const host=$('scheduleItemNotesDrafts');if(!host)return;
 const ids=[...schedulePickerSelected].filter(id=>!id.startsWith('extra:'));
 host.hidden=!ids.length;const signature=JSON.stringify(ids);if(host.dataset.selection===signature)return;host.dataset.selection=signature;
 host.innerHTML='<h3>📌 Appunti per le singole sedi</h3><p class="muted">Apri la sede e scrivi le indicazioni per questo passaggio.</p>';
 for(const id of ids){const st=stores.find(s=>s.id===id),row=document.createElement('details');row.className='schedule-note-draft';row.innerHTML=`<summary>${esc(st?.nome||'Sede')} <span>${scheduleItemNoteDrafts.get(id)?'Appunto inserito':'Aggiungi appunto'}</span></summary><label>Indicazioni alla squadra<textarea maxlength="2000" rows="3" placeholder="Es. Portare la scala, avvisare il direttore prima di iniziare…"></textarea></label>`;const input=row.querySelector('textarea');input.value=scheduleItemNoteDrafts.get(id)||'';input.oninput=()=>{scheduleItemNoteDrafts.set(id,input.value);row.querySelector('summary span').textContent=input.value.trim()?'Appunto inserito':'Aggiungi appunto'};host.appendChild(row)}
}
function openScheduleItemNote(item){
 if(!admin()||!item)return;let dialog=$('scheduleItemNoteDialog');
 if(!dialog){dialog=document.createElement('dialog');dialog.id='scheduleItemNoteDialog';dialog.innerHTML='<form id="scheduleItemNoteForm"><div class="dialog-head"><h2>Appunto per il passaggio</h2><button type="button" data-note-close aria-label="Chiudi">×</button></div><p id="scheduleItemNoteContext"></p><label>Indicazioni alla squadra<textarea id="scheduleItemNoteText" maxlength="2000" rows="5"></textarea></label><p class="muted">Visibile alla squadra su questa tappa. Svuota il campo per rimuoverlo.</p><button type="submit">Salva appunto</button></form>';document.body.appendChild(dialog);dialog.querySelector('[data-note-close]').onclick=()=>dialog.close()}
 const st=stores.find(s=>s.id===item.store_id),sch=schedules.find(s=>s.id===item.schedule_id);
 $('scheduleItemNoteContext').textContent=[st?.nome,sch?.giorno?fmt(sch.giorno):''].filter(Boolean).join(' · ');$('scheduleItemNoteText').value=item.nota||'';
 $('scheduleItemNoteForm').onsubmit=e=>{e.preventDefault();void withFormBusy('scheduleItemNoteForm',async()=>{
  if(!admin())return;const note=$('scheduleItemNoteText').value.trim()||null;
  const {data,error}=await sb.from('schedule_items').update({nota:note}).eq('id',item.id).select('id,nota').single();if(error)throw error;
  item.nota=data.nota;dialog.close();await loadAll();toast(note?'Appunto salvato e visibile alla squadra':'Appunto rimosso');
 })};dialog.showModal();
}
