/* V202: economic workflow with manual crew hours and the Eurospin report preview. */
function parseExtraHours(value){
  const text=String(value??'').trim();
  if(!text)return null;
  if(!/^\d{1,5}([.,]\d{1,2})?$/.test(text))throw new Error('Inserisci un numero da 0 a 99999,99 con al massimo due decimali. Esempio: 2,5 = 2 ore e 30 minuti.');
  return Number(text.replace(',','.'));
}

const ExtraHoursUi=(()=>{
  let state=null,bound=false,renderId=0;
  const el=id=>document.getElementById(id);
  const current=s=>state===s&&admin();
  const valueText=value=>value==null?'':String(value).replace('.',',');
  const tell=(message,error=false)=>{el('extraHoursFeedback').textContent=message;el('extraHoursFeedback').dataset.error=String(error)};
  const model=()=>window.OvergreenEconomics;
  const formKey=()=>JSON.stringify([...el('extraHoursForm').querySelectorAll('input,select,textarea')].map(x=>[x.id,x.type==='checkbox'?x.checked:x.value]));
  function expenseRow(item={}){
    const box=el('extraEconomicsExpenses');if(box.children.length>=50){tell('Puoi inserire al massimo 50 spese.',true);return}
    const row=document.createElement('div');row.className='eh-expense-row';
    row.innerHTML='<input type="text" maxlength="200" data-expense-description aria-label="Descrizione spesa" placeholder="Materiali, noleggio…"><input type="text" inputmode="decimal" maxlength="10" data-expense-amount aria-label="Importo spesa, IVA esclusa" placeholder="Importo €"><button type="button" class="secondary" aria-label="Rimuovi spesa">×</button>';
    row.querySelector('[data-expense-description]').value=item.description||'';row.querySelector('[data-expense-amount]').value=valueText(item.amount);
    row.querySelector('button').onclick=()=>{if(state?.saving)return;row.remove();syncEconomics()};box.appendChild(row);
  }
  function fillEconomics(s){
    const r=s.row||{};el('extraEconomicsMode').value=r.pricing_mode||'';
    el('extraEconomicsCategory').value=s.extraCategory||r.pricing_category||'';
    el('extraEconomicsOperators').value=r.operator_count??(s.suggestedOperators||'');
    el('extraEconomicsTrip').value=r.dedicated_trip===true?'yes':r.dedicated_trip===false?'no':'';
    el('extraEconomicsEquipment').checked=r.equipment===true;el('extraEconomicsQuoteAmount').value=valueText(r.quote_amount);
    el('extraEconomicsIncluded').checked=r.quote_exit_included===true;el('extraEconomicsQuoteStatus').value=r.quote_status||'bozza';
    el('extraEconomicsQuoteRef').value=r.quote_reference||'';el('extraEconomicsNotes').value=r.economic_notes||'';
    el('extraEconomicsExpenses').replaceChildren();for(const expense of r.expenses||[])expenseRow(expense);
    el('extraEconomicsCategoryHint').textContent=s.extraCategory?'La categoria è quella del target. Per cambiarla, usa Modifica nella scheda extra.':'La categoria scelta sarà salvata anche nel target.';
    if(r.pricing_category&&s.extraCategory&&r.pricing_category!==s.extraCategory)el('extraEconomicsCategoryHint').textContent='La categoria del target è cambiata: verifica le nuove tariffe e salva per confermarle.';
    syncEconomics();
  }
  function economicValues(){
    const m=model(),asAmount=value=>{const cents=m.decimal(value);return cents==null?null:cents/100};
    const count=el('extraEconomicsOperators').value.trim();if(count&&!/^[1-9][0-9]?$/.test(count))throw new Error('Inserisci da 1 a 99 operatori.');
    const expenses=[];for(const row of el('extraEconomicsExpenses').children){
      const description=row.querySelector('[data-expense-description]').value.trim(),text=row.querySelector('[data-expense-amount]').value.trim();
      if(!description&&!text)continue;const amount=asAmount(text);if(!description||amount==null)throw new Error('Ogni spesa richiede descrizione e importo.');expenses.push({description,amount});
    }
    const category=el('extraEconomicsCategory').value||null;
    return {total_hours:parseExtraHours(el('extraHoursInput').value),pricing_mode:el('extraEconomicsMode').value||null,pricing_category:category,
      dedicated_trip:el('extraEconomicsTrip').value==='yes'?true:el('extraEconomicsTrip').value==='no'?false:null,
      operator_count:count?Number(count):null,equipment:category==='pulizie'&&el('extraEconomicsEquipment').checked,
      quote_amount:asAmount(el('extraEconomicsQuoteAmount').value),quote_status:el('extraEconomicsQuoteStatus').value||'bozza',
      quote_exit_included:el('extraEconomicsIncluded').checked,quote_reference:el('extraEconomicsQuoteRef').value.trim(),expenses,economic_notes:el('extraEconomicsNotes').value.trim()};
  }
  function syncEconomics(){
    if(!state)return;const m=model(),quote=el('extraEconomicsMode').value==='preventivo',category=el('extraEconomicsCategory').value;
    el('extraEconomicsQuote').hidden=!quote;el('extraEconomicsEquipmentWrap').hidden=category!=='pulizie';
    el('extraEconomicsIncludedWrap').hidden=el('extraEconomicsTrip').value!=='yes';
    if(category!=='pulizie')el('extraEconomicsEquipment').checked=false;
    el('extraEconomicsExpensesLabel').textContent=quote?'Spese extra rispetto al preventivo':'Spese aggiuntive';
    const rate=m.rates(category,el('extraEconomicsEquipment').checked);
    el('extraEconomicsRates').textContent=rate.hourly_rate==null?'Seleziona la categoria per applicare le tariffe.':`${m.money(rate.hourly_rate*100)} / ora · ${m.money(rate.exit_rate*100)} di uscita per operatore, solo se apposita.`;
    const box=el('extraEconomicsSummary');box.replaceChildren();
    try{
      const values=economicValues(),c=m.calculate({...values,...rate});
      const line=(label,amount)=>{const p=document.createElement('p'),strong=document.createElement('strong');p.append(document.createTextNode(label));strong.textContent=m.money(amount);p.append(strong);box.append(p)};
      line(quote?'Preventivo':'Manodopera a ore',c.base);line(c.exitIncluded?'Uscita già inclusa':'Uscita da aggiungere',c.exit);line('Spese aggiuntive',c.expenses);line('Totale calcolato · IVA esclusa',c.total);
      const note=document.createElement('small');note.textContent=!c.complete?'Bozza: mancano '+c.missing.join(', '):c.quotePending?'Preventivo '+m.quoteStates[values.quote_status].toLowerCase()+': escluso dal totale dei preventivi accettati.':'Dati completi. Premi Salva per registrare gli importi.';box.append(note);
    }catch(error){box.textContent=error.message}
  }
  function controls(s){
    el('extraHoursSave').disabled=!s.loaded||s.saving||!admin();
    for(const input of el('extraHoursForm').querySelectorAll('input,select,textarea,button'))input.disabled=!s.loaded||s.saving||!admin();
    el('extraEconomicsCategory').disabled=!s.loaded||s.saving||!admin()||!!s.extraCategory;
    el('extraHoursClose').disabled=s.saving;
    el('extraHoursPrev').disabled=!s.pdf||s.page<=1;
    el('extraHoursNext').disabled=!s.pdf||s.page>=s.pdf.numPages;
    for(const id of ['extraHoursZoomIn','extraHoursZoomOut','extraHoursFit'])el(id).disabled=!s.pdf&&!s.image;
    el('extraHoursPage').textContent=s.pdf?`${s.page} / ${s.pdf.numPages}`:s.image?'Immagine':'—';
  }
  function metadata(s){
    const row=s.row,stamp=row?.updated_at?new Date(row.updated_at).toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'}):'';
    el('extraHoursMeta').textContent=row?`${row.total_hours==null?'Ore non indicate':`Ore salvate: ${valueText(row.total_hours)}`}${stamp?' · '+stamp:''}`:'Ore non ancora inserite';
    el('extraHoursChanged').hidden=!(row?.total_hours!=null&&row.source_attachment_id!==(s.report?.id||null));
  }
  function dispose(s){
    ++renderId;
    try{s.renderTask?.cancel()}catch{}
    s.renderTask=null;
    const resource=s.loadingTask||s.pdf;
    if(resource)Promise.resolve(resource.destroy()).catch(()=>{});
    if(s.image){s.image.onload=null;s.image.onerror=null;s.image.removeAttribute('src')}
    s.pdf=null;s.loadingTask=null;s.image=null;
  }
  function close(force=false){
    const s=state;if(!s)return;
    if(!force&&s.saving)return;
    if(!force&&s.loaded&&formKey()!==s.savedForm&&!confirm('Chiudere senza salvare le modifiche economiche?'))return;
    state=null;dispose(s);el('extraHoursCanvas').replaceChildren();el('extraHoursInput').value='';
    el('extraHoursDialog').close();
  }
  async function render(s){
    if(!current(s))return;
    const request=++renderId;
    try{s.renderTask?.cancel()}catch{}
    s.renderTask=null;
    controls(s);
    const box=el('extraHoursCanvas'),available=Math.max(180,box.clientWidth-24);
    if(s.image){s.image.style.width=`${Math.round(available*s.zoom)}px`;return}
    if(!s.pdf)return;
    el('extraHoursPreviewStatus').textContent='Caricamento pagina…';
    try{
      const page=await s.pdf.getPage(s.page);
      if(!current(s)||request!==renderId)return;
      const base=page.getViewport({scale:1}),scale=available/base.width*s.zoom;
      const viewport=page.getViewport({scale});
      // Separate canvas per render: a cancelled PDF render cannot corrupt a newer page.
      const canvas=document.createElement('canvas');
      const ratio=Math.min(window.devicePixelRatio||1,2,4096/Math.max(viewport.width,viewport.height),Math.sqrt(4000000/(viewport.width*viewport.height)));
      canvas.width=Math.max(1,Math.floor(viewport.width*ratio));canvas.height=Math.max(1,Math.floor(viewport.height*ratio));
      canvas.style.width=`${Math.round(viewport.width)}px`;canvas.style.height=`${Math.round(viewport.height)}px`;
      canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`Rapportino Eurospin, pagina ${s.page}`);
      const context=canvas.getContext('2d');if(!context)throw new Error('Canvas non disponibile');
      const task=page.render({canvasContext:context,viewport,transform:ratio===1?null:[ratio,0,0,ratio,0,0]});
      s.renderTask=task;await task.promise;
      if(!current(s)||request!==renderId)return;
      s.renderTask=null;box.replaceChildren(canvas);box.scrollTop=0;box.scrollLeft=0;
      el('extraHoursPreviewStatus').textContent=`Pagina ${s.page} di ${s.pdf.numPages} · zoom ${Math.round(s.zoom*100)}%`;
    }catch(error){
      if(!current(s)||request!==renderId||error?.name==='RenderingCancelledException')return;
      box.replaceChildren();el('extraHoursPreviewStatus').textContent='Pagina non visualizzabile. Usa Apri originale per consultare il rapportino.';
    }
  }
  async function preview(s){
    if(!s.report){el('extraHoursPreviewStatus').textContent='Rapportino Eurospin non ancora caricato. Puoi inserire le ore e consultare il file dopo averlo allegato alla chiusura.';return}
    el('extraHoursOriginal').hidden=false;
    el('extraHoursPreviewStatus').textContent='Caricamento del rapportino…';
    try{
      const url=await signedAttachmentUrl(s.report);if(!current(s))return;
      const isPdf=s.report.mime_type?.includes('pdf')||/\.pdf$/i.test(s.report.nome_file||s.report.storage_path||'');
      const isImage=s.report.mime_type?.startsWith('image/')||/\.(png|jpe?g|webp|gif|bmp)$/i.test(s.report.nome_file||s.report.storage_path||'');
      if(isPdf){
        if(!window.pdfjsLib)throw new Error('PDF viewer unavailable');
        s.loadingTask=window.pdfjsLib.getDocument({url,isEvalSupported:false});
        const pdf=await s.loadingTask.promise;
        if(!current(s)){await pdf.destroy();return}
        s.pdf=pdf;await render(s);
      }else if(isImage){
        const img=document.createElement('img');s.image=img;img.alt='Rapportino Eurospin';
        img.onload=()=>{if(!current(s))return;el('extraHoursPreviewStatus').textContent='Rapportino Eurospin · usa i pulsanti per ingrandire';controls(s)};
        img.onerror=()=>{if(current(s))el('extraHoursPreviewStatus').textContent='Immagine non visualizzabile. Usa Apri originale.'};
        img.src=url;el('extraHoursCanvas').replaceChildren(img);await render(s);
      }else throw new Error('Unsupported preview');
    }catch(error){if(current(s))el('extraHoursPreviewStatus').textContent='Anteprima non disponibile. Puoi usare Apri originale e inserire le ore manualmente.'}
  }
  async function open(extra){
    if(!admin()||clientType(extra)!=='eurospin')return;
    bind();if(state){close();if(state)return}
    const s={extraId:extra.id,row:null,report:null,page:1,zoom:1,loaded:false,saving:false,savedText:'',savedForm:'',extraCategory:extra.categoria_target||null,suggestedOperators:typeof extraWorkers==='undefined'?0:new Set(extraWorkers.filter(w=>w.extra_id===extra.id).map(w=>w.profile_id)).size,pdf:null,image:null};state=s;
    const store=stores.find(x=>x.id===extra.store_id);
    el('extraHoursContext').textContent=[store?.nome||extra.nome_esterno,extra.numero_target?'Target '+extra.numero_target:'',extra.titolo].filter(Boolean).join(' · ');
    el('extraHoursInput').value='';el('extraHoursMeta').textContent='Caricamento ore…';el('extraHoursChanged').hidden=true;el('extraHoursOriginal').hidden=true;
    el('extraHoursPreviewStatus').textContent='Caricamento del rapportino…';el('extraHoursCanvas').replaceChildren();tell('');fillEconomics(s);controls(s);
    el('extraHoursDialog').showModal();
    try{
      const [hours,report,freshExtra]=await Promise.all([
        sb.from('extra_labor_hours').select('*').eq('extra_id',extra.id).maybeSingle(),
        sb.from('attachments').select('id,extra_id,tipo,storage_path,nome_file,mime_type,created_at').eq('extra_id',extra.id).eq('tipo','rapportino_eurospin').order('created_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle(),
        sb.from('extras').select('id,categoria_target,client_type').eq('id',extra.id).maybeSingle()
      ]);
      if(!current(s))return;
      if(hours.error)throw hours.error;if(report.error)throw report.error;if(freshExtra.error)throw freshExtra.error;
      if(!freshExtra.data||freshExtra.data.client_type!=='eurospin')throw new Error('Extra non disponibile');
      s.extraCategory=freshExtra.data.categoria_target||null;
      s.row=hours.data;s.report=report.data;s.loaded=true;s.savedText=valueText(s.row?.total_hours);
      el('extraHoursInput').value=s.savedText;fillEconomics(s);s.savedForm=formKey();metadata(s);controls(s);await preview(s);
    }catch(error){if(current(s)){tell('Impossibile caricare i dati. Chiudi e riapri la scheda per riprovare.',true);el('extraHoursMeta').textContent='Dati non caricati';el('extraHoursPreviewStatus').textContent='Rapportino non caricato'}}
  }
  async function save(){
    const s=state;if(!s||!current(s)||!s.loaded||s.saving)return;
    let values;try{values=economicValues()}catch(error){tell(error.message,true);el('extraHoursInput').focus();return}
    s.saving=true;controls(s);tell('Salvataggio…');
    try{
      const {data,error}=await sb.rpc('save_extra_economics_v202',{p_extra_id:s.extraId,p_values:values,p_expected_revision:s.row?.revision||0,p_source_attachment_id:s.report?.id||null,p_expected_extra_category:s.extraCategory});
      if(!current(s))return;if(error)throw error;
      const row=data?.record;if(!row||row.extra_id!==s.extraId)throw new Error('Salvataggio non confermato. Riprova.');
      s.row=row;s.extraCategory=row.pricing_category||s.extraCategory;s.savedText=valueText(row.total_hours);el('extraHoursInput').value=s.savedText;fillEconomics(s);s.savedForm=formKey();metadata(s);
      if(typeof rememberExtraEconomics==='function')rememberExtraEconomics(row,s.report);
      const result=model().calculate(row);tell(result.complete?'Dati economici salvati.':'Bozza salvata. Da completare: '+result.missing.join(', '));
    }catch(error){if(current(s))tell(error?.message||'Salvataggio non riuscito. Le ore inserite sono ancora qui: riprova.',true)}
    finally{s.saving=false;if(current(s))controls(s)}
  }
  function bind(){
    if(bound)return;bound=true;
    el('extraHoursForm').onsubmit=event=>{event.preventDefault();void save()};
    el('extraHoursClose').onclick=()=>close();
    el('extraHoursDialog').addEventListener('cancel',event=>{event.preventDefault();close()});
    el('extraHoursDialog').addEventListener('close',()=>{if(state)close(true)});
    el('extraHoursForm').addEventListener('input',()=>{tell('');syncEconomics()});
    el('extraHoursForm').addEventListener('change',()=>{tell('');syncEconomics()});
    el('extraEconomicsAddExpense').onclick=()=>{if(state?.loaded&&!state.saving){expenseRow();syncEconomics()}};
    el('extraHoursOriginal').onclick=()=>{if(state?.report&&admin())openAttachment(state.report)};
    el('extraHoursPrev').onclick=()=>{if(state?.pdf&&state.page>1){state.page--;void render(state)}};
    el('extraHoursNext').onclick=()=>{if(state?.pdf&&state.page<state.pdf.numPages){state.page++;void render(state)}};
    el('extraHoursZoomIn').onclick=()=>{if(state){state.zoom=Math.min(3,state.zoom+.25);void render(state)}};
    el('extraHoursZoomOut').onclick=()=>{if(state){state.zoom=Math.max(.5,state.zoom-.25);void render(state)}};
    el('extraHoursFit').onclick=()=>{if(state){state.zoom=1;void render(state)}};
    window.addEventListener('resize',()=>{if(state?.pdf||state?.image)void render(state)});
  }
  return {open,close,save};
})();
function openExtraHours(extra){return ExtraHoursUi.open(extra)}
function closeExtraHoursForRole(){if(!admin())ExtraHoursUi.close(true)}
