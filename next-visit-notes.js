function nextVisitNoteMarkup(store){
 const note=String(store?.next_visit_note||'').trim();if(!note)return '';
 return `<aside class="schedule-next-visit" data-next-visit-store="${esc(store.id)}"><strong>⚠️ Da fare al prossimo passaggio</strong><p>${esc(note)}</p>${admin()?`<button type="button" class="secondary" data-dismiss-next-visit="${esc(store.id)}">Rimuovi promemoria</button>`:''}</aside>`;
}
async function dismissNextVisitNote(store,button){
 if(!admin()||!store?.next_visit_note)return;
 if(!confirm(`Rimuovere il promemoria di ${store.nome}?\n\n${store.next_visit_note}\n\nLa nota originale resta nello storico dell’intervento.`))return;
 if(button)button.disabled=true;
 try{
  const {error}=await sb.rpc('overgreen_dismiss_next_visit_note_v241',{p_store_id:store.id,p_expected_note:store.next_visit_note});if(error)throw error;
  store.next_visit_note=null;
  document.querySelectorAll('[data-next-visit-store]').forEach(el=>{if(el.dataset.nextVisitStore===store.id)el.remove()});
  await loadAll();toast('Promemoria rimosso');
 }catch(err){alert('Promemoria non rimosso: '+err.message)}finally{if(button)button.disabled=false}
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-dismiss-next-visit]');if(!button)return;e.preventDefault();e.stopPropagation();void dismissNextVisitNote(stores.find(s=>s.id===button.dataset.dismissNextVisit),button)});
