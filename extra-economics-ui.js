/* Admin-only saved summaries and monthly Excel; no financial data in worker views. */
let extraEconomicsRecords=[],extraEconomicsError='',extraEconomicsBookRows=[];
async function loadExtraEconomics(){
  if(!admin()){extraEconomicsRecords=[];extraEconomicsError='';return false}
  try{
    const r=await readAllRows('extra_labor_hours',q=>q,['extra_id']);if(!admin())return false;if(r.error)throw r.error;
    extraEconomicsRecords=r.data||[];extraEconomicsError='';return true;
  }catch(error){extraEconomicsRecords=[];extraEconomicsError='Dati economici non caricati. Premi Aggiorna per riprovare.';return false}
}
function syncExtraEconomicsRole(){
  if(admin())return;extraEconomicsRecords=[];extraEconomicsBookRows=[];
  document.getElementById('extraEconomicsBook')?.close();
  for(const id of ['extraEconomicsBookList','extraEconomicsBookSummary'])document.getElementById(id)?.replaceChildren();
}
function rememberExtraEconomics(row,report){
  if(!admin())return;
  extraEconomicsRecords=extraEconomicsRecords.filter(r=>r.extra_id!==row.extra_id).concat(row);extraEconomicsError='';
  if(report!==undefined){attachments=attachments.filter(a=>a.extra_id!==row.extra_id||a.tipo!=='rapportino_eurospin');if(report)attachments.push(report)}
  const e=extras.find(x=>x.id===row.extra_id);if(e&&row.pricing_category){e.categoria_target=row.pricing_category;e.night_hours=row.night_hours??0;}
  if(typeof renderExtras==='function')renderExtras();
}
function latestEconomicsReport(extraId){return attachments.filter(a=>a.extra_id===extraId&&a.tipo==='rapportino_eurospin').sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))||String(b.id).localeCompare(String(a.id)))[0]}
function economicsStatus(calc,row){
  if(calc.issues?.length)return calc.issues.join(' · ');
  if(!calc.complete)return 'Da completare: '+calc.missing.join(', ');
  if(calc.quotePending)return 'Preventivo '+(window.OvergreenEconomics.quoteStates[row.quote_status]||'da verificare').toLowerCase();
  return 'Dati completi';
}
function appendExtraEconomicsSummary(card,extra){
  if(!admin()||!window.OvergreenEconomics.isBillableExtra(extra))return;const model=window.OvergreenEconomics,row=extraEconomicsRecords.find(r=>r.extra_id===extra.id),box=document.createElement('div');box.className='extra-economic-card';
  if(extraEconomicsError)box.textContent=extraEconomicsError;
  else if(!row?.pricing_mode)box.textContent='Economia da compilare'+(row?.total_hours!=null?' · '+String(row.total_hours).replace('.',',')+' ore inserite':'');
  else{const c=model.review(row,extra,latestEconomicsReport(extra.id));box.innerHTML=`<strong>${esc(model.modes[row.pricing_mode])} · ${esc(model.money(c.total))}</strong><small>${esc(economicsStatus(c,row))} · IVA esclusa</small>`}
  const invoice=model.cleaningInvoiceLabel(row,extra.categoria_target||row?.pricing_category);if(invoice){const label=document.createElement('small');label.textContent=invoice;box.appendChild(label)}
  card.querySelector('.actions').before(box);
}
function economicsBookFilter(){return {month:$('extraEconomicsMonth').value,category:$('extraEconomicsBookCategory').value,mode:$('extraEconomicsBookMode').value,state:$('extraEconomicsBookState').value}}
function populateEconomicsPeriods(){
  const model=window.OvergreenEconomics,select=$('extraEconomicsMonth');
  const value=select.value||select.dataset.initialPeriod||'';delete select.dataset.initialPeriod;
  const periods=new Set(model.filterRows(extras,[],[]).map(x=>model.period(x.extra)));
  if(value)periods.add(value);
  select.replaceChildren();
  for(const period of ['', 'open', ...[...periods].filter(p=>!['open','undated'].includes(p)).sort().reverse(), ...(periods.has('undated')?['undated']:[])]){
    const option=document.createElement('option');option.value=period;option.textContent=model.periodLabel(period);select.appendChild(option);
  }
  select.value=value;
}
function renderExtraEconomicsBook(){
  if(!admin())return;const model=window.OvergreenEconomics,list=$('extraEconomicsBookList');list.replaceChildren();
  $('extraEconomicsBookExport').disabled=!!extraEconomicsError;
  if(extraEconomicsError){$('extraEconomicsBookStatus').textContent=extraEconomicsError;$('extraEconomicsBookSummary').replaceChildren();extraEconomicsBookRows=[];return}
  populateEconomicsPeriods();
  extraEconomicsBookRows=model.filterRows(extras,extraEconomicsRecords,attachments,economicsBookFilter());
  const ready=extraEconomicsBookRows.filter(x=>x.calc.ready),total=ready.reduce((sum,x)=>sum+x.calc.total,0),incomplete=extraEconomicsBookRows.length-ready.length;
  $('extraEconomicsBookSummary').innerHTML=`<div><strong>${esc(model.money(total))}</strong><span>Totale di ${ready.length} extra con dati completi</span></div><div><strong>${incomplete}</strong><span>Da completare, verificare o approvare</span></div>`;
  $('extraEconomicsBookStatus').textContent=extraEconomicsBookRows.length?`${extraEconomicsBookRows.length} extra · preventivi non accettati e voci da verificare esclusi dal totale complessivo.`:'Nessun extra in questa categoria. Seleziona Tutti per vedere tutti gli extra.';
  $('extraEconomicsBookExport').disabled=!extraEconomicsBookRows.length;
  for(const x of extraEconomicsBookRows){const st=stores.find(s=>s.id===x.extra.store_id),article=document.createElement('article');article.className='economic-book-row';
    article.innerHTML=`<div><strong>${esc(st?.nome||x.extra.nome_esterno||'Extra')} · ${esc(x.extra.numero_target||'Target non indicato')}</strong><p>${esc(x.extra.titolo||'')}</p><small>${esc(model.periodLabel(model.period(x.extra)))}${model.closureDate(x.extra)?' · Chiusura '+esc(model.closureDate(x.extra).split('-').reverse().join('/')):''} · ${esc(model.modes[x.row.pricing_mode]||'Modalità da scegliere')} · ${esc(economicsStatus(x.calc,x.row))}</small>${x.extra.categoria_target==='pulizie'?`<p><strong>${esc(model.cleaningInvoiceLabel(x.row,'pulizie'))}</strong></p>`:''}</div><div><strong>${esc(model.money(x.calc.total))}</strong><button type="button" class="secondary">Apri</button></div>`;
    article.querySelector('button').onclick=()=>{$('extraEconomicsBook').close();void openExtraHours(x.extra,{returnToEconomics:true})};list.appendChild(article);
  }
}
async function refreshExtraEconomicsBook(){
  if(!admin())return;const b=$('extraEconomicsBookRefresh');b.disabled=true;$('extraEconomicsBookExport').disabled=true;$('extraEconomicsBookStatus').textContent='Aggiornamento…';
  try{await loadAll();if(admin())renderExtraEconomicsBook()}catch(error){extraEconomicsError='Aggiornamento non riuscito. Riprova prima di esportare.';if(admin())renderExtraEconomicsBook()}
  finally{b.disabled=false}
}
function restoreExtraEconomicsBook(){
  if(!admin())return;
  const dialog=$('extraEconomicsBook');
  if(!dialog.open)dialog.showModal();
  renderExtraEconomicsBook();
}
function openExtraEconomicsBook(){
  if(!admin())return;const dialog=$('extraEconomicsBook');
  if(!dialog.dataset.bound){dialog.dataset.bound='true';$('extraEconomicsMonth').dataset.initialPeriod=today().slice(0,7);
    for(const id of ['extraEconomicsMonth','extraEconomicsBookCategory','extraEconomicsBookMode','extraEconomicsBookState'])$(id).onchange=renderExtraEconomicsBook;
    $('extraEconomicsBookClose').onclick=()=>dialog.close();$('extraEconomicsBookRefresh').onclick=refreshExtraEconomicsBook;$('extraEconomicsBookExport').onclick=exportExtraEconomics;
  }
  dialog.showModal();renderExtraEconomicsBook();void refreshExtraEconomicsBook();
}
function addEconomicsWorksheet(workbook,rows){
  const model=window.OvergreenEconomics,ws=workbook.addWorksheet('Foglio1');
  // Eurospin template: preserve the exact 18 columns and their order.
  const headers=['PUNTO VENDITA','DATA RICHIESTA INTERVENTO','DATA INTERVENTO','NUMERO INTERVENTO','NUMERO CHIUSURA INTERVENTO','DESCRIZIONE INTERVENTO','NUMERO TECNICI','USCITA','IMPORTO FORFETTARIO TRASFERTA','N. ORE ORDINARIE','COSTO ORE ORDINARIE ','N. ORE CON CESTELLO','COSTO ORE CON CESTELLO','COSTO TOTALE ORE','TOTALE',"MODALITA'",'TOTALE FATTURATO','NOTE'];
  const widths=[25,16,16,18,20,35,12,10,18,15,16,16,17,16,14,14,17,45];
  ws.columns=widths.map(width=>({width}));
  ws.mergeCells('A1:R1');
  ws.getCell('A1').value='CONSUNTIVO OVERGREEN '+model.periodLabel($('extraEconomicsMonth').value).toUpperCase();
  ws.getRow(1).font={bold:true,size:14};ws.getRow(1).alignment={horizontal:'center',vertical:'middle'};ws.getRow(1).height=24;
  const header=ws.addRow(headers);header.font={bold:true,size:9,color:{argb:'FFFFFFFF'}};header.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2F6B45'}};header.alignment={wrapText:true,vertical:'middle',horizontal:'center'};header.height=48;
  const euros=value=>value==null?null:value/100;
  for(const x of rows){
    const e=x.extra,r=x.row,c=x.calc,st=stores.find(s=>s.id===e.store_id),q=r.pricing_mode==='preventivo',notes=[];
    if(r.economic_notes)notes.push(r.economic_notes);
    if(r.quote_reference)notes.push('Riferimento preventivo: '+r.quote_reference);
    if(q)notes.push('Preventivo: '+(model.quoteStates[r.quote_status]||'da verificare')+(c.exitIncluded?' · trasferta inclusa':''));
    if(c.nightHours>0)notes.push('Ore notturne incluse: '+c.nightHours+' × '+model.money(model.cents(r.night_hourly_rate)));
    if(r.equipment)notes.push('Tariffa con attrezzature');
    if((r.expenses||[]).length)notes.push('Spese: '+r.expenses.map(s=>s.description+': '+model.money(model.cents(s.amount))).join('; '));
    if(c.discount)notes.push('Sconto: '+model.money(c.discount));
    if(!c.ready)notes.push(economicsStatus(c,r)+' · escluso dal totale fatturato');
    if(!x.closureNumber)notes.push('Numero chiusura da verificare');
    if(!['completato','in_attesa'].includes(e.stato))notes.push('Intervento aperto');
    const invoice=model.cleaningInvoiceLabel(r,e.categoria_target||r.pricing_category);if(invoice)notes.push(invoice);
    // Ordinary costs are line amounts, not hourly rates. Equipment is not a basket lift.
    // TOTALE is the hourly comparison; TOTALE FATTURATO uses the selected pricing mode.
    const hourlyTotal=c.labor==null||c.exit==null?null:c.labor+c.exit+c.expenses;
    const row=ws.addRow([(st?.nome||e.nome_esterno||'').toUpperCase(),excelDateValue(extraRequestDate(e)),excelDateValue(e.giorno_intervento||model.closureDate(e)),String(e.numero_target||''),x.closureNumber||'',e.titolo||'',r.operator_count??null,typeof r.dedicated_trip==='boolean'?(r.dedicated_trip?'SI':'NO'):'',euros(c.exit),r.total_hours??null,euros(c.labor),null,null,euros(c.labor),euros(hourlyTotal),({tariffa:'ORE',preventivo:'PREVENTIVO',consuntivo:'CONSUNTIVO'})[r.pricing_mode]||'',c.ready?euros(c.total):null,notes.join(' | ')]);
    for(const col of [2,3])row.getCell(col).numFmt='dd/mm/yyyy';
    for(const col of [9,11,13,14,15,17])row.getCell(col).numFmt='#,##0.00 "€"';
    for(const col of [10,12])row.getCell(col).numFmt='0.00';
    row.alignment={vertical:'top',wrapText:true};
  }
  ws.views=[{state:'frozen',ySplit:2}];ws.autoFilter={from:'A2',to:`R${Math.max(3,rows.length+2)}`};
  return ws;
}
async function exportExtraEconomics(){
 await ensureLibraries('ExcelJS');
  if(!admin())return;if(!window.ExcelJS)return alert('Libreria Excel non disponibile. Aggiorna la pagina.');
  const b=$('extraEconomicsBookExport');if(b.disabled)return;b.disabled=true;
  try{
    await loadAll();if(!admin())return;if(extraEconomicsError)throw new Error(extraEconomicsError);
    const rows=window.OvergreenEconomics.filterRows(extras,extraEconomicsRecords,attachments,economicsBookFilter());if(!rows.length)throw new Error('Nessun extra da esportare.');
    for(let i=0;i<rows.length;i++){
      if(!admin())return;
      $('extraEconomicsBookStatus').textContent=`Lettura numeri chiusura ${i+1}/${rows.length}…`;
      const result=await readClosureNumberFromEurospinFile(rows[i].extra);
      rows[i].closureNumber=result.number||'';
    }
    const workbook=new window.ExcelJS.Workbook();addEconomicsWorksheet(workbook,rows);const buffer=await workbook.xlsx.writeBuffer();if(!admin())return;
    const blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`Overgreen-economia-extra-${$('extraEconomicsMonth').value||'tutti'}.xlsx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    const missing=rows.filter(x=>!x.closureNumber).length;$('extraEconomicsBookStatus').textContent='Excel Eurospin generato.'+(missing?` ${missing} numeri chiusura da verificare, segnalati nelle note.`:'');
  }catch(error){if(admin())$('extraEconomicsBookStatus').textContent=error.message||'Esportazione non riuscita.'}
  finally{if(admin())b.disabled=false}
}



