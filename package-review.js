/* Visual review is bound to server fingerprints and to the exact final ZIP bytes. */
window.PackageReview=(()=>{
  let state=null,dialog=null,viewer=null,viewSerial=0;
  const $r=id=>document.getElementById('pr-'+id);
  const current=s=>state===s&&admin();
  const text=(tag,value)=>{const n=document.createElement(tag);n.textContent=value??'';return n};
  const validReview=c=>c?.review?.fingerprint===c?.fingerprint?c.review:null;
  const approved=c=>{const r=validReview(c);return !!(r?.checks?.eurospin&&r.checks.overgreen&&r.checks.economics&&/^\d{5,8}$/.test(r.closure_number))};
  async function rpc(name,args){if(!admin())throw Error('Sessione amministratore richiesta');const r=await sb.rpc(name,args);if(r.error)throw r.error;return r.data}
  async function contexts(ids){const data=await rpc('extra_package_review_context',{p_ids:ids});if(!Array.isArray(data)||data.length!==ids.length)throw Error('Uno degli extra non è più disponibile.');return new Map(data.map(c=>[c.extra_id,c]))}
  function same(a,b){return a.size===b.size&&[...a].every(([id,c])=>b.get(id)?.fingerprint===c.fingerprint&&JSON.stringify(b.get(id)?.review)===JSON.stringify(c.review))}
  function ensureDialog(){
    if(dialog)return;
    dialog=document.createElement('dialog');dialog.id='packageReviewDialog';dialog.className='package-review';
    dialog.innerHTML=`<div class="pr-head"><div><h2>Verifica pacchetto Eurospin</h2><p id="pr-progress"></p></div><button type="button" id="pr-close" class="secondary">Salva ed esci</button></div>
      <div class="pr-body" id="pr-body"><p id="pr-status" role="status"></p><div id="pr-overview"></div>
      <div class="pr-nav"><button type="button" id="pr-prev" class="secondary">← Extra precedente</button><select id="pr-select" aria-label="Extra da verificare"></select><button type="button" id="pr-next" class="secondary">Extra successivo →</button></div>
      <div id="pr-identity"></div><div class="pr-steps"><button type="button" data-pr-step="eurospin">1 · Eurospin</button><button type="button" data-pr-step="overgreen">2 · Overgreen</button><button type="button" data-pr-step="economics">3 · Riga Excel</button></div>
      <div id="pr-content"></div></div><div class="actions" id="pr-actions"></div>
      <div class="pr-footer"><button type="button" id="pr-build">4 · Genera ZIP e riepilogo</button><button type="button" id="pr-refresh" class="secondary">Aggiorna verifica</button></div>`;
    document.body.appendChild(dialog);
    $r('close').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
    $r('prev').onclick=()=>navigate(-1);$r('next').onclick=()=>navigate(1);
    $r('select').onchange=()=>{state.index=Number($r('select').value);state.step='eurospin';void run(render)};
    dialog.querySelectorAll('[data-pr-step]').forEach(b=>b.onclick=()=>{state.step=b.dataset.prStep;void run(render)});
    $r('refresh').onclick=()=>run(async()=>{await refresh();await render()});
    $r('build').onclick=()=>run(build);
  }
  function feedback(message){$r('status').textContent=message||''}
  function lock(value){if(!dialog)return;dialog.querySelectorAll('button,select,input,textarea').forEach(n=>n.disabled=value)}
  async function run(fn){const s=state;if(!s||s.busy||!admin())return;s.busy=true;lock(true);feedback('');try{await fn()}catch(e){if(current(s))feedback(e.message||String(e))}finally{if(current(s)){s.busy=false;lock(false);syncButtons()}}}
  function close(){if(state?.busy)return;dispose();state=null;dialog?.close();if(admin())restoreExtraEconomicsBook()}
  function clearForRole(){if(admin())return;dispose();state=null;dialog?.close();if(dialog){$r('content').replaceChildren();$r('identity').replaceChildren();$r('overview').replaceChildren()}}
  function dispose(){viewSerial++;if(viewer){try{viewer.task?.cancel();viewer.loading?.destroy();viewer.pdf?.destroy()}catch{}if(viewer.url)URL.revokeObjectURL(viewer.url);viewer=null}}
  async function refresh(){
    const s=state,before=await contexts(s.ids);await loadAll();if(!current(s))return;
    if(extraEconomicsError)throw Error(extraEconomicsError);
    const after=await contexts(s.ids);if(!same(before,after))throw Error('Dati cambiati durante il caricamento. Premi Aggiorna verifica.');
    const all=window.OvergreenEconomics.filterRows(extras,extraEconomicsRecords,attachments);
    s.rows=s.ids.map(id=>all.find(x=>x.extra.id===id));if(s.rows.some(x=>!x))throw Error('Un extra selezionato non è più esportabile. Torna in Economia.');
    s.context=after;s.final=null;
  }
  async function open(){
    if(!admin())return;ensureDialog();
    const ids=extraEconomicsBookRows.filter(x=>!economicsExcludedIds.has(x.extra.id)).map(x=>x.extra.id);if(!ids.length)return;
    dispose();state={ids,index:0,step:'eurospin',rows:[],context:new Map(),period:$('extraEconomicsMonth').value,busy:false,final:null};
    $('extraEconomicsBook').close();dialog.showModal();
    await run(async()=>{feedback('Caricamento verifiche salvate…');await refresh();const first=state.ids.findIndex(id=>!approved(state.context.get(id)));state.index=Math.max(0,first);await render()});
  }
  function item(){return state.rows[state.index]}
  function context(){return state.context.get(item()?.extra.id)}
  function syncButtons(){
    if(!state||!admin())return;
    $r('prev').disabled=state.index===0;$r('next').disabled=state.index>=state.rows.length-1;
    $r('build').disabled=!!state.final||!state.rows.length||!state.ids.every(id=>approved(state.context.get(id)))||state.rows.some(x=>economicsZipIssues([x]).length);
    if(state.final){const download=$r('download');if(download)download.disabled=!state.final.accepted;}
    const accept=$r('accept');if(accept)accept.disabled=state.step==='economics'?(!validReview(context())?.checks?.eurospin||!validReview(context())?.checks?.overgreen||!item()?.calc.ready):!viewer?.complete;
  }
  function button(label,handler,cls='secondary'){const b=text('button',label);b.type='button';b.className=cls;b.onclick=()=>run(handler);return b}
  function formatCell(c){if(c.isMerged&&c.master?.address!==c.address)return '';const raw=c.value,v=raw&&typeof raw==='object'&&'result' in raw?raw.result:raw;if(v instanceof Date)return v.toLocaleDateString('it-IT');if(typeof v==='number'&&String(c.numFmt).includes('€'))return window.OvergreenEconomics.money(Math.round(v*100));return v==null?'—':String(v)}
  function rowTable(book,container){const ws=book.worksheets[0],headers=ws.getRow(2),table=document.createElement('table');table.className='pr-values';
    for(let i=1;i<=ws.columnCount;i++){const tr=document.createElement('tr');tr.append(text('th',headers.getCell(i).value),text('td',formatCell(ws.getRow(3).getCell(i))));table.append(tr)}container.append(table)}
  async function render(){
    const s=state;if(!current(s)||!s.rows.length)return;dispose();s.final=null;
    const x=item(),e=x.extra,c=context(),r=validReview(c),st=stores.find(v=>v.id===e.store_id),done=s.ids.filter(id=>approved(s.context.get(id))).length;
    $r('progress').textContent=`${done}/${s.ids.length} extra verificati · le conferme sono salvate nel tuo account`;
    $r('overview').replaceChildren();
    for(const cat of ['verde','pulizie']){const group=s.rows.filter(x=>(x.extra.categoria_target||x.row.pricing_category)===cat);if(group.length)$r('overview').append(text('span',`${cat==='verde'?'Verde':'Pulizie'}: ${group.length} extra · ${window.OvergreenEconomics.money(group.filter(x=>x.calc.ready).reduce((n,x)=>n+x.calc.total,0))}`))}
    const select=$r('select');select.replaceChildren();s.rows.forEach((x,i)=>{const opt=text('option',`${approved(s.context.get(x.extra.id))?'✓':'○'} ${x.extra.numero_target||'Extra'} · ${stores.find(v=>v.id===x.extra.store_id)?.nome||x.extra.nome_esterno||x.extra.titolo}`);opt.value=i;select.append(opt)});select.value=s.index;
    $r('identity').replaceChildren(text('h3',`${st?.nome||e.nome_esterno||'Sede'} · Target ${e.numero_target||'non indicato'}`),text('p',`${e.titolo||''} · Esecuzione: ${e.giorno_intervento||'non indicata'}`));
    const issues=economicsZipIssues([x]);if(issues.length)$r('identity').append(text('p',issues.join('\n')));
    if(c.review&&!r)$r('identity').append(text('p','Dati o allegati cambiati: le precedenti conferme non sono più valide.'));
    if(r?.note)$r('identity').append(text('p','Da sistemare: '+r.note));
    dialog.querySelectorAll('[data-pr-step]').forEach(b=>{b.classList.toggle('active',b.dataset.prStep===s.step);b.textContent=({eurospin:'1 · Eurospin',overgreen:'2 · Overgreen',economics:'3 · Riga Excel'})[b.dataset.prStep]+(r?.checks?.[b.dataset.prStep]?' ✓':'')});
    const content=$r('content'),actions=$r('actions');content.replaceChildren();actions.replaceChildren();$r('body').scrollTop=0;
    if(s.step==='economics'){
      content.append(text('p','Confronta questi valori con i rapportini. È la stessa riga usata per creare il file Excel.'));
      const label=text('label','Numero chiusura Eurospin · confermalo leggendo il rapportino');const input=document.createElement('input');input.id='pr-number';input.inputMode='numeric';input.maxLength=8;input.value=r?.closure_number||'';label.append(input);content.append(label);
      const table=document.createElement('div');content.append(table);
      await ensureLibraries('ExcelJS');if(!current(s))return;
      const redraw=()=>{table.replaceChildren();const b=new window.ExcelJS.Workbook();addEconomicsWorksheet(b,[{...x,closureNumber:input.value}],s.period);rowTable(b,table)};input.oninput=redraw;redraw();
      if(!input.value){try{const result=await readClosureNumberFromEurospinFile(e);if(current(s)&&!input.value){input.value=result.number||'';redraw()}}catch{}}
      actions.append(button('Modifica economia',async()=>{dispose();dialog.close();await openExtraHours(e,{onClose:async()=>{if(!current(s))return;dialog.showModal();await run(async()=>{await refresh();await render()})}})}));
      actions.append(button('Riapri Eurospin',async()=>{s.step='eurospin';await render()}),button('Riapri Overgreen',async()=>{s.step='overgreen';await render()}));
    }else{
      const tipo=s.step==='eurospin'?'rapportino_eurospin':'rapportino_overgreen',a=attachments.filter(a=>a.extra_id===e.id&&a.tipo===tipo).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)))[0];
      content.append(text('p','Controlla tutte le pagine: sede e target, data, lavoro, ore/operatori, firme e leggibilità.'));
      if(a){try{await showDocument(content,await signedAttachmentUrl(a),a.mime_type,a.nome_file)}catch(error){content.append(text('p','Anteprima non disponibile: '+error.message+'. Puoi sostituire il documento qui sotto.'))}if(!current(s))return}else content.append(text('p','Rapportino mancante. Caricalo qui sotto.'));
      const pick=(camera=false)=>{const input=document.createElement('input');input.type='file';input.accept=camera?'image/*':'application/pdf,image/jpeg,image/png,image/webp';if(camera)input.setAttribute('capture','environment');input.onchange=()=>{if(input.files[0])void run(()=>replacement(input.files[0],tipo))};input.click()};
      if(a)for(const [label,angle] of [['↶ Ruota 90°',-90],['↷ Ruota 90°',90]])actions.append(button(label,async()=>{
        const page=viewer?.page||1;feedback('Preparo il rapportino ruotato…');
        const response=await fetch(await signedAttachmentUrl(a));if(!response.ok)throw Error('Impossibile leggere il rapportino.');
        const blob=await response.blob(),file=new File([blob],a.nome_file||'rapportino.pdf',{type:a.mime_type||blob.type});
        const rotated=await rotatedReviewFile(file,page,angle);if(current(s))await replacement(rotated,tipo,{rotation:true,page});
      }));
      const replace=button('Sostituisci PDF / foto',()=>pick());const camera=button('Fotografa rapportino',()=>pick(true));actions.append(replace,camera,button('Versioni precedenti',()=>versions(tipo)));
      const request=attachments.find(a=>a.extra_id===e.id&&a.tipo==='pdf_richiesta');if(request)actions.append(button('Apri richiesta',()=>openAttachment(request)));
    }
    const accept=button(s.step==='economics'?'Documenti e dati corrispondono →':'Rapportino corretto e completo →',confirmStep,'');accept.id='pr-accept';actions.append(accept);
    actions.append(button('Da sistemare',async()=>{const note=prompt('Cosa devi sistemare?',r?.note||'');if(note===null)return;await save('reset',false,r?.closure_number||'',note);await render()}));
    syncButtons();
  }
  async function save(step,value,number='',note=''){
    const s=state,c=context(),r=await rpc('save_extra_package_review',{p_id:item().extra.id,p_fingerprint:c.fingerprint,p_step:step,p_value:value,p_number:number,p_note:note});if(current(s))c.review=r;
  }
  async function confirmStep(){
    const s=state,step=s.step;
    if(step!=='economics'&&!viewer?.complete)throw Error('Apri tutte le pagine prima di confermare.');
    const number=step==='economics'?$r('number').value.trim():(validReview(context())?.closure_number||'');
    if(step==='economics'&&(!/^\d{5,8}$/.test(number)||!item().calc.ready))throw Error('Verifica numero chiusura e completa i dati economici.');
    await save(step,true,number);
    if(step==='eurospin')s.step='overgreen';else if(step==='overgreen')s.step='economics';else if(s.index<s.rows.length-1){s.index++;s.step='eurospin'}
    await render();if(step==='economics')feedback('Extra verificato.');
  }
  function navigate(delta){return run(async()=>{state.index+=delta;state.step='eurospin';await render()})}

  async function showDocument(host,source,mime='',name='Documento',startPage=1){
    dispose();const serial=viewSerial,s=state,v={page:startPage,zoom:1,seen:new Set(),complete:false,pdf:null,url:null};viewer=v;
    const bar=document.createElement('div');bar.className='pr-view-tools';const area=document.createElement('div');area.className='pr-document';host.append(bar,area);
    const status=text('span','Caricamento…');bar.append(status);
    const isPdf=mime.includes('pdf')||/\.pdf$/i.test(name);
    if(isPdf){
      await ensureLibraries('pdfjsLib');if(!current(s)||serial!==viewSerial)return;
      const task=window.pdfjsLib.getDocument(typeof source==='string'?{url:source}:{data:source});v.loading=task;v.pdf=await task.promise;
      if(!current(s)||serial!==viewSerial){v.pdf.destroy();return}v.page=Math.max(1,Math.min(v.pdf.numPages,v.page));
      const draw=async()=>{if(viewer!==v||!current(s))return;try{v.task?.cancel()}catch{}const page=await v.pdf.getPage(v.page);if(viewer!==v)return;
        const base=page.getViewport({scale:1}),width=Math.max(1,Math.min((area.clientWidth||600)-16,((area.clientHeight||300)-16)*base.width/base.height)),viewport=page.getViewport({scale:Math.min(2,window.devicePixelRatio||1)*width/base.width*v.zoom}),canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;canvas.style.width=width*v.zoom+'px';area.replaceChildren(canvas);area.scrollTop=0;area.scrollLeft=0;
        v.task=page.render({canvasContext:canvas.getContext('2d'),viewport});try{await v.task.promise}catch(err){if(err.name==='RenderingCancelledException')return;throw err}
        if(viewer!==v)return;v.seen.add(v.page);v.complete=v.seen.size===v.pdf.numPages;status.textContent=`Pagina ${v.page}/${v.pdf.numPages} · ${v.seen.size} aperte`;syncButtons();};
      const control=(label,fn)=>{const b=text('button',label);b.type='button';b.className='secondary';b.onclick=()=>{fn();void draw().catch(e=>feedback(e.message))};bar.append(b)};
      control('←',()=>v.page=Math.max(1,v.page-1));control('→',()=>v.page=Math.min(v.pdf.numPages,v.page+1));control('−',()=>v.zoom=Math.max(.5,v.zoom-.25));control('+',()=>v.zoom=Math.min(3,v.zoom+.25));await draw();
    }else{
      const img=document.createElement('img');img.alt=name;img.src=source;area.append(img);
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Immagine non leggibile. Sostituisci il file.'))});if(viewer!==v||!current(s))return;v.complete=true;status.textContent='Immagine · ingrandisci per controllare';
      for(const [label,factor] of [['−',-.25],['+',.25]]){const b=text('button',label);b.type='button';b.onclick=()=>{v.zoom=Math.max(.5,Math.min(3,v.zoom+factor));img.style.width='auto';img.style.height=Math.max(1,area.clientHeight-16)*v.zoom+'px';img.style.maxHeight='none';img.style.maxWidth='none'};bar.append(b)}syncButtons();
    }
  }
  async function replacement(file,tipo,options={}){
    const s=state,e=item().extra,c=context();if(!file.size||!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Scegli un PDF, JPEG, PNG o WebP leggibile.');
    const host=$r('content'),actions=$r('actions');host.replaceChildren(text('h3',options.rotation?'Anteprima rotazione · salva per applicarla al rapportino e allo ZIP':'Anteprima del nuovo rapportino'));actions.replaceChildren();
    const url=URL.createObjectURL(file);try{await showDocument(host,url,file.type,file.name,options.page||1)}finally{if(viewer)viewer.url=url;else URL.revokeObjectURL(url)}
    let uploaded=false;const id=crypto.randomUUID(),path=`extra/${e.id}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`;
    if(options.rotation)for(const [label,angle] of [['↶ Ruota ancora',-90],['↷ Ruota ancora',90]])actions.append(button(label,async()=>{
      const page=viewer?.page||1,rotated=await rotatedReviewFile(file,page,angle);if(current(s))await replacement(rotated,tipo,{rotation:true,page});
    }));
    actions.append(button(options.rotation?'Salva rotazione':'Conferma sostituzione',async()=>{
      if(!options.rotation&&!viewer?.complete)throw Error('Controlla tutte le pagine del nuovo documento.');
      feedback('Caricamento e sostituzione…');if(!uploaded){await uploadFile(path,file);uploaded=true;}
      await rpc('replace_review_report',{p_id:e.id,p_tipo:tipo,p_fingerprint:c.fingerprint,p_new_id:id,p_path:path,p_name:file.name,p_mime:file.type,p_size:file.size});
      if(!current(s))return;await refresh();await render();feedback('Documento sostituito. Il precedente è recuperabile in Versioni precedenti. Ricontrolla e salva Economia.');
    },''),button(options.rotation?'Annulla rotazione':'Annulla sostituzione',render));
  }
  async function versions(tipo){
    const s=state,{data,error}=await sb.from('extra_report_versions').select('*').eq('extra_id',item().extra.id).order('replaced_at',{ascending:false});if(error)throw error;if(!current(s))return;
    const host=$r('content');host.replaceChildren(text('h3','Versioni precedenti'));dispose();$r('actions').replaceChildren(button('Torna al documento',render));
    const list=(data||[]).filter(v=>v.attachment.tipo===tipo);if(!list.length)host.append(text('p','Nessuna versione precedente salvata.'));
    for(const v of list){const line=document.createElement('div');line.className='actions';line.append(text('span',`${new Date(v.replaced_at).toLocaleString('it-IT')} · ${v.attachment.nome_file}`),button('Apri',()=>openAttachment(v.attachment)),button('Ripristina questa versione',async()=>{const response=await fetch(await signedAttachmentUrl(v.attachment));if(!response.ok)throw Error('Impossibile recuperare il documento');const blob=await response.blob();await replacement(new File([blob],v.attachment.nome_file,{type:v.attachment.mime_type||blob.type}),tipo)}));host.append(line)}
  }

  async function build(){
    const s=state;await refresh();if(!current(s))return;
    if(!s.ids.every(id=>approved(s.context.get(id)))){await render();throw Error('Alcuni dati sono cambiati o non ancora verificati. Completa i passaggi.');}
    const issues=economicsZipIssues(s.rows);if(issues.length)throw Error(issues.join('\n'));
    await ensureLibraries('JSZip','ExcelJS','PDFLib');const groups=[];
    for(const cat of ['verde','pulizie']){const rows=s.rows.filter(x=>(x.extra.categoria_target||x.row.pricing_category)===cat).map(x=>({...x,closureNumber:validReview(s.context.get(x.extra.id)).closure_number}));if(!rows.length)continue;
      const book=new window.ExcelJS.Workbook();addEconomicsWorksheet(book,rows,s.period);groups.push({folder:cat==='verde'?'Verde':'Pulizie',rows,excel:await book.xlsx.writeBuffer()});}
    const blob=await buildEconomicsZipUnderLimit(groups,$r('status'));if(!blob||!current(s))return;
    const fresh=await contexts(s.ids);if(!same(s.context,fresh))throw Error('Dati cambiati durante la generazione. Aggiorna e ricontrolla.');
    const zip=await window.JSZip.loadAsync(blob),files=Object.values(zip.files).filter(f=>!f.dir),pdfCount=files.filter(f=>/\.pdf$/i.test(f.name)).length;
    if(pdfCount!==s.rows.length||files.length!==s.rows.length+groups.length)throw Error('Il contenuto ZIP non corrisponde agli extra selezionati.');
    s.final={blob,zip,files,accepted:false,context:fresh};await renderFinal();
  }
  async function renderFinal(){
    dispose();const s=state,f=s.final,host=$r('content');
    $r('body').scrollTop=0;host.replaceChildren(text('h3','Pacchetto pronto · controllo rapido'),text('p',`${s.rows.length} chiusure · ${f.files.length-s.rows.length} Excel · ${(f.blob.size/1000000).toFixed(2)} MB / 10 MB. I documenti e i dati sono già stati verificati. Puoi aprire i file definitivi qui sotto senza riconfermare ogni pagina.`));
    $r('actions').replaceChildren();
    const summary=document.createElement('div');summary.className='pr-sheet';const table=document.createElement('table'),head=document.createElement('tr');
    for(const label of ['Sede','Target','Chiusura','Importo'])head.append(text('th',label));table.append(head);
    for(const x of s.rows){const row=document.createElement('tr');for(const value of [stores.find(v=>v.id===x.extra.store_id)?.nome||x.extra.nome_esterno||'Sede',x.extra.numero_target||'—',validReview(s.context.get(x.extra.id)).closure_number,window.OvergreenEconomics.money(x.calc.total)])row.append(text('td',value));table.append(row)}
    summary.append(table);host.append(summary);
    host.append(text('p','Totale: '+window.OvergreenEconomics.money(s.rows.reduce((n,x)=>n+x.calc.total,0))+' · IVA esclusa'));
    const controls=document.createElement('div');controls.className='pr-nav';const select=document.createElement('select');select.setAttribute('aria-label','File definitivo da visualizzare');
    f.files.forEach((file,i)=>{const option=text('option',file.name);option.value=i;select.append(option)});select.value='0';let index=0;
    const preview=document.createElement('div');preview.id='pr-final-preview';
    const show=async()=>{
      const file=f.files[index];select.value=String(index);preview.replaceChildren(text('h3',file.name));
      if(/\.pdf$/i.test(file.name))await showDocument(preview,await file.async('uint8array'),'application/pdf',file.name);
      else{dispose();const book=new window.ExcelJS.Workbook();await book.xlsx.load(await file.async('uint8array'));if(!current(s))return;const ws=book.worksheets[0],wrap=document.createElement('div');wrap.className='pr-sheet';const sheet=document.createElement('table');for(let i=2;i<=ws.rowCount;i++){const tr=document.createElement('tr');for(let j=1;j<=ws.columnCount;j++)tr.append(text(i===2?'th':'td',formatCell(ws.getRow(i).getCell(j))));sheet.append(tr)}wrap.append(sheet);preview.append(wrap)}
    };
    select.onchange=()=>run(async()=>{index=Number(select.value);await show()});
    controls.append(button('← File',async()=>{index=(index+f.files.length-1)%f.files.length;await show()}),select,button('Apri anteprima',show),button('File →',async()=>{index=(index+1)%f.files.length;await show()}));host.append(controls,preview);
    host.append(text('p','Le anteprime mostrano i file effettivi dello ZIP, dopo la compressione. Il controllo finale è unico: non serve sfogliare di nuovo tutte le pagine.'));
    const label=text('label',''),check=document.createElement('input');check.type='checkbox';check.id='pr-final-accept';check.checked=f.accepted;label.className='pr-final-accept';label.append(check,text('span','Ho controllato il riepilogo e confermo il pacchetto.'));
    check.onchange=()=>{f.accepted=check.checked;syncButtons()};host.append(label);
    const download=button('Conferma e scarica ZIP',async()=>{
      if(!f.accepted)throw Error('Conferma il riepilogo prima di scaricare.');
      const fresh=await contexts(s.ids);if(!same(f.context,fresh)){s.final=null;await refresh();await render();throw Error('Dati cambiati: il pacchetto va rigenerato e ricontrollato.');}
      if(!current(s))return;if(f.blob.size>10000000)throw Error('ZIP oltre 10 MB');
      const url=URL.createObjectURL(f.blob),a=document.createElement('a');a.href=url;a.download=`Overgreen - Verificato - ${s.period||'tutti'}.zip`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);feedback('ZIP scaricato. Nessun invio a Eurospin è stato effettuato.');
    },'');download.id='pr-download';download.disabled=!f.accepted;
    $r('actions').append(download,button('Torna agli extra',render));
  }
  return {open,clearForRole,validReview,approved,same};
})();

