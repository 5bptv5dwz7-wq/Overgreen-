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
  const e=extras.find(x=>x.id===row.extra_id);if(e&&row.pricing_category)e.categoria_target=row.pricing_category;
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
  if(!admin())return;const model=window.OvergreenEconomics,row=extraEconomicsRecords.find(r=>r.extra_id===extra.id),box=document.createElement('div');box.className='extra-economic-card';
  if(extraEconomicsError)box.textContent=extraEconomicsError;
  else if(!row?.pricing_mode)box.textContent='Economia da compilare'+(row?.total_hours!=null?' · '+String(row.total_hours).replace('.',',')+' ore inserite':'');
  else{const c=model.review(row,extra,latestEconomicsReport(extra.id));box.innerHTML=`<strong>${esc(model.modes[row.pricing_mode])} · ${esc(model.money(c.total))}</strong><small>${esc(economicsStatus(c,row))} · IVA esclusa</small>`}
  card.querySelector('.actions').before(box);
}
function economicsBookFilter(){return {month:$('extraEconomicsMonth').value,category:$('extraEconomicsBookCategory').value,mode:$('extraEconomicsBookMode').value,state:$('extraEconomicsBookState').value}}
function renderExtraEconomicsBook(){
  if(!admin())return;const model=window.OvergreenEconomics,list=$('extraEconomicsBookList');list.replaceChildren();
  $('extraEconomicsBookExport').disabled=!!extraEconomicsError;
  if(extraEconomicsError){$('extraEconomicsBookStatus').textContent=extraEconomicsError;$('extraEconomicsBookSummary').replaceChildren();extraEconomicsBookRows=[];return}
  extraEconomicsBookRows=model.filterRows(extras,extraEconomicsRecords,attachments,economicsBookFilter());
  const ready=extraEconomicsBookRows.filter(x=>x.calc.ready),total=ready.reduce((sum,x)=>sum+x.calc.total,0),incomplete=extraEconomicsBookRows.length-ready.length;
  $('extraEconomicsBookSummary').innerHTML=`<div><strong>${esc(model.money(total))}</strong><span>Totale di ${ready.length} extra con dati completi</span></div><div><strong>${incomplete}</strong><span>Da completare, verificare o approvare</span></div>`;
  $('extraEconomicsBookStatus').textContent=extraEconomicsBookRows.length?`${extraEconomicsBookRows.length} extra · preventivi non accettati e voci da verificare esclusi dal totale complessivo.`:'Nessun extra in questo periodo. Svuota il mese per vedere tutti gli extra.';
  $('extraEconomicsBookExport').disabled=!extraEconomicsBookRows.length;
  for(const x of extraEconomicsBookRows){const st=stores.find(s=>s.id===x.extra.store_id),article=document.createElement('article');article.className='economic-book-row';
    article.innerHTML=`<div><strong>${esc(st?.nome||x.extra.nome_esterno||'Extra')} · ${esc(x.extra.numero_target||'Target non indicato')}</strong><p>${esc(x.extra.titolo||'')}</p><small>${esc(model.modes[x.row.pricing_mode]||'Modalità da scegliere')} · ${esc(economicsStatus(x.calc,x.row))}</small></div><div><strong>${esc(model.money(x.calc.total))}</strong><button type="button" class="secondary">Apri</button></div>`;
    article.querySelector('button').onclick=()=>{$('extraEconomicsBook').close();void openExtraHours(x.extra)};list.appendChild(article);
  }
}
async function refreshExtraEconomicsBook(){
  if(!admin())return;const b=$('extraEconomicsBookRefresh');b.disabled=true;$('extraEconomicsBookExport').disabled=true;$('extraEconomicsBookStatus').textContent='Aggiornamento…';
  try{await loadAll();if(admin())renderExtraEconomicsBook()}catch(error){extraEconomicsError='Aggiornamento non riuscito. Riprova prima di esportare.';if(admin())renderExtraEconomicsBook()}
  finally{b.disabled=false}
}
function openExtraEconomicsBook(){
  if(!admin())return;const dialog=$('extraEconomicsBook');
  if(!dialog.dataset.bound){dialog.dataset.bound='true';$('extraEconomicsMonth').value=today().slice(0,7);
    for(const id of ['extraEconomicsMonth','extraEconomicsBookCategory','extraEconomicsBookMode','extraEconomicsBookState'])$(id).onchange=renderExtraEconomicsBook;
    $('extraEconomicsBookClose').onclick=()=>dialog.close();$('extraEconomicsBookRefresh').onclick=refreshExtraEconomicsBook;$('extraEconomicsBookExport').onclick=exportExtraEconomics;
  }
  dialog.showModal();renderExtraEconomicsBook();void refreshExtraEconomicsBook();
}
function addEconomicsWorksheet(workbook,rows){
  const model=window.OvergreenEconomics,ws=workbook.addWorksheet('Economia extra');
  const columns=[['Sede',26],['Target',18],['Descrizione',35],['Data esecuzione',18],['Stato lavoro',18],['Categoria',14],['Modalità',18],['Operatori',12],['Uscita apposita',18],['Tariffa uscita per operatore',18],['Uscita aggiunta',18],['Ore complessive',16],['Tariffa oraria',16],['Manodopera a ore (informativa per preventivi)',23],['Importo preventivo',18],['Stato preventivo',18],['Uscita inclusa nel preventivo',20],['Spese',16],['Totale calcolato',18],['Incluso nel totale riepilogo',20],['Verifica',45],['Dettaglio spese',45],['Note economiche',40],['Riferimento preventivo',24]];
  ws.columns=columns.map(([header,width])=>({header,width}));ws.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};ws.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF075B31'}};ws.getRow(1).height=45;ws.getRow(1).alignment={wrapText:true,vertical:'middle'};
  for(const x of rows){const e=x.extra,r=x.row,c=x.calc,st=stores.find(s=>s.id===e.store_id),q=r.pricing_mode==='preventivo';
    const row=ws.addRow([st?.nome||e.nome_esterno||'',String(e.numero_target||''),e.titolo||'',e.giorno_intervento||'',e.stato,r.pricing_category||e.categoria_target||'',model.modes[r.pricing_mode]||'',r.operator_count??null,typeof r.dedicated_trip==='boolean'?(r.dedicated_trip?'Sì':'No'):'',r.exit_rate??null,c.exit==null?null:c.exit/100,r.total_hours??null,r.hourly_rate??null,c.labor==null?null:c.labor/100,q?r.quote_amount??null:null,q?model.quoteStates[r.quote_status]||'':'',q?(c.exitIncluded?'Sì':'No'):'',c.expenses/100,c.total==null?null:c.total/100,c.ready?'Sì':'No',economicsStatus(c,r),(r.expenses||[]).map(s=>s.description+': '+model.money(model.cents(s.amount))).join(' | '),r.economic_notes||'',r.quote_reference||'']);
    for(const col of [10,11,13,14,15,18,19])row.getCell(col).numFmt='#,##0.00 "€"';row.getCell(12).numFmt='0.00';
    row.alignment={vertical:'top',wrapText:true};
  }
  ws.views=[{state:'frozen',ySplit:1}];ws.autoFilter={from:'A1',to:`X${Math.max(2,rows.length+1)}`};
  const summary=workbook.addWorksheet('Riepilogo');summary.columns=[{width:65},{width:22}];
  summary.addRow(['Overgreen · importi IVA esclusa']);summary.addRow(['Generato',new Date().toLocaleString('it-IT')]);
  summary.addRow(['Totale extra con dati completi e preventivi accettati',rows.filter(x=>x.calc.ready).reduce((sum,x)=>sum+x.calc.total,0)/100]).getCell(2).numFmt='#,##0.00 "€"';
  summary.addRow(['Extra esclusi dal totale complessivo',rows.filter(x=>!x.calc.ready).length]);
  summary.addRow(['Le ore indicate sono il totale di tutti gli operatori.']);summary.addRow(['Nei preventivi la manodopera a ore è informativa: non viene sommata al preventivo.']);summary.addRow(['Il riepilogo non attesta l’emissione o il pagamento di una fattura.']);
  summary.eachRow(r=>r.alignment={wrapText:true,vertical:'top'});return ws;
}
async function exportExtraEconomics(){
  if(!admin())return;if(!window.ExcelJS)return alert('Libreria Excel non disponibile. Aggiorna la pagina.');
  const b=$('extraEconomicsBookExport');if(b.disabled)return;b.disabled=true;
  try{
    await loadAll();if(!admin())return;if(extraEconomicsError)throw new Error(extraEconomicsError);
    const rows=window.OvergreenEconomics.filterRows(extras,extraEconomicsRecords,attachments,economicsBookFilter());if(!rows.length)throw new Error('Nessun extra da esportare.');
    const workbook=new window.ExcelJS.Workbook();addEconomicsWorksheet(workbook,rows);const buffer=await workbook.xlsx.writeBuffer();if(!admin())return;
    const blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`Overgreen-economia-extra-${$('extraEconomicsMonth').value||'tutti'}.xlsx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    $('extraEconomicsBookStatus').textContent='Excel economico generato.';
  }catch(error){if(admin())$('extraEconomicsBookStatus').textContent=error.message||'Esportazione non riuscita.'}
  finally{if(admin())b.disabled=false}
}
