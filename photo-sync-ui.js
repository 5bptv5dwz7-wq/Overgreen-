/* V206 integration: normal closures, legacy queues and admin/worker recovery. */
let photoDelivery=null,photoDeliveryUiTimer=null,photoRecoveryStarting=null,photoRemoteRows=[],photoRemoteError='',photoAppRefreshTimer=null;
function afterPhotoProgress(id){
  flushReadyClosureNotifications(id).catch(()=>{});
  if(!ordinarySaveBusy){clearTimeout(photoAppRefreshTimer);photoAppRefreshTimer=setTimeout(()=>loadAll().catch(e=>console.warn('Aggiornamento foto:',e.message)),500)}
}
function photoActor(){return session?.user?.id&&profile?.id?{callerId:session.user.id,profileId:profile.id}:null}
async function photoHttp(path,body,method='POST',blob=null){
  const who=photoActor(),token=session?.access_token;if(!who||!token)throw Object.assign(new Error('Accedi per riprendere l’invio delle foto.'),{status:401});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
  try{
    const response=await fetch(cfg.supabaseUrl+path,{method,signal:controller.signal,headers:{apikey:cfg.supabaseKey,Authorization:'Bearer '+token,'Content-Type':blob?(blob.type||'image/jpeg'):'application/json',...(blob?{'x-upsert':'true','cache-control':'max-age=3600'}:{})},body:method==='GET'?undefined:blob||JSON.stringify(body)});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Object.assign(new Error(data.message||data.error_description||data.error||'Invio non riuscito'),{status:response.status,code:data.code});
    return data;
  }catch(e){if(e.name==='AbortError')throw Object.assign(new Error('Connessione troppo lenta: l’invio verrà ritentato.'),{code:'TIMEOUT'});throw e}finally{clearTimeout(timer)}
}
const photoRpc=(name,args)=>photoHttp('/rest/v1/rpc/'+name,args);
function photoQueue(){
  if(photoDelivery)return photoDelivery;
  photoDelivery=OvergreenPhotoSync.create({indexedDB,locks:navigator.locks,actor:photoActor,compress:compressImage,
    changed(){clearTimeout(photoDeliveryUiTimer);photoDeliveryUiTimer=setTimeout(()=>updateSyncUi().catch(()=>{}),100)},
    receivedIntervention(row){const n=interventions.findIndex(i=>i.id===row.id);if(n<0)interventions.unshift(row);else interventions[n]=row;afterPhotoProgress(row.id)},
    receivedPhoto(result){if(result.attachment&&!attachments.some(a=>a.id===result.attachment.id))attachments.push(result.attachment);if(result.intervention){const i=interventions.find(i=>i.id===result.intervention.id);if(i)Object.assign(i,result.intervention);afterPhotoProgress(result.intervention.id)}},
    ackLegacy:acknowledgeLegacyPhoto,
    api:{
      submit:(row,photos)=>photoRpc('overgreen_save_ordinary_v206',{p_request:row.args,p_photos:photos.map(p=>({id:p.id,name:p.fileName,bytes:p.file.size}))}),
      register:job=>photoRpc('overgreen_register_photo_v206',{p_id:job.id,p_intervention_id:job.interventionId,p_name:job.fileName||'foto.jpg',p_bytes:job.file?.size||0,p_actor_id:job.actorProfileId}),
      finalize:job=>photoRpc('overgreen_finalize_photo_v206',{p_id:job.id}),
      event:(job,stage,error)=>photoRpc('overgreen_photo_event_v206',{p_id:job.id,p_stage:stage,p_attempt:job.attempts||job.retries||0,p_error:error}),
      upload:job=>photoHttp('/storage/v1/object/documenti/'+job.storagePath.split('/').map(encodeURIComponent).join('/'),null,'POST',job.file)
    }
  });return photoDelivery;
}
async function legacyPhotoDb(name,store,fn,write=false){return new Promise((resolve,reject)=>{
  const request=indexedDB.open(name,1);let expired=false;
  const timer=setTimeout(()=>{expired=true;reject(new Error('La vecchia coda foto non risponde. Riprova il recupero.'))},12000);
  request.onerror=()=>{clearTimeout(timer);reject(request.error)};
  request.onsuccess=()=>{const db=request.result;if(expired){db.close();return}if(!db.objectStoreNames.contains(store)){clearTimeout(timer);db.close();resolve([]);return}
    const tx=db.transaction(store,write?'readwrite':'readonly');let result;try{result=fn(tx.objectStore(store))}catch(e){clearTimeout(timer);db.close();reject(e);return}
    tx.oncomplete=()=>{clearTimeout(timer);db.close();resolve(result?.result||[])};tx.onerror=tx.onabort=()=>{clearTimeout(timer);db.close();reject(tx.error||new Error('Lettura vecchia coda interrotta'))};
  };
})}
async function legacyPhotoRows(){
  const results=await Promise.allSettled([legacyPhotoDb('overgreen-upload-queue-v1','jobs',s=>s.getAll()),legacyPhotoDb('overgreen-photo-recovery-v1','photos',s=>s.getAll())]);
  const byId=new Map();for(const r of results)if(r.status==='fulfilled')for(const row of r.value){const old=byId.get(row.id);if(!old||(!old.file&&row.file))byId.set(row.id,row)}
  if(results.some(r=>r.status==='rejected'))photoRemoteError='Una vecchia coda non è leggibile: riprova il recupero su questo telefono.';
  return [...byId.values()];
}
async function acknowledgeLegacyPhoto(job){
  await legacyPhotoDb('overgreen-upload-queue-v1','jobs',s=>s.delete(job.id),true);
  await legacyPhotoDb('overgreen-photo-recovery-v1','photos',s=>{const r=s.get(job.id);r.onsuccess=()=>{if(r.result)s.put({...r.result,uploadedAt:Date.now(),storagePath:job.storagePath})}},true);
}
async function cleanupPhotoRecoveryRows(){await photoQueue().cleanup();const cut=Date.now()-7*86400000;await legacyPhotoDb('overgreen-photo-recovery-v1','photos',s=>{const r=s.openCursor();r.onsuccess=()=>{const c=r.result;if(c){if(c.value.uploadedAt&&c.value.uploadedAt<cut)c.delete();c.continue()}}},true).catch(()=>{});/* Unsynced legacy copies are retained until receipt. */}
async function markInterventionPhotoUpload(id,status,error=null){const r=await syncPhotoMetadata(id,status,error);if(r.error)throw r.error;return r.data}
async function waitForPhotoQueue(){let timer;try{await Promise.race([photoQueue().run(),new Promise(resolve=>{timer=setTimeout(resolve,12000)})])}finally{clearTimeout(timer)}}
async function getUploadJobs(){return (await photoQueue().snapshot()).jobs}
async function startPhotoRecovery(force=false){
  if(photoRecoveryStarting)return photoRecoveryStarting;if(!photoActor())return;
  photoRecoveryStarting=(async()=>{
    // Best effort persistence request never blocks saving or recovery.
    if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
    const who=photoActor(),rows=await legacyPhotoRows();
    // Very old rows without an actor may only be adopted when their intervention
    // is attributed to the current worker; an admin never adopts another queue.
    for(const row of rows)if(!row.actorProfileId){const i=interventions.find(i=>i.id===row.interventionId);if(i&&(i.closed_by||i.inserito_da)===who.profileId)row.actorProfileId=who.profileId}
    await photoQueue().restore(rows);
    const backups=(await photoQueue().db.all('photos')).filter(p=>!p.uploadedAt);await photoQueue().restore(backups);
    if(force)await photoQueue().retry();else await photoQueue().resume();
    await refreshPhotoDeliveryStatus();
    await flushReadyClosureNotifications().catch(()=>{});
  })().catch(e=>{photoRemoteError=e.message;updateSyncUi().catch(()=>{});throw e}).finally(()=>photoRecoveryStarting=null);return photoRecoveryStarting;
}
async function processUploadQueue(){return startPhotoRecovery().catch(e=>console.warn('Ripresa foto:',e.message))}
async function retryUploads(){try{await startPhotoRecovery(true);await updateSyncUi()}catch(e){alert(e.message)}}
function localInterventionPhotoCount(id){return new Set(attachments.filter(a=>a.intervention_id===id&&a.tipo==='foto_generica').map(a=>a.storage_path)).size}
function photoMismatchRows(){return interventions.filter(i=>i.stato!=='rifiutato'&&Number(i.foto_attese)>localInterventionPhotoCount(i.id))}
function employeePhotoMismatchRows(){if(!profile||admin())return [];return photoMismatchRows().filter(i=>i.closed_by===profile.id||i.inserito_da===profile.id||interventionWorkers.some(w=>w.intervention_id===i.id&&w.profile_id===profile.id))}
async function localRecoverablePhotoCount(){const ids=new Set(employeePhotoMismatchRows().map(i=>i.id));return (await photoQueue().snapshot()).jobs.filter(j=>j.file&&ids.has(j.interventionId)).length}
async function repairEmployeePhotoSync(button=null){const old=button?.textContent;if(button){button.disabled=true;button.textContent='Recupero foto…'}try{await startPhotoRecovery(true);await loadAll();setView('settings');await renderPhotoDeliveryDetails()}catch(e){alert(e.message)}finally{if(button){button.disabled=false;button.textContent=old}}}
async function refreshPhotoDeliveryStatus(){
  if(!photoActor())return;
  const result=await sb.from('intervention_photo_uploads').select('*').order('created_at',{ascending:false}).limit(1000);
  if(result.error){photoRemoteError='Dettagli sul server non disponibili: '+result.error.message;return}
  photoRemoteError='';photoRemoteRows=result.data||[];
  // Reconcile objects already uploaded when the receipt response was lost.
  const ids=[...new Set(photoRemoteRows.filter(p=>p.stage!=='received').map(p=>p.intervention_id))];
  for(const id of ids){try{const r=await photoRpc('overgreen_reconcile_photos_v206',{p_intervention_id:id});if(r.intervention){const i=interventions.find(i=>i.id===id);if(i)Object.assign(i,r.intervention)}for(const a of r.attachments||[])if(!attachments.some(x=>x.id===a.id))attachments.push(a)}catch(e){photoRemoteError=e.message}}
  await updateSyncUi();
}
function photoStageLabel(stage){return {queued:'In coda',uploading:'Invio in corso',verifying:'Verifica ricezione',retrying:'Nuovo tentativo previsto',blocked:'Serve un intervento',received:'Ricevuta dal server'}[stage]||'In attesa'}
async function updateSyncUi(){
  if(!photoActor())return;
  let state;try{state=await photoQueue().snapshot()}catch(e){state={jobs:[],submissions:[],error:'Archivio locale non accessibile: '+e.message}}
  const pending=state.submissions.filter(s=>!s.result),missing=admin()?photoMismatchRows():employeePhotoMismatchRows(),blocked=state.jobs.filter(j=>j.blocked).length;
  const old=missing.some(i=>Date.now()-new Date(i.closed_at||i.created_at).getTime()>10*60*1000);
  const text=state.error?state.error:pending.length?`☁️ ${pending.length} chiusur${pending.length===1?'a':'e'} conservat${pending.length===1?'a':'e'} sul telefono · invio da completare`:blocked?`⚠️ ${blocked} foto da recuperare · apri dettagli`:state.running?`⬆️ Invio foto in corso · ${state.jobs.length} in coda`:state.jobs.length?`☁️ ${state.jobs.length} foto conservate sul telefono · ripresa automatica`:missing.length?`⚠️ ${missing.length} intervent${missing.length===1?'o':'i'} con foto mancanti${old?' · verifica necessaria':''}`:'✓ Tutte le foto ricevute';
  for(const id of ['backgroundSyncStatus','photoRepairStatus'])if($(id))$(id).textContent=text;
  const badge=$('syncFloatingBadge');if(badge){badge.textContent=text;badge.classList.toggle('hidden',!state.error&&!pending.length&&!state.jobs.length&&!missing.length);badge.classList.toggle('sync-error',!!state.error||blocked>0||old);badge.onclick=()=>{setView('settings');$('photoDeliveryDetails')?.scrollIntoView({block:'start',behavior:'smooth'})}}
  await renderPhotoDeliveryDetails(state);
}
async function renderPhotoDeliveryDetails(state=null){
  let host=$('photoDeliveryDetails');if(!host){const parent=$('photoRepairStatus')?.parentElement;if(!parent)return;host=document.createElement('div');host.id='photoDeliveryDetails';parent.appendChild(host)}
  state=state||await photoQueue().snapshot();host.innerHTML='';
  if(photoRemoteError){const p=document.createElement('p');p.className='error';p.textContent=photoRemoteError;host.appendChild(p)}
  for(const s of state.submissions.filter(s=>!s.result)){
    const row=document.createElement('div');row.className='photo-delivery-row';row.innerHTML=`<strong>${esc(s.siteName||'Intervento')} · chiusura da inviare</strong><p>${esc(s.lastError||'Richiesta e foto conservate su questo telefono. L’invio riprenderà automaticamente.')}</p>`;host.appendChild(row);
  }
  const visible=admin()?photoMismatchRows():employeePhotoMismatchRows();
  for(const i of visible){
    const site=stores.find(s=>s.id===i.store_id),received=localInterventionPhotoCount(i.id),jobs=state.jobs.filter(j=>j.interventionId===i.id),remote=photoRemoteRows.filter(p=>p.intervention_id===i.id&&p.stage!=='received');
    const row=document.createElement('div');row.className='photo-delivery-row';
    row.innerHTML=`<strong>${esc(site?.nome||'Intervento')} · ${received}/${Number(i.foto_attese)} foto</strong><small>${esc(fmt(i.data_intervento))}${i.stato==='convalidato'?' · già convalidato':''}</small>`;
    const messages=jobs.length?jobs.map(j=>`${j.fileName||'Foto'}: ${photoStageLabel(j.lastStage)}${j.lastError?' · '+j.lastError:''}`):remote.length?remote.map(p=>`${p.file_name}: ${photoStageLabel(p.stage)}${p.last_error?' · '+p.last_error:''}`):[i.photo_upload_error||'Nessuna ricezione confermata. Cerca le copie sul telefono usato per scattare le foto.'];
    for(const message of messages){const p=document.createElement('p');p.textContent=message;row.appendChild(p)}
    const controls=document.createElement('div');controls.className='actions';
    if(admin()){const recover=document.createElement('button');recover.type='button';recover.className='secondary compact-btn';recover.textContent='Cerca foto già arrivate';recover.onclick=()=>recoverInterventionPhotosFromStorage(i,recover);controls.appendChild(recover)}
    const label=document.createElement('label');label.className='file-label compact-photo-input';label.textContent='Aggiungi foto mancanti';const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;
    input.onchange=async()=>{const files=[...input.files];input.value='';if(!files.length)return;const missing=Math.max(0,Number(i.foto_attese)-localInterventionPhotoCount(i.id));if(files.length>missing)return alert(`Mancano ${missing} foto: selezionane al massimo ${missing}.`);
      if(!confirm(`Aggiungere ${files.length} foto a ${site?.nome||'questo intervento'}? Usa le foto del lavoro originale.`))return;
      try{await photoQueue().attach(i.id,files,files.map(()=>crypto.randomUUID()),site?.nome);await photoQueue().run();await refreshPhotoDeliveryStatus();await loadAll()}catch(e){alert(e.message)}
    };label.appendChild(input);controls.appendChild(label);row.appendChild(controls);host.appendChild(row);
  }
}
window.addEventListener('online',()=>startPhotoRecovery().catch(()=>{}));
window.addEventListener('pageshow',()=>{if(photoActor())startPhotoRecovery().catch(()=>{})});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&photoActor())startPhotoRecovery().catch(()=>{})});
setInterval(()=>{if(document.visibilityState==='visible'&&photoActor()&&photoMismatchRows().length)refreshPhotoDeliveryStatus().catch(()=>{})},60000);