async function rotatedReviewFile(file,pageNumber,angle){
  if(![-90,90].includes(angle))throw Error('Rotazione non valida.');
  const name=(file.name||'rapportino').replace(/\.[^.]+$/,'').replace(/-ruotato$/,'');
  if(file.type.includes('pdf')||/\.pdf$/i.test(file.name)){
    await ensureLibraries('PDFLib');const lib=window.PDFLib,doc=await lib.PDFDocument.load(await file.arrayBuffer());
    if(pageNumber<1||pageNumber>doc.getPageCount())throw Error('Pagina non disponibile.');
    const page=doc.getPage(pageNumber-1);page.setRotation(lib.degrees((page.getRotation().angle+angle+360)%360));
    return new File([await doc.save()],name+'-ruotato.pdf',{type:'application/pdf'});
  }
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Formato non supportato per la rotazione.');
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Immagine non leggibile.'));image.src=url});
    const canvas=document.createElement('canvas');canvas.width=img.naturalHeight;canvas.height=img.naturalWidth;
    const ctx=canvas.getContext('2d');ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(angle*Math.PI/180);ctx.drawImage(img,-img.naturalWidth/2,-img.naturalHeight/2);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Rotazione non riuscita.')),'image/png'));
    return new File([blob],name+'-ruotato.png',{type:'image/png'});
  }finally{URL.revokeObjectURL(url)}
}
