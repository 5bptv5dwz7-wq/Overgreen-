/* One shared visit per set of cleaning tasks; existing workflow owns assignments and closure. */
let cleaningStoreFilter='',cleaningSearch='',cleaningMonth='',cleaningTab='sites';
function cleaningRows(){return extras.filter(e=>clientType(e)==='eurospin'&&e.categoria_target==='pulizie')}
function cleaningOpen(storeId='',existingId=''){
 if(!admin())return;
 $('cleaningEditDialog').querySelector('h2').textContent='Visita pulizie';$('cleaningEditForm').querySelector('[type=submit]').textContent='Salva e assegna';$('cleaningVisitMode').closest('label').hidden=false;
 const dialog=$('cleaningEditDialog');$('cleaningEditForm').reset();
 $('cleaningVisitId').value=crypto.randomUUID();$('cleaningExistingId').value=existingId;
 const existing=extras.find(e=>e.id===existingId);
 $('cleaningVisitStore').innerHTML=stores.filter(s=>clientType(s)==='eurospin').sort((a,b)=>a.nome.localeCompare(b.nome,'it')).map(s=>`<option value="${esc(s.id)}">${esc(s.nome)}</option>`).join('');
 if(storeId)$('cleaningVisitStore').value=storeId;
 $('cleaningVisitStore').disabled=!!existing;
 $('cleaningVisitDay').disabled=!!existing?.giorno_intervento;
 $('cleaningVisitMode').querySelector('[value=contract]').disabled=!!existing;
 $('cleaningVisitDay').value=existing?.giorno_intervento||today();
 $('cleaningVisitNote').value=existing?.descrizione||'';
 $('cleaningClassifyInfo').textContent=existing?'Stai classificando il Target esistente: resteranno lo stesso intervento, gli allegati e la squadra. Conferma D/2 solo se la richiesta rientra in quella voce.':'Seleziona le lavorazioni da svolgere nella stessa visita. Dopo il salvataggio potrai assegnarle a un giro.';
 $('cleaningVisitMode').value=existing?'request':'contract';
 cleaningVisitOptions();dialog.showModal();
}
function cleaningVisitOptions(){
 const model=OvergreenCleaning,s=stores.find(x=>x.id===$('cleaningVisitStore').value),date=$('cleaningVisitDay').value||today(),mode=$('cleaningVisitMode').value,existing=!!$('cleaningExistingId').value;
 const active=model.active(s||{},date),slots=model.slots(cleaningRows(),s?.id,date.slice(0,4));
 $('cleaningSlotInfo').textContent=`${active?'Ordinarie attive':'Ordinarie non attive in questa data'} · D/2: ${slots.used} eseguite, ${slots.reserved} prenotate, ${slots.free} disponibili nel ${date.slice(0,4)}.`;
 $('cleaningRequestMatchWrap').hidden=mode!=='request';
 const codes=existing||mode!=='contract'?[]:Object.keys(model.catalog);
 const due=new Set(model.due(s||{},cleaningRows(),date).filter(x=>x.due).map(x=>x.code));
 $('cleaningVisitCodes').innerHTML=codes.map(code=>`<label class="cleaning-choice"><input type="checkbox" value="${code}" ${!active||(code==='D/2'&&!slots.free)?'disabled':''} ${due.has(code)&&code!=='D/2'?'checked':''}><span><strong>${code} · ${esc(model.catalog[code].label)}</strong><small>${model.catalog[code].frequency}</small></span></label>`).join('');
 $('cleaningRequestOutcome').textContent=mode==='request'?($('cleaningRequestMatch').checked&&active&&slots.free?'Sarà classificato D/2 e prenoterà una semestrale.':'Sarà un Target a ore, senza consumare semestrali.'):mode==='target'?'Target a ore: non consuma semestrali.':'';
}
async function cleaningSaveVisit(event){
 event.preventDefault();if(!admin())return;
 return withFormBusy('cleaningEditForm',async()=>{
  const model=OvergreenCleaning,storeId=$('cleaningVisitStore').value,s=stores.find(x=>x.id===storeId),date=$('cleaningVisitDay').value,mode=$('cleaningVisitMode').value;
  let codes=[...$('cleaningVisitCodes').querySelectorAll('input:checked')].map(x=>x.value);
  if(mode==='target')codes=['TARGET'];
  if(mode==='request')codes=$('cleaningRequestMatch').checked&&model.active(s||{},date)&&model.slots(cleaningRows(),storeId,date.slice(0,4)).free?['D/2']:['TARGET'];
  if(!codes.length)throw Error('Seleziona almeno una lavorazione.');
  const result=await sb.rpc('overgreen_cleaning_create_v308',{p_id:$('cleaningVisitId').value,p_store:storeId,p_day:date,p_codes:codes,p_description:$('cleaningVisitNote').value.trim()||null,p_existing:$('cleaningExistingId').value||null});
  if(result.error)throw result.error;
  $('cleaningEditDialog').close();await loadAll();toast(codes.includes('TARGET')?'Target a ore salvato':'Visita pulizie salvata');
  const row=extras.find(x=>x.id===result.data.id);if(row&&!extraIsScheduled(row))openProgramExtraDialog(row);
 });
}
function cleaningContractOpen(id=''){
 if(!admin())return;
 $('cleaningContractStore').innerHTML=stores.filter(s=>clientType(s)==='eurospin').sort((a,b)=>a.nome.localeCompare(b.nome,'it')).map(s=>`<option value="${esc(s.id)}">${esc(s.nome)}</option>`).join('');
 if(id)$('cleaningContractStore').value=id;cleaningContractFill();$('cleaningContractDialog').showModal();
}
function cleaningContractFill(){const s=stores.find(x=>x.id===$('cleaningContractStore').value);$('cleaningContractActive').checked=!!s?.cleaning_enabled;$('cleaningContractStart').value=s?.cleaning_start||today();$('cleaningContractEnd').value=s?.cleaning_end||''}
async function cleaningContractSave(ev){ev.preventDefault();if(!admin())return;return withFormBusy('cleaningContractForm',async()=>{
 const id=$('cleaningContractStore').value,enabled=$('cleaningContractActive').checked,start=$('cleaningContractStart').value,end=$('cleaningContractEnd').value||null;
 if(enabled&&!start)throw Error('Indica la data di inizio affidamento.');
 if(end&&end<start)throw Error('La fine deve essere successiva all’inizio.');
 const r=await sb.from('stores').update({cleaning_enabled:enabled,cleaning_start:start||null,cleaning_end:end}).eq('id',id).select('id').single();if(r.error)throw r.error;
 $('cleaningContractDialog').close();await loadAll();toast('Affidamento pulizie aggiornato');
})}
function renderCleaning(){
 const root=$('cleaningContent');if(!root)return;
 if(!admin()&&['due','sites'].includes(cleaningTab))cleaningTab='work';
 $('cleaningAdminActions').hidden=!admin();
 document.querySelectorAll('[data-cleaning-tab]').forEach(b=>b.classList.toggle('active',b.dataset.cleaningTab===cleaningTab));
 $('cleaningMonth').hidden=cleaningTab!=='history';
 if(cleaningTab==='sites'&&admin()&&typeof renderCleaningAffidamenti==='function'){renderCleaningAffidamenti();return;}
 const model=OvergreenCleaning,rows=cleaningRows(),q=cleaningSearch.toLocaleLowerCase('it');
 const sites=stores.filter(s=>clientType(s)==='eurospin'&&(!cleaningStoreFilter||s.id===cleaningStoreFilter)&&(!q||[s.nome,s.citta,s.indirizzo].join(' ').toLocaleLowerCase('it').includes(q)));
 root.replaceChildren();
 if(cleaningTab==='due'||cleaningTab==='sites'){
  if(!admin()){root.textContent='Le scadenze e gli affidamenti sono gestiti dall’amministratore. Trovi i tuoi lavori nella Dashboard.';return;}
  for(const s of sites.filter(s=>cleaningTab==='sites'||model.active(s,today()))){
   const due=model.due(s,rows,today()),slot=model.slots(rows,s.id,today().slice(0,4)),card=document.createElement('article');card.className='card';
   card.innerHTML=`<h3>${esc(s.nome)}</h3><p>${s.cleaning_enabled?'Ordinarie affidate dal '+fmt(s.cleaning_start)+(s.cleaning_end?' al '+fmt(s.cleaning_end):''):'Solo interventi a richiesta'}</p><p>D/2 ${today().slice(0,4)} · ${slot.used}/2 eseguite · ${slot.reserved} prenotate · ${slot.free} disponibili</p><div class="cleaning-due">${due.map(x=>`<p><strong>${x.code}</strong> ${esc(model.catalog[x.code].label)} <span>${x.pending?'Già in lavorazione / programmata':x.due?'Da fare · '+fmt(x.next):'Prossima: '+fmt(x.next)}</span></p>`).join('')}</div><div class="actions"><button data-new>Nuova visita</button><button class="secondary" data-contract>Affidamento</button><button class="secondary" data-history>Storico</button></div>`;
   card.querySelector('[data-new]').textContent='Programma pulizia';card.querySelector('[data-new]').onclick=()=>{switchService('pulizie');setView('schedule');schedulePickerSelected.add(s.id);renderSchedulePicker()};card.querySelector('[data-contract]').onclick=()=>cleaningContractOpen(s.id);card.querySelector('[data-history]').onclick=()=>{cleaningStoreFilter=s.id;cleaningTab='history';renderCleaning()};root.appendChild(card);
  }
 }else{
  const ids=new Set(sites.map(s=>s.id));
  const shown=rows.filter(e=>ids.has(e.store_id)||(!e.store_id&&!cleaningStoreFilter&&!q)).filter(e=>cleaningTab==='history'?['completato','annullato'].includes(e.stato)&&(!cleaningMonth||String(model.day(e)||e.closed_at||'').startsWith(cleaningMonth)):!['completato','annullato'].includes(e.stato)).sort((a,b)=>String(model.day(b)||'').localeCompare(String(model.day(a)||'')));
  for(const e of shown){const card=extraCard(e);const label=document.createElement('p');label.className='cleaning-summary';label.textContent=(e.cleaning_done_codes||e.cleaning_codes)?.join(' + ')||'Target · da classificare se pertinente';card.prepend(label);
   if(admin()&&!e.cleaning_codes&&!['completato','annullato','in_attesa'].includes(e.stato)&&e.store_id){const b=document.createElement('button');b.className='secondary';b.textContent='Classifica D/2 o Target';b.onclick=()=>cleaningOpen(e.store_id,e.id);card.querySelector('.actions').appendChild(b)}
   root.appendChild(card);
  }
 }
 if(!root.children.length&&!root.textContent)root.innerHTML='<p class="muted">Nessun risultato. Attiva le pulizie nei soli punti vendita affidati dalla scheda Affidamenti.</p>';
 $('cleaningResetStore').hidden=!cleaningStoreFilter;
}
async function exportCleaning(){
 if(!admin())return;try{
  await loadAll();await ensureLibraries('ExcelJS');const month=$('cleaningMonth').value||today().slice(0,7),book=new ExcelJS.Workbook(),model=OvergreenCleaning;
  const visits=cleaningRows().filter(e=>model.contract(e)&&e.stato==='completato'&&String(model.day(e)||'').startsWith(month));
  const ws=book.addWorksheet('Ordinarie e semestrali');ws.columns=[{header:'PV',width:32},{header:'Data',width:16},{header:'Lavorazioni',width:28},{header:'Semestrale',width:16},{header:'Note',width:45}];
  for(const e of visits)ws.addRow([stores.find(s=>s.id===e.store_id)?.nome,model.day(e),model.codes(e).join(' + '),e.cleaning_slot?'D/2 '+e.cleaning_slot+'/2':'Canone ordinario',e.note_lorenzo||'']);
  const totals=book.addWorksheet('Riepilogo contrattuale');totals.columns=[{header:'PV',width:32},{header:'Mese',width:14},{header:'Visite ordinarie convalidate',width:25},{header:'D/2 convalidate',width:20},{header:'Canone mese da compilare',width:26},{header:'Prezzo D/2 da compilare',width:24},{header:'Totale contrattuale',width:22}];
  const ids=[...new Set(visits.map(e=>e.store_id))];
  for(const id of ids){const list=visits.filter(e=>e.store_id===id),r=totals.addRow([stores.find(s=>s.id===id)?.nome,month,list.filter(e=>model.codes(e).some(c=>c!=='D/2')).length,list.filter(e=>model.codes(e).includes('D/2')).length,null,null,null]);r.getCell(7).value={formula:`IF(AND(ISNUMBER(E${r.number}),OR(D${r.number}=0,ISNUMBER(F${r.number}))),E${r.number}+D${r.number}*F${r.number},"")`}}
  const targetRows=OvergreenEconomics.filterRows(cleaningRows(),extraEconomicsRecords,attachments,{month,category:'pulizie',mode:'',state:''});
  if(targetRows.length){addEconomicsWorksheet(book,targetRows,month);book.worksheets.at(-1).name='Target a ore'}
  for(const sheet of book.worksheets){sheet.getRow(1).font={bold:true};sheet.views=[{state:'frozen',ySplit:1}];}
  const blob=new Blob([await book.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Overgreen-Pulizie-${month}.xlsx`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
 }catch(e){alert('Esportazione non riuscita: '+e.message)}
}
$('cleaningNew').onclick=()=>{switchService('pulizie');setView('schedule')};$('cleaningContractNew').onclick=()=>cleaningContractOpen();$('cleaningExport').onclick=exportCleaning;
$('cleaningEditForm').onsubmit=cleaningSaveVisit;$('cleaningContractForm').onsubmit=cleaningContractSave;$('cleaningContractStore').onchange=cleaningContractFill;
for(const id of ['cleaningVisitStore','cleaningVisitDay','cleaningVisitMode','cleaningRequestMatch'])$(id).onchange=cleaningVisitOptions;
$('cleaningSearch').oninput=e=>{cleaningSearch=e.target.value;renderCleaning()};$('cleaningMonth').value=today().slice(0,7);$('cleaningMonth').onchange=e=>{cleaningMonth=e.target.value;renderCleaning()};
$('cleaningResetStore').onclick=()=>{cleaningStoreFilter='';renderCleaning()};
document.querySelectorAll('[data-cleaning-tab]').forEach(b=>b.onclick=()=>{cleaningTab=b.dataset.cleaningTab;if(cleaningTab==='history')cleaningMonth=$('cleaningMonth').value;renderCleaning()});
