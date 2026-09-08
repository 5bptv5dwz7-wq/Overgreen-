/* V203: original photos and PDFs, without document scanning or cropping. */
window.ExtraClosureDocuments=(()=>{
  const targets=['eurospin','overgreen'];
  const files={eurospin:null,overgreen:null},urls={eurospin:null,overgreen:null};
  let options={},busy=false;
  const node=(target,part)=>document.getElementById(`doc-${target}-${part}`);
  const input=target=>document.getElementById(target==='eurospin'?'reportEurospin':'reportOvergreen');
  const existing=target=>options.existing?.(target)||null;
  function release(target){if(urls[target])URL.revokeObjectURL(urls[target]);urls[target]=null;}
  function render(target){
    const file=files[target],saved=existing(target),status=node(target,'status'),preview=node(target,'preview');
    release(target);
    if(!status||!preview)return;
    status.textContent=file?'✓ Pronto da inviare':saved?'✓ Già caricato':'Da aggiungere';
    status.classList.toggle('document-ready',!!(file||saved));
    preview.replaceChildren();
    if(file||saved){
      const name=document.createElement('span');name.className='document-file-name';
      name.textContent=file?.name||saved?.nome_file||'Documento caricato';preview.appendChild(name);
      if(file){
        const url=URL.createObjectURL(file);urls[target]=url;
        if(file.type.startsWith('image/')){
          const img=document.createElement('img');img.src=url;img.alt=`Foto ${target==='eurospin'?'Eurospin':'Overgreen'} selezionata`;
          img.onerror=()=>{img.remove();};preview.appendChild(img);
        }
        const actions=document.createElement('div');actions.className='document-preview-actions';
        const open=document.createElement('a');open.href=url;open.target='_blank';open.rel='noopener';open.textContent='Apri';
        open.setAttribute('aria-label',`Apri documento ${target}`);actions.appendChild(open);
        const remove=document.createElement('button');remove.type='button';remove.className='secondary';remove.textContent='Rimuovi';
        remove.setAttribute('aria-label',`Rimuovi documento ${target} selezionato`);remove.disabled=busy;
        remove.onclick=()=>{if(busy)return;files[target]=null;input(target).value='';node(target,'camera').value='';render(target);};
        actions.appendChild(remove);preview.appendChild(actions);
        if(saved){const hint=document.createElement('small');hint.textContent='Sostituirà il documento già caricato quando salvi.';preview.appendChild(hint);}
      }else{
        const open=document.createElement('button');open.type='button';open.className='secondary';open.textContent='Apri documento';
        open.setAttribute('aria-label',`Apri documento ${target} già caricato`);open.onclick=()=>options.openExisting?.(saved);preview.appendChild(open);
      }
    }
    preview.classList.toggle('hidden',!file&&!saved);
  }
  function select(target,file){
    if(busy||!file)return; // Cancelling the camera or picker keeps the previous document.
    const image=file.type?.startsWith('image/'),pdf=file.type==='application/pdf'||(!file.type&&/\.pdf$/i.test(file.name||''));
    if((!image&&!pdf)||!file.size){options.error?.('Scegli una foto o un PDF valido.');return;}
    files[target]=file;render(target);
  }
  function reset(){for(const target of targets){files[target]=null;input(target).value='';node(target,'camera').value='';render(target);}}
  function setBusy(value){
    busy=value;
    for(const target of targets){
      input(target).disabled=busy;node(target,'camera').disabled=busy;
      node(target,'card')?.classList.toggle('document-busy',busy);
      node(target,'preview')?.querySelectorAll('button').forEach(b=>b.disabled=busy);
    }
  }
  function init(config){
    options=config||{};
    for(const target of targets){
      for(const picker of [input(target),node(target,'camera')])picker.addEventListener('change',()=>{
        const file=picker.files?.[0];picker.value='';select(target,file);
      });
    }
    document.getElementById('closeExtraDialog').addEventListener('close',()=>{if(!busy)reset();});
  }
  return {init,reset,setBusy,get:target=>files[target]||null};
})();
