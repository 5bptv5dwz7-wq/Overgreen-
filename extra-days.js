/* A work-day snapshot survives replacement of the target's active reports. */
function appendExtraDaysButton(card,extra){
 if(extra.cleaning_codes?.length&&!extra.cleaning_codes.includes('TARGET'))return;
 const actions=card.querySelector('.actions');if(!actions)return;
 const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Giornate · rapportini';
 button.onclick=()=>openExtraDays(extra);actions.appendChild(button);
}
async function readExtraDays(extraId){
 const r=await sb.from('extra_work_days').select('*').eq('extra_id',extraId).order('day').order('created_at');if(r.error)throw r.error;
 let economics=[];
 if(admin()&&r.data.length){const e=await sb.from('extra_day_economics').select('*').in('day_id',r.data.map(d=>d.id));if(e.error)throw e.error;economics=e.data;}
 return r.data.map(d=>({...d,economics:economics.find(e=>e.day_id===d.id)?.record||null}));
}
async function openExtraDays(extra,options={}){
 let dialog=$('extraDaysDialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='extraDaysDialog';dialog.className='wide-dialog';document.body.appendChild(dialog)}
 dialog.innerHTML='<div class="dialog-body"><div class="dialog-head"><h2>Giornate del lavoro</h2><button type="button" class="secondary" data-close-days>Chiudi</button></div><p data-context></p><div data-days>Caricamento…</div></div>';
 dialog.onclose=()=>{if(admin()){if(options.onClose)void options.onClose();else if(options.returnToEconomics)restoreExtraEconomicsBook()}};
 dialog.querySelector('[data-close-days]').onclick=()=>dialog.close();dialog.querySelector('[data-context]').textContent=[extra.numero_target?'Target '+extra.numero_target:extra.titolo,stores.find(s=>s.id===extra.store_id)?.nome||extra.nome_esterno].filter(Boolean).join(' · ');
 dialog.dataset.extraId=extra.id;if(!dialog.open)dialog.showModal();const scope=attachmentMediaScope();
 try{
  const days=await readExtraDays(extra.id);if(!dialog.open||dialog.dataset.extraId!==extra.id||scope!==attachmentMediaScope())return;
  const box=dialog.querySelector('[data-days]');box.replaceChildren();
  if(!days.length){box.textContent='Nessuna giornata registrata. Le chiusure precedenti a questo aggiornamento restano nella scheda del target.';return}
  if(admin()){
   const complete=days.filter(d=>d.economics&&window.OvergreenEconomics.review(d.economics,{...extra,night_hours:d.night_hours},(d.attachments||[]).find(a=>a.tipo==='rapportino_eurospin')).ready);
   const total=complete.reduce((n,d)=>n+window.OvergreenEconomics.calculate(d.economics).total,0),summary=document.createElement('p');
   summary.textContent=`Totale giornate compilate: ${window.OvergreenEconomics.money(total)} · ${complete.length}/${days.length} · IVA esclusa. Il totale del target, i PDF e gli Excel usano queste giornate una sola volta. Completa tutte le giornate per includere il target nei totali fatturabili.`;box.appendChild(summary);
  }
  const economic=options.returnToEconomics===true;
  function editEconomics(index){
   const day=days[index],next=index+1<days.length;
   dialog.onclose=null;if(dialog.open)dialog.close();
   return ExtraHoursUi.open(extra,{day,nextDay:next,onSaved:next?()=>editEconomics(index+1):null,onClose:()=>openExtraDays(extra,options)});
  }
  for(const day of days){
   const card=document.createElement('article');card.className='card';
   card.innerHTML=`<h3>${esc(fmt(day.day))} · ${day.final?'Giornata conclusiva':'Da continuare'}</h3><p>${esc(day.workers.map(id=>profiles.find(p=>p.id===id)?.nome||'Operatore').join(', '))}</p><p style="white-space:pre-wrap">${esc(day.notes||'Nessuna nota')}</p><p>${day.attachments.filter(a=>a.tipo==='foto_generica').length} foto · ${day.attachments.filter(a=>a.tipo!=='foto_generica').length} documenti</p><div class="actions"></div>`;
   const actions=card.querySelector('.actions');
   const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await fn()}catch(e){alert(e.message)}finally{b.disabled=false}};actions.appendChild(b)};
   button('PDF giornata',()=>generateExtraDayReport(extra,day,false));
   if(admin()){
    if(!economic)button('Modifica giornata',()=>editSavedExtraDay(extra,day,()=>openExtraDays(extra,options)));
    const calc=day.economics&&window.OvergreenEconomics.calculate(day.economics),line=document.createElement('p');line.textContent=calc?`Economia: ${window.OvergreenEconomics.money(calc.total)}${!calc.complete?' · da completare':''}`:'Economia da compilare';actions.before(line);
    if(window.OvergreenEconomics.isBillableExtra(extra)){
     if(economic)button('Economia giornata',()=>editEconomics(days.indexOf(day)));
     button('PDF con economia',()=>generateExtraDayReport(extra,day,true));
    }
   }
   for(const a of day.attachments)button(a.tipo==='foto_generica'?'Apri foto':attachmentLabel(a),()=>openAttachment(a));
   box.appendChild(card);
  }
 }catch(error){if(dialog.open&&dialog.dataset.extraId===extra.id)dialog.querySelector('[data-days]').textContent='Caricamento non riuscito: '+error.message}
}
async function generateExtraDayReport(extra,day,withEconomics){
 const scope=attachmentMediaScope();if(withEconomics&&!admin())throw Error('Accesso ai dati economici non consentito');
 const fresh=(await readExtraDays(extra.id)).find(d=>d.id===day.id);if(!fresh)throw Error('Giornata non disponibile');day=fresh;
 const dailyExtra={...extra,giorno_intervento:day.day,night_hours:day.night_hours};
 const report=(day.attachments||[]).find(a=>a.tipo==='rapportino_eurospin')||null;
 if(withEconomics&&(!day.economics||!window.OvergreenEconomics.review(day.economics,dailyExtra,report).ready))throw Error('Completa e salva l’economia di questa giornata prima di generare il PDF con gli importi.');
 const base=await buildSingleClientReportFile('extra',extra,day);
 await ensureLibraries('PDFLib');
 const pdf=await PDFLib.PDFDocument.load(await base.file.arrayBuffer());
 for(const attachment of day.attachments||[]){
  if(attachment.tipo==='foto_generica')continue;
  try{await appendAttachmentForPackage(pdf,attachment)}catch(error){throw Error('Allegato della giornata non leggibile: '+(attachment.nome_file||attachment.id)+'. '+error.message)}
 }
 if(withEconomics)await appendExtraEconomicsPdf(pdf,dailyExtra,day.economics,report);
 if(scope!==attachmentMediaScope()||(withEconomics&&!admin()))throw Error('Sessione cambiata. Riprova.');
 const fileName=`Rapportino ${day.day} - ${String(extra.numero_target||extra.titolo||'extra').replace(/[^a-zA-Z0-9 -]/g,'-')}${withEconomics?' - economia':''}.pdf`;
 const file=new File([await pdf.save()],fileName,{type:'application/pdf'});
 await shareClientReportData({file,fileName,title:fileName,sizeKb:Math.ceil(file.size/1024)});
}

