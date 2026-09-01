const APP_VERSION='V112-63';
const cfg = window.OVERGREEN_CONFIG;
if (!cfg?.supabaseUrl || !cfg?.supabaseKey) throw new Error('Configurazione Supabase mancante.');
if (!window.supabase?.createClient) throw new Error('Libreria Supabase non caricata.');
const REMEMBER_ACCESS_KEY='overgreen-remember-access-v1';
const IMPERSONATE_PROFILE_KEY='overgreen-impersonated-profile-v1';
if(localStorage.getItem(REMEMBER_ACCESS_KEY)===null)localStorage.setItem(REMEMBER_ACCESS_KEY,'1');
const authStorage={
  getItem(key){return (localStorage.getItem(REMEMBER_ACCESS_KEY)==='1'?localStorage:sessionStorage).getItem(key)},
  setItem(key,value){const target=localStorage.getItem(REMEMBER_ACCESS_KEY)==='1'?localStorage:sessionStorage;target.setItem(key,value);const other=target===localStorage?sessionStorage:localStorage;other.removeItem(key)},
  removeItem(key){localStorage.removeItem(key);sessionStorage.removeItem(key)}
};
const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:authStorage}});
const SEED_STORES=[{"name": "ABBIATEGRASSO", "lastDone": "2026-06-17"}, {"name": "ACQUI TERME", "lastDone": "2026-06-30"}, {"name": "ALBANO SAN ALESSANDRO", "lastDone": "2026-07-07"}, {"name": "ALESSANDRIA MOCCAGATTA", "lastDone": "2026-07-14"}, {"name": "ALESSANDRIA MOISA", "lastDone": "2026-07-14"}, {"name": "ARENZANO", "lastDone": "2026-06-15"}, {"name": "ASOLA", "lastDone": "2026-07-09"}, {"name": "ASTI", "lastDone": "2026-07-13"}, {"name": "BAGNOLO MELLA", "lastDone": "2026-07-08"}, {"name": "BEINASCO", "lastDone": "2026-07-03"}, {"name": "BELLINZAGO LOMBARDO", "lastDone": "2026-06-11"}, {"name": "BERGAMO", "lastDone": "2026-07-07"}, {"name": "BESANA IN BRIANZA", "lastDone": "2026-07-11"}, {"name": "BIELLA", "lastDone": "2026-06-30"}, {"name": "BOLLADELLO DI CAIRATE", "lastDone": "2026-07-01"}, {"name": "BORGARO TORINESE", "lastDone": "2026-07-01"}, {"name": "BOZZOLO", "lastDone": "2026-07-09"}, {"name": "BRONI", "lastDone": "2026-07-15"}, {"name": "BRUGHIERO", "lastDone": "2026-06-11"}, {"name": "BUSTO ARSIZIO", "lastDone": "2026-06-23"}, {"name": "CAIRO MONTENOTTE", "lastDone": "2026-07-07"}, {"name": "CANELLI", "lastDone": "2026-07-14"}, {"name": "CANTÙ", "lastDone": "2026-07-11"}, {"name": "CAPRIOLO", "lastDone": "2026-07-07"}, {"name": "CARPENEDOLO", "lastDone": "2026-07-09"}, {"name": "CASALE MONFERRATO", "lastDone": "2026-06-11"}, {"name": "CASALMAGGIORE", "lastDone": "2026-07-09"}, {"name": "CASARZA LIGURE", "lastDone": "2026-06-16"}, {"name": "CASTEL MELLA", "lastDone": "2026-07-08"}, {"name": "CASTELLETTO SOPRA TICINO", "lastDone": "2026-06-22"}, {"name": "CASTELMARTE", "lastDone": "2026-07-10"}, {"name": "CASTIGLIONE DELLE STIEVERE", "lastDone": "2026-07-09"}, {"name": "CERIALE", "lastDone": "2026-07-07"}, {"name": "CHIARI", "lastDone": "2026-07-07"}, {"name": "CHIVASSO", "lastDone": "2026-06-30"}, {"name": "COLLEGNO", "lastDone": "2026-07-02"}, {"name": "COMO", "lastDone": "2026-07-11"}, {"name": "CORBETTA", "lastDone": "2026-06-26"}, {"name": "COSTA VOLPINO", "lastDone": "2026-07-10"}, {"name": "COURGNE", "lastDone": "2026-07-01"}, {"name": "CREMONA", "lastDone": "2026-07-07"}, {"name": "CUVEGLIO", "lastDone": "2026-06-22"}, {"name": "DESENZANO DEL GARDA", "lastDone": "2026-07-08"}, {"name": "DOMODOSSOLA", "lastDone": "2026-06-21"}, {"name": "FINO MORNASCO", "lastDone": "2026-07-11"}, {"name": "FOLLO", "lastDone": "2026-06-16"}, {"name": "FOSSANO", "lastDone": "2026-06-03"}, {"name": "GALLARATE", "lastDone": "2026-07-16"}, {"name": "GENOVA PEGLI", "lastDone": "2026-06-15"}, {"name": "GREGGIO", "lastDone": "2026-06-22"}, {"name": "INVERUNO", "lastDone": "2026-07-15"}, {"name": "JERAGO CON ORAGO", "lastDone": "2026-07-16"}, {"name": "LA SPEZIA", "lastDone": "2026-06-16"}, {"name": "LAINATE", "lastDone": "2026-07-13"}, {"name": "LENO", "lastDone": "2026-07-08"}, {"name": "LENTATE SUL SEVESO", "lastDone": "2026-07-11"}, {"name": "LIMBIATE", "lastDone": "2026-06-24"}, {"name": "LOMAZZO", "lastDone": "2026-07-11"}, {"name": "LUINO", "lastDone": "2026-06-22"}, {"name": "MALNATE", "lastDone": "2026-06-30"}, {"name": "MANERBIO", "lastDone": "2026-07-08"}, {"name": "MANTOVA", "lastDone": "2026-07-09"}, {"name": "MANTOVA TRICERONE", "lastDone": "2026-07-10"}, {"name": "MAZZANO", "lastDone": "2026-07-08"}, {"name": "MILANO BAGAROTTI", "lastDone": "2026-07-13"}, {"name": "MILANO BISCEGLIE", "lastDone": "2026-07-13"}, {"name": "MILANO DE ANDRE", "lastDone": "2026-06-17"}, {"name": "MILANO SARCA", "lastDone": "2026-06-10"}, {"name": "MILANO ZANTE", "lastDone": "2026-06-16"}, {"name": "MODIGNANI", "lastDone": "2026-06-10"}, {"name": "MONTALDO DORA", "lastDone": "2026-06-30"}, {"name": "MONTICHIARI", "lastDone": "2026-07-09"}, {"name": "MORTARA", "lastDone": "2026-06-12"}, {"name": "NICHELINO", "lastDone": "2026-06-03"}, {"name": "NOVARA", "lastDone": "2026-06-23"}, {"name": "NOVI LIGURE", "lastDone": "2026-07-14"}, {"name": "OGGIONO", "lastDone": "2026-07-10"}, {"name": "OLEGGIO", "lastDone": "2026-06-22"}, {"name": "OLGIATE OLONA", "lastDone": "2026-07-15"}, {"name": "ORBASSANO", "lastDone": "2026-07-03"}, {"name": "ORZINUOVI", "lastDone": "2026-07-07"}, {"name": "PALAZZOLO SULL’OGLIO", "lastDone": "2026-07-07"}, {"name": "PIEVE EMANUELE", "lastDone": "2026-06-17"}, {"name": "PIOLTELLO", "lastDone": "2026-06-11"}, {"name": "PIOSSASCO", "lastDone": "2026-07-02"}, {"name": "POGGIO RUSCO", "lastDone": "2026-07-10"}, {"name": "PONTEVICO", "lastDone": "2026-07-08"}, {"name": "QUINZANO D’OGLIO", "lastDone": "2026-07-07"}, {"name": "RIVAROLO CANAVESE", "lastDone": "2026-07-01"}, {"name": "RIVOLI", "lastDone": "2026-07-02"}, {"name": "ROBECCHETTO CON INDUNO", "lastDone": "2026-06-23"}, {"name": "ROMENTINO CEDI", "lastDone": "2026-07-04"}, {"name": "ROZZANO", "lastDone": "2026-06-30"}, {"name": "SAINT CHRISTOPHE", "lastDone": "2026-06-30"}, {"name": "SAN GIORGIO SU LEGNANO", "lastDone": "2026-07-15"}, {"name": "SAN GIULIANO MILANESE PARCO", "lastDone": "2026-07-06"}, {"name": "SAN GIULIANO MILANESE PV", "lastDone": "2026-07-06"}, {"name": "SAN MAURIZIO CANAVESE", "lastDone": "2026-07-01"}, {"name": "SANTHIA", "lastDone": "2026-06-22"}, {"name": "SARONNO", "lastDone": "2026-07-06"}, {"name": "SARZANA", "lastDone": "2026-06-16"}, {"name": "SAVIGLIANO", "lastDone": "2026-06-03"}, {"name": "SEGRATE", "lastDone": "2026-06-11"}, {"name": "SERIATE", "lastDone": "2026-07-07"}, {"name": "SETTIMO TORINESE", "lastDone": "2026-06-30"}, {"name": "TIRINO GROSSETO", "lastDone": "2026-07-02"}, {"name": "TORINO CIGNA", "lastDone": "2026-07-02"}, {"name": "TORINO GARRONE", "lastDone": "2026-07-03"}, {"name": "TORINO PIRANO", "lastDone": "2026-07-02"}, {"name": "TORINO VERCELLI", "lastDone": "2026-07-02"}, {"name": "TORTONA", "lastDone": "2026-07-15"}, {"name": "TREZZANO SUL NAVIGLIO", "lastDone": "2026-05-31"}, {"name": "VADO LIGURE", "lastDone": "2026-07-07"}, {"name": "VALENZA", "lastDone": "2026-07-14"}, {"name": "VERCELLI BORMIDA", "lastDone": "2026-06-25"}, {"name": "VERCELLI TRATTATO DI ROMA", "lastDone": "2026-06-25"}, {"name": "VERGIATE", "lastDone": "2026-06-22"}, {"name": "VIGEVANO", "lastDone": "2026-06-12"}, {"name": "VILLA DI TIRANO", "lastDone": "2026-07-10"}, {"name": "VILLA GUARDIA", "lastDone": "2026-07-11"}, {"name": "VILLADOSSOLA", "lastDone": "2026-06-22"}, {"name": "VOGHERA", "lastDone": "2026-07-15"}, {"name": "RHO", "lastDone": "2026-06-10"}];
const $=id=>document.getElementById(id);
let session=null,profile=null,realProfile=null,profiles=[],managedUsers=[],stores=[],interventions=[],schedules=[],scheduleMembers=[],scheduleItems=[],extras=[],extraWorkers=[],interventionWorkers=[],attachments=[],extraWorkItems=[],extraWorkItemPhotos=[],extraWorkItemNotes=[],savedRoutes=[],savedRouteItems=[],signatureSheets=[],auditLogs=[],auditPage=0,auditHasMore=false,companyDocuments=[],companyDocumentReads=[],archiveCategory='modulistica',workContacts=[],contactStores=[],scheduleActivities=[],scheduleActivityPhotos=[];
let combinedExtraClosureQueue=[];
let storeFilter='all',storeClientFilter='all',extraClientFilter='all',scheduleClientFilter='all',scheduleWorkerFilter='all',scheduleDateFilter='all',scheduleExactDate=null;
let loadAllPromise=null,currentHistoryStoreId=null;
let startupPerf={auth:0,rollover:0,supabase:0,render:0,total:0};
function renderStartupPerf(){const el=$('startupPerf');if(!el)return;const p=startupPerf;el.innerHTML=`Avvio: <strong>${(p.total/1000).toFixed(2)} s</strong> · Supabase ${(p.supabase/1000).toFixed(2)} s · render ${(p.render/1000).toFixed(2)} s${p.rollover?` · rollover ${(p.rollover/1000).toFixed(2)} s`:''}`;el.title='Tocca per vedere i tempi dettagliati';el.onclick=()=>alert(`Diagnostica avvio\nTotale: ${Math.round(p.total)} ms\nSupabase: ${Math.round(p.supabase)} ms\nRendering: ${Math.round(p.render)} ms\nRollover: ${Math.round(p.rollover)} ms`)}
let historyEditPhotoFiles=[];
let donePhotoFiles=[];
let closeExtraPhotoFiles=[];
let activityCompletePhotoFiles=[];

// ---- V112-53 · programmazione compatta: Maps / Eseguito / Elimina su una riga ----
// V112-50 · Target evidente nella testata PDF senza occupare spazio foto ----
// ---- V112-39 · Dashboard: da fare prima, eseguiti sotto in ordine reale di chiusura ----
// ---- V112-38 · Extra già creati aggiungibili/spostabili nelle giornate esistenti ----
// ---- V112-37 · Upload foto senza dipendenza da navigator.onLine ----
const PUSH_VAPID_PUBLIC_KEY='BDOq-eaSnfxLf1MBpFqfu02KfKS6G166bX02n-etWusn2JGZjpWVqDlMN3nuH7hf2ts13EZCV4UJ_hm2IevChQo';
let notificationDeepLinkHandled=false;
function pushKeyBytes(base64String){const padding='='.repeat((4-base64String.length%4)%4),base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}
async function currentPushSubscription(){if(!('serviceWorker' in navigator))return null;const reg=await navigator.serviceWorker.ready;return reg.pushManager.getSubscription()}
async function refreshPushSettingsUi(){
  const status=$('pushNotificationStatus'),btn=$('pushNotificationToggle');if(!status||!btn)return;
  if(!admin()){status.textContent='Disponibile solo per amministratori.';btn.classList.add('hidden');return}
  if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window)){status.textContent='Questo dispositivo/browser non supporta le notifiche push.';btn.disabled=true;return}
  try{const sub=await currentPushSubscription();const enabled=!!sub&&Notification.permission==='granted';status.textContent=enabled?'🟢 Notifiche attive su questo dispositivo':Notification.permission==='denied'?'🔴 Notifiche bloccate nelle impostazioni del dispositivo':'⚪ Notifiche non attive';btn.textContent=enabled?'Disattiva notifiche':'Attiva notifiche';btn.dataset.enabled=enabled?'1':'0'}catch(err){status.textContent='Stato notifiche non disponibile';console.warn(err)}
}
function ensurePushSettingsUi(){
  const host=$('cloudAccountSettings')?.parentElement||$('settingsView');if(!host||$('pushSettingsCard'))return;
  const card=document.createElement('section');card.id='pushSettingsCard';card.className='panel admin-only';card.innerHTML=`<h2>🔔 Notifiche chiusure</h2><p class="muted">Ricevi una push quando un dipendente chiude un intervento ordinario o un extra.</p><p id="pushNotificationStatus" class="muted">Verifica in corso…</p><button id="pushNotificationToggle" type="button" class="secondary">Attiva notifiche</button><p class="muted">Su iPhone la web app deve essere aggiunta alla schermata Home.</p>`;host.appendChild(card);
  $('pushNotificationToggle').onclick=toggleAdminPushNotifications;refreshPushSettingsUi();
}
async function toggleAdminPushNotifications(){
  const btn=$('pushNotificationToggle');if(!btn||!admin())return;btn.disabled=true;
  try{
    const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
    if(sub){const endpoint=sub.endpoint;await sub.unsubscribe();const r=await sb.from('push_subscriptions').delete().eq('endpoint',endpoint).eq('user_id',session.user.id);if(r.error)throw r.error;toast('Notifiche disattivate');return}
    const permission=await Notification.requestPermission();if(permission!=='granted')throw new Error('Autorizzazione alle notifiche non concessa.');
    sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKeyBytes(PUSH_VAPID_PUBLIC_KEY)});
    const json=sub.toJSON(),payload={user_id:session.user.id,profile_id:profile.id,endpoint:sub.endpoint,p256dh:json.keys?.p256dh,auth:json.keys?.auth,user_agent:navigator.userAgent,active:true,last_seen_at:new Date().toISOString()};
    const r=await sb.from('push_subscriptions').upsert(payload,{onConflict:'endpoint'});if(r.error){await sub.unsubscribe();throw r.error}
    toast('Notifiche attivate');
  }catch(err){alert(err.message||String(err))}finally{btn.disabled=false;refreshPushSettingsUi()}
}
async function notifyAdminClosure(kind,id,photoCount=0){
  if(profile?.ruolo==='admin'||!id)return false;
  try{const {data,error}=await sb.functions.invoke('notify-admin-closure',{body:{kind,id,photo_count:Number(photoCount)||0}});if(error)throw error;if(data?.error)throw new Error(data.error);if(data?.waiting_photos||Number(data?.sent)===0)return false;return true}catch(err){console.warn('Notifica push non inviata:',err?.message||err);return false}
}
function handleNotificationDeepLink(){
  if(notificationDeepLinkHandled)return;const u=new URL(location.href),kind=u.searchParams.get('notificationKind'),id=u.searchParams.get('notificationId');if(!kind||!id)return;notificationDeepLinkHandled=true;
  setTimeout(()=>{try{if(kind==='extra')openExtraById(id);else if(kind==='intervention'){const i=interventions.find(x=>x.id===id),st=stores.find(x=>x.id===i?.store_id);if(st)showHistory(st)}}catch(e){console.warn('Apertura notifica fallita',e)}finally{u.searchParams.delete('notificationKind');u.searchParams.delete('notificationId');history.replaceState(null,'',u.pathname+u.search+u.hash)}},350);
}

// V112-35: una chiusura ordinaria con foto diventa notificabile/convalidabile solo
// quando il numero di foto realmente registrate su Supabase raggiunge quello atteso.
async function interventionPhotoSyncState(interventionId){
  const [ir,ar]=await Promise.all([
    sb.from('interventions').select('id,stato,closed_by,foto_attese,foto_sincronizzate,photo_sync_notified_at').eq('id',interventionId).maybeSingle(),
    sb.from('attachments').select('id',{count:'exact',head:true}).eq('intervention_id',interventionId).eq('tipo','foto_generica')
  ]);
  if(ir.error)throw ir.error;if(ar.error)throw ar.error;
  const expected=Math.max(0,Number(ir.data?.foto_attese)||0),actual=Math.max(0,Number(ar.count)||0);
  if(ir.data&&Number(ir.data.foto_sincronizzate)!==actual){const u=await sb.from('interventions').update({foto_sincronizzate:actual}).eq('id',interventionId);if(u.error)console.warn('Contatore foto non aggiornato:',u.error.message)}
  return {intervention:ir.data,expected,actual,ready:actual>=expected};
}
async function flushReadyClosureNotifications(interventionId=null){
  if(!session||!profile||profile.ruolo==='admin')return;
  let q=sb.from('interventions').select('id,stato,closed_by,foto_attese,foto_sincronizzate,photo_sync_notified_at').eq('closed_by',profile.id).eq('stato','in_attesa').is('photo_sync_notified_at',null);
  if(interventionId)q=q.eq('id',interventionId);
  const {data,error}=await q;if(error){console.warn('Controllo notifiche foto fallito:',error.message);return}
  for(const i of data||[]){
    try{const st=await interventionPhotoSyncState(i.id);if(!st.ready)continue;const ok=await notifyAdminClosure('intervention',i.id,st.actual);if(ok){const r=await sb.from('interventions').update({photo_sync_notified_at:new Date().toISOString(),foto_sincronizzate:st.actual}).eq('id',i.id).is('photo_sync_notified_at',null);if(r.error)console.warn('Flag notifica foto non aggiornato:',r.error.message)}}catch(err){console.warn('Notifica intervento pronta non inviata:',err?.message||err)}
  }
}

// ---- V112-37 · Coda persistente + upload reale Supabase ----
const UPLOAD_DB='overgreen-upload-queue-v1', UPLOAD_STORE='jobs';
const PHOTO_RECOVERY_DB='overgreen-photo-recovery-v1', PHOTO_RECOVERY_STORE='photos', PHOTO_RECOVERY_TTL=7*24*60*60*1000;
function openPhotoRecoveryDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(PHOTO_RECOVERY_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(PHOTO_RECOVERY_STORE))r.result.createObjectStore(PHOTO_RECOVERY_STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function getPhotoRecoveryRows(){const db=await openPhotoRecoveryDb();return new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_RECOVERY_STORE,'readonly'),r=tx.objectStore(PHOTO_RECOVERY_STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
async function putPhotoRecoveryRow(row){const db=await openPhotoRecoveryDb();return new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_RECOVERY_STORE,'readwrite');tx.objectStore(PHOTO_RECOVERY_STORE).put(row);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function deletePhotoRecoveryRow(id){const db=await openPhotoRecoveryDb();return new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_RECOVERY_STORE,'readwrite');tx.objectStore(PHOTO_RECOVERY_STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function cleanupPhotoRecoveryRows(){try{const rows=await getPhotoRecoveryRows(),cut=Date.now()-PHOTO_RECOVERY_TTL;for(const r of rows)if((r.savedAt||0)<cut)await deletePhotoRecoveryRow(r.id)}catch{}}

let uploadWorkerRunning=false,uploadWorkerPromise=null;
function openUploadDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(UPLOAD_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(UPLOAD_STORE))r.result.createObjectStore(UPLOAD_STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function queueTx(mode,fn){const db=await openUploadDb();return new Promise((resolve,reject)=>{const tx=db.transaction(UPLOAD_STORE,mode),st=tx.objectStore(UPLOAD_STORE);let out;try{out=fn(st)}catch(e){reject(e);return}tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error)})}
async function getUploadJobs(){const db=await openUploadDb();return new Promise((resolve,reject)=>{const tx=db.transaction(UPLOAD_STORE,'readonly'),r=tx.objectStore(UPLOAD_STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
async function putUploadJob(job){await queueTx('readwrite',st=>st.put(job));updateSyncUi()}
async function deleteUploadJob(id){await queueTx('readwrite',st=>st.delete(id));updateSyncUi()}
async function markInterventionPhotoUpload(interventionId,status,errorText=null){
  if(!interventionId)return;
  const payload={photo_upload_status:status,photo_upload_error:errorText||null,photo_upload_updated_at:new Date().toISOString()};
  const r=await sb.from('interventions').update(payload).eq('id',interventionId);
  if(r.error)console.warn('V112-37: stato upload foto non aggiornato',r.error.message);
  const local=interventions.find(i=>i.id===interventionId);if(local)Object.assign(local,payload);
}
async function enqueueInterventionPhotos(interventionId,files){
  if(!files?.length)return {queued:0};
  await markInterventionPhotoUpload(interventionId,'pending',null);
  for(let n=0;n<files.length;n++){
    const f=files[n];
    const jobId=crypto.randomUUID(),job={id:jobId,kind:'intervention-photo',interventionId,actorProfileId:profile?.id||null,file:f,fileName:f.name||`foto-${n+1}.jpg`,mimeType:f.type||'image/jpeg',createdAt:Date.now()+n,retries:0,lastError:'',lastStage:'queued'};await putUploadJob(job);await putPhotoRecoveryRow({id:jobId,interventionId,actorProfileId:profile?.id||null,file:f,fileName:job.fileName,mimeType:job.mimeType,savedAt:Date.now(),uploadedAt:null});
  }
  await processUploadQueue();
  const state=await interventionPhotoSyncState(interventionId);
  return {queued:files.length,...state};
}
async function uploadInterventionPhotoJob(job){
  const interventionId=job.interventionId;
  let file=job.file;
  if(!file)throw new Error('FILE_LOCALE_MANCANTE: la foto non è più disponibile nella coda del dispositivo');
  console.info('V112-37 FOTO',job.id,'compress_start',interventionId,file.size||0);
  file=await compressImage(file);
  console.info('V112-37 FOTO',job.id,'compress_ok',file.size||0);
  const safe=(file.name||job.fileName||'foto.jpg').replace(/[^a-zA-Z0-9._-]/g,'-');
  const path=`interventi/${interventionId}/${job.id}-${safe}`;
  job.lastStage='storage_upload';await putUploadJob(job);
  console.info('V112-37 FOTO',job.id,'storage_upload_start',path);
  const up=await sb.storage.from('documenti').upload(path,file,{upsert:true,cacheControl:'3600',contentType:file.type||job.mimeType||'image/jpeg'});
  if(up.error)throw new Error(`STORAGE_UPLOAD: ${up.error.message||up.error}`);
  console.info('V112-37 FOTO',job.id,'storage_upload_ok',path);
  job.lastStage='attachment_insert';await putUploadJob(job);
  let added;
  try{
    added=await addAttachment({tipo:'foto_generica',intervention_id:interventionId,storage_path:path,nome_file:file.name||job.fileName,mime_type:file.type||job.mimeType,dimensione_bytes:file.size,caricato_da:job.actorProfileId||profile.id});
  }catch(err){
    try{await sb.storage.from('documenti').remove([path])}catch{}
    throw new Error(`ATTACHMENT_INSERT: ${err?.message||err}`);
  }
  if(!added){try{await sb.storage.from('documenti').remove([path])}catch{};throw new Error('ATTACHMENT_INSERT: nessuna riga restituita da Supabase')}
  console.info('V112-37 FOTO',job.id,'attachment_insert_ok',added.id);
  if(!attachments.some(a=>a.id===added.id||a.storage_path===added.storage_path))attachments.push(added);
  await deleteUploadJob(job.id);
  try{const backups=await getPhotoRecoveryRows(),backup=backups.find(x=>x.id===job.id);if(backup){backup.uploadedAt=Date.now();backup.storagePath=path;await putPhotoRecoveryRow(backup)}}catch{}
  return added;
}
async function processUploadQueue(){
  if(uploadWorkerPromise)return uploadWorkerPromise;
  if(!session){updateSyncUi();return {processed:0,noSession:true}}
  uploadWorkerPromise=(async()=>{
    uploadWorkerRunning=true;updateSyncUi();let processed=0,failed=0;
    try{
      const jobs=(await getUploadJobs()).sort((a,b)=>a.createdAt-b.createdAt);
      const touched=new Set();
      for(const job of jobs){
        if(job.kind!=='intervention-photo')continue;
        touched.add(job.interventionId);
        if((job.retries||0)>=3){failed++;continue}
        try{
          await markInterventionPhotoUpload(job.interventionId,'syncing',null);
          await uploadInterventionPhotoJob(job);processed++;
          const st=await interventionPhotoSyncState(job.interventionId);
          if(st.ready)await markInterventionPhotoUpload(job.interventionId,'synced',null);
          toast('✓ Foto sincronizzata');
        }catch(err){
          job.retries=(job.retries||0)+1;job.lastError=err?.message||String(err);job.failedAt=new Date().toISOString();await putUploadJob(job);failed++;
          console.error('V112-37 FOTO FALLITA',{job_id:job.id,intervention_id:job.interventionId,stage:job.lastStage,retries:job.retries,error:job.lastError});
          await markInterventionPhotoUpload(job.interventionId,job.retries>=3?'error':'pending',job.lastError);
        }
      }
      for(const id of touched){
        try{
          const st=await interventionPhotoSyncState(id);
          if(st.ready){await markInterventionPhotoUpload(id,'synced',null);await flushReadyClosureNotifications(id)}
          const intervention=interventions.find(i=>i.id===id);
          if(intervention&&$('historyDialog')?.open&&currentHistoryStoreId===intervention.store_id){const store=stores.find(x=>x.id===intervention.store_id);if(store)await showHistory(store,true)}
        }catch(syncErr){console.warn('V112-37: verifica finale foto fallita',syncErr?.message||syncErr)}
      }
      return {processed,failed};
    }finally{uploadWorkerRunning=false;updateSyncUi();try{const pending=(await getUploadJobs()).some(j=>(j.retries||0)<3);if(pending)setTimeout(()=>processUploadQueue(),3000)}catch{}}
  })();
  try{return await uploadWorkerPromise}finally{uploadWorkerPromise=null;flushReadyClosureNotifications().catch(()=>{})}
}
async function retryUploads(){const jobs=await getUploadJobs();for(const j of jobs){j.retries=0;j.lastError='';j.lastStage='queued';await putUploadJob(j);await markInterventionPhotoUpload(j.interventionId,'pending',null)}return processUploadQueue()}

function localInterventionPhotoCount(interventionId){
  return attachments.filter(a=>a.intervention_id===interventionId&&a.tipo==='foto_generica').length;
}
function employeePhotoMismatchRows(){
  if(!profile||admin())return [];
  return interventions.filter(i=>i.closed_by===profile.id&&i.stato==='in_attesa'&&!i.multi_day_open&&Math.max(0,Number(i.foto_attese)||0)>localInterventionPhotoCount(i.id));
}
async function localRecoverablePhotoCount(){
  try{
    const [jobs,backups]=await Promise.all([getUploadJobs(),getPhotoRecoveryRows()]);
    const ids=new Set(employeePhotoMismatchRows().map(i=>i.id));
    return [...jobs,...backups].filter(x=>ids.has(x.interventionId)&&x.file).length;
  }catch{return 0}
}
async function repairEmployeePhotoSync(button=null){
  if(!profile||admin())return;
  const old=button?.textContent;if(button){button.disabled=true;button.textContent='Controllo…'}
  try{
    await cleanupPhotoRecoveryRows();
    const mismatches=employeePhotoMismatchRows();
    if(!mismatches.length){toast('✓ Nessuna foto da recuperare');await updateSyncUi();return}
    const [jobs,backups]=await Promise.all([getUploadJobs(),getPhotoRecoveryRows()]);
    let restored=0,missingLocal=0;
    for(const i of mismatches){
      let actual=localInterventionPhotoCount(i.id),expected=Math.max(0,Number(i.foto_attese)||0);
      if(actual>=expected)continue;
      const candidates=[];
      for(const j of jobs)if(j.interventionId===i.id&&j.file)candidates.push({source:'queue',row:j});
      for(const b of backups)if(b.interventionId===i.id&&b.file&&!candidates.some(x=>x.row.id===b.id))candidates.push({source:'backup',row:b});
      if(!candidates.length){missingLocal++;continue}
      for(const c of candidates){
        if(actual>=expected)break;
        const row=c.row;
        try{
          let file=row.file;if(!file)continue;
          file=await compressImage(file);
          const safe=(file.name||row.fileName||'foto-recuperata.jpg').replace(/[^a-zA-Z0-9._-]/g,'-');
          const path=`interventi/${i.id}/${row.id||crypto.randomUUID()}-${safe}`;
          const up=await sb.storage.from('documenti').upload(path,file,{upsert:true,cacheControl:'3600',contentType:file.type||row.mimeType||'image/jpeg'});
          if(up.error)throw up.error;
          const existing=await sb.from('attachments').select('id').eq('intervention_id',i.id).eq('storage_path',path).maybeSingle();
          if(existing.error)throw existing.error;
          if(!existing.data){
            const added=await addAttachment({tipo:'foto_generica',intervention_id:i.id,storage_path:path,nome_file:file.name||row.fileName||safe,mime_type:file.type||row.mimeType||'image/jpeg',dimensione_bytes:file.size,caricato_da:row.actorProfileId||profile.id});
            if(added&&!attachments.some(a=>a.id===added.id))attachments.push(added);
          }
          actual++;
          restored++;
          await deleteUploadJob(row.id).catch(()=>{});
          row.uploadedAt=Date.now();row.storagePath=path;await putPhotoRecoveryRow(row).catch(()=>{});
        }catch(err){console.warn('V112-63 recupero locale foto fallito',i.id,err)}
      }
      const state=await interventionPhotoSyncState(i.id);
      if(state.ready){await markInterventionPhotoUpload(i.id,'synced',null);await flushReadyClosureNotifications(i.id)}
    }
    await loadAll();
    const remaining=employeePhotoMismatchRows();
    if(!remaining.length)alert(`Riparazione completata.\n\n${restored} foto recuperate e verificate su Supabase.`);
    else if(restored)alert(`Recuperate ${restored} foto.\n\nRestano ${remaining.length} interventi con foto mancanti: su questo telefono non è stata trovata una copia locale sufficiente.`);
    else alert(`Non ho trovato copie locali recuperabili per ${remaining.length} interventi.\n\nSe la foto non è più nella coda né nella copia di recupero del telefono, non può essere ricreata automaticamente.`);
  }catch(err){alert('Riparazione sincronizzazione non riuscita: '+(err?.message||String(err)))}
  finally{if(button){button.disabled=false;button.textContent=old||'Ripara sincronizzazione foto'};await updateSyncUi()}
}

async function updateSyncUi(){
  let jobs=[];try{jobs=await getUploadJobs()}catch{}
  const failed=jobs.filter(j=>(j.retries||0)>=3).length;
  const first=jobs[0]||null;
  const stageLabel=first?.lastStage==='storage_upload'?'upload Storage':first?.lastStage==='attachment_insert'?'registrazione foto':first?.lastStage==='queued'?'preparazione':'sincronizzazione';
  const mismatchCount=employeePhotoMismatchRows().length;
  const text=uploadWorkerRunning?`⬆️ ${jobs.length} foto · ${stageLabel}…`:failed?`⚠️ ${failed} foto NON sincronizzate · premi per riprovare`:jobs.length?`☁️ ${jobs.length} foto in coda · nuovo tentativo automatico`:mismatchCount?`⚠️ ${mismatchCount} intervent${mismatchCount===1?'o':'i'} con foto da recuperare`:'🟢 Tutto sincronizzato';
  const background=$('backgroundSyncStatus');if(background)background.textContent=text;const repairStatus=$('photoRepairStatus');if(repairStatus)repairStatus.textContent=text;
  const badge=$('syncFloatingBadge');if(badge){badge.textContent=text;badge.classList.toggle('hidden',!jobs.length&&!uploadWorkerRunning&&!mismatchCount);badge.classList.toggle('sync-error',!!failed||!!mismatchCount);badge.onclick=failed?()=>retryUploads().catch(e=>alert(e.message)):mismatchCount?()=>repairEmployeePhotoSync(badge):null}
}
window.addEventListener('online',()=>processUploadQueue());
// V112-37: navigator.onLine non blocca più gli upload; ogni tentativo verifica davvero Supabase.
function ensureCloudSettingsUi(){
  const host=$('settingsView')||$('settingsScreen');if(!host)return;
  const wrap=host.querySelector('.settings-content')||host;
  let sec=$('cloudAccountSettings');
  if(sec?.dataset.ready==='1')return;
  if(!sec){sec=document.createElement('section');sec.id='cloudAccountSettings';wrap.appendChild(sec)}
  sec.dataset.ready='1';sec.className='settings-card cloud-account-settings';
  sec.innerHTML=`<div class="settings-section-head"><div><h3>🔐 Account e accessi</h3><p>Cambia la tua password. Lorenzo può creare utenti e modificarne nome, email, ruolo, stato e password.</p></div></div>
  <form id="selfPasswordForm" class="settings-form"><input id="selfNewPassword" type="password" minlength="8" placeholder="Nuova password" required><button type="submit">Cambia la mia password</button></form><div class="photo-repair-box"><hr><h4>📷 Sincronizzazione foto</h4><p id="photoRepairStatus" class="muted">Controllo foto locali e Supabase…</p><button type="button" id="repairPhotoSyncBtn" class="secondary">Ripara sincronizzazione foto</button></div>
  <div id="adminUsersArea" class="admin-only"><hr><h4>👥 Dipendenti</h4><div id="cloudEmployeeList" class="employee-list"></div>
  <form id="cloudAddEmployeeForm" class="settings-form"><input id="cloudEmployeeName" placeholder="Nome" required><input id="cloudEmployeeEmail" type="email" placeholder="Email di accesso" required><input id="cloudEmployeePassword" type="password" minlength="8" placeholder="Password iniziale" required><button type="submit">Crea dipendente</button></form></div>`;
  const usage=document.createElement('section');usage.id='supabaseUsageCard';usage.className='settings-card admin-only';usage.innerHTML=`<div class="settings-section-head"><div><h3>📊 Utilizzo Supabase</h3><p>Spazio occupato dai file e dimensione del database del progetto.</p></div></div><div class="usage-grid"><div class="usage-metric"><span>Storage</span><strong id="usageStorage">—</strong><small id="usageStorageDetail" class="muted">Calcolo in corso…</small></div><div class="usage-metric"><span>Database</span><strong id="usageDatabase">—</strong><small id="usageDatabaseDetail" class="muted">Calcolo in corso…</small></div></div><p id="usageError" class="error hidden"></p><button id="refreshUsageBtn" type="button" class="secondary">Aggiorna utilizzo</button><hr><div class="settings-section-head"><div><h3>🗜️ Ottimizza immagini Storage</h3><p>Controlla le immagini già salvate e stima quanto spazio può essere recuperato. L’analisi non modifica alcun file.</p></div></div><div id="storageOptimizeResult" class="storage-optimize-result muted">Premi “Analizza immagini” per iniziare.</div><div class="actions storage-optimize-actions"><button id="analyzeStorageBtn" type="button" class="secondary">Analizza immagini</button><button id="optimizeStorageBtn" type="button" class="hidden">Comprimi file ottimizzabili</button></div>`;wrap.appendChild(usage);
  const sync=document.createElement('section');sync.className='settings-card';sync.innerHTML=`<h3>☁️ Sincronizzazione</h3><p id="backgroundSyncStatus">Controllo…</p><button id="retryUploadsBtn" type="button" class="secondary">Riprova caricamenti</button>`;wrap.appendChild(sync);
  const badge=document.createElement('button');badge.id='syncFloatingBadge';badge.type='button';badge.className='sync-floating hidden';badge.onclick=()=>{setView?.('settings');};document.body.appendChild(badge);
  $('selfPasswordForm').onsubmit=async e=>{e.preventDefault();const pw=$('selfNewPassword').value;const {error}=await sb.auth.updateUser({password:pw});if(error)return alert(error.message);e.target.reset();toast('Password aggiornata')};
  $('cloudAddEmployeeForm').onsubmit=async e=>{e.preventDefault();const payload={action:'create',nome:$('cloudEmployeeName').value.trim(),email:$('cloudEmployeeEmail').value.trim(),password:$('cloudEmployeePassword').value};const {data,error}=await sb.functions.invoke('manage-user',{body:payload});if(error||data?.error)return alert(data?.error||error.message);e.target.reset();toast('Dipendente creato');await loadAll()};
  $('retryUploadsBtn').onclick=retryUploads;const repairBtn=$('repairPhotoSyncBtn');if(repairBtn)repairBtn.onclick=()=>repairEmployeePhotoSync(repairBtn);$('refreshUsageBtn').onclick=loadSupabaseUsage;$('analyzeStorageBtn').onclick=analyzeStorageImages;$('optimizeStorageBtn').onclick=optimizeStorageImages;renderCloudEmployeeList();updateSyncUi();if(admin())loadSupabaseUsage();
}
function formatBytes(value){
  const n=Number(value)||0;if(n<1024)return `${n} B`;const units=['KB','MB','GB','TB'];let v=n/1024,u=0;while(v>=1024&&u<units.length-1){v/=1024;u++}return `${v>=100?v.toFixed(0):v>=10?v.toFixed(1):v.toFixed(2)} ${units[u]}`
}
async function loadSupabaseUsage(){
  if(!admin()||!$('usageStorage'))return;
  const localStorageBytes=attachments.reduce((sum,a)=>sum+(Number(a.dimensione_bytes)||0),0);
  $('usageStorage').textContent=formatBytes(localStorageBytes);$('usageStorageDetail').textContent=`${attachments.length} allegati registrati`;
  $('usageDatabase').textContent='…';$('usageDatabaseDetail').textContent='Lettura dal server…';$('usageError').classList.add('hidden');
  const btn=$('refreshUsageBtn');if(btn)btn.disabled=true;
  try{
    const {data,error}=await sb.functions.invoke('manage-user',{body:{action:'usage'}});
    if(error||data?.error)throw new Error(data?.error||error.message);
    const storageBytes=Number(data.storage_bytes);
    if(Number.isFinite(storageBytes)){ $('usageStorage').textContent=formatBytes(storageBytes);$('usageStorageDetail').textContent=`${Number(data.storage_objects)||attachments.length} file nello Storage · la dashboard Supabase può arrotondare`; }
    const databaseBytes=Number(data.database_bytes);
    if(Number.isFinite(databaseBytes)){ $('usageDatabase').textContent=formatBytes(databaseBytes);$('usageDatabaseDetail').textContent='Dimensione complessiva dei database del progetto'; }
    else throw new Error('Dimensione database non disponibile');
  }catch(err){
    $('usageDatabase').textContent='Non disponibile';$('usageDatabaseDetail').textContent='Installa la funzione SQL inclusa nella cartella supabase/migrations';
    $('usageError').textContent=err.message;$('usageError').classList.remove('hidden');
  }finally{if(btn)btn.disabled=false}
}

let storageOptimizationPlan=[];
const STORAGE_IMAGE_MIN_BYTES=350*1024;
const STORAGE_MIN_SAVING_BYTES=100*1024;
const STORAGE_MIN_SAVING_RATIO=.15;
function storageOptimizationSources(){
  return [
    {table:'attachments',sizeField:'dimensione_bytes',nameField:'nome_file',label:'Foto interventi / extra'},
    {table:'schedule_activity_photos',sizeField:'dimensione_bytes',nameField:'nome_file',label:'Foto attività'},
    {table:'extra_work_item_photos',sizeField:'dimensione_bytes',nameField:'nome_file',label:'Foto lavorazioni extra'},
    {table:'signature_sheets',sizeField:'size_bytes',nameField:'file_name',label:'Fogli firme'},
    {table:'company_documents',sizeField:'size_bytes',nameField:'file_name',label:'Archivio aziendale'}
  ];
}
async function fetchStorageImageRows(){
  const groups=[];
  for(const src of storageOptimizationSources()){
    try{
      const {data,error}=await sb.from(src.table).select(`id,storage_path,mime_type,${src.sizeField},${src.nameField}`);
      if(error)throw error;
      for(const row of data||[]){
        const mime=String(row.mime_type||'').toLowerCase();
        const size=Number(row[src.sizeField])||0;
        // Per ora evitiamo PNG/GIF e documenti: niente conversioni che possano perdere trasparenza o leggibilità.
        if(!row.storage_path||size<STORAGE_IMAGE_MIN_BYTES||!['image/jpeg','image/jpg','image/webp'].includes(mime))continue;
        groups.push({...row,_table:src.table,_sizeField:src.sizeField,_nameField:src.nameField,_group:src.label,_size:size});
      }
    }catch(err){console.warn(`Analisi ${src.table} saltata:`,err.message)}
  }
  return groups;
}
async function compressedStorageCandidate(row){
  const {data,error}=await sb.storage.from('documenti').createSignedUrl(row.storage_path,600);if(error)throw error;
  const response=await fetch(data.signedUrl,{cache:'no-store'});if(!response.ok)throw new Error(`Download fallito (${response.status})`);
  const original=await response.blob();
  const file=new File([original],row[row._nameField]||'foto.jpg',{type:row.mime_type||original.type||'image/jpeg'});
  const compressed=await compressImage(file);
  const originalSize=Math.max(Number(row._size)||0,original.size||0);
  const newSize=compressed.size||originalSize;
  const saving=Math.max(0,originalSize-newSize);
  return {row,compressed,originalSize,newSize,saving,ratio:originalSize?saving/originalSize:0};
}
function renderStorageOptimizationSummary(plan,checked,errors=0){
  const box=$('storageOptimizeResult'),btn=$('optimizeStorageBtn');if(!box)return;
  const current=plan.reduce((n,x)=>n+x.originalSize,0),after=plan.reduce((n,x)=>n+x.newSize,0),saving=current-after;
  if(!checked){box.textContent='Premi “Analizza immagini” per iniziare.';btn?.classList.add('hidden');return}
  if(!plan.length){box.innerHTML=`<strong>✅ Nessuna immagine da comprimere</strong><br><span>Sono stati controllati ${checked} file candidati${errors?` · ${errors} non leggibili`:''}. Le immagini risultano già sufficientemente ottimizzate.</span>`;btn?.classList.add('hidden');return}
  const pct=current?Math.round(saving/current*100):0;
  const groups={};for(const x of plan)groups[x.row._group]=(groups[x.row._group]||0)+1;
  box.innerHTML=`<strong>Possibile recupero: ${formatBytes(saving)} (${pct}%)</strong><br><span>${plan.length} immagini ottimizzabili su ${checked} controllate · da ${formatBytes(current)} a circa ${formatBytes(after)}${errors?` · ${errors} non leggibili`:''}</span><div class="storage-optimize-groups">${Object.entries(groups).map(([k,v])=>`<small>${esc(k)}: ${v}</small>`).join('')}</div>`;
  if(btn){btn.classList.remove('hidden');btn.textContent=`Comprimi ${plan.length} file`}
}
async function analyzeStorageImages(){
  if(!admin())return;
  const analyze=$('analyzeStorageBtn'),optimize=$('optimizeStorageBtn'),box=$('storageOptimizeResult');if(!analyze||!box)return;
  analyze.disabled=true;if(optimize)optimize.classList.add('hidden');storageOptimizationPlan=[];
  try{
    box.textContent='Cerco immagini grandi nello Storage…';
    const rows=await fetchStorageImageRows();
    if(!rows.length){renderStorageOptimizationSummary([],0);box.innerHTML='<strong>✅ Nessuna immagine grande da analizzare</strong><br><span>Non risultano JPEG/WebP sopra 350 KB nei file gestiti dall’app.</span>';return}
    let errors=0;
    for(let i=0;i<rows.length;i++){
      box.textContent=`Analisi ${i+1}/${rows.length} · ${rows[i][rows[i]._nameField]||'immagine'}…`;
      try{
        const candidate=await compressedStorageCandidate(rows[i]);
        if(candidate.saving>=STORAGE_MIN_SAVING_BYTES&&candidate.ratio>=STORAGE_MIN_SAVING_RATIO)storageOptimizationPlan.push(candidate);
      }catch(err){errors++;console.warn('Immagine non analizzabile:',rows[i].storage_path,err.message)}
      await new Promise(r=>setTimeout(r,0));
    }
    renderStorageOptimizationSummary(storageOptimizationPlan,rows.length,errors);
  }catch(err){box.innerHTML=`<span class="error">Analisi non riuscita: ${esc(err.message)}</span>`}
  finally{analyze.disabled=false}
}
async function optimizeStorageImages(){
  if(!admin()||!storageOptimizationPlan.length)return;
  const totalSaving=storageOptimizationPlan.reduce((n,x)=>n+x.saving,0);
  if(!confirm(`Comprimere ${storageOptimizationPlan.length} immagini?\n\nRisparmio stimato: ${formatBytes(totalSaving)}.\nI file originali verranno sostituiti nello Storage.`))return;
  const analyze=$('analyzeStorageBtn'),btn=$('optimizeStorageBtn'),box=$('storageOptimizeResult');
  if(analyze)analyze.disabled=true;if(btn)btn.disabled=true;
  let done=0,failed=0,actualSaving=0;
  for(let i=0;i<storageOptimizationPlan.length;i++){
    const item=storageOptimizationPlan[i],row=item.row;
    box.textContent=`Compressione ${i+1}/${storageOptimizationPlan.length} · ${row[row._nameField]||'immagine'}…`;
    try{
      const up=await sb.storage.from('documenti').update(row.storage_path,item.compressed,{cacheControl:'3600',contentType:item.compressed.type||'image/jpeg',upsert:true});
      if(up.error)throw up.error;
      const patch={[row._sizeField]:item.compressed.size,mime_type:item.compressed.type||'image/jpeg'};
      const {error}=await sb.from(row._table).update(patch).eq('id',row.id);if(error)throw error;
      done++;actualSaving+=item.originalSize-item.compressed.size;
    }catch(err){failed++;console.error('Compressione Storage fallita:',row.storage_path,err)}
  }
  storageOptimizationPlan=[];
  box.innerHTML=`<strong>${failed?'⚠️':'✅'} Ottimizzazione completata</strong><br><span>${done} file compressi · spazio recuperato circa ${formatBytes(actualSaving)}${failed?` · ${failed} file non modificati per errore`:''}.</span>`;
  if(btn){btn.disabled=false;btn.classList.add('hidden')}if(analyze)analyze.disabled=false;
  await loadAll();if(admin())loadSupabaseUsage();
}
async function renderCloudEmployeeList(){
  const box=$('cloudEmployeeList');if(!box)return;
  box.innerHTML='<p class="muted">Caricamento utenti…</p>';
  const {data,error}=await sb.functions.invoke('manage-user',{body:{action:'list'}});
  if(error||data?.error){box.innerHTML=`<p class="error">${esc(data?.error||error.message)}</p>`;return}
  managedUsers=data.users||[];box.innerHTML='';
  for(const u of managedUsers){
    const row=document.createElement('div');row.className='employee-row user-management-row';
    row.innerHTML=`<div class="employee-main"><strong>${esc(u.nome||u.email||'Utente')}</strong><small>${esc(u.email||'Email non disponibile')} · ${u.ruolo==='admin'?'Amministratore':'Dipendente'} · ${u.attivo?'Attivo':'Disattivato'}</small></div><div class="employee-actions"><button type="button" class="secondary compact" data-edit-user>Modifica</button><button type="button" class="secondary compact" data-password-user>Password</button></div>`;
    row.querySelector('[data-edit-user]').onclick=()=>openUserEdit(u);
    row.querySelector('[data-password-user]').onclick=async()=>{const password=prompt(`Nuova password per ${u.nome||u.email} (minimo 8 caratteri)`);if(!password)return;if(password.length<8)return alert('La password deve avere almeno 8 caratteri.');const {data,error}=await sb.functions.invoke('manage-user',{body:{action:'password',user_id:u.id,password}});if(error||data?.error)return alert(data?.error||error.message);toast('Password aggiornata')};
    box.appendChild(row)
  }
}
function openUserEdit(u){
  $('userEditId').value=u.id;$('userEditName').value=u.nome||'';$('userEditEmail').value=u.email||'';$('userEditRole').value=u.ruolo||'dipendente';$('userEditActive').checked=u.attivo!==false;
  $('userEditRole').disabled=u.id===profile.id;$('userEditActive').disabled=u.id===profile.id;
  $('userEditSelfWarning').classList.toggle('hidden',u.id!==profile.id);openDialog('userEditDialog')
}

const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const tomorrow=()=>{const d=new Date();d.setDate(d.getDate()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const fmt=d=>d?new Intl.DateTimeFormat('it-IT').format(new Date(d+'T12:00:00')):'Da programmare';
const fmtClosedAt=v=>{if(!v)return 'Orario non disponibile';const d=new Date(v);return Number.isNaN(d.getTime())?'Orario non disponibile':new Intl.DateTimeFormat('it-IT',{dateStyle:'short',timeStyle:'short'}).format(d)};
const toDateTimeLocal=v=>{if(!v)return '';const d=new Date(v);if(Number.isNaN(d.getTime()))return '';const z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`};
const closedByName=row=>profiles.find(p=>p.id===row?.closed_by)?.nome||'Utente non disponibile';
const closureText=row=>`${fmtClosedAt(row?.closed_at)} · ${closedByName(row)}`;
function extraRequestDate(e){return e.data_richiesta||String(e.created_at||'').slice(0,10)||null}
function elapsedDaysFrom(date,endDate=today()){if(!date)return null;const start=new Date(date+'T00:00:00'),end=new Date((endDate||today())+'T00:00:00');if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime()))return null;return Math.max(0,Math.floor((end-start)/86400000))}
function extraExecutionElapsedDays(e){
  const executed=['in_attesa','completato'].includes(e?.stato)&&e?.giorno_intervento;
  return executed?elapsedDaysFrom(extraRequestDate(e),e.giorno_intervento):null;
}
function elapsedDaysLabel(e){
  const executed=['in_attesa','completato'].includes(e?.stato)&&e?.giorno_intervento;
  if(executed){
    const d=extraExecutionElapsedDays(e);
    return d===null?'Tempo di esecuzione non disponibile':d===0?'Eseguito in: 0 giorni':d===1?'Eseguito in: 1 giorno':`Eseguito in: ${d} giorni`;
  }
  const d=elapsedDaysFrom(extraRequestDate(e));
  return d===null?'Giorni trascorsi non disponibili':d===0?'Richiesto oggi':d===1?'1 giorno trascorso':`${d} giorni trascorsi`;
}
function extraCategory(e){return ['verde','pulizie'].includes(e?.categoria_target)?e.categoria_target:null}
function extraCategoryLabel(e){return extraCategory(e)==='verde'?'🌿 Verde':extraCategory(e)==='pulizie'?'🧹 Pulizie':'Categoria non indicata'}
function extraCategoryClass(e){return extraCategory(e)?`category-${extraCategory(e)}`:'category-unknown'}
function clientType(row){
  if(typeof row==='string'&&['eurospin','intesa','privato'].includes(row))return row;
  const direct=row?.client_type;
  if(['eurospin','intesa','privato'].includes(direct))return direct;
  const linked=row?.store_id?stores.find(s=>s.id===row.store_id):null;
  return ['eurospin','intesa','privato'].includes(linked?.client_type)?linked.client_type:'eurospin';
}
function clientLabel(row){return ({eurospin:'Eurospin',intesa:'Intesa Sanpaolo',privato:'Privato'})[clientType(row)]||'Eurospin'}
function clientBadge(row){
  const type=clientType(row),icon=type==='eurospin'?'🛒':type==='intesa'?'🏦':'🏠';
  return `<span class="client-badge client-${type}">${icon} ${esc(clientLabel(row))}</span>`;
}
function closureProfile(row){const value=row?.closure_profile;return ['eurospin','eurospin_ordinario','intesa','intesa_ordinario','privato'].includes(value)?value:clientType(row)}
function isIntesaOrdinaryTicket(row){return closureProfile(row)==='intesa_ordinario'}
function isEurospinOrdinaryTarget(row){return closureProfile(row)==='eurospin_ordinario'}
function isOrdinaryIncludedExtra(row){return isIntesaOrdinaryTicket(row)||isEurospinOrdinaryTarget(row)}
function deadlineLabel(row){
  if(!row?.deadline_at)return '';
  const d=new Date(row.deadline_at);if(Number.isNaN(d.getTime()))return '';
  const late=d.getTime()<Date.now()&&!['completato','in_attesa'].includes(row.stato);
  const text=new Intl.DateTimeFormat('it-IT',{dateStyle:'short',timeStyle:'short'}).format(d);
  return `<p class="deadline ${late?'late':''}"><strong>${late?'Scaduto':'Scadenza'}:</strong> ${esc(text)}</p>`;
}
function isoToLocalInput(value){return toDateTimeLocal(value)}

const days=d=>{if(!d)return null;const a=new Date(d+'T00:00:00'),b=new Date();b.setHours(0,0,0,0);return Math.max(0,Math.floor((b-a)/86400000));};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const euro=v=>v===null||v===undefined||v===''?'—':new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(v)||0);
function attachmentLabel(a){return ({pdf_richiesta:'Richiesta extra',rapportino_eurospin:'File Eurospin',rapportino_overgreen:'File Overgreen'}[a?.tipo]||a?.nome_file||'Documento')}
const realAdmin=()=>realProfile?.ruolo==='admin';
const impersonating=()=>!!(realAdmin()&&profile&&realProfile&&profile.id!==realProfile.id);
const admin=()=>profile?.ruolo==='admin'&&!impersonating();
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function openDialog(id){$(id)?.showModal()}
function closeDialog(d){d.closest('dialog')?.close()}
function isStoreProgrammed(storeId){return scheduleItems.some(item=>item.store_id===storeId&&effectiveScheduleState(item)!=='completato'&&schedules.some(s=>s.id===item.schedule_id))}
function storeHasInterval(s){return s?.intervallo_giorni!==null&&s?.intervallo_giorni!==undefined&&Number(s.intervallo_giorni)>0}
function isUrgentStore(s){if(!storeHasInterval(s))return false;const n=days(s.ultimo_passaggio),lim=Number(s.intervallo_giorni);return n!==null&&n>lim+10}
function status(s){if(isStoreProgrammed(s.id))return'scheduled';if(!storeHasInterval(s))return'ok';const n=days(s.ultimo_passaggio),lim=Number(s.intervallo_giorni);if(n!==null&&n>lim+10)return'urgent';if(n===null||n>lim)return'due';if(n>=lim-3)return'warning';return'ok'}
const CURRENT_VIEW_KEY='overgreen_current_view';
let currentView=localStorage.getItem(CURRENT_VIEW_KEY)||'dashboard';
function setView(name){
  if(!$(name+'View'))name='dashboard';
  currentView=name;localStorage.setItem(CURRENT_VIEW_KEY,name);
  document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$(name+'View').classList.remove('hidden');document.querySelectorAll('[data-bottom-view]').forEach(b=>b.classList.toggle('active',b.dataset.bottomView===name));$('pageTitle').textContent={dashboard:'Dashboard',stores:'Sedi e clienti',schedule:admin()?'Programmazione':'I miei lavori',extras:'Lavori extra',reports:'Report attività',stats:'Statistiche',signatures:'Fogli firme Eurospin',archive:'Archivio aziendale',contacts:'Rubrica lavoro',audit:'Log attività',settings:'Impostazioni'}[name];if(name==='dashboard')renderDashboard();if(name==='stores')renderStores();if(name==='schedule')renderSchedules();if(name==='extras')renderExtras();if(name==='reports')renderDailyReport();if(name==='stats')renderStats();if(name==='signatures')openSignatureSheetsView();if(name==='archive')openCompanyArchive();if(name==='contacts')renderWorkContacts();if(name==='audit'&&admin())openAuditView();if(name!=='audit')auditViewOpen(name);if(name==='settings'){ensureCloudSettingsUi();ensurePushSettingsUi();refreshPushSettingsUi();renderCloudEmployeeList();updateSyncUi();if(admin()){loadSupabaseUsage();renderHealthCenter();}}}


function syncImpersonationUi(){
  const active=impersonating();
  if($('userLabel'))$('userLabel').textContent=active?`${profile.nome} · Vista dipendente (tu: ${realProfile.nome})`:`${profile.nome} · ${admin()?'Amministratore':'Dipendente'}`;
  if($('settingsUser'))$('settingsUser').textContent=active?`Stai operando come ${profile.nome} — sessione reale: ${session?.user?.email||realProfile?.email||''}`:`${profile.nome} — ${session?.user?.email||''}`;
  document.querySelectorAll('.admin-only').forEach(x=>{
    const isView=x.classList.contains('view');
    x.classList.toggle('hidden',!admin()||(isView&&x.id!==currentView+'View'));
  });
  document.querySelectorAll('.real-admin-only').forEach(x=>{
    const isView=x.classList.contains('view');
    x.classList.toggle('hidden',!realAdmin()||(isView&&x.id!==currentView+'View'));
  });
  const bar=$('impersonationBar'),select=$('impersonationSelect'),exit=$('exitImpersonationBtn'),state=$('impersonationState'),summary=$('impersonationSummary');
  if(bar){bar.classList.toggle('active',active);if(!realAdmin())bar.removeAttribute('open')}
  if(summary)summary.textContent=active?`👤 ${profile.nome}`:'👤 Admin';
  if(select&&realAdmin()){
    const value=active?profile.id:'admin';
    select.innerHTML='<option value="admin">Vista amministratore</option>'+profiles.filter(p=>p.attivo!==false&&p.ruolo!=='admin').sort((a,b)=>(a.nome||'').localeCompare(b.nome||'')).map(p=>`<option value="${p.id}">${esc(p.nome||p.email||'Dipendente')}</option>`).join('');
    select.value=[...select.options].some(o=>o.value===value)?value:'admin';
  }
  if(exit)exit.classList.toggle('hidden',!active);
  if(state)state.textContent=active?`Stai operando come ${profile.nome}`:'Seleziona un dipendente per vedere e usare l’app come lui';
}
async function setImpersonatedProfile(profileId){
  if(!realAdmin())return;
  if(!profileId||profileId==='admin')sessionStorage.removeItem(IMPERSONATE_PROFILE_KEY);
  else{
    const target=profiles.find(p=>p.id===profileId&&p.attivo!==false&&p.ruolo!=='admin');
    if(!target)return alert('Dipendente non disponibile.');
    sessionStorage.setItem(IMPERSONATE_PROFILE_KEY,target.id);
  }
  const requestedView=currentView;
  await loadAll();
  const forbidden=impersonating()&&['reports','audit'].includes(requestedView);
  setView(forbidden?'dashboard':requestedView);
  toast(impersonating()?`Ora operi come ${profile.nome}`:'Tornato alla vista amministratore');
}



function archiveCategoryLabel(v){
  return {modulistica:'📝 Modulistica',mezzi:'🚐 Mezzi',dati_aziendali:'🏢 Dati aziendali'}[v]||v;
}
function archiveUploaderName(id){return profiles.find(p=>p.id===id)?.nome||'Amministratore'}
function archiveIsRead(doc){return companyDocumentReads.some(r=>r.document_id===doc.id&&r.user_id===profile?.id)}
function archiveUnreadMandatory(){
  return companyDocuments.filter(d=>d.mandatory&&!archiveIsRead(d));
}
async function loadCompanyArchive(){
  const box=$('archiveList');if(box)box.innerHTML='<p class="muted">Caricamento archivio…</p>';
  const [{data:docs,error:docsErr},{data:reads,error:readsErr}]=await Promise.all([
    sb.from('company_documents').select('*').order('updated_at',{ascending:false}),
    sb.from('company_document_reads').select('*')
  ]);
  if(docsErr){companyDocuments=[];if(box)box.innerHTML=`<p class="error">${esc(docsErr.message)}</p><p class="muted">Esegui MIGRAZIONE-V94.sql su Supabase.</p>`;return}
  companyDocuments=docs||[];
  companyDocumentReads=readsErr?[]:(reads||[]);
  renderCompanyArchive();
}
async function openCompanyArchive(){
  document.querySelectorAll('[data-archive-category]').forEach(b=>b.classList.toggle('active',b.dataset.archiveCategory===archiveCategory));
  $('archiveUploadCategory') && ($('archiveUploadCategory').value=archiveCategory);
  await loadCompanyArchive();
}
function companyArchiveFiltered(){
  const q=($('archiveSearch')?.value||'').trim().toLowerCase();
  return companyDocuments.filter(d=>d.category===archiveCategory&&(!q||`${d.title||''} ${d.description||''} ${d.file_name||''}`.toLowerCase().includes(q)));
}
async function companyDocumentUrl(doc,ttl=900){
  const {data,error}=await sb.storage.from('documenti').createSignedUrl(doc.storage_path,ttl);
  if(error)throw error;
  return data.signedUrl;
}
async function markCompanyDocumentRead(doc){
  try{
    if(archiveIsRead(doc))return;
    const {data,error}=await sb.from('company_document_reads').upsert(
      {document_id:doc.id,user_id:profile.id,read_at:new Date().toISOString()},
      {onConflict:'document_id,user_id'}
    ).select().single();
    if(error)throw error;
    companyDocumentReads.push(data);
    renderCompanyArchive();
  }catch(e){console.warn('mark document read',e)}
}
async function previewCompanyDocument(doc){
  try{
    const url=await companyDocumentUrl(doc);
    await markCompanyDocumentRead(doc);
    writeClientAudit('VIEW','archive',`Aperto documento: ${doc.title}`,{entity_type:'company_document',entity_id:doc.id,category:doc.category});
    window.open(url,'_blank','noopener');
  }catch(e){alert('Impossibile aprire il documento: '+e.message)}
}
async function downloadCompanyDocument(doc){
  try{
    const url=await companyDocumentUrl(doc);
    const res=await fetch(url);if(!res.ok)throw new Error('Download non riuscito');
    const blob=await res.blob(),file=new File([blob],doc.file_name||doc.title,{type:doc.mime_type||blob.type||'application/octet-stream'});
    await markCompanyDocumentRead(doc);
    writeClientAudit('DOWNLOAD','archive',`Scaricato documento: ${doc.title}`,{entity_type:'company_document',entity_id:doc.id,category:doc.category});
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]})))await navigator.share({title:doc.title,files:[file]});
    else{const u=URL.createObjectURL(file),a=document.createElement('a');a.href=u;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)}
  }catch(e){if(e?.name!=='AbortError')alert('Impossibile scaricare il documento: '+e.message)}
}
async function uploadCompanyDocument(file,title,description,category,mandatory){
  let upload=file;
  if(file.type?.startsWith('image/'))upload=await compressImage(file);
  const ext=(upload.name||file.name||'file').split('.').pop()?.toLowerCase()||'file';
  const safe=(title||'documento').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-|-$/g,'');
  const path=`archivio-aziendale/${category}/${Date.now()}-${crypto.randomUUID()}-${safe}.${ext}`;
  const up=await sb.storage.from('documenti').upload(path,upload,{upsert:false,contentType:upload.type||file.type||undefined});
  if(up.error)throw up.error;
  const {data,error}=await sb.from('company_documents').insert({
    category,title,description:description||null,storage_path:path,file_name:file.name||`${safe}.${ext}`,
    mime_type:upload.type||file.type||null,size_bytes:upload.size,mandatory:!!mandatory,uploaded_by:profile.id
  }).select().single();
  if(error){await sb.storage.from('documenti').remove([path]);throw error}
  companyDocuments.unshift(data);
  writeClientAudit('UPLOAD','archive',`Caricato documento: ${title}`,{entity_type:'company_document',entity_id:data.id,category,mandatory:!!mandatory});
  return data;
}
async function renameCompanyDocument(doc){
  if(!admin())return;
  const title=prompt('Nuovo nome documento:',doc.title);if(title===null)return;
  const clean=title.trim();if(!clean)return alert('Il nome non può essere vuoto.');
  const description=prompt('Descrizione / nota:',doc.description||'');if(description===null)return;
  const {data,error}=await sb.from('company_documents').update({title:clean,description:description.trim()||null}).eq('id',doc.id).select().single();
  if(error)return alert('Modifica non riuscita: '+error.message);
  companyDocuments=companyDocuments.map(x=>x.id===doc.id?data:x);
  writeClientAudit('UPDATE','archive',`Rinominato documento: ${clean}`,{entity_type:'company_document',entity_id:doc.id,prima:doc.title,dopo:clean});
  renderCompanyArchive();
}
async function toggleMandatoryCompanyDocument(doc){
  if(!admin())return;
  const mandatory=!doc.mandatory;
  const {data,error}=await sb.from('company_documents').update({mandatory}).eq('id',doc.id).select().single();
  if(error)return alert('Modifica non riuscita: '+error.message);
  companyDocuments=companyDocuments.map(x=>x.id===doc.id?data:x);
  writeClientAudit('UPDATE','archive',`${mandatory?'Reso obbligatorio':'Rimosso obbligo'}: ${doc.title}`,{entity_type:'company_document',entity_id:doc.id,mandatory});
  renderCompanyArchive();
}
async function replaceCompanyDocument(doc,file){
  if(!admin()||!file)return;
  try{
    let upload=file;if(file.type?.startsWith('image/'))upload=await compressImage(file);
    const ext=(upload.name||file.name||'file').split('.').pop()?.toLowerCase()||'file';
    const path=`archivio-aziendale/${doc.category}/${Date.now()}-${crypto.randomUUID()}-replacement.${ext}`;
    const up=await sb.storage.from('documenti').upload(path,upload,{upsert:false,contentType:upload.type||file.type||undefined});if(up.error)throw up.error;
    const {data,error}=await sb.from('company_documents').update({
      storage_path:path,file_name:file.name,mime_type:upload.type||file.type||null,size_bytes:upload.size,version:(doc.version||1)+1,updated_at:new Date().toISOString()
    }).eq('id',doc.id).select().single();
    if(error){await sb.storage.from('documenti').remove([path]);throw error}
    await sb.storage.from('documenti').remove([doc.storage_path]);
    await sb.from('company_document_reads').delete().eq('document_id',doc.id);
    companyDocumentReads=companyDocumentReads.filter(r=>r.document_id!==doc.id);
    companyDocuments=companyDocuments.map(x=>x.id===doc.id?data:x);
    writeClientAudit('UPDATE','archive',`Sostituito documento: ${doc.title}`,{entity_type:'company_document',entity_id:doc.id,version:data.version});
    renderCompanyArchive();toast('Documento sostituito')
  }catch(e){alert('Sostituzione non riuscita: '+e.message)}
}
async function deleteCompanyDocument(doc){
  if(!admin()||!confirm(`Eliminare definitivamente "${doc.title}"?`))return;
  try{
    const s=await sb.storage.from('documenti').remove([doc.storage_path]);if(s.error)throw s.error;
    const d=await sb.from('company_documents').delete().eq('id',doc.id);if(d.error)throw d.error;
    companyDocuments=companyDocuments.filter(x=>x.id!==doc.id);
    companyDocumentReads=companyDocumentReads.filter(r=>r.document_id!==doc.id);
    writeClientAudit('DELETE','archive',`Eliminato documento: ${doc.title}`,{entity_type:'company_document',entity_id:doc.id,category:doc.category});
    renderCompanyArchive();toast('Documento eliminato')
  }catch(e){alert('Eliminazione non riuscita: '+e.message)}
}
function renderCompanyArchive(){
  const box=$('archiveList');if(!box)return;
  document.querySelectorAll('[data-archive-category]').forEach(b=>b.classList.toggle('active',b.dataset.archiveCategory===archiveCategory));
  $('archiveCategoryTitle').textContent=archiveCategoryLabel(archiveCategory);
  if($('archiveUploadCategory'))$('archiveUploadCategory').value=archiveCategory;
  const rows=companyArchiveFiltered();
  $('archiveCount').textContent=`${rows.length} ${rows.length===1?'documento':'documenti'}`;
  const unread=archiveUnreadMandatory();
  const notice=$('archiveUnreadNotice');
  if(notice){
    if(unread.length){notice.className='archive-notice';notice.innerHTML=`<strong>📄 ${unread.length} ${unread.length===1?'documento nuovo da consultare':'documenti nuovi da consultare'}</strong>`}
    else{notice.className='hidden';notice.innerHTML=''}
  }
  box.innerHTML='';
  if(!rows.length){box.innerHTML='<section class="panel"><strong>Nessun documento</strong><p class="muted">Non ci sono documenti in questa categoria.</p></section>';return}
  rows.forEach(doc=>{
    const c=document.createElement('article');c.className='card archive-doc';
    const updated=doc.updated_at?new Intl.DateTimeFormat('it-IT',{dateStyle:'short'}).format(new Date(doc.updated_at)):'';
    const read=archiveIsRead(doc);
    const size=doc.size_bytes?`${Math.max(1,Math.round(doc.size_bytes/1024))} KB`:'';
    c.innerHTML=`<div class="archive-doc-head"><div><span class="report-kind">${esc(archiveCategoryLabel(doc.category).replace(/^.. /,''))}</span><h3>${esc(doc.title)}</h3>${doc.description?`<p class="muted">${esc(doc.description)}</p>`:''}</div><div>${doc.mandatory?(read?'<span class="archive-read">Consultato</span>':'<span class="archive-new">Da consultare</span>'):''}</div></div>
      <div class="muted">Versione ${doc.version||1}${updated?' · Aggiornato '+esc(updated):''}${size?' · '+esc(size):''}</div>
      <div class="archive-doc-actions">
        <button type="button" class="secondary" data-view-doc>👁 Visualizza</button>
        <button type="button" class="secondary" data-download-doc>⬇️ Scarica</button>
        ${admin()?'<button type="button" class="secondary" data-rename-doc>✏️ Rinomina</button><button type="button" class="secondary" data-replace-doc>♻️ Sostituisci</button><button type="button" class="secondary" data-mandatory-doc>'+(doc.mandatory?'✓ Non obbligatorio':'📌 Rendi obbligatorio')+'</button><button type="button" class="danger-btn" data-delete-doc>🗑 Elimina</button>':''}
      </div>`;
    c.querySelector('[data-view-doc]').onclick=()=>previewCompanyDocument(doc);
    c.querySelector('[data-download-doc]').onclick=()=>downloadCompanyDocument(doc);
    c.querySelector('[data-rename-doc]')?.addEventListener('click',()=>renameCompanyDocument(doc));
    c.querySelector('[data-mandatory-doc]')?.addEventListener('click',()=>toggleMandatoryCompanyDocument(doc));
    c.querySelector('[data-delete-doc]')?.addEventListener('click',()=>deleteCompanyDocument(doc));
    c.querySelector('[data-replace-doc]')?.addEventListener('click',()=>{
      const i=document.createElement('input');i.type='file';i.accept='.pdf,image/*,.doc,.docx,.xls,.xlsx';
      i.onchange=()=>{if(i.files[0])replaceCompanyDocument(doc,i.files[0])};i.click();
    });
    box.appendChild(c)
  })
}

function auditSectionLabel(s){return {auth:'Accessi',navigation:'Navigazione',stores:'Sedi e clienti',schedule:'Programmazione',interventions:'Interventi ordinari',extras:'Lavori extra',attachments:'File e foto',signatures:'Fogli firme',archive:'Archivio aziendale',users:'Utenti',storage:'Documenti',contacts:'Rubrica lavoro',activities:'Attività agenda',system:'Sistema'}[s]||s||'Sistema'}
function auditActionLabel(a){return {LOGIN:'Accesso',LOGOUT:'Uscita',VIEW:'Apertura pagina',INSERT:'Creazione',UPDATE:'Modifica',DELETE:'Eliminazione',UPLOAD:'Caricamento',DOWNLOAD:'Download'}[String(a||'').toUpperCase()]||a||'Evento'}
function auditEntityLabel(t){
  return {
    stores:'Sede',
    schedules:'Giornata programmata',
    schedule_members:'Squadra della giornata',
    schedule_items:'Lavoro programmato',
    interventions:'Intervento ordinario',
    intervention_workers:'Operatore intervento',
    extras:'Lavoro extra',
    extra_workers:'Operatore extra',
    attachments:'File / foto',
    signature_sheets:'Foglio firme',
    company_documents:'Documento aziendale',
    company_document_reads:'Lettura documento',
    profiles:'Utente',
    storage_object:'Documento',
    client_event:'App'
  }[t]||t||'';
}
function auditProfileName(id){
  if(!id)return '';
  return profiles.find(p=>p.id===id)?.nome||'';
}
function auditFormatDate(value){
  if(!value)return '';
  try{
    const s=String(value);
    const d=/^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(s+'T12:00:00'):new Date(s);
    if(Number.isNaN(d.getTime()))return s;
    return new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  }catch(e){return String(value)}
}
function auditStoreName(id){
  if(!id)return '';
  return stores.find(s=>s.id===id)?.nome||'';
}
function auditScheduleDate(id){
  if(!id)return '';
  const s=schedules.find(x=>x.id===id);
  return s?.giorno?auditFormatDate(s.giorno):'';
}
function auditChangedFields(r){
  const oldData=r.old_data||{},newData=r.new_data||{};
  if(!oldData||!newData)return [];
  const skip=new Set(['updated_at','created_at']);
  const labels={
    nome:'Nome',indirizzo:'Indirizzo',citta:'Città',note:'Note',nota_generale:'Nota giornata',
    intervallo_giorni:'Intervallo',ultimo_passaggio:'Ultimo passaggio',stato:'Stato',
    giorno:'Data',giorno_intervento:'Data intervento',data_intervento:'Data intervento',
    posizione:'Posizione',titolo:'Titolo',descrizione:'Descrizione',note_lorenzo:'Note',
    closed_at:'Ora chiusura',profile_id:'Operatore',store_id:'Sede',schedule_id:'Programmazione',
    convalidato_da:'Convalidato da',convalidato_il:'Data convalida',client_type:'Cliente'
  };
  const out=[];
  for(const k of new Set([...Object.keys(oldData),...Object.keys(newData)])){
    if(skip.has(k))continue;
    const a=oldData[k],b=newData[k];
    if(JSON.stringify(a)===JSON.stringify(b))continue;
    let av=a,bv=b;
    if(k==='profile_id'){av=auditProfileName(a)||a;bv=auditProfileName(b)||b}
    if(k==='store_id'){av=auditStoreName(a)||a;bv=auditStoreName(b)||b}
    if(k==='convalidato_da'){av=auditProfileName(a)||a;bv=auditProfileName(b)||b}
    const clean=v=>v===null||v===undefined||v===''?'—':typeof v==='boolean'?(v?'Sì':'No'):String(v);
    out.push(`${labels[k]||k}: ${clean(av)} → ${clean(bv)}`);
  }
  return out;
}
function auditHumanDescription(r){
  const d=r.new_data||r.old_data||{};
  const action=String(r.action||'').toUpperCase();
  const t=r.entity_type;

  if(t==='client_event')return r.description||auditActionLabel(action);

  if(t==='schedules'){
    const date=d.giorno?auditFormatDate(d.giorno):'';
    if(action==='INSERT')return `Creata programmazione${date?' del '+date:''}`;
    if(action==='DELETE')return `Eliminata programmazione${date?' del '+date:''}`;
    if(action==='UPDATE')return `Modificata programmazione${date?' del '+date:''}`;
  }

  if(t==='schedule_members'){
    const who=auditProfileName(d.profile_id);
    const date=auditScheduleDate(d.schedule_id);
    if(action==='INSERT')return `${who||'Un operatore'} aggiunto alla squadra${date?' del '+date:''}`;
    if(action==='DELETE')return `${who||'Un operatore'} rimosso dalla squadra${date?' del '+date:''}`;
    return `Modificata la squadra${date?' del '+date:''}`;
  }

  if(t==='schedule_items'){
    const store=auditStoreName(d.store_id);
    const date=auditScheduleDate(d.schedule_id);
    if(action==='INSERT')return `${store||'Punto vendita'} aggiunto alla programmazione${date?' del '+date:''}`;
    if(action==='DELETE')return `${store||'Punto vendita'} rimosso dalla programmazione${date?' del '+date:''}`;
    if(action==='UPDATE'){
      const changes=auditChangedFields(r);
      return `Modificato ${store||'un lavoro programmato'}${date?' · '+date:''}${changes.length?' · '+changes[0]:''}`;
    }
  }

  if(t==='stores'){
    const name=d.nome||auditStoreName(d.id)||'Sede';
    if(action==='INSERT')return `Creata sede ${name}`;
    if(action==='DELETE')return `Eliminata sede ${name}`;
    if(action==='UPDATE'){
      const changes=auditChangedFields(r);
      return `Modificata sede ${name}${changes.length?' · '+changes.slice(0,2).join(' · '):''}`;
    }
  }

  if(t==='interventions'){
    const store=auditStoreName(d.store_id)||'sede';
    if(action==='INSERT')return `Chiuso nuovo intervento ordinario · ${store}`;
    if(action==='DELETE')return `Eliminato intervento ordinario · ${store}`;
    if(action==='UPDATE'){
      const oldSt=r.old_data?.stato,newSt=r.new_data?.stato;
      if(oldSt!==newSt){
        if(newSt==='convalidato')return `Convalidato intervento ordinario · ${store}`;
        if(newSt==='rifiutato')return `Rifiutato intervento ordinario · ${store}`;
        if(newSt==='da_fare')return `Riaperto intervento ordinario · ${store}`;
        return `Stato intervento ${store}: ${oldSt||'—'} → ${newSt||'—'}`;
      }
      const changes=auditChangedFields(r);
      return `Modificato intervento ordinario · ${store}${changes.length?' · '+changes.slice(0,2).join(' · '):''}`;
    }
  }

  if(t==='intervention_workers'){
    const who=auditProfileName(d.profile_id)||'Operatore';
    if(action==='INSERT')return `${who} associato a un intervento`;
    if(action==='DELETE')return `${who} rimosso da un intervento`;
  }

  if(t==='extras'){
    const title=d.titolo||d.nome_esterno||'Lavoro extra';
    if(action==='INSERT')return `Creato extra · ${title}`;
    if(action==='DELETE')return `Eliminato extra · ${title}`;
    if(action==='UPDATE'){
      const oldSt=r.old_data?.stato,newSt=r.new_data?.stato;
      if(oldSt!==newSt)return `Extra "${title}": stato ${oldSt||'—'} → ${newSt||'—'}`;
      const changes=auditChangedFields(r);
      return `Modificato extra · ${title}${changes.length?' · '+changes.slice(0,2).join(' · '):''}`;
    }
  }

  if(t==='extra_workers'){
    const who=auditProfileName(d.profile_id)||'Operatore';
    if(action==='INSERT')return `${who} assegnato a un lavoro extra`;
    if(action==='DELETE')return `${who} rimosso da un lavoro extra`;
  }

  if(t==='attachments'){
    const name=d.nome_file||'File';
    if(action==='INSERT'||action==='UPLOAD')return `Caricato file/foto · ${name}`;
    if(action==='DELETE')return `Eliminato file/foto · ${name}`;
  }

  if(t==='signature_sheets'){
    const giro=d.round?`${d.round}° giro`:'';
    if(action==='INSERT')return `Caricato foglio firme Eurospin${giro?' · '+giro:''}`;
    if(action==='DELETE')return `Eliminato foglio firme Eurospin${giro?' · '+giro:''}`;
  }

  if(t==='profiles'){
    const name=d.nome||d.email||'Utente';
    if(action==='INSERT')return `Creato utente ${name}`;
    if(action==='DELETE')return `Eliminato utente ${name}`;
    if(action==='UPDATE')return `Modificato utente ${name}`;
  }

  if(t==='storage_object'){
    const raw=r.description||'';
    const path=(d.name||raw.replace(/^(UPLOAD|DELETE|UPDATE) file\s*/i,''));
    const short=path?path.split('/').pop():'Documento';
    if(action==='UPLOAD'||action==='INSERT')return `Caricato documento · ${short}`;
    if(action==='DELETE')return `Eliminato documento · ${short}`;
    if(action==='UPDATE')return `Aggiornato documento · ${short}`;
  }

  return r.description||`${auditActionLabel(action)} · ${auditEntityLabel(t)}`;
}
async function writeClientAudit(action,section,description,details={}){try{if(!session?.user?.id)return;const auditDetails={...details};if(impersonating()){auditDetails.impersonated_user_id=profile.id;auditDetails.impersonated_user_name=profile.nome||profile.email||profile.id;auditDetails.real_admin_id=realProfile.id;auditDetails.real_admin_name=realProfile.nome||realProfile.email||realProfile.id}await sb.rpc('write_client_audit',{p_action:action,p_section:section,p_description:description,p_details:auditDetails,p_client:{url:location.href,user_agent:navigator.userAgent,app_version:APP_VERSION}})}catch(e){console.warn('audit',e)}}
function auditViewOpen(name){if(!session?.user?.id)return;const labels={dashboard:'Dashboard',stores:'Sedi e clienti',schedule:'Programmazione',extras:'Lavori extra',reports:'Report attività',stats:'Statistiche',signatures:'Fogli firme Eurospin',archive:'Archivio aziendale',contacts:'Rubrica lavoro',audit:'Log attività',settings:'Impostazioni'};if(labels[name])writeClientAudit('VIEW','navigation',`Aperta pagina ${labels[name]}`,{view:name})}
function renderAuditUsers(){const sel=$('auditUser');if(!sel)return;const cur=sel.value||'all';sel.innerHTML='<option value="all">Tutti gli utenti</option>';[...profiles].sort((a,b)=>(a.nome||'').localeCompare(b.nome||'')).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.nome||p.email||p.id;sel.appendChild(o)});if([...sel.options].some(o=>o.value===cur))sel.value=cur}
async function openAuditView(){if(!admin())return setView('dashboard');renderAuditUsers();await loadAuditLogs(true)}
async function loadAuditLogs(reset=true){if(!admin())return;const box=$('auditList');if(reset){auditPage=0;auditLogs=[];if(box)box.innerHTML='<p class="muted">Caricamento log…</p>'}const from=$('auditFrom')?.value||'',to=$('auditTo')?.value||'',user=$('auditUser')?.value||'all',section=$('auditSection')?.value||'all',search=($('auditSearch')?.value||'').trim();const size=80,offset=auditPage*size;let q=sb.from('audit_log').select('*').order('created_at',{ascending:false}).range(offset,offset+size);if(from)q=q.gte('created_at',`${from}T00:00:00`);if(to)q=q.lte('created_at',`${to}T23:59:59.999`);if(user!=='all')q=q.eq('actor_id',user);if(section!=='all')q=q.eq('section',section);if(search){const safe=search.replace(/[%_,()]/g,' ');q=q.or(`description.ilike.%${safe}%,action.ilike.%${safe}%,actor_name.ilike.%${safe}%,actor_email.ilike.%${safe}%,entity_type.ilike.%${safe}%`)}const {data,error}=await q;if(error){box.innerHTML=`<p class="error">${esc(error.message)}</p><p class="muted">Esegui MIGRAZIONE-V93.sql su Supabase.</p>`;return}let rows=data||[];auditHasMore=rows.length>size;if(auditHasMore)rows=rows.slice(0,size);auditLogs=reset?rows:[...auditLogs,...rows];renderAuditLogs()}
function renderAuditLogs(){
  const box=$('auditList');if(!box)return;
  $('auditCount').textContent=`${auditLogs.length} ${auditLogs.length===1?'evento':'eventi'}`;
  box.innerHTML='';
  if(!auditLogs.length){box.innerHTML='<section class="panel"><strong>Nessun evento</strong><p class="muted">Nessuna attività corrisponde ai filtri.</p></section>';return}
  auditLogs.forEach(r=>{
    const c=document.createElement('article');c.className='card audit-card';
    let when='';
    try{when=r.created_at?new Intl.DateTimeFormat('it-IT',{dateStyle:'short',timeStyle:'medium'}).format(new Date(r.created_at)):''}catch(e){when=String(r.created_at||'')}
    let changed=[];
    try{changed=auditChangedFields(r)}catch(e){console.warn('audit changed fields',e)}
    let technical='';
    const rawDetails={...(r.details||{})};
    if(r.old_data)rawDetails.prima=r.old_data;
    if(r.new_data)rawDetails.dopo=r.new_data;
    if(Object.keys(rawDetails).length)technical=JSON.stringify(rawDetails,null,2);
    let human='';
    try{human=auditHumanDescription(r)}catch(e){console.warn('audit description',e);human=r.description||`${auditActionLabel(r.action)} · ${auditEntityLabel(r.entity_type)}`}
    const entity=auditEntityLabel(r.entity_type);
    c.innerHTML=`<div class="audit-card-head"><div><span class="audit-badge">${esc(auditSectionLabel(r.section))}</span><h3>${esc(auditActionLabel(r.action))}</h3></div><span class="muted">${esc(when)}</span></div>
      <div class="audit-meta"><span>👤 ${esc(r.actor_name||r.actor_email||'Sistema')}</span>${entity?`<span>📌 ${esc(entity)}</span>`:''}</div>
      <div><strong>${esc(human)}</strong></div>
      ${changed.length>1?`<div class="muted">${changed.slice(1,4).map(x=>esc(x)).join('<br>')}</div>`:''}
      ${technical?`<details><summary>Dettagli tecnici</summary><pre class="audit-details">${esc(technical)}</pre></details>`:''}`;
    box.appendChild(c)
  });
  $('auditLoadMore').classList.toggle('hidden',!auditHasMore)
}

function signatureMonthDefault(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function signatureMonthLabel(year,month){return new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(new Date(Number(year),Number(month)-1,1))}
function signatureUploaderName(row){return profiles.find(p=>p.id===row?.uploaded_by)?.nome||'Utente'}
function signatureFriendlyName(row){const ext=(row?.file_name||'file').split('.').pop()?.toLowerCase()||'file';return `Eurospin_${row.year}-${String(row.month).padStart(2,'0')}_Giro${row.round}_${String(row.sheet_number||1).padStart(2,'0')}.${ext}`}
async function loadSignatureSheets(){
  const box=$('signatureList');if(box)box.innerHTML='<p class="muted">Caricamento fogli firme…</p>';
  const {data,error}=await sb.from('signature_sheets').select('*').order('year',{ascending:false}).order('month',{ascending:false}).order('round',{ascending:true}).order('created_at',{ascending:false});
  if(error){signatureSheets=[];if(box)box.innerHTML=`<section class="panel"><strong>Archivio firme non disponibile</strong><p class="error">${esc(error.message)}</p><p class="muted">Esegui MIGRAZIONE-V92.sql su Supabase e poi premi Aggiorna.</p></section>`;if($('signatureCount'))$('signatureCount').textContent='Archivio non configurato';return false}
  signatureSheets=data||[];renderSignatureSheets();return true
}
async function openSignatureSheetsView(){if($('signatureMonth')&&!$('signatureMonth').value)$('signatureMonth').value=signatureMonthDefault();if($('signatureFilterMonth')&&!$('signatureFilterMonth').value)$('signatureFilterMonth').value=signatureMonthDefault();await loadSignatureSheets()}
function filteredSignatureSheets(){const monthValue=$('signatureFilterMonth')?.value||'',round=$('signatureFilterRound')?.value||'all';let rows=[...signatureSheets];if(monthValue){const [y,m]=monthValue.split('-').map(Number);rows=rows.filter(r=>Number(r.year)===y&&Number(r.month)===m)}if(round!=='all')rows=rows.filter(r=>Number(r.round)===Number(round));return rows}
async function signatureSignedUrl(row,ttl=600){const {data,error}=await sb.storage.from('documenti').createSignedUrl(row.storage_path,ttl);if(error)throw error;return data.signedUrl}
async function previewSignatureSheet(row){try{window.open(await signatureSignedUrl(row,900),'_blank','noopener')}catch(err){alert('Impossibile aprire il foglio: '+err.message)}}
async function downloadSignatureSheet(row){
  if(!admin())return;
  try{
    toast('Preparo il foglio…');const url=await signatureSignedUrl(row,900),res=await fetch(url);if(!res.ok)throw new Error('Download non riuscito');
    const blob=await res.blob(),fileName=signatureFriendlyName(row),file=new File([blob],fileName,{type:row.mime_type||blob.type||'application/octet-stream'});
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]})))await navigator.share({title:'Foglio firme Eurospin',files:[file]});
    else{const objectUrl=URL.createObjectURL(file),a=document.createElement('a');a.href=objectUrl;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),60000)}
  }catch(err){if(err?.name!=='AbortError')alert('Impossibile scaricare il foglio: '+err.message)}
}
async function deleteSignatureSheet(row){
  if(!admin()||!confirm(`Eliminare definitivamente ${signatureFriendlyName(row)}?`))return;
  try{const s=await sb.storage.from('documenti').remove([row.storage_path]);if(s.error)throw s.error;const d=await sb.from('signature_sheets').delete().eq('id',row.id);if(d.error)throw d.error;signatureSheets=signatureSheets.filter(x=>x.id!==row.id);renderSignatureSheets();toast('Foglio eliminato')}catch(err){alert('Eliminazione non riuscita: '+err.message)}
}
function renderSignatureSheets(){
  const box=$('signatureList');if(!box)return;const rows=filteredSignatureSheets();$('signatureCount').textContent=`${rows.length} ${rows.length===1?'foglio caricato':'fogli caricati'}`;box.innerHTML='';
  if(!rows.length){box.innerHTML='<section class="panel"><strong>Nessun foglio caricato</strong><p class="muted">Per questo mese/giro non risultano documenti.</p></section>';return}
  const grouped=new Map();for(const row of rows){const key=`${row.year}-${String(row.month).padStart(2,'0')}-g${row.round}`;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(row)}
  for(const list of grouped.values()){
    const first=list[0],head=document.createElement('section');head.className='panel';head.innerHTML=`<div class="panel-head"><div><span class="eyebrow">${esc(signatureMonthLabel(first.year,first.month))}</span><h2>${Number(first.round)===1?'1° giro':'2° giro'}</h2></div><strong>${list.length} ${list.length===1?'foglio':'fogli'}</strong></div><div class="cards" data-signature-group></div>`;
    const group=head.querySelector('[data-signature-group]');
    list.forEach(row=>{const c=document.createElement('article');c.className='card signature-card';const created=row.created_at?new Intl.DateTimeFormat('it-IT',{dateStyle:'short',timeStyle:'short'}).format(new Date(row.created_at)):'Data non disponibile';c.innerHTML=`<div class="signature-card-head"><div><span class="report-kind">FOGLIO FIRME EUROSPIN</span><h3>Foglio ${esc(String(row.sheet_number||1))}</h3><p class="muted signature-file-name">${esc(row.file_name||'Documento')}</p></div><span class="badge-state">${Number(row.round)===1?'1° giro':'2° giro'}</span></div><div class="signature-meta"><span>👤 ${esc(signatureUploaderName(row))}</span><span>🕒 ${esc(created)}</span></div><div class="signature-actions"><button type="button" class="secondary" data-preview>👁 Anteprima</button>${admin()?'<button type="button" class="secondary" data-download>⬇️ Scarica</button><button type="button" class="danger-btn" data-delete>🗑 Elimina</button>':''}</div>`;c.querySelector('[data-preview]').onclick=()=>previewSignatureSheet(row);c.querySelector('[data-download]')?.addEventListener('click',()=>downloadSignatureSheet(row));c.querySelector('[data-delete]')?.addEventListener('click',()=>deleteSignatureSheet(row));group.appendChild(c)});
    box.appendChild(head)
  }
}
async function uploadSignatureSheet(file,year,month,round){
  const sheetNumber=signatureSheets.filter(r=>Number(r.year)===year&&Number(r.month)===month&&Number(r.round)===round).length+1;
  let upload=file;if(file.type.startsWith('image/'))upload=await compressImage(file);
  const ext=(upload.name||file.name||'file').split('.').pop()?.toLowerCase()||((upload.type||'').includes('pdf')?'pdf':'jpg');
  const safeName=`Eurospin_${year}-${String(month).padStart(2,'0')}_Giro${round}_${String(sheetNumber).padStart(2,'0')}.${ext}`.replace(/[^a-zA-Z0-9._-]/g,'-');
  const path=`firme-eurospin/${year}/${String(month).padStart(2,'0')}/giro-${round}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const up=await sb.storage.from('documenti').upload(path,upload,{upsert:false,cacheControl:'3600',contentType:upload.type||file.type||undefined});if(up.error)throw up.error;
  const {data,error}=await sb.from('signature_sheets').insert({year,month,round,sheet_number:sheetNumber,storage_path:path,file_name:file.name||safeName,mime_type:upload.type||file.type||null,size_bytes:upload.size,uploaded_by:profile.id}).select().single();
  if(error){await sb.storage.from('documenti').remove([path]);throw error}signatureSheets.unshift(data);return data
}

async function signIn(email,password){const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;}
async function signOut(){await writeClientAudit('LOGOUT','auth','Uscita dall’app');sessionStorage.removeItem(IMPERSONATE_PROFILE_KEY);await sb.auth.signOut();location.reload()}
async function loadAll(){
  if(loadAllPromise)return loadAllPromise;
  loadAllPromise=(async()=>{
  const loadStarted=performance.now();
  startupPerf={auth:0,rollover:0,supabase:0,render:0,total:0};
  // V112-25: il rollover NON blocca più l'avvio. La dashboard viene mostrata
  // appena terminato il caricamento dati; il riporto parte subito dopo in background.
  const supabaseStarted=performance.now();

  // V112-23 PERFORMANCE: prima c'erano tre blocchi di lettura Supabase consecutivi
  // (dati principali -> lavorazioni -> giri salvati). Ora tutte le letture partono
  // contemporaneamente: l'avvio paga un solo round-trip di rete invece di tre.
  const [p,s,i,sch,sm,si,e,ew,iw,a,wi,wp,wn,sr,sri,wc,cs,sa,sap]=await Promise.all([
    sb.from('profiles').select('*').order('nome'),
    sb.from('stores').select('*').eq('attivo',true),
    sb.from('interventions').select('*').order('created_at',{ascending:false}),
    sb.from('schedules').select('*').order('giorno'),
    sb.from('schedule_members').select('*'),
    sb.from('schedule_items').select('*').order('posizione'),
    sb.from('extras').select('*').order('giorno_intervento'),
    sb.from('extra_workers').select('*'),
    sb.from('intervention_workers').select('*'),
    sb.from('attachments').select('*').order('created_at',{ascending:false}),
    sb.from('extra_work_items').select('*').order('posizione'),
    sb.from('extra_work_item_photos').select('*').order('created_at'),
    sb.from('extra_work_item_notes').select('*').order('created_at'),
    sb.from('saved_routes').select('*').order('nome'),
    sb.from('saved_route_items').select('*').order('posizione'),
    sb.from('work_contacts').select('*').order('nome'),
    sb.from('contact_stores').select('*'),
    sb.from('schedule_activities').select('*').order('posizione'),
    sb.from('schedule_activity_photos').select('*').order('created_at')
  ]);
  startupPerf.supabase=performance.now()-supabaseStarted;
  for(const r of [p,s,i,sch,sm,si,e,ew,iw,a])if(r.error)throw r.error;
  profiles=p.data||[];stores=s.data||[];interventions=i.data||[];schedules=sch.data||[];scheduleMembers=sm.data||[];scheduleItems=si.data||[];extras=e.data||[];extraWorkers=ew.data||[];interventionWorkers=iw.data||[];attachments=a.data||[];

  if(!wi.error&&!wp.error&&!wn.error){
    extraWorkItems=wi.data||[];extraWorkItemPhotos=wp.data||[];extraWorkItemNotes=wn.data||[];
  }else{
    extraWorkItems=[];extraWorkItemPhotos=[];extraWorkItemNotes=[];
    console.warn('Lavorazioni multiple non disponibili:',wi.error?.message||wp.error?.message||wn.error?.message||'errore sconosciuto');
  }
  if(!sr.error)savedRoutes=sr.data||[];else{savedRoutes=[];console.warn('Giri salvati non disponibili:',sr.error.message)}
  if(!sri.error)savedRouteItems=sri.data||[];else{savedRouteItems=[];console.warn('Elementi giri salvati non disponibili:',sri.error.message)}
  if(!wc.error)workContacts=wc.data||[];else{workContacts=[];console.warn('Rubrica lavoro non disponibile: esegui MIGRAZIONE-V112-28.sql',wc.error.message)}
  if(!cs.error)contactStores=cs.data||[];else{contactStores=[];console.warn('Collegamenti rubrica-sedi non disponibili:',cs.error.message)}
  if(!sa.error)scheduleActivities=sa.data||[];else{scheduleActivities=[];console.warn('Attività agenda non disponibili: esegui MIGRAZIONE-V112-28.sql',sa.error.message)}
  if(!sap.error)scheduleActivityPhotos=sap.data||[];else{scheduleActivityPhotos=[];console.warn('Foto attività agenda non disponibili: esegui MIGRAZIONE-V112-30.sql',sap.error.message)}

  realProfile=profiles.find(x=>x.id===session.user.id);if(!realProfile)throw new Error('Profilo non trovato');
  const impersonatedId=sessionStorage.getItem(IMPERSONATE_PROFILE_KEY);
  const impersonatedTarget=realProfile.ruolo==='admin'&&impersonatedId?profiles.find(x=>x.id===impersonatedId&&x.attivo!==false&&x.ruolo!=='admin'):null;
  if(impersonatedId&&!impersonatedTarget)sessionStorage.removeItem(IMPERSONATE_PROFILE_KEY);
  profile=impersonatedTarget||realProfile;
  syncImpersonationUi();

  const renderStarted=performance.now();
  // Prima mostriamo l'interfaccia. Le manutenzioni correttive non devono più
  // tenere l'utente davanti a uno schermo vuoto/nero.
  renderStores();renderWorkers();renderReportFilters();renderPending();renderScheduleFilters();renderSchedules();renderExtras();renderWorkContacts();renderDashboard();if($('statsView'))renderStats();ensureCloudSettingsUi();renderCloudEmployeeList();cleanupPhotoRecoveryRows().catch(()=>{});updateSyncUi();processUploadQueue();handleNotificationDeepLink();
  const lastUpdate=$('syncStatus');if(lastUpdate)lastUpdate.textContent='Ultimo aggiornamento dati: '+new Date().toLocaleTimeString('it-IT');
  startupPerf.render=performance.now()-renderStarted;
  startupPerf.total=performance.now()-loadStarted;
  renderStartupPerf();
  console.info('Overgreen diagnostica avvio',startupPerf);

  // V112-25: rollover e riconciliazioni partono DOPO il primo rendering.
  // Nessuna di queste operazioni può più tenere l'utente sullo schermo nero.
  setTimeout(async()=>{
    const rolloverKey='overgreen-rollover-ok-'+today();
    if(localStorage.getItem(rolloverKey)!=='1'){
      const rolloverStarted=performance.now();
      try{
        const roll=await sb.rpc('rollover_overgreen_schedules',{p_today:today()});
        startupPerf.rollover=performance.now()-rolloverStarted;
        renderStartupPerf();
        if(roll.error){
          if(!String(roll.error.message||'').toLowerCase().includes('rollover_overgreen_schedules'))console.warn('Riporto automatico non riuscito:',roll.error.message);
        }else{
          Object.keys(localStorage).filter(k=>k.startsWith('overgreen-rollover-ok-')&&k!==rolloverKey).forEach(k=>localStorage.removeItem(k));
          localStorage.setItem(rolloverKey,'1');
          // Il rollover può aver creato/spostato programmazioni: ricarichiamo SOLO i dati
          // coinvolti, senza rifare l'intero loadAll e senza bloccare l'interfaccia.
          const [sch2,sm2,si2]=await Promise.all([
            sb.from('schedules').select('*').order('giorno'),
            sb.from('schedule_members').select('*'),
            sb.from('schedule_items').select('*').order('posizione')
          ]);
          if(!sch2.error)schedules=sch2.data||[];
          if(!sm2.error)scheduleMembers=sm2.data||[];
          if(!si2.error)scheduleItems=si2.data||[];
          renderSchedules();renderDashboard();
        }
      }catch(rollErr){
        startupPerf.rollover=performance.now()-rolloverStarted;
        renderStartupPerf();
        console.warn('Riporto automatico non disponibile:',rollErr);
      }
    }
    try{
      await reconcileProgrammingConsistency();
      renderSchedules();renderDashboard();
    }catch(err){console.warn('Manutenzione programmazione in background non riuscita:',err?.message||err)}
  },50);
  })();
  try{return await loadAllPromise}finally{loadAllPromise=null}
}


function assignedExtraIds(){return new Set(extraWorkers.filter(w=>w.profile_id===profile?.id).map(w=>w.extra_id))}
function openExtraJobs(){return extras.filter(e=>e.stato!=='completato')}
function linkedExtrasForScheduleItem(itemId){return extras.filter(e=>e.schedule_item_id===itemId&&e.stato!=='completato')}
function extraIsDone(e){return e?.stato==='completato'}
function openMultiDayIntervention(storeId){return interventions.find(i=>i.store_id===storeId&&i.multi_day_open===true)}
async function fetchOpenMultiDayIntervention(storeId){
  const {data,error}=await sb.from('interventions').select('*').eq('store_id',storeId).eq('multi_day_open',true).order('data_intervento',{ascending:false}).limit(2);
  if(error)throw error;
  if((data||[]).length>1)console.warn('Più interventi multigiorno aperti per la stessa sede:',storeId,data.map(x=>x.id));
  return data?.[0]||null;
}
function interventionEndDate(i){return i.data_fine||i.data_intervento}
function interventionDateLabel(i){const a=i.data_intervento,b=interventionEndDate(i);return a&&b&&a!==b?`${fmt(a)} → ${fmt(b)}`:fmt(a)}
async function linkOrdinaryExtras(scheduleId,scheduleDate,memberIds,items){
  const linked=[];
  for(const item of items||[]){
    const matches=extras.filter(e=>e.con_ordinario===true&&e.store_id===item.store_id&&e.stato!=='completato'&&!e.schedule_item_id);
    for(const ex of matches){
      const r=await sb.from('extras').update({schedule_item_id:item.id,giorno_intervento:scheduleDate}).eq('id',ex.id);if(r.error)throw r.error;
      if(memberIds.length){const wr=await sb.from('extra_workers').upsert(memberIds.map(profile_id=>({extra_id:ex.id,profile_id})),{onConflict:'extra_id,profile_id'});if(wr.error)throw wr.error}
      linked.push(ex.id);
    }
  }
  return linked;
}

function interventionHasScheduleItem(intervention,itemId){
  if(!intervention||!itemId)return false;
  if(intervention.schedule_item_id===itemId)return true;
  return Array.isArray(intervention.schedule_item_ids)&&intervention.schedule_item_ids.includes(itemId);
}
function effectiveScheduleState(item){
  if(!item)return 'da_fare';
  // Un elemento riportato appartiene allo storico della giornata originaria
  // e non deve più risultare come lavoro aperto. La copia attiva vive nella giornata successiva.
  if(item.stato==='riportato')return 'completato';

  // Negli interventi multigiorno il primo giorno resta in schedule_item_id,
  // mentre le continuazioni sono memorizzate in schedule_item_ids.
  const related=interventions.filter(i=>interventionHasScheduleItem(i,item.id));
  if(related.some(i=>i.stato==='convalidato'&&!i.multi_day_open))return 'completato';
  if(related.some(i=>i.stato==='in_attesa'&&!i.multi_day_open))return 'in_attesa';

  // Se il multigiorno è ancora aperto, la giornata già lavorata resta chiusa;
  // l'eventuale prosecuzione attiva è rappresentata dalla voce programmata successiva.
  if(related.some(i=>i.multi_day_open===true))return 'completato';

  // Lo storico è la fonte reale: senza intervento il lavoro deve essere nuovamente eseguibile.
  if(['completato','in_attesa'].includes(item.stato)&&!related.length)return 'da_fare';
  return item.stato||'da_fare';
}

async function reconcileProgrammingConsistency(){
  if(!admin())return;
  const validItemIds=new Set(scheduleItems.map(x=>x.id));
  const fixes=scheduleItems.filter(item=>['completato','in_attesa'].includes(item.stato)&&!interventions.some(i=>interventionHasScheduleItem(i,item.id)));
  for(const item of fixes){
    const {error}=await sb.from('schedule_items').update({stato:'da_fare'}).eq('id',item.id);
    if(error)console.warn('Ripristino programmazione non riuscito:',item.id,error.message);else item.stato='da_fare';
  }
  const orphanExtras=extras.filter(e=>e.schedule_item_id&&!validItemIds.has(e.schedule_item_id)&&e.stato!=='completato');
  for(const e of orphanExtras){
    const {error}=await sb.from('extras').update({schedule_item_id:null}).eq('id',e.id);
    if(error)console.warn('Scollegamento extra orfano non riuscito:',e.id,error.message);else e.schedule_item_id=null;
  }
  const emptySchedules=schedules.filter(s=>!scheduleItems.some(i=>i.schedule_id===s.id)&&!extras.some(e=>e.schedule_id===s.id&&e.stato!=='completato'));
  for(const sch of emptySchedules){
    let r=await sb.from('schedule_members').delete().eq('schedule_id',sch.id);
    if(r.error){console.warn('Pulizia membri programmazione vuota non riuscita:',r.error.message);continue}
    r=await sb.from('schedules').delete().eq('id',sch.id);
    if(r.error)console.warn('Pulizia programmazione vuota non riuscita:',r.error.message);
    else{schedules=schedules.filter(x=>x.id!==sch.id);scheduleMembers=scheduleMembers.filter(x=>x.schedule_id!==sch.id)}
  }
}
function dashboardOrdinaryCompletionMs(item){
  const related=interventions.filter(i=>interventionHasScheduleItem(i,item?.id)&&!i.multi_day_open);
  if(!related.length)return 0;
  return Math.max(...related.map(i=>Date.parse(i.closed_at||i.convalidato_il||i.created_at||'')||0));
}
function dashboardJobStatus(job){
  if(job.kind==='ordinary'){
    const st=effectiveScheduleState(job.row.item);
    return st==='da_fare'?0:1; // in_attesa e completato sono già eseguiti
  }
  if(job.kind==='extra')return ['in_attesa','completato'].includes(job.extra?.stato)?1:0;
  if(job.kind==='activity')return job.activity?.stato==='completato'?1:0;
  return 0;
}
function dashboardJobRoutePosition(job){
  if(job.kind==='ordinary')return Number(job.row.item.posizione)||999999;
  if(job.kind==='extra')return extraRoutePosition(job.extra);
  return Number(job.activity.posizione)||999999;
}
function dashboardJobCompletionMs(job){
  if(job.kind==='ordinary')return dashboardOrdinaryCompletionMs(job.row.item);
  if(job.kind==='extra')return Date.parse(job.extra?.closed_at||job.extra?.convalidato_il||job.extra?.updated_at||'')||0;
  if(job.kind==='activity')return Date.parse(job.activity?.completed_at||job.activity?.updated_at||'')||0;
  return 0;
}
function dashboardJobCompare(a,b){
  const sa=dashboardJobStatus(a),sb=dashboardJobStatus(b);
  if(sa!==sb)return sa-sb; // prima tutto ciò che è ancora da fare
  if(sa===0){
    const pa=dashboardJobRoutePosition(a),pb=dashboardJobRoutePosition(b);
    return pa-pb||String((a.row?.item||a.extra||a.activity)?.id||'').localeCompare(String((b.row?.item||b.extra||b.activity)?.id||''));
  }
  // Gli eseguiti restano sotto, nell'ordine in cui sono stati effettivamente chiusi.
  const ta=dashboardJobCompletionMs(a),tb=dashboardJobCompletionMs(b);
  if(ta&&tb&&ta!==tb)return ta-tb;
  if(ta!==tb)return ta? -1:1;
  return dashboardJobRoutePosition(a)-dashboardJobRoutePosition(b)||String((a.row?.item||a.extra||a.activity)?.id||'').localeCompare(String((b.row?.item||b.extra||b.activity)?.id||''));
}
function globalSearchMatches(q){q=String(q||'').trim().toLowerCase();if(q.length<2)return [];const out=[],add=(k,t,s,a)=>{if((t+" "+s).toLowerCase().includes(q))out.push({k,t,s,a})};stores.forEach(x=>add("Sede",x.nome||"Sede",[x.indirizzo,x.citta].filter(Boolean).join(" · "),()=>{setView("stores");$("searchInput").value=x.nome||"";renderStores()}));extras.forEach(x=>{const st=stores.find(s=>s.id===x.store_id);add("Extra",x.titolo||"Extra",[x.numero_target?"Target "+x.numero_target:"",st?.nome||x.nome_esterno||""].filter(Boolean).join(" · "),()=>{setView("extras");$("extraSearchInput").value=x.numero_target||x.titolo||"";renderExtras()})});profiles.forEach(x=>add("Operatore",x.nome||x.email||"Operatore",x.email||"",()=>setView("schedule")));return out.slice(0,40)}
function renderGlobalSearchEverywhere(){const i=$("globalSearchEverywhere"),r=$("globalResultsEverywhere");if(!i||!r)return;r.innerHTML="";const rows=globalSearchMatches(i.value);if(i.value.trim().length<2)return;if(!rows.length){r.innerHTML='<p class="muted">Nessun risultato.</p>';return}rows.forEach(x=>{const b=document.createElement("button");b.className="card";b.innerHTML=`<strong>${esc(x.k)} · ${esc(x.t)}</strong><small>${esc(x.s)}</small>`;b.onclick=()=>{x.a();$("globalSearchDialog").close()};r.appendChild(b)})}
function anomalyCounts(){const orphan=attachments.filter(a=>(a.intervention_id&&!interventions.some(i=>i.id===a.intervention_id))||(a.extra_id&&!extras.some(e=>e.id===a.extra_id))).length,noWorker=interventions.filter(i=>["in_attesa","convalidato"].includes(i.stato)&&!interventionWorkers.some(w=>w.intervention_id===i.id)).length,noTarget=extras.filter(e=>clientType(e)==="eurospin"&&e.stato!=="completato"&&!String(e.numero_target||"").trim()).length;return{orphan,noWorker,noTarget,total:orphan+noWorker+noTarget}}
function renderHealthCenter(){if(!$("healthSummary")||!admin())return;const h=anomalyCounts();$("healthSummary").innerHTML=`<div class="health-kpi"><strong>${h.total}</strong><span>Anomalie</span></div><div class="health-kpi"><strong>${attachments.length}</strong><span>Allegati</span></div><div class="health-kpi"><strong>${interventions.length+extras.length}</strong><span>Lavori</span></div>`;$("healthDetails").innerHTML=[["Allegati orfani",h.orphan],["Chiusure senza operatore",h.noWorker],["Extra Eurospin senza target",h.noTarget]].map(x=>`<div class="health-issue"><strong>${x[1]?"⚠️":"✓"} ${x[0]} · ${x[1]}</strong></div>`).join("")}
function renderDashboardSmart(){const r=$("dashboardSmart");if(!r)return;if(!admin()){r.innerHTML="";r.classList.add("hidden");return}r.classList.remove("hidden");const h=anomalyCounts(),p=interventions.filter(i=>i.stato==="in_attesa").length+extras.filter(e=>e.stato==="in_attesa").length,o=extras.filter(e=>e.stato!=="completato").length;r.innerHTML=`<button class="smart-chip ${p?"warn":"good"}" data-s="p"><strong>${p}</strong><span>Da convalidare</span></button><button class="smart-chip ${o?"warn":"good"}" data-s="e"><strong>${o}</strong><span>Extra aperti</span></button>`;r.querySelector('[data-s="p"]').onclick=()=>p?openPendingDialog():toast("Nessuna convalida");r.querySelector('[data-s="e"]').onclick=()=>setView("extras")}
function renderDashboard(){renderDashboardSmart();
  if(!$('dashToday'))return;
  const currentTravelToken=++travelRenderToken;
  const todayStr=today();
  const visible=visibleSchedules();
  const myExtraIds=assignedExtraIds();
  const activeExtraStates=['programmato','ricevuto','da_integrare','in_attesa'];
  const completedExtraStates=['completato'];
  const isExtraVisible=e=>admin()||myExtraIds.has(e.id);
  const isScheduleVisible=s=>admin()||visible.some(v=>v.id===s.id);
  const scheduleForItem=i=>schedules.find(s=>s.id===i.schedule_id);
  const itemVisible=i=>{const s=scheduleForItem(i);return !!s&&isScheduleVisible(s)};
  const itemDate=i=>scheduleForItem(i)?.giorno||'';
  const itemDone=i=>effectiveScheduleState(i)==='completato';
  const itemPending=i=>effectiveScheduleState(i)==='in_attesa';
  const todaysItems=scheduleItems.filter(i=>itemVisible(i)&&itemDate(i)===todayStr&&!itemDone(i));
  const todaysExtras=extras.filter(e=>isExtraVisible(e)&&e.giorno_intervento===todayStr&&activeExtraStates.includes(e.stato));
  const todaysActivities=scheduleActivities.filter(a=>{const sch=schedules.find(x=>x.id===a.schedule_id);return sch&&isScheduleVisible(sch)&&sch.giorno===todayStr&&a.stato==='da_fare'});
  const todaysDoneItems=scheduleItems.filter(i=>itemVisible(i)&&itemDate(i)===todayStr&&itemDone(i));
  const todaysDoneExtras=extras.filter(e=>isExtraVisible(e)&&e.giorno_intervento===todayStr&&extraIsDone(e));
  const todaysDoneActivities=scheduleActivities.filter(a=>{const sch=schedules.find(x=>x.id===a.schedule_id);return sch&&isScheduleVisible(sch)&&sch.giorno===todayStr&&a.stato==='completato'});
  $('dashToday').textContent=todaysItems.length+todaysExtras.length+todaysActivities.length;
  $('dashDone').textContent=todaysDoneItems.length+todaysDoneExtras.length+todaysDoneActivities.length;
  $('dashScheduled').textContent=stores.filter(s=>status(s)==='scheduled').length;
  const clientStores=type=>stores.filter(s=>clientType(s)===type);
  const openClientExtras=type=>extras.filter(e=>clientType(e)===type&&!['completato','in_attesa'].includes(e.stato));
  if(admin()){
    const rawDue=s=>{if(!storeHasInterval(s))return false;const n=days(s.ultimo_passaggio),lim=Number(s.intervallo_giorni);return n===null||(n>lim&&n<=lim+10)};
    const counterWithUnscheduled=(list,test)=>{const total=list.filter(test).length,available=list.filter(s=>test(s)&&!isStoreProgrammed(s.id)).length;return `${total} (${available})`};
    $('dashEurospinDue').textContent=counterWithUnscheduled(clientStores('eurospin'),rawDue);
    $('dashEurospinUrgent').textContent=counterWithUnscheduled(clientStores('eurospin'),isUrgentStore);
    $('dashEurospinTargets').textContent=openClientExtras('eurospin').length;
    $('dashIntesaDue').textContent=counterWithUnscheduled(clientStores('intesa'),rawDue);
    $('dashIntesaUrgent').textContent=counterWithUnscheduled(clientStores('intesa'),isUrgentStore);
    $('dashIntesaTickets').textContent=openClientExtras('intesa').length;
    $('dashboardClientCounters')?.classList.remove('hidden');
  }else{
    $('dashboardClientCounters')?.classList.add('hidden');
  }

  document.querySelectorAll('[data-client-counter]').forEach(btn=>{
    btn.onclick=()=>{
      const key=btn.dataset.clientCounter,[client,kind]=key.split('-');
      if(kind==='extra'){extraClientFilter=client;setView('extras');renderExtras();return}
      storeClientFilter=client;storeFilter=kind==='due'?'due':kind==='urgent'?'urgent':'all';setView('stores');renderStores();
    };
  });

  const oldStrip=$('dashboardOperationalStrip');
  if(oldStrip)oldStrip.remove();

  const next=$('dashboardNext');next.innerHTML='';
  const title=next.closest('.panel')?.querySelector('h2');if(title)title.textContent=admin()?'Programma operativo · prossimi 7 giorni':'I tuoi prossimi 7 giorni';
  const startDate=new Date(todayStr+'T12:00:00');
  for(let offset=0;offset<7;offset++){
    const d=new Date(startDate);d.setDate(d.getDate()+offset);const date=d.toISOString().slice(0,10);
    const ordinary=scheduleItems.filter(i=>itemVisible(i)&&itemDate(i)===date).map(i=>({item:i,schedule:scheduleForItem(i)})).sort((a,b)=>(Number(a.item.posizione)||0)-(Number(b.item.posizione)||0)||String(a.item.id).localeCompare(String(b.item.id)));
    const linkedIds=new Set(ordinary.flatMap(x=>linkedExtrasForScheduleItem(x.item.id).map(e=>e.id)));
    const dayExtras=extras.filter(e=>isExtraVisible(e)&&e.giorno_intervento===date&&!linkedIds.has(e.id)&&(activeExtraStates.includes(e.stato)||extraIsDone(e))).sort((a,b)=>String(a.titolo||'').localeCompare(String(b.titolo||'')));
    const dayActivities=scheduleActivities.filter(a=>{const sch=schedules.find(x=>x.id===a.schedule_id);return sch&&sch.giorno===date&&isScheduleVisible(sch)&&a.stato!=='annullato'}).sort((a,b)=>(Number(a.posizione)||999999)-(Number(b.posizione)||999999));
    const allJobsCount=ordinary.length+dayExtras.length+dayActivities.length;
    const completedCount=ordinary.filter(x=>itemDone(x.item)).length+dayExtras.filter(extraIsDone).length+dayActivities.filter(a=>a.stato==='completato').length;
    const percent=allJobsCount?Math.round(completedCount/allJobsCount*100):0;
    const details=document.createElement('details');details.className='dashboard-day';details.open=offset===0;
    const dayName=new Intl.DateTimeFormat('it-IT',{weekday:'long'}).format(d);
    details.innerHTML=`<summary><span class="dashboard-day-title"><strong>${offset===0?'Oggi · ':''}${esc(dayName.charAt(0).toUpperCase()+dayName.slice(1))}</strong><small>${fmt(date)}</small></span><span class="dashboard-day-summary"><span class="day-type-count"><b>${ordinary.length}</b> ordinari</span><span class="day-type-count extra"><b>${dayExtras.length}</b> extra</span><span class="day-type-count"><b>${dayActivities.length}</b> attività</span><span class="dashboard-day-count">${allJobsCount}</span></span></summary><div class="dashboard-day-progress"><div style="width:${percent}%"></div></div><div class="dashboard-day-progress-label"><strong>${percent}%</strong><span>${completedCount} completati su ${allJobsCount}</span></div><div class="dashboard-day-jobs"></div>`;
    const box=details.querySelector('.dashboard-day-jobs');
    const groups=new Map();
    const addToGroup=(key,label,job)=>{if(!groups.has(key))groups.set(key,{label,jobs:[]});groups.get(key).jobs.push(job)};
    for(const row of ordinary){
      const members=scheduleMembers.filter(m=>m.schedule_id===row.schedule.id).map(m=>profiles.find(p=>p.id===m.profile_id)).filter(Boolean);
      const label=members.length?members.map(p=>p.nome).join(' + '):'Da assegnare';
      addToGroup(members.length?'team-'+members.map(p=>p.id).sort().join('-'):'unassigned','👤 '+label,{kind:'ordinary',row});
    }
    for(const e of dayExtras){
      const members=extraWorkers.filter(w=>w.extra_id===e.id).map(w=>profiles.find(p=>p.id===w.profile_id)).filter(Boolean);
      const label=members.length?members.map(p=>p.nome).join(' + '):'Da assegnare';
      addToGroup(members.length?'team-'+members.map(p=>p.id).sort().join('-'):'unassigned','👤 '+label,{kind:'extra',extra:e});
    }
    for(const a of dayActivities){
      const sch=schedules.find(x=>x.id===a.schedule_id),members=scheduleMembers.filter(m=>m.schedule_id===sch?.id).map(m=>profiles.find(p=>p.id===m.profile_id)).filter(Boolean);
      const label=members.length?members.map(p=>p.nome).join(' + '):'Da assegnare';
      addToGroup(members.length?'team-'+members.map(p=>p.id).sort().join('-'):'unassigned','👤 '+label,{kind:'activity',activity:a,schedule:sch});
    }
    const sortedGroups=[...groups.entries()].sort((a,b)=>a[0]==='unassigned'?1:b[0]==='unassigned'?-1:a[1].label.localeCompare(b[1].label));
    for(const [,group] of sortedGroups){
      const section=document.createElement('section');section.className='dashboard-worker-group';
      section.innerHTML=`<h3>${esc(group.label)} <span>${group.jobs.length}</span></h3><div></div>`;
      const list=section.querySelector('div');
      // V112-39: non mischiare mai lavori eseguiti e lavori ancora da fare.
      // I da-fare mantengono l'ordine di programmazione; gli eseguiti vanno sotto
      // e mantengono l'ordine cronologico di chiusura.
      group.jobs.sort(dashboardJobCompare);
      for(const job of group.jobs){
        if(job.kind==='ordinary'){
          const row=job.row,st=stores.find(x=>x.id===row.item.store_id),linked=linkedExtrasForScheduleItem(row.item.id),done=itemDone(row.item),c=document.createElement('article');
          const pending=itemPending(row.item);
          c.className=`dashboard-line-job ordinary ${done?'is-done':pending?'is-pending':'is-open'}`;
          const ordinaryNotes=[row.schedule?.nota_generale,st?.note].filter(v=>String(v||'').trim());
          c.innerHTML=`<div class="job-main"><span class="job-kind">ORDINARIO</span>${clientBadge(st)}<strong>${esc(st?.nome||'Punto vendita')}</strong>${(st?.indirizzo||st?.citta)?`<small class="dashboard-job-address">📍 ${esc([st?.indirizzo,st?.citta].filter(Boolean).join(', '))}</small>`:''}<small>${done?'Completato':pending?'In attesa di convalida':'Da eseguire'}</small>${ordinaryNotes.length?`<div class="dashboard-job-notes"><strong>Note</strong>${ordinaryNotes.map(n=>`<p>${esc(n)}</p>`).join('')}</div>`:''}${linked.length?`<div class="embedded-extras"><strong>Extra nello stesso intervento</strong>${linked.map(e=>{const pdf=attachments.find(a=>a.extra_id===e.id&&a.tipo==='pdf_richiesta');return `<div class="embedded-extra ${extraCategoryClass(e)} ${extraIsDone(e)?'is-done':'is-open'}" data-open-linked-extra="${e.id}" role="button" tabindex="0"><span>${extraIsDone(e)?'✓':'!'}</span><div><b>${esc(e.titolo)}</b><span class="extra-category-badge ${extraCategoryClass(e)}">${esc(extraCategoryLabel(e))}</span>${e.numero_target?`<small class="target-number">Target: ${esc(e.numero_target)}</small>`:''}<small>${extraIsDone(e)?'Completato':'Da fare insieme al passaggio'} · Tocca per aprire</small>${e.descrizione?`<p class="embedded-extra-description">${esc(e.descrizione)}</p>`:''}${pdf?`<button type="button" class="secondary compact-btn" data-open-linked-pdf="${e.id}">📄 Apri PDF</button>`:''}</div></div>`}).join('')}</div>`:''}</div><div class="actions"><button class="secondary" data-map>Maps</button>${admin()?'<button class="secondary" data-share>Condividi</button>':''}${done?(admin()?'<button class="reopen-intervention-btn" data-reopen>↩ Riapri intervento</button>':'<button class="secondary" disabled>✓ Completato</button>'):pending?'<button class="secondary" disabled>⏳ In attesa</button>':'<button data-done>✓ Eseguito</button>'}</div>`;
          c.dataset.routeAddress=routeAddressForStore(st);
          c.querySelector('[data-map]').onclick=()=>openGoogleMaps(st?.indirizzo,clientLabel(st)+' '+(st?.nome||''),st?.citta);
          const shareBtn=c.querySelector('[data-share]');
          if(shareBtn){
            prepareOrdinaryShareButton(shareBtn,linked);
            shareBtn.addEventListener('click',async()=>{
              if(shareBtn.dataset.shareMode==='prepare'){
                await prepareOrdinaryShare(shareBtn,st,row.item.id,linked);
                return;
              }
              shareOrdinaryExternally(st,row.item.id);
            });
          }
          c.querySelectorAll('[data-open-linked-extra]').forEach(el=>{
            const open=()=>openExtraById(el.dataset.openLinkedExtra);
            el.addEventListener('click',ev=>{if(ev.target.closest('[data-open-linked-pdf]'))return;open()});
            el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open()}});
          });
          c.querySelectorAll('[data-open-linked-pdf]').forEach(btn=>btn.addEventListener('click',ev=>{
            ev.preventDefault();ev.stopPropagation();
            const ex=linked.find(e=>e.id===btn.dataset.openLinkedPdf),pdf=attachments.find(a=>a.extra_id===ex?.id&&a.tipo==='pdf_richiesta');
            if(pdf)openAttachment(pdf);
          }));
          c.querySelector('[data-done]')?.addEventListener('click',()=>openDone(st,row.item.id));
          c.querySelector('[data-reopen]')?.addEventListener('click',()=>reopenOrdinaryIntervention(row.item,st));
          list.appendChild(c)
        }else if(job.kind==='extra'){
          const e=job.extra,st=stores.find(s=>s.id===e.store_id),done=extraIsDone(e),urgent=e.urgente===true||e.priorita==='urgente'||elapsedDaysFrom(extraRequestDate(e))>=7,c=document.createElement('article');
          const pending=e.stato==='in_attesa';
          c.className=`dashboard-line-job standalone-extra ${extraCategoryClass(e)} ${done?'is-done':pending?'is-pending':urgent?'is-urgent is-open':'is-open'}`;
          const extraNotes=[e.descrizione,e.note_lorenzo].filter(v=>String(v||'').trim());
          const requestPdf=attachments.find(a=>a.extra_id===e.id&&a.tipo==='pdf_richiesta');
          const canClose=!done&&!isIntesaOrdinaryTicket(e)&&['programmato','ricevuto','da_integrare'].includes(e.stato)&&(admin()||myExtraIds.has(e.id));
          const hasMap=!!extraMapsDestination(e,st);
          c.innerHTML=`<div class="job-main"><span class="job-kind">EXTRA</span>${clientBadge(e)}<span class="extra-category-badge ${extraCategoryClass(e)}">${esc(extraCategoryLabel(e))}</span><strong>${esc(st?.nome||e.nome_esterno||'Extra')}</strong>${(st?.indirizzo||st?.citta||e.indirizzo_esterno)?`<small class="dashboard-job-address">📍 ${esc([st?.indirizzo||e.indirizzo_esterno,st?.citta].filter(Boolean).join(', '))}</small>`:''}<small>${esc(e.titolo)} · ${done?'Completato':urgent?'Urgente':'Da eseguire'}</small>${extraNotes.length?`<div class="dashboard-job-notes"><strong>${done?'Descrizione / note':'Descrizione'}</strong>${extraNotes.map(n=>`<p>${esc(n)}</p>`).join('')}</div>`:''}</div><div class="actions">${hasMap?'<button class="secondary" data-map-extra>Maps</button>':''}${requestPdf?'<button class="secondary" data-pdf-extra>Apri PDF</button>':''}${canClose?'<button data-close-extra-dashboard>✓ Eseguito</button>':''}<button class="secondary" data-open-extra>Apri extra</button></div>`;
          c.dataset.routeAddress=routeAddressForExtra(e,st);
          c.querySelector('[data-map-extra]')?.addEventListener('click',()=>openExtraMaps(e,st));
          c.querySelector('[data-pdf-extra]')?.addEventListener('click',()=>openAttachment(requestPdf));
          c.querySelector('[data-close-extra-dashboard]')?.addEventListener('click',()=>openExtraClosureDialog(e));
          c.querySelector('[data-open-extra]').onclick=()=>openExtraById(e.id);list.appendChild(c)
        }else{
          const a=job.activity,st=stores.find(x=>x.id===a.store_id),ct=workContacts.find(x=>x.id===a.contact_id),done=a.stato==='completato',meta=activityTypeMeta(a.tipo),c=document.createElement('article');
          c.className=`dashboard-line-job schedule-activity ${done?'is-done':'is-open'}`;c.dataset.routeAddress=a.indirizzo||routeAddressForStore(st)||'';
          c.innerHTML=`<div class="job-main"><span class="job-kind">${meta.icon} ATTIVITÀ</span><strong>${esc(a.titolo||meta.label)}</strong><small>${esc([a.ora?String(a.ora).slice(0,5):null,st?.nome||a.indirizzo].filter(Boolean).join(' · '))}</small>${ct?`<div class="dashboard-job-notes"><strong>Contatto</strong><p>${esc([ct.nome,ct.azienda,ct.ruolo,ct.telefono].filter(Boolean).join(' · '))}</p></div>`:''}${a.note?`<div class="dashboard-job-notes"><strong>Note</strong><p>${esc(a.note)}</p></div>`:''}</div><div class="actions">${c.dataset.routeAddress?'<button class="secondary" data-map-activity>Maps</button>':''}${done?'<button class="secondary" disabled>✓ Fatto</button>':'<button data-done-activity>✓ Fatto</button>'}</div>`;
          c.querySelector('[data-map-activity]')?.addEventListener('click',()=>openGoogleMaps(a.indirizzo||st?.indirizzo,a.titolo||meta.label,st?.citta));c.querySelector('[data-done-activity]')?.addEventListener('click',()=>completeScheduleActivity(a));list.appendChild(c)
        }
      }
      box.appendChild(section);
      hydrateWorkerTravel(section,currentTravelToken);
    }
    if(!allJobsCount)box.innerHTML='<p class="muted dashboard-day-empty">Nessun lavoro programmato.</p>';
    next.appendChild(details)
  }
}
function openScheduleDate(date){
  scheduleExactDate=date;
  scheduleDateFilter='all';
  scheduleWorkerFilter='all';
  if($('scheduleDateFilter'))$('scheduleDateFilter').value='all';
  if($('scheduleWorkerFilter'))$('scheduleWorkerFilter').value='all';
  setView('schedule');
  setTimeout(()=>{const list=$('scheduleList');if(list)list.scrollIntoView({behavior:'smooth',block:'start'})},50);
}

function contactStoreNames(contactId){return contactStores.filter(x=>x.contact_id===contactId).map(x=>stores.find(s=>s.id===x.store_id)?.nome).filter(Boolean)}
function renderWorkContacts(){const root=$('contactsList');if(!root)return;const q=String($('contactsSearch')?.value||'').trim().toLowerCase();root.innerHTML='';const list=workContacts.filter(c=>c.attivo!==false&&(!q||[c.nome,c.azienda,c.ruolo,c.telefono,c.email,c.competenze,c.note,...contactStoreNames(c.id)].filter(Boolean).join(' ').toLowerCase().includes(q)));if($('contactsCount'))$('contactsCount').textContent=`${list.length} contatt${list.length===1?'o':'i'}`;if(!list.length){root.innerHTML='<div class="card report-empty"><strong>Nessun contatto</strong><p class="muted">Aggiungi responsabili, tecnici, fornitori e riferimenti dei punti vendita.</p></div>';return}for(const c of list){const card=document.createElement('article');card.className='card work-contact-card';const ss=contactStoreNames(c.id);card.innerHTML=`<div class="contact-head"><div><h3>${esc(c.nome)}</h3><p>${esc([c.azienda,c.ruolo].filter(Boolean).join(' · '))}</p></div><span class="client-pill ${esc(c.client_type||'privato')}">${esc(c.client_type?clientLabel(c.client_type):'Contatto')}</span></div>${c.competenze?`<p><strong>Competenze:</strong> ${esc(c.competenze)}</p>`:''}${ss.length?`<p><strong>Sedi:</strong> ${esc(ss.join(' · '))}</p>`:''}<div class="contact-links">${c.telefono?`<a href="tel:${esc(c.telefono)}">📞 ${esc(c.telefono)}</a>`:''}${c.email?`<a href="mailto:${esc(c.email)}">✉️ ${esc(c.email)}</a>`:''}</div>${c.note?`<p class="muted">${esc(c.note)}</p>`:''}${admin()?'<div class="actions"><button class="secondary" data-edit-contact>Modifica</button><button class="danger-btn" data-delete-contact>Elimina</button></div>':''}`;card.querySelector('[data-edit-contact]')?.addEventListener('click',()=>openWorkContactDialog(c));card.querySelector('[data-delete-contact]')?.addEventListener('click',()=>deleteWorkContact(c));root.appendChild(card)}}
function openWorkContactDialog(c=null){if(!admin())return;$('contactForm').reset();$('contactId').value=c?.id||'';$('contactName').value=c?.nome||'';$('contactCompany').value=c?.azienda||'';$('contactRole').value=c?.ruolo||'';$('contactPhone').value=c?.telefono||'';$('contactEmail').value=c?.email||'';$('contactSkills').value=c?.competenze||'';$('contactNotes').value=c?.note||'';$('contactClient').value=c?.client_type||'';$('contactDialogTitle').textContent=c?'Modifica contatto':'Nuovo contatto';const linked=new Set(contactStores.filter(x=>x.contact_id===c?.id).map(x=>x.store_id));$('contactStores').innerHTML=stores.slice().sort((a,b)=>String(a.nome).localeCompare(String(b.nome),'it')).map(st=>`<label><input type="checkbox" value="${st.id}" ${linked.has(st.id)?'checked':''}><span>${esc(st.nome)}<small>${esc([clientLabel(st),st.citta].filter(Boolean).join(' · '))}</small></span></label>`).join('');openDialog('contactDialog')}
async function saveWorkContact(){if(!admin())return;const id=$('contactId').value,payload={nome:$('contactName').value.trim(),azienda:$('contactCompany').value.trim()||null,ruolo:$('contactRole').value.trim()||null,telefono:$('contactPhone').value.trim()||null,email:$('contactEmail').value.trim()||null,competenze:$('contactSkills').value.trim()||null,note:$('contactNotes').value.trim()||null,client_type:$('contactClient').value||null,attivo:true,creato_da:profile.id};if(!payload.nome)return alert('Inserisci il nome del contatto.');let contactId=id;if(id){const r=await sb.from('work_contacts').update(payload).eq('id',id);if(r.error)return alert(r.error.message)}else{const r=await sb.from('work_contacts').insert(payload).select().single();if(r.error){if(String(r.error.message||'').includes('work_contacts'))return alert('Prima esegui MIGRAZIONE-V112-28.sql su Supabase.');return alert(r.error.message)}contactId=r.data.id}let r=await sb.from('contact_stores').delete().eq('contact_id',contactId);if(r.error)return alert(r.error.message);const ids=[...$('contactStores').querySelectorAll('input:checked')].map(x=>x.value);if(ids.length){r=await sb.from('contact_stores').insert(ids.map(store_id=>({contact_id:contactId,store_id})));if(r.error)return alert(r.error.message)}$('contactDialog').close();toast(id?'Contatto aggiornato':'Contatto aggiunto');await loadAll();setView('contacts')}
async function deleteWorkContact(c){if(!admin()||!confirm(`Eliminare ${c.nome} dalla rubrica?`))return;const r=await sb.from('work_contacts').delete().eq('id',c.id);if(r.error)return alert(r.error.message);toast('Contatto eliminato');await loadAll()}
function renderGlobalSearch(){
  const root=$('globalResults'),q=$('globalSearch')?.value.trim().toLowerCase()||'';if(!root)return;root.innerHTML='';if(q.length<2)return;
  const foundStores=stores.filter(s=>`${s.nome} ${s.citta||''} ${s.indirizzo||''}`.toLowerCase().includes(q)).slice(0,6);
  const foundExtras=extras.filter(e=>`${e.titolo} ${e.numero_target||''} ${e.categoria_target||''} ${extraCategoryLabel(e)} ${e.descrizione||''} ${e.nome_esterno||''} ${stores.find(s=>s.id===e.store_id)?.nome||''}`.toLowerCase().includes(q)).slice(0,5);
  const foundProfiles=profiles.filter(p=>p.nome.toLowerCase().includes(q)).slice(0,4);
  const foundContacts=workContacts.filter(c=>[c.nome,c.azienda,c.ruolo,c.competenze].filter(Boolean).join(' ').toLowerCase().includes(q)).slice(0,4);
  for(const st of foundStores){const c=document.createElement('article');c.className='card global-result';c.innerHTML=`<strong>🏪 ${esc(st.nome)}</strong><small class="muted">Punto vendita · ${esc(st.citta||st.indirizzo||'')}</small>`;c.onclick=()=>showStoreDetail(st);root.appendChild(c)}
  for(const e of foundExtras){const c=document.createElement('article');c.className='card global-result';c.innerHTML=`<strong>🧾 ${esc(e.titolo)}</strong><small class="muted">Extra · richiesta ${fmt(extraRequestDate(e))} · ${esc(elapsedDaysLabel(e))} · ${e.giorno_intervento?`esecuzione ${fmt(e.giorno_intervento)}`:'da programmare'}</small>`;c.onclick=()=>openExtraById(e.id);root.appendChild(c)}
  for(const ct of foundContacts){const c=document.createElement('article');c.className='card global-result';c.innerHTML=`<strong>📇 ${esc(ct.nome)}</strong><small class="muted">${esc([ct.azienda,ct.ruolo].filter(Boolean).join(' · ')||'Contatto di lavoro')}</small>`;c.onclick=()=>{setView('contacts');if($('contactsSearch')){$('contactsSearch').value=ct.nome;renderWorkContacts()}};root.appendChild(c)}
  for(const p of foundProfiles){const c=document.createElement('article');c.className='card global-result';c.innerHTML=`<strong>👤 ${esc(p.nome)}</strong><small class="muted">${p.ruolo==='admin'?'Amministratore':'Dipendente'}</small>`;c.onclick=()=>{scheduleWorkerFilter=p.id;$('scheduleWorkerFilter').value=p.id;setView('schedule')};root.appendChild(c)}
  if(!root.children.length)root.innerHTML='<p class="muted">Nessun risultato.</p>';
}
function renderScheduleFilters(){
  const sel=$('scheduleWorkerFilter');if(!sel)return;const current=scheduleWorkerFilter;sel.innerHTML='<option value="all">Tutte le squadre</option>'+profiles.filter(p=>p.attivo).map(p=>`<option value="${p.id}">${esc(p.nome)}</option>`).join('');sel.value=current;
}
function scheduleMatchesDate(s){if(scheduleExactDate)return s.giorno===scheduleExactDate;if(scheduleDateFilter==='all')return true;if(scheduleDateFilter==='today')return s.giorno===today();if(scheduleDateFilter==='tomorrow')return s.giorno===tomorrow();if(scheduleDateFilter==='week'){const now=new Date(today()+'T12:00:00'),end=new Date(now);end.setDate(end.getDate()+7);return new Date(s.giorno+'T12:00:00')>=now&&new Date(s.giorno+'T12:00:00')<=end}return true}
async function storeArchiveFiles(storeId){
  const base=`punti-vendita/${storeId}`;
  const out=[];
  for(const kind of ['planimetria','foto']){
    const {data,error}=await sb.storage.from('documenti').list(`${base}/${kind}`,{limit:100,sortBy:{column:'created_at',order:'desc'}});
    if(error){console.warn('Archivio punto vendita non leggibile:',error.message);continue}
    for(const f of (data||[])){
      if(!f.name||f.name==='.emptyFolderPlaceholder')continue;
      out.push({id:`${kind}:${f.name}`,tipo_archivio:kind,storage_path:`${base}/${kind}/${f.name}`,nome_file:f.name,mime_type:f.metadata?.mimetype||'',dimensione_bytes:f.metadata?.size||0,created_at:f.created_at||f.updated_at||''});
    }
  }
  return out;
}
function archiveKind(a){return a.tipo_archivio||((String(a.storage_path||'').includes('/planimetria/'))?'planimetria':String(a.storage_path||'').includes('/foto/')?'foto':'')}
async function signedAttachmentUrl(a){const {data,error}=await sb.storage.from('documenti').createSignedUrl(a.storage_path,600);if(error)throw error;return data.signedUrl}
async function openArchiveAttachment(a){try{window.open(await signedAttachmentUrl(a),'_blank')}catch(err){alert(err.message)}}
async function deleteArchiveAttachment(a,store){if(!admin()||!confirm(`Eliminare definitivamente “${a.nome_file||'questo file'}”?`))return;const r=await sb.storage.from('documenti').remove([a.storage_path]);if(r.error)return alert(r.error.message);toast('File eliminato');await showStoreDetail(stores.find(x=>x.id===store.id)||store)}
async function uploadStoreArchiveFiles(store,kind,files){
  if(!admin()||!files.length)return;
  const label=kind==='planimetria'?'planimetria':'foto';
  for(const original of files){
    // Qualsiasi immagine viene compressa prima dello Storage, anche se caricata come planimetria.
    let file=original.type?.startsWith('image/')?await compressImage(original):original;
    const safe=(file.name||label).replace(/[^a-zA-Z0-9._-]/g,'-');
    const path=`punti-vendita/${store.id}/${kind}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
    await uploadFile(path,file);
  }
  toast(`${files.length} file caricati`);await showStoreDetail(stores.find(x=>x.id===store.id)||store)
}
async function showStoreDetail(s){
  $('storeDetailTitle').textContent=s.nome;
  $('storeDetailBody').innerHTML='<p class="muted">Caricamento scheda completa…</p>';
  if(!$('storeDetailDialog').open)openDialog('storeDetailDialog');

  const archive=await storeArchiveFiles(s.id);
  const rows=interventions.filter(i=>i.store_id===s.id&&!i.multi_day_open).sort((a,b)=>String(interventionEndDate(b)).localeCompare(String(interventionEndDate(a))));
  const ex=extras.filter(e=>e.store_id===s.id).sort((a,b)=>String(b.giorno_intervento).localeCompare(String(a.giorno_intervento)));
  const plans=archive.filter(a=>archiveKind(a)==='planimetria');
  const manualPhotos=archive.filter(a=>archiveKind(a)==='foto');
  const interventionIds=new Set(rows.map(i=>i.id));
  const extraIds=new Set(ex.map(e=>e.id));
  const linkedAttachments=attachments.filter(a=>(a.intervention_id&&interventionIds.has(a.intervention_id))||(a.extra_id&&extraIds.has(a.extra_id)));
  const interventionPhotos=linkedAttachments.filter(a=>a.intervention_id&&a.tipo==='foto_generica');
  const extraPhotos=linkedAttachments.filter(a=>a.extra_id&&a.tipo==='foto_generica');
  const documents=linkedAttachments.filter(a=>a.tipo!=='foto_generica');
  const allPhotos=[...interventionPhotos,...extraPhotos,...manualPhotos];
  const n=days(s.ultimo_passaggio),lim=storeHasInterval(s)?Number(s.intervallo_giorni):null;
  const state=status(s),stateLabel=!storeHasInterval(s)?'Solo su richiesta':state==='scheduled'?'In programma':state==='ok'?'Regolare':state==='warning'?'In scadenza':'In ritardo';
  const todayDate=today();
  const futureItems=scheduleItems.filter(i=>i.store_id===s.id&&effectiveScheduleState(i)==='da_fare').map(i=>schedules.find(x=>x.id===i.schedule_id)).filter(x=>x&&x.giorno>=todayDate).sort((a,b)=>String(a.giorno).localeCompare(String(b.giorno)));
  const nextDate=futureItems[0]?.giorno||null;

  const workerRows=[];
  for(const i of rows){
    const names=await workerNames(i.id);
    workerRows.push({intervention:i,names});
  }
  const operatorCounts=new Map();
  for(const r of workerRows)for(const name of r.names)operatorCounts.set(name,(operatorCounts.get(name)||0)+1);
  for(const e of ex){
    for(const w of extraWorkers.filter(x=>x.extra_id===e.id)){
      const name=profiles.find(p=>p.id===w.profile_id)?.nome;
      if(name)operatorCounts.set(name,(operatorCounts.get(name)||0)+1);
    }
  }
  const sortedOperators=[...operatorCounts.entries()].sort((a,b)=>b[1]-a[1]);

  const extraStatus=e=>e.stato==='completato'?'Completato':e.stato==='in_attesa'?'In attesa':e.stato==='rifiutato'?'Rifiutato':'Aperto';
  const attachmentLabel=a=>({pdf_richiesta:'Richiesta extra',rapportino_eurospin:'File Eurospin',rapportino_overgreen:'File Overgreen'}[a.tipo]||a.nome_file||'Documento');

  $('storeDetailBody').innerHTML=`
    <div class="store-sheet-hero">
      <div><span class="store-state ${state}">${stateLabel}</span>${clientBadge(s)}<h3>${esc(s.nome)}</h3><p>${esc([s.indirizzo,s.citta].filter(Boolean).join(', ')||'Indirizzo non inserito')}</p></div>
      <div class="store-detail-actions"><button data-detail-map>Maps</button>${admin()?'<button class="secondary" data-detail-edit>Modifica punto vendita</button>':''}</div>
    </div>
    <div class="store-detail-grid">
      <div class="store-detail-stat"><strong>${n===null?'—':n}</strong><span>giorni dall’ultimo passaggio</span></div>
      <div class="store-detail-stat"><strong>${fmt(s.ultimo_passaggio)}</strong><span>ultimo intervento</span></div>
      <div class="store-detail-stat"><strong>${nextDate?fmt(nextDate):'—'}</strong><span>prossimo intervento</span></div>
      <div class="store-detail-stat"><strong>${rows.length+ex.length}</strong><span>lavori totali registrati</span></div>
    </div>
    <div class="store-sheet-tabs" role="tablist">
      <button class="active" data-sheet-tab="overview">Panoramica</button>
      <button data-sheet-tab="interventions">Interventi <span>${rows.length}</span></button>
      <button data-sheet-tab="extras">Extra <span>${ex.length}</span></button>
      <button data-sheet-tab="photos">Foto <span>${allPhotos.length}</span></button>
      <button data-sheet-tab="documents">Documenti <span>${documents.length+plans.length}</span></button>
      <button data-sheet-tab="operators">Operatori</button>
    </div>
    <section class="store-sheet-panel" data-sheet-panel="overview">
      <h3>Note permanenti</h3><div class="detail-note">${esc(s.note||'Nessuna nota permanente inserita.')}</div>
      <div class="sheet-two-columns">
        <div><h3>Riepilogo attività</h3><div class="sheet-kpi-list"><p><strong>${rows.filter(x=>x.stato==='convalidato').length}</strong><span>interventi convalidati</span></p><p><strong>${ex.filter(x=>x.stato==='completato').length}</strong><span>extra completati</span></p><p><strong>${allPhotos.length}</strong><span>foto archiviate</span></p><p><strong>${documents.length+plans.length}</strong><span>documenti disponibili</span></p></div></div>
        <div><h3>Ultime attività</h3><div class="sheet-mini-list">${[
          ...rows.slice(0,3).map(i=>({date:i.data_intervento,title:'Intervento ordinario',sub:i.note||historyStatusLabel(i.stato)})),
          ...ex.slice(0,3).map(e=>({date:e.giorno_intervento,title:'Extra · '+e.titolo,sub:extraStatus(e)}))
        ].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,5).map(x=>`<p><strong>${fmt(x.date)} · ${esc(x.title)}</strong><span>${esc(x.sub)}</span></p>`).join('')||'<p class="muted">Nessuna attività registrata.</p>'}</div></div>
      </div>
    </section>
    <section class="store-sheet-panel hidden" data-sheet-panel="interventions">
      <div class="sheet-section-head"><h3>Storico interventi</h3><button class="secondary" data-open-full-history>Apri storico modificabile</button></div>
      <div class="sheet-timeline">${workerRows.map(({intervention:i,names})=>{const pics=interventionPhotos.filter(a=>a.intervention_id===i.id);return `<article class="sheet-record"><div><strong>${fmt(i.data_intervento)}</strong><span class="badge-state">${esc(historyStatusLabel(i.stato))}</span></div><p>${esc(i.note||'Nessuna nota')}</p><small>${names.length?'👤 '+names.map(esc).join(' · '):'Operatori non indicati'}${pics.length?` · 📷 ${pics.length} foto`:''}</small></article>`}).join('')||'<p class="muted">Nessun intervento registrato.</p>'}</div>
    </section>
    <section class="store-sheet-panel hidden" data-sheet-panel="extras">
      <h3>Extra del punto vendita</h3>
      <div class="sheet-timeline">${ex.map(e=>{const names=extraWorkers.filter(w=>w.extra_id===e.id).map(w=>profiles.find(p=>p.id===w.profile_id)?.nome).filter(Boolean),pics=extraPhotos.filter(a=>a.extra_id===e.id);return `<article class="sheet-record"><div><strong>${fmt(e.giorno_intervento)} · ${esc(e.titolo)}</strong><span class="badge-state">${extraStatus(e)}</span></div><p>${esc(e.note_lorenzo||e.descrizione||'Nessuna nota')}</p><small>${names.length?'👤 '+names.map(esc).join(' · '):'Operatori non indicati'}${pics.length?` · 📷 ${pics.length} foto`:''}</small><button class="secondary compact-btn" data-open-extra-id="${e.id}">Apri extra</button></article>`}).join('')||'<p class="muted">Nessun extra collegato.</p>'}</div>
    </section>
    <section class="store-sheet-panel hidden" data-sheet-panel="photos">
      <div class="sheet-section-head"><h3>Archivio fotografico</h3>${admin()?'<label class="file-label small"><span>＋ Aggiungi foto</span><input data-upload-photo type="file" accept="image/*" multiple></label>':''}</div>
      <div class="sheet-photo-gallery" data-all-photos>${allPhotos.length?'<p class="muted">Caricamento anteprime…</p>':'<p class="muted">Nessuna foto disponibile.</p>'}</div>
    </section>
    <section class="store-sheet-panel hidden" data-sheet-panel="documents">
      <div class="sheet-section-head"><h3>Archivio documenti</h3>${admin()?'<label class="file-label small"><span>＋ Planimetria</span><input data-upload-plan type="file" accept="application/pdf,image/*"></label>':''}</div>
      <div class="sheet-doc-list" data-doc-list>${documents.length||plans.length?'':'<p class="muted">Nessun documento disponibile.</p>'}</div>
    </section>
    <section class="store-sheet-panel hidden" data-sheet-panel="operators">
      <h3>Operatori intervenuti</h3>
      <div class="operator-ranking">${sortedOperators.map(([name,count])=>`<div><span>👤 ${esc(name)}</span><strong>${count} ${count===1?'lavoro':'lavori'}</strong></div>`).join('')||'<p class="muted">Nessun operatore registrato.</p>'}</div>
    </section>`;

  const body=$('storeDetailBody');
  body.querySelector('[data-detail-map]').onclick=()=>openGoogleMaps(s.indirizzo,clientLabel(s)+' '+s.nome,s.citta);
  body.querySelector('[data-detail-edit]')?.addEventListener('click',()=>openStore(s));
  body.querySelector('[data-open-full-history]')?.addEventListener('click',()=>showHistory(s));
  body.querySelectorAll('[data-sheet-tab]').forEach(btn=>btn.onclick=()=>{body.querySelectorAll('[data-sheet-tab]').forEach(x=>x.classList.toggle('active',x===btn));body.querySelectorAll('[data-sheet-panel]').forEach(x=>x.classList.toggle('hidden',x.dataset.sheetPanel!==btn.dataset.sheetTab))});
  body.querySelectorAll('[data-open-extra-id]').forEach(btn=>btn.onclick=()=>{const e=extras.find(x=>x.id===btn.dataset.openExtraId);if(e){$('storeDetailDialog').close();openExtraById(e.id)}});
  body.querySelector('[data-upload-plan]')?.addEventListener('change',e=>uploadStoreArchiveFiles(s,'planimetria',[...e.target.files]).catch(err=>alert(err.message)));
  body.querySelector('[data-upload-photo]')?.addEventListener('change',e=>uploadStoreArchiveFiles(s,'foto',[...e.target.files]).catch(err=>alert(err.message)));

  const photoBox=body.querySelector('[data-all-photos]');
  if(allPhotos.length){photoBox.innerHTML='';for(const a of allPhotos){const card=document.createElement('button');card.type='button';card.className='sheet-photo-card';const source=a.intervention_id?'Intervento':a.extra_id?'Extra':'Archivio';card.innerHTML=`<span class="sheet-photo-placeholder">📷</span><small>${source}${a.created_at?' · '+new Date(a.created_at).toLocaleDateString('it-IT'):''}</small>`;photoBox.appendChild(card);signedAttachmentUrl(a).then(url=>{card.innerHTML=`<img src="${url}" alt="${esc(a.nome_file||'Foto')}" loading="lazy"><small>${source}${a.created_at?' · '+new Date(a.created_at).toLocaleDateString('it-IT'):''}</small>`;card.onclick=()=>window.open(url,'_blank')}).catch(()=>{card.onclick=()=>openArchiveAttachment(a)})}}

  const docBox=body.querySelector('[data-doc-list]');
  for(const a of [...plans,...documents]){const row=document.createElement('div');row.className='sheet-document';row.innerHTML=`<button class="secondary" data-open>📄 <span>${esc(attachmentLabel(a))}</span><small>${esc(a.nome_file||'Documento')}</small></button>${admin()&&archiveKind(a)?'<button class="danger-btn compact-btn" data-delete>Elimina</button>':''}`;row.querySelector('[data-open]').onclick=()=>archiveKind(a)?openArchiveAttachment(a):openAttachment(a);row.querySelector('[data-delete]')?.addEventListener('click',()=>deleteArchiveAttachment(a,s));docBox.appendChild(row)}
}

function openDuplicateSchedule(s){openReuseScheduleDialog({type:'schedule',id:s.id,onlyOpen:true})}

function openGoogleMaps(address,name='',city=''){
  const parts=[address,city].map(v=>String(v||'').trim()).filter(Boolean);
  const destination=parts.length?parts.join(', '):String(name||'').trim();
  const query=encodeURIComponent(destination);
  // Il link universale apre Google Maps se installato, altrimenti la versione web.
  window.location.href=`https://www.google.com/maps/search/?api=1&query=${query}`;
}

function extraMapsDestination(e,st=null){
  if(st){
    return [st.indirizzo,st.citta].map(v=>String(v||'').trim()).filter(Boolean).join(', ')||[clientLabel(st),st.nome].filter(Boolean).join(' ');
  }
  // Per una sede non in anagrafica usiamo anche il nome del luogo: un indirizzo
  // senza città (es. solo via/corso) da solo può portare Maps nel comune sbagliato.
  return [e?.nome_esterno,e?.indirizzo_esterno].map(v=>String(v||'').trim()).filter(Boolean).join(', ')||String(e?.titolo||'').trim();
}
function openExtraMaps(e,st=null){
  const destination=extraMapsDestination(e,st);
  if(!destination)return alert('Per aprire Maps inserisci un indirizzo o il nome del luogo nell’extra.');
  window.location.href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

function storeMapsShareUrl(s){
  const destination=[s?.indirizzo,s?.citta].map(v=>String(v||'').trim()).filter(Boolean).join(', ')||`${clientLabel(s)} ${s?.nome||''}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}
function storeSiteTypeLabel(s){
  const type=String(s?.site_type||'punto_vendita');
  return type==='filiale'?'Filiale':type==='punto_vendita'?'Punto vendita':type==='atm'?'ATM':type.replaceAll('_',' ');
}
function buildStoreShareText(s){
  const lines=[
    `📍 ${clientLabel(s)} · ${storeSiteTypeLabel(s)}`,
    `🏪 ${s?.nome||'Sede'}`
  ];
  const address=[s?.indirizzo,s?.citta].filter(Boolean).join(', ');
  if(address)lines.push(`Indirizzo: ${address}`);
  if(String(s?.note||'').trim())lines.push('',`📝 Note: ${String(s.note).trim()}`);
  if(String(s?.next_visit_note||'').trim())lines.push('',`⚠️ Da fare al prossimo passaggio: ${String(s.next_visit_note).trim()}`);
  const openExtras=extras.filter(e=>e.store_id===s?.id&&!extraIsDone(e));
  if(openExtras.length){
    lines.push('','🔧 Extra aperti:');
    for(const e of openExtras){
      let row=`• ${extraCategoryLabel(e)} · ${e.titolo||'Extra'}`;
      if(e.numero_target)row+=` · Target ${e.numero_target}`;
      lines.push(row);
      if(String(e.descrizione||'').trim())lines.push(`  ${String(e.descrizione).trim()}`);
    }
  }
  lines.push('',`🗺 Maps: ${storeMapsShareUrl(s)}`);
  return lines.join('\n');
}
async function shareStoreExternally(s){
  if(!admin())return;
  const text=buildStoreShareText(s),title=`${clientLabel(s)} · ${s?.nome||'Sede'}`;
  // Se sulla sede c'è un ticket Intesa incluso in un ordinario, condividiamo
  // anche il PDF originale del ticket come allegato (oltre al testo/Maps).
  const ticketExtras=extras.filter(e=>e.store_id===s?.id&&isOrdinaryIncludedExtra(e)&&!extraIsDone(e));
  const ticketAttachments=ticketExtras
    .map(e=>attachments.find(a=>a.extra_id===e.id&&a.tipo==='pdf_richiesta'))
    .filter(Boolean);
  const files=[];
  for(const a of ticketAttachments){
    try{
      const url=await signedAttachmentUrl(a),res=await fetch(url);
      if(!res.ok)throw new Error('Download PDF ticket non riuscito');
      const blob=await res.blob();
      files.push(new File([blob],a.nome_file||'Istruzioni intervento.pdf',{type:a.mime_type||blob.type||'application/pdf'}));
    }catch(err){console.warn('PDF ticket non allegato',err)}
  }
  try{
    const payload={title,text};
    if(files.length&&navigator.canShare?.({files}))payload.files=files;
    if(navigator.share){await navigator.share(payload);return;}
    await navigator.clipboard.writeText(text);toast(files.length?'Dati copiati · il browser non supporta allegati':'Dati sede copiati');
  }catch(err){
    if(err?.name==='AbortError')return;
    try{await navigator.clipboard.writeText(text);toast('Dati sede copiati')}catch{alert(text)}
  }
}

const shareAttachmentFileCache=new Map();
const shareAttachmentPending=new Map();

function shareAttachmentKey(a){return a?.id||a?.storage_path||''}

async function preloadShareAttachment(a){
  if(!a)return null;
  const key=shareAttachmentKey(a);
  if(shareAttachmentFileCache.has(key))return shareAttachmentFileCache.get(key);
  if(shareAttachmentPending.has(key))return shareAttachmentPending.get(key);
  const pending=(async()=>{
    const url=await signedAttachmentUrl(a);
    const res=await fetch(url);
    if(!res.ok)throw new Error('Download PDF non riuscito');
    const blob=await res.blob();
    const file=new File(
      [blob],
      a.nome_file||'Richiesta extra.pdf',
      {type:a.mime_type||blob.type||'application/pdf'}
    );
    shareAttachmentFileCache.set(key,file);
    shareAttachmentPending.delete(key);
    return file;
  })().catch(err=>{
    shareAttachmentPending.delete(key);
    throw err;
  });
  shareAttachmentPending.set(key,pending);
  return pending;
}

function linkedRequestAttachments(linked){
  return (linked||[])
    .map(e=>attachments.find(a=>a.extra_id===e.id&&a.tipo==='pdf_richiesta'))
    .filter(Boolean);
}

function prepareOrdinaryShareButton(button,linked){
  if(!button)return;
  const pdfs=linkedRequestAttachments(linked);
  if(!pdfs.length){
    button.disabled=false;
    button.textContent='Condividi';
    button.dataset.shareReady='1';
    button.dataset.shareMode='share';
    return;
  }
  const allReady=pdfs.every(a=>shareAttachmentFileCache.has(shareAttachmentKey(a)));
  button.disabled=false;
  if(allReady){
    button.textContent='Condividi';
    button.dataset.shareReady='1';
    button.dataset.shareMode='share';
  }else{
    button.textContent='Prepara condivisione';
    button.dataset.shareReady='0';
    button.dataset.shareMode='prepare';
  }
}

function buildOrdinaryShareText(s,scheduleItemId){
  const linked=scheduleItemId?linkedExtrasForScheduleItem(scheduleItemId):[];
  const lines=[buildStoreShareText(s)];
  if(linked.length){
    lines.push('','🔗 Extra collegati a questo intervento:');
    for(const e of linked){
      lines.push(`• ${e.titolo||'Extra'}${e.numero_target?` · Target ${e.numero_target}`:''}`);
      if(String(e.descrizione||'').trim())lines.push(`  ${String(e.descrizione).trim()}`);
    }
  }
  return lines.join('\n');
}

async function prepareOrdinaryShare(button,s,scheduleItemId,linked){
  const pdfs=linkedRequestAttachments(linked);
  if(!pdfs.length){
    prepareOrdinaryShareButton(button,linked);
    return true;
  }
  button.disabled=true;
  button.textContent='Scarico PDF…';
  try{
    await Promise.all(pdfs.map(preloadShareAttachment));
    const ready=pdfs.every(a=>shareAttachmentFileCache.has(shareAttachmentKey(a)));
    if(!ready)throw new Error('Uno o più PDF non sono stati scaricati');
    button.disabled=false;
    button.textContent='Condividi';
    button.dataset.shareReady='1';
    button.dataset.shareMode='share';
    toast(pdfs.length===1?'Condivisione pronta':`${pdfs.length} PDF pronti da condividere`);
    return true;
  }catch(err){
    button.disabled=false;
    button.textContent='Riprova preparazione';
    button.dataset.shareReady='0';
    button.dataset.shareMode='prepare';
    alert('Impossibile preparare la condivisione: '+(err?.message||String(err)));
    return false;
  }
}

function shareOrdinaryExternally(s,scheduleItemId){
  if(!admin())return;
  const linked=scheduleItemId?linkedExtrasForScheduleItem(scheduleItemId):[];
  const text=buildOrdinaryShareText(s,scheduleItemId);
  const title=`${clientLabel(s)} · ${s?.nome||'Sede'}`;
  const pdfs=linkedRequestAttachments(linked);
  const files=pdfs.map(a=>shareAttachmentFileCache.get(shareAttachmentKey(a))).filter(Boolean);

  if(pdfs.length&&files.length!==pdfs.length){
    toast('Prima premi Prepara condivisione');
    return;
  }

  try{
    if(navigator.share){
      if(files.length){
        if(navigator.canShare&&!navigator.canShare({files})){
          alert('Questo dispositivo non consente la condivisione diretta del PDF.');
          return;
        }
        // Il PDF è già in memoria: nessun await prima della share.
        // Inviamo nello STESSO foglio di condivisione il messaggio scritto + il ticket.
        const promise=navigator.share({title,text,files});
        promise?.catch(err=>{
          if(err?.name!=='AbortError'){
            console.error('Condivisione testo + PDF non riuscita',err);
            alert('Condivisione non riuscita: '+(err?.message||String(err)));
          }
        });
        return;
      }
      const promise=navigator.share({title,text});
      promise?.catch(err=>{
        if(err?.name!=='AbortError')alert('Condivisione non riuscita: '+(err?.message||String(err)));
      });
      return;
    }
    navigator.clipboard?.writeText(text).then(()=>toast('Dati intervento copiati')).catch(()=>alert(text));
  }catch(err){
    if(err?.name==='AbortError')return;
    alert('Condivisione non riuscita: '+(err?.message||String(err)));
  }
}


function renderShareStorePicker(){
  if(!admin())return;
  const box=$('shareStoreList');if(!box)return;
  const q=($('shareStoreSearch')?.value||'').trim().toLowerCase();
  const list=[...stores].filter(s=>`${clientLabel(s)} ${s.site_type||''} ${s.nome||''} ${s.indirizzo||''} ${s.citta||''}`.toLowerCase().includes(q)).sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'it'));
  box.innerHTML='';
  if(!list.length){box.innerHTML='<p class="muted">Nessuna sede trovata.</p>';return;}
  for(const s of list){
    const row=document.createElement('article');row.className='card';
    row.innerHTML=`<div class="card-top"><div>${clientBadge(s)}<h3>${esc(s.nome||'Sede')}</h3><p class="muted">${esc([s.indirizzo,s.citta].filter(Boolean).join(', '))}</p></div></div><div class="actions"><button class="secondary" data-map>Maps</button><button data-share>📤 Condividi</button></div>`;
    row.querySelector('[data-map]').onclick=()=>openGoogleMaps(s.indirizzo,clientLabel(s)+' '+(s.nome||''),s.citta);
    row.querySelector('[data-share]').onclick=()=>shareStoreExternally(s);
    box.appendChild(row);
  }
}
function openShareStorePicker(){
  if(!admin())return;
  if($('shareStoreSearch'))$('shareStoreSearch').value='';
  renderShareStorePicker();
  openDialog('shareStoreDialog');
}
// Alias mantenuto per compatibilità con eventuali richiami meno recenti.
const openAppleMaps=openGoogleMaps;

const travelCacheKey='overgreen-travel-cache-v1';
let travelRenderToken=0;
let scheduleTravelRenderToken=0;
function readTravelCache(){try{return JSON.parse(localStorage.getItem(travelCacheKey)||'{}')}catch{return {}}}
function writeTravelCache(cache){try{localStorage.setItem(travelCacheKey,JSON.stringify(cache))}catch{}}
function normalizedRouteAddress(address){return String(address||'').replace(/\s+/g,' ').trim()}
function routeStoreForAddress(address){
  const key=normalizedRouteAddress(address).toLowerCase();
  return stores.find(st=>normalizedRouteAddress(routeAddressForStore(st)).toLowerCase()===key)||null;
}
function storedRoutePoint(address){
  const st=routeStoreForAddress(address),rawLat=st?.route_latitude,rawLon=st?.route_longitude,lat=Number(rawLat),lon=Number(rawLon);
  return st&&rawLat!==null&&rawLat!==undefined&&rawLon!==null&&rawLon!==undefined&&Number.isFinite(lat)&&Number.isFinite(lon)?{lat,lon,source:'saved-store',resolvedAddress:st.route_geocode_label||routeAddressForStore(st),approximate:false}:null;
}
async function persistRoutePoint(address,value){
  const st=routeStoreForAddress(address);if(!st||!Number.isFinite(value?.lat)||!Number.isFinite(value?.lon))return;
  st.route_latitude=value.lat;st.route_longitude=value.lon;st.route_geocoded_at=new Date().toISOString();st.route_geocode_label=value.resolvedAddress||normalizedRouteAddress(address);
  try{
    const {error}=await sb.from('stores').update({route_latitude:value.lat,route_longitude:value.lon,route_geocoded_at:st.route_geocoded_at,route_geocode_label:st.route_geocode_label}).eq('id',st.id);
    if(error)console.warn('Coordinate sede non salvate (migrazione v112-16 mancante o permessi insufficienti):',error.message);
  }catch(e){console.warn('Coordinate sede non salvate:',e)}
}
function routeAddressParts(address){
  const parts=normalizedRouteAddress(address).split(',').map(x=>x.trim()).filter(Boolean);
  return {street:parts[0]||'',city:parts[1]||'',country:parts.slice(2).join(', ')||'Italia'};
}
function routeStreetWithoutNumber(street){return String(street||'').replace(/\s+\d+[a-zA-Z]?(?:[\/-]\d+[a-zA-Z]?)?\s*$/,'').trim()}
function nominatimLabel(row){return row?.display_name||[row?.name,row?.type].filter(Boolean).join(' ')||''}
async function nominatimGeocode(query){
  const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&addressdetails=1&countrycodes=it&q='+encodeURIComponent(query);
  let r;try{r=await fetch(url,{headers:{'Accept':'application/json'}})}catch(e){throw new Error('Errore di connessione durante la ricerca indirizzo')}
  if(!r.ok)throw new Error(`Servizio indirizzi non disponibile (HTTP ${r.status})`);
  const rows=await r.json();if(!rows?.length)return null;
  const row=rows[0],lat=Number(row.lat),lon=Number(row.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
  return {lat,lon,source:'Nominatim',resolvedAddress:nominatimLabel(row)};
}
async function photonGeocode(query){
  const url='https://photon.komoot.io/api/?limit=5&lang=it&q='+encodeURIComponent(query);
  let r;try{r=await fetch(url,{headers:{'Accept':'application/json'}})}catch(e){return null}
  if(!r.ok)return null;
  const data=await r.json(),features=(data?.features||[]).filter(f=>String(f?.properties?.countrycode||'').toLowerCase()==='it'||String(f?.properties?.country||'').toLowerCase()==='italia');
  const f=features[0]||data?.features?.[0];if(!f?.geometry?.coordinates)return null;
  const [lon,lat]=f.geometry.coordinates.map(Number);if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
  const p=f.properties||{},label=[p.name,p.street,p.housenumber,p.city||p.locality,p.state,'Italia'].filter((v,i,a)=>v&&a.indexOf(v)===i).join(', ');
  return {lat,lon,source:'Photon',resolvedAddress:label||query,properties:p};
}
async function correctedRouteCity(city){
  if(!city)return '';
  const hit=await photonGeocode(city+', Italia');if(!hit)return '';
  const p=hit.properties||{};return p.city||p.locality||p.name||'';
}
function storeLookupAddressFromNominatim(row){
  const a=row?.address||{};
  const road=a.road||a.pedestrian||a.footway||a.residential||a.neighbourhood||'';
  const number=a.house_number||'';
  const city=a.city||a.town||a.village||a.municipality||a.hamlet||'';
  const street=[road,number].filter(Boolean).join(' ').trim();
  return {street,city,label:nominatimLabel(row)};
}
async function nominatimStoreLookup(query){
  const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&countrycodes=it&q='+encodeURIComponent(query);
  let r;try{r=await fetch(url,{headers:{'Accept':'application/json'}})}catch(e){throw new Error('Connessione non disponibile')}
  if(!r.ok)throw new Error(`Servizio indirizzi non disponibile (HTTP ${r.status})`);
  const rows=await r.json();
  for(const row of rows||[]){
    const lat=Number(row.lat),lon=Number(row.lon),parts=storeLookupAddressFromNominatim(row);
    if(Number.isFinite(lat)&&Number.isFinite(lon)&&(parts.street||parts.city))return {lat,lon,...parts,source:'Nominatim'};
  }
  return null;
}
function storeLookupAddressFromPhoton(hit){
  const p=hit?.properties||{};
  const street=[p.street||'',p.housenumber||''].filter(Boolean).join(' ').trim();
  const city=p.city||p.locality||p.district||p.county||'';
  const label=[p.name,p.street,p.housenumber,city,p.state,'Italia'].filter((v,i,a)=>v&&a.indexOf(v)===i).join(', ');
  return {street,city,label};
}
async function photonStoreLookup(query){
  const url='https://photon.komoot.io/api/?limit=8&lang=it&q='+encodeURIComponent(query);
  let r;try{r=await fetch(url,{headers:{'Accept':'application/json'}})}catch(e){return null}
  if(!r.ok)return null;
  const data=await r.json();
  for(const f of data?.features||[]){
    const [lon,lat]=(f?.geometry?.coordinates||[]).map(Number);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;
    const parts=storeLookupAddressFromPhoton(f);if(parts.street||parts.city)return {lat,lon,...parts,source:'Photon'};
  }
  return null;
}
async function lookupStoreAddressOnline(){
  const btn=$('storeAddressLookupBtn'),status=$('storeAddressLookupStatus');
  const name=$('storeName').value.trim(),address=$('storeAddress').value.trim(),city=$('storeCity').value.trim();
  const client=({eurospin:'Eurospin',intesa:'Intesa Sanpaolo',privato:''})[$('storeClient').value]||'';
  if(!name&&!address&&!city)return alert('Inserisci almeno il nome della sede, la città o una parte dell’indirizzo.');
  const old=btn.textContent;btn.disabled=true;btn.textContent='Ricerca…';
  if(status){status.textContent='Sto cercando la sede online…';status.classList.remove('hidden')}
  try{
    const queries=[];
    const add=q=>{q=String(q||'').replace(/\s+/g,' ').trim();if(q&&!queries.includes(q))queries.push(q)};
    add([client,name,address,city,'Italia'].filter(Boolean).join(', '));
    add([client,name,city,'Italia'].filter(Boolean).join(', '));
    add([name,address,'Italia'].filter(Boolean).join(', '));
    add([address,city,'Italia'].filter(Boolean).join(', '));
    add([name,city,'Italia'].filter(Boolean).join(', '));
    let hit=null,used='';
    for(const q of queries){
      used=q;
      try{hit=await nominatimStoreLookup(q)}catch(e){if(String(e?.message||'').includes('Servizio indirizzi'))throw e}
      if(!hit)hit=await photonStoreLookup(q);
      if(hit)break;
    }
    if(!hit)throw new Error('Nessun indirizzo affidabile trovato online. Prova a scrivere almeno il nome della sede e la provincia/città.');
    if(hit.street)$('storeAddress').value=hit.street;
    if(hit.city)$('storeCity').value=hit.city;
    $('storeAddress').dataset.lookupLat=String(hit.lat);$('storeAddress').dataset.lookupLon=String(hit.lon);$('storeAddress').dataset.lookupLabel=hit.label||[hit.street,hit.city,'Italia'].filter(Boolean).join(', ');
    if(status){status.textContent=`✓ Trovato con ${hit.source}: ${hit.label||[hit.street,hit.city].filter(Boolean).join(', ')}`;status.classList.remove('hidden')}
    toast('Indirizzo trovato e compilato');
  }catch(err){
    if(status){status.textContent='⚠️ '+(err?.message||String(err));status.classList.remove('hidden')}
    alert(err?.message||String(err));
  }finally{btn.disabled=false;btn.textContent=old}
}
async function geocodeRouteAddress(address){
  const normalized=normalizedRouteAddress(address),key='geo2:'+normalized.toLowerCase(),cache=readTravelCache();
  const saved=storedRoutePoint(normalized);if(saved)return saved;
  if(cache[key]&&Date.now()-cache[key].savedAt<1000*60*60*24*180)return cache[key].value;
  const {street,city}=routeAddressParts(normalized),attempts=[];
  const push=async(label,fn,approximate=false)=>{try{const hit=await fn();attempts.push(label+(hit?' ✓':' ✗'));if(hit)return {...hit,approximate}}catch(e){attempts.push(label+' → '+(e?.message||String(e)));if(String(e?.message||'').includes('Servizio indirizzi')||String(e?.message||'').includes('connessione'))throw e}return null};
  let value=await push('Nominatim indirizzo completo',()=>nominatimGeocode(normalized));
  if(!value)value=await push('Photon indirizzo completo',()=>photonGeocode(normalized));
  if(!value&&street&&city){
    const corrected=await correctedRouteCity(city);
    if(corrected&&corrected.toLowerCase()!==city.toLowerCase()){
      const correctedQuery=[street,corrected,'Italia'].join(', ');
      value=await push(`Località corretta automaticamente: ${city} → ${corrected}`,()=>nominatimGeocode(correctedQuery));
      if(!value)value=await push(`Photon con località corretta: ${corrected}`,()=>photonGeocode(correctedQuery));
    }
  }
  if(!value&&street&&city){
    const streetOnly=routeStreetWithoutNumber(street);
    if(streetOnly&&streetOnly!==street){
      const q=[streetOnly,city,'Italia'].join(', ');
      value=await push('Via senza numero civico',()=>nominatimGeocode(q),true);
      if(!value)value=await push('Photon via senza numero civico',()=>photonGeocode(q),true);
    }
  }
  if(!value)throw new Error(`Indirizzo non trovato: ${normalized}\nTentativi: ${attempts.join(' | ')}`);
  value.originalAddress=normalized;
  cache[key]={savedAt:Date.now(),value};writeTravelCache(cache);persistRoutePoint(normalized,value);
  return value;
}
async function routeBetweenAddresses(from,to){
  const a=normalizedRouteAddress(from),b=normalizedRouteAddress(to),key='route2:'+a.toLowerCase()+'>'+b.toLowerCase(),cache=readTravelCache();
  if(cache[key]&&Date.now()-cache[key].savedAt<1000*60*60*24*30)return cache[key].value;
  const [p1,p2]=await Promise.all([geocodeRouteAddress(a),geocodeRouteAddress(b)]);
  const url=`https://router.project-osrm.org/route/v1/driving/${p1.lon},${p1.lat};${p2.lon},${p2.lat}?overview=false&steps=false`;
  let r;try{r=await fetch(url)}catch(e){throw new Error('Errore di connessione durante il calcolo percorso')}
  if(!r.ok)throw new Error(`Servizio percorsi non disponibile (HTTP ${r.status})`);const data=await r.json();
  const route=data.routes?.[0];if(!route)throw new Error('Percorso stradale non trovato');
  const value={km:route.distance/1000,minutes:Math.max(1,Math.round(route.duration/60)),approximate:!!(p1.approximate||p2.approximate),fromResolved:p1.resolvedAddress||a,toResolved:p2.resolvedAddress||b};cache[key]={savedAt:Date.now(),value};writeTravelCache(cache);return value;
}
function routeAddressForStore(st){return [st?.indirizzo,st?.citta,'Italia'].filter(Boolean).join(', ')}
function routeAddressForExtra(e,st){return [st?.indirizzo||e?.indirizzo_esterno,st?.citta,'Italia'].filter(Boolean).join(', ')}
function formatTravelMinutes(minutes){const h=Math.floor(minutes/60),m=minutes%60;return h?`${h} h${m?' '+m+' min':''}`:`${m} min`}

function travelErrorLabel(err){
  const m=String(err?.message||err||'Errore sconosciuto');
  if(m.includes('Indirizzo non trovato'))return '⚠️ Indirizzo non trovato';
  if(m.includes('Servizio indirizzi'))return '⚠️ Servizio indirizzi non disponibile';
  if(m.includes('Percorso stradale'))return '⚠️ Percorso stradale non trovato';
  if(m.includes('Servizio percorsi'))return '⚠️ Servizio percorsi non disponibile';
  if(m.includes('connessione'))return '⚠️ Errore di connessione';
  return '⚠️ Viaggio non calcolabile';
}
function renderTravelError(separator,err,from,to){
  const technical=String(err?.message||err||'Errore sconosciuto');
  separator.innerHTML=`<span>↓</span><div><small>${esc(travelErrorLabel(err))}</small><button type="button" class="travel-error-details">Dettagli</button></div>`;
  separator.querySelector('.travel-error-details')?.addEventListener('click',()=>alert(`Dettagli calcolo viaggio\n\nDa:\n${from||'Indirizzo mancante'}\n\nA:\n${to||'Indirizzo mancante'}\n\nErrore:\n${technical}`));
}

async function hydrateScheduleTravel(section,token){
  const cards=[...section.querySelectorAll('.schedule-item[data-route-address]')];if(cards.length<2)return;
  const summary=document.createElement('div');summary.className='worker-travel-summary schedule-travel-summary';summary.innerHTML='<strong>🚗 Percorso</strong><span>Calcolo in corso…</span>';
  section.querySelector('.schedule-card-head')?.after(summary);
  let totalKm=0,totalMinutes=0,okCount=0;
  for(let i=0;i<cards.length-1;i++){
    if(token!==scheduleTravelRenderToken)return;
    const separator=document.createElement('div');separator.className='dashboard-travel-leg schedule-travel-leg';separator.innerHTML='<span>↓</span><strong>Calcolo viaggio…</strong>';
    cards[i].after(separator);
    try{
      const route=await routeBetweenAddresses(cards[i].dataset.routeAddress,cards[i+1].dataset.routeAddress);
      if(token!==scheduleTravelRenderToken)return;
      totalKm+=route.km;totalMinutes+=route.minutes;okCount++;
      separator.innerHTML=`<span>↓</span><strong>${route.approximate?'≈ ':''}🚗 ${formatTravelMinutes(route.minutes)} · ${route.km.toFixed(route.km<10?1:0)} km${route.approximate?' · posizione approssimativa':''}</strong>`;
    }catch(err){renderTravelError(separator,err,cards[i].dataset.routeAddress,cards[i+1].dataset.routeAddress)}
  }
  if(token!==scheduleTravelRenderToken)return;
  summary.querySelector('span').textContent=okCount?`${totalKm.toFixed(totalKm<10?1:0)} km · ${formatTravelMinutes(totalMinutes)} di guida`:'Dati di viaggio non disponibili';
}
async function hydrateWorkerTravel(section,token){
  const cards=[...section.querySelectorAll('.dashboard-line-job[data-route-address].is-open')];if(cards.length<2)return;
  const summary=document.createElement('div');summary.className='worker-travel-summary';summary.innerHTML='<strong>🚗 Percorso</strong><span>Calcolo in corso…</span>';
  section.querySelector('h3')?.after(summary);
  let totalKm=0,totalMinutes=0,okCount=0;
  for(let i=0;i<cards.length-1;i++){
    if(token!==travelRenderToken)return;
    const separator=document.createElement('div');separator.className='dashboard-travel-leg';separator.innerHTML='<span>↓</span><strong>Calcolo viaggio…</strong>';
    cards[i].after(separator);
    try{
      const route=await routeBetweenAddresses(cards[i].dataset.routeAddress,cards[i+1].dataset.routeAddress);
      if(token!==travelRenderToken)return;
      totalKm+=route.km;totalMinutes+=route.minutes;okCount++;
      separator.innerHTML=`<span>↓</span><strong>${route.approximate?'≈ ':''}🚗 ${formatTravelMinutes(route.minutes)} · ${route.km.toFixed(route.km<10?1:0)} km${route.approximate?' · posizione approssimativa':''}</strong>`;
    }catch(err){renderTravelError(separator,err,cards[i].dataset.routeAddress,cards[i+1].dataset.routeAddress)}
  }
  if(token!==travelRenderToken)return;
  summary.querySelector('span').textContent=okCount?`${totalKm.toFixed(totalKm<10?1:0)} km · ${formatTravelMinutes(totalMinutes)} di guida`:'Dati di viaggio non disponibili';
}

function historyStatusLabel(stato){
  return ({convalidato:'Convalidato',in_attesa:'In attesa',rifiutato:'Rifiutato'})[stato]||stato.replaceAll('_',' ');
}


function reportWorkerNames(kind,id){
  const rows=kind==='ordinary'?interventionWorkers.filter(w=>w.intervention_id===id):extraWorkers.filter(w=>w.extra_id===id);
  return rows.map(w=>profiles.find(p=>p.id===w.profile_id)?.nome).filter(Boolean);
}
function reportMode(){return document.querySelector('[data-report-mode].active')?.dataset.reportMode||'day'}
function setReportMode(mode,rerender=true){
  document.querySelectorAll('[data-report-mode]').forEach(b=>b.classList.toggle('active',b.dataset.reportMode===mode));
  $('reportDayField')?.classList.toggle('hidden',mode!=='day');
  $('reportStartField')?.classList.toggle('hidden',mode!=='range');
  $('reportEndField')?.classList.toggle('hidden',mode!=='range');
  $('reportMonthField')?.classList.toggle('hidden',mode!=='month');
  if(rerender)renderDailyReport();
}
function renderReportFilters(){
  const select=$('reportWorker');if(!select)return;
  const old=select.value||'all';select.innerHTML='<option value="all">Tutti i dipendenti</option>'+profiles.filter(p=>p.attivo).map(p=>`<option value="${p.id}">${esc(p.nome)}</option>`).join('');
  select.value=[...select.options].some(o=>o.value===old)?old:'all';
  const d=today();
  if(!$('reportDate').value)$('reportDate').value=d;
  if(!$('reportStartDate').value)$('reportStartDate').value=d;
  if(!$('reportEndDate').value)$('reportEndDate').value=d;
  if(!$('reportMonth').value)$('reportMonth').value=d.slice(0,7);
  setReportMode(reportMode(),false);
}
function reportPeriod(){
  const mode=reportMode();
  if(mode==='range'){
    let start=$('reportStartDate')?.value||today(),end=$('reportEndDate')?.value||start;
    if(start>end)[start,end]=[end,start];
    return {mode,start,end,label:`dal ${fmt(start)} al ${fmt(end)}`,short:`${fmt(start)}–${fmt(end)}`};
  }
  if(mode==='month'){
    const month=$('reportMonth')?.value||today().slice(0,7),[y,m]=month.split('-').map(Number),endDay=new Date(y,m,0).getDate(),start=`${month}-01`,end=`${month}-${String(endDay).padStart(2,'0')}`;
    const label=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
    return {mode,start,end,label,short:label};
  }
  const date=$('reportDate')?.value||today();return {mode,start:date,end:date,label:fmt(date),short:fmt(date)};
}
function dateInReportPeriod(value,period){return !!value&&value>=period.start&&value<=period.end}

function reportStatusLabel(stato){return ({convalidato:'Convalidato',in_attesa:'In attesa',rifiutato:'Rifiutato',completato:'Completato',programmato:'Programmato'})[stato]||String(stato||'').replaceAll('_',' ')}
function dailyReportData(){
  const period=reportPeriod(),type=$('reportType')?.value||'all',worker=$('reportWorker')?.value||'all';
  let ordinary=interventions.filter(i=>!i.multi_day_open&&dateInReportPeriod(interventionEndDate(i),period));
  let extra=extras.filter(e=>dateInReportPeriod(e.giorno_intervento,period)&&['in_attesa','completato'].includes(e.stato));
  if(worker!=='all'){
    ordinary=ordinary.filter(i=>interventionWorkers.some(w=>w.intervention_id===i.id&&w.profile_id===worker));
    extra=extra.filter(e=>extraWorkers.some(w=>w.extra_id===e.id&&w.profile_id===worker));
  }
  if(type==='ordinary')extra=[];if(type==='extra')ordinary=[];
  ordinary.sort((a,b)=>(a.data_intervento||'').localeCompare(b.data_intervento||''));extra.sort((a,b)=>(a.giorno_intervento||'').localeCompare(b.giorno_intervento||''));
  return {date:period.start,period,ordinary,extra};
}
function buildDailyReportText(data=dailyReportData()){
  const allWorkers=new Set();data.ordinary.forEach(i=>reportWorkerNames('ordinary',i.id).forEach(n=>allWorkers.add(n)));data.extra.forEach(e=>reportWorkerNames('extra',e.id).forEach(n=>allWorkers.add(n)));
  const pending=data.ordinary.filter(i=>i.stato==='in_attesa').length+data.extra.filter(e=>e.stato==='in_attesa').length;
  const validated=data.ordinary.filter(i=>i.stato==='convalidato').length+data.extra.filter(e=>e.stato==='completato').length;
  const lines=[`REPORT OVERGREEN · ${data.period?.label||fmt(data.date)}`,`${data.ordinary.length} interventi ordinari · ${data.extra.length} extra`,`${validated} convalidati/completati · ${pending} in attesa`,`Operatori: ${[...allWorkers].join(', ')||'non indicati'}`];
  if(data.ordinary.length){lines.push('', 'INTERVENTI ORDINARI');data.ordinary.forEach(i=>{const st=stores.find(s=>s.id===i.store_id);lines.push(`• ${st?.nome||'Punto vendita'} — ${reportWorkerNames('ordinary',i.id).join(', ')||'operatore non indicato'} — chiuso ${fmtClosedAt(i.closed_at)} da ${closedByName(i)} — ${reportStatusLabel(i.stato)}`)})}
  if(data.extra.length){lines.push('', 'LAVORI EXTRA');data.extra.forEach(e=>{const st=stores.find(s=>s.id===e.store_id);lines.push(`• ${e.titolo} · ${st?.nome||e.nome_esterno||'Luogo non indicato'} — ${reportWorkerNames('extra',e.id).join(', ')||'operatore non indicato'} — chiuso ${fmtClosedAt(e.closed_at)} da ${closedByName(e)} — ${reportStatusLabel(e.stato)}`)})}
  return lines.join('\n');
}
function printableReportStyles(){return `
  @page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;color:#183126;font-size:11px;line-height:1.4;padding:14mm 14mm 18mm}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #075b31;padding-bottom:10px;margin-bottom:14px}.brand{font-size:25px;font-weight:800;color:#075b31;letter-spacing:.5px}.subtitle{font-size:12px;color:#607268}.date{font-size:17px;font-weight:700;text-align:right}.filters{font-size:10px;color:#607268;text-align:right}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:15px}.kpi{border:1px solid #cfddd5;border-radius:8px;padding:8px;text-align:center}.kpi strong{display:block;font-size:18px;color:#075b31}.kpi span{font-size:9px;text-transform:uppercase;color:#607268}.section-title{font-size:14px;color:#075b31;border-bottom:1px solid #cfddd5;padding-bottom:4px;margin:18px 0 8px}.job{border:1px solid #cfddd5;border-radius:8px;padding:10px;margin:0 0 9px;break-inside:avoid}.job-head{display:flex;justify-content:space-between;gap:10px}.kind{font-size:8px;font-weight:700;color:#607268;letter-spacing:.6px}.job h3{font-size:13px;margin:2px 0}.place,.meta{color:#607268}.status{font-size:9px;font-weight:700;border:1px solid #9eb9aa;border-radius:999px;padding:3px 7px;white-space:nowrap;height:max-content}.notes{margin-top:7px;padding-top:6px;border-top:1px solid #e2ebe6;white-space:pre-wrap}.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}.photos img{width:100%;height:115px;object-fit:cover;border-radius:5px;border:1px solid #dbe5df}.docs{margin-top:7px;font-size:9px;color:#607268}.empty{text-align:center;padding:35px;color:#607268}.footer{position:fixed;bottom:5mm;left:14mm;right:14mm;text-align:center;font-size:8px;color:#829087}.client-report-title{font-size:18px;color:#075b31;margin:0 0 4px}.client-report-client{font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#607268}.client-report-data{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}.client-report-data div{border:1px solid #d8e4dd;border-radius:8px;padding:9px}.client-report-data span{display:block;font-size:8px;text-transform:uppercase;color:#74847b;margin-bottom:3px}.client-report-data strong{font-size:11px}.client-notes{border:1px solid #d8e4dd;border-radius:8px;padding:11px;margin-top:12px;white-space:pre-wrap}.client-photo-title{font-size:12px;color:#075b31;margin:16px 0 6px}@media print{.no-print{display:none!important}}
`}
function reportCounts(data){
  const workerIds=new Set();data.ordinary.forEach(i=>interventionWorkers.filter(w=>w.intervention_id===i.id).forEach(w=>workerIds.add(w.profile_id)));data.extra.forEach(e=>extraWorkers.filter(w=>w.extra_id===e.id).forEach(w=>workerIds.add(w.profile_id)));
  const all=[...data.ordinary,...data.extra],pending=all.filter(x=>x.stato==='in_attesa').length,done=data.ordinary.filter(i=>i.stato==='convalidato').length+data.extra.filter(e=>e.stato==='completato').length;
  const photoCount=attachments.filter(a=>a.tipo==='foto_generica'&&((a.intervention_id&&data.ordinary.some(i=>i.id===a.intervention_id))||(a.extra_id&&data.extra.some(e=>e.id===a.extra_id)))).length;
  return {total:all.length,ordinary:data.ordinary.length,extra:data.extra.length,done,pending,workers:workerIds.size,photos:photoCount};
}
function pdfSafeText(value){
  return String(value??'')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,'')
    .replace(/[–—]/g,'-').replace(/[’‘]/g,"'").replace(/[“”]/g,'"')
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g,' ')
    .replace(/[ \t]+/g,' ').trim();
}
async function compressedPhotoForPdf(url,maxSide=1000,quality=.58){
  const res=await fetch(url);if(!res.ok)throw new Error('Foto non disponibile');
  const blob=await res.blob(),bitmap=await createImageBitmap(blob),scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
  const out=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Compressione foto non riuscita')),'image/jpeg',quality));
  return {bytes:await out.arrayBuffer(),width:canvas.width,height:canvas.height};
}
function drawWrappedPdfText(page,font,text,x,y,maxWidth,size,color,lineHeight=size*1.25){
  const words=pdfSafeText(text).split(/\s+/).filter(Boolean),lines=[];let line='';
  for(const word of words){const test=line?line+' '+word:word;if(font.widthOfTextAtSize(test,size)<=maxWidth)line=test;else{if(line)lines.push(line);line=word}}
  if(line)lines.push(line);for(const l of lines){page.drawText(l,{x,y,size,font,color});y-=lineHeight}return y;
}

function ordinaryIncludedExtrasForReport(intervention){
  if(!intervention)return [];
  const scheduleIds=new Set([
    intervention.schedule_item_id,
    ...(Array.isArray(intervention.schedule_item_ids)?intervention.schedule_item_ids:[])
  ].filter(Boolean));
  if(!scheduleIds.size)return [];
  return extras
    .filter(e=>e.schedule_item_id&&scheduleIds.has(e.schedule_item_id)&&isOrdinaryIncludedExtra(e))
    .sort((a,b)=>String(a.numero_target||'').localeCompare(String(b.numero_target||''),'it',{numeric:true}));
}
function reportLinkedExtraKind(e){
  return clientType(e)==='intesa'?'Ticket Intesa':clientType(e)==='eurospin'?'Target Eurospin':'Extra associato';
}
async function createSingleClientReportFile(kind,row){
  if(!window.PDFLib)throw new Error('Libreria PDF non caricata. Ricarica la pagina e riprova.');
  const {PDFDocument,StandardFonts,rgb}=PDFLib,isOrd=kind==='ordinary',st=stores.find(s=>s.id===row.store_id),names=reportWorkerNames(kind,row.id),pics=attachments.filter(a=>a.tipo==='foto_generica'&&(isOrd?a.intervention_id===row.id:a.extra_id===row.id)),linkedOrdinaryExtras=isOrd?ordinaryIncludedExtrasForReport(row):[];
  const title=isOrd?(st?.nome||'Intervento ordinario'):(row.titolo||'Lavoro extra');
  const place=isOrd?([st?.indirizzo,st?.citta].filter(Boolean).join(', ')):(st?([st.nome,st.indirizzo,st.citta].filter(Boolean).join(', ')):[row.nome_esterno,row.indirizzo_esterno].filter(Boolean).join(', '));
  const date=isOrd?row.data_intervento:row.giorno_intervento,notes=(isOrd?row.note:(row.note_lorenzo||row.descrizione))||'Nessuna nota';
  const pdf=await PDFDocument.create(),regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold),green=rgb(.02,.35,.18),dark=rgb(.08,.18,.13),muted=rgb(.38,.45,.41),border=rgb(.82,.87,.84),pageW=595.28,pageH=841.89,margin=48;
  let page=pdf.addPage([pageW,pageH]),y=pageH-56;
  const newPage=()=>{page=pdf.addPage([pageW,pageH]);y=pageH-55;return page};
  page.drawText('OVERGREEN',{x:margin,y,size:24,font:bold,color:green});page.drawText(pdfSafeText(fmt(date)),{x:pageW-margin-bold.widthOfTextAtSize(pdfSafeText(fmt(date)),14),y:y+4,size:14,font:bold,color:dark});
  page.drawText('Report intervento per il cliente',{x:margin,y:y-20,size:10,font:regular,color:muted});page.drawLine({start:{x:margin,y:y-35},end:{x:pageW-margin,y:y-35},thickness:3,color:green});y-=65;
  page.drawText(pdfSafeText(clientLabel(st||row)).toUpperCase(),{x:margin,y,size:9,font:bold,color:muted});y-=24;
  page.drawText(pdfSafeText(title),{x:margin,y,size:18,font:bold,color:green});y-=18;if(place){y=drawWrappedPdfText(page,regular,place,margin,y,pageW-margin*2,10,muted,13);y-=8}
  const boxes=[['DATA INTERVENTO',fmt(date)],['ORARIO DI CHIUSURA',fmtClosedAt(row.closed_at)],['OPERATORI',names.join(', ')||'Non indicati'],['TIPOLOGIA',isOrd?'Intervento ordinario':'Lavoro extra']];
  const boxW=(pageW-margin*2-10)/2,boxH=52;for(let i=0;i<4;i++){const col=i%2,rowN=Math.floor(i/2),x=margin+col*(boxW+10),by=y-rowN*(boxH+10)-boxH;page.drawRectangle({x,y:by,width:boxW,height:boxH,borderColor:border,borderWidth:1});page.drawText(boxes[i][0],{x:x+10,y:by+34,size:7,font:regular,color:muted});drawWrappedPdfText(page,bold,boxes[i][1],x+10,by+18,boxW-20,10,dark,11)}y-=boxH*2+28;
  const noteLines=Math.max(2,Math.ceil(pdfSafeText(notes).length/75)),noteH=Math.min(110,34+noteLines*13);page.drawRectangle({x:margin,y:y-noteH,width:pageW-margin*2,height:noteH,borderColor:border,borderWidth:1});page.drawText("Note dell'intervento",{x:margin+11,y:y-20,size:10,font:bold,color:dark});drawWrappedPdfText(page,regular,notes,margin+11,y-36,pageW-margin*2-22,10,dark,13);y-=noteH+24;

  if(linkedOrdinaryExtras.length){
    const contentW=pageW-margin*2;
    const rows=linkedOrdinaryExtras.map(e=>{
      const number=e.numero_target?`${clientType(e)==='intesa'?'Ticket':'Target'} ${e.numero_target}`:'Numero non indicato';
      const title=String(e.titolo||'Intervento associato').trim();
      const desc=String(e.descrizione||'').trim();
      const status=e.stato==='completato'?'Eseguito insieme al passaggio ordinario':e.stato==='in_attesa'?'In attesa di convalida':'Associato al passaggio ordinario';
      return {e,number,title,desc,status};
    });
    const estimated=34+rows.reduce((sum,r)=>sum+35+Math.min(30,Math.ceil(pdfSafeText(r.desc).length/75)*12),0);
    if(y-Math.min(estimated,220)<48)newPage();
    page.drawText(linkedOrdinaryExtras.length===1?'Ticket / target associato':'Ticket / target associati',{x:margin,y,size:12,font:bold,color:green});
    y-=17;
    for(const r of rows){
      const descLines=r.desc?Math.min(3,Math.max(1,Math.ceil(pdfSafeText(r.desc).length/78))):0;
      const rowH=46+descLines*12;
      if(y-rowH<48){newPage();page.drawText('Ticket / target associati',{x:margin,y,size:12,font:bold,color:green});y-=17;}
      page.drawRectangle({x:margin,y:y-rowH,width:contentW,height:rowH,borderColor:border,borderWidth:1});
      page.drawText(pdfSafeText(reportLinkedExtraKind(r.e)).toUpperCase(),{x:margin+11,y:y-15,size:7,font:bold,color:muted});
      page.drawText(pdfSafeText(r.number),{x:margin+11,y:y-29,size:10,font:bold,color:dark});
      const titleX=margin+145;
      drawWrappedPdfText(page,bold,r.title,titleX,y-17,contentW-156,10,dark,12);
      page.drawText(pdfSafeText(r.status),{x:titleX,y:y-31,size:8,font:regular,color:muted});
      if(r.desc)drawWrappedPdfText(page,regular,r.desc,margin+11,y-45,contentW-22,9,dark,11);
      y-=rowH+9;
    }
    y-=8;
  }

  if(pics.length){
    page.drawText('Documentazione fotografica',{x:margin,y,size:12,font:bold,color:green});y-=16;
    const urls=await Promise.all(pics.map(async a=>{try{return await signedAttachmentUrl(a)}catch{return ''}}));
    const valid=urls.filter(Boolean),gap=10,contentW=pageW-margin*2;
    if(!valid.length){
      page.drawText('Nessuna documentazione fotografica allegata',{x:margin,y:y-8,size:10,font:regular,color:muted});
    }else{
      // Layout fotografico dinamico:
      // 1 foto = grande e centrata
      // 2 foto = due colonne grandi
      // 3 foto = una grande sopra + due sotto
      // 4 foto = griglia 2x2
      // 5+ foto = griglia 2 colonne, con nuove pagine automatiche.
      const drawPhoto=async(url,x,top,boxW,boxH)=>{
        let photo;try{photo=await compressedPhotoForPdf(url)}catch{return false}
        const img=await pdf.embedJpg(photo.bytes),scale=Math.min(boxW/photo.width,boxH/photo.height),dw=photo.width*scale,dh=photo.height*scale;
        page.drawRectangle({x,y:top-boxH,width:boxW,height:boxH,borderColor:border,borderWidth:.7});
        page.drawImage(img,{x:x+(boxW-dw)/2,y:top-boxH+(boxH-dh)/2,width:dw,height:dh});
        return true;
      };
      const photoHeading=()=>{page.drawText('Documentazione fotografica',{x:margin,y,size:12,font:bold,color:green});y-=16};
      const ensurePhotoSpace=need=>{if(y-need<48){newPage();photoHeading()}};

      if(valid.length===1){
        const availableH=Math.max(180,Math.min(430,y-58)),boxW=contentW*.82,boxH=availableH,x=margin+(contentW-boxW)/2;
        ensurePhotoSpace(boxH);
        await drawPhoto(valid[0],x,y,boxW,boxH);y-=boxH+gap;
      }else if(valid.length===2){
        const boxW=(contentW-gap)/2,boxH=Math.min(300,Math.max(190,y-58));
        ensurePhotoSpace(boxH);
        await drawPhoto(valid[0],margin,y,boxW,boxH);
        await drawPhoto(valid[1],margin+boxW+gap,y,boxW,boxH);y-=boxH+gap;
      }else if(valid.length===3){
        const heroH=Math.min(265,Math.max(180,(y-80)*.52)),heroW=contentW*.78,heroX=margin+(contentW-heroW)/2;
        ensurePhotoSpace(heroH);
        await drawPhoto(valid[0],heroX,y,heroW,heroH);y-=heroH+gap;
        const boxW=(contentW-gap)/2,boxH=205;ensurePhotoSpace(boxH);
        await drawPhoto(valid[1],margin,y,boxW,boxH);
        await drawPhoto(valid[2],margin+boxW+gap,y,boxW,boxH);y-=boxH+gap;
      }else{
        const cols=2,boxW=(contentW-gap)/2,boxH=205;
        for(let rowStart=0;rowStart<valid.length;rowStart+=cols){
          ensurePhotoSpace(boxH);
          const rowUrls=valid.slice(rowStart,rowStart+cols);
          for(let col=0;col<rowUrls.length;col++){
            await drawPhoto(rowUrls[col],margin+col*(boxW+gap),y,boxW,boxH);
          }
          y-=boxH+gap;
        }
      }
    }
  }else{
    page.drawText('Documentazione fotografica',{x:margin,y,size:12,font:bold,color:green});y-=20;
    page.drawText('Nessuna documentazione fotografica allegata',{x:margin,y,size:10,font:regular,color:muted});
  }
  pdf.setTitle(`Report intervento ${pdfSafeText(title)}`);pdf.setAuthor('Overgreen');pdf.setCreator('Overgreen Cloud');pdf.setProducer('Overgreen Cloud');
  const bytes=await pdf.save({useObjectStreams:true,addDefaultPage:false});
  const safeFilePart=value=>pdfSafeText(value).replace(/[\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim()||'Intervento';
  const dateForFile=String(date||today()).split('-').reverse().join('-');
  const fileName=`Report - ${safeFilePart(clientLabel(st||row))} - ${safeFilePart(title)} - ${dateForFile}.pdf`;
  const file=new File([bytes],fileName,{type:'application/pdf'});
  return {file,fileName,title,sizeKb:Math.max(1,Math.round(file.size/1024))};
}
let clientReportPreviewUrl='';
function closeClientReportPreview(){
  const dialog=$('clientReportPreviewDialog');
  if(dialog?.open)dialog.close();
  if(clientReportPreviewUrl){URL.revokeObjectURL(clientReportPreviewUrl);clientReportPreviewUrl=''}
  const frame=$('clientReportPreviewFrame');if(frame)frame.removeAttribute('src');
  window.currentClientReportFile=null;
}
async function shareClientReportData(data){
  if(!data)return;
  const {file,fileName,title,sizeKb}=data;
  try{
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
      await navigator.share({title:`Report cliente ${pdfSafeText(title)}`,text:`Report intervento ${pdfSafeText(title)}`,files:[file]});
      toast(`Report cliente PDF pronto (${sizeKb} KB)`);
    }else{
      const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=fileName;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast(`Report cliente PDF scaricato (${sizeKb} KB)`);
    }
  }catch(err){if(err?.name!=='AbortError')alert('Impossibile scaricare il PDF: '+err.message)}
}
async function downloadSingleClientReport(kind,row){
  try{
    toast('Creo il PDF cliente...');
    const data=await createSingleClientReportFile(kind,row);
    await shareClientReportData(data);
  }catch(err){alert('Impossibile creare il report cliente PDF: '+err.message)}
}
async function previewSingleClientReport(kind,row){
  try{
    toast('Creo l’anteprima del report...');
    const data=await createSingleClientReportFile(kind,row);window.currentClientReportFile=data;
    if(clientReportPreviewUrl)URL.revokeObjectURL(clientReportPreviewUrl);
    clientReportPreviewUrl=URL.createObjectURL(data.file);
    $('clientReportPreviewTitle').textContent=`Report cliente · ${data.title}`;
    $('clientReportPreviewInfo').textContent=`PDF pronto · ${data.sizeKb} KB`;
    $('clientReportPreviewFrame').src=clientReportPreviewUrl+'#toolbar=0&navpanes=0';
    $('clientReportPreviewDialog').showModal();
  }catch(err){alert('Impossibile creare il report cliente: '+err.message)}
}

async function createStoreInterventionsReportFile(store,rows){
  if(!window.PDFLib)throw new Error('Libreria PDF non caricata. Ricarica la pagina e riprova.');
  const selected=[...(rows||[])].filter(Boolean).sort((a,b)=>String(a.data_intervento||'').localeCompare(String(b.data_intervento||'')));
  if(!selected.length)throw new Error('Seleziona almeno un intervento.');
  const {PDFDocument}=PDFLib,merged=await PDFDocument.create();
  for(const intervention of selected){
    const single=await createSingleClientReportFile('ordinary',intervention);
    const bytes=new Uint8Array(await single.file.arrayBuffer());
    const source=await PDFDocument.load(bytes);
    const copied=await merged.copyPages(source,source.getPageIndices());
    copied.forEach(p=>merged.addPage(p));
  }
  const safe=value=>pdfSafeText(value).replace(/[\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim()||'Sede';
  const dates=selected.map(i=>interventionEndDate(i)).filter(Boolean).sort();
  const first=dates[0]||today(),last=dates[dates.length-1]||first;
  merged.setTitle(`Report interventi ${safe(store?.nome||'Sede')}`);
  merged.setAuthor('Overgreen');merged.setCreator('Overgreen Cloud');merged.setProducer('Overgreen Cloud');
  const bytes=await merged.save({useObjectStreams:true,addDefaultPage:false});
  const range=first===last?fmt(first):`${fmt(first)} - ${fmt(last)}`;
  const fileName=`Report interventi - ${safe(clientLabel(store))} - ${safe(store?.nome||'Sede')} - ${safe(range)}.pdf`;
  const file=new File([bytes],fileName,{type:'application/pdf'});
  return {file,fileName,title:`${store?.nome||'Sede'} · ${selected.length} interventi`,sizeKb:Math.max(1,Math.round(file.size/1024))};
}
async function downloadStoreInterventionsReport(store,rows){
  try{
    toast(rows.length===1?'Creo il report intervento...':`Creo il report di ${rows.length} interventi...`);
    const data=rows.length===1?await createSingleClientReportFile('ordinary',rows[0]):await createStoreInterventionsReportFile(store,rows);
    await shareClientReportData(data);
  }catch(err){alert('Impossibile creare il report: '+(err?.message||String(err)))}
}

async function createDailyReportFile(mode='compact'){
  if(!window.PDFLib)throw new Error('Libreria PDF non caricata. Ricarica la pagina e riprova.');
  const {PDFDocument,StandardFonts,rgb}=PDFLib,data=dailyReportData(),counts=reportCounts(data);
  const typeLabel=({all:'Tutti i lavori',ordinary:'Interventi ordinari',extra:'Lavori extra'})[$('reportType')?.value||'all'];
  const workerLabel=$('reportWorker')?.selectedOptions?.[0]?.textContent||'Tutti i dipendenti';
  const pdf=await PDFDocument.create(),regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const green=rgb(.02,.35,.18),dark=rgb(.08,.18,.13),muted=rgb(.38,.45,.41),border=rgb(.82,.87,.84),soft=rgb(.95,.97,.96);
  const pageW=595.28,pageH=841.89,margin=42,contentW=pageW-margin*2;
  let page,y;
  const addPage=(continuation=false)=>{
    page=pdf.addPage([pageW,pageH]);y=pageH-48;
    page.drawText('OVERGREEN',{x:margin,y,size:22,font:bold,color:green});
    page.drawText(mode==='full'?'Report attivita completo':'Report attivita sintetico',{x:margin,y:y-17,size:10,font:regular,color:muted});
    page.drawText(pdfSafeText(data.period?.label||fmt(data.date)),{x:pageW-margin-190,y,size:13,font:bold,color:dark,maxWidth:190});
    page.drawText(pdfSafeText(`${typeLabel} - ${workerLabel}`),{x:pageW-margin-250,y:y-17,size:8,font:regular,color:muted,maxWidth:250});
    page.drawLine({start:{x:margin,y:y-31},end:{x:pageW-margin,y:y-31},thickness:2,color:green});
    y-=50;
    if(!continuation){
      const items=[['Lavori',counts.total],['Ordinari',counts.ordinary],['Extra',counts.extra],['Completati',counts.done],['In attesa',counts.pending],['Operatori',counts.workers],['Foto',counts.photos]];
      const gap=6,w=(contentW-gap*3)/4,h=42;
      items.forEach((it,i)=>{const row=Math.floor(i/4),col=i%4,x=margin+col*(w+gap),yy=y-row*(h+gap);page.drawRectangle({x,y:yy-h,width:w,height:h,borderColor:border,borderWidth:.7,color:soft});page.drawText(String(it[1]),{x:x+8,y:yy-18,size:14,font:bold,color:green});page.drawText(it[0],{x:x+8,y:yy-32,size:7.5,font:regular,color:muted});});
      y-=h*2+gap*2+8;
    }
  };
  const ensure=(needed=80)=>{if(y-needed<44)addPage(true)};
  const addSection=title=>{ensure(38);page.drawText(title,{x:margin,y,size:13,font:bold,color:green});y-=8;page.drawLine({start:{x:margin,y},end:{x:pageW-margin,y},thickness:.8,color:border});y-=17;};
  const drawJob=async(kind,row)=>{
    const isOrd=kind==='ordinary',st=stores.find(s=>s.id===row.store_id),names=reportWorkerNames(kind,row.id),pics=attachments.filter(a=>a.tipo==='foto_generica'&&(isOrd?a.intervention_id===row.id:a.extra_id===row.id)),docs=isOrd?[]:attachments.filter(a=>a.extra_id===row.id&&a.tipo!=='foto_generica');
    const title=isOrd?(st?.nome||'Punto vendita'):(row.titolo||'Lavoro extra');
    const place=isOrd?([st?.indirizzo,st?.citta].filter(Boolean).join(', ')):(st?([st.nome,st.indirizzo,st.citta].filter(Boolean).join(', ')):[row.nome_esterno,row.indirizzo_esterno].filter(Boolean).join(', '));
    const date=isOrd?row.data_intervento:row.giorno_intervento,notes=(isOrd?row.note:(row.note_lorenzo||row.descrizione))||'Nessuna nota';
    ensure(mode==='full'?150:82);
    const top=y;page.drawRectangle({x:margin,y:top-64,width:contentW,height:64,borderColor:border,borderWidth:.7});
    page.drawText(isOrd?'INTERVENTO ORDINARIO':'LAVORO EXTRA',{x:margin+10,y:top-14,size:7.5,font:bold,color:muted});
    page.drawText(pdfSafeText(title),{x:margin+10,y:top-30,size:12,font:bold,color:dark,maxWidth:330});
    page.drawText(pdfSafeText(place||'Luogo non indicato'),{x:margin+10,y:top-46,size:8.5,font:regular,color:muted,maxWidth:330});
    page.drawText(pdfSafeText(reportStatusLabel(row.stato)),{x:pageW-margin-105,y:top-20,size:8.5,font:bold,color:green,maxWidth:95});
    const meta=`${fmt(date)} | Chiusura: ${fmtClosedAt(row.closed_at)} | ${closedByName(row)} | ${names.join(', ')||'Operatori non indicati'}`;
    page.drawText(pdfSafeText(meta),{x:margin+10,y:top-58,size:7.2,font:regular,color:muted,maxWidth:contentW-20});
    y=top-76;
    if(mode==='full'){
      ensure(65);page.drawText('Note',{x:margin+2,y,size:9,font:bold,color:green});y-=14;y=drawWrappedPdfText(page,regular,notes,margin+2,y,contentW-4,8.5,dark,11);y-=8;
      if(docs.length){ensure(28);page.drawText(pdfSafeText(`Documenti: ${docs.map(attachmentLabel).join(' - ')}`),{x:margin+2,y,size:7.5,font:regular,color:muted,maxWidth:contentW-4});y-=16;}
      if(pics.length){
        page.drawText(`Foto (${pics.length})`,{x:margin+2,y,size:9,font:bold,color:green});y-=12;
        const gap=6,cols=3,imgW=(contentW-gap*2)/3,imgH=92;
        for(let i=0;i<pics.length;i+=cols){ensure(imgH+16);const rowPics=pics.slice(i,i+cols);for(let j=0;j<rowPics.length;j++){
          try{const url=await signedAttachmentUrl(rowPics[j]),photo=await compressedPhotoForPdf(url,850,.52),img=await pdf.embedJpg(photo.bytes),ratio=Math.min(imgW/photo.width,imgH/photo.height),dw=photo.width*ratio,dh=photo.height*ratio,x=margin+j*(imgW+gap);page.drawRectangle({x,y:y-imgH,width:imgW,height:imgH,borderColor:border,borderWidth:.6});page.drawImage(img,{x:x+(imgW-dw)/2,y:y-imgH+(imgH-dh)/2,width:dw,height:dh});}catch(e){}
        }y-=imgH+8;}
      }else{page.drawText('Nessuna foto allegata',{x:margin+2,y,size:8,font:regular,color:muted});y-=15;}
    }
    y-=8;
  };
  addPage(false);
  if(!data.ordinary.length&&!data.extra.length){page.drawText('Nessun lavoro trovato per il periodo e i filtri selezionati.',{x:margin,y,size:11,font:regular,color:muted});}
  if(data.ordinary.length){addSection('Interventi ordinari');for(const row of data.ordinary)await drawJob('ordinary',row);}
  if(data.extra.length){addSection('Lavori extra');for(const row of data.extra)await drawJob('extra',row);}
  pdf.setTitle(`Report attivita Overgreen ${pdfSafeText(data.period?.short||data.date)}`);pdf.setAuthor('Overgreen');pdf.setCreator('Overgreen Cloud');pdf.setProducer('Overgreen Cloud');
  const bytes=await pdf.save({useObjectStreams:true,addDefaultPage:false});
  const periodSafe=pdfSafeText(data.period?.short||data.date).replace(/[\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim();
  const fileName=`Report attivita ${mode==='full'?'completo':'sintetico'} - ${periodSafe}.pdf`,file=new File([bytes],fileName,{type:'application/pdf'});
  return {file,fileName,title:`Report attivita ${mode==='full'?'completo':'sintetico'}`,sizeKb:Math.max(1,Math.round(file.size/1024))};
}
const dailyReportPdfCache=new Map();
const dailyReportPdfPending=new Map();
function dailyReportPdfKey(mode='compact'){
  const d=dailyReportData();
  const ids=[
    ...d.ordinary.map(r=>`o:${r.id}:${r.closed_at||''}:${r.stato||''}`),
    ...d.extra.map(r=>`e:${r.id}:${r.closed_at||''}:${r.stato||''}`)
  ].join('|');
  return [
    mode,
    d.period?.short||d.date||'',
    $('reportType')?.value||'all',
    $('reportWorker')?.value||'all',
    ids,
    attachments.length
  ].join('::');
}
async function getDailyReportPdf(mode='compact'){
  const key=dailyReportPdfKey(mode);
  if(dailyReportPdfCache.has(key))return dailyReportPdfCache.get(key);
  if(dailyReportPdfPending.has(key))return dailyReportPdfPending.get(key);
  const promise=createDailyReportFile(mode).then(data=>{
    dailyReportPdfCache.set(key,data);
    dailyReportPdfPending.delete(key);
    return data;
  }).catch(err=>{
    dailyReportPdfPending.delete(key);
    throw err;
  });
  dailyReportPdfPending.set(key,promise);
  return promise;
}
function prewarmDailyReportPdfs(){
  // Generiamo i PDF in anticipo mentre l'utente guarda il report.
  // In questo modo, quando preme il pulsante, navigator.share viene chiamato
  // immediatamente dal tap e iOS apre lo stesso foglio di condivisione
  // già usato dal report del singolo intervento.
  setTimeout(()=>{getDailyReportPdf('compact').catch(()=>{})},150);
  setTimeout(()=>{getDailyReportPdf('full').catch(()=>{})},700);
}
async function exportDailyReportPdf(mode='compact'){
  try{
    const key=dailyReportPdfKey(mode);
    const cached=dailyReportPdfCache.get(key);
    if(cached){
      await shareClientReportData(cached);
      return;
    }

    // Se il PDF non è ancora pronto, lo completiamo e lo teniamo in cache.
    // Su iOS una generazione molto lunga può far scadere il gesto utente:
    // in quel raro caso basta ripremere il pulsante e la condivisione sarà immediata.
    toast(mode==='full'?'Preparo il PDF completo...':'Preparo il PDF sintetico...');
    const data=await getDailyReportPdf(mode);
    try{
      await shareClientReportData(data);
    }catch(e){
      throw e;
    }
  }catch(err){
    if(err?.name!=='AbortError')alert('Impossibile creare il PDF: '+err.message);
  }
}
async function shareDailyReport(){
  const text=buildDailyReportText();
  try{if(navigator.share)await navigator.share({title:'Report attività Overgreen',text});else{await navigator.clipboard.writeText(text);toast('Riepilogo copiato')}}catch(err){if(err?.name!=='AbortError')alert('Condivisione non riuscita: '+err.message)}
}
let statsDays='15';
function statsIsoDate(d){return d.toISOString().slice(0,10)}
function statsAddDays(iso,days){const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+days);return statsIsoDate(d)}
function statsRange(){
  if(statsDays==='custom'){
    let start=$('statsStartDate')?.value||today(),end=$('statsEndDate')?.value||today();
    if(start>end)[start,end]=[end,start];return {start,end};
  }
  const days=Math.max(1,Number(statsDays)||15),end=today(),start=statsAddDays(end,-(days-1));return {start,end};
}
function statsStoreForRow(row){return row?.store_id?stores.find(s=>s.id===row.store_id):null}
function statsSiteMatches(row){
  const f=$('statsSiteType')?.value||'all';if(f==='all')return true;
  const st=statsStoreForRow(row);if(f==='atm')return st?.site_type==='atm';return !st||st.site_type!=='atm';
}
function statsExecutedRows(range=statsRange()){
  const client=$('statsClient')?.value||'all',type=$('statsType')?.value||'all';
  const inRange=d=>d&&d>=range.start&&d<=range.end;
  const rows=[];
  if(type!=='extra'){
    interventions.filter(i=>!i.multi_day_open&&['in_attesa','convalidato'].includes(i.stato)&&inRange(interventionEndDate(i))).forEach(i=>rows.push({kind:'ordinary',date:interventionEndDate(i),row:i,client:clientType(i),store:statsStoreForRow(i)}));
  }
  if(type!=='ordinary'){
    extras.filter(e=>['in_attesa','completato'].includes(e.stato)&&inRange(e.giorno_intervento)).forEach(e=>rows.push({kind:'extra',date:e.giorno_intervento,row:e,client:clientType(e),store:statsStoreForRow(e)}));
  }
  return rows.filter(x=>(client==='all'||x.client===client)&&statsSiteMatches(x.row));
}
function statsPeriodLength(range){const a=new Date(range.start+'T12:00:00'),b=new Date(range.end+'T12:00:00');return Math.max(1,Math.round((b-a)/86400000)+1)}
function statsDelta(current,previous){if(!previous)return current?'Nuovo nel periodo':'—';const pct=Math.round(((current-previous)/previous)*100);return `${pct>0?'+':''}${pct}% vs periodo prima`}
function statsKpi(title,value,sub,delta){return `<article class="stats-kpi"><strong>${esc(String(value))}</strong><span>${esc(title)}</span>${sub?`<small>${esc(sub)}</small>`:''}${delta?`<small class="${delta.startsWith('+')?'up':delta.startsWith('-')?'down':''}">${esc(delta)}</small>`:''}</article>`}
function statsBars(rootId,items){
  const root=$(rootId);if(!root)return;const max=Math.max(1,...items.map(x=>x.value));
  root.innerHTML=items.some(x=>x.value)?items.map(x=>`<div class="stats-bar-row"><span>${esc(x.label)}</span><div class="stats-bar-track"><div class="stats-bar-fill" style="width:${Math.max(2,(x.value/max)*100)}%"></div></div><strong>${x.value}</strong></div>`).join(''):'<div class="stats-empty">Nessun lavoro nel periodo.</div>';
}
function renderStats(){
  if(!$('statsView'))return;
  const range=statsRange(),len=statsPeriodLength(range),rows=statsExecutedRows(range),prevEnd=statsAddDays(range.start,-1),prevStart=statsAddDays(prevEnd,-(len-1)),prev=statsExecutedRows({start:prevStart,end:prevEnd});
  const ord=rows.filter(x=>x.kind==='ordinary').length,ext=rows.filter(x=>x.kind==='extra').length,total=rows.length,unique=new Set(rows.map(x=>x.store?.id||x.row?.nome_esterno||x.row?.indirizzo_esterno).filter(Boolean)).size;
  $('statsKpis').innerHTML=[statsKpi('Lavori eseguiti',total,`${fmt(range.start)} → ${fmt(range.end)}`,statsDelta(total,prev.length)),statsKpi('Ordinari',ord,`${Math.round(ord/Math.max(1,total)*100)}% del totale`,statsDelta(ord,prev.filter(x=>x.kind==='ordinary').length)),statsKpi('Extra',ext,`${Math.round(ext/Math.max(1,total)*100)}% del totale`,statsDelta(ext,prev.filter(x=>x.kind==='extra').length)),statsKpi('Sedi lavorate',unique,`Media ${(total/len).toLocaleString('it-IT',{maximumFractionDigits:1})} lavori/giorno`,'')].join('');
  const byClient=['eurospin','intesa','privato'].map(c=>({label:clientLabel(c),value:rows.filter(x=>x.client===c).length}));statsBars('statsClients',byClient);statsBars('statsTypes',[{label:'Ordinari',value:ord},{label:'Extra',value:ext}]);
  const dayMap=new Map();for(let d=range.start;d<=range.end;d=statsAddDays(d,1))dayMap.set(d,0);rows.forEach(x=>dayMap.set(x.date,(dayMap.get(x.date)||0)+1));const entries=[...dayMap.entries()],max=Math.max(1,...entries.map(x=>x[1]));
  const compact=len>31,step=len>60?14:len>31?7:len>15?3:1;
  $('statsTrend').innerHTML=`<div class="stats-trend">${entries.map(([d,v],i)=>`<div class="stats-trend-col" title="${fmt(d)}: ${v}"><div class="stats-trend-bar" style="height:${Math.max(2,(v/max)*100)}%"></div>${(!compact||i%step===0)?`<small>${d.slice(5).split('-').reverse().join('/')}</small>`:''}</div>`).join('')}</div>`;
  const storeCounts=new Map();rows.forEach(x=>{const key=x.store?.id||`ext:${x.row?.nome_esterno||x.row?.indirizzo_esterno||'esterno'}`;const cur=storeCounts.get(key)||{name:x.store?.nome||x.row?.nome_esterno||'Sede esterna',city:x.store?.citta||x.row?.indirizzo_esterno||'',client:x.client,count:0};cur.count++;storeCounts.set(key,cur)});const top=[...storeCounts.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'it')).slice(0,8);
  $('statsTopStores').innerHTML=top.length?top.map((x,i)=>`<div class="stats-top-item"><span><strong>${i+1}. ${esc(x.name)}</strong><small>${esc([x.city,clientLabel(x.client)].filter(Boolean).join(' · '))}</small></span><strong>${x.count}</strong></div>`).join(''):'<div class="stats-empty">Nessuna sede nel periodo.</div>';

  // Statistiche operatori: ogni lavoro viene attribuito a tutti gli operatori assegnati.
  const workerMap=new Map();
  const ensureWorker=id=>{if(!id)return null;let cur=workerMap.get(id);if(!cur){const p=profiles.find(x=>x.id===id);cur={id,name:p?.nome||p?.email||'Operatore',total:0,ordinary:0,extra:0,dates:new Set(),stores:new Set(),clientDays:{eurospin:new Set(),intesa:new Set(),privato:new Set()},atmDays:new Set(),clientJobs:{eurospin:0,intesa:0,privato:0},atmJobs:0,dayJobs:new Map()};workerMap.set(id,cur)}return cur};
  rows.forEach(x=>{
    const assigned=x.kind==='ordinary'?interventionWorkers.filter(w=>w.intervention_id===x.row.id):extraWorkers.filter(w=>w.extra_id===x.row.id);
    assigned.forEach(w=>{const cur=ensureWorker(w.profile_id);if(!cur)return;cur.total++;cur[x.kind]++;if(x.date){cur.dates.add(x.date);cur.dayJobs.set(x.date,(cur.dayJobs.get(x.date)||0)+1)}const site=x.store?.id||x.row?.nome_esterno||x.row?.indirizzo_esterno;if(site)cur.stores.add(site);const client=['eurospin','intesa','privato'].includes(x.client)?x.client:'privato';cur.clientJobs[client]++;if(x.date)cur.clientDays[client].add(x.date);if(x.store?.site_type==='atm'){cur.atmJobs++;if(x.date)cur.atmDays.add(x.date)}});
  });
  const workers=[...workerMap.values()].map(w=>{w.avgDay=w.dates.size?w.total/w.dates.size:0;w.avgOrdDay=w.dates.size?w.ordinary/w.dates.size:0;w.avgExtraDay=w.dates.size?w.extra/w.dates.size:0;w.record=Math.max(0,...w.dayJobs.values());return w}).sort((a,b)=>b.avgDay-a.avgDay||b.total-a.total||a.name.localeCompare(b.name,'it'));
  const workerAssignments=workers.reduce((sum,w)=>sum+w.total,0),activeWorkers=workers.length;
  if($('statsWorkerKpis'))$('statsWorkerKpis').innerHTML=[statsKpi('Operatori attivi',activeWorkers,'Con almeno 1 lavoro nel periodo',''),statsKpi('Assegnazioni',workerAssignments,'Un lavoro in squadra conta per ogni operatore',''),statsKpi('Media per operatore',activeWorkers?(workerAssignments/activeWorkers).toLocaleString('it-IT',{maximumFractionDigits:1}):'0','Lavori assegnati nel periodo','')].join('');
  const f1=n=>Number(n||0).toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1});
  if($('statsOperators'))$('statsOperators').innerHTML=workers.length?workers.map((w,i)=>`<article class="stats-operator-card"><div class="stats-operator-rank">${i+1}</div><div class="stats-operator-main"><strong>${esc(w.name)}</strong><small>${w.dates.size} ${w.dates.size===1?'giorno lavorato':'giorni lavorati'} · ${w.stores.size} ${w.stores.size===1?'sede':'sedi'} · record ${w.record}/giorno</small><div class="stats-operator-split"><span>Totale <b>${w.total}</b></span><span>Media/giorno <b>${f1(w.avgDay)}</b></span><span>Ord./giorno <b>${f1(w.avgOrdDay)}</b></span><span>Extra/giorno <b>${f1(w.avgExtraDay)}</b></span></div><div class="stats-operator-split"><span>Eurospin <b>${w.clientDays.eurospin.size} gg</b> · ${w.clientJobs.eurospin} lavori · ${f1(w.clientJobs.eurospin/Math.max(1,w.clientDays.eurospin.size))}/gg</span><span>Intesa <b>${w.clientDays.intesa.size} gg</b> · ${w.clientJobs.intesa} lavori · ${f1(w.clientJobs.intesa/Math.max(1,w.clientDays.intesa.size))}/gg</span><span>ATM <b>${w.atmDays.size} gg</b> · ${w.atmJobs} lavori</span>${w.clientDays.privato.size?`<span>Altri <b>${w.clientDays.privato.size} gg</b> · ${w.clientJobs.privato} lavori</span>`:''}</div></div><div class="stats-operator-total"><strong>${f1(w.avgDay)}</strong><small>lavori/giorno</small></div></article>`).join(''):'<div class="stats-empty">Nessun operatore associato ai lavori del periodo.</div>';
}
function setStatsDays(value){statsDays=String(value);document.querySelectorAll('[data-stats-days]').forEach(b=>b.classList.toggle('active',b.dataset.statsDays===statsDays));$('statsCustomRange')?.classList.toggle('active',statsDays==='custom');renderStats()}

function renderDailyReport(){
  if(!admin())return setView('dashboard');renderReportFilters();
  const data=dailyReportData(),all=[...data.ordinary.map(x=>({kind:'ordinary',row:x})),...data.extra.map(x=>({kind:'extra',row:x}))];
  const workerIds=new Set();data.ordinary.forEach(i=>interventionWorkers.filter(w=>w.intervention_id===i.id).forEach(w=>workerIds.add(w.profile_id)));data.extra.forEach(e=>extraWorkers.filter(w=>w.extra_id===e.id).forEach(w=>workerIds.add(w.profile_id)));
  const photoCount=attachments.filter(a=>a.tipo==='foto_generica'&&((a.intervention_id&&data.ordinary.some(i=>i.id===a.intervention_id))||(a.extra_id&&data.extra.some(e=>e.id===a.extra_id)))).length;
  const docCount=attachments.filter(a=>a.tipo!=='foto_generica'&&a.extra_id&&data.extra.some(e=>e.id===a.extra_id)).length;
  const pending=all.filter(x=>x.row.stato==='in_attesa').length,done=data.ordinary.filter(i=>i.stato==='convalidato').length+data.extra.filter(e=>e.stato==='completato').length;
  $('reportSummary').innerHTML=`<div class="report-kpi"><strong>${all.length}</strong><span>Lavori totali</span></div><div class="report-kpi"><strong>${data.ordinary.length}</strong><span>Ordinari</span></div><div class="report-kpi"><strong>${data.extra.length}</strong><span>Extra</span></div><div class="report-kpi"><strong>${done}</strong><span>Completati</span></div><div class="report-kpi"><strong>${pending}</strong><span>In attesa</span></div><div class="report-kpi"><strong>${workerIds.size}</strong><span>Operatori</span></div><div class="report-kpi"><strong>${photoCount}</strong><span>Foto</span></div><div class="report-kpi"><strong>${docCount}</strong><span>Documenti</span></div>`;
  const list=$('reportList');list.innerHTML='';if(!all.length){list.innerHTML='<section class="panel report-empty"><strong>Nessun lavoro trovato</strong><p class="muted">Non risultano attività concluse per il periodo selezionato con questi filtri.</p></section>';return}
  for(const item of all){
    const r=item.row,isOrd=item.kind==='ordinary',st=isOrd?stores.find(s=>s.id===r.store_id):stores.find(s=>s.id===r.store_id),names=reportWorkerNames(item.kind,r.id);
    const pics=attachments.filter(a=>a.tipo==='foto_generica'&&(isOrd?a.intervention_id===r.id:a.extra_id===r.id));
    const docs=isOrd?[]:attachments.filter(a=>a.extra_id===r.id&&a.tipo!=='foto_generica');
    const title=isOrd?(st?.nome||'Punto vendita'):r.titolo,place=isOrd?(st?.indirizzo||st?.citta||''):(st?.nome||r.nome_esterno||r.indirizzo_esterno||'');
    const c=document.createElement('article');c.className='card daily-report-card';c.innerHTML=`<div class="daily-report-head"><div><span class="report-kind">${isOrd?'INTERVENTO ORDINARIO':'LAVORO EXTRA'}</span><h3>${esc(title)}</h3><p class="muted">${esc(place)}</p></div><span class="badge-state">${esc(reportStatusLabel(r.stato))}</span></div><div class="report-meta"><span>📅 ${esc(fmt(isOrd?interventionEndDate(r):r.giorno_intervento))}</span><span>🕒 ${esc(fmtClosedAt(r.closed_at))}</span><span>✅ ${esc(closedByName(r))}</span><span>👤 ${esc(names.join(' · ')||'Operatore non indicato')}</span><span>📷 ${pics.length}</span>${docs.length?`<span>📄 ${docs.length}</span>`:''}</div><div class="report-note"><strong>Note</strong><p>${esc((isOrd?r.note:(r.note_lorenzo||r.descrizione))||'Nessuna nota')}</p></div><div class="report-photo-grid"></div><div class="actions report-actions client-report-buttons"><button class="secondary" data-client-preview>📄 Anteprima</button><button data-client-download>⬇️ Report cliente PDF</button>${st?'<button class="secondary" data-store>Scheda punto vendita</button>':''}${docs.map(a=>`<button class="secondary" data-doc="${a.id}">${esc(attachmentLabel(a))}</button>`).join('')}</div>`;
    c.querySelector('[data-client-preview]')?.addEventListener('click',()=>previewSingleClientReport(item.kind,r));
    c.querySelector('[data-client-download]')?.addEventListener('click',()=>downloadSingleClientReport(item.kind,r));
    c.querySelector('[data-store]')?.addEventListener('click',()=>showStoreDetail(st));
    c.querySelectorAll('[data-doc]').forEach(b=>b.onclick=()=>openAttachment(attachments.find(a=>a.id===b.dataset.doc)));
    const gallery=c.querySelector('.report-photo-grid');for(const a of pics){const b=document.createElement('button');b.type='button';b.className='report-photo';b.innerHTML='<span>📷</span>';gallery.appendChild(b);signedAttachmentUrl(a).then(url=>{b.innerHTML=`<img src="${url}" alt="${esc(a.nome_file||'Foto')}" loading="lazy">`;b.onclick=()=>window.open(url,'_blank')}).catch(()=>b.onclick=()=>openArchiveAttachment(a))}
    if(!pics.length)gallery.remove();list.appendChild(c);
  }
}

function matchingStoresForBulkInterval(){
  const client=$('bulkIntervalClient')?.value||'eurospin';
  const siteType=$('bulkIntervalSiteType')?.value||'all';
  return stores.filter(s=>clientType(s)===client&&(siteType==='all'||(s.site_type||'punto_vendita')===siteType));
}
function updateBulkIntervalPreview(){
  const box=$('bulkIntervalPreview');if(!box)return;
  const matches=matchingStoresForBulkInterval();
  const days=Math.max(1,Number($('bulkIntervalDays')?.value)||0);
  box.innerHTML=`<strong>${matches.length} sedi interessate</strong><span>Il nuovo intervallo sarà di ${days} giorni.</span>`;
}
function openBulkIntervalDialog(){
  const preferred=storeClientFilter!=='all'?storeClientFilter:'eurospin';
  $('bulkIntervalClient').value=preferred;
  $('bulkIntervalSiteType').value='all';
  const sameClient=stores.filter(s=>clientType(s)===preferred);
  const common=sameClient.length?Number(sameClient[0].intervallo_giorni)||15:15;
  $('bulkIntervalDays').value=common;
  updateBulkIntervalPreview();
  openDialog('bulkIntervalDialog');
}

function renderStores(){
 const q=$('searchInput').value.trim().toLowerCase(),sort=$('sortSelect').value;
 const clientStores=stores.filter(s=>storeClientFilter==='all'||clientType(s)===storeClientFilter);
 let list=clientStores.filter(s=>`${s.nome} ${s.citta||''} ${s.indirizzo||''} ${clientLabel(s)}`.toLowerCase().includes(q));
 if(storeFilter!=='all')list=list.filter(s=>storeFilter==='today'?s.ultimo_passaggio===today():storeFilter==='urgent'?isUrgentStore(s):status(s)===storeFilter);
 list.sort((a,b)=>sort==='alpha'?a.nome.localeCompare(b.nome,'it'):(days(b.ultimo_passaggio)??9999)-(days(a.ultimo_passaggio)??9999));
 $('storesList').innerHTML='';for(const s of list){const n=days(s.ultimo_passaggio),pending=interventions.some(i=>i.store_id===s.id&&i.stato==='in_attesa'),storeState=status(s),programmed=storeState==='scheduled';const c=document.createElement('article');c.className=`card store-card ${storeState}`;c.innerHTML=`<div class="status-bar"></div><div><div class="card-top"><div><h3 data-detail>${esc(s.nome)}</h3><p class="muted">${esc(s.citta||s.indirizzo||'')}</p></div><div class="days">${!storeHasInterval(s)?'Su richiesta':n===null?'—':n+' gg'}</div></div>${programmed?'<p class="programmed-label">📅 In programma</p>':''}${!storeHasInterval(s)?'<p class="muted"><strong>↪ Nessun intervallo · solo su richiesta</strong></p>':''}${pending?'<p class="pending">⏳ In attesa di convalida</p>':''}${s.site_type==='atm'&&s.importo_fisso!==null&&s.importo_fisso!==undefined?`<p class="muted"><strong>Importo fisso:</strong> ${esc(euro(s.importo_fisso))}</p>`:''}<p class="muted">Ultimo passaggio: ${fmt(s.ultimo_passaggio)}</p><div class="actions"><button class="secondary" data-map>Maps</button><button data-history>Storico</button>${!pending?'<button data-done>Eseguito</button>':''}${admin()?'<button class="secondary" data-share>Condividi</button><button class="secondary" data-edit>Modifica</button>':''}</div></div>`;
 c.querySelector('[data-detail]').onclick=()=>showStoreDetail(s);c.querySelector('[data-map]').onclick=()=>openGoogleMaps(s.indirizzo,clientLabel(s)+' '+s.nome,s.citta);c.querySelector('[data-history]').onclick=()=>showHistory(s);c.querySelector('[data-done]')?.addEventListener('click',()=>openDone(s));c.querySelector('[data-share]')?.addEventListener('click',()=>shareStoreExternally(s));c.querySelector('[data-edit]')?.addEventListener('click',()=>openStore(s));$('storesList').appendChild(c)}
 $('totalCount').textContent=clientStores.length;
 $('dueCount').textContent=clientStores.filter(s=>status(s)==='due').length;
 $('warningCount').textContent=clientStores.filter(s=>status(s)==='warning').length;
 $('todayCount').textContent=clientStores.filter(s=>s.ultimo_passaggio===today()).length;
}
function renderWorkers(){for(const id of ['doneWorkers','scheduleWorkers','extraWorkers']){const w=$(id);if(!w)continue;w.innerHTML='';profiles.filter(p=>p.attivo).forEach(p=>{const l=document.createElement('label');l.innerHTML=`<input type="checkbox" value="${p.id}"> ${esc(p.nome)}`;w.appendChild(l)})}}
function syncStoreIntervalUi(){const off=$('storeNoInterval')?.checked===true;if($('storeInterval')){$('storeInterval').disabled=off;$('storeInterval').required=!off}}
function syncStoreTypeUi(){const atm=$('storeSiteType')?.value==='atm';$('storeFixedAmountWrap')?.classList.toggle('hidden',!atm);if(!atm&&$('storeFixedAmount'))$('storeFixedAmount').value=''}
function openStore(s=null){$('storeForm').reset();$('storeId').value=s?.id||'';$('storeClient').value=clientType(s);$('storeSiteType').value=s?.site_type||'punto_vendita';$('storeFixedAmount').value=s?.importo_fisso??'';$('storeName').value=s?.nome||'';$('storeAddress').value=s?.indirizzo||'';$('storeCity').value=s?.citta||'';$('storeAddress').dataset.originalValue=s?.indirizzo||'';$('storeCity').dataset.originalValue=s?.citta||'';$('storeAddress').dataset.lookupLat='';$('storeAddress').dataset.lookupLon='';$('storeAddress').dataset.lookupLabel='';if($('storeAddressLookupStatus')){$('storeAddressLookupStatus').textContent='';$('storeAddressLookupStatus').classList.add('hidden')}$('storeLast').value=s?.ultimo_passaggio||'';const noInterval=!!s&&!storeHasInterval(s);$('storeNoInterval').checked=noInterval;$('storeInterval').value=storeHasInterval(s)?Number(s.intervallo_giorni):15;$('storeNotes').value=s?.note||'';syncStoreTypeUi();syncStoreIntervalUi();openDialog('storeDialog')}
$('storeNoInterval')?.addEventListener('change',syncStoreIntervalUi);
$('storeSiteType')?.addEventListener('change',syncStoreTypeUi);
async function openDone(s,scheduleItemId=''){
  if(scheduleItemId){
    const localItem=scheduleItems.find(x=>x.id===scheduleItemId),localState=effectiveScheduleState(localItem);
    if(['in_attesa','completato'].includes(localState))return alert(localState==='in_attesa'?'Questo passaggio è già stato inviato ed è in attesa di convalida.':'Questo passaggio risulta già completato.');
    const {data:existing,error}=await sb.from('interventions').select('id,stato').eq('schedule_item_id',scheduleItemId).in('stato',['in_attesa','convalidato']).limit(1);
    if(error)return alert('Impossibile verificare lo stato del passaggio: '+error.message);
    if(existing?.length){await loadAll();return alert(existing[0].stato==='in_attesa'?'Questo passaggio è già stato inviato ed è in attesa di convalida.':'Questo passaggio risulta già completato.')}
  }
  $('doneForm').reset();donePhotoFiles=[];renderDonePhotoSelection();$('doneStoreId').value=s.id;$('doneScheduleItemId').value=scheduleItemId;const openMulti=openMultiDayIntervention(s.id);$('doneTitle').textContent=(openMulti?'Continua intervento · ':'Intervento · ')+s.nome;$('doneDate').value=today();$('doneNextVisitWrap').classList.add('hidden');const currentNextNote=String(s.next_visit_note||'').trim();if(openMulti){$('doneNextVisitCurrent').innerHTML=`<strong>↪ Intervento già in corso</strong><p>Iniziato il ${esc(fmt(openMulti.data_intervento))}. Questa giornata verrà aggiunta allo stesso intervento.</p>`;$('doneNextVisitCurrent').classList.remove('hidden')}if(!openMulti){$('doneNextVisitCurrent').innerHTML=currentNextNote?`<strong>⚠️ Da fare in questo passaggio</strong><p>${esc(currentNextNote)}</p>`:'';$('doneNextVisitCurrent').classList.toggle('hidden',!currentNextNote);}const linked=scheduleItemId?linkedExtrasForScheduleItem(scheduleItemId):[];$('doneLinkedExtras').innerHTML=linked.length?`<strong>⚠ Indicazioni collegate a questo passaggio</strong>${linked.map(e=>{const intesaTicket=isIntesaOrdinaryTicket(e),eurospinTarget=isEurospinOrdinaryTarget(e),included=intesaTicket||eurospinTarget,pdf=attachments.find(a=>a.extra_id===e.id&&a.tipo==='pdf_richiesta');return `<div class="linked-extra-category ${extraCategoryClass(e)}"><b>${intesaTicket?'🎫 Ticket Intesa':eurospinTarget?'🎯 Target Eurospin':esc(extraCategoryLabel(e))}</b> ${esc(e.titolo)}${e.numero_target?` <small>· Target ${esc(e.numero_target)}</small>`:''}${e.descrizione?`<small style="display:block;margin-top:4px">${esc(e.descrizione)}</small>`:''}${included&&pdf?`<button type="button" class="secondary compact-btn" data-linked-ticket-pdf="${e.id}" style="margin-top:7px">Apri PDF ${intesaTicket?'ticket':'target'}</button>`:''}</div>`}).join('')}`:'';$('doneLinkedExtras').classList.toggle('hidden',!linked.length);$('doneLinkedExtras').querySelectorAll('[data-linked-ticket-pdf]').forEach(b=>{const ex=linked.find(e=>e.id===b.dataset.linkedTicketPdf),pdf=attachments.find(a=>a.extra_id===ex?.id&&a.tipo==='pdf_richiesta');if(pdf)b.onclick=()=>openAttachment(pdf)});
  const fieldset=$('doneWorkersFieldset'),checks=[...$('doneWorkers').querySelectorAll('input')];
  if(admin()){
    fieldset?.classList.remove('hidden');
  }else{
    fieldset?.classList.add('hidden');
    checks.forEach(x=>x.checked=x.value===profile.id);
  }
  openDialog('doneDialog')
}
async function compressImage(file){
  if(!file.type.startsWith('image/'))return file;
  try{
    const bitmap=await createImageBitmap(file);
    const max=1600,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',0.76));
    return blob&&blob.size<file.size?new File([blob],file.name.replace(/\.[^.]+$/,'.jpg'),{type:'image/jpeg'}):file;
  }catch{return file}
}
async function uploadFile(path,file){const {error}=await sb.storage.from('documenti').upload(path,file,{upsert:false,cacheControl:'3600'});if(error)throw error;return path}
async function addAttachment(data){const {data:row,error}=await sb.from('attachments').insert(data).select().single();if(error)throw error;return row}
async function showHistory(s,refreshOnly=false){
  currentHistoryStoreId=s.id;
  const rows=interventions.filter(i=>i.store_id===s.id&&!i.multi_day_open).sort((a,b)=>String(interventionEndDate(b)).localeCompare(String(interventionEndDate(a))));
  $('historyTitle').textContent=s.nome;
  const photoCount=attachments.filter(a=>rows.some(r=>r.id===a.intervention_id)&&a.tipo==='foto_generica').length;
  $('historyList').innerHTML=`<div class="history-summary"><div><strong>${rows.length}</strong><span>interventi</span></div><div><strong>${rows.filter(x=>x.stato==='convalidato').length}</strong><span>convalidati</span></div><div><strong>${photoCount}</strong><span>foto</span></div></div>${rows.length?`<div class="history-report-toolbar"><div><strong>Report della sede</strong><span class="muted" data-history-selected-count>Nessun intervento selezionato</span></div><div class="actions"><button type="button" class="secondary" data-history-select-all>Seleziona tutti</button><button type="button" data-history-report-selected disabled>Report selezionati</button></div></div>`:''}<div class="history-subtitle">Cronologia interventi</div>`;
  if(!rows.length){$('historyList').insertAdjacentHTML('beforeend','<div class="history-empty"><div>🗂️</div><strong>Nessun intervento</strong><span>Gli interventi registrati compariranno qui.</span></div>');if(!refreshOnly&&!$('historyDialog').open)openDialog('historyDialog');return}

  const selected=new Set();
  const selectedLabel=$('historyList').querySelector('[data-history-selected-count]');
  const selectedButton=$('historyList').querySelector('[data-history-report-selected]');
  const selectAllButton=$('historyList').querySelector('[data-history-select-all]');
  const updateSelectionUi=()=>{
    const count=selected.size;
    if(selectedLabel)selectedLabel.textContent=count?`${count} intervent${count===1?'o':'i'} selezionat${count===1?'o':'i'}`:'Nessun intervento selezionato';
    if(selectedButton){selectedButton.disabled=!count;selectedButton.textContent=count?`Report selezionati (${count})`:'Report selezionati'}
    if(selectAllButton)selectAllButton.textContent=count===rows.length?'Deseleziona tutti':'Seleziona tutti';
  };
  selectAllButton?.addEventListener('click',()=>{
    if(selected.size===rows.length)selected.clear();else rows.forEach(i=>selected.add(i.id));
    $('historyList').querySelectorAll('[data-history-select]').forEach(cb=>cb.checked=selected.has(cb.value));
    updateSelectionUi();
  });
  selectedButton?.addEventListener('click',()=>{
    const chosen=rows.filter(i=>selected.has(i.id));
    if(chosen.length)downloadStoreInterventionsReport(s,chosen);
  });

  const timeline=document.createElement('div');timeline.className='history-timeline';$('historyList').appendChild(timeline);
  for(const i of rows){
    const names=await workerNames(i.id),pics=attachments.filter(a=>a.intervention_id===i.id&&a.tipo==='foto_generica');
    const d=document.createElement('article');d.className=`history-card history-${i.stato}`;
    const statusText=historyStatusLabel(i.stato);
    d.innerHTML=`<div class="history-dot"></div><div class="history-card-top"><div class="history-date"><span>${interventionDateLabel(i)}</span><small>${i.data_fine&&i.data_fine!==i.data_intervento?'Intervento ordinario · più giorni':'Intervento ordinario'}</small></div><span class="history-status">${esc(statusText)}</span></div><label class="history-report-select"><input type="checkbox" data-history-select value="${i.id}"><span>Includi nel report multiplo</span></label>${i.note?`<div class="history-note">${esc(i.note)}</div>`:'<div class="history-note muted">Nessuna nota inserita</div>'}${i.next_visit_note?`<div class="history-next-visit"><strong>Promemoria lasciato per il passaggio successivo:</strong> ${esc(i.next_visit_note)}</div>`:''}<div class="history-meta"><div class="history-workers">${names.length?names.map(n=>`<span>👤 ${esc(n)}</span>`).join(''):'<span>👤 Operatori non indicati</span>'}</div>${pics.length?`<span class="history-photo-count">📷 ${pics.length}</span>`:''}</div><div class="closure-stamp">🕒 Chiuso: ${esc(closureText(i))}</div><div class="history-photos" data-photos>${pics.length?'<span class="history-loading">Caricamento foto…</span>':''}</div><div class="history-report-actions"><button type="button" data-single-report>📄 Report singolo</button></div>${admin()?'<div class="history-admin-actions"><button class="history-edit-btn" data-edit-history>Modifica</button><button class="history-delete-btn" data-delete-history>Elimina</button></div>':''}`;
    const checkbox=d.querySelector('[data-history-select]');
    checkbox?.addEventListener('change',()=>{checkbox.checked?selected.add(i.id):selected.delete(i.id);updateSelectionUi()});
    d.querySelector('[data-single-report]')?.addEventListener('click',()=>downloadStoreInterventionsReport(s,[i]));
    d.querySelector('[data-edit-history]')?.addEventListener('click',()=>openHistoryEdit(i));d.querySelector('[data-delete-history]')?.addEventListener('click',()=>deleteHistoryIntervention(i,s));
    timeline.appendChild(d);
    if(pics.length){
      const box=d.querySelector('[data-photos]');box.innerHTML='';
      const urls=await Promise.all(pics.map(async a=>{const {data,error}=await sb.storage.from('documenti').createSignedUrl(a.storage_path,600);return error?null:{a,url:data.signedUrl}}));
      for(const x of urls.filter(Boolean)){const wrap=document.createElement('button');wrap.type='button';wrap.className='history-photo';wrap.innerHTML=`<img src="${x.url}" alt="${esc(x.a.nome_file||'Foto intervento')}" loading="lazy"><span>Apri</span>`;wrap.onclick=()=>window.open(x.url,'_blank');box.appendChild(wrap)}
    }
  }
  updateSelectionUi();
  if(!refreshOnly&&!$('historyDialog').open)openDialog('historyDialog')
}

async function deleteHistoryIntervention(i,store){
  if(!admin())return;
  const label=`${fmt(i.data_intervento)}${i.note?' · '+i.note:''}`;
  if(!confirm(`Eliminare definitivamente questo intervento?\n\n${label}\n\nVerranno eliminate anche le foto collegate.`))return;
  const {data,error}=await sb.functions.invoke('manage-user',{body:{action:'delete_intervention',intervention_id:i.id}});
  if(error||data?.error)return alert(data?.error||error.message);
  // Se l'intervento proveniva dalla programmazione, riapre il relativo punto vendita.
  if(i.schedule_item_id){
    const reset=await sb.from('schedule_items').update({stato:'da_fare'}).eq('id',i.schedule_item_id);
    if(reset.error)console.warn('Programmazione non riaperta automaticamente:',reset.error.message);
    const local=scheduleItems.find(x=>x.id===i.schedule_item_id);if(local)local.stato='da_fare';
  }
  toast('Intervento eliminato e lavoro riaperto');$('historyDialog').close();await loadAll();const refreshed=stores.find(x=>x.id===store.id);if(refreshed)showHistory(refreshed)
}
function renderHistoryEditNewPhotos(){
  const box=$('historyEditNewPreview'),label=$('historyEditPhotoLabel'),clear=$('clearHistoryEditPhotos');if(!box)return;
  box.innerHTML='';label.textContent=historyEditPhotoFiles.length?`${historyEditPhotoFiles.length} nuove foto da aggiungere`:'Nessuna nuova foto';clear.classList.toggle('hidden',!historyEditPhotoFiles.length);
  historyEditPhotoFiles.forEach((file,index)=>{const wrap=document.createElement('div');wrap.className='ordinary-photo-thumb';const img=document.createElement('img');img.alt=file.name||`Nuova foto ${index+1}`;img.src=URL.createObjectURL(file);img.onload=()=>URL.revokeObjectURL(img.src);const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Rimuovi foto');b.textContent='×';b.onclick=()=>{historyEditPhotoFiles.splice(index,1);renderHistoryEditNewPhotos()};wrap.append(img,b);box.appendChild(wrap)});
}
function addHistoryEditPhotos(fileList){for(const f of [...(fileList||[])])if(f.type.startsWith('image/'))historyEditPhotoFiles.push(f);renderHistoryEditNewPhotos()}
$('historyEditPhotos')?.addEventListener('change',e=>{
  addHistoryEditPhotos(e.target.files);
  e.target.value='';
});
$('historyEditCameraPhoto')?.addEventListener('change',e=>{
  addHistoryEditPhotos(e.target.files);
  e.target.value='';
});
$('clearHistoryEditPhotos')?.addEventListener('click',()=>{
  historyEditPhotoFiles=[];
  if($('historyEditPhotos'))$('historyEditPhotos').value='';
  if($('historyEditCameraPhoto'))$('historyEditCameraPhoto').value='';
  renderHistoryEditNewPhotos();
});
async function renderHistoryEditPhotoManager(interventionId){
  const box=$('historyEditPhotoList');if(!box)return;box.innerHTML='<p class="muted">Caricamento foto…</p>';
  const pics=attachments.filter(a=>a.intervention_id===interventionId&&a.tipo==='foto_generica');
  if(!pics.length){box.innerHTML='<p class="muted">Nessuna foto allegata.</p>';return}
  box.innerHTML='';
  for(const a of pics){const row=document.createElement('div');row.className='closure-photo-row';row.innerHTML=`<div class="closure-photo-preview"><span>📷</span><small>${esc(a.nome_file||'Foto')}</small></div><button type="button" class="danger-btn compact-btn">Elimina</button>`;try{const url=await signedAttachmentUrl(a);row.querySelector('.closure-photo-preview').innerHTML=`<img src="${url}" alt="${esc(a.nome_file||'Foto')}" loading="lazy"><small>${esc(a.nome_file||'Foto')}</small>`}catch{}const b=row.querySelector('button');b.onclick=async()=>{if(!confirm('Eliminare questa foto dall’intervento?'))return;const old=b.textContent;b.disabled=true;b.textContent='Elimino…';try{if(a.storage_path){const r=await sb.storage.from('documenti').remove([a.storage_path]);if(r.error)throw r.error}const r=await sb.from('attachments').delete().eq('id',a.id);if(r.error)throw r.error;attachments=attachments.filter(x=>x.id!==a.id);row.remove();if(!box.children.length)box.innerHTML='<p class="muted">Nessuna foto allegata.</p>';toast('Foto eliminata')}catch(err){alert(err.message);b.disabled=false;b.textContent=old}};box.appendChild(row)}
}
function openHistoryEdit(i){
  historyEditPhotoFiles=[];$('historyEditForm').reset();$('historyEditId').value=i.id;$('historyEditDate').value=i.data_intervento;$('historyEditClosedAt').value=toDateTimeLocal(i.closed_at);$('historyEditNotes').value=i.note||'';renderHistoryEditNewPhotos();
  $('historyEditWorkers').innerHTML=profiles.filter(p=>p.attivo).map(p=>`<label><input type="checkbox" value="${p.id}"><span>${esc(p.nome)}</span></label>`).join('');
  sb.from('intervention_workers').select('profile_id').eq('intervention_id',i.id).then(({data})=>{const ids=new Set((data||[]).map(x=>x.profile_id));$('historyEditWorkers').querySelectorAll('input').forEach(x=>x.checked=ids.has(x.value))});
  renderHistoryEditPhotoManager(i.id);openDialog('historyEditDialog');
}
async function workerNames(interventionId){const {data}=await sb.from('intervention_workers').select('profile_id').eq('intervention_id',interventionId);return (data||[]).map(x=>profiles.find(p=>p.id===x.profile_id)?.nome).filter(Boolean)}
async function refreshPendingData(){
  if(!admin())return;
  $('pendingList').innerHTML='<p class="muted">Aggiornamento interventi e foto…</p>';
  const [ir,ar,er,ewr]=await Promise.all([
    sb.from('interventions').select('*').order('created_at',{ascending:false}),
    sb.from('attachments').select('*').order('created_at',{ascending:false}),
    sb.from('extras').select('*').order('giorno_intervento'),
    sb.from('extra_workers').select('*')
  ]);
  if(ir.error)throw ir.error;if(ar.error)throw ar.error;if(er.error)throw er.error;if(ewr.error)throw ewr.error;
  interventions=ir.data||[];attachments=ar.data||[];extras=er.data||[];extraWorkers=ewr.data||[];
  await renderPending();renderDashboard();renderSchedules();
}
async function openPendingDialog(){
  openDialog('pendingDialog');
  try{await refreshPendingData()}catch(err){console.error(err);$('pendingList').innerHTML=`<p class="muted">Impossibile aggiornare le convalide: ${esc(err.message||String(err))}</p>`}
}

async function recoverInterventionPhotosFromStorage(i,button=null){
  if(!admin()||!i?.id)return;
  const old=button?.textContent;
  if(button){button.disabled=true;button.textContent='Cerco nello Storage…'}
  try{
    const folder=`interventi/${i.id}`;
    const {data:objects,error:listError}=await sb.storage.from('documenti').list(folder,{limit:100,offset:0,sortBy:{column:'name',order:'asc'}});
    if(listError)throw listError;
    const files=(objects||[]).filter(o=>o?.name&&!o.name.endsWith('/'));
    const {data:liveAttachments,error:attError}=await sb.from('attachments').select('*').eq('intervention_id',i.id).eq('tipo','foto_generica');
    if(attError)throw attError;
    const linked=new Set((liveAttachments||[]).map(a=>a.storage_path).filter(Boolean));
    const orphans=files.filter(o=>!linked.has(`${folder}/${o.name}`));
    if(!files.length){
      alert('Nessuna foto trovata nello Storage Supabase per questo intervento.\n\nLa foto non risulta arrivata al server. In questo caso potrebbe essere ancora presente solo sul telefono del dipendente.');
      return;
    }
    if(!orphans.length){
      const st=await interventionPhotoSyncState(i.id);
      if(st.actual>=st.expected){
        await markInterventionPhotoUpload(i.id,'synced',null);
        toast(`Foto già presenti · ${st.actual}/${st.expected}`);
        await refreshPendingData();
      }else{
        alert(`Nello Storage ci sono ${files.length} file, ma risultano già tutti collegati.\n\nIl contatore atteso è ${st.expected} e gli allegati registrati sono ${st.actual}.`);
      }
      return;
    }
    let recovered=0;
    for(const o of orphans){
      const path=`${folder}/${o.name}`;
      try{
        const row=await addAttachment({
          tipo:'foto_generica',
          intervention_id:i.id,
          storage_path:path,
          nome_file:o.name,
          mime_type:o.metadata?.mimetype||o.metadata?.contentType||'image/jpeg',
          dimensione_bytes:Number(o.metadata?.size)||null,
          caricato_da:i.closed_by||i.inserito_da||profile.id
        });
        if(row){recovered++;if(!attachments.some(a=>a.id===row.id||a.storage_path===row.storage_path))attachments.push(row)}
      }catch(err){
        const msg=String(err?.message||err);
        if(!/duplicate|unique|already exists/i.test(msg))throw err;
      }
    }
    const st=await interventionPhotoSyncState(i.id);
    if(st.ready){
      await markInterventionPhotoUpload(i.id,'synced',null);
      toast(`✓ Recuperate ${recovered} foto · ${st.actual}/${st.expected}`);
    }else{
      toast(`Recuperate ${recovered} foto · ora ${st.actual}/${st.expected}`);
    }
    await refreshPendingData();
  }catch(err){
    console.error('V112-63 recupero foto Storage fallito',err);
    alert('Ricerca nello Storage non riuscita: '+(err?.message||String(err)));
  }finally{
    if(button){button.disabled=false;button.textContent=old||'Cerca foto nello Storage'}
  }
}

async function renderPending(){
  const p=interventions.filter(i=>i.stato==='in_attesa'&&!i.multi_day_open),pendingExtras=extras.filter(e=>e.stato==='in_attesa'&&!isIntesaOrdinaryTicket(e));
  const total=p.length+pendingExtras.length;$('pendingBadge').textContent=total;$('pendingBadge').classList.toggle('hidden',!total);$('pendingList').innerHTML='';
  if(!total){$('pendingList').innerHTML='<p class="muted">Nessun lavoro da convalidare.</p>';return}
  for(const i of p){
    const s=stores.find(x=>x.id===i.store_id),names=await workerNames(i.id),pics=attachments.filter(a=>a.intervention_id===i.id&&a.tipo==='foto_generica'),expected=Math.max(0,Number(i.foto_attese)||0),syncPending=expected>pics.length;
    const c=document.createElement('article');c.className='card pending pending-review';
    c.innerHTML=`<div class="pending-review-head"><div><h3>${esc(s?.nome||'Intervento')}</h3><p class="muted">${fmt(i.data_intervento)} · 🕒 ${esc(closureText(i))}</p></div><span class="badge-state">In attesa</span></div><div class="pending-review-section"><strong>Chi ha eseguito</strong><p>${names.length?names.map(esc).join(' · '):'Operatore non indicato'}</p></div><div class="pending-review-section"><strong>Note del dipendente</strong><div class="history-note ${i.note?'':'muted'}">${esc(i.note||'Nessuna nota inserita')}</div>${i.next_visit_note?`<div class="pending-next-visit"><strong>⚠️ Da riportare al prossimo passaggio</strong>${esc(i.next_visit_note)}</div>`:''}</div><div class="pending-review-section"><div class="pending-photo-head"><strong>Foto allegate</strong><span>${expected?`${pics.length}/${expected}`:pics.length}</span></div>${syncPending?`<div class="pending-next-visit"><strong>☁️ Foto ancora in sincronizzazione</strong>Ricevute ${pics.length} di ${expected}. La convalida resta bloccata finché non arrivano tutte.</div>`:''}<div class="pending-review-photos" data-pending-photos>${pics.length?'<span class="history-loading">Caricamento foto…</span>':'<p class="muted">Nessuna foto allegata.</p>'}</div></div><div class="actions">${syncPending?'<button type="button" class="secondary" data-recover-storage>🔎 Cerca foto nello Storage</button>':''}<button data-ok ${syncPending?'disabled':''}>${syncPending?'Attendo foto…':'Convalida'}</button><button class="danger-btn" data-no>Rifiuta</button></div>`;
    c.querySelector('[data-recover-storage]')?.addEventListener('click',e=>recoverInterventionPhotosFromStorage(i,e.currentTarget));c.querySelector('[data-ok]').onclick=()=>approveIntervention(i);c.querySelector('[data-no]').onclick=()=>rejectIntervention(i);$('pendingList').appendChild(c);
    if(pics.length){
      const box=c.querySelector('[data-pending-photos]');box.innerHTML='';
      const urls=await Promise.all(pics.map(async a=>{try{return {a,url:await signedAttachmentUrl(a)}}catch{return null}}));
      for(const x of urls.filter(Boolean)){const b=document.createElement('button');b.type='button';b.className='pending-review-photo';b.innerHTML=`<img src="${x.url}" alt="${esc(x.a.nome_file||'Foto intervento')}" loading="lazy"><span>Apri</span>`;b.onclick=()=>window.open(x.url,'_blank');box.appendChild(b)}
      if(!box.children.length)box.innerHTML='<p class="muted">Foto non disponibile. Premi Aggiorna e riprova.</p>';
    }
  }
  for(const e of pendingExtras){
    const st=stores.find(x=>x.id===e.store_id),names=extraWorkers.filter(w=>w.extra_id===e.id).map(w=>profiles.find(p=>p.id===w.profile_id)?.nome).filter(Boolean),pics=attachments.filter(a=>a.extra_id===e.id&&a.tipo==='foto_generica'),re=attachments.find(a=>a.extra_id===e.id&&a.tipo==='rapportino_eurospin'),ro=attachments.find(a=>a.extra_id===e.id&&a.tipo==='rapportino_overgreen');
    const c=document.createElement('article');c.className='card pending pending-review';
    c.innerHTML=`<div class="pending-review-head"><div><h3>EXTRA · ${esc(st?.nome||e.nome_esterno||'')}</h3><p class="muted">${fmt(e.giorno_intervento)} · ${esc(e.titolo)} · 🕒 ${esc(closureText(e))}</p></div><span class="badge-state">In attesa</span></div><div class="pending-review-section"><strong>Chi ha eseguito</strong><p>${names.length?names.map(esc).join(' · '):'Operatore non indicato'}</p></div><div class="pending-review-section"><strong>Note finali</strong><div class="history-note ${e.note_lorenzo?'':'muted'}">${esc(e.note_lorenzo||'Nessuna nota inserita')}</div></div><div class="pending-review-section"><div class="pending-photo-head"><strong>Foto allegate</strong><span>${pics.length}</span></div><div class="pending-review-photos" data-extra-photos>${pics.length?'<span class="history-loading">Caricamento foto…</span>':'<p class="muted">Nessuna foto allegata.</p>'}</div></div><div class="actions">${re?'<button class="secondary" data-re>File Eurospin</button>':'<span class="muted">File Eurospin mancante</span>'}${ro?'<button class="secondary" data-ro>File Overgreen</button>':'<span class="muted">File Overgreen mancante</span>'}<button data-ok>Convalida</button></div>`;
    c.querySelector('[data-re]')?.addEventListener('click',()=>openAttachment(re));c.querySelector('[data-ro]')?.addEventListener('click',()=>openAttachment(ro));c.querySelector('[data-ok]').onclick=()=>approveExtra(e);$('pendingList').appendChild(c);if(pics.length)hydrateExtraPhotos(c,pics);
  }
}
async function approveIntervention(i){try{const sync=await interventionPhotoSyncState(i.id);if(sync.expected>sync.actual){alert(`Impossibile convalidare: sono state ricevute ${sync.actual} foto su ${sync.expected} attese.\n\nAttendi che il telefono del dipendente completi la sincronizzazione e premi Aggiorna.`);return}}catch(err){alert('Impossibile verificare le foto prima della convalida: '+(err?.message||err));return}const now=new Date().toISOString();const {error}=await sb.from('interventions').update({stato:'convalidato',convalidato_da:profile.id,convalidato_il:now}).eq('id',i.id);if(error)return alert(error.message);const {error:e2}=await sb.from('stores').update({ultimo_passaggio:interventionEndDate(i),next_visit_note:i.next_visit_note||null}).eq('id',i.store_id);if(e2)return alert(e2.message);const ids=[...(i.schedule_item_ids||[])];if(i.schedule_item_id&&!ids.includes(i.schedule_item_id))ids.push(i.schedule_item_id);if(ids.length){await sb.from('schedule_items').update({stato:'completato'}).in('id',ids);const linkedTickets=extras.filter(e=>ids.includes(e.schedule_item_id)&&isOrdinaryIncludedExtra(e)&&e.stato!=='completato');if(linkedTickets.length){const r=await sb.from('extras').update({stato:'completato',convalidato_da:profile.id,convalidato_il:now,closed_at:now}).in('id',linkedTickets.map(e=>e.id));if(r.error)return alert('Intervento convalidato, ma ticket/target incluso non aggiornato: '+r.error.message)}}toast('Intervento convalidato');await loadAll()}
async function rejectIntervention(i){const reason=prompt('Motivo del rifiuto','')||'';const {error}=await sb.from('interventions').update({stato:'rifiutato',motivo_rifiuto:reason,convalidato_da:profile.id,convalidato_il:new Date().toISOString()}).eq('id',i.id);if(error)return alert(error.message);const ids=[...(i.schedule_item_ids||[])];if(i.schedule_item_id&&!ids.includes(i.schedule_item_id))ids.push(i.schedule_item_id);const lastId=ids[ids.length-1];if(lastId)await sb.from('schedule_items').update({stato:'da_fare'}).eq('id',lastId);if(ids.length){const linkedTickets=extras.filter(e=>ids.includes(e.schedule_item_id)&&isOrdinaryIncludedExtra(e));if(linkedTickets.length)await sb.from('extras').update({stato:'programmato',closed_by:null,closed_at:null,convalidato_da:null,convalidato_il:null}).in('id',linkedTickets.map(e=>e.id))}toast('Intervento rifiutato');await loadAll()}

async function reopenOrdinaryIntervention(item,store){
  if(!admin()||!item)return;
  const closed=interventions
    .filter(i=>i.schedule_item_id===item.id&&i.stato==='convalidato')
    .sort((a,b)=>String(b.closed_at||b.created_at||'').localeCompare(String(a.closed_at||a.created_at||'')))[0];
  if(!closed)return alert('Non è stata trovata una chiusura convalidata da riaprire. Aggiorna i dati e riprova.');
  const reason=prompt(`Motivo della riapertura di ${store?.nome||'questo intervento'}:`,`Ora o fotografie da correggere`);
  if(reason===null)return;
  const message=`Riaperto da ${profile?.nome||'Lorenzo'} il ${new Intl.DateTimeFormat('it-IT',{dateStyle:'short',timeStyle:'short'}).format(new Date())}${String(reason||'').trim()?` · ${String(reason).trim()}`:''}`;
  if(!confirm('L’intervento tornerà “Da eseguire” per la squadra assegnata. La chiusura precedente resterà archiviata nello storico. Procedere?'))return;
  try{
    const r=await sb.from('interventions').update({stato:'rifiutato',motivo_rifiuto:message}).eq('id',closed.id);
    if(r.error)throw r.error;
    const sr=await sb.from('schedule_items').update({stato:'da_fare'}).eq('id',item.id);
    if(sr.error)throw sr.error;
    const {data:previous,error:previousError}=await sb.from('interventions').select('data_intervento').eq('store_id',closed.store_id).eq('stato','convalidato').neq('id',closed.id).order('data_intervento',{ascending:false}).limit(1);
    if(previousError)throw previousError;
    const storeUpdate=await sb.from('stores').update({ultimo_passaggio:previous?.[0]?.data_intervento||null}).eq('id',closed.store_id);
    if(storeUpdate.error)throw storeUpdate.error;
    toast('Intervento riaperto: il dipendente può richiuderlo');
    await loadAll();
  }catch(err){alert('Impossibile riaprire l’intervento: '+(err.message||String(err)))}
}


function scheduleAllItems(scheduleId){return scheduleItems.filter(i=>i.schedule_id===scheduleId&&i.tipo==='ordinario'&&i.store_id).sort((a,b)=>(a.posizione||0)-(b.posizione||0))}
function scheduleMemberIds(scheduleId){return scheduleMembers.filter(m=>m.schedule_id===scheduleId).map(m=>m.profile_id)}
function scheduleMemberNames(scheduleId){return scheduleMemberIds(scheduleId).map(id=>profiles.find(p=>p.id===id)?.nome).filter(Boolean)}
function scheduleIsHistorical(s){const items=scheduleAllItems(s.id);return !!items.length&&(s.giorno<today()||items.every(i=>effectiveScheduleState(i)==='completato'))}
function openScheduleHistory(){if(!admin())return;renderScheduleHistory();openDialog('scheduleHistoryDialog')}
function renderScheduleHistory(){
  const root=$('scheduleHistoryList');if(!root)return;root.innerHTML='';
  const list=schedules.filter(scheduleIsHistorical).sort((a,b)=>String(b.giorno).localeCompare(String(a.giorno)));
  if(!list.length){root.innerHTML='<div class="report-empty"><strong>Nessuna vecchia programmazione</strong><p class="muted">Quando completerai delle giornate, le ritroverai qui.</p></div>';return}
  for(const sch of list){
    const items=scheduleAllItems(sch.id),names=scheduleMemberNames(sch.id),storesIn=items.map(i=>stores.find(st=>st.id===i.store_id)).filter(Boolean),carried=items.filter(i=>i.stato==='riportato').length;
    const c=document.createElement('article');c.className='card schedule-history-card';
    c.innerHTML=`<div class="schedule-history-head"><div><span class="schedule-date-label">${fmt(sch.giorno)}</span><h3>${esc(names.join(' + ')||'Squadra non indicata')}</h3></div><strong>${items.length} sedi</strong></div>${carried?`<p class="muted"><strong>↪ ${carried} ${carried===1?'lavoro riportato':'lavori riportati'} al giorno successivo</strong></p>`:''}${sch.nota_generale?`<p class="muted">${esc(sch.nota_generale)}</p>`:''}<div class="schedule-history-stores">${storesIn.slice(0,8).map(st=>`<span>${esc(st.nome)}</span>`).join('')}${storesIn.length>8?`<span>+${storesIn.length-8}</span>`:''}</div><div class="actions"><button data-reuse>Riutilizza</button><button class="secondary" data-save-route>Salva come giro</button></div>`;
    c.querySelector('[data-reuse]').onclick=()=>openReuseScheduleDialog({type:'schedule',id:sch.id});
    c.querySelector('[data-save-route]').onclick=()=>saveScheduleAsRoute(sch);
    root.appendChild(c);
  }
}
async function saveScheduleAsRoute(schedule){
  if(!admin()||!schedule)return;const items=scheduleAllItems(schedule.id);if(!items.length)return alert('Questa programmazione non contiene sedi da salvare.');
  const suggested=`Giro ${fmt(schedule.giorno)}`;const name=prompt('Nome del giro salvato:',suggested);if(name===null)return;const clean=name.trim();if(!clean)return alert('Inserisci un nome per il giro.');
  try{
    const payload={nome:clean,nota:schedule.nota_generale||null,member_ids:scheduleMemberIds(schedule.id),creato_da:profile.id};
    const {data,error}=await sb.from('saved_routes').insert(payload).select().single();if(error)throw error;
    const r=await sb.from('saved_route_items').insert(items.map((i,pos)=>({route_id:data.id,store_id:i.store_id,posizione:pos+1})));if(r.error)throw r.error;
    toast(`Giro “${clean}” salvato`);await loadAll();
  }catch(err){const msg=String(err.message||err);if(msg.includes('saved_routes')||msg.includes('saved_route_items'))return alert('Database non aggiornato: esegui la migrazione V99 su Supabase e riprova.');alert(msg)}
}
function openSavedRoutes(){if(!admin())return;renderSavedRoutes();openDialog('savedRoutesDialog')}
function renderSavedRoutes(){
  const root=$('savedRoutesList');if(!root)return;root.innerHTML='';
  if(!savedRoutes.length){root.innerHTML='<div class="report-empty"><strong>Nessun giro salvato</strong><p class="muted">Apri lo storico di una programmazione e premi “Salva come giro”.</p></div>';return}
  for(const route of savedRoutes){
    const items=savedRouteItems.filter(i=>i.route_id===route.id).sort((a,b)=>(a.posizione||0)-(b.posizione||0)),names=(route.member_ids||[]).map(id=>profiles.find(p=>p.id===id)?.nome).filter(Boolean);
    const c=document.createElement('article');c.className='card saved-route-card';c.innerHTML=`<div class="schedule-history-head"><div><h3>${esc(route.nome)}</h3><p class="muted">${esc(names.join(' + ')||'Squadra da scegliere')}</p></div><strong>${items.length} sedi</strong></div>${route.nota?`<p class="muted">${esc(route.nota)}</p>`:''}<div class="schedule-history-stores">${items.slice(0,8).map(i=>stores.find(st=>st.id===i.store_id)).filter(Boolean).map(st=>`<span>${esc(st.nome)}</span>`).join('')}${items.length>8?`<span>+${items.length-8}</span>`:''}</div><div class="actions"><button data-use>Usa giro</button><button class="danger-btn" data-delete>Elimina</button></div>`;
    c.querySelector('[data-use]').onclick=()=>openReuseScheduleDialog({type:'route',id:route.id});
    c.querySelector('[data-delete]').onclick=()=>deleteSavedRoute(route);
    root.appendChild(c);
  }
}
async function deleteSavedRoute(route){if(!admin()||!route||!confirm(`Eliminare il giro “${route.nome}”?`))return;const {error}=await sb.from('saved_routes').delete().eq('id',route.id);if(error)return alert(error.message);toast('Giro eliminato');await loadAll();renderSavedRoutes()}
let reuseScheduleSource=null,reuseScheduleSelected=new Set();
function openReuseScheduleDialog(source){
  if(!admin())return;reuseScheduleSource=source;reuseScheduleSelected=new Set();$('reuseScheduleForm').reset();$('reuseScheduleDate').value=tomorrow();if($('reuseScheduleAutoRollover'))$('reuseScheduleAutoRollover').checked=true;
  let title='Riutilizza programmazione',note='',memberIds=[],itemStoreIds=[];
  if(source.type==='schedule'){
    const sch=schedules.find(x=>x.id===source.id);if(!sch)return;title=`Riutilizza ${fmt(sch.giorno)}`;note=sch.nota_generale||'';memberIds=scheduleMemberIds(sch.id);itemStoreIds=scheduleAllItems(sch.id).filter(i=>!source.onlyOpen||effectiveScheduleState(i)!=='completato').map(i=>i.store_id);
  }else{
    const route=savedRoutes.find(x=>x.id===source.id);if(!route)return;title=`Usa giro · ${route.nome}`;note=route.nota||'';memberIds=route.member_ids||[];itemStoreIds=savedRouteItems.filter(i=>i.route_id===route.id).sort((a,b)=>(a.posizione||0)-(b.posizione||0)).map(i=>i.store_id);
  }
  $('reuseScheduleTitle').textContent=title;$('reuseScheduleNote').value=note;reuseScheduleSelected=new Set(itemStoreIds);
  $('reuseScheduleWorkers').innerHTML=profiles.filter(p=>p.attivo).map(p=>`<label><input type="checkbox" value="${p.id}" ${memberIds.includes(p.id)?'checked':''}> ${esc(p.nome)}</label>`).join('');
  $('reuseScheduleSearch').value='';renderReuseScheduleStores();openDialog('reuseScheduleDialog');
}
function renderReuseScheduleStores(){
  const root=$('reuseScheduleStores');if(!root)return;const q=String($('reuseScheduleSearch')?.value||'').trim().toLowerCase();root.innerHTML='';
  const sourceOrder=new Map();if(reuseScheduleSource?.type==='schedule')scheduleAllItems(reuseScheduleSource.id).filter(i=>!reuseScheduleSource.onlyOpen||effectiveScheduleState(i)!=='completato').forEach((i,n)=>sourceOrder.set(i.store_id,n));else if(reuseScheduleSource?.type==='route')savedRouteItems.filter(i=>i.route_id===reuseScheduleSource.id).sort((a,b)=>(a.posizione||0)-(b.posizione||0)).forEach((i,n)=>sourceOrder.set(i.store_id,n));
  const rows=stores.filter(st=>[st.nome,st.citta,st.indirizzo,clientLabel(st.client_type)].some(v=>String(v||'').toLowerCase().includes(q))).sort((a,b)=>{const ai=sourceOrder.has(a.id)?sourceOrder.get(a.id):99999,bi=sourceOrder.has(b.id)?sourceOrder.get(b.id):99999;return ai-bi||String(a.nome).localeCompare(String(b.nome),'it')});
  for(const st of rows){const l=document.createElement('label');l.className='reuse-store-row';l.innerHTML=`<input type="checkbox" value="${st.id}" ${reuseScheduleSelected.has(st.id)?'checked':''}><span><strong>${esc(st.nome)}</strong><small>${esc([st.citta,clientLabel(st.client_type)].filter(Boolean).join(' · '))}</small></span>`;l.querySelector('input').onchange=e=>{e.target.checked?reuseScheduleSelected.add(st.id):reuseScheduleSelected.delete(st.id);updateReuseScheduleCount()};root.appendChild(l)}
  updateReuseScheduleCount();
}
function updateReuseScheduleCount(){if($('reuseScheduleCount'))$('reuseScheduleCount').textContent=`${reuseScheduleSelected.size} sedi selezionate`}
async function createScheduleFromReuse(){
  const date=$('reuseScheduleDate').value,members=[...$('reuseScheduleWorkers').querySelectorAll('input:checked')].map(x=>x.value);if(!date)return alert('Scegli la nuova data.');if(!members.length)return alert('Seleziona almeno una persona per la squadra.');if(!reuseScheduleSelected.size)return alert('Seleziona almeno una sede.');
  let ordered=[];if(reuseScheduleSource?.type==='schedule')ordered=scheduleAllItems(reuseScheduleSource.id).filter(i=>!reuseScheduleSource.onlyOpen||effectiveScheduleState(i)!=='completato').map(i=>i.store_id);else if(reuseScheduleSource?.type==='route')ordered=savedRouteItems.filter(i=>i.route_id===reuseScheduleSource.id).sort((a,b)=>(a.posizione||0)-(b.posizione||0)).map(i=>i.store_id);
  ordered=ordered.filter(id=>reuseScheduleSelected.has(id));for(const st of stores)if(reuseScheduleSelected.has(st.id)&&!ordered.includes(st.id))ordered.push(st.id);
  const {data,error}=await sb.from('schedules').insert({giorno:date,nota_generale:$('reuseScheduleNote').value.trim()||null,creato_da:profile.id,auto_rollover:$('reuseScheduleAutoRollover')?.checked!==false}).select().single();if(error)return alert(error.message);
  let r=await sb.from('schedule_members').insert(members.map(profile_id=>({schedule_id:data.id,profile_id})));if(r.error)return alert(r.error.message);
  r=await sb.from('schedule_items').insert(ordered.map((store_id,pos)=>({schedule_id:data.id,tipo:'ordinario',store_id,posizione:pos+1,stato:'da_fare'}))).select();if(r.error)return alert(r.error.message);
  let linkedCount=0;try{linkedCount=(await linkOrdinaryExtras(data.id,date,members,r.data||[])).length}catch(err){return alert('Programmazione creata, ma associazione extra non riuscita: '+err.message)}
  $('reuseScheduleDialog').close();$('scheduleHistoryDialog')?.close();$('savedRoutesDialog')?.close();toast(linkedCount?`Programmazione riutilizzata · ${linkedCount} extra associati`:'Programmazione riutilizzata');await loadAll();
}

function visibleSchedules(){return admin()?schedules:schedules.filter(s=>scheduleMembers.some(m=>m.schedule_id===s.id&&m.profile_id===profile.id))}
const helpPages={
  dashboard:{title:'Come usare la Dashboard',html:`<p>Questa schermata riassume il lavoro dell’azienda.</p><ul><li>Il dipendente vede separatamente i lavori assegnati per oggi e quelli dei prossimi giorni.</li><li>Tocca i riquadri in alto per vedere lavori di oggi, convalide e punti vendita scaduti.</li><li>Usa <strong>Ricerca globale</strong> per trovare punti vendita, extra o dipendenti.</li><li>Premi <strong>Aggiorna</strong> per scaricare manualmente i dati più recenti.</li></ul>`},
  stores:{title:'Come usare Punti vendita',html:`<p>Qui trovi l’anagrafica di tutti i punti vendita.</p><ul><li>I punti vendita già inseriti in una programmazione sono indicati come <strong>In programma</strong> e non risultano scaduti. Se vengono rimossi dal programma, lo stato viene ricalcolato automaticamente.</li><li>Tocca un punto vendita per aprire scheda, storico, note, foto e planimetrie.</li><li>Lorenzo può aggiungere o modificare i punti vendita.</li><li>Il pulsante <strong>Maps</strong> apre la navigazione verso l’indirizzo salvato.</li></ul>`},
  schedule:{title:'Come usare la Programmazione',html:`<p>Qui vengono mostrati soltanto i lavori ancora da eseguire.</p><ul><li>Lorenzo può creare una programmazione scegliendo data, squadra, sedi ed extra standalone, e aggiungere in seguito sedi, extra o attività con <strong>Aggiungi lavoro</strong>.</li><li>Le <strong>Attività</strong> servono per sopralluoghi, preventivi, incontri, ritiri e altri impegni non fatturati come intervento.</li><li>Le frecce <strong>↑ ↓</strong> cambiano l’ordine di esecuzione del dipendente.</li><li>Il pulsante <strong>Elimina</strong> rimuove un singolo punto vendita programmato, dopo conferma.</li><li><strong>Storico programmazioni</strong> permette di recuperare una vecchia giornata e riutilizzarla cambiando data, squadra e sedi.</li><li><strong>Giri salvati</strong> conserva i percorsi che usi spesso e li rende richiamabili in qualsiasi momento.</li><li>Con <strong>Continua automaticamente nei giorni successivi</strong>, i lavori non eseguiti vengono riportati al giorno corrente mantenendo squadra, ordine ed extra collegati.</li><li>Il dipendente preme <strong>Eseguito</strong> per chiudere il lavoro e allegare le foto. Data, ora e utente della chiusura vengono registrati automaticamente.</li></ul>`},
  reports:{title:'Come usare i Report',html:`<p>Seleziona una data per ricostruire tutta la giornata.</p><ul><li>Il riepilogo mostra interventi ordinari, extra, convalide, operatori, foto e documenti.</li><li>Puoi filtrare per tipologia e dipendente.</li><li>Apri foto, rapportini e schede dei punti vendita direttamente dal report.</li><li>Premi <strong>Condividi riepilogo</strong> per inviarlo su WhatsApp o copiarlo.</li><li>Usa <strong>PDF sintetico</strong> per l'elenco essenziale oppure <strong>PDF completo</strong> per includere note e fotografie.</li></ul>`},
  contacts:{title:'Come usare la Rubrica',html:`<p>Qui trovi i contatti di lavoro.</p><ul><li>Puoi registrare azienda, ruolo, telefono, email e competenze.</li><li>Ogni contatto può essere collegato a uno o più punti vendita o filiali.</li><li>I contatti possono essere richiamati nelle attività della programmazione.</li></ul>`},
  extras:{title:'Come usare gli Extra',html:`<p>Gli extra sono separati tra aperti ed eseguiti.</p><ul><li>Lorenzo crea l’extra, assegna la squadra e allega il PDF della richiesta.</li><li>Il dipendente chiude il lavoro caricando i file Eurospin e Overgreen. Data, ora e utente della chiusura vengono registrati automaticamente.</li><li>Lorenzo convalida l’extra e può successivamente modificarlo o eliminarlo.</li></ul>`},
  settings:{title:'Come usare le Impostazioni',html:`<p>Da questa schermata puoi gestire l’app e il tuo account.</p><ul><li><strong>Aggiorna dati</strong> scarica manualmente le informazioni più recenti.</li><li>Lorenzo può creare, modificare o disattivare gli utenti.</li><li><strong>Esci</strong> termina l’accesso sul dispositivo.</li></ul>`}
};
function openHelp(){const h=helpPages[currentView]||helpPages.dashboard;$('helpTitle').textContent=h.title;$('helpBody').innerHTML=h.html;openDialog('helpDialog')}
async function deleteScheduleItem(item,store){
  if(!admin())return;
  if(effectiveScheduleState(item)!=='da_fare')return alert('Questo intervento non può essere eliminato perché risulta già chiuso o in attesa.');
  if(!confirm(`Rimuovere “${store?.nome||'questo punto vendita'}” dalla programmazione?`))return;
  const linked=extras.filter(e=>e.schedule_item_id===item.id&&e.stato!=='completato');
  for(const e of linked){
    const r=await sb.from('extras').update({schedule_item_id:null}).eq('id',e.id);
    if(r.error)return alert('Impossibile scollegare un extra associato: '+r.error.message);
    e.schedule_item_id=null;
  }
  const {data:deleted,error}=await sb.from('schedule_items').delete().eq('id',item.id).select('id');
  if(error)return alert('Eliminazione non riuscita: '+error.message);
  if(!deleted?.length){
    await loadAll();
    return alert('Il record non è stato eliminato. Controlla i permessi Supabase della tabella schedule_items.');
  }
  scheduleItems=scheduleItems.filter(x=>x.id!==item.id);
  const remaining=scheduleItems.filter(x=>x.schedule_id===item.schedule_id);
  if(remaining.length){
    const ordered=remaining.filter(x=>effectiveScheduleState(x)!=='completato').sort((a,b)=>(a.posizione||0)-(b.posizione||0));
    for(let index=0;index<ordered.length;index++){
      const wanted=index+1,current=ordered[index];
      if(current.posizione===wanted)continue;
      const r=await sb.from('schedule_items').update({posizione:wanted}).eq('id',current.id);
      if(r.error)return alert('Punto eliminato, ma non riesco a rinumerare il giro: '+r.error.message);
      current.posizione=wanted;
    }
  }
  if(!remaining.length){
    let r=await sb.from('schedule_members').delete().eq('schedule_id',item.schedule_id);if(r.error)return alert(r.error.message);
    r=await sb.from('schedules').delete().eq('id',item.schedule_id);if(r.error)return alert(r.error.message);
    scheduleMembers=scheduleMembers.filter(x=>x.schedule_id!==item.schedule_id);
    schedules=schedules.filter(x=>x.id!==item.schedule_id);
  }
  toast(linked.length?'Punto vendita rimosso · extra scollegati':'Punto vendita rimosso dalla programmazione');
  renderSchedules();renderDashboard();renderStores();
  await loadAll();
}

async function moveScheduleItem(item,direction){
  if(!admin())return;const siblings=scheduleItems.filter(x=>x.schedule_id===item.schedule_id&&x.stato!=='completato').sort((a,b)=>(a.posizione||0)-(b.posizione||0));const at=siblings.findIndex(x=>x.id===item.id),swap=siblings[at+direction];if(at<0||!swap)return;
  const p1=item.posizione||at+1,p2=swap.posizione||at+direction+1;
  let r=await sb.from('schedule_items').update({posizione:p2}).eq('id',item.id);if(r.error)return alert(r.error.message);r=await sb.from('schedule_items').update({posizione:p1}).eq('id',swap.id);if(r.error)return alert(r.error.message);toast('Ordine aggiornato');await loadAll();
}

async function persistScheduleOrder(scheduleId,orderedJobs){
  if(!admin()||!scheduleId||!Array.isArray(orderedJobs)||!orderedJobs.length)return;
  for(let index=0;index<orderedJobs.length;index++){
    const job=orderedJobs[index],wanted=index+1;
    if(job.kind==='ordinary'){
      if(Number(job.row.posizione)===wanted)continue;
      const {error}=await sb.from('schedule_items').update({posizione:wanted}).eq('id',job.row.id).eq('schedule_id',scheduleId);if(error)throw error;job.row.posizione=wanted;
    }else if(job.kind==='extra'){
      if(Number(job.row.posizione_giro)===wanted)continue;
      const {error}=await sb.from('extras').update({posizione_giro:wanted}).eq('id',job.row.id).eq('schedule_id',scheduleId);if(error)throw error;job.row.posizione_giro=wanted;
    }else{
      if(Number(job.row.posizione)===wanted)continue;
      const {error}=await sb.from('schedule_activities').update({posizione:wanted}).eq('id',job.row.id).eq('schedule_id',scheduleId);if(error)throw error;job.row.posizione=wanted;
    }
  }
}
function enableScheduleDrag(container,schedule){
  if(!admin()||!container||!schedule)return;
  // Se è attivo un filtro cliente vediamo solo una parte del giro:
  // riordinare quella porzione produrrebbe posizioni ambigue sul giro completo.
  if(scheduleClientFilter!=='all')return;
  let dragging=null,placeholder=null,startY=0,startTop=0,pointerId=null,moved=false;
  const rows=()=>[...container.querySelectorAll('.schedule-item[data-schedule-item-id], .schedule-item[data-schedule-extra-id], .schedule-item[data-schedule-activity-id]')];
  const cleanup=()=>{
    if(dragging){dragging.classList.remove('dragging');dragging.style.transform='';dragging.style.width='';dragging.style.zIndex='';}
    placeholder?.remove();dragging=null;placeholder=null;pointerId=null;moved=false;
    document.body.classList.remove('schedule-drag-active');
  };
  container.querySelectorAll('[data-drag-handle]').forEach(handle=>{
    handle.addEventListener('pointerdown',ev=>{
      if(ev.button!==undefined&&ev.button!==0)return;
      const row=handle.closest('.schedule-item[data-schedule-item-id], .schedule-item[data-schedule-extra-id], .schedule-item[data-schedule-activity-id]');if(!row)return;
      ev.preventDefault();ev.stopPropagation();
      pointerId=ev.pointerId;handle.setPointerCapture?.(pointerId);
      const rect=row.getBoundingClientRect();startY=ev.clientY;startTop=rect.top;
      placeholder=document.createElement('div');placeholder.className='schedule-drag-placeholder';placeholder.style.height=rect.height+'px';
      row.after(placeholder);dragging=row;dragging.classList.add('dragging');dragging.style.width=rect.width+'px';dragging.style.zIndex='1000';
      document.body.classList.add('schedule-drag-active');
    });
    handle.addEventListener('pointermove',ev=>{
      if(!dragging||ev.pointerId!==pointerId)return;
      ev.preventDefault();moved=true;
      const dy=ev.clientY-startY;dragging.style.transform=`translateY(${dy}px)`;
      const center=startTop+dy+dragging.getBoundingClientRect().height/2;
      const candidates=rows().filter(x=>x!==dragging);
      let before=null;
      for(const candidate of candidates){const r=candidate.getBoundingClientRect();if(center<r.top+r.height/2){before=candidate;break}}
      if(before)container.insertBefore(placeholder,before);else container.appendChild(placeholder);
      const edge=70;if(ev.clientY<edge)window.scrollBy(0,-12);else if(ev.clientY>window.innerHeight-edge)window.scrollBy(0,12);
    });
    const finish=async ev=>{
      if(!dragging||ev.pointerId!==pointerId)return;
      ev.preventDefault();

      // IMPORTANTE: cleanup() azzera "moved".
      // Salviamo prima lo stato del trascinamento, altrimenti il drop
      // viene sempre interpretato come un semplice tap e non viene persistito.
      const didMove=moved;
      const row=dragging;
      if(placeholder)container.insertBefore(row,placeholder);
      cleanup();
      if(!didMove)return;

      const orderedRows=rows();
      const orderedJobs=orderedRows.map(r=>{
        if(r.dataset.scheduleItemId){const row=scheduleItems.find(i=>i.id===r.dataset.scheduleItemId);return row?{kind:'ordinary',row}:null}
        if(r.dataset.scheduleExtraId){const row=extras.find(e=>e.id===r.dataset.scheduleExtraId);return row?{kind:'extra',row}:null}
        if(r.dataset.scheduleActivityId){const row=scheduleActivities.find(a=>a.id===r.dataset.scheduleActivityId);return row?{kind:'activity',row}:null}
        return null;
      }).filter(Boolean);

      try{
        await persistScheduleOrder(schedule.id,orderedJobs);
        orderedRows.forEach((r,i)=>{const n=r.querySelector('.schedule-order-number');if(n)n.textContent=String(i+1);const b=r.querySelector('.schedule-next-visit strong');if(r.dataset.scheduleExtraId&&b)b.textContent=`🔧 Extra standalone della giornata · posizione ${i+1}`;});

        toast('Ordine del giro salvato');
        renderDashboard();
      }catch(error){
        alert('Non riesco a salvare il nuovo ordine: '+(error?.message||String(error)));
        await loadAll();
      }
    };
    handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
  });
}
function openAddScheduleItems(schedule){
  if(!admin())return;
  $('addScheduleItemsForm').reset();$('addScheduleId').value=schedule.id;
  const names=scheduleMembers.filter(m=>m.schedule_id===schedule.id).map(m=>profiles.find(p=>p.id===m.profile_id)?.nome).filter(Boolean);
  $('addScheduleInfo').textContent=`${fmt(schedule.giorno)} · ${names.join(' + ')||'Squadra non indicata'}`;
  renderAddSchedulePicker();openDialog('addScheduleItemsDialog');
}
function renderAddSchedulePicker(){
  const scheduleId=$('addScheduleId').value,q=($('addScheduleSearch').value||'').toLowerCase(),box=$('addScheduleStores');if(!box)return;
  const already=new Set(scheduleItems.filter(i=>i.schedule_id===scheduleId).map(i=>i.store_id));
  const selected=new Set([...box.querySelectorAll('input:checked')].map(x=>x.value));box.innerHTML='';
  const available=stores.filter(st=>!already.has(st.id)&&[st.nome,st.citta,st.indirizzo,storeSiteTypeLabel(st)].some(v=>String(v||'').toLowerCase().includes(q))).sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'it'));
  for(const st of available){const l=document.createElement('label');l.innerHTML=`<input type="checkbox" value="${st.id}" ${selected.has(st.id)?'checked':''}><span><strong>${esc(st.nome)}</strong><br><small>${esc([storeSiteTypeLabel(st),st.citta,st.indirizzo].filter(Boolean).join(' · '))}</small></span>`;box.appendChild(l)}
  const existingExtras=existingExtrasForSchedulePicker(scheduleId).filter(e=>!q||schedulePlannerExtraSearchText(e).includes(q)).sort((a,b)=>String(a.titolo||'').localeCompare(String(b.titolo||''),'it'));
  for(const e of existingExtras){
    const value=`extra:${e.id}`,l=document.createElement('label'),st=stores.find(s=>s.id===e.store_id),oldSchedule=e.schedule_id?schedules.find(s=>s.id===e.schedule_id):null;
    const oldDate=oldSchedule?.giorno||e.giorno_intervento||null;
    const placement=oldSchedule?`⚠ Già programmato il ${fmt(oldDate)} · verrà spostato in questa giornata`:oldDate?`Data attuale ${fmt(oldDate)} · verrà assegnato a questa giornata`:'Extra aperto · non ancora programmato';
    l.innerHTML=`<input type="checkbox" value="${value}" ${selected.has(value)?'checked':''}><span><strong>🔧 ${esc(e.titolo||'Extra')}</strong><br><small>${esc([clientLabel(e),e.numero_target?`Target/Ticket ${e.numero_target}`:null,st?.nome||e.nome_esterno||e.indirizzo_esterno||'Extra senza sede'].filter(Boolean).join(' · '))}</small><br><small class="muted">${esc(placement)}</small></span>`;
    box.appendChild(l)
  }
  if(!available.length&&!existingExtras.length)box.innerHTML='<p class="muted">Nessun altro lavoro disponibile.</p>';
}
function extraMatchesScheduleDate(e){
  if(scheduleExactDate)return e.giorno_intervento===scheduleExactDate;
  if(scheduleDateFilter==='all')return true;
  if(scheduleDateFilter==='today')return e.giorno_intervento===today();
  if(scheduleDateFilter==='tomorrow')return e.giorno_intervento===tomorrow();
  if(scheduleDateFilter==='week'){const now=new Date(today()+'T12:00:00'),end=new Date(now);end.setDate(end.getDate()+7);const d=new Date(e.giorno_intervento+'T12:00:00');return d>=now&&d<=end}
  return true;
}
function scheduleClientMatchesStore(store){return scheduleClientFilter==='all'||String(store?.client_type||'eurospin')===scheduleClientFilter}
function scheduleClientBadge(store){const type=String(store?.client_type||'eurospin');return `<span class="client-pill ${type}">${esc(clientLabel(type))}</span>`}
let schedulePickerSelected=new Set();
let schedulePickerMode='all';
let schedulePickerLetter='';
function selectedScheduleStoreIds(){return [...schedulePickerSelected]}
function setSchedulePickerValue(value,checked){if(checked)schedulePickerSelected.add(value);else schedulePickerSelected.delete(value);updateScheduleSelectedCount()}
function updateScheduleSelectedCount(){const count=schedulePickerSelected.size;if($('scheduleSelectedCount'))$('scheduleSelectedCount').textContent=`${count} selezionat${count===1?'o':'i'}`;if($('scheduleSubmitBtn'))$('scheduleSubmitBtn').textContent=count?`Aggiungi ${count} lavor${count===1?'o':'i'} alla giornata`:'Aggiungi lavori alla giornata'}
function resetSchedulePickerSelection(){schedulePickerSelected.clear();schedulePickerMode='all';schedulePickerLetter='';if($('scheduleSearch'))$('scheduleSearch').value='';updateScheduleSelectedCount()}
function schedulePickerMatchesStore(st,q,pickerClient){
  if(pickerClient!=='all'&&String(st.client_type||'eurospin')!==pickerClient)return false;
  if(schedulePickerLetter&&!String(st.nome||'').trim().toLocaleUpperCase('it').startsWith(schedulePickerLetter))return false;
  if(q&&![st.nome,st.citta,st.indirizzo,st.note,clientLabel(st.client_type),storeSiteTypeLabel(st)].some(v=>String(v||'').toLowerCase().includes(q)))return false;
  return schedulePickerMode!=='selected'||schedulePickerSelected.has(st.id);
}
function schedulePickerMatchesExtra(e,q,pickerClient){
  const value=`extra:${e.id}`;
  if(pickerClient!=='all'&&clientType(e)!==pickerClient)return false;
  if(schedulePickerLetter&&!String(e.titolo||'Extra').trim().toLocaleUpperCase('it').startsWith(schedulePickerLetter))return false;
  if(q&&!schedulePlannerExtraSearchText(e).includes(q))return false;
  return schedulePickerMode!=='selected'||schedulePickerSelected.has(value);
}
function selectAllSchedulePickerResults(){
  const q=String($('scheduleSearch')?.value||'').trim().toLowerCase(),pickerClient=$('schedulePickerClient')?.value||'all';
  stores.filter(st=>schedulePickerMatchesStore(st,q,pickerClient)).forEach(st=>schedulePickerSelected.add(st.id));
  standaloneExtrasForPlanner().filter(e=>schedulePickerMatchesExtra(e,q,pickerClient)).forEach(e=>schedulePickerSelected.add(`extra:${e.id}`));
  renderSchedulePicker();
}
function renderScheduleUnplannedSummary(){const root=$('scheduleUnplannedSummary');if(!root)return;const openExtras=extras.filter(e=>e.stato!=='completato'&&!extraIsScheduled(e)).length;const dueStores=stores.filter(st=>!isStoreProgrammed(st.id)&&['due','warning'].includes(status(st))).length;root.innerHTML=`<span><strong>${dueStores}</strong>Sedi da programmare</span><span><strong>${openExtras}</strong>Extra senza programma</span>`}
async function editScheduleDayNote(schedule){
  if(!admin()||!schedule)return;
  const current=schedule.nota_generale||'';
  const value=prompt('Nota generale della giornata:',current);
  if(value===null)return;
  const note=value.trim()||null;
  const {error}=await sb.from('schedules').update({nota_generale:note}).eq('id',schedule.id);
  if(error)return alert(error.message);
  schedule.nota_generale=note;
  toast(note?'Nota della giornata aggiornata':'Nota della giornata eliminata');
  renderSchedules();renderDashboard();
}
function openEditScheduleDate(schedule){
  if(!admin()||!schedule)return;
  $('editScheduleDateId').value=schedule.id;
  $('editScheduleDateValue').value=schedule.giorno||today();
  $('editScheduleDateInfo').textContent=`Data attuale: ${fmt(schedule.giorno)} · ${scheduleMemberNames(schedule.id).join(' + ')||'Squadra non indicata'}`;
  openDialog('editScheduleDateDialog');
}
async function saveEditScheduleDate(){
  if(!admin())return;
  const scheduleId=$('editScheduleDateId').value,newDate=$('editScheduleDateValue').value;
  const schedule=schedules.find(s=>s.id===scheduleId);
  if(!schedule||!newDate)return alert('Seleziona una data valida.');
  const oldDate=schedule.giorno;
  if(newDate===oldDate){$('editScheduleDateDialog').close();return toast('La data è già quella selezionata')}
  const sameDay=schedules.filter(s=>s.id!==scheduleId&&s.giorno===newDate);
  if(sameDay.length){
    const labels=sameDay.slice(0,5).map(s=>scheduleMemberNames(s.id).join(' + ')||'Squadra non indicata').join('\n• ');
    if(!confirm(`Il ${fmt(newDate)} esist${sameDay.length===1?'e':'ono'} già ${sameDay.length} programmazion${sameDay.length===1?'e':'i'}:\n\n• ${labels}${sameDay.length>5?'\n• …':''}\n\nVuoi comunque spostare questa programmazione? Le altre non verranno modificate.`))return;
  }
  const itemIds=scheduleItems.filter(i=>i.schedule_id===scheduleId).map(i=>i.id);
  const standaloneExtraIds=extras.filter(e=>e.schedule_id===scheduleId&&e.giorno_intervento===oldDate).map(e=>e.id);
  const linkedExtraIds=extras.filter(e=>e.schedule_item_id&&itemIds.includes(e.schedule_item_id)&&e.giorno_intervento===oldDate).map(e=>e.id);
  const extraIds=[...new Set([...standaloneExtraIds,...linkedExtraIds])];
  const btn=$('editScheduleDateForm').querySelector('[type=submit]'),oldText=btn.textContent;btn.disabled=true;btn.textContent='Spostamento…';
  try{
    let r=await sb.from('schedules').update({giorno:newDate}).eq('id',scheduleId);if(r.error)throw r.error;
    if(extraIds.length){r=await sb.from('extras').update({giorno_intervento:newDate}).in('id',extraIds);if(r.error){await sb.from('schedules').update({giorno:oldDate}).eq('id',scheduleId);throw r.error}}
    schedule.giorno=newDate;
    extras.filter(e=>extraIds.includes(e.id)).forEach(e=>e.giorno_intervento=newDate);
    $('editScheduleDateDialog').close();toast(`Programmazione spostata al ${fmt(newDate)}`);await loadAll();
  }catch(err){alert('Impossibile cambiare la data: '+(err.message||String(err)))}finally{btn.disabled=false;btn.textContent=oldText}
}
function openEditScheduleTeam(schedule){
  if(!admin()||!schedule)return;
  const box=$('editScheduleTeamWorkers');if(!box)return;
  $('editScheduleTeamId').value=schedule.id;
  const current=new Set(scheduleMemberIds(schedule.id));
  box.innerHTML=profiles.filter(p=>p.attivo).map(p=>`<label><input type="checkbox" value="${p.id}" ${current.has(p.id)?'checked':''}> ${esc(p.nome)}</label>`).join('');
  $('editScheduleTeamInfo').textContent=`${fmt(schedule.giorno)} · ${scheduleMemberNames(schedule.id).join(' + ')||'Squadra non indicata'}`;
  openDialog('editScheduleTeamDialog');
}
async function saveEditScheduleTeam(){
  if(!admin())return;
  const scheduleId=$('editScheduleTeamId').value;
  const memberIds=[...$('editScheduleTeamWorkers').querySelectorAll('input:checked')].map(x=>x.value);
  if(!memberIds.length)return alert('Seleziona almeno un dipendente per la giornata.');
  const current=new Set(scheduleMemberIds(scheduleId)),wanted=new Set(memberIds);
  const toAdd=memberIds.filter(id=>!current.has(id)),toRemove=[...current].filter(id=>!wanted.has(id));
  try{
    if(toAdd.length){const r=await sb.from('schedule_members').insert(toAdd.map(profile_id=>({schedule_id:scheduleId,profile_id})));if(r.error)throw r.error}
    for(const profileId of toRemove){const r=await sb.from('schedule_members').delete().eq('schedule_id',scheduleId).eq('profile_id',profileId);if(r.error)throw r.error}
    $('editScheduleTeamDialog').close();toast('Squadra della giornata aggiornata');await loadAll();
  }catch(err){alert('Impossibile aggiornare la squadra: '+(err.message||String(err)))}
}

const ACTIVITY_TYPES={sopralluogo:{icon:'🔎',label:'Sopralluogo'},incontro:{icon:'🤝',label:'Incontro di lavoro'},preventivo:{icon:'📋',label:'Preventivo'},ritiro:{icon:'🚚',label:'Ritiro / consegna'},manutenzione:{icon:'🔧',label:'Controllo / manutenzione'},altro:{icon:'📌',label:'Altro'}};
function activityTypeMeta(type){return ACTIVITY_TYPES[type]||ACTIVITY_TYPES.altro}
function fillActivitySelectors(activity=null){
  const contactSel=$('activityContact'),storeSel=$('activityStore');
  if(contactSel)contactSel.innerHTML='<option value="">Nessun contatto</option>'+workContacts.filter(c=>c.attivo!==false).map(c=>`<option value="${c.id}">${esc(c.nome)}${c.azienda?' · '+esc(c.azienda):''}</option>`).join('');
  if(storeSel)storeSel.innerHTML='<option value="">Nessuna sede</option>'+stores.slice().sort((a,b)=>String(a.nome).localeCompare(String(b.nome),'it')).map(st=>`<option value="${st.id}">${esc(st.nome)} · ${esc(clientLabel(st))}</option>`).join('');
  if(activity){if(contactSel)contactSel.value=activity.contact_id||'';if(storeSel)storeSel.value=activity.store_id||''}
}
function openScheduleActivityDialog(schedule,activity=null){
  if(!admin()||!schedule)return;
  $('activityForm').reset();$('activityId').value=activity?.id||'';$('activityScheduleId').value=schedule.id;$('activityType').value=activity?.tipo||'sopralluogo';$('activityTitle').value=activity?.titolo||'';$('activityTime').value=activity?.ora?String(activity.ora).slice(0,5):'';$('activityAddress').value=activity?.indirizzo||'';$('activityNotes').value=activity?.note||'';fillActivitySelectors(activity);$('activityDialogTitle').textContent=activity?'Modifica attività':'Nuova attività';$('activityScheduleInfo').textContent=`${fmt(schedule.giorno)} · ${scheduleMemberNames(schedule.id).join(' + ')||'Squadra non indicata'}`;openDialog('activityDialog');
}
async function saveScheduleActivity(){
  if(!admin())return;const scheduleId=$('activityScheduleId').value,id=$('activityId').value;
  const payload={schedule_id:scheduleId,tipo:$('activityType').value,titolo:$('activityTitle').value.trim(),ora:$('activityTime').value||null,indirizzo:$('activityAddress').value.trim()||null,note:$('activityNotes').value.trim()||null,contact_id:$('activityContact').value||null,store_id:$('activityStore').value||null,stato:'da_fare',creato_da:profile.id};
  if(!payload.titolo)return alert('Inserisci un titolo per l’attività.');
  let r;if(id)r=await sb.from('schedule_activities').update({...payload,stato:scheduleActivities.find(a=>a.id===id)?.stato||'da_fare'}).eq('id',id);else r=await sb.from('schedule_activities').insert({...payload,posizione:nextScheduleRoutePosition(scheduleId)});
  if(r.error){
    console.error('V112-30 - errore salvataggio attività:',{error:r.error,payload,id,scheduleId});
    const parts=[
      'Errore salvataggio attività',
      r.error.message||'Errore sconosciuto',
      r.error.details?'Dettagli: '+r.error.details:null,
      r.error.hint?'Hint: '+r.error.hint:null,
      r.error.code?'Codice: '+r.error.code:null
    ].filter(Boolean);
    return alert(parts.join('\n\n'));
  }
  $('activityDialog').close();toast(id?'Attività aggiornata':'Attività aggiunta alla giornata');await loadAll();
}
function activityPhotosFor(id){return scheduleActivityPhotos.filter(p=>p.activity_id===id)}
function resetActivityCompletePhotos(){activityCompletePhotoFiles=[];const box=$('activityCompletePhotoPreview'),label=$('activityCompletePhotoLabel'),clear=$('clearActivityCompletePhotos');if(box)box.innerHTML='';if(label)label.textContent='Nessuna foto';if(clear)clear.classList.add('hidden')}
function renderActivityCompletePhotoPreview(){const box=$('activityCompletePhotoPreview'),label=$('activityCompletePhotoLabel'),clear=$('clearActivityCompletePhotos');if(!box||!label)return;box.innerHTML='';label.textContent=activityCompletePhotoFiles.length?`${activityCompletePhotoFiles.length} foto selezionat${activityCompletePhotoFiles.length===1?'a':'e'}`:'Nessuna foto';clear?.classList.toggle('hidden',!activityCompletePhotoFiles.length);for(const f of activityCompletePhotoFiles){const card=document.createElement('div');card.className='ordinary-photo-thumb';const img=document.createElement('img');img.src=URL.createObjectURL(f);img.alt='Anteprima';img.onload=()=>URL.revokeObjectURL(img.src);card.appendChild(img);box.appendChild(card)}}
function addActivityCompletePhotos(files){for(const f of [...files||[]])if(f?.type?.startsWith('image/'))activityCompletePhotoFiles.push(f);renderActivityCompletePhotoPreview()}
function openActivityCompleteDialog(a){if(!a)return;resetActivityCompletePhotos();$('activityCompleteId').value=a.id;$('activityCompleteTitle').textContent=`${activityTypeMeta(a.tipo).icon} ${a.titolo||activityTypeMeta(a.tipo).label}`;$('activityCompleteNotes').value=a.completion_notes||'';openDialog('activityCompleteDialog')}
async function uploadScheduleActivityPhoto(activityId,originalFile){const file=await compressImage(originalFile),safe=(file.name||originalFile.name||'foto.jpg').replace(/[^a-zA-Z0-9._-]/g,'-'),path=`attivita/${activityId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;await uploadFile(path,file);const {data,error}=await sb.from('schedule_activity_photos').insert({activity_id:activityId,storage_path:path,nome_file:file.name||originalFile.name,mime_type:file.type||'image/jpeg',dimensione_bytes:file.size,caricato_da:profile.id}).select().single();if(error){await sb.storage.from('documenti').remove([path]);throw error}scheduleActivityPhotos.push(data);return data}
async function saveActivityCompletion(){const id=$('activityCompleteId').value,a=scheduleActivities.find(x=>x.id===id);if(!a)return;const btn=$('activityCompleteForm').querySelector('[type=submit]'),old=btn.textContent;btn.disabled=true;try{const notes=$('activityCompleteNotes').value.trim()||null,now=new Date().toISOString();let r=await sb.from('schedule_activities').update({stato:'completato',completed_at:now,completed_by:profile.id,completion_notes:notes}).eq('id',id);if(r.error)throw r.error;for(let n=0;n<activityCompletePhotoFiles.length;n++){btn.textContent=`Carico foto ${n+1}/${activityCompletePhotoFiles.length}…`;await uploadScheduleActivityPhoto(id,activityCompletePhotoFiles[n])}$('activityCompleteDialog').close();toast(`Attività completata${activityCompletePhotoFiles.length?' · '+activityCompletePhotoFiles.length+' foto':''}`);resetActivityCompletePhotos();await loadAll()}catch(err){alert('Chiusura attività non riuscita: '+(err.message||String(err)))}finally{btn.disabled=false;btn.textContent=old}}
async function reopenScheduleActivity(a){if(!a||!confirm(`Riaprire “${a.titolo||'questa attività'}”? Tornerà tra le attività da fare.`))return;const r=await sb.from('schedule_activities').update({stato:'da_fare',completed_at:null,completed_by:null}).eq('id',a.id);if(r.error)return alert(r.error.message);toast('Attività riaperta');$('activityHistoryDialog')?.close();await loadAll()}
function openActivityConsuntivoDialog(a){if(!a)return;$('activityConsuntivoId').value=a.id;$('activityConsuntivoTitle').textContent=a.titolo||activityTypeMeta(a.tipo).label;$('activityConsuntivoMinutes').value=a.consuntivo_minutes??'';$('activityConsuntivoKm').value=a.consuntivo_km??'';$('activityConsuntivoSpese').value=a.consuntivo_spese??'';$('activityConsuntivoOutcome').value=a.consuntivo_esito||'';$('activityConsuntivoNotes').value=a.consuntivo_note||'';openDialog('activityConsuntivoDialog')}
async function saveActivityConsuntivo(){const id=$('activityConsuntivoId').value,a=scheduleActivities.find(x=>x.id===id);if(!a)return;const payload={consuntivo_minutes:$('activityConsuntivoMinutes').value?Number($('activityConsuntivoMinutes').value):null,consuntivo_km:$('activityConsuntivoKm').value?Number($('activityConsuntivoKm').value):null,consuntivo_spese:$('activityConsuntivoSpese').value?Number($('activityConsuntivoSpese').value):null,consuntivo_esito:$('activityConsuntivoOutcome').value.trim()||null,consuntivo_note:$('activityConsuntivoNotes').value.trim()||null,consuntivato_at:new Date().toISOString(),consuntivato_da:profile.id};const r=await sb.from('schedule_activities').update(payload).eq('id',id);if(r.error)return alert(r.error.message);$('activityConsuntivoDialog').close();toast('Consuntivo salvato');await loadAll();renderActivityHistory()}
async function signedActivityPhotoUrl(p){const {data,error}=await sb.storage.from('documenti').createSignedUrl(p.storage_path,900);if(error)throw error;return data.signedUrl}
function openActivityHistory(){renderActivityHistory();openDialog('activityHistoryDialog')}
function renderActivityHistory(){const box=$('activityHistoryList');if(!box)return;const q=String($('activityHistorySearch')?.value||'').trim().toLowerCase(),filter=$('activityHistoryFilter')?.value||'all';let rows=scheduleActivities.filter(a=>a.stato==='completato').sort((a,b)=>String(b.completed_at||'').localeCompare(String(a.completed_at||'')));if(filter==='pending')rows=rows.filter(a=>!a.consuntivato_at);if(filter==='done')rows=rows.filter(a=>!!a.consuntivato_at);if(q)rows=rows.filter(a=>{const st=stores.find(x=>x.id===a.store_id),ct=workContacts.find(x=>x.id===a.contact_id);return [a.titolo,a.indirizzo,a.completion_notes,a.consuntivo_esito,a.consuntivo_note,st?.nome,st?.citta,ct?.nome,ct?.azienda].filter(Boolean).join(' ').toLowerCase().includes(q)});box.innerHTML='';if(!rows.length){box.innerHTML='<div class="card report-empty"><strong>Nessuna attività trovata</strong><p class="muted">Non ci sono attività concluse con questi filtri.</p></div>';return}for(const a of rows){const st=stores.find(x=>x.id===a.store_id),type=activityTypeMeta(a.tipo),photos=activityPhotosFor(a.id),c=document.createElement('article');c.className='card';c.innerHTML=`<div class="card-top"><div><span class="activity-pill">${type.icon} ${esc(type.label)}</span><h3>${esc(a.titolo||type.label)}</h3><p class="muted">${a.completed_at?new Date(a.completed_at).toLocaleString('it-IT'):'Data non disponibile'}${st?' · '+esc(st.nome):a.indirizzo?' · '+esc(a.indirizzo):''}</p></div><span class="${a.consuntivato_at?'status-ok':'pending'}">${a.consuntivato_at?'✓ Consuntivata':'Da consuntivare'}</span></div>${a.completion_notes?`<div class="schedule-next-visit"><strong>Note esecuzione</strong><p>${esc(a.completion_notes)}</p></div>`:''}${a.consuntivo_esito||a.consuntivo_note?`<div class="schedule-next-visit"><strong>Consuntivo</strong>${a.consuntivo_esito?`<p><b>Esito:</b> ${esc(a.consuntivo_esito)}</p>`:''}${a.consuntivo_note?`<p>${esc(a.consuntivo_note)}</p>`:''}</div>`:''}<p class="muted">📷 ${photos.length} foto${a.consuntivo_minutes!=null?' · ⏱ '+a.consuntivo_minutes+' min':''}${a.consuntivo_km!=null?' · 🚐 '+a.consuntivo_km+' km':''}${a.consuntivo_spese!=null?' · € '+Number(a.consuntivo_spese).toFixed(2):''}</p><div class="pending-review-photos" data-activity-photos></div><div class="actions"><button data-consuntiva>${a.consuntivato_at?'Modifica consuntivo':'Consuntiva'}</button><button class="secondary" data-reopen-activity>↩ Riapri</button></div>`;c.querySelector('[data-consuntiva]').onclick=()=>openActivityConsuntivoDialog(a);c.querySelector('[data-reopen-activity]').onclick=()=>reopenScheduleActivity(a);const gallery=c.querySelector('[data-activity-photos]');for(const p of photos){const b=document.createElement('button');b.type='button';b.className='pending-review-photo';b.innerHTML='<span>📷</span>';signedActivityPhotoUrl(p).then(url=>{b.innerHTML=`<img src="${url}" alt="${esc(p.nome_file||'Foto attività')}" loading="lazy"><span>Apri</span>`;b.onclick=()=>window.open(url,'_blank')}).catch(()=>{});gallery.appendChild(b)}box.appendChild(c)}}
async function completeScheduleActivity(a){openActivityCompleteDialog(a)}
async function deleteScheduleActivity(a){if(!admin()||!confirm(`Eliminare “${a.titolo||'questa attività'}” dalla giornata?`))return;const r=await sb.from('schedule_activities').delete().eq('id',a.id);if(r.error)return alert(r.error.message);toast('Attività eliminata');await loadAll()}
function openNewExtraForSchedule(schedule){if(!admin()||!schedule)return;$('addScheduleItemsDialog')?.close();$('newExtraBtn')?.click();setTimeout(()=>{$('extraDate').value=schedule.giorno;const ids=new Set(scheduleMemberIds(schedule.id));$('extraWorkers').querySelectorAll('input').forEach(x=>x.checked=ids.has(x.value));},0)}
function openProgramExtraDialog(extra){if(!admin()||!extra)return;$('programExtraForm').reset();$('programExtraId').value=extra.id;$('programExtraDate').value=extra.giorno_intervento||tomorrow();$('programExtraWorkers').innerHTML=profiles.filter(p=>p.attivo).map(p=>`<label><input type="checkbox" value="${p.id}"> ${esc(p.nome)}</label>`).join('');const ids=new Set(extraWorkers.filter(w=>w.extra_id===extra.id).map(w=>w.profile_id));$('programExtraWorkers').querySelectorAll('input').forEach(x=>x.checked=ids.has(x.value));$('programExtraInfo').textContent=`${extra.titolo||'Extra'} · ${stores.find(s=>s.id===extra.store_id)?.nome||extra.nome_esterno||'luogo non indicato'}`;openDialog('programExtraDialog')}
async function saveProgramExtra(){if(!admin())return;const id=$('programExtraId').value,extra=extras.find(e=>e.id===id),workers=[...$('programExtraWorkers').querySelectorAll('input:checked')].map(x=>x.value),day=$('programExtraDate').value;if(!extra||!day||!workers.length)return alert('Seleziona data e almeno un componente della squadra.');let r=await sb.from('extras').update({giorno_intervento:day,schedule_id:null,posizione_giro:null}).eq('id',id);if(r.error)return alert(r.error.message);r=await sb.from('extra_workers').delete().eq('extra_id',id);if(r.error)return alert(r.error.message);r=await sb.from('extra_workers').insert(workers.map(profile_id=>({extra_id:id,profile_id})));if(r.error)return alert(r.error.message);extra.giorno_intervento=day;extra.schedule_id=null;extra.posizione_giro=null;extraWorkers=extraWorkers.filter(w=>w.extra_id!==id);extraWorkers.push(...workers.map(profile_id=>({extra_id:id,profile_id})));try{await ensureStandaloneExtraInProgramming(extra,workers)}catch(err){return alert('Data e squadra salvate, ma inserimento nella programmazione non riuscito: '+err.message)}$('programExtraDialog').close();toast('Extra inserito in programmazione');await loadAll()}
function renderSchedules(){
  const currentScheduleTravelToken=++scheduleTravelRenderToken;
  $('scheduleTitle').textContent=admin()?'Programmazione':'I miei lavori';
  $('scheduleList').innerHTML='';
  renderScheduleUnplannedSummary();
  let list=visibleSchedules().filter(scheduleMatchesDate);
  if(scheduleWorkerFilter!=='all')list=list.filter(s=>scheduleMembers.some(m=>m.schedule_id===s.id&&m.profile_id===scheduleWorkerFilter));
  if(scheduleClientFilter!=='all')list=list.filter(s=>scheduleItems.some(i=>i.schedule_id===s.id&&scheduleClientMatchesStore(stores.find(st=>st.id===i.store_id)))||extras.some(e=>e.schedule_id===s.id&&!e.schedule_item_id&&clientType(e)===scheduleClientFilter&&!['completato'].includes(e.stato))||scheduleActivities.some(a=>a.schedule_id===s.id&&a.stato!=='completato'&&a.store_id&&scheduleClientMatchesStore(stores.find(st=>st.id===a.store_id))));
  list.sort((a,b)=>String(a.giorno).localeCompare(String(b.giorno)));
  for(const s of list){
    let items=scheduleItems.filter(i=>i.schedule_id===s.id&&effectiveScheduleState(i)!=='completato').sort((a,b)=>(a.posizione||0)-(b.posizione||0));
    if(scheduleClientFilter!=='all')items=items.filter(i=>scheduleClientMatchesStore(stores.find(st=>st.id===i.store_id)));
    let scheduleExtras=extrasForSchedule(s.id).filter(e=>!e.schedule_item_id).filter(e=>admin()||assignedExtraIds().has(e.id));
    if(scheduleWorkerFilter!=='all')scheduleExtras=scheduleExtras.filter(e=>extraWorkers.some(w=>w.extra_id===e.id&&w.profile_id===scheduleWorkerFilter));
    if(scheduleClientFilter!=='all')scheduleExtras=scheduleExtras.filter(e=>clientType(e)===scheduleClientFilter);
    let dayActivities=scheduleActivities.filter(a=>a.schedule_id===s.id&&a.stato!=='completato'&&a.stato!=='annullato');
    if(scheduleClientFilter!=='all')dayActivities=dayActivities.filter(a=>a.store_id&&scheduleClientMatchesStore(stores.find(st=>st.id===a.store_id)));
    if(!items.length&&!scheduleExtras.length&&!dayActivities.length)continue;
    const members=scheduleMembers.filter(m=>m.schedule_id===s.id).map(m=>profiles.find(p=>p.id===m.profile_id)?.nome).filter(Boolean);
    const c=document.createElement('article');c.className='card schedule-day-card';
    c.innerHTML=`<div class="schedule-card-head"><div><span class="schedule-date-label">${fmt(s.giorno)}</span><h3>${esc(members.join(' + ')||'Squadra non indicata')}</h3>${s.nota_generale?`<p class="muted">${esc(s.nota_generale)}</p>`:''}${s.auto_rollover?'<p class="muted"><strong>↪ Continuazione automatica attiva</strong></p>':''}</div>${admin()?'<div class="actions schedule-head-actions"><button class="secondary" data-edit-date>Data</button><button class="secondary" data-edit-team>Squadra</button><button class="secondary" data-edit-note>Nota giornata</button><button class="secondary" data-add-stores>+ Aggiungi lavoro</button><button class="secondary" data-duplicate>Duplica</button></div>':''}</div><div class="schedule-progress-label">${items.length+scheduleExtras.length+dayActivities.length} lavor${items.length+scheduleExtras.length+dayActivities.length===1?'o':'i'} da eseguire</div>`;
    c.querySelector('[data-edit-date]')?.addEventListener('click',()=>openEditScheduleDate(s));
    c.querySelector('[data-edit-team]')?.addEventListener('click',()=>openEditScheduleTeam(s));
    c.querySelector('[data-edit-note]')?.addEventListener('click',()=>editScheduleDayNote(s));
    c.querySelector('[data-add-stores]')?.addEventListener('click',()=>openAddScheduleItems(s));
    c.querySelector('[data-duplicate]')?.addEventListener('click',()=>openDuplicateSchedule(s));
    const routeJobs=[
      ...items.filter(item=>item.tipo==='ordinario').map(item=>({kind:'ordinary',position:Number(item.posizione)||999999,item})),
      ...scheduleExtras.map(extra=>({kind:'extra',position:extraRoutePosition(extra),extra})),
      ...dayActivities.map(activity=>({kind:'activity',position:Number(activity.posizione)||999999,activity}))
    ].sort((a,b)=>a.position-b.position||String(a.kind==='ordinary'?a.item.id:a.kind==='extra'?a.extra.id:a.activity.id).localeCompare(String(b.kind==='ordinary'?b.item.id:b.kind==='extra'?b.extra.id:b.activity.id)));
    for(const [displayIndex,job] of routeJobs.entries()){
      if(job.kind==='ordinary'){
      const item=job.item,st=stores.find(x=>x.id===item.store_id),r=document.createElement('div');
      const effectiveState=effectiveScheduleState(item);
      r.className=`schedule-item schedule-item-compact ${effectiveState}`;
      r.dataset.routeAddress=routeAddressForStore(st);
      r.dataset.scheduleItemId=item.id;
      const stato=effectiveState==='in_attesa'?'In attesa di convalida':'Da eseguire',linked=linkedExtrasForScheduleItem(item.id);
      r.innerHTML=`<div class="schedule-item-main"><div class="schedule-order-number">${displayIndex+1}</div><div class="schedule-item-copy">${scheduleClientBadge(st)}<strong data-store-detail>${esc(st?.nome||'Sede')}</strong><small>${esc(st?.citta||st?.indirizzo||'')} · ${stato}</small></div>${admin()&&scheduleClientFilter==='all'?'<button type="button" class="drag-handle" data-drag-handle title="Tieni premuto e trascina" aria-label="Trascina per cambiare ordine">☰</button>':''}</div>${effectiveState==='da_fare'&&String(st?.next_visit_note||'').trim()?`<div class="schedule-next-visit"><strong>⚠️ Da fare in questo passaggio</strong><p>${esc(st.next_visit_note)}</p></div>`:''}${linked.length?`<div class="linked-extra-reminder compact-linked"><strong>Extra collegati (${linked.length})</strong>${linked.map(e=>`<span class="linked-extra-category ${extraCategoryClass(e)}"><b>${esc(extraCategoryLabel(e))}</b> ${esc(e.titolo)}</span>`).join('')}</div>`:''}<div class="actions schedule-item-actions"><button class="secondary" data-map>Maps</button>${effectiveState==='da_fare'?`<button data-done>${openMultiDayIntervention(st?.id)?'Continua intervento':'Eseguito'}</button>`:''}${admin()&&effectiveState==='da_fare'?'<button class="danger-btn" data-delete-scheduled>Elimina</button>':''}</div>`;
      r.querySelector('[data-store-detail]').onclick=()=>showStoreDetail(st);r.querySelector('[data-map]').onclick=()=>openGoogleMaps(st?.indirizzo,clientLabel(st)+' '+(st?.nome||''),st?.citta);
      r.querySelector('[data-done]')?.addEventListener('click',()=>openDone(st,item.id));r.querySelector('[data-delete-scheduled]')?.addEventListener('click',()=>deleteScheduleItem(item,st));c.appendChild(r)
      }else if(job.kind==='extra'){
        const e=job.extra,r=extraCard(e);r.classList.add('schedule-extra-card','schedule-item');r.dataset.scheduleExtraId=e.id;
        const badge=document.createElement('div');badge.className='schedule-next-visit';badge.innerHTML=`<strong>🔧 Extra standalone della giornata · posizione ${displayIndex+1}</strong>`;
        r.prepend(badge);
        if(admin()&&scheduleClientFilter==='all'){
          const heading=r.querySelector('.extra-card-heading')||r;
          const handle=document.createElement('button');handle.type='button';handle.className='drag-handle';handle.dataset.dragHandle='';handle.title='Tieni premuto e trascina';handle.setAttribute('aria-label','Trascina per cambiare ordine');handle.textContent='☰';heading.appendChild(handle);
          const actions=r.querySelector('.actions')||r;
          const remove=document.createElement('button');remove.type='button';remove.className='danger-btn';remove.textContent='Togli dalla giornata';remove.onclick=()=>unlinkExtraFromSchedule(e);actions.appendChild(remove);
        }
        c.appendChild(r);
      }else{
        const a=job.activity,st=stores.find(x=>x.id===a.store_id),ct=workContacts.find(x=>x.id===a.contact_id),r=document.createElement('div');
        r.className='schedule-item schedule-item-compact schedule-activity-card';r.dataset.scheduleActivityId=a.id;
        r.dataset.routeAddress=a.indirizzo||routeAddressForStore(st)||'';
        const type=activityTypeMeta(a.tipo);
        r.innerHTML=`<div class="schedule-item-main"><div class="schedule-order-number">${displayIndex+1}</div><div class="schedule-item-copy"><span class="activity-pill">${type.icon} ${esc(type.label)}</span><strong>${esc(a.titolo||type.label)}</strong><small>${a.ora?esc(String(a.ora).slice(0,5))+' · ':''}${esc(st?.nome||a.indirizzo||'Luogo non indicato')}</small></div>${admin()&&scheduleClientFilter==='all'?'<button type="button" class="drag-handle" data-drag-handle title="Tieni premuto e trascina" aria-label="Trascina per cambiare ordine">☰</button>':''}</div>${ct?`<div class="schedule-next-visit"><strong>👤 ${esc(ct.nome)}</strong><p>${esc([ct.azienda,ct.ruolo,ct.telefono].filter(Boolean).join(' · '))}</p></div>`:''}${a.note?`<div class="schedule-next-visit"><p>${esc(a.note)}</p></div>`:''}<div class="actions schedule-item-actions">${r.dataset.routeAddress?'<button class="secondary" data-activity-map>Maps</button>':''}<button data-activity-done>✓ Eseguito</button>${admin()?'<button class="secondary" data-edit-activity>Modifica</button><button class="danger-btn" data-delete-activity>Elimina</button>':''}</div>`;
        r.querySelector('[data-activity-map]')?.addEventListener('click',()=>openGoogleMaps(a.indirizzo||st?.indirizzo,a.titolo||type.label,st?.citta));
        r.querySelector('[data-activity-done]')?.addEventListener('click',()=>completeScheduleActivity(a));
        r.querySelector('[data-edit-activity]')?.addEventListener('click',()=>openScheduleActivityDialog(s,a));
        r.querySelector('[data-delete-activity]')?.addEventListener('click',()=>deleteScheduleActivity(a));
        c.appendChild(r);
      }
    }
    enableScheduleDrag(c,s);
    $('scheduleList').appendChild(c);
    hydrateScheduleTravel(c,currentScheduleTravelToken);
  }

  const assignedIds=assignedExtraIds();
  let visibleExtraJobs=(admin()?extras:extras.filter(e=>assignedIds.has(e.id))).filter(e=>!e.schedule_id).filter(extraIsScheduled).filter(extraMatchesScheduleDate);
  if(scheduleWorkerFilter!=='all')visibleExtraJobs=visibleExtraJobs.filter(e=>extraWorkers.some(w=>w.extra_id===e.id&&w.profile_id===scheduleWorkerFilter));
  if(scheduleClientFilter!=='all')visibleExtraJobs=visibleExtraJobs.filter(e=>String(e.client_type||'eurospin')===scheduleClientFilter);
  visibleExtraJobs.sort((a,b)=>String(a.giorno_intervento).localeCompare(String(b.giorno_intervento))||String(a.titolo||'').localeCompare(String(b.titolo||'')));
  if(visibleExtraJobs.length){
    const heading=document.createElement('h2');heading.className='extra-section-title schedule-extra-heading';heading.textContent=`Extra programmati (${visibleExtraJobs.length})`;$('scheduleList').appendChild(heading);
    for(const e of visibleExtraJobs){const c=extraCard(e);c.classList.add('schedule-extra-card');$('scheduleList').appendChild(c)}
  }
  if(!$('scheduleList').children.length)$('scheduleList').innerHTML='<div class="card report-empty"><strong>Nessun lavoro con questi filtri</strong><p class="muted">Cambia cliente, data o squadra.</p></div>';
}
function extrasForSchedule(scheduleId){
  return extras.filter(e=>e.schedule_id===scheduleId&&!['completato'].includes(e.stato));
}
async function unlinkExtraFromSchedule(extra){
  if(!admin()||!extra)return;
  if(!confirm(`Togliere “${extra.titolo||'Extra'}” da questa programmazione? L’extra resterà aperto.`))return;
  const r=await sb.from('extras').update({schedule_id:null,giorno_intervento:null,posizione_giro:null}).eq('id',extra.id);
  if(r.error)return alert(r.error.message);
  const wr=await sb.from('extra_workers').delete().eq('extra_id',extra.id);
  if(wr.error)return alert(wr.error.message);
  extra.schedule_id=null;extra.giorno_intervento=null;extra.posizione_giro=null;
  extraWorkers=extraWorkers.filter(w=>w.extra_id!==extra.id);
  toast('Extra tolto dalla programmazione');
  await loadAll();
}
function standaloneExtrasForPlanner(){
  return extras.filter(e=>!e.schedule_id&&!e.schedule_item_id&&!e.con_ordinario&&!['completato','in_attesa'].includes(e.stato)&&!extraIsScheduled(e));
}
// V112-38: nella modifica di una giornata già creata devono essere selezionabili anche
// gli extra già esistenti che hanno già data/operatori o che sono programmati in un'altra giornata.
// Restano esclusi solo gli extra inclusi nell'ordinario, quelli già chiusi/in attesa e quelli
// collegati direttamente a uno schedule_item ordinario.
function existingExtrasForSchedulePicker(scheduleId){
  return extras.filter(e=>
    !e.schedule_item_id &&
    !e.con_ordinario &&
    !['completato','in_attesa'].includes(e.stato) &&
    e.schedule_id!==scheduleId
  );
}
function schedulePlannerExtraSearchText(e){
  const st=stores.find(s=>s.id===e.store_id);
  return [e.titolo,e.numero_target,e.descrizione,e.nome_esterno,e.indirizzo_esterno,clientLabel(e),extraCategoryLabel(e),st?.nome,st?.citta,st?.indirizzo].filter(Boolean).join(' ').toLowerCase();
}
function renderSchedulePicker(){
  const q=String($('scheduleSearch')?.value||'').trim().toLowerCase(),w=$('scheduleStores');if(!w)return;
  const pickerClient=$('schedulePickerClient')?.value||'all';
  w.innerHTML='';

  const tools=document.createElement('div');tools.className='schedule-picker-tools';
  tools.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 10px';
  tools.innerHTML=`<button type="button" class="secondary" data-picker-mode="all" ${schedulePickerMode==='all'?'disabled':''}>Tutti</button><button type="button" class="secondary" data-picker-mode="selected" ${schedulePickerMode==='selected'?'disabled':''}>Selezionati (${schedulePickerSelected.size})</button><button type="button" class="secondary" data-select-results>✓ Seleziona risultati</button>${schedulePickerSelected.size?'<button type="button" class="secondary" data-clear-selected>✕ Azzera selezione</button>':''}`;
  tools.querySelectorAll('[data-picker-mode]').forEach(b=>b.onclick=()=>{schedulePickerMode=b.dataset.pickerMode;renderSchedulePicker()});
  tools.querySelector('[data-select-results]').onclick=selectAllSchedulePickerResults;
  tools.querySelector('[data-clear-selected]')?.addEventListener('click',()=>{schedulePickerSelected.clear();schedulePickerMode='all';renderSchedulePicker()});
  w.appendChild(tools);

  const alphabet=document.createElement('div');alphabet.className='schedule-picker-alphabet';
  alphabet.style.cssText='display:flex;gap:5px;overflow-x:auto;padding:2px 0 10px;white-space:nowrap;-webkit-overflow-scrolling:touch';
  const letters=['','A','B','C','D','E','F','G','H','I','L','M','N','O','P','Q','R','S','T','U','V','Z'];
  alphabet.innerHTML=letters.map(letter=>`<button type="button" class="secondary" data-picker-letter="${letter}" ${schedulePickerLetter===letter?'disabled':''} style="min-width:34px;padding:7px 9px">${letter||'Tutte'}</button>`).join('');
  alphabet.querySelectorAll('[data-picker-letter]').forEach(b=>b.onclick=()=>{schedulePickerLetter=b.dataset.pickerLetter;renderSchedulePicker()});
  w.appendChild(alphabet);

  let resultCount=0;
  const groups=[['eurospin','Eurospin'],['intesa','Intesa Sanpaolo'],['privato','Privati']];
  for(const [type,label] of groups){
    if(pickerClient!=='all'&&pickerClient!==type)continue;
    const rows=stores.filter(st=>String(st.client_type||'eurospin')===type&&schedulePickerMatchesStore(st,q,pickerClient)).sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'it'));
    if(!rows.length)continue;resultCount+=rows.length;
    const group=document.createElement('details');group.className=`picker-group ${type}`;group.open=!!q||!!schedulePickerLetter||schedulePickerMode==='selected'||pickerClient!=='all'||type==='eurospin';
    group.innerHTML=`<summary><span>${esc(label)}</span><b>${rows.length}</b></summary><div class="picker-group-list"></div>`;
    const body=group.querySelector('.picker-group-list');
    for(const st of rows){
      const l=document.createElement('label'),programmed=isStoreProgrammed(st.id);
      l.innerHTML=`<input type="checkbox" value="${st.id}" ${schedulePickerSelected.has(st.id)?'checked':''}><span><strong>${esc(st.nome)}</strong>${programmed?' <em class="picker-programmed">Già in programma</em>':''}${!storeHasInterval(st)?' <em class="picker-programmed">Solo su richiesta</em>':''}<small>${esc([storeSiteTypeLabel(st),st.citta,st.indirizzo].filter(Boolean).join(' · ')||'Nessun indirizzo')}</small></span>`;
      l.querySelector('input').onchange=e=>setSchedulePickerValue(st.id,e.target.checked);body.appendChild(l)
    }
    w.appendChild(group)
  }

  const standalone=standaloneExtrasForPlanner().filter(e=>schedulePickerMatchesExtra(e,q,pickerClient)).sort((a,b)=>String(a.titolo||'').localeCompare(String(b.titolo||''),'it'));
  if(standalone.length){resultCount+=standalone.length;
    const group=document.createElement('details');group.className='picker-group extras';group.open=true;
    group.innerHTML=`<summary><span>🔧 Extra senza sede</span><b>${standalone.length}</b></summary><div class="picker-group-list"></div>`;
    const body=group.querySelector('.picker-group-list');
    for(const e of standalone){
      const value=`extra:${e.id}`,l=document.createElement('label'),place=e.nome_esterno||e.indirizzo_esterno||'Nessuna sede associata';
      l.innerHTML=`<input type="checkbox" value="${value}" ${schedulePickerSelected.has(value)?'checked':''}><span><strong>${esc(e.titolo||'Extra')}</strong><em class="picker-programmed">Extra standalone</em><small>${esc([clientLabel(e),e.numero_target?`Target/Ticket ${e.numero_target}`:null,place].filter(Boolean).join(' · '))}</small></span>`;
      l.querySelector('input').onchange=ev=>setSchedulePickerValue(value,ev.target.checked);body.appendChild(l)
    }
    w.appendChild(group)
  }

  if(!resultCount){const empty=document.createElement('p');empty.className='muted picker-empty';empty.textContent=schedulePickerMode==='selected'?'Nessun elemento selezionato.':'Nessuna sede o extra trovato.';w.appendChild(empty)}
  updateScheduleSelectedCount();
}

function pdfSafeName(value){return String(value||'extra').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'extra'}
function pdfSafeText(value){
  return String(value??'')
    .replace(/[‘’‚‛]/g,"'")
    .replace(/[“”„‟]/g,'\"')
    .replace(/[–—]/g,'-')
    .replace(/…/g,'...')
    .replace(/•/g,'-')
    .replace(/→/g,'->')
    .replace(/←/g,'<-')
    .replace(/€/g,'EUR')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g,'')
    .replace(/\s+/g,' ')
    .trim();
}
function wrapPdfText(text,font,size,maxWidth){
  const words=pdfSafeText(text).split(' ').filter(Boolean),lines=[];let line='';
  for(const word of words){const test=line?line+' '+word:word;if(font.widthOfTextAtSize(test,size)<=maxWidth)line=test;else{if(line)lines.push(line);line=word}}
  if(line)lines.push(line);return lines;
}
async function fetchAttachmentBytes(a){const url=await signedAttachmentUrl(a);const res=await fetch(url);if(!res.ok)throw new Error(`Impossibile leggere ${attachmentLabel(a)}`);return new Uint8Array(await res.arrayBuffer())}
async function normalizeImageForPdf(bytes,mime='image/jpeg'){
  const blob=new Blob([bytes],{type:mime||'image/jpeg'}),url=URL.createObjectURL(blob);
  try{
    const img=await new Promise((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('Immagine non leggibile'));el.src=url});
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0);
    const out=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Conversione immagine non riuscita')),'image/jpeg',0.92));
    return new Uint8Array(await out.arrayBuffer());
  }finally{URL.revokeObjectURL(url)}
}
async function embedUprightImage(targetDoc,bytes,mime='image/jpeg'){
  const normalized=await normalizeImageForPdf(bytes,mime);
  return targetDoc.embedJpg(normalized);
}
async function appendAttachmentAsFullPage(targetDoc,a){
  const bytes=await fetchAttachmentBytes(a),mime=String(a.mime_type||'').toLowerCase(),name=String(a.nome_file||'').toLowerCase();
  if(mime.includes('pdf')||name.endsWith('.pdf')){const source=await PDFLib.PDFDocument.load(bytes);if(!source.getPageCount())throw new Error(`${attachmentLabel(a)} è vuoto`);const [page]=await targetDoc.copyPages(source,[0]);targetDoc.addPage(page);return}
  let image;try{image=await embedUprightImage(targetDoc,bytes,mime)}catch{throw new Error(`${attachmentLabel(a)} deve essere PDF, JPG o PNG`)}
  const page=targetDoc.addPage([595.28,841.89]),pw=page.getWidth(),ph=page.getHeight(),scale=Math.min(pw/image.width,ph/image.height);page.drawImage(image,{x:(pw-image.width*scale)/2,y:(ph-image.height*scale)/2,width:image.width*scale,height:image.height*scale});
}

async function generateComplexExtraReportPdf(e,button){
 const items=workItemsForExtra(e.id);if(!items.length)return alert('Questo extra non ha lavorazioni strutturate.');if(!window.PDFLib)return alert('La libreria PDF non è ancora caricata.');const old=button?.textContent;if(button){button.disabled=true;button.textContent='Genero report…'}
 try{const {PDFDocument,StandardFonts,rgb}=PDFLib,doc=await PDFDocument.create(),bold=await doc.embedFont(StandardFonts.HelveticaBold),regular=await doc.embedFont(StandardFonts.Helvetica),green=rgb(.03,.36,.19),muted=rgb(.35,.43,.39),st=stores.find(s=>s.id===e.store_id),margin=42,pageW=595.28,pageH=841.89,w=pageW-margin*2;let page=doc.addPage([pageW,pageH]),y=790;
 page.drawText('OVERGREEN',{x:margin,y,size:22,font:bold,color:green});page.drawText('REPORT LAVORAZIONI E DOCUMENTAZIONE FOTOGRAFICA',{x:margin,y:y-28,size:10.5,font:bold,color:muted});y-=62;
 const fields=[['LAVORO',e.titolo],['CLIENTE',clientLabel(e)],['LUOGO',st?.nome||e.nome_esterno||'Non indicato'],['INDIRIZZO',st?.indirizzo||e.indirizzo_esterno||'Non indicato'],['RICHIESTA',fmt(extraRequestDate(e))],['ESECUZIONE',fmt(e.giorno_intervento)],['TARGET / TICKET',e.numero_target||'Non indicato']];for(const [label,value] of fields){page.drawText(label,{x:margin,y,size:8,font:bold,color:muted});const lines=wrapPdfText(pdfSafeText(value),regular,10.5,w-110);lines.slice(0,2).forEach((line,i)=>page.drawText(line,{x:margin+110,y:y-i*14,size:10.5,font:regular}));y-=27}
 y-=4;page.drawLine({start:{x:margin,y},end:{x:pageW-margin,y},thickness:1,color:rgb(.82,.88,.84)});y-=22;page.drawText(`LAVORAZIONI (${items.length})`,{x:margin,y,size:10,font:bold,color:green});y-=18;for(let i=0;i<items.length;i++){for(const line of wrapPdfText(pdfSafeText(`${i+1}. ${items[i].titolo} — ${workStateLabel(items[i].stato)}`),regular,10,w)){page.drawText(line,{x:margin,y,size:10,font:regular});y-=14}}page.drawText('Generato da Overgreen Cloud',{x:margin,y:22,size:8,font:regular,color:muted});
 for(let i=0;i<items.length;i++){const item=items[i],before=workPhotosForItem(item.id,'prima'),after=workPhotosForItem(item.id,'dopo'),pairs=Math.max(before.length,after.length,1);for(let pair=0;pair<pairs;pair++){page=doc.addPage([pageW,pageH]);y=790;page.drawText(`${i+1}. ${pdfSafeText(item.titolo)}`,{x:margin,y,size:16,font:bold,color:green});y-=25;page.drawText(`STATO: ${pdfSafeText(workStateLabel(item.stato)).toUpperCase()}`,{x:margin,y,size:9,font:bold,color:muted});y-=20;const noteHistory=workNotesForItem(item.id),noteText=noteHistory.length?noteHistory.map(n=>`${workNoteDate(n)} · ${workNoteAuthor(n)}: ${n.nota}`).join('\n'):item.nota||'';if(noteText){page.drawText('NOTE / AVANZAMENTO',{x:margin,y,size:8,font:bold,color:muted});y-=14;for(const line of wrapPdfText(pdfSafeText(noteText),regular,9.5,w).slice(0,9)){page.drawText(line,{x:margin,y,size:9.5,font:regular});y-=13}y-=8}if(!before.length&&!after.length){page.drawText('Nessuna fotografia allegata a questa lavorazione.',{x:margin,y,size:10,font:regular,color:muted});continue}const gap=16,cellW=(w-gap)/2,imgH=Math.min(570,y-50),slots=[{p:before[pair],label:'PRIMA',x:margin},{p:after[pair],label:'DOPO',x:margin+cellW+gap}];for(const slot of slots){page.drawText(slot.label,{x:slot.x,y,size:10,font:bold,color:slot.label==='PRIMA'?muted:green});if(!slot.p){page.drawText('Foto non presente',{x:slot.x,y:y-28,size:9,font:regular,color:muted});continue}try{const bytes=await fetchWorkPhotoBytes(slot.p),img=await embedUprightImage(doc,bytes,String(slot.p.mime_type||'').toLowerCase()),scale=Math.min(cellW/img.width,imgH/img.height);page.drawImage(img,{x:slot.x+(cellW-img.width*scale)/2,y:y-25-img.height*scale,width:img.width*scale,height:img.height*scale})}catch{page.drawText('Foto non disponibile',{x:slot.x,y:y-28,size:9,font:regular,color:muted})}}}}
 const bytes=await doc.save(),blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`report-lavorazioni-${pdfSafeName(e.titolo)}-${e.giorno_intervento||today()}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Report lavorazioni generato')
 }catch(err){console.error(err);alert('Impossibile generare il report: '+(err.message||String(err)))}finally{if(button){button.disabled=false;button.textContent=old}}
}

async function generateExtraClosurePdf(e,button){
  const reportEurospin=attachments.find(a=>a.extra_id===e.id&&a.tipo==='rapportino_eurospin'),reportOvergreen=attachments.find(a=>a.extra_id===e.id&&a.tipo==='rapportino_overgreen'),requestFile=attachments.find(a=>a.extra_id===e.id&&a.tipo==='pdf_richiesta');
  if(!requestFile||!reportOvergreen||!reportEurospin)return alert('Per generare la chiusura servono il file richiesta, il file Overgreen e il file Eurospin.');
  if(!window.PDFLib)return alert('La libreria PDF non è ancora caricata. Aggiorna la pagina e riprova.');
  const old=button?.textContent;if(button){button.disabled=true;button.textContent='Generazione…'}
  try{
    const {PDFDocument,StandardFonts,rgb}=PDFLib,doc=await PDFDocument.create(),page=doc.addPage([595.28,841.89]),bold=await doc.embedFont(StandardFonts.HelveticaBold),regular=await doc.embedFont(StandardFonts.Helvetica),green=rgb(.03,.36,.19),muted=rgb(.35,.43,.39),st=stores.find(s=>s.id===e.store_id),names=extraWorkers.filter(w=>w.extra_id===e.id).map(w=>profiles.find(p=>p.id===w.profile_id)?.nome).filter(Boolean),pics=attachments.filter(a=>a.extra_id===e.id&&a.tipo==='foto_generica');
    const margin=42,w=page.getWidth()-margin*2;let y=790;
    page.drawText('OVERGREEN',{x:margin,y,size:22,font:bold,color:green});const targetHeader=e.numero_target?`TARGET N° ${pdfSafeText(e.numero_target)}`:'';if(targetHeader){const targetSize=16,targetWidth=bold.widthOfTextAtSize(targetHeader,targetSize);page.drawText(targetHeader,{x:page.getWidth()-margin-targetWidth,y:y+2,size:targetSize,font:bold,color:green});}page.drawText('REPORT DI CHIUSURA LAVORO EXTRA',{x:margin,y:y-29,size:11,font:bold,color:muted});y-=62;
    const place=st?.nome||e.nome_esterno||'Luogo non indicato',address=st?.indirizzo||[e.indirizzo_esterno,st?.citta].filter(Boolean).join(' · ');
    const fields=[['LAVORO',e.titolo],['CATEGORIA',extraCategory(e)==='verde'?'Verde':extraCategory(e)==='pulizie'?'Pulizie':'Categoria non indicata'],['LUOGO',place],['INDIRIZZO',address||'Non indicato'],['DATA RICHIESTA',fmt(extraRequestDate(e))],['DATA ESECUZIONE',fmt(e.giorno_intervento)],['ORARIO CHIUSURA',fmtClosedAt(e.closed_at)],['CHIUSO DA',closedByName(e)],['OPERATORI',names.join(', ')||'Non indicati'],['STATO','Chiuso e convalidato']];
    const metaGap=22,metaColW=(w-metaGap)/2,metaLabelW=82,metaValueW=metaColW-metaLabelW-6,metaStartY=y,metaRows=Math.ceil(fields.length/2),rowHeights=[];
    for(let r=0;r<metaRows;r++){
      const left=fields[r*2],right=fields[r*2+1],lineCounts=[left,right].filter(Boolean).map(([,value])=>Math.min(2,wrapPdfText(value,regular,10.5,metaValueW).length||1));
      rowHeights[r]=Math.max(25,Math.max(...lineCounts,1)*13+8);
    }
    let rowTop=metaStartY;
    for(let r=0;r<metaRows;r++){
      for(let c=0;c<2;c++){
        const field=fields[r*2+c];if(!field)continue;const [label,value]=field,x=margin+c*(metaColW+metaGap);
        page.drawText(label,{x,y:rowTop,size:7.5,font:bold,color:muted});
        const lines=wrapPdfText(value,regular,10.5,metaValueW).slice(0,2);
        lines.forEach((line,i)=>page.drawText(line,{x:x+metaLabelW,y:rowTop-i*13,size:10.5,font:regular,color:rgb(.08,.17,.12)}));
      }
      rowTop-=rowHeights[r];
    }
    y=rowTop;
    y-=4;page.drawLine({start:{x:margin,y},end:{x:page.getWidth()-margin,y},thickness:1,color:rgb(.82,.88,.84)});y-=25;
    page.drawText('NOTE DI CHIUSURA',{x:margin,y,size:9,font:bold,color:green});y-=18;const notes=pdfSafeText(e.note_lorenzo||e.descrizione||'Nessuna nota inserita.');for(const line of wrapPdfText(notes,regular,10,w).slice(0,8)){page.drawText(line,{x:margin,y,size:10,font:regular,color:rgb(.08,.17,.12)});y-=14}
    if(pics.length&&y>190){
      y-=10;page.drawText(`FOTO ALLEGATE (${pics.length})`,{x:margin,y,size:9,font:bold,color:green});y-=15;
      const selected=pics.slice(0,4),gap=6,count=selected.length,photoMargin=22,photoW=page.getWidth()-photoMargin*2;
      let cols=2,rows=Math.ceil(count/2),cellH=180;
      if(count===1){cols=1;rows=1;cellH=Math.min(330,Math.max(220,y-38))}
      else if(count===2){cols=2;rows=1;cellH=Math.min(285,Math.max(205,y-38))}
      else if(count===3){cols=2;rows=2;cellH=Math.min(215,Math.max(165,(y-48-gap)/2))}
      else{cols=2;rows=2;cellH=Math.min(215,Math.max(165,(y-48-gap)/2))}
      const cellW=(photoW-gap*(cols-1))/cols;
      for(let i=0;i<selected.length;i++){
        try{
          const a=selected[i],bytes=await fetchAttachmentBytes(a),mime=String(a.mime_type||'').toLowerCase(),img=await embedUprightImage(doc,bytes,mime),col=i%cols,row=Math.floor(i/cols),x=photoMargin+col*(cellW+gap),top=y-row*(cellH+gap),scale=Math.min(cellW/img.width,cellH/img.height);
          page.drawImage(img,{x:x+(cellW-img.width*scale)/2,y:top-cellH+(cellH-img.height*scale)/2,width:img.width*scale,height:img.height*scale})
        }catch{}
      }
    }
    page.drawText('Generato da Overgreen Cloud',{x:margin,y:22,size:8,font:regular,color:muted});
    await appendAttachmentAsFullPage(doc,requestFile);await appendAttachmentAsFullPage(doc,reportOvergreen);await appendAttachmentAsFullPage(doc,reportEurospin);
    const bytes=await doc.save(),blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`chiusura-extra-${pdfSafeName(e.titolo)}-${e.giorno_intervento||today()}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Chiusura PDF generata');
  }catch(err){console.error(err);alert('Impossibile generare la chiusura: '+(err.message||String(err)))}finally{if(button){button.disabled=false;button.textContent=old}}
}

function extraCard(e){
  const st=stores.find(s=>s.id===e.store_id),pdf=attachments.find(a=>a.extra_id===e.id&&a.tipo==='pdf_richiesta'),reportEurospin=attachments.find(a=>a.extra_id===e.id&&a.tipo==='rapportino_eurospin'),reportOvergreen=attachments.find(a=>a.extra_id===e.id&&a.tipo==='rapportino_overgreen'),pics=attachments.filter(a=>a.extra_id===e.id&&a.tipo==='foto_generica');const structuredItems=workItemsForExtra(e.id),structured=structuredItems.length>0;
  const showClosure=['in_attesa','completato'].includes(e.stato),partialOpen=e.stato==='da_integrare',showProgress=showClosure||partialOpen,c=document.createElement('article');
  const assignedNames=extraWorkers.filter(w=>w.extra_id===e.id).map(w=>profiles.find(p=>p.id===w.profile_id)?.nome).filter(Boolean);
  const isAssignedToMe=extraWorkers.some(w=>w.extra_id===e.id&&w.profile_id===profile.id);
  const assignmentLabel=`Assegnato a: ${assignedNames.join(' + ')||'Da assegnare'}`;
  const stateLabel=isIntesaOrdinaryTicket(e)?(e.stato==='completato'?'Ticket chiuso con intervento ordinario':e.stato==='in_attesa'?'In attesa insieme all’intervento ordinario':'Ticket incluso nell’intervento ordinario'):partialOpen?'Parziale · da continuare':e.stato.replaceAll('_',' ');
  c.className=`card extra-card ${extraCategoryClass(e)} ${e.stato}`;
  c.dataset.extraCardId=e.id;
  c.innerHTML=`<div class="extra-card-heading"><div>${clientBadge(e)}<h3>EXTRA · ${esc(st?.nome||e.nome_esterno||'')}</h3></div><span class="extra-category-badge ${extraCategoryClass(e)}">${esc(extraCategoryLabel(e))}</span></div><p><strong>${esc(e.titolo)}</strong></p>${e.numero_target?`<p class="target-number"><strong>Numero target:</strong> ${esc(e.numero_target)}</p>`:''}${e.descrizione?`<p>${esc(e.descrizione)}</p>`:''}${structured?`<div class="linked-extra-reminder"><strong>📋 ${structuredItems.length} lavorazioni</strong><p>${structuredItems.map(w=>`${workStateIcon(w.stato)} ${esc(w.titolo)}`).join(' · ')}</p></div>`:''}${deadlineLabel(e)}<div class="extra-date-summary"><p><strong>Richiesta:</strong> ${fmt(extraRequestDate(e))}</p><span class="elapsed-days">⏱ ${esc(elapsedDaysLabel(e))}</span><p><strong>Esecuzione:</strong> ${e.giorno_intervento?fmt(e.giorno_intervento):'Da programmare'}</p></div>${e.con_ordinario?`<p class="linked-ordinary-label">${isIntesaOrdinaryTicket(e)?'🎫 Ticket incluso nel passaggio ordinario · nessun documento richiesto in chiusura':'🔗 Da fare insieme al passaggio ordinario'}</p>`:''}${partialOpen?'<span class="extra-partial-badge">↪ Parziale · da continuare</span>':`<p class="muted">${esc(stateLabel)}</p>`}<p class="assignment-label"><strong>${esc(assignmentLabel)}</strong></p>${showProgress?`<div class="extra-closure-details">${showClosure?`<div class="closure-stamp">🕒 Chiuso: ${esc(closureText(e))}</div><strong>Note finali</strong>`:'<strong>Avanzamento parziale</strong>'}<div class="history-note ${e.note_lorenzo?'':'muted'}">${esc(e.note_lorenzo||(partialOpen?'Nessuna nota parziale inserita':'Nessuna nota inserita'))}</div><div class="pending-photo-head"><strong>Foto del lavoro</strong><span>${pics.length}</span></div><div class="pending-review-photos" data-extra-photos>${pics.length?'<span class="history-loading">Caricamento foto…</span>':'<p class="muted">Nessuna foto allegata.</p>'}</div></div>`:''}<div class="actions">${extraMapsDestination(e,st)?'<button class="secondary" data-extra-map>Maps</button>':''}${pdf?'<button class="secondary" data-pdf>Apri PDF richiesta</button>':''}${structured?'<button class="secondary" data-work-progress>📋 Lavorazioni</button>':''}${showClosure&&reportEurospin?'<button class="secondary" data-report-eurospin>File Eurospin</button>':''}${showProgress&&reportOvergreen?'<button class="secondary" data-report-overgreen>File Overgreen</button>':''}${showClosure&&!reportEurospin?'<span class="muted">File Eurospin non presente</span>':''}${showClosure&&!reportOvergreen?'<span class="muted">File Overgreen non presente</span>':''}${structured&&['in_attesa','completato'].includes(e.stato)?'<button data-generate-work-report>Genera report lavorazioni</button>':''}${e.stato==='completato'&&!isIntesaOrdinaryTicket(e)?'<button data-generate-closure>Genera chiusura</button>':''}${admin()&&e.stato==='completato'?'<button class="secondary" data-edit-closure>Modifica chiusura</button>':''}${!isIntesaOrdinaryTicket(e)&&['programmato','ricevuto','da_integrare'].includes(e.stato)&&(admin()||isAssignedToMe)?`<button data-close-extra>${structured?'Chiudi definitivamente':(partialOpen?'Continua / chiudi lavoro':'Chiudi lavoro')}</button>`:''}${admin()&&e.stato==='in_attesa'?'<button data-approve-extra>Convalida</button>':''}${admin()&&!e.con_ordinario&&!extraIsScheduled(e)&&!['in_attesa','completato'].includes(e.stato)?'<button class="secondary" data-program-extra>📅 Programma</button>':''}${admin()?'<button class="secondary" data-edit-extra>Modifica</button><button class="danger-btn" data-delete-extra>Elimina</button>':''}</div>`;
  c.querySelector('[data-extra-map]')?.addEventListener('click',()=>openExtraMaps(e,st));
  c.querySelector('[data-pdf]')?.addEventListener('click',()=>openAttachment(pdf));
  c.querySelector('[data-work-progress]')?.addEventListener('click',()=>openExtraWorkProgress(e));
  c.querySelector('[data-report-eurospin]')?.addEventListener('click',()=>openAttachment(reportEurospin));
  c.querySelector('[data-report-overgreen]')?.addEventListener('click',()=>openAttachment(reportOvergreen));
  c.querySelector('[data-generate-work-report]')?.addEventListener('click',ev=>generateComplexExtraReportPdf(e,ev.currentTarget));
  c.querySelector('[data-generate-closure]')?.addEventListener('click',ev=>generateExtraClosurePdf(e,ev.currentTarget));
  c.querySelector('[data-edit-closure]')?.addEventListener('click',()=>openExtraClosureEdit(e));
  c.querySelector('[data-close-extra]')?.addEventListener('click',()=>{if(!e.giorno_intervento)return alert('Prima di chiudere il lavoro inserisci la data di esecuzione da Modifica.');const assigned=extraWorkers.some(w=>w.extra_id===e.id);if(!assigned)return alert('Prima di chiudere il lavoro assegna almeno un dipendente da Modifica.');openExtraClosureDialog(e,false)});
  c.querySelector('[data-approve-extra]')?.addEventListener('click',()=>approveExtra(e));
  c.querySelector('[data-program-extra]')?.addEventListener('click',()=>openProgramExtraDialog(e));
  c.querySelector('[data-edit-extra]')?.addEventListener('click',()=>openExtraEdit(e));
  c.querySelector('[data-delete-extra]')?.addEventListener('click',()=>deleteExtra(e));
  if(showProgress&&pics.length)hydrateExtraPhotos(c,pics);
  return c;
}

async function hydrateExtraPhotos(card,pics){
  const box=card.querySelector('[data-extra-photos]');if(!box)return;box.innerHTML='';
  const urls=await Promise.all(pics.map(async a=>{try{return {a,url:await signedAttachmentUrl(a)}}catch{return null}}));
  for(const x of urls.filter(Boolean)){const b=document.createElement('button');b.type='button';b.className='pending-review-photo';b.innerHTML=`<img src="${x.url}" alt="${esc(x.a.nome_file||'Foto extra')}" loading="lazy"><span>Apri</span>`;b.onclick=()=>window.open(x.url,'_blank');box.appendChild(b)}
  if(!box.children.length)box.innerHTML='<p class="muted">Foto non disponibile. Premi Aggiorna e riprova.</p>';
}

async function renderExtraClosurePhotoManager(extraId){
  const box=$('editExtraClosurePhotoList');if(!box)return;box.innerHTML='<p class="muted">Caricamento foto…</p>';
  const pics=attachments.filter(a=>a.extra_id===extraId&&a.tipo==='foto_generica');
  if(!pics.length){box.innerHTML='<p class="muted">Nessuna foto allegata.</p>';return}
  box.innerHTML='';
  for(const a of pics){
    const row=document.createElement('div');row.className='closure-photo-row';
    row.innerHTML=`<div class="closure-photo-preview"><span>📷</span><small>${esc(a.nome_file||'Foto')}</small></div><button type="button" class="danger-btn compact-btn">Elimina</button>`;
    try{const url=await signedAttachmentUrl(a);row.querySelector('.closure-photo-preview').innerHTML=`<img src="${url}" alt="${esc(a.nome_file||'Foto')}" loading="lazy"><small>${esc(a.nome_file||'Foto')}</small>`}catch{}
    row.querySelector('button').onclick=async()=>{
      if(!confirm('Eliminare questa foto dalla chiusura?'))return;
      const b=row.querySelector('button'),old=b.textContent;b.disabled=true;b.textContent='Elimino…';
      try{if(a.storage_path){const r=await sb.storage.from('documenti').remove([a.storage_path]);if(r.error)throw r.error}const r=await sb.from('attachments').delete().eq('id',a.id);if(r.error)throw r.error;attachments=attachments.filter(x=>x.id!==a.id);row.remove();if(!box.children.length)box.innerHTML='<p class="muted">Nessuna foto allegata.</p>';toast('Foto eliminata')}catch(err){alert(err.message);b.disabled=false;b.textContent=old}
    };
    box.appendChild(row);
  }
}
function openExtraClosureEdit(e){
  if(!admin()||e.stato!=='completato')return;
  $('editExtraClosureId').value=e.id;$('editExtraClosureClosedAt').value=toDateTimeLocal(e.closed_at);$('editExtraClosureNotes').value=e.note_lorenzo||'';
  $('editExtraClosurePhotos').value='';$('editClosureRequest').value='';$('editClosureOvergreen').value='';$('editClosureEurospin').value='';
  renderExtraClosurePhotoManager(e.id);openDialog('editExtraClosureDialog');
}
async function replaceExtraAttachment(extraId,tipo,file){
  if(!file)return;
  // Rapportini/documenti possono essere PDF oppure foto: le foto vanno sempre compresse.
  const original=file;
  file=file.type?.startsWith('image/')?await compressImage(file):file;
  const safe=(file.name||original.name||'documento').replace(/[^a-zA-Z0-9._-]/g,'-'),path=`extra/${extraId}/${tipo}-${Date.now()}-${safe}`;
  await uploadFile(path,file);
  try{
    const added=await addAttachment({tipo,extra_id:extraId,storage_path:path,nome_file:file.name||original.name,mime_type:file.type||original.type,dimensione_bytes:file.size,caricato_da:profile.id});
    if(!added)throw new Error('Registrazione del nuovo file non riuscita.');
    const previous=attachments.filter(a=>a.extra_id===extraId&&a.tipo===tipo);
    for(const old of previous){if(old.storage_path)await sb.storage.from('documenti').remove([old.storage_path]);const r=await sb.from('attachments').delete().eq('id',old.id);if(r.error)throw r.error}
  }catch(err){await sb.storage.from('documenti').remove([path]);throw err}
}

let extraGroupOpenState={todo:true,scheduled:true,completed:false};
let pendingExtraFocusId=null;

function focusExtraCard(extraId,attempt=0){
  const card=document.querySelector(`[data-extra-card-id="${extraId}"]`);
  if(!card){if(attempt<6)setTimeout(()=>focusExtraCard(extraId,attempt+1),120+attempt*90);return}
  const group=card.closest('details');if(group)group.open=true;
  const header=document.querySelector('header'),headerHeight=header?header.getBoundingClientRect().height:0;
  const top=Math.max(0,window.scrollY+card.getBoundingClientRect().top-headerHeight-14);
  window.scrollTo({top,behavior:attempt>1?'smooth':'auto'});
  card.classList.remove('extra-focus');void card.offsetWidth;card.classList.add('extra-focus');
  setTimeout(()=>card.classList.remove('extra-focus'),2600);
}

function openExtraById(extraId){
  const e=extras.find(x=>x.id===extraId);if(!e)return;
  if($('extraSearchInput'))$('extraSearchInput').value='';
  if($('extraCategoryFilter'))$('extraCategoryFilter').value='all';
  const groupKey=['in_attesa','completato'].includes(e.stato)?'completed':extraIsScheduled(e)?'scheduled':'todo';
  extraGroupOpenState={todo:false,scheduled:false,completed:false};
  extraGroupOpenState[groupKey]=true;
  pendingExtraFocusId=extraId;
  setView('extras');
  [0,80,220,500,900].forEach((delay,i)=>setTimeout(()=>focusExtraCard(extraId,i),delay));
  setTimeout(()=>{if(pendingExtraFocusId===extraId)pendingExtraFocusId=null},1800);
}

function extraSearchText(e){
  const st=stores.find(s=>s.id===e.store_id),assigned=extraWorkers.filter(w=>w.extra_id===e.id).map(w=>profiles.find(p=>p.id===w.profile_id)?.nome).filter(Boolean);
  return [clientLabel(e),e.titolo,e.numero_target,e.categoria_target,extraCategoryLabel(e),e.descrizione,e.note_lorenzo,e.stato,st?.nome,st?.indirizzo,st?.citta,e.nome_esterno,e.indirizzo_esterno,extraRequestDate(e),e.giorno_intervento,...assigned,...workItemsForExtra(e.id).flatMap(w=>[w.titolo,w.nota,workStateLabel(w.stato)])].filter(Boolean).join(' ').toLocaleLowerCase('it');
}
function extraIsScheduled(e){
  const hasDate=!!e.giorno_intervento,hasWorker=extraWorkers.some(w=>w.extra_id===e.id);
  return e.stato!=='completato'&&e.stato!=='in_attesa'&&((!!e.schedule_id)||(hasDate&&hasWorker));
}

function extraRoutePosition(e){return Number(e?.posizione_giro)||999999}
function scheduleOpenOrdinaryItems(scheduleId){return scheduleItems.filter(i=>i.schedule_id===scheduleId&&effectiveScheduleState(i)!=='completato')}
function scheduleOpenStandaloneExtras(scheduleId){return extras.filter(e=>e.schedule_id===scheduleId&&!['completato','in_attesa'].includes(e.stato)&&!e.schedule_item_id)}
function nextScheduleRoutePosition(scheduleId){
  const ordinary=scheduleItems.filter(i=>i.schedule_id===scheduleId).map(i=>Number(i.posizione)||0);
  const standalone=extras.filter(e=>e.schedule_id===scheduleId).map(e=>Number(e.posizione_giro)||0);
  const activities=scheduleActivities.filter(a=>a.schedule_id===scheduleId).map(a=>Number(a.posizione)||0);
  return Math.max(0,...ordinary,...standalone,...activities)+1;
}
function sameMemberSet(scheduleId,workerIds){
  const a=scheduleMembers.filter(m=>m.schedule_id===scheduleId).map(m=>m.profile_id).sort();
  const b=[...new Set(workerIds||[])].sort();
  return a.length===b.length&&a.every((v,i)=>v===b[i]);
}
async function ensureStandaloneExtraInProgramming(extra,workerIds=null){
  if(!admin()||!extra||extra.schedule_item_id||['completato','in_attesa'].includes(extra.stato))return extra?.schedule_id||null;
  const day=extra.giorno_intervento;
  const workers=workerIds||extraWorkers.filter(w=>w.extra_id===extra.id).map(w=>w.profile_id);
  if(!day||!workers.length)return null;
  let schedule=extra.schedule_id?schedules.find(s=>s.id===extra.schedule_id):null;
  if(!schedule){
    schedule=schedules.find(s=>s.giorno===day&&sameMemberSet(s.id,workers))||null;
    if(!schedule){
      const {data,error}=await sb.from('schedules').insert({giorno:day,nota_generale:null,creato_da:profile.id,auto_rollover:true}).select().single();
      if(error)throw error;
      schedule=data;schedules.push(schedule);
      const mr=await sb.from('schedule_members').insert(workers.map(profile_id=>({schedule_id:schedule.id,profile_id})));
      if(mr.error)throw mr.error;
      scheduleMembers.push(...workers.map(profile_id=>({schedule_id:schedule.id,profile_id})));
    }
  }
  const wantedPosition=Number(extra.posizione_giro)||nextScheduleRoutePosition(schedule.id);
  const {error}=await sb.from('extras').update({schedule_id:schedule.id,giorno_intervento:day,posizione_giro:wantedPosition}).eq('id',extra.id);
  if(error)throw error;
  extra.schedule_id=schedule.id;extra.posizione_giro=wantedPosition;
  return schedule.id;
}
function renderExtras(){
  const root=$('extrasList');if(!root)return;root.innerHTML='';
  const search=($('extraSearchInput')?.value||'').trim().toLocaleLowerCase('it');
  const categoryFilter=$('extraCategoryFilter')?.value||'all';
  $('clearExtraSearch')?.classList.toggle('hidden',!search);
  const visible=extras.filter(e=>(extraClientFilter==='all'||clientType(e)===extraClientFilter)&&(categoryFilter==='all'||extraCategory(e)===categoryFilter)&&(!search||extraSearchText(e).includes(search)));
  const byRequest=(a,b)=>String(extraRequestDate(a)||'').localeCompare(String(extraRequestDate(b)||''));
  const putFocusedFirst=list=>pendingExtraFocusId?[...list].sort((a,b)=>(a.id===pendingExtraFocusId?-1:b.id===pendingExtraFocusId?1:0)):list;
  const todo=putFocusedFirst(visible.filter(e=>e.stato!=='completato'&&e.stato!=='in_attesa'&&!extraIsScheduled(e)).sort(byRequest));
  const scheduled=putFocusedFirst(visible.filter(extraIsScheduled).sort((a,b)=>String(a.giorno_intervento||'').localeCompare(String(b.giorno_intervento||''))||byRequest(a,b)));
  const completed=putFocusedFirst(visible.filter(e=>['in_attesa','completato'].includes(e.stato)).sort((a,b)=>String(b.giorno_intervento||extraRequestDate(b)||'').localeCompare(String(a.giorno_intervento||extraRequestDate(a)||''))));
  const addGroup=(key,title,list,empty)=>{
    const details=document.createElement('details');details.className=`extra-group extra-group-${key}`;details.open=search?list.length>0:extraGroupOpenState[key];
    const summary=document.createElement('summary');summary.innerHTML=`<span>${esc(title)}</span><strong>${list.length}</strong>`;details.appendChild(summary);
    const body=document.createElement('div');body.className='extra-group-body';
    if(!list.length){const p=document.createElement('p');p.className='muted extra-empty';p.textContent=search?'Nessun risultato in questa sezione.':empty;body.appendChild(p)}else list.forEach(e=>body.appendChild(extraCard(e)));
    details.appendChild(body);details.addEventListener('toggle',()=>{if(!search)extraGroupOpenState[key]=details.open});root.appendChild(details);
  };
  addGroup('todo','Da fare',todo,'Nessun extra da programmare o assegnare.');
  addGroup('scheduled','Programmati',scheduled,'Nessun extra programmato.');
  addGroup('completed','Completati',completed,'Nessun extra completato.');
  if(search&&!visible.length){const p=document.createElement('p');p.className='extra-no-results';p.textContent=`Nessun extra trovato per “${$('extraSearchInput').value.trim()}”.`;root.prepend(p)}
}
function openExtraEdit(e){
  if($('extraEditStoreSearch'))$('extraEditStoreSearch').value='';
  $('extraEditId').value=e.id;$('extraEditClient').value=clientType(e);syncExtraClosureOptions($('extraEditClosureProfile'),clientType(e),closureProfile(e));$('extraEditDeadline').value=isoToLocalInput(e.deadline_at);$('extraEditWithOrdinary').checked=!!e.con_ordinario;$('extraEditTitle').value=e.titolo||'';$('extraEditTargetNumber').value=e.numero_target||'';$('extraEditCategory').value=extraCategory(e)||'';$('extraEditDescription').value=e.descrizione||'';$('extraEditRequestDate').value=extraRequestDate(e)||today();$('extraEditDate').value=e.giorno_intervento||'';
  const external=!e.store_id;$('extraEditDestination').value=external?'external':'store';renderExtraEditStoreOptions(e.store_id);$('extraEditExternalName').value=e.nome_esterno||'';$('extraEditExternalAddress').value=e.indirizzo_esterno||'';toggleExtraEditDestination();
  $('extraEditWorkers').innerHTML=profiles.filter(p=>p.attivo).map(p=>`<label><input type="checkbox" value="${p.id}"><span>${esc(p.nome)}</span></label>`).join('');
  const ids=new Set(extraWorkers.filter(w=>w.extra_id===e.id).map(w=>w.profile_id));$('extraEditWorkers').querySelectorAll('input').forEach(x=>x.checked=ids.has(x.value));$('extraEditPdf').value='';const existingStructured=workItemsForExtra(e.id);$('extraEditStructured').checked=!!existingStructured.length;$('extraEditWorkItemsEditor').innerHTML='';existingStructured.forEach(w=>addWorkEditorRow('extraEditWorkItemsEditor',w.titolo,w.id));syncStructuredEditUi();syncOrdinaryIncludedEditUi();openDialog('extraEditDialog');
}
function renderExtraEditStoreOptions(selected=null){
  const client=$('extraEditClient')?.value||'eurospin',cfg=extraStoreUiConfig(client),all=storesForExtraClient(client),sel=$('extraEditStore');
  if(!sel)return;
  const currentSelected=selected||sel.value||null;
  const query=$('extraEditStoreSearch')?.value||'';
  const list=filterExtraStores(all,query);
  $('extraEditStoreLabel')&&($('extraEditStoreLabel').textContent=cfg.single);
  $('extraEditStoreSearchLabel')&&($('extraEditStoreSearchLabel').textContent=`Cerca ${cfg.single.toLowerCase()}`);
  const destStore=$('extraEditDestination')?.querySelector('option[value="store"]');if(destStore)destStore.textContent=cfg.storeOption;
  $('extraEditWithOrdinaryHelp')&&($('extraEditWithOrdinaryHelp').textContent=cfg.help);
  sel.innerHTML=list.map(s=>`<option value="${s.id}" ${s.id===currentSelected?'selected':''}>${esc(s.nome)}${s.citta?` · ${esc(s.citta)}`:''}</option>`).join('');
  if(currentSelected&&list.some(s=>s.id===currentSelected))sel.value=currentSelected;
  const empty=$('extraEditStoreEmpty');
  if(empty){
    empty.textContent=query
      ?`Nessun risultato per “${query}”.`
      :`Nessuna ${cfg.single.toLowerCase()} disponibile per ${clientLabel({client_type:client})}.`;
    empty.classList.toggle('hidden',!!list.length);
  }
  sel.disabled=!list.length;
}
function toggleExtraEditDestination(){const ext=$('extraEditDestination').value==='external';$('extraEditStoreWrap').classList.toggle('hidden',ext);$('extraEditExternalWrap').classList.toggle('hidden',!ext)}
async function deleteExtra(e){
  if(!confirm(`Eliminare definitivamente l'extra “${e.titolo}”?

Verranno eliminati anche tutti i file allegati.`))return;
  const linked=attachments.filter(a=>a.extra_id===e.id),paths=linked.map(a=>a.storage_path).filter(Boolean);
  if(paths.length){const r=await sb.storage.from('documenti').remove(paths);if(r.error)return alert(r.error.message)}
  let r=await sb.from('attachments').delete().eq('extra_id',e.id);if(r.error)return alert(r.error.message);
  r=await sb.from('extra_workers').delete().eq('extra_id',e.id);if(r.error)return alert(r.error.message);
  r=await sb.from('extras').delete().eq('id',e.id);if(r.error)return alert(r.error.message);
  toast('Extra eliminato');await loadAll();
}
async function openAttachment(a){
  if(!a)return;

  // Apriamo la nuova scheda immediatamente durante il tap.
  // Su Safari/iOS una window.open() eseguita dopo un await può essere bloccata.
  const popup=window.open('about:blank','_blank');

  if(popup){
    try{
      popup.document.title='Apertura documento…';
      popup.document.body.innerHTML='<p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px">Apertura documento…</p>';
    }catch{}
  }

  try{
    const {data,error}=await sb.storage.from('documenti').createSignedUrl(a.storage_path,300);
    if(error)throw error;
    if(!data?.signedUrl)throw new Error('URL del documento non disponibile.');

    if(popup){
      popup.location.href=data.signedUrl;
    }else{
      // Fallback: se il browser ha comunque bloccato la nuova scheda,
      // apriamo il PDF nella scheda corrente.
      window.location.href=data.signedUrl;
    }
  }catch(err){
    try{
      if(popup&&!popup.closed)popup.close();
    }catch{}
    alert('Impossibile aprire il PDF: '+(err?.message||String(err)));
  }
}
async function approveExtra(e){const {error}=await sb.from('extras').update({stato:'completato',convalidato_da:profile.id,convalidato_il:new Date().toISOString()}).eq('id',e.id);if(error)return alert(error.message);toast('Extra convalidato');await loadAll()}
async function seedStores(){if(!admin())return;if(stores.length&&!confirm(`Sono già presenti ${stores.length} punti vendita. Continuare?`))return;const rows=SEED_STORES.filter(x=>!stores.some(s=>s.nome===x.name)).map(x=>({nome:x.name,ultimo_passaggio:x.lastDone,intervallo_giorni:15,attivo:true}));if(!rows.length)return toast('Nessun punto vendita da importare');const {error}=await sb.from('stores').insert(rows);if(error)return alert(error.message);toast(`${rows.length} punti vendita importati`);await loadAll()}

$('rememberAccess').checked=localStorage.getItem(REMEMBER_ACCESS_KEY)!=='0';
$('loginForm').onsubmit = async (e) => { e.preventDefault(); const b=$('loginForm').querySelector('button[type=submit]'); const box=$('loginError'); box.classList.add('hidden'); box.textContent=''; b.disabled=true; b.textContent='Accesso…'; try { const email=$('loginEmail').value.trim(); const password=$('loginPassword').value; if(!email||!password) throw new Error('Inserisci email e password.'); localStorage.setItem(REMEMBER_ACCESS_KEY,$('rememberAccess').checked?'1':'0'); await signIn(email,password); } catch(err) { console.error(err); box.textContent=err?.message||'Accesso non riuscito.'; box.classList.remove('hidden'); } finally { b.disabled=false; b.textContent='Accedi'; } };

$('signatureRefresh')?.addEventListener('click',loadSignatureSheets);
$('signatureFilterMonth')?.addEventListener('change',renderSignatureSheets);
$('signatureFilterRound')?.addEventListener('change',renderSignatureSheets);
$('signatureUploadForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const monthValue=$('signatureMonth').value,file=$('signatureFile').files[0],round=Number($('signatureRound').value);
  if(!monthValue||!file)return alert('Seleziona mese, giro e file.');
  if(!file.type.startsWith('image/')&&file.type!=='application/pdf')return alert('Carica una foto oppure un PDF.');
  const [year,month]=monthValue.split('-').map(Number),btn=$('signatureUploadBtn'),old=btn.textContent;btn.disabled=true;btn.textContent='Caricamento…';
  try{await uploadSignatureSheet(file,year,month,round);$('signatureFile').value='';$('signatureFilterMonth').value=monthValue;$('signatureFilterRound').value=String(round);renderSignatureSheets();toast('Foglio firme salvato')}
  catch(err){const msg=String(err?.message||err);if(msg.includes('signature_sheets')||msg.includes('schema cache'))alert('Database non aggiornato: esegui MIGRAZIONE-V92.sql su Supabase, poi riprova.');else alert('Caricamento non riuscito: '+msg)}
  finally{btn.disabled=false;btn.textContent=old}
});


$('auditRefresh')?.addEventListener('click',()=>loadAuditLogs(true));
$('auditApply')?.addEventListener('click',()=>loadAuditLogs(true));
$('auditClear')?.addEventListener('click',()=>{$('auditFrom').value='';$('auditTo').value='';$('auditUser').value='all';$('auditSection').value='all';$('auditSearch').value='';loadAuditLogs(true)});
$('auditSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();loadAuditLogs(true)}});
$('auditLoadMore')?.addEventListener('click',()=>{auditPage++;loadAuditLogs(false)});


$('archiveRefresh')?.addEventListener('click',loadCompanyArchive);
$('archiveSearch')?.addEventListener('input',renderCompanyArchive);
document.querySelectorAll('[data-archive-category]').forEach(b=>b.addEventListener('click',()=>{
  archiveCategory=b.dataset.archiveCategory;
  renderCompanyArchive();
}));
$('archiveUploadForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!admin())return;
  const category=$('archiveUploadCategory').value,title=$('archiveTitle').value.trim(),description=$('archiveDescription').value.trim(),file=$('archiveFile').files[0],mandatory=$('archiveMandatory').checked;
  if(!title||!file)return alert('Inserisci nome e file.');
  const btn=$('archiveUploadBtn'),old=btn.textContent;btn.disabled=true;btn.textContent='Caricamento…';
  try{
    await uploadCompanyDocument(file,title,description,category,mandatory);
    archiveCategory=category;$('archiveUploadForm').reset();$('archiveUploadCategory').value=category;
    renderCompanyArchive();toast('Documento caricato')
  }catch(e){alert('Caricamento non riuscito: '+e.message)}
  finally{btn.disabled=false;btn.textContent=old}
});

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeDialog(b));$('helpBtn').onclick=openHelp;document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelectorAll('[data-client-filter]').forEach(b=>b.onclick=()=>{storeClientFilter=b.dataset.clientFilter;document.querySelectorAll('[data-client-filter]').forEach(x=>x.classList.toggle('active',x===b));renderStores()});document.querySelectorAll('[data-extra-client]').forEach(b=>b.onclick=()=>{extraClientFilter=b.dataset.extraClient;document.querySelectorAll('[data-extra-client]').forEach(x=>x.classList.toggle('active',x===b));renderExtras()});document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{storeFilter=b.dataset.filter;renderStores()});
$("globalSearchBtn")?.addEventListener("click",()=>{$("globalSearchDialog").showModal();setTimeout(()=>$("globalSearchEverywhere").focus(),50)});$("globalSearchEverywhere")?.addEventListener("input",renderGlobalSearchEverywhere);$("healthRefreshBtn")?.addEventListener("click",renderHealthCenter);document.querySelectorAll("[data-bottom-view]").forEach(b=>b.onclick=()=>{setView(b.dataset.bottomView);$("bottomMoreMenu").classList.add("hidden")});$("bottomMoreBtn")?.addEventListener("click",()=>$("bottomMoreMenu").classList.toggle("hidden"));document.querySelectorAll("[data-more-view]").forEach(b=>b.onclick=()=>{setView(b.dataset.moreView);$("bottomMoreMenu").classList.add("hidden")});document.querySelector("[data-more-search]")?.addEventListener("click",()=>{$("bottomMoreMenu").classList.add("hidden");$("globalSearchDialog").showModal()});
$('impersonationSelect')?.addEventListener('change',async e=>{await setImpersonatedProfile(e.target.value);$('impersonationBar')?.removeAttribute('open')});$('exitImpersonationBtn')?.addEventListener('click',async()=>{await setImpersonatedProfile('admin');$('impersonationBar')?.removeAttribute('open')});$('globalSearch')?.addEventListener('input',renderGlobalSearch);$('dashboardRefresh').onclick=loadAll;if($('storeAddressLookupBtn'))$('storeAddressLookupBtn').onclick=lookupStoreAddressOnline;document.querySelectorAll('[data-dash]').forEach(b=>b.onclick=()=>{scheduleExactDate=null;if(b.dataset.dash==='pending')openPendingDialog();else if(b.dataset.dash==='due'){storeFilter='due';setView('stores')}else if(b.dataset.dash==='urgent'){storeFilter='urgent';setView('stores')}else if(b.dataset.dash==='scheduled'){scheduleDateFilter='all';$('scheduleDateFilter').value='all';setView('schedule')}else if(b.dataset.dash==='today'){scheduleDateFilter='today';$('scheduleDateFilter').value='today';setView('schedule')}else if(b.dataset.dash==='openextras')setView('extras');else if(b.dataset.dash==='todayextras'){$('extraSearchInput').value=today();setView('extras');renderExtras()}else setView('stores')});$('scheduleClientFilter').onchange=e=>{scheduleClientFilter=e.target.value;renderSchedules()};$('scheduleWorkerFilter').onchange=e=>{scheduleWorkerFilter=e.target.value;renderSchedules()};$('scheduleDateFilter').onchange=e=>{scheduleExactDate=null;scheduleDateFilter=e.target.value;renderSchedules()};$('searchInput').oninput=renderStores;$('sortSelect').onchange=renderStores;$('addStoreBtn').onclick=()=>openStore();$('bulkIntervalBtn').onclick=openBulkIntervalDialog;$('bulkIntervalClient').onchange=updateBulkIntervalPreview;$('bulkIntervalSiteType').onchange=updateBulkIntervalPreview;$('bulkIntervalDays').oninput=updateBulkIntervalPreview;$('pendingBtn').onclick=openPendingDialog;$('logoutBtn').onclick=signOut;$('refreshBtn').onclick=loadAll;$('seedBtn').onclick=seedStores;$('scheduleSearch').oninput=renderSchedulePicker;$('schedulePickerClient').onchange=renderSchedulePicker;document.querySelectorAll('[data-quick-date]').forEach(b=>b.onclick=()=>{$('scheduleDate').value=b.dataset.quickDate==='today'?today():tomorrow()});$('addScheduleSearch').oninput=renderAddSchedulePicker;$('addScheduleNewExtra')?.addEventListener('click',()=>{const sch=schedules.find(x=>x.id===$('addScheduleId').value);if(sch)openNewExtraForSchedule(sch)});$('addScheduleNewActivity')?.addEventListener('click',()=>{const sch=schedules.find(x=>x.id===$('addScheduleId').value);if(sch){$('addScheduleItemsDialog').close();openScheduleActivityDialog(sch)}});$('activityForm')&&( $('activityForm').onsubmit=async e=>{e.preventDefault();await saveScheduleActivity()} );$('programExtraForm')&&( $('programExtraForm').onsubmit=async e=>{e.preventDefault();await saveProgramExtra()} );$('contactsSearch')?.addEventListener('input',renderWorkContacts);$('newContactBtn')?.addEventListener('click',()=>openWorkContactDialog());$('contactForm')&&( $('contactForm').onsubmit=async e=>{e.preventDefault();await saveWorkContact()} );$('newExtraBtn').onclick=()=>{$('extraForm').reset();$('extraRequestDate').value=today();$('extraDate').value='';$('extraDeadline').value='';$('extraClient').value='eurospin';syncExtraClosureOptions($('extraClosureProfile'),'eurospin','eurospin');syncExtraNumberLabel();if($('extraIntesaOrdinaryMode'))$('extraIntesaOrdinaryMode').checked=false;if($('extraEurospinOrdinaryMode'))$('extraEurospinOrdinaryMode').checked=false;if($('extraPdfAutoReadStatus')){$('extraPdfAutoReadStatus').textContent='';$('extraPdfAutoReadStatus').classList.add('hidden')}clearDuplicateTargetWarning();if($('extraStoreSearch'))$('extraStoreSearch').value='';if($('extraStructured'))$('extraStructured').checked=false;if($('extraWorkItemsEditor'))$('extraWorkItemsEditor').innerHTML='';syncStructuredCreateUi();syncOrdinaryIncludedCreateUi();renderExtraStoreOptions();syncExtraDestinationUi();openDialog('extraDialog')};
function syncOrdinaryIncludedCreateUi(){
  const client=$('extraClient')?.value||'eurospin';
  const isIntesa=client==='intesa',isEurospin=client==='eurospin';
  $('extraIntesaOrdinaryModeWrap')?.classList.toggle('hidden',!isIntesa);
  $('extraEurospinOrdinaryModeWrap')?.classList.toggle('hidden',!isEurospin);
  if($('extraIntesaOrdinaryMode'))$('extraIntesaOrdinaryMode').checked=isIntesa&&$('extraClosureProfile')?.value==='intesa_ordinario';
  if($('extraEurospinOrdinaryMode'))$('extraEurospinOrdinaryMode').checked=isEurospin&&$('extraClosureProfile')?.value==='eurospin_ordinario';
}
function syncOrdinaryIncludedEditUi(){
  const client=$('extraEditClient')?.value||'eurospin';
  const isIntesa=client==='intesa',isEurospin=client==='eurospin';
  $('extraEditIntesaOrdinaryModeWrap')?.classList.toggle('hidden',!isIntesa);
  $('extraEditEurospinOrdinaryModeWrap')?.classList.toggle('hidden',!isEurospin);
  if($('extraEditIntesaOrdinaryMode'))$('extraEditIntesaOrdinaryMode').checked=isIntesa&&$('extraEditClosureProfile')?.value==='intesa_ordinario';
  if($('extraEditEurospinOrdinaryMode'))$('extraEditEurospinOrdinaryMode').checked=isEurospin&&$('extraEditClosureProfile')?.value==='eurospin_ordinario';
}
$('extraClient').onchange=()=>{
  const client=$('extraClient').value;
  if($('extraStoreSearch'))$('extraStoreSearch').value='';
  syncExtraClosureOptions($('extraClosureProfile'),client,client);
  syncExtraNumberLabel();
  syncOrdinaryIncludedCreateUi();
  renderExtraStoreOptions();
  syncExtraDestinationUi();
};
$('extraEditClient').onchange=()=>{
  const client=$('extraEditClient').value;
  if($('extraEditStoreSearch'))$('extraEditStoreSearch').value='';
  syncExtraClosureOptions($('extraEditClosureProfile'),client,client);
  syncOrdinaryIncludedEditUi();
  renderExtraEditStoreOptions();
  toggleExtraEditDestination();
};
$('extraIntesaOrdinaryMode')?.addEventListener('change',()=>{
  if($('extraIntesaOrdinaryMode').checked){
    $('extraClient').value='intesa';
    syncExtraClosureOptions($('extraClosureProfile'),'intesa','intesa_ordinario');
    $('extraDestination').value='store';
    renderExtraStoreOptions();
    $('extraWithOrdinary').checked=true;
    $('extraDestination').dispatchEvent(new Event('change'));
  }else if($('extraClient').value==='intesa'){
    $('extraClosureProfile').value='intesa';
  }
  syncOrdinaryIncludedCreateUi();
});
$('extraEurospinOrdinaryMode')?.addEventListener('change',()=>{
  if($('extraEurospinOrdinaryMode').checked){
    $('extraClient').value='eurospin';
    syncExtraClosureOptions($('extraClosureProfile'),'eurospin','eurospin_ordinario');
    $('extraDestination').value='store';
    renderExtraStoreOptions();
    $('extraWithOrdinary').checked=true;
    $('extraDestination').dispatchEvent(new Event('change'));
  }else if($('extraClient').value==='eurospin'){
    $('extraClosureProfile').value='eurospin';
  }
  syncOrdinaryIncludedCreateUi();
});
$('extraEditIntesaOrdinaryMode')?.addEventListener('change',()=>{
  if($('extraEditIntesaOrdinaryMode').checked){
    $('extraEditClient').value='intesa';
    syncExtraClosureOptions($('extraEditClosureProfile'),'intesa','intesa_ordinario');
    $('extraEditDestination').value='store';
    renderExtraEditStoreOptions($('extraEditStore').value);
    $('extraEditWithOrdinary').checked=true;
    toggleExtraEditDestination();
  }else if($('extraEditClient').value==='intesa'){
    $('extraEditClosureProfile').value='intesa';
  }
  syncOrdinaryIncludedEditUi();
});
$('extraEditEurospinOrdinaryMode')?.addEventListener('change',()=>{
  if($('extraEditEurospinOrdinaryMode').checked){
    $('extraEditClient').value='eurospin';
    syncExtraClosureOptions($('extraEditClosureProfile'),'eurospin','eurospin_ordinario');
    $('extraEditDestination').value='store';
    renderExtraEditStoreOptions($('extraEditStore').value);
    $('extraEditWithOrdinary').checked=true;
    toggleExtraEditDestination();
  }else if($('extraEditClient').value==='eurospin'){
    $('extraEditClosureProfile').value='eurospin';
  }
  syncOrdinaryIncludedEditUi();
});
$('extraClosureProfile').onchange=()=>{
  const mode=$('extraClosureProfile').value;
  if(mode==='intesa_ordinario'||mode==='eurospin_ordinario'){
    $('extraClient').value=mode==='intesa_ordinario'?'intesa':'eurospin';
    $('extraDestination').value='store';
    $('extraWithOrdinary').checked=true;
    renderExtraStoreOptions();
    $('extraDestination').dispatchEvent(new Event('change'));
  }
  syncOrdinaryIncludedCreateUi();
};
$('extraEditClosureProfile').onchange=()=>{
  const mode=$('extraEditClosureProfile').value;
  if(mode==='intesa_ordinario'||mode==='eurospin_ordinario'){
    $('extraEditClient').value=mode==='intesa_ordinario'?'intesa':'eurospin';
    $('extraEditDestination').value='store';
    $('extraEditWithOrdinary').checked=true;
    renderExtraEditStoreOptions($('extraEditStore').value);
    toggleExtraEditDestination();
  }
  syncOrdinaryIncludedEditUi();
};$('extraSearchInput').oninput=renderExtras;$('extraCategoryFilter').onchange=renderExtras;$('clearExtraSearch').onclick=()=>{$('extraSearchInput').value='';renderExtras();$('extraSearchInput').focus()};
function addDonePhotos(fileList){
  const incoming=[...fileList].filter(f=>f.type.startsWith('image/'));
  for(const file of incoming){
    const duplicate=donePhotoFiles.some(x=>x.name===file.name&&x.size===file.size&&x.lastModified===file.lastModified);
    if(!duplicate)donePhotoFiles.push(file);
  }
  renderDonePhotoSelection();
}
function renderDonePhotoSelection(){
  const label=$('photoLabel'),preview=$('donePhotoPreview'),clear=$('clearDonePhotos');
  if(label)label.textContent=donePhotoFiles.length?`${donePhotoFiles.length} foto pronte per l'invio`:'Nessuna foto';
  if(clear)clear.classList.toggle('hidden',!donePhotoFiles.length);
  if(!preview)return;preview.innerHTML='';
  donePhotoFiles.forEach((file,index)=>{
    const card=document.createElement('div');card.className='ordinary-photo-thumb';
    const url=URL.createObjectURL(file);card.innerHTML=`<img src="${url}" alt="Foto ${index+1}"><button type="button" aria-label="Rimuovi foto">×</button>`;
    card.querySelector('img').onload=()=>URL.revokeObjectURL(url);
    card.querySelector('button').onclick=()=>{donePhotoFiles.splice(index,1);renderDonePhotoSelection()};
    preview.appendChild(card);
  });
}
$('donePhotos').onchange=e=>{addDonePhotos(e.target.files);e.target.value=''};
$('doneCameraPhoto').onchange=e=>{addDonePhotos(e.target.files);e.target.value=''};
$('clearDonePhotos').onclick=()=>{donePhotoFiles=[];renderDonePhotoSelection()};
$('bulkIntervalForm').onsubmit=async e=>{e.preventDefault();
  const client=$('bulkIntervalClient').value,siteType=$('bulkIntervalSiteType').value,days=Number($('bulkIntervalDays').value),matches=matchingStoresForBulkInterval();
  if(!Number.isFinite(days)||days<1)return alert('Inserisci un intervallo valido, di almeno 1 giorno.');
  if(!matches.length)return alert('Non ci sono sedi appartenenti alla categoria selezionata.');
  const label=clientLabel({client_type:client});
  const detail=siteType==='all'?'tutte le sedi':$('bulkIntervalSiteType').selectedOptions[0].text.toLowerCase();
  if(!confirm(`Vuoi impostare l’intervallo a ${days} giorni per ${matches.length} ${detail} di ${label}?`))return;
  let q=sb.from('stores').update({intervallo_giorni:days}).eq('client_type',client);
  if(siteType!=='all')q=q.eq('site_type',siteType);
  const {error}=await q;if(error)return alert('Impossibile aggiornare gli intervalli: '+error.message);
  $('bulkIntervalDialog').close();toast(`Intervallo aggiornato per ${matches.length} sedi`);await loadAll();
};
$('storeForm').onsubmit=async e=>{e.preventDefault();const id=$('storeId').value,address=$('storeAddress').value.trim(),city=$('storeCity').value.trim(),addressChanged=address!==($('storeAddress').dataset.originalValue||'')||city!==($('storeCity').dataset.originalValue||''),lookupLat=Number($('storeAddress').dataset.lookupLat),lookupLon=Number($('storeAddress').dataset.lookupLon),hasLookup=Number.isFinite(lookupLat)&&Number.isFinite(lookupLon)&&$('storeAddress').dataset.lookupLat!==''&&$('storeAddress').dataset.lookupLon!=='';const payload={client_type:$('storeClient').value,site_type:$('storeSiteType').value,importo_fisso:$('storeSiteType').value==='atm'&&$('storeFixedAmount').value!==''?Number($('storeFixedAmount').value):null,nome:$('storeName').value.trim(),indirizzo:address||null,citta:city||null,ultimo_passaggio:$('storeLast').value||null,intervallo_giorni:$('storeNoInterval')?.checked?null:(Number($('storeInterval').value)||15),note:$('storeNotes').value.trim()||null};if(hasLookup){payload.route_latitude=lookupLat;payload.route_longitude=lookupLon;payload.route_geocoded_at=new Date().toISOString();payload.route_geocode_label=$('storeAddress').dataset.lookupLabel||[address,city,'Italia'].filter(Boolean).join(', ')}else if(addressChanged){payload.route_latitude=null;payload.route_longitude=null;payload.route_geocoded_at=null;payload.route_geocode_label=null}const r=id?await sb.from('stores').update(payload).eq('id',id):await sb.from('stores').insert(payload);if(r.error)return alert(r.error.message);$('storeDialog').close();toast('Sede salvata');await loadAll()};
$('doneHasNextVisitNote').onchange=e=>{$('doneNextVisitWrap').classList.toggle('hidden',!e.target.checked);if(!e.target.checked)$('doneNextVisitNote').value=''};
async function saveOrdinaryIntervention(continueAnotherDay,btn){
  const oldText=btn.textContent;btn.disabled=true;btn.textContent='Salvataggio…';
  try{
    const workers=admin()?[...$('doneWorkers').querySelectorAll('input:checked')].map(x=>x.value):[profile.id];
    if(!workers.length)throw new Error('Seleziona chi ha eseguito.');
    const files=[...donePhotoFiles],storeId=$('doneStoreId').value;
    let scheduleItemId=$('doneScheduleItemId').value||null;
    const originalScheduleItemId=scheduleItemId;
    const linkedToClose=originalScheduleItemId?linkedExtrasForScheduleItem(originalScheduleItemId):[];const linkedIncludedExtras=linkedToClose.filter(isOrdinaryIncludedExtra);const linkedEurospinTargets=linkedIncludedExtras.filter(isEurospinOrdinaryTarget);const linkedExtrasToClose=linkedToClose.filter(e=>!isOrdinaryIncludedExtra(e));
    // V112-31: una schermata rimasta aperta può contenere un schedule_item_id già rimosso
    // da una chiusura precedente. Verifica il riferimento prima di usarlo nell'intervento.
    if(scheduleItemId){
      const {data:liveScheduleItem,error:liveScheduleItemError}=await sb.from('schedule_items').select('id').eq('id',scheduleItemId).maybeSingle();
      if(liveScheduleItemError)throw liveScheduleItemError;
      if(!liveScheduleItem){
        console.warn('V112-31: schedule_item_id non più esistente; salvo l’intervento senza collegamento:',scheduleItemId);
        scheduleItemId=null;
        $('doneScheduleItemId').value='';
      }
    }
    const existingOpen=await fetchOpenMultiDayIntervention(storeId);
    if(scheduleItemId&&!existingOpen){
      const localDuplicate=interventions.some(i=>interventionHasScheduleItem(i,scheduleItemId)&&['in_attesa','convalidato'].includes(i.stato)&&!i.multi_day_open);
      if(localDuplicate)throw new Error('Questo passaggio è già stato chiuso o è in attesa di convalida.');
      const {data:existing,error:checkError}=await sb.from('interventions').select('id,stato,multi_day_open').eq('schedule_item_id',scheduleItemId).in('stato',['in_attesa','convalidato']).limit(1);
      if(checkError)throw checkError;if(existing?.some(x=>!x.multi_day_open))throw new Error('Questo passaggio è già stato chiuso o è in attesa di convalida.');
    }
    const nextVisitNote=continueAnotherDay?'':($('doneHasNextVisitNote').checked?$('doneNextVisitNote').value.trim():'');
    if(!continueAnotherDay&&$('doneHasNextVisitNote').checked&&!nextVisitNote)throw new Error('Scrivi cosa va fatto al prossimo passaggio.');
    if(!continueAnotherDay&&linkedEurospinTargets.length){
      const labels=linkedEurospinTargets.map(e=>`${e.numero_target?`Target ${e.numero_target} · `:''}${e.titolo||'Target Eurospin'}`).join('\n• ');
      const ok=confirm(`Prima di chiudere l’intervento:\n\nConfermi che l’operatore ha fatto chiudere in negozio ${linkedEurospinTargets.length===1?'il target Eurospin collegato':'tutti i target Eurospin collegati'}?\n\n• ${labels}\n\nPremi OK solo dopo aver verificato la chiusura in negozio.`);
      if(!ok)throw new Error('Chiusura annullata: fai chiudere il target in negozio prima di chiudere l’intervento ordinario.');
    }
    const day=$('doneDate').value,dayNote=$('doneNotes').value.trim();
    let data;
    let priorPhotoCount=0;
    if(existingOpen){const pc=await sb.from('attachments').select('id',{count:'exact',head:true}).eq('intervention_id',existingOpen.id).eq('tipo','foto_generica');if(pc.error)throw pc.error;priorPhotoCount=Number(pc.count)||0;

      const previousNotes=String(existingOpen.note||'').trim();
      const tagged=dayNote?`[${fmt(day)}] ${dayNote}`:'';
      const mergedNotes=[previousNotes,tagged].filter(Boolean).join('\n');
      const ids=[...(existingOpen.schedule_item_ids||[])];if(scheduleItemId&&!ids.includes(scheduleItemId))ids.push(scheduleItemId);
      const update={data_fine:day,note:mergedNotes||null,next_visit_note:nextVisitNote||null,multi_day_open:continueAnotherDay,schedule_item_ids:ids,closed_by:continueAnotherDay?null:profile.id,closed_at:continueAnotherDay?null:new Date().toISOString(),stato:continueAnotherDay?existingOpen.stato:(admin()?'convalidato':'in_attesa'),convalidato_da:continueAnotherDay?existingOpen.convalidato_da:(admin()?profile.id:null),convalidato_il:continueAnotherDay?existingOpen.convalidato_il:(admin()?new Date().toISOString():null),foto_attese:priorPhotoCount+files.length,foto_sincronizzate:priorPhotoCount,photo_sync_notified_at:continueAnotherDay?existingOpen.photo_sync_notified_at:null,photo_upload_status:files.length?'pending':(priorPhotoCount?'synced':'none'),photo_upload_error:null,photo_upload_updated_at:new Date().toISOString()};
      const r=await sb.from('interventions').update(update).eq('id',existingOpen.id).select().single();if(r.error)throw r.error;data=r.data;
      if(!continueAnotherDay){
        const {data:stillOpen,error:verifyError}=await sb.from('interventions').select('id').eq('store_id',storeId).eq('multi_day_open',true);
        if(verifyError)throw verifyError;
        if(stillOpen?.length){
          const otherIds=stillOpen.map(x=>x.id);
          const fix=await sb.from('interventions').update({multi_day_open:false,closed_by:profile.id,closed_at:new Date().toISOString()}).in('id',otherIds);
          if(fix.error)throw fix.error;
          otherIds.forEach(id=>{const j=interventions.findIndex(x=>x.id===id);if(j>=0)interventions[j]={...interventions[j],multi_day_open:false}});
        }
      }
      const existingWorkerIds=new Set(interventionWorkers.filter(w=>w.intervention_id===data.id).map(w=>w.profile_id));const missing=workers.filter(id=>!existingWorkerIds.has(id));if(missing.length){const ir=await sb.from('intervention_workers').insert(missing.map(profile_id=>({intervention_id:data.id,profile_id})));if(ir.error)throw ir.error}
      const idx=interventions.findIndex(x=>x.id===data.id);if(idx>=0)interventions[idx]=data;
    }else{
      const initialNote=continueAnotherDay&&dayNote?`[${fmt(day)}] ${dayNote}`:(dayNote||null);
      const payload={store_id:storeId,schedule_item_id:scheduleItemId,data_intervento:day,data_fine:day,note:initialNote,next_visit_note:nextVisitNote||null,multi_day_open:continueAnotherDay,schedule_item_ids:scheduleItemId?[scheduleItemId]:[],stato:admin()?'convalidato':'in_attesa',inserito_da:profile.id,convalidato_da:admin()?profile.id:null,convalidato_il:admin()?new Date().toISOString():null,closed_by:continueAnotherDay?null:profile.id,closed_at:continueAnotherDay?null:new Date().toISOString(),foto_attese:files.length,foto_sincronizzate:0,photo_sync_notified_at:null,photo_upload_status:files.length?'pending':'none',photo_upload_error:null,photo_upload_updated_at:new Date().toISOString()};
      let r=await sb.from('interventions').insert(payload).select().single();
      // V112-31: seconda rete di sicurezza contro una race condition. Se la voce di
      // programmazione sparisce tra il controllo sopra e l'INSERT, ritenta senza FK.
      if(r.error&&scheduleItemId&&(
        String(r.error.message||'').includes('interventions_schedule_item_id_fkey')||
        String(r.error.details||'').includes('interventions_schedule_item_id_fkey')||
        String(r.error.code||'')==='23503'
      )){
        console.warn('V112-31: schedule_item_id rimosso durante il salvataggio; ritento senza collegamento.',scheduleItemId);
        payload.schedule_item_id=null;
        payload.schedule_item_ids=[];
        scheduleItemId=null;
        $('doneScheduleItemId').value='';
        r=await sb.from('interventions').insert(payload).select().single();
      }
      if(r.error)throw r.error;data=r.data;
      const ir=await sb.from('intervention_workers').insert(workers.map(profile_id=>({intervention_id:data.id,profile_id})));if(ir.error)throw ir.error;interventions.unshift(data);
    }
    if(scheduleItemId){
      const nextState=continueAnotherDay?'completato':(admin()?'completato':'in_attesa');
      const linkedScheduleIds=new Set([scheduleItemId,...(Array.isArray(data?.schedule_item_ids)?data.schedule_item_ids:[])].filter(Boolean));
      const r=await sb.from('schedule_items').update({stato:nextState}).in('id',[...linkedScheduleIds]);
      if(r.error)console.warn('Stato programmazione non aggiornato:',r.error.message);
      scheduleItems.filter(x=>linkedScheduleIds.has(x.id)).forEach(x=>x.stato=nextState);
    }
    if(!continueAnotherDay&&admin()){const r=await sb.from('stores').update({ultimo_passaggio:day,next_visit_note:nextVisitNote||null}).eq('id',storeId);if(r.error)throw r.error}
    if(!continueAnotherDay&&linkedIncludedExtras.length){const includedState=admin()?'completato':'in_attesa',now=new Date().toISOString(),r=await sb.from('extras').update({stato:includedState,giorno_intervento:day,closed_by:profile.id,closed_at:now,convalidato_da:admin()?profile.id:null,convalidato_il:admin()?now:null}).in('id',linkedIncludedExtras.map(e=>e.id));if(r.error)throw new Error('Intervento salvato, ma aggiornamento ticket/target incluso non riuscito: '+r.error.message)}
    let photoSync=null;
    if(files.length){
      btn.textContent=`Sincronizzo ${files.length} foto…`;
      try{photoSync=await enqueueInterventionPhotos(data.id,files)}catch(photoErr){console.error('V112-37: sincronizzazione immediata fallita',photoErr);photoSync={ready:false,error:photoErr?.message||String(photoErr)}}
    }
    if(!continueAnotherDay&&!files.length){const ok=await notifyAdminClosure('intervention',data.id,0);if(ok)await sb.from('interventions').update({photo_sync_notified_at:new Date().toISOString(),foto_sincronizzate:priorPhotoCount,photo_upload_status:'none',photo_upload_error:null,photo_upload_updated_at:new Date().toISOString()}).eq('id',data.id)}
    if(!continueAnotherDay&&files.length&&photoSync?.ready)await flushReadyClosureNotifications(data.id);
    donePhotoFiles=[];renderDonePhotoSelection();$('doneDialog').close();
    if(files.length&&!photoSync?.ready){toast('⚠️ Intervento salvato, ma alcune foto NON sono sincronizzate');const extraErr=photoSync?.error?`\n\nErrore: ${photoSync.error}`:'';alert(`Intervento salvato, ma le foto non sono ancora tutte su Supabase.\n\nNon serve rifare l’intervento: le foto restano nella coda del telefono e Overgreen ritenterà automaticamente.\n\nApri Impostazioni → Sincronizzazione se compare “foto NON sincronizzate”.${extraErr}`)}else toast(continueAnotherDay?'Giornata salvata · intervento ancora aperto':files.length?`Intervento salvato · ${photoSync?.actual||files.length}/${photoSync?.expected||files.length} foto sincronizzate`:admin()?'Intervento convalidato':'Inviato a Lorenzo');
    try{await loadAll()}catch(refreshErr){console.warn('Aggiornamento dati non riuscito dopo il salvataggio:',refreshErr)}
    renderSchedules();renderDashboard();
    if(!continueAnotherDay&&linkedExtrasToClose.length){combinedExtraClosureQueue=linkedExtrasToClose.map(x=>({id:x.id}));setTimeout(()=>openNextCombinedExtraClosure(),250)}
  }catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=oldText}
}
$('doneForm').onsubmit=async e=>{e.preventDefault();await saveOrdinaryIntervention(false,e.submitter||$('doneForm').querySelector('[type=submit]'))};
$('doneContinueBtn').onclick=async e=>{await saveOrdinaryIntervention(true,e.currentTarget)};
$('historyEditForm').onsubmit=async e=>{e.preventDefault();if(!admin())return;const btn=e.submitter||$('historyEditForm').querySelector('[type=submit]'),oldText=btn.textContent;btn.disabled=true;btn.textContent='Salvataggio…';try{const id=$('historyEditId').value,workers=[...$('historyEditWorkers').querySelectorAll('input:checked')].map(x=>x.value),newPhotos=[...historyEditPhotoFiles];if(!workers.length)throw new Error('Seleziona almeno un operatore.');const {error}=await sb.from('interventions').update({data_intervento:$('historyEditDate').value,closed_at:$('historyEditClosedAt').value?new Date($('historyEditClosedAt').value).toISOString():null,note:$('historyEditNotes').value.trim()||null}).eq('id',id);if(error)throw error;let r=await sb.from('intervention_workers').delete().eq('intervention_id',id);if(r.error)throw r.error;r=await sb.from('intervention_workers').insert(workers.map(profile_id=>({intervention_id:id,profile_id})));if(r.error)throw r.error;for(let n=0;n<newPhotos.length;n++){btn.textContent=`Caricamento foto ${n+1}/${newPhotos.length}…`;const file=await compressImage(newPhotos[n]),safe=(file.name||`foto-${n+1}.jpg`).replace(/[^a-zA-Z0-9._-]/g,'-'),path=`interventi/${id}/${Date.now()}-${n}-${safe}`;await uploadFile(path,file);const added=await addAttachment({tipo:'foto_generica',intervention_id:id,storage_path:path,nome_file:file.name||safe,mime_type:file.type||'image/jpeg',dimensione_bytes:file.size,caricato_da:profile.id});if(!added){await sb.storage.from('documenti').remove([path]);throw new Error('Registrazione della nuova foto non riuscita.')}attachments.push(added)}const intervention=interventions.find(x=>x.id===id);if(intervention?.stato==='convalidato')await sb.from('stores').update({ultimo_passaggio:$('historyEditDate').value}).eq('id',intervention.store_id);historyEditPhotoFiles=[];$('historyEditDialog').close();toast(newPhotos.length?`Intervento aggiornato · ${newPhotos.length} foto aggiunte`:'Storico aggiornato');await loadAll();const st=stores.find(x=>x.id===intervention?.store_id);if(st)showHistory(st)}catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=oldText}};
$('userEditForm').onsubmit=async e=>{e.preventDefault();if(!admin())return;const payload={action:'update',user_id:$('userEditId').value,nome:$('userEditName').value.trim(),email:$('userEditEmail').value.trim(),ruolo:$('userEditRole').value,attivo:$('userEditActive').checked};if(!payload.nome||!payload.email)return alert('Nome ed email sono obbligatori.');const btn=e.submitter;btn.disabled=true;const old=btn.textContent;btn.textContent='Salvataggio…';try{const {data,error}=await sb.functions.invoke('manage-user',{body:payload});if(error||data?.error)throw new Error(data?.error||error.message);$('userEditDialog').close();toast('Utente aggiornato');await loadAll();await renderCloudEmployeeList()}catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=old}};
$('addScheduleItemsForm').onsubmit=async e=>{
  e.preventDefault();if(!admin())return;
  const scheduleId=$('addScheduleId').value,selected=[...$('addScheduleStores').querySelectorAll('input:checked')].map(x=>x.value);
  if(!selected.length)return alert('Seleziona almeno una sede o un extra.');
  const storeIds=selected.filter(v=>!v.startsWith('extra:')),extraIds=selected.filter(v=>v.startsWith('extra:')).map(v=>v.slice(6));
  const siblings=scheduleItems.filter(i=>i.schedule_id===scheduleId),maxPosition=siblings.reduce((m,i)=>Math.max(m,Number(i.posizione)||0),0);
  const sch=schedules.find(x=>x.id===scheduleId),members=scheduleMembers.filter(m=>m.schedule_id===scheduleId).map(m=>m.profile_id);
  let linkedCount=0;

  // V112-38: se l'extra era già assegnato a un'altra giornata/data, lo spostamento deve essere esplicito.
  const movingExtras=extraIds.map(id=>extras.find(x=>x.id===id)).filter(Boolean).filter(ex=>{
    if(ex.schedule_id&&ex.schedule_id!==scheduleId)return true;
    return !!(ex.giorno_intervento&&sch?.giorno&&ex.giorno_intervento!==sch.giorno&&extraIsScheduled(ex));
  });
  if(movingExtras.length){
    const lines=movingExtras.slice(0,8).map(ex=>{const oldSch=ex.schedule_id?schedules.find(s=>s.id===ex.schedule_id):null;const d=oldSch?.giorno||ex.giorno_intervento;return `• ${ex.titolo||'Extra'}${d?` · ${fmt(d)}`:''}`});
    if(movingExtras.length>8)lines.push(`• …e altri ${movingExtras.length-8}`);
    if(!confirm(`Hai selezionato ${movingExtras.length===1?'un extra già programmato':'degli extra già programmati'}.\n\n${lines.join('\n')}\n\nVuoi spostar${movingExtras.length===1?'lo':'li'} nella giornata del ${fmt(sch?.giorno)} e assegnar${movingExtras.length===1?'lo':'li'} alla squadra di questa giornata?`))return;
  }

  if(storeIds.length){
    const {data:inserted,error}=await sb.from('schedule_items').insert(storeIds.map((store_id,i)=>({schedule_id:scheduleId,tipo:'ordinario',store_id,posizione:maxPosition+i+1,stato:'da_fare'}))).select();
    if(error)return alert(error.message);
    try{linkedCount=(await linkOrdinaryExtras(scheduleId,sch?.giorno,members,inserted||[])).length}catch(err){return alert('Sedi aggiunte, ma associazione extra non riuscita: '+err.message)}
  }

  for(const extraId of extraIds){
    let r=await sb.from('extras').update({schedule_id:scheduleId,giorno_intervento:sch?.giorno||today(),posizione_giro:nextScheduleRoutePosition(scheduleId)}).eq('id',extraId);if(r.error)return alert(r.error.message);
    r=await sb.from('extra_workers').delete().eq('extra_id',extraId);if(r.error)return alert(r.error.message);
    if(members.length){r=await sb.from('extra_workers').insert(members.map(profile_id=>({extra_id:extraId,profile_id})));if(r.error)return alert(r.error.message)}
  }

  $('addScheduleItemsDialog').close();
  toast(`${storeIds.length?storeIds.length+' sedi':''}${storeIds.length&&extraIds.length?' · ':''}${extraIds.length?extraIds.length+' extra':''}${linkedCount?` · ${linkedCount} extra collegati`:''} aggiunti`);
  await loadAll()
};
$('scheduleForm').onsubmit=async e=>{
  e.preventDefault();
  const members=[...$('scheduleWorkers').querySelectorAll('input:checked')].map(x=>x.value);
  const selected=selectedScheduleStoreIds();
  const selectedExtraIds=selected.filter(v=>v.startsWith('extra:')).map(v=>v.slice(6));
  const selectedStoreIds=selected.filter(v=>!v.startsWith('extra:'));
  if(!members.length||!selected.length)return alert('Seleziona squadra e almeno una sede o un extra.');
  const day=$('scheduleDate').value;

  const {data:schedule,error:scheduleError}=await sb.from('schedules').insert({
    giorno:day,nota_generale:$('scheduleNote').value.trim()||null,creato_da:profile.id,
    auto_rollover:$('scheduleAutoRollover')?.checked!==false
  }).select().single();
  if(scheduleError)return alert(scheduleError.message);

  let r=await sb.from('schedule_members').insert(members.map(profile_id=>({schedule_id:schedule.id,profile_id})));
  if(r.error)return alert(r.error.message);

  let linkedCount=0;
  if(selectedStoreIds.length){
    r=await sb.from('schedule_items').insert(selectedStoreIds.map((store_id,i)=>({
      schedule_id:schedule.id,tipo:'ordinario',store_id,posizione:i+1,stato:'da_fare'
    }))).select();
    if(r.error)return alert(r.error.message);
    try{linkedCount=(await linkOrdinaryExtras(schedule.id,day,members,r.data||[])).length}
    catch(err){return alert('Programmazione creata, ma associazione extra non riuscita: '+err.message)}
  }

  for(const extraId of selectedExtraIds){
    let u=await sb.from('extras').update({schedule_id:schedule.id,giorno_intervento:day,posizione_giro:nextScheduleRoutePosition(schedule.id)}).eq('id',extraId);
    if(u.error)return alert('Impossibile programmare un extra: '+u.error.message);
    u=await sb.from('extra_workers').delete().eq('extra_id',extraId);if(u.error)return alert(u.error.message);
    u=await sb.from('extra_workers').insert(members.map(profile_id=>({extra_id:extraId,profile_id})));if(u.error)return alert(u.error.message);
  }

  const parts=[];
  if(selectedStoreIds.length)parts.push(`${selectedStoreIds.length} ${selectedStoreIds.length===1?'sede':'sedi'}`);
  if(selectedExtraIds.length)parts.push(`${selectedExtraIds.length} extra`);
  if(linkedCount)parts.push(`${linkedCount} extra collegati agli ordinari`);
  toast(`Programmazione salvata · ${parts.join(' · ')}`);
  $('scheduleForm').reset();resetSchedulePickerSelection();$('scheduleDate').value=tomorrow();if($('scheduleAutoRollover'))$('scheduleAutoRollover').checked=true;$('schedulePickerClient').value='all';renderSchedulePicker();await loadAll()
};
function extraStoreUiConfig(client){
  if(client==='intesa')return {single:'Filiale',plural:'filiali Intesa Sanpaolo',storeOption:'Filiale',help:'Verrà associato automaticamente quando programmi l’intervento ordinario della filiale.'};
  if(client==='privato')return {single:'Sede / cliente',plural:'sedi private',storeOption:'Sede / cliente',help:'Verrà associato automaticamente quando programmi l’intervento ordinario della sede.'};
  return {single:'Punto vendita',plural:'punti vendita Eurospin',storeOption:'Punto vendita',help:'Verrà associato automaticamente quando programmi l’intervento ordinario del punto vendita.'};
}
function storesForExtraClient(client){
  return stores
    .filter(s=>(s.client_type||'eurospin')===client)
    .slice()
    .sort((a,b)=>{
      const byName=String(a?.nome||'').localeCompare(String(b?.nome||''),'it',{sensitivity:'base',numeric:true});
      if(byName)return byName;
      return String(a?.citta||'').localeCompare(String(b?.citta||''),'it',{sensitivity:'base',numeric:true});
    });
}
function filterExtraStores(list,query){
  const q=normalizeMatchText(query);
  if(!q)return list;
  const starts=[],contains=[];
  for(const s of list){
    const name=normalizeMatchText(s?.nome),city=normalizeMatchText(s?.citta),address=normalizeMatchText(s?.indirizzo);
    if(name.startsWith(q)||city.startsWith(q))starts.push(s);
    else if(name.includes(q)||city.includes(q)||address.includes(q))contains.push(s);
  }
  return [...starts,...contains];
}
function syncExtraClosureOptions(select,client,selected){
  if(!select)return;
  const options=client==='intesa'
    ?[{value:'intesa',label:'Intesa · ticket, note e foto'},{value:'intesa_ordinario',label:'Intesa · ticket incluso nell’ordinario · nessun documento'}]
    :client==='privato'
      ?[{value:'privato',label:'Privato · note e foto'}]
      :[{value:'eurospin',label:'Eurospin · richiesta + 2 rapportini'},{value:'eurospin_ordinario',label:'Eurospin · target incluso nell’ordinario · conferma chiusura in negozio'}];
  select.innerHTML=options.map(o=>`<option value="${o.value}">${o.label}</option>`).join('');
  select.value=options.some(o=>o.value===selected)?selected:options[0].value;
}
function renderExtraStoreOptions(selected=null){
  const client=$('extraClient')?.value||'eurospin',cfg=extraStoreUiConfig(client),all=storesForExtraClient(client),sel=$('extraStore');
  if(!sel)return;
  const currentSelected=selected||sel.value||null;
  const query=$('extraStoreSearch')?.value||'';
  const list=filterExtraStores(all,query);
  $('extraStoreLabel')&&($('extraStoreLabel').textContent=cfg.single);
  $('extraStoreSearchLabel')&&($('extraStoreSearchLabel').textContent=`Cerca ${cfg.single.toLowerCase()}`);
  const destStore=$('extraDestination')?.querySelector('option[value="store"]');if(destStore)destStore.textContent=cfg.storeOption;
  $('extraWithOrdinaryHelp')&&($('extraWithOrdinaryHelp').textContent=cfg.help);
  sel.innerHTML=list.map(s=>`<option value="${s.id}" ${s.id===currentSelected?'selected':''}>${esc(s.nome)}${s.citta?` · ${esc(s.citta)}`:''}</option>`).join('');
  if(currentSelected&&list.some(s=>s.id===currentSelected))sel.value=currentSelected;
  const empty=$('extraStoreEmpty');
  if(empty){
    empty.textContent=query
      ?`Nessun risultato per “${query}”.`
      :`Nessuna ${cfg.single.toLowerCase()} disponibile per ${clientLabel({client_type:client})}.`;
    empty.classList.toggle('hidden',!!list.length);
  }
  sel.disabled=!list.length;
}
function syncExtraDestinationUi(){
  const ext=$('extraDestination').value==='external';
  $('extraStoreWrap').classList.toggle('hidden',ext);$('extraExternalWrap').classList.toggle('hidden',!ext);
}
$('extraDestination').onchange=syncExtraDestinationUi;
$('extraStoreSearch')?.addEventListener('input',()=>renderExtraStoreOptions());

function pdfDateToIso(value){
  const m=String(value||'').match(/\b(\d{1,2})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{4})\b/);
  if(!m)return null;
  return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
}
function normalizePdfTextItems(items){
  return (items||[]).map(x=>String(x?.str||'').trim()).filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
}
async function readPdfText(file){
  if(!file)throw new Error('PDF non selezionato');
  if(!window.pdfjsLib)throw new Error('Lettore PDF non disponibile');
  const bytes=new Uint8Array(await file.arrayBuffer());
  const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
  let text='';
  for(let pageNo=1;pageNo<=Math.min(pdf.numPages,3);pageNo++){
    const page=await pdf.getPage(pageNo);
    const content=await page.getTextContent();
    text+=' '+normalizePdfTextItems(content.items);
  }
  return text.replace(/\s+/g,' ').trim();
}
function detectExtraPdfClient(text){
  const t=String(text||'');
  let eurospin=0,intesa=0;
  if(/SPESA\s+INTELLIGENTE/i.test(t))eurospin+=5;
  if(/Richiesta\s+intervento\s+(?:n[°º.]?|nr\.?|numero)/i.test(t))eurospin+=5;
  if(/Punto\s+Vendita/i.test(t))eurospin+=2;
  if(/\bEURO\s*SPIN\b/i.test(t))eurospin+=3;

  if(/Intesa\s+Sanpaolo/i.test(t))intesa+=7;
  if(/\bTICKET\b/i.test(t))intesa+=3;
  if(/Apertura\s+ticket\s+di\s+guasto/i.test(t))intesa+=5;
  if(/Intervento\s+effettuato\/richiesto\s+presso/i.test(t))intesa+=3;
  if(/Codice\s+identificazione\s+chiusura/i.test(t))intesa+=2;

  if(eurospin>=6&&eurospin>intesa)return 'eurospin';
  if(intesa>=6&&intesa>eurospin)return 'intesa';
  return null;
}
function parseEurospinPdf(text){
  const targetMatch=text.match(/Richiesta\s+intervento\s+(?:n[°º.]?|nr\.?|numero)\s*[:\-]?\s*(\d{4,12})/i);
  const dateMatch=text.match(/Richiesta\s+intervento\s+(?:n[°º.]?|nr\.?|numero)\s*[:\-]?\s*\d{4,12}\s+del\s+(\d{1,2}\s*[./-]\s*\d{1,2}\s*[./-]\s*\d{4})/i);
  const pvMatch=text.match(/Punto\s+Vendita\s*:\s*SPESA\s+INTELLIGENTE\s+S\.p\.A\.\s+(.+?)(?=\s+Tel\.|\s+Fax\b|\s+buongiorno\b|\s+La\s+fattura\b)/i);
  const pvRaw=String(pvMatch?.[1]||'').replace(/\s+/g,' ').trim();
  return {client:'eurospin',number:targetMatch?.[1]||null,requestDate:pdfDateToIso(dateMatch?.[1]||''),locationText:pvRaw||null,title:null,description:null,category:null,text};
}
function parseIntesaPdf(text){
  // Il ticket può essere stampato con spazi tra le cifre: "1 7 8 4 3 3 1".
  const ticketArea=text.match(/\bTICKET\b\s+((?:\d\s*){5,14})/i);
  const ticket=String(ticketArea?.[1]||'').replace(/\D/g,'')||null;

  const dateMatch=text.match(/Apertura\s+ticket\s+di\s+guasto\s+il\s+(\d{1,2}\s*[./-]\s*\d{1,2}\s*[./-]\s*\d{4})/i);
  const cityAddress=text.match(/Citt[aà]\s*:\s*(.+?)\s+Indirizzo\s*:\s*(.+?)(?=\s+Richiesto\s+da\s*:|\s+Piano\s*:|\s+Descrizione\s+intervento\s*:)/i);
  const titleMatch=text.match(/Descrizione\s+intervento\s*:\s*(.+?)(?=\s+Dettaglio\s+della\s+richiesta\s*:|\s+Guasto\s*:)/i);
  const detailMatch=text.match(/Dettaglio\s+della\s+richiesta\s*:\s*(.+?)(?=\s+Guasto\s*:|\s+Apertura\s+ticket\s+di\s+guasto)/i);

  const city=String(cityAddress?.[1]||'').replace(/\s+/g,' ').trim();
  const address=String(cityAddress?.[2]||'').replace(/\s+/g,' ').trim();
  const title=String(titleMatch?.[1]||'').replace(/\s+/g,' ').trim()||null;
  const description=String(detailMatch?.[1]||'').replace(/\s+/g,' ').trim()||null;
  const combinedLocation=[city,address].filter(Boolean).join(' ');
  const combined=(title+' '+description).toLowerCase();
  const category=/sfalcio|erba|verde|potatur|siepe|alber|giardin/.test(combined)?'verde':/pulizi|lavagg|igien|sporco|rifiut/.test(combined)?'pulizie':null;

  return {client:'intesa',number:ticket,requestDate:pdfDateToIso(dateMatch?.[1]||''),locationText:combinedLocation||null,city,address,title,description,category,text};
}
function parseKnownExtraPdf(text){
  const client=detectExtraPdfClient(text);
  if(client==='eurospin')return parseEurospinPdf(text);
  if(client==='intesa')return parseIntesaPdf(text);
  return {client:null,number:null,requestDate:null,locationText:null,title:null,description:null,category:null,text};
}
function normalizeMatchText(value){
  return String(value||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/\b(spesa intelligente|s\.?p\.?a\.?|punto vendita|pv|filiale|intesa sanpaolo)\b/g,' ')
    .replace(/[^a-z0-9]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
function scoreStoreMatch(store,pdfText){
  const hay=normalizeMatchText(pdfText);
  if(!hay)return 0;
  const name=normalizeMatchText(store?.nome);
  const city=normalizeMatchText(store?.citta);
  const address=normalizeMatchText(store?.indirizzo);
  let score=0;
  if(name&&hay.includes(name))score+=7;
  if(city&&hay.includes(city))score+=5;
  if(address&&hay.includes(address))score+=9;
  const tokens=[...name.split(' '),...city.split(' '),...address.split(' ')].filter(x=>x.length>=4);
  score+=tokens.filter(t=>hay.includes(t)).length*2;
  return score;
}
function findStoreFromPdf(client,pdfText){
  const candidates=stores
    .filter(s=>(s.client_type||'eurospin')===client)
    .map(s=>({store:s,score:scoreStoreMatch(s,pdfText)}))
    .sort((a,b)=>b.score-a.score);
  if(!candidates.length||candidates[0].score<5)return null;
  if(candidates[1]&&candidates[1].score===candidates[0].score)return null;
  return candidates[0].store;
}
function syncExtraNumberLabel(){
  const client=$('extraClient')?.value||'eurospin';
  if($('extraNumberLabel'))$('extraNumberLabel').textContent=client==='intesa'?'Numero ticket':'Numero target';
  if($('extraTargetNumber'))$('extraTargetNumber').placeholder=client==='intesa'?'Es. 1784331':'Es. 123456';
}
function findExistingExtraByTarget(target,excludeId=null){
  const value=String(target||'').trim();
  if(!value)return null;
  return extras.find(e=>String(e.numero_target||'').trim()===value&&e.id!==excludeId)||null;
}
function clearDuplicateTargetWarning(){
  const box=$('extraDuplicateTargetWarning');
  if(box)box.classList.add('hidden');
  if($('extraDuplicateTargetText'))$('extraDuplicateTargetText').textContent='';
  if($('openDuplicateTargetExtra'))$('openDuplicateTargetExtra').dataset.extraId='';
}
function showDuplicateTargetWarning(extra){
  const box=$('extraDuplicateTargetWarning');
  if(!box||!extra)return;
  const st=stores.find(s=>s.id===extra.store_id);
  const place=st?.nome||extra.nome_esterno||'Sede non indicata';
  const date=extra.data_richiesta?fmt(extra.data_richiesta):'data non indicata';
  $('extraDuplicateTargetText').textContent=`${place} · ${extra.titolo||'Extra'} · richiesta ${date}`;
  $('openDuplicateTargetExtra').dataset.extraId=extra.id;
  box.classList.remove('hidden');
}
function checkDuplicateTargetField(){
  const existing=findExistingExtraByTarget($('extraTargetNumber')?.value);
  if(existing)showDuplicateTargetWarning(existing);
  else clearDuplicateTargetWarning();
  return existing;
}
$('openDuplicateTargetExtra')?.addEventListener('click',()=>{
  const id=$('openDuplicateTargetExtra').dataset.extraId;
  if(!id)return;
  $('extraDialog')?.close();
  openExtraById(id);
});
$('extraTargetNumber')?.addEventListener('input',checkDuplicateTargetField);

async function autoFillExtraFromPdf(file){
  const status=$('extraPdfAutoReadStatus');
  if(!status)return;
  status.classList.remove('hidden');
  status.textContent='🔎 Riconosco il documento…';
  try{
    const text=await readPdfText(file);
    const found=parseKnownExtraPdf(text);
    if(!found.client){
      status.textContent='⚠️ Documento non riconosciuto con sicurezza. Seleziona cliente e compila i dati manualmente.';
      return;
    }

    // Il PDF decide il cliente.
    $('extraClient').value=found.client;
    syncExtraClosureOptions($('extraClosureProfile'),found.client,found.client);
    syncOrdinaryIncludedCreateUi();
    syncExtraNumberLabel();
    renderExtraStoreOptions();
    syncExtraDestinationUi();

    const filled=[found.client==='intesa'?'Intesa Sanpaolo':'Eurospin'];

    if(found.number){
      $('extraTargetNumber').value=found.number;
      filled.push(`${found.client==='intesa'?'ticket':'target'} ${found.number}`);
      checkDuplicateTargetField();
    }else{
      clearDuplicateTargetWarning();
    }
    if(found.requestDate){
      $('extraRequestDate').value=found.requestDate;
      filled.push(`data ${fmt(found.requestDate)}`);
    }

    const matchedStore=findStoreFromPdf(found.client,found.locationText||found.text);
    if(matchedStore){
      $('extraDestination').value='store';
      if($('extraStoreSearch'))$('extraStoreSearch').value='';
      renderExtraStoreOptions(matchedStore.id);
      $('extraStore').value=matchedStore.id;
      syncExtraDestinationUi();
      filled.push(`${found.client==='intesa'?'filiale':'PV'} ${matchedStore.nome}`);
    }

    // Intesa contiene normalmente anche titolo e dettaglio della richiesta.
    if(found.client==='intesa'){
      if(found.title){
        $('extraTitle').value=found.title;
        filled.push('titolo');
      }
      if(found.description)$('extraDescription').value=found.description;
      if(found.category)$('extraCategory').value=found.category;
    }

    status.textContent=`✓ ${filled.join(' · ')}`;
    if(!matchedStore&&found.locationText){
      status.textContent+=` · ${found.client==='intesa'?'filiale':'PV'} letto dal PDF ma non trovato con certezza nell'anagrafica`;
    }
  }catch(err){
    console.warn('Lettura automatica PDF non riuscita',err);
    status.textContent='⚠️ Non riesco a leggere automaticamente questo PDF. Puoi compilare i dati manualmente.';
  }
}
$('extraPdf')?.addEventListener('change',()=>{
  const file=$('extraPdf').files?.[0];
  if(file)autoFillExtraFromPdf(file);
  else $('extraPdfAutoReadStatus')?.classList.add('hidden');
});

function workItemsForExtra(extraId){return extraWorkItems.filter(w=>w.extra_id===extraId).sort((a,b)=>(Number(a.posizione)||0)-(Number(b.posizione)||0))}
function isStructuredExtra(extra){return !!extra&&workItemsForExtra(extra.id).length>0}
function workPhotosForItem(itemId,tipo=null){return extraWorkItemPhotos.filter(p=>p.work_item_id===itemId&&(!tipo||p.tipo===tipo))}
function workNotesForItem(itemId){return extraWorkItemNotes.filter(n=>n.work_item_id===itemId).sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||'')))}
function workStateLabel(v){return {da_fare:'Da fare',completata:'Completata',da_proseguire:'Da proseguire',non_eseguita:'Non eseguita'}[v]||v}
function workStateIcon(v){return {da_fare:'○',completata:'✓',da_proseguire:'↪',non_eseguita:'—'}[v]||'○'}
function addWorkEditorRow(containerId,value='',itemId=''){
 const box=$(containerId);if(!box)return;const row=document.createElement('div');row.className='linked-extra-reminder';row.dataset.workItemId=itemId||'';row.style.marginBottom='8px';
 row.innerHTML=`<div style="display:flex;gap:8px;align-items:center"><input data-work-title style="flex:1" value="${esc(value)}" placeholder="Es. Lavaggio vetri"><button type="button" class="danger-btn compact-btn" data-remove-work>×</button></div>`;
 row.querySelector('[data-remove-work]').onclick=async()=>{const id=row.dataset.workItemId;if(id&&workPhotosForItem(id).length)return alert('Questa lavorazione ha già fotografie e non può essere eliminata.');if(id){if(!confirm('Eliminare questa lavorazione?'))return;const r=await sb.from('extra_work_items').delete().eq('id',id);if(r.error)return alert(r.error.message);extraWorkItems=extraWorkItems.filter(x=>x.id!==id)}row.remove()};box.appendChild(row)
}
function workEditorRows(containerId){return [...($(containerId)?.querySelectorAll('[data-work-title]')||[])].map((input,index)=>({id:input.closest('[data-work-item-id]')?.dataset.workItemId||null,titolo:input.value.trim(),posizione:index+1})).filter(x=>x.titolo)}
function syncStructuredCreateUi(){const on=$('extraStructured')?.checked===true;$('extraStructuredWrap')?.classList.toggle('hidden',!on);if(on&&!$('extraWorkItemsEditor')?.children.length)addWorkEditorRow('extraWorkItemsEditor')}
function syncStructuredEditUi(){const on=$('extraEditStructured')?.checked===true;$('extraEditStructuredWrap')?.classList.toggle('hidden',!on);if(on&&!$('extraEditWorkItemsEditor')?.children.length)addWorkEditorRow('extraEditWorkItemsEditor')}
$('extraStructured')?.addEventListener('change',syncStructuredCreateUi);$('extraEditStructured')?.addEventListener('change',syncStructuredEditUi);$('addExtraWorkItem')?.addEventListener('click',()=>addWorkEditorRow('extraWorkItemsEditor'));$('addExtraEditWorkItem')?.addEventListener('click',()=>addWorkEditorRow('extraEditWorkItemsEditor'));
async function createExtraWorkItems(extraId,rows){if(!rows.length)return;const {data,error}=await sb.from('extra_work_items').insert(rows.map((r,i)=>({extra_id:extraId,titolo:r.titolo,posizione:i+1,stato:'da_fare'}))).select();if(error)throw error;extraWorkItems.push(...(data||[]))}
async function syncExtraWorkItemsFromEditor(extraId){
 const enabled=$('extraEditStructured')?.checked===true,rows=enabled?workEditorRows('extraEditWorkItemsEditor'):[];if(enabled&&!rows.length)throw new Error('Aggiungi almeno una lavorazione.');const existing=workItemsForExtra(extraId),keep=new Set(rows.map(r=>r.id).filter(Boolean));
 for(const old of existing){if(keep.has(old.id))continue;if(workPhotosForItem(old.id).length)throw new Error(`Non puoi eliminare “${old.titolo}”: ha già fotografie.`);const r=await sb.from('extra_work_items').delete().eq('id',old.id);if(r.error)throw r.error}
 for(let i=0;i<rows.length;i++){const row=rows[i];if(row.id){const r=await sb.from('extra_work_items').update({titolo:row.titolo,posizione:i+1}).eq('id',row.id);if(r.error)throw r.error}else{const r=await sb.from('extra_work_items').insert({extra_id:extraId,titolo:row.titolo,posizione:i+1,stato:'da_fare'});if(r.error)throw r.error}}
}
function renderStructuredClose(extra){const wrap=$('closeStructuredWorkWrap'),box=$('closeStructuredWorkList'),items=workItemsForExtra(extra.id);if(!wrap||!box)return;wrap.classList.toggle('hidden',!items.length);box.innerHTML='';for(const item of items){const before=workPhotosForItem(item.id,'prima'),after=workPhotosForItem(item.id,'dopo'),row=document.createElement('section');row.className='linked-extra-reminder';row.dataset.closeWorkItem=item.id;row.style.margin='10px 0';row.innerHTML=`<strong>${esc(item.titolo)}</strong><label>Stato<select data-work-state><option value="da_fare">Da fare</option><option value="completata">✓ Completata</option><option value="da_proseguire">↪ Da proseguire</option><option value="non_eseguita">— Non eseguita</option></select></label><label>Nota <span class="muted">(obbligatoria se non eseguita)</span><textarea data-work-note placeholder="Dettagli della lavorazione">${esc(item.nota||'')}</textarea></label><div class="planner-grid"><label>📷 Prima <small class="muted">${before.length?`${before.length} già presenti`:''}</small><input data-work-before type="file" accept="image/*" multiple></label><label>📷 Dopo <small class="muted">${after.length?`${after.length} già presenti`:''}</small><input data-work-after type="file" accept="image/*" multiple></label></div>${before.length||after.length?`<p class="muted">Foto salvate: Prima ${before.length} · Dopo ${after.length}</p>`:''}`;row.querySelector('[data-work-state]').value=item.stato||'da_fare';box.appendChild(row)}}
function structuredCloseRows(){return [...($('closeStructuredWorkList')?.querySelectorAll('[data-close-work-item]')||[])].map(row=>({id:row.dataset.closeWorkItem,stato:row.querySelector('[data-work-state]')?.value||'da_fare',nota:row.querySelector('[data-work-note]')?.value.trim()||null,before:[...(row.querySelector('[data-work-before]')?.files||[])],after:[...(row.querySelector('[data-work-after]')?.files||[])]}))}
async function uploadWorkItemPhoto(workItemId,tipo,originalFile){const file=await compressImage(originalFile),safe=(file.name||originalFile.name||'foto.jpg').replace(/[^a-zA-Z0-9._-]/g,'-'),path=`extra-work/${workItemId}/${tipo}-${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;await uploadFile(path,file);const {data,error}=await sb.from('extra_work_item_photos').insert({work_item_id:workItemId,tipo,storage_path:path,nome_file:file.name||originalFile.name,mime_type:file.type||'image/jpeg',dimensione_bytes:file.size,caricato_da:profile.id}).select().single();if(error){await sb.storage.from('documenti').remove([path]);throw error}extraWorkItemPhotos.push(data);return data}
async function saveStructuredWorkProgress(extraId,finalMode=false,button=null){const rows=structuredCloseRows();if(!rows.length)return;if(finalMode){if(rows.some(r=>['da_fare','da_proseguire'].includes(r.stato)))throw new Error('Per la chiusura definitiva tutte le lavorazioni devono essere “Completata” oppure “Non eseguita”.');if(rows.some(r=>r.stato==='non_eseguita'&&!r.nota))throw new Error('Inserisci il motivo per ogni lavorazione “Non eseguita”.')}for(let i=0;i<rows.length;i++){const row=rows[i];if(button)button.textContent=`Salvo lavorazione ${i+1}/${rows.length}…`;const r=await sb.from('extra_work_items').update({stato:row.stato,nota:row.nota,updated_at:new Date().toISOString()}).eq('id',row.id).eq('extra_id',extraId);if(r.error)throw r.error;for(const f of row.before)await uploadWorkItemPhoto(row.id,'prima',f);for(const f of row.after)await uploadWorkItemPhoto(row.id,'dopo',f)}}

function workNoteAuthor(note){return profiles.find(p=>p.id===note.created_by)?.nome||'Operatore'}
function workNoteDate(note){try{return new Date(note.created_at).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return''}}
async function hydrateWorkProgressPhotos(row,item){
  for(const tipo of ['prima','dopo']){
    const box=row.querySelector(`[data-work-gallery="${tipo}"]`),photos=workPhotosForItem(item.id,tipo);if(!box)continue;
    if(!photos.length){box.innerHTML='<span class="muted">Nessuna foto</span>';continue}
    box.innerHTML='';
    for(const p of photos){
      const b=document.createElement('button');b.type='button';b.className='pending-review-photo';
      try{const url=await signedWorkPhotoUrl(p);b.innerHTML=`<img src="${url}" alt="${tipo}" loading="lazy"><span>Apri</span>`;b.onclick=()=>window.open(url,'_blank')}
      catch{b.innerHTML='<span>Foto non disponibile</span>'}
      box.appendChild(b)
    }
  }
}
function renderWorkProgressDialog(extra){
  const items=workItemsForExtra(extra.id),box=$('extraWorkProgressList');if(!box)return;
  $('extraWorkProgressExtraId').value=extra.id;const st=stores.find(s=>s.id===extra.store_id);
  $('extraWorkProgressTitle').textContent=`Lavorazioni · ${extra.titolo}`;
  $('extraWorkProgressInfo').innerHTML=`<strong>${esc(st?.nome||extra.nome_esterno||'')}</strong><p>${esc(extra.titolo)}</p><small>${items.length} lavorazioni · salva l’avanzamento senza chiudere l’extra.</small>`;
  box.innerHTML='';
  for(const item of items){
    const notes=workNotesForItem(item.id),before=workPhotosForItem(item.id,'prima'),after=workPhotosForItem(item.id,'dopo');
    const row=document.createElement('section');row.className='linked-extra-reminder';row.dataset.progressWorkItem=item.id;row.style.margin='12px 0';
    row.innerHTML=`<div class="extra-card-heading"><strong>${esc(item.titolo)}</strong><span>${workStateIcon(item.stato)} ${esc(workStateLabel(item.stato))}</span></div>
    <label>Stato<select data-progress-state><option value="da_fare">Da fare</option><option value="completata">✓ Completata</option><option value="da_proseguire">↪ Da proseguire</option><option value="non_eseguita">— Non eseguita</option></select></label>
    <div><strong>Note precedenti</strong>${notes.length?notes.map(n=>`<div class="history-note"><small>${esc(workNoteDate(n))} · ${esc(workNoteAuthor(n))}</small><br>${esc(n.nota)}</div>`).join(''):'<p class="muted">Nessuna nota.</p>'}</div>
    <label>Aggiungi nota<textarea data-progress-note placeholder="Nuovo aggiornamento"></textarea></label>
    <div class="planner-grid">
      <div><strong>📷 Prima (${before.length})</strong><div class="pending-review-photos" data-work-gallery="prima"></div><label class="file-label compact-photo-input"><span>＋ Aggiungi foto Prima</span><input data-progress-before type="file" accept="image/*" multiple></label></div>
      <div><strong>📷 Dopo (${after.length})</strong><div class="pending-review-photos" data-work-gallery="dopo"></div><label class="file-label compact-photo-input"><span>＋ Aggiungi foto Dopo</span><input data-progress-after type="file" accept="image/*" multiple></label></div>
    </div>`;
    row.querySelector('[data-progress-state]').value=item.stato||'da_fare';
    box.appendChild(row);
    hydrateWorkProgressPhotos(row,item)
  }
}
function openExtraWorkProgress(extra){if(!extra||!isStructuredExtra(extra))return;renderWorkProgressDialog(extra);openDialog('extraWorkProgressDialog')}
async function saveIndependentWorkProgress(){
  const btn=$('saveExtraWorkProgress'),old=btn.textContent,id=$('extraWorkProgressExtraId').value,extra=extras.find(e=>e.id===id);if(!extra)return;
  const rows=[...$('extraWorkProgressList').querySelectorAll('[data-progress-work-item]')];
  btn.disabled=true;
  try{
    for(let i=0;i<rows.length;i++){
      btn.textContent=`Salvo ${i+1}/${rows.length}…`;
      const row=rows[i],itemId=row.dataset.progressWorkItem,state=row.querySelector('[data-progress-state]').value,newNote=row.querySelector('[data-progress-note]').value.trim();
      const r=await sb.from('extra_work_items').update({stato:state,updated_at:new Date().toISOString(),...(newNote?{nota:newNote}:{})}).eq('id',itemId).eq('extra_id',id);
      if(r.error)throw r.error;
      const local=extraWorkItems.find(x=>x.id===itemId);if(local){local.stato=state;if(newNote)local.nota=newNote}
      if(newNote){
        const nr=await sb.from('extra_work_item_notes').insert({work_item_id:itemId,nota:newNote,created_by:profile.id}).select().single();
        if(nr.error)throw nr.error;
        extraWorkItemNotes.push(nr.data)
      }
      for(const f of [...row.querySelector('[data-progress-before]').files])await uploadWorkItemPhoto(itemId,'prima',f);
      for(const f of [...row.querySelector('[data-progress-after]').files])await uploadWorkItemPhoto(itemId,'dopo',f);
    }
    toast('Avanzamento salvato · extra ancora aperto');
    renderWorkProgressDialog(extra);
    renderExtras()
  }catch(err){alert('Salvataggio avanzamento non riuscito: '+(err?.message||String(err)))}finally{btn.disabled=false;btn.textContent=old}
}
$('extraWorkProgressForm')?.addEventListener('submit',e=>{e.preventDefault();saveIndependentWorkProgress()});

async function signedWorkPhotoUrl(p){const {data,error}=await sb.storage.from('documenti').createSignedUrl(p.storage_path,900);if(error)throw error;return data.signedUrl}
async function fetchWorkPhotoBytes(p){const url=await signedWorkPhotoUrl(p),res=await fetch(url);if(!res.ok)throw new Error('Foto non disponibile');return new Uint8Array(await res.arrayBuffer())}

$('extraForm').onsubmit=async e=>{e.preventDefault();const workers=[...$('extraWorkers').querySelectorAll('input:checked')].map(x=>x.value),external=$('extraDestination').value==='external',pdf=$('extraPdf').files[0],closureMode=$('extraClosureProfile').value;if(!pdf)return alert('Allega il PDF della richiesta.');const duplicateTarget=findExistingExtraByTarget($('extraTargetNumber').value);if(duplicateTarget){showDuplicateTargetWarning(duplicateTarget);const st=stores.find(s=>s.id===duplicateTarget.store_id);return alert(`Target ${$('extraTargetNumber').value.trim()} già presente${st?.nome?` su ${st.nome}`:''}. Apri l’extra esistente invece di crearne un duplicato.`);}const structuredRows=$('extraStructured')?.checked?workEditorRows('extraWorkItemsEditor'):[];if($('extraStructured')?.checked&&!structuredRows.length)return alert('Aggiungi almeno una lavorazione.');if(!external){const chosen=stores.find(s=>s.id===$('extraStore').value);if(!chosen)return alert('Seleziona una sede valida.');if((chosen.client_type||'eurospin')!==$('extraClient').value)return alert('La sede selezionata non appartiene al cliente scelto.');}if(closureMode==='intesa_ordinario'||closureMode==='eurospin_ordinario'){const expected=closureMode==='intesa_ordinario'?'intesa':'eurospin';if($('extraClient').value!==expected)return alert('Il modello di chiusura non corrisponde al cliente selezionato.');if(external)return alert(closureMode==='intesa_ordinario'?'Il ticket Intesa incluso nell’ordinario deve essere collegato a una filiale.':'Il target Eurospin incluso nell’ordinario deve essere collegato a un punto vendita.');if(!$('extraWithOrdinary').checked)return alert('Per questa modalità attiva “Da fare insieme al passaggio ordinario”.');}const payload={client_type:$('extraClient').value,closure_profile:$('extraClosureProfile').value,deadline_at:$('extraDeadline').value?new Date($('extraDeadline').value).toISOString():null,store_id:external?null:$('extraStore').value,nome_esterno:external?$('extraExternalName').value.trim():null,indirizzo_esterno:external?$('extraExternalAddress').value.trim():null,titolo:$('extraTitle').value.trim(),numero_target:$('extraTargetNumber').value.trim()||null,categoria_target:$('extraCategory').value,descrizione:$('extraDescription').value.trim()||null,data_richiesta:$('extraRequestDate').value,giorno_intervento:$('extraDate').value||null,note_lorenzo:null,stato:'programmato',con_ordinario:$('extraWithOrdinary').checked,creato_da:profile.id};const {data,error}=await sb.from('extras').insert(payload).select().single();if(error){const msg=String(error.message||error);if((msg.includes("numero_target")||msg.includes("categoria_target"))&&msg.includes("schema cache"))return alert("Database non aggiornato: esegui MIGRAZIONE-V74.sql su Supabase, poi riprova.");if(msg.includes("con_ordinario")&&msg.includes("schema cache"))return alert("Database non aggiornato: esegui MIGRAZIONE-V59.sql su Supabase, poi riprova.");return alert(msg)}if(structuredRows.length){try{await createExtraWorkItems(data.id,structuredRows)}catch(workErr){await sb.from('extras').delete().eq('id',data.id);return alert('Impossibile creare le lavorazioni. Esegui la migrazione V108 su Supabase.\n'+workErr.message)}}if(workers.length){const r=await sb.from('extra_workers').insert(workers.map(profile_id=>({extra_id:data.id,profile_id})));if(r.error)return alert(r.error.message)}if(payload.giorno_intervento&&workers.length){try{extraWorkers.push(...workers.map(profile_id=>({extra_id:data.id,profile_id})));await ensureStandaloneExtraInProgramming(data,workers)}catch(err){return alert('Extra creato, ma inserimento nella programmazione non riuscito: '+err.message)}}const path=`extra/${data.id}/richiesta-${Date.now()}.pdf`;try{await uploadFile(path,pdf);await addAttachment({tipo:'pdf_richiesta',extra_id:data.id,storage_path:path,nome_file:pdf.name,mime_type:pdf.type,dimensione_bytes:pdf.size,caricato_da:profile.id})}catch(err){return alert('Extra creato, ma PDF non caricato: '+err.message)}$('extraDialog').close();toast(workers.length?'Extra creato':'Extra creato · da programmare e assegnare');await loadAll()};
$('extraEditDestination').onchange=toggleExtraEditDestination;
$('extraEditStoreSearch')?.addEventListener('input',()=>renderExtraEditStoreOptions());
$('extraEditForm').onsubmit=async e=>{
  e.preventDefault();if(!admin())return;
  const id=$('extraEditId').value,workers=[...$('extraEditWorkers').querySelectorAll('input:checked')].map(x=>x.value),external=$('extraEditDestination').value==='external',closureMode=$('extraEditClosureProfile').value;
  const duplicateEditTarget=findExistingExtraByTarget($('extraEditTargetNumber').value,id);
  if(duplicateEditTarget){const st=stores.find(s=>s.id===duplicateEditTarget.store_id);return alert(`Target ${$('extraEditTargetNumber').value.trim()} già usato${st?.nome?` su ${st.nome}`:''}.`);}if(!external){const chosen=stores.find(s=>s.id===$('extraEditStore').value);if(!chosen)return alert('Seleziona una sede valida.');if((chosen.client_type||'eurospin')!==$('extraEditClient').value)return alert('La sede selezionata non appartiene al cliente scelto.');}if(closureMode==='intesa_ordinario'||closureMode==='eurospin_ordinario'){const expected=closureMode==='intesa_ordinario'?'intesa':'eurospin';if($('extraEditClient').value!==expected)return alert('Il modello di chiusura non corrisponde al cliente selezionato.');if(external)return alert(closureMode==='intesa_ordinario'?'Il ticket Intesa incluso nell’ordinario deve essere collegato a una filiale.':'Il target Eurospin incluso nell’ordinario deve essere collegato a un punto vendita.');if(!$('extraEditWithOrdinary').checked)return alert('Per questa modalità attiva “Da fare insieme al passaggio ordinario”.');}
  const payload={client_type:$('extraEditClient').value,closure_profile:$('extraEditClosureProfile').value,deadline_at:$('extraEditDeadline').value?new Date($('extraEditDeadline').value).toISOString():null,store_id:external?null:$('extraEditStore').value,nome_esterno:external?$('extraEditExternalName').value.trim():null,indirizzo_esterno:external?$('extraEditExternalAddress').value.trim():null,titolo:$('extraEditTitle').value.trim(),numero_target:$('extraEditTargetNumber').value.trim()||null,categoria_target:$('extraEditCategory').value,descrizione:$('extraEditDescription').value.trim()||null,data_richiesta:$('extraEditRequestDate').value,giorno_intervento:$('extraEditDate').value||null,con_ordinario:$('extraEditWithOrdinary').checked};
  let r=await sb.from('extras').update(payload).eq('id',id);if(r.error)return alert(r.error.message);
  r=await sb.from('extra_workers').delete().eq('extra_id',id);if(r.error)return alert(r.error.message);
  if(workers.length){r=await sb.from('extra_workers').insert(workers.map(profile_id=>({extra_id:id,profile_id})));if(r.error)return alert(r.error.message)}
  const editedExtra=extras.find(x=>x.id===id)||{id,...payload};Object.assign(editedExtra,payload);extraWorkers=extraWorkers.filter(w=>w.extra_id!==id).concat(workers.map(profile_id=>({extra_id:id,profile_id})));
  if(payload.giorno_intervento&&workers.length){try{await ensureStandaloneExtraInProgramming(editedExtra,workers)}catch(err){return alert('Dati salvati, ma inserimento nella programmazione non riuscito: '+err.message)}}
  else if(editedExtra.schedule_id&&!editedExtra.schedule_item_id){r=await sb.from('extras').update({schedule_id:null,posizione_giro:null}).eq('id',id);if(r.error)return alert(r.error.message);editedExtra.schedule_id=null;editedExtra.posizione_giro=null}
  const pdf=$('extraEditPdf').files[0];if(pdf){const old=attachments.find(a=>a.extra_id===id&&a.tipo==='pdf_richiesta');if(old){await sb.storage.from('documenti').remove([old.storage_path]);await sb.from('attachments').delete().eq('id',old.id)}const path=`extra/${id}/richiesta-${Date.now()}.pdf`;try{await uploadFile(path,pdf);await addAttachment({tipo:'pdf_richiesta',extra_id:id,storage_path:path,nome_file:pdf.name,mime_type:pdf.type,dimensione_bytes:pdf.size,caricato_da:profile.id})}catch(err){return alert('Dati salvati, ma nuovo PDF non caricato: '+err.message)}}
  await syncExtraWorkItemsFromEditor(id);$('extraEditDialog').close();toast('Extra aggiornato');await loadAll();
};
$('duplicateScheduleForm').onsubmit=async e=>{e.preventDefault();const source=$('duplicateScheduleId').value;if(source)openReuseScheduleDialog({type:'schedule',id:source});$('duplicateScheduleDialog').close()};
$('reuseScheduleForm').onsubmit=async e=>{e.preventDefault();if(!admin())return;const btn=e.submitter||$('reuseScheduleForm').querySelector('[type=submit]'),old=btn.textContent;btn.disabled=true;btn.textContent='Creazione…';try{await createScheduleFromReuse()}finally{btn.disabled=false;btn.textContent=old}};
$('reuseScheduleSearch').oninput=renderReuseScheduleStores;
$('openScheduleHistoryBtn').onclick=openScheduleHistory;
$('openActivityHistoryBtn').onclick=openActivityHistory;
$('activityCompleteForm').onsubmit=e=>{e.preventDefault();saveActivityCompletion()};
$('activityCompleteCameraPhoto').onchange=e=>{addActivityCompletePhotos(e.target.files);e.target.value=''};
$('activityCompletePhotos').onchange=e=>{addActivityCompletePhotos(e.target.files);e.target.value=''};
$('clearActivityCompletePhotos').onclick=resetActivityCompletePhotos;
$('activityConsuntivoForm').onsubmit=e=>{e.preventDefault();saveActivityConsuntivo()};
$('activityHistorySearch').oninput=renderActivityHistory;
$('activityHistoryFilter').onchange=renderActivityHistory;
$('openSavedRoutesBtn').onclick=openSavedRoutes;
$('editExtraClosureForm').onsubmit=async e=>{
  e.preventDefault();if(!admin())return;
  const btn=e.submitter||$('editExtraClosureForm').querySelector('[type=submit]'),oldText=btn.textContent;btn.disabled=true;btn.textContent='Salvataggio…';
  try{
    const id=$('editExtraClosureId').value,notes=$('editExtraClosureNotes').value.trim()||null;
    let r=await sb.from('extras').update({note_lorenzo:notes,closed_at:$('editExtraClosureClosedAt').value?new Date($('editExtraClosureClosedAt').value).toISOString():null}).eq('id',id);if(r.error)throw r.error;
    const docs=[['pdf_richiesta',$('editClosureRequest').files[0]],['rapportino_overgreen',$('editClosureOvergreen').files[0]],['rapportino_eurospin',$('editClosureEurospin').files[0]]];
    for(const [tipo,file] of docs)if(file){btn.textContent=`Sostituisco ${attachmentLabel({tipo})}…`;await replaceExtraAttachment(id,tipo,file)}
    const photos=[...$('editExtraClosurePhotos').files];
    for(let n=0;n<photos.length;n++){
      btn.textContent=`Carico foto ${n+1}/${photos.length}…`;const compressed=await compressImage(photos[n]),safe=(compressed.name||photos[n].name||`foto-${n+1}.jpg`).replace(/[^a-zA-Z0-9._-]/g,'-'),path=`extra/${id}/foto-${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;
      await uploadFile(path,compressed);const added=await addAttachment({tipo:'foto_generica',extra_id:id,storage_path:path,nome_file:compressed.name||photos[n].name,mime_type:compressed.type||'image/jpeg',dimensione_bytes:compressed.size,caricato_da:profile.id});if(!added){await sb.storage.from('documenti').remove([path]);throw new Error('Registrazione della foto non riuscita.')}
    }
    $('editExtraClosureDialog').close();$('editExtraClosureForm').reset();toast('Chiusura aggiornata');await loadAll();
  }catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=oldText}
};

function openExtraClosureDialog(extra,fromOrdinary=false){
  if(!extra)return;
  $('closeExtraForm').reset();
  closeExtraPhotoFiles=[];renderCloseExtraPhotoSelection();
  $('closeExtraId').value=extra.id;
  $('closeExtraForm').dataset.profile=closureProfile(extra);
  const euro=closureProfile(extra)==='eurospin',intesa=closureProfile(extra)==='intesa';
  $('closeEurospinFields').classList.toggle('hidden',!euro);
  $('closeIntesaFields').classList.toggle('hidden',!intesa);
  // I requisiti della chiusura definitiva vengono verificati via JS: nel parziale
  // il file Eurospin non deve essere obbligatorio né caricato.
  $('reportEurospin').required=false;$('reportOvergreen').required=false;$('closeExtraTicket').required=false;
  $('closeExtraNotes').value=extra.note_lorenzo||'';
  const existingOvergreen=attachments.find(a=>a.extra_id===extra.id&&a.tipo==='rapportino_overgreen');
  const overInfo=$('closeExtraExistingOvergreen');
  if(overInfo){overInfo.classList.toggle('hidden',!existingOvergreen);overInfo.textContent=existingOvergreen?`✓ File Overgreen già presente: ${existingOvergreen.nome_file||'documento caricato'}`:''}
  const partialStatus=$('closeExtraPartialStatus');
  if(partialStatus){const isPartial=extra.stato==='da_integrare';partialStatus.classList.toggle('hidden',!isPartial);partialStatus.innerHTML=isPartial?`<strong>↪ Extra già salvato come parziale</strong><p>Puoi aggiungere altre foto o un nuovo file Overgreen e lasciarlo ancora aperto, oppure eseguire ora la chiusura definitiva.</p>`:''}
  renderStructuredClose(extra);
  const structured=isStructuredExtra(extra);
  if($('closeExtraPartialBtn'))$('closeExtraPartialBtn').classList.toggle('hidden',structured);
  const partialHelp=$('closeExtraPartialBtn')?.nextElementSibling;
  if(partialHelp)partialHelp.classList.toggle('hidden',structured);
  const st=stores.find(s=>s.id===extra.store_id);
  const title=$('closeExtraTitle');
  if(title)title.textContent=fromOrdinary?`Completa extra · ${extra.titolo}`:(extra.stato==='da_integrare'?'Continua extra':'Chiudi extra');
  const info=$('closeExtraLinkedInfo');
  if(info){
    info.classList.toggle('hidden',!fromOrdinary);
    info.innerHTML=fromOrdinary?`<strong>Extra collegato al passaggio ordinario</strong><span>${esc(st?.nome||extra.nome_esterno||'')} · ${esc(extra.titolo)}</span><small>Se oggi non è concluso puoi salvarlo come parziale: resterà aperto e potrai proseguirlo in seguito.</small>`:'';
  }
  openDialog('closeExtraDialog');
}

function openNextCombinedExtraClosure(){
  const next=combinedExtraClosureQueue.shift();
  if(!next)return;
  const refreshed=extras.find(e=>e.id===next.id)||next;
  openExtraClosureDialog(refreshed,true);
}


function addCloseExtraPhotos(fileList){
  const incoming=[...fileList].filter(f=>f.type.startsWith('image/'));
  for(const file of incoming){
    const duplicate=closeExtraPhotoFiles.some(x=>x.name===file.name&&x.size===file.size&&x.lastModified===file.lastModified);
    if(!duplicate)closeExtraPhotoFiles.push(file);
  }
  renderCloseExtraPhotoSelection();
}
function renderCloseExtraPhotoSelection(){
  const label=$('closeExtraPhotoLabel'),preview=$('closeExtraPhotoPreview'),clear=$('clearCloseExtraPhotos');
  if(label)label.textContent=closeExtraPhotoFiles.length?`${closeExtraPhotoFiles.length} foto pronte per l'invio`:'Nessuna foto';
  if(clear)clear.classList.toggle('hidden',!closeExtraPhotoFiles.length);
  if(!preview)return;
  preview.innerHTML='';
  closeExtraPhotoFiles.forEach((file,index)=>{
    const card=document.createElement('div');card.className='ordinary-photo-thumb';
    const url=URL.createObjectURL(file);
    card.innerHTML=`<img src="${url}" alt="Foto ${index+1}"><button type="button" aria-label="Rimuovi foto">×</button>`;
    card.querySelector('img').onload=()=>URL.revokeObjectURL(url);
    card.querySelector('button').onclick=()=>{closeExtraPhotoFiles.splice(index,1);renderCloseExtraPhotoSelection()};
    preview.appendChild(card);
  });
}
$('closeExtraPhotos').onchange=e=>{addCloseExtraPhotos(e.target.files);e.target.value=''};
$('closeExtraCameraPhoto').onchange=e=>{addCloseExtraPhotos(e.target.files);e.target.value=''};
$('clearCloseExtraPhotos').onclick=()=>{closeExtraPhotoFiles=[];renderCloseExtraPhotoSelection()};

async function saveExtraPartial(){
  const btn=$('closeExtraPartialBtn');if(!btn)return;
  const oldText=btn.textContent;btn.disabled=true;btn.textContent='Salvo parziale…';
  const uploadedPaths=[];
  try{
    const id=$('closeExtraId').value,extra=extras.find(x=>x.id===id),profileMode=$('closeExtraForm').dataset.profile||'eurospin';
    if(!extra)throw new Error('Extra non trovato. Aggiorna i dati e riprova.');
    const notes=$('closeExtraNotes').value.trim()||null,photos=[...closeExtraPhotoFiles];
    const overgreenFile=profileMode==='eurospin'?$('reportOvergreen').files[0]:null;
    if(profileMode==='eurospin'&&$('reportEurospin').files[0])throw new Error('Nel parziale non caricare il rapportino Eurospin: va inserito solo alla chiusura definitiva.');

    if(overgreenFile){
      btn.textContent='Carico file Overgreen…';
      const file=overgreenFile.type?.startsWith('image/')?await compressImage(overgreenFile):overgreenFile;
      const safe=(file.name||overgreenFile.name||'overgreen.pdf').replace(/[^a-zA-Z0-9._-]/g,'-');
      const path=`extra/${id}/rapportino_overgreen-${Date.now()}-${safe}`;
      await uploadFile(path,file);uploadedPaths.push(path);
      const previous=attachments.filter(a=>a.extra_id===id&&a.tipo==='rapportino_overgreen');
      const added=await addAttachment({tipo:'rapportino_overgreen',extra_id:id,storage_path:path,nome_file:file.name||overgreenFile.name,mime_type:file.type||overgreenFile.type,dimensione_bytes:file.size,caricato_da:profile.id});
      if(!added)throw new Error('Registrazione del file Overgreen non riuscita.');
      for(const old of previous){await sb.storage.from('documenti').remove([old.storage_path]);await sb.from('attachments').delete().eq('id',old.id)}
    }

    for(let n=0;n<photos.length;n++){
      btn.textContent=`Carico foto ${n+1}/${photos.length}…`;
      const compressed=await compressImage(photos[n]);
      const safe=(compressed.name||photos[n].name||`foto-${n+1}.jpg`).replace(/[^a-zA-Z0-9._-]/g,'-');
      const path=`extra/${id}/foto-${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;
      await uploadFile(path,compressed);uploadedPaths.push(path);
      const added=await addAttachment({tipo:'foto_generica',extra_id:id,storage_path:path,nome_file:compressed.name||photos[n].name,mime_type:compressed.type||'image/jpeg',dimensione_bytes:compressed.size,caricato_da:profile.id});
      if(!added)throw new Error('Registrazione foto non riuscita.');
    }

    
    const {error}=await sb.from('extras').update({stato:'da_integrare',note_lorenzo:notes,closed_by:null,closed_at:null}).eq('id',id);
    if(error)throw error;
    notifyAdminClosure('extra',id,photos.length);
    $('closeExtraDialog').close();$('closeExtraForm').reset();closeExtraPhotoFiles=[];renderCloseExtraPhotoSelection();
    toast(`Parziale salvato · extra ancora aperto${photos.length?' · '+photos.length+' foto':''}${overgreenFile?' · file Overgreen':''}`);
    await loadAll();
    if(combinedExtraClosureQueue.length)setTimeout(()=>openNextCombinedExtraClosure(),250);
  }catch(err){
    if(uploadedPaths.length)try{await sb.storage.from('documenti').remove(uploadedPaths)}catch(cleanErr){console.warn('Pulizia upload incompleta',cleanErr)}
    alert(err.message||String(err));
  }finally{btn.disabled=false;btn.textContent=oldText}
}
$('closeExtraPartialBtn')?.addEventListener('click',saveExtraPartial);

$('closeExtraForm').onsubmit=async e=>{
  e.preventDefault();
  const btn=e.submitter,oldText=btn.textContent;
  btn.disabled=true;btn.textContent='Preparazione…';
  const uploadedPaths=[];
  try{
    const id=$('closeExtraId').value,profileMode=$('closeExtraForm').dataset.profile||'eurospin',ticket=$('closeExtraTicket').value.trim()||null;
    const structuredItems=workItemsForExtra(id);
    if(structuredItems.length){
      const incomplete=structuredItems.filter(w=>!['completata','non_eseguita'].includes(w.stato));
      if(incomplete.length)throw new Error(`Prima di chiudere definitivamente completa la scheda Lavorazioni. Mancano: ${incomplete.map(w=>w.titolo).join(', ')}`);
      const withoutReason=structuredItems.find(w=>w.stato==='non_eseguita'&&!String(w.nota||'').trim()&&!workNotesForItem(w.id).length);
      if(withoutReason)throw new Error(`Inserisci una nota/motivazione per la lavorazione non eseguita: ${withoutReason.titolo}`);
    }
    let notes=$('closeExtraNotes').value.trim()||null;
    if(ticket)notes=`Ticket/ordine: ${ticket}${notes?'\n'+notes:''}`;
    const photos=[...closeExtraPhotoFiles];
    const existingEurospin=attachments.some(a=>a.extra_id===id&&a.tipo==='rapportino_eurospin');
    const existingOvergreen=attachments.some(a=>a.extra_id===id&&a.tipo==='rapportino_overgreen');
    const newEurospin=profileMode==='eurospin'?$('reportEurospin').files[0]:null;
    const newOvergreen=profileMode==='eurospin'?$('reportOvergreen').files[0]:null;
    const reports=profileMode==='eurospin'?[['rapportino_eurospin',newEurospin],['rapportino_overgreen',newOvergreen]].filter(([,file])=>!!file):profileMode==='intesa'&&$('closeExtraGenericDoc').files[0]?[['verbale_cliente',$('closeExtraGenericDoc').files[0]]]:[];
    if(profileMode==='eurospin'&&!newEurospin&&!existingEurospin)throw new Error('Per la chiusura definitiva serve il rapportino Eurospin.');
    if(profileMode==='eurospin'&&!newOvergreen&&!existingOvergreen)throw new Error('Per la chiusura definitiva serve anche il file Overgreen. Se lo hai già caricato in un parziale non devi ricaricarlo.');
    if(profileMode==='intesa'&&!ticket)throw new Error('Inserisci il numero ticket o ordine.');
    const structuredHasPhotos=workItemsForExtra(id).some(w=>workPhotosForItem(w.id).length>0)||structuredCloseRows().some(r=>r.before.length||r.after.length);
    if(profileMode==='intesa'&&!photos.length&&!structuredHasPhotos)throw new Error('Per Intesa serve almeno una foto, generica oppure collegata a una lavorazione.');

    // Evita doppioni se il dipendente riprova dopo un errore: sostituisce i vecchi rapportini.
    for(const [tipo,originalFile] of reports){
      btn.textContent=tipo==='rapportino_eurospin'?'Preparo file Eurospin…':tipo==='rapportino_overgreen'?'Preparo file Overgreen…':'Preparo documento cliente…';
      // Se il rapportino/verbale è una foto, la comprime prima dell'upload. I PDF restano invariati.
      const file=originalFile.type?.startsWith('image/')?await compressImage(originalFile):originalFile;
      const safe=(file.name||originalFile.name||'rapportino.pdf').replace(/[^a-zA-Z0-9._-]/g,'-');
      const path=`extra/${id}/${tipo}-${Date.now()}-${safe}`;
      btn.textContent=tipo==='rapportino_eurospin'?'Carico file Eurospin…':tipo==='rapportino_overgreen'?'Carico file Overgreen…':'Carico documento cliente…';
      await uploadFile(path,file);uploadedPaths.push(path);
      const previous=attachments.filter(a=>a.extra_id===id&&a.tipo===tipo);
      const added=await addAttachment({tipo,extra_id:id,storage_path:path,nome_file:file.name||originalFile.name,mime_type:file.type||originalFile.type,dimensione_bytes:file.size,caricato_da:profile.id});
      if(!added)throw new Error('Registrazione allegato non riuscita.');
      for(const old of previous){
        await sb.storage.from('documenti').remove([old.storage_path]);
        await sb.from('attachments').delete().eq('id',old.id);
      }
    }

    for(let n=0;n<photos.length;n++){
      btn.textContent=`Comprimo foto ${n+1}/${photos.length}…`;
      const compressed=await compressImage(photos[n]);
      const safe=(compressed.name||photos[n].name||`foto-${n+1}.jpg`).replace(/[^a-zA-Z0-9._-]/g,'-');
      const path=`extra/${id}/foto-${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;
      btn.textContent=`Carico foto ${n+1}/${photos.length}…`;
      await uploadFile(path,compressed);uploadedPaths.push(path);
      const added=await addAttachment({tipo:'foto_generica',extra_id:id,storage_path:path,nome_file:compressed.name||photos[n].name,mime_type:compressed.type||'image/jpeg',dimensione_bytes:compressed.size,caricato_da:profile.id});
      if(!added)throw new Error('Registrazione foto non riuscita.');
    }

    

    btn.textContent='Invio a Lorenzo…';
    const {error}=await sb.from('extras').update({stato:'in_attesa',note_lorenzo:notes,closed_by:profile.id,closed_at:new Date().toISOString()}).eq('id',id);
    if(error)throw error;
    $('closeExtraDialog').close();$('closeExtraForm').reset();closeExtraPhotoFiles=[];renderCloseExtraPhotoSelection();
    toast(`Extra inviato a Lorenzo${photos.length?' · '+photos.length+' foto':''}`);
    await loadAll();
    if(combinedExtraClosureQueue.length)setTimeout(()=>openNextCombinedExtraClosure(),250);
  }catch(err){
    // Rimuove dallo Storage i file del tentativo non registrati correttamente.
    if(uploadedPaths.length)try{await sb.storage.from('documenti').remove(uploadedPaths)}catch(cleanErr){console.warn('Pulizia upload incompleta',cleanErr)}
    alert(err.message);
  }finally{btn.disabled=false;btn.textContent=oldText}
};


function isRecoverableJwtError(err){const m=String(err?.message||err||'').toLowerCase();return m.includes('jwt issued at future')||m.includes('jwt expired')||m.includes('invalid refresh token')||m.includes('refresh token not found')}
function isRefreshTokenFatal(err){const m=String(err?.message||err||'').toLowerCase();return m.includes('invalid refresh token')||m.includes('refresh token not found')||m.includes('refresh_token_not_found')}
let authRecoveryPromise=null;
async function recoverSupabaseSession(){
  if(authRecoveryPromise)return authRecoveryPromise;
  authRecoveryPromise=(async()=>{
    try{
      // Un access token appena scaduto è normale: prima di espellere l'utente
      // chiediamo a Supabase di rinnovarlo usando il refresh token persistito.
      const {data,error}=await sb.auth.refreshSession();
      if(error)throw error;
      if(!data?.session)throw new Error('Sessione non rinnovabile');
      session=data.session;
      return true;
    }catch(err){
      console.warn('Rinnovo sessione non riuscito',err);
      if(isRefreshTokenFatal(err))return false;
      // Per errori temporanei (rete, clock, server) non distruggiamo le credenziali.
      // Il normale autoRefresh di Supabase potrà riprovare alla successiva attività.
      throw err;
    }finally{authRecoveryPromise=null}
  })();
  return authRecoveryPromise;
}
async function resetBrokenSession(){try{await sb.auth.signOut({scope:'local'})}catch{};localStorage.removeItem('sb-'+new URL(cfg.supabaseUrl).hostname.split('.')[0]+'-auth-token');sessionStorage.removeItem(IMPERSONATE_PROFILE_KEY);realProfile=null;profile=null;session=null;$('app').classList.add('hidden');$('loginScreen').classList.remove('hidden');const box=$('loginError');if(box){box.textContent='Le credenziali salvate non sono più valide. Accedi di nuovo.';box.classList.remove('hidden')}}

document.querySelectorAll('[data-stats-days]').forEach(b=>b.addEventListener('click',()=>setStatsDays(b.dataset.statsDays)));$('statsClient')?.addEventListener('change',renderStats);$('statsType')?.addEventListener('change',renderStats);$('statsSiteType')?.addEventListener('change',renderStats);$('statsStartDate')?.addEventListener('change',renderStats);$('statsEndDate')?.addEventListener('change',renderStats);$('statsRefresh')?.addEventListener('click',async()=>{await loadAll();renderStats();toast('Statistiche aggiornate')});
const refreshReportAndPdfCache=()=>{renderDailyReport();prewarmDailyReportPdfs()};$('reportDate')?.addEventListener('change',refreshReportAndPdfCache);$('reportStartDate')?.addEventListener('change',refreshReportAndPdfCache);$('reportEndDate')?.addEventListener('change',refreshReportAndPdfCache);$('reportMonth')?.addEventListener('change',refreshReportAndPdfCache);document.querySelectorAll('[data-report-mode]').forEach(b=>b.addEventListener('click',()=>{setReportMode(b.dataset.reportMode);prewarmDailyReportPdfs()}));$('reportType')?.addEventListener('change',refreshReportAndPdfCache);$('reportWorker')?.addEventListener('change',refreshReportAndPdfCache);$('reportRefresh')?.addEventListener('click',async()=>{await loadAll();dailyReportPdfCache.clear();dailyReportPdfPending.clear();renderDailyReport();prewarmDailyReportPdfs();toast('Report aggiornato')});$('shareDailyReport')?.addEventListener('click',shareDailyReport);$('exportDailyReportCompact')?.addEventListener('click',()=>exportDailyReportPdf('compact'));$('exportDailyReportFull')?.addEventListener('click',()=>exportDailyReportPdf('full'));

sb.auth.onAuthStateChange(async(event,s)=>{
  session=s;
  if(!s){$('loginScreen').classList.remove('hidden');$('app').classList.add('hidden');return}
  $('loginScreen').classList.add('hidden');$('app').classList.remove('hidden');
  try{
    await loadAll();
    // Un rinnovo della sessione o il ritorno da un documento esterno non deve
    // riportare l'utente alla Dashboard. Ripristina l'ultima sezione aperta.
    const savedView=localStorage.getItem(CURRENT_VIEW_KEY)||currentView||'dashboard';
    setView(savedView);
  }catch(err){
    console.error(err);
    if(isRecoverableJwtError(err)){
      try{
        const recovered=await recoverSupabaseSession();
        if(!recovered)return resetBrokenSession();
        await loadAll();
        const savedView=localStorage.getItem(CURRENT_VIEW_KEY)||currentView||'dashboard';
        setView(savedView);
        return;
      }catch(refreshErr){
        console.error('Recupero sessione fallito',refreshErr);
        // Non cancellare una sessione valida per un problema temporaneo di rete/clock.
        if(isRefreshTokenFatal(refreshErr))return resetBrokenSession();
        alert('Connessione temporaneamente non disponibile. Riprova tra poco senza rifare il login.');
        return;
      }
    }
    alert('Errore collegamento: '+err.message)
  }
});
$('scheduleDate').value=tomorrow();renderSchedulePicker();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));

document.addEventListener('DOMContentLoaded',()=>{
  $('closeClientReportPreview')?.addEventListener('click',closeClientReportPreview);
  $('closeClientReportPreviewBottom')?.addEventListener('click',closeClientReportPreview);
  $('clientReportPreviewDialog')?.addEventListener('cancel',e=>{e.preventDefault();closeClientReportPreview()});
  $('clientReportPreviewDialog')?.addEventListener('close',()=>{if(clientReportPreviewUrl){URL.revokeObjectURL(clientReportPreviewUrl);clientReportPreviewUrl=''}window.currentClientReportFile=null});
});

$('dashboardShareStore')?.addEventListener('click',openShareStorePicker);$('shareStoreSearch')?.addEventListener('input',renderShareStorePicker);

$('editScheduleDateForm')?.addEventListener('submit',e=>{e.preventDefault();saveEditScheduleDate()});$('editScheduleTeamForm')?.addEventListener('submit',e=>{e.preventDefault();saveEditScheduleTeam()});
