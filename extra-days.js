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
async function openExtraDays(extra){
 let dialog=$('extraDaysDialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='extraDaysDialog';dialog.className='wide-dialog';document.body.appendChild(dialog)}
 dialog.innerHTML='<div class="dialog-body"><div class="dialog-head"><h2>Giornate del lavoro</h2><button type="button" class="secondary" data-close-days>Chiudi</button></div><p data-context></p><div data-days>Caricamento…</div></div>';
 dialog.querySelector('[data-close-days]').onclick=()=>dialog.close();dialog.querySelector('[data-context]').textContent=[extra.numero_target?'Target '+extra.numero_target:extra.titolo,stores.find(s=>s.id===extra.store_id)?.nome||extra.nome_esterno].filter(Boolean).join(' · ');
 dialog.dataset.extraId=extra.id;if(!dialog.open)dialog.showModal();const scope=attachmentMediaScope();
 try{
  const days=await readExtraDays(extra.id);if(!dialog.open||dialog.dataset.extraId!==extra.id||scope!==attachmentMediaScope())return;
  const box=dialog.querySelector('[data-days]');box.replaceChildren();
  if(!days.length){box.textContent='Nessuna giornata registrata. Le chiusure precedenti a questo aggiornamento restano nella scheda del target.';return}
  if(admin()){
   const complete=days.filter(d=>d.economics&&window.OvergreenEconomics.review(d.economics,{...extra,night_hours:d.night_hours},(d.attachments||[]).find(a=>a.tipo==='rapportino_eurospin')).ready);
   const total=complete.reduce((n,d)=>n+window.OvergreenEconomics.calculate(d.economics).total,0),summary=document.createElement('p');
   summary.textContent=`Totale giornate compilate: ${window.OvergreenEconomics.money(total)} · ${complete.length}/${days.length} · IVA esclusa. Il riepilogo mensile usa l’economia complessiva del target: questi importi giornalieri non vengono aggiunti una seconda volta.`;box.appendChild(summary);
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
     button('Economia giornata',()=>{dialog.close();return openExtraHours(extra,{day,onClose:()=>openExtraDays(extra)})});
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
 // Fresh values: never export a stale financial card after another session saved.
 const fresh=(await readExtraDays(extra.id)).find(d=>d.id===day.id);if(!fresh)throw Error('Giornata non disponibile');day=fresh;
 const dailyExtra={...extra,giorno_intervento:day.day,night_hours:day.night_hours,titolo:`${extra.titolo} · ${fmt(day.day)}`};
 const report=day.attachments.find(a=>a.tipo==='rapportino_eurospin')||null;
 if(withEconomics&&(!day.economics||!window.OvergreenEconomics.review(day.economics,dailyExtra,report).ready))throw Error('Completa e salva l’economia di questa giornata prima di generare il PDF con gli importi.');
 await ensureLibraries('PDFLib');const {PDFDocument,StandardFonts,rgb}=PDFLib,pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);let page,y;
 const newPage=()=>{page=pdf.addPage([595.28,841.89]);y=790};
 const text=(value,size=11,strong=false)=>{for(const line of wrapPdfText(pdfSafeText(value),strong?bold:font,size,499)){if(y<60)newPage();page.drawText(line,{x:48,y,size,font:strong?bold:font,color:rgb(.08,.23,.16)});y-=size+6}y-=8};
 newPage();text('OVERGREEN · RAPPORTINO GIORNALIERO',18,true);text(`Data: ${fmt(day.day)}`,13,true);
 text([stores.find(s=>s.id===extra.store_id)?.nome||extra.nome_esterno,extra.numero_target?'Target '+extra.numero_target:null,extra.titolo].filter(Boolean).join(' · '),12,true);
 text(day.final?'Giornata conclusiva del lavoro':'Avanzamento parziale · target da continuare');
 text('Operatori: '+(day.workers.map(id=>profiles.find(p=>p.id===id)?.nome||'Operatore').join(', ')||'Non indicati'));
 text('Lavorazioni e note',12,true);for(const line of (day.notes||'Nessuna nota').split('\n'))text(line);
 for(const a of day.attachments){try{await appendAttachmentForPackage(pdf,a)}catch(error){throw Error('Allegato della giornata non leggibile: '+(a.nome_file||a.id)+'. '+error.message)}}
 if(withEconomics)await appendExtraEconomicsPdf(pdf,dailyExtra,day.economics,report);
 if(scope!==attachmentMediaScope()||(withEconomics&&!admin()))throw Error('Sessione cambiata. Riprova.');
 const fileName=`Rapportino ${day.day} - ${String(extra.numero_target||extra.titolo||'extra').replace(/[^a-zA-Z0-9 -]/g,'-')}${withEconomics?' - economia':''}.pdf`;
 const file=new File([await pdf.save()],fileName,{type:'application/pdf'});await shareClientReportData({file,fileName,title:fileName,sizeKb:Math.ceil(file.size/1024)});
}