// Complete reports read fresh daily snapshots, including superseded daily attachments.
async function appendExtraDayDetails(pdf,extra,days){
 const included=new Set(),key=a=>a.id||a.storage_path;
 for(const day of days){
  const report=await buildSingleClientReportFile('extra',extra,day);
  const part=await PDFLib.PDFDocument.load(await report.file.arrayBuffer());
  const pages=await pdf.copyPages(part,part.getPageIndices());
  pages.forEach(page=>pdf.addPage(page));
  for(const attachment of day.attachments||[]){
   if(attachment.tipo==='foto_generica'){included.add(key(attachment));continue;}
   if(included.has(key(attachment)))continue;
   try{await appendAttachmentForPackage(pdf,attachment);included.add(key(attachment))}
   catch(error){throw Error('Allegato del '+fmt(day.day)+' non incluso: '+(attachment.nome_file||attachment.id)+'. '+error.message)}
  }
 }
 return included;
}

function editSavedExtraDay(extra,day,afterSave){
 if(!admin())return;
 const dialog=document.createElement('dialog');
 dialog.className='wide-dialog';
 dialog.innerHTML='<form><div class="dialog-head"><h2>Modifica giornata</h2></div><label>Data del passaggio<input name="day" type="date" required></label><fieldset data-workers><legend>Operatori</legend></fieldset><label>Note<textarea name="notes" maxlength="20000"></textarea></label><fieldset data-files><legend>Allegati da mantenere</legend></fieldset><label>Aggiungi foto<input name="photos" type="file" accept="image/*" multiple></label><label>Sostituisci rapportino Eurospin<input name="eurospin" type="file" accept="image/*,application/pdf"></label><label>Sostituisci rapportino Overgreen<input name="overgreen" type="file" accept="image/*,application/pdf"></label><p role="status"></p><div class="actions"><button type="button">Annulla</button><button type="submit">Salva giornata</button></div></form>';
 const form=dialog.querySelector('form'),fields=form.elements,status=form.querySelector('[role=status]');
 fields.day.value=day.day;fields.notes.value=day.notes||'';
 function check(group,name,value,label,selected){
  const row=document.createElement('label'),input=document.createElement('input');
  input.type='checkbox';input.name=name;input.value=value;input.checked=selected;
  row.append(input,document.createTextNode(label));form.querySelector(group).append(row);
 }
 for(const id of new Set([...day.workers,...profiles.filter(p=>p.attivo).map(p=>p.id)]))
  check('[data-workers]','worker',id,profiles.find(p=>p.id===id)?.nome||'Operatore',day.workers.includes(id));
 for(const a of day.attachments)check('[data-files]','keep',a.id,a.nome_file||attachmentLabel(a),true);
 const staged=new Map(),scope=attachmentMediaScope();let busy=false;
 dialog.oncancel=e=>{if(busy)e.preventDefault()};dialog.onclose=()=>dialog.remove();form.querySelector('button').onclick=()=>dialog.close();
 form.onsubmit=async event=>{
  event.preventDefault();if(busy||!admin()||scope!==attachmentMediaScope())return;
  const data=new FormData(form),workers=data.getAll('worker');
  if(!workers.length){status.textContent='Seleziona almeno un operatore.';return}
  busy=true;form.inert=true;status.textContent='Salvataggio…';
  try{
   const added=[],replaced=new Set();
   for(const [tipo,files] of [['foto_generica',fields.photos.files],['rapportino_eurospin',fields.eurospin.files],['rapportino_overgreen',fields.overgreen.files]]){
    for(const original of files){
     let entry=staged.get(original);
     if(!entry){
      const file=original.type.startsWith('image/')?await compressImage(original):original;
      const id=crypto.randomUUID(),name=file.name||original.name;
      const path='extra/'+extra.id+'/'+id+'-'+name.replace(/[^a-zA-Z0-9._-]/g,'-');
      await uploadFile(path,file);
      entry={id,tipo,storage_path:path,nome_file:name,mime_type:file.type,dimensione_bytes:file.size};staged.set(original,entry);
     }
     added.push(entry);if(tipo!=='foto_generica')replaced.add(tipo);
    }
   }
   if(!admin()||scope!==attachmentMediaScope())throw Error('Sessione cambiata. Riapri la giornata.');
   const keep=data.getAll('keep').filter(id=>!replaced.has(day.attachments.find(a=>a.id===id)?.tipo));
   const {error}=await sb.rpc('edit_extra_day_v326',{p_id:day.id,p_revision:day.revision,p_day:fields.day.value,p_notes:fields.notes.value,p_workers:workers,p_keep:keep,p_new:added});
   if(error)throw error;
   dialog.close();toast('Giornata aggiornata');await afterSave();await loadAll();
  }catch(error){status.textContent=error.message||'Salvataggio non riuscito.'}
  finally{busy=false;form.inert=false}
 };
 document.body.append(dialog);dialog.showModal();
}
