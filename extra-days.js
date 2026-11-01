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
  for(const day of days){
   const card=document.createElement('article');card.className='card';
   card.innerHTML=`<h3>${esc(fmt(day.day))} · ${day.final?'Giornata conclusiva':'Da continuare'}</h3><p>${esc(day.workers.map(id=>profiles.find(p=>p.id===id)?.nome||'Operatore').join(', '))}</p><p style="white-space:pre-wrap">${esc(day.notes||'Nessuna nota')}</p><p>${day.attachments.filter(a=>a.tipo==='foto_generica').length} foto · ${day.attachments.filter(a=>a.tipo!=='foto_generica').length} documenti</p><div class="actions"></div>`;
   const actions=card.querySelector('.actions');
   const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await fn()}catch(e){alert(e.message)}finally{b.disabled=false}};actions.appendChild(b)};
   button('PDF giornata',()=>generateExtraDayReport(extra,day,false));
   if(admin()){
    const calc=day.economics&&window.OvergreenEconomics.calculate(day.economics),line=document.createElement('p');line.textContent=calc?`Economia: ${window.OvergreenEconomics.money(calc.total)}${!calc.complete?' · da completare':''}`:'Economia da compilare';actions.before(line);
    if(window.OvergreenEconomics.isBillableExtra(extra)){
     button('Economia giornata',()=>{dialog.onclose=null;dialog.close();return openExtraHours(extra,{day,onClose:()=>openExtraDays(extra,options)})});
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
