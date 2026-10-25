/* Optional journey endpoints, separate from work stops. */
(function(root){
 'use strict';
 function point(v){if(!v||typeof v.label!=='string'||!v.label.trim()||v.label.length>500||typeof v.lat!=='number'||typeof v.lon!=='number'||!Number.isFinite(v.lat)||!Number.isFinite(v.lon)||Math.abs(v.lat)>90||Math.abs(v.lon)>180)return null;return {label:v.label.trim(),lat:v.lat,lon:v.lon}}
 function clean(value){return {start:point(value?.start),end:point(value?.end)}}
 if(typeof module==='object'&&module.exports){module.exports={point,clean};return}
 const models={draft:clean(),reuse:clean(),edit:clean()},editors=[];
 const clone=value=>JSON.parse(JSON.stringify(value));
 function homeKey(){return 'overgreen-route-home:'+String(session?.user?.id||'guest')}
 function home(){try{return point(JSON.parse(localStorage.getItem(homeKey())))}catch{return null}}
 function emit(kind,clear=[]){for(const e of editors.filter(e=>e.kind===kind))e.refresh(clear);if(kind==='draft')root.OvergreenStoreMap?.sync()}
 function set(kind,value){models[kind]=clean(value);emit(kind,['start','end'])}
 function get(kind='draft'){return clone(models[kind]||clean())}
 function ready(kind='draft'){for(const e of editors.filter(e=>e.kind===kind&&e.container.isConnected))for(const slot of ['start','end'])if(e.inputs[slot].value.trim())throw Error('Conferma il risultato della ricerca per '+(slot==='start'?'la partenza':'il ritorno')+', oppure svuota il campo.');return get(kind)}
 function createEditor(container,kind='draft'){
  const inputs={},statuses={},results={},tokens={start:0,end:0};
  container.classList.add('route-endpoints-editor');
  container.innerHTML='<p class="route-endpoints-hint">Facoltativi · scegli un indirizzo preciso o una città. Una città indica il suo centro.</p>';
  const editor={container,kind,inputs,refresh(clear=[]){
   for(const slot of ['start','end']){const value=models[kind][slot];container.querySelector('[data-chosen="'+slot+'"]').textContent=value?value.label:'Non impostata';
    if(clear.includes(slot)){tokens[slot]++;inputs[slot].value='';results[slot].replaceChildren();statuses[slot].textContent=''}
   }
  }};
  for(const slot of ['start','end']){
   const section=document.createElement('section');section.className='route-endpoint';
   section.innerHTML='<strong>'+(slot==='start'?'P · Partenza':'R · Ritorno')+'</strong><span data-chosen="'+slot+'"></span><div class="route-endpoint-search"><input type="search" placeholder="Indirizzo o città, es. Genova" aria-label="Cerca '+(slot==='start'?'partenza':'ritorno')+'"><button type="button" data-search>Cerca</button></div><div class="route-endpoint-shortcuts"><button type="button" data-home>Casa</button>'+(slot==='end'?'<button type="button" data-same>Come partenza</button>':'')+'<button type="button" data-save-home>Salva come Casa</button><button type="button" data-clear>Rimuovi</button></div><small role="status"></small><div class="route-endpoint-results"></div>';
   container.append(section);const input=inputs[slot]=section.querySelector('input'),status=statuses[slot]=section.querySelector('small'),list=results[slot]=section.querySelector('.route-endpoint-results');
   const pick=value=>{models[kind][slot]=point(value);emit(kind,[slot])};
   input.oninput=()=>{tokens[slot]++;list.replaceChildren();status.textContent=''};
   async function search(){
    const q=input.value.trim();if(q.length<2){status.textContent='Inserisci un indirizzo o una località.';return}
    const token=++tokens[slot];list.replaceChildren();status.textContent='Ricerca…';const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
    try{
     const response=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=it&limit=5&q='+encodeURIComponent(q),{signal:controller.signal,headers:{Accept:'application/json'}});if(!response.ok)throw Error('Ricerca non disponibile. Riprova tra poco.');const rows=await response.json();
     if(token!==tokens[slot]||!container.isConnected)return;
     const found=rows.map(x=>point({label:x.display_name,lat:Number(x.lat),lon:Number(x.lon)})).filter(Boolean);
     status.textContent=found.length?'Tocca il risultato corretto.':'Nessun risultato: prova con via, civico e comune.';
     for(const value of found){const button=document.createElement('button');button.type='button';button.textContent=value.label;button.onclick=()=>pick(value);list.append(button)}
    }catch(e){if(token===tokens[slot]&&container.isConnected)status.textContent=e.name==='AbortError'?'Ricerca scaduta. Riprova.':e.message}finally{clearTimeout(timer)}
   }
   section.querySelector('[data-search]').onclick=search;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();search()}};
   section.querySelector('[data-home]').onclick=()=>{const value=home();if(value)pick(value);else{status.textContent='Cerca il tuo indirizzo, scegli il risultato e premi “Salva come Casa”.';input.focus()}};
   section.querySelector('[data-save-home]').onclick=()=>{const value=models[kind][slot];if(!value||input.value.trim()){status.textContent='Prima scegli e conferma una posizione.';return}try{localStorage.setItem(homeKey(),JSON.stringify(value));status.textContent='Casa memorizzata su questo dispositivo.'}catch{status.textContent='Impossibile memorizzare Casa su questo dispositivo.'}};
   section.querySelector('[data-clear]').onclick=()=>pick(null);
   section.querySelector('[data-same]')?.addEventListener('click',()=>{if(!models[kind].start){status.textContent='Imposta prima la partenza.';return}pick(models[kind].start)});
  }
  editors.push(editor);editor.refresh();return editor;
 }
 function mount(formId,kind){const form=document.getElementById(formId);if(!form)return;const details=document.createElement('details');details.className='route-endpoints-panel';details.innerHTML='<summary>Partenza e ritorno del giro</summary>';const content=document.createElement('div');details.append(content);form.querySelector('[type="submit"]').before(details);createEditor(content,kind)}
 function summary(value){const ep=clean(value);if(!ep.start&&!ep.end)return '';return '<p class="route-endpoints-summary">'+[ep.start?'Partenza: '+esc(ep.start.label):'',ep.end?'Ritorno: '+esc(ep.end.label):''].filter(Boolean).join('<br>')+'</p>'}
 async function editRecord(table,record){
  if(!admin())return;set('edit',record.route_endpoints);const dialog=document.createElement('dialog');dialog.className='route-endpoints-dialog';dialog.innerHTML='<div class="dialog-head"><h2>Partenza e ritorno</h2><button type="button" data-dismiss aria-label="Chiudi">×</button></div><div data-editor></div><p role="status" data-status></p><button type="button" data-save>Salva</button>';
  const editor=createEditor(dialog.querySelector('[data-editor]'),'edit');document.body.append(dialog);dialog.showModal();dialog.querySelector('[data-dismiss]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{editors.splice(editors.indexOf(editor),1);dialog.remove()});
  dialog.querySelector('[data-save]').onclick=async e=>{const button=e.currentTarget;button.disabled=true;try{const value=ready('edit');let q=sb.from(table).update({route_endpoints:value}).eq('id',record.id);if(record.updated_at)q=q.eq('updated_at',record.updated_at);const {data,error}=await q.select('id,route_endpoints,updated_at').single();if(error||!data)throw error||Error('Il giro è cambiato: aggiorna e riprova.');Object.assign(record,data);dialog.close();renderSchedules();renderSavedRoutes();toast('Partenza e ritorno salvati')}catch(err){dialog.querySelector('[data-status]').textContent=err.message}finally{button.disabled=false}};
 }
 root.OvergreenRouteEndpoints={get,set,ready,createEditor,summary,editRecord,reset(){set('draft',{})}};
 mount('scheduleForm','draft');mount('reuseScheduleForm','reuse');
})(typeof globalThis!=='undefined'?globalThis:this);
