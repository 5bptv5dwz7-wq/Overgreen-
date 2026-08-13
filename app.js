const cfg = window.OVERGREEN_CONFIG;
if (!cfg?.supabaseUrl || !cfg?.supabaseKey) throw new Error('Configurazione Supabase mancante.');
if (!window.supabase?.createClient) throw new Error('Libreria Supabase non caricata.');
const REMEMBER_ACCESS_KEY='overgreen-remember-access-v1';
if(localStorage.getItem(REMEMBER_ACCESS_KEY)===null)localStorage.setItem(REMEMBER_ACCESS_KEY,'1');
const authStorage={
  getItem(key){return (localStorage.getItem(REMEMBER_ACCESS_KEY)==='1'?localStorage:sessionStorage).getItem(key)},
  setItem(key,value){const target=localStorage.getItem(REMEMBER_ACCESS_KEY)==='1'?localStorage:sessionStorage;target.setItem(key,value);const other=target===localStorage?sessionStorage:localStorage;other.removeItem(key)},
  removeItem(key){localStorage.removeItem(key);sessionStorage.removeItem(key)}
};
const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:authStorage}});
const SEED_STORES=[{"name": "ABBIATEGRASSO", "lastDone": "2026-06-17"}, {"name": "ACQUI TERME", "lastDone": "2026-06-30"}, {"name": "ALBANO SAN ALESSANDRO", "lastDone": "2026-07-07"}, {"name": "ALESSANDRIA MOCCAGATTA", "lastDone": "2026-07-14"}, {"name": "ALESSANDRIA MOISA", "lastDone": "2026-07-14"}, {"name": "ARENZANO", "lastDone": "2026-06-15"}, {"name": "ASOLA", "lastDone": "2026-07-09"}, {"name": "ASTI", "lastDone": "2026-07-13"}, {"name": "BAGNOLO MELLA", "lastDone": "2026-07-08"}, {"name": "BEINASCO", "lastDone": "2026-07-03"}, {"name": "BELLINZAGO LOMBARDO", "lastDone": "2026-06-11"}, {"name": "BERGAMO", "lastDone": "2026-07-07"}, {"name": "BESANA IN BRIANZA", "lastDone": "2026-07-11"}, {"name": "BIELLA", "lastDone": "2026-06-30"}, {"name": "BOLLADELLO DI CAIRATE", "lastDone": "2026-07-01"}, {"name": "BORGARO TORINESE", "lastDone": "2026-07-01"}, {"name": "BOZZOLO", "lastDone": "2026-07-09"}, {"name": "BRONI", "lastDone": "2026-07-15"}, {"name": "BRUGHIERO", "lastDone": "2026-06-11"}, {"name": "BUSTO ARSIZIO", "lastDone": "2026-06-23"}, {"name": "CAIRO MONTENOTTE", "lastDone": "2026-07-07"}, {"name": "CANELLI", "lastDone": "2026-07-14"}, {"name": "CANTÙ", "lastDone": "2026-07-11"}, {"name": "CAPRIOLO", "lastDone": "2026-07-07"}, {"name": "CARPENEDOLO", "lastDone": "2026-07-09"}, {"name": "CASALE MONFERRATO", "lastDone": "2026-06-11"}, {"name": "CASALMAGGIORE", "lastDone": "2026-07-09"}, {"name": "CASARZA LIGURE", "lastDone": "2026-06-16"}, {"name": "CASTEL MELLA", "lastDone": "2026-07-08"}, {"name": "CASTELLETTO SOPRA TICINO", "lastDone": "2026-06-22"}, {"name": "CASTELMARTE", "lastDone": "2026-07-10"}, {"name": "CASTIGLIONE DELLE STIEVERE", "lastDone": "2026-07-09"}, {"name": "CERIALE", "lastDone": "2026-07-07"}, {"name": "CHIARI", "lastDone": "2026-07-07"}, {"name": "CHIVASSO", "lastDone": "2026-06-30"}, {"name": "COLLEGNO", "lastDone": "2026-07-02"}, {"name": "COMO", "lastDone": "2026-07-11"}, {"name": "CORBETTA", "lastDone": "2026-06-26"}, {"name": "COSTA VOLPINO", "lastDone": "2026-07-10"}, {"name": "COURGNE", "lastDone": "2026-07-01"}, {"name": "CREMONA", "lastDone": "2026-07-07"}, {"name": "CUVEGLIO", "lastDone": "2026-06-22"}, {"name": "DESENZANO DEL GARDA", "lastDone": "2026-07-08"}, {"name": "DOMODOSSOLA", "lastDone": "2026-06-21"}, {"name": "FINO MORNASCO", "lastDone": "2026-07-11"}, {"name": "FOLLO", "lastDone": "2026-06-16"}, {"name": "FOSSANO", "lastDone": "2026-06-03"}, {"name": "GALLARATE", "lastDone": "2026-07-16"}, {"name": "GENOVA PEGLI", "lastDone": "2026-06-15"}, {"name": "GREGGIO", "lastDone": "2026-06-22"}, {"name": "INVERUNO", "lastDone": "2026-07-15"}, {"name": "JERAGO CON ORAGO", "lastDone": "2026-07-16"}, {"name": "LA SPEZIA", "lastDone": "2026-06-16"}, {"name": "LAINATE", "lastDone": "2026-07-13"}, {"name": "LENO", "lastDone": "2026-07-08"}, {"name": "LENTATE SUL SEVESO", "lastDone": "2026-07-11"}, {"name": "LIMBIATE", "lastDone": "2026-06-24"}, {"name": "LOMAZZO", "lastDone": "2026-07-11"}, {"name": "LUINO", "lastDone": "2026-06-22"}, {"name": "MALNATE", "lastDone": "2026-06-30"}, {"name": "MANERBIO", "lastDone": "2026-07-08"}, {"name": "MANTOVA", "lastDone": "2026-07-09"}, {"name": "MANTOVA TRICERONE", "lastDone": "2026-07-10"}, {"name": "MAZZANO", "lastDone": "2026-07-08"}, {"name": "MILANO BAGAROTTI", "lastDone": "2026-07-13"}, {"name": "MILANO BISCEGLIE", "lastDone": "2026-07-13"}, {"name": "MILANO DE ANDRE", "lastDone": "2026-06-17"}, {"name": "MILANO SARCA", "lastDone": "2026-06-10"}, {"name": "MILANO ZANTE", "lastDone": "2026-06-16"}, {"name": "MODIGNANI", "lastDone": "2026-06-10"}, {"name": "MONTALDO DORA", "lastDone": "2026-06-30"}, {"name": "MONTICHIARI", "lastDone": "2026-07-09"}, {"name": "MORTARA", "lastDone": "2026-06-12"}, {"name": "NICHELINO", "lastDone": "2026-06-03"}, {"name": "NOVARA", "lastDone": "2026-06-23"}, {"name": "NOVI LIGURE", "lastDone": "2026-07-14"}, {"name": "OGGIONO", "lastDone": "2026-07-10"}, {"name": "OLEGGIO", "lastDone": "2026-06-22"}, {"name": "OLGIATE OLONA", "lastDone": "2026-07-15"}, {"name": "ORBASSANO", "lastDone": "2026-07-03"}, {"name": "ORZINUOVI", "lastDone": "2026-07-07"}, {"name": "PALAZZOLO SULL’OGLIO", "lastDone": "2026-07-07"}, {"name": "PIEVE EMANUELE", "lastDone": "2026-06-17"}, {"name": "PIOLTELLO", "lastDone": "2026-06-11"}, {"name": "PIOSSASCO", "lastDone": "2026-07-02"}, {"name": "POGGIO RUSCO", "lastDone": "2026-07-10"}, {"name": "PONTEVICO", "lastDone": "2026-07-08"}, {"name": "QUINZANO D’OGLIO", "lastDone": "2026-07-07"}, {"name": "RIVAROLO CANAVESE", "lastDone": "2026-07-01"}, {"name": "RIVOLI", "lastDone": "2026-07-02"}, {"name": "ROBECCHETTO CON INDUNO", "lastDone": "2026-06-23"}, {"name": "ROMENTINO CEDI", "lastDone": "2026-07-04"}, {"name": "ROZZANO", "lastDone": "2026-06-30"}, {"name": "SAINT CHRISTOPHE", "lastDone": "2026-06-30"}, {"name": "SAN GIORGIO SU LEGNANO", "lastDone": "2026-07-15"}, {"name": "SAN GIULIANO MILANESE PARCO", "lastDone": "2026-07-06"}, {"name": "SAN GIULIANO MILANESE PV", "lastDone": "2026-07-06"}, {"name": "SAN MAURIZIO CANAVESE", "lastDone": "2026-07-01"}, {"name": "SANTHIA", "lastDone": "2026-06-22"}, {"name": "SARONNO", "lastDone": "2026-07-06"}, {"name": "SARZANA", "lastDone": "2026-06-16"}, {"name": "SAVIGLIANO", "lastDone": "2026-06-03"}, {"name": "SEGRATE", "lastDone": "2026-06-11"}, {"name": "SERIATE", "lastDone": "2026-07-07"}, {"name": "SETTIMO TORINESE", "lastDone": "2026-06-30"}, {"name": "TIRINO GROSSETO", "lastDone": "2026-07-02"}, {"name": "TORINO CIGNA", "lastDone": "2026-07-02"}, {"name": "TORINO GARRONE", "lastDone": "2026-07-03"}, {"name": "TORINO PIRANO", "lastDone": "2026-07-02"}, {"name": "TORINO VERCELLI", "lastDone": "2026-07-02"}, {"name": "TORTONA", "lastDone": "2026-07-15"}, {"name": "TREZZANO SUL NAVIGLIO", "lastDone": "2026-05-31"}, {"name": "VADO LIGURE", "lastDone": "2026-07-07"}, {"name": "VALENZA", "lastDone": "2026-07-14"}, {"name": "VERCELLI BORMIDA", "lastDone": "2026-06-25"}, {"name": "VERCELLI TRATTATO DI ROMA", "lastDone": "2026-06-25"}, {"name": "VERGIATE", "lastDone": "2026-06-22"}, {"name": "VIGEVANO", "lastDone": "2026-06-12"}, {"name": "VILLA DI TIRANO", "lastDone": "2026-07-10"}, {"name": "VILLA GUARDIA", "lastDone": "2026-07-11"}, {"name": "VILLADOSSOLA", "lastDone": "2026-06-22"}, {"name": "VOGHERA", "lastDone": "2026-07-15"}, {"name": "RHO", "lastDone": "2026-06-10"}];
const $=id=>document.getElementById(id);
let session=null,profile=null,profiles=[],managedUsers=[],stores=[],interventions=[],schedules=[],scheduleMembers=[],scheduleItems=[],extras=[],extraWorkers=[],interventionWorkers=[],attachments=[],extraWorkItems=[],extraWorkItemPhotos=[],extraWorkItemNotes=[],savedRoutes=[],savedRouteItems=[],signatureSheets=[],auditLogs=[],auditPage=0,auditHasMore=false,companyDocuments=[],companyDocumentReads=[],archiveCategory='modulistica';
let combinedExtraClosureQueue=[];
let storeFilter='all',storeClientFilter='all',extraClientFilter='all',scheduleClientFilter='all',scheduleWorkerFilter='all',scheduleDateFilter='all',scheduleExactDate=null;
let loadAllPromise=null,currentHistoryStoreId=null;
let historyEditPhotoFiles=[];
let donePhotoFiles=[];
let closeExtraPhotoFiles=[];

// ---- Coda persistente per caricamenti in background ----
const UPLOAD_DB='overgreen-upload-queue-v1', UPLOAD_STORE='jobs';
let uploadWorkerRunning=false;
function openUploadDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(UPLOAD_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(UPLOAD_STORE))r.result.createObjectStore(UPLOAD_STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function queueTx(mode,fn){const db=await openUploadDb();return new Promise((resolve,reject)=>{const tx=db.transaction(UPLOAD_STORE,mode),st=tx.objectStore(UPLOAD_STORE);let out;try{out=fn(st)}catch(e){reject(e);return}tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error)})}
async function getUploadJobs(){const db=await openUploadDb();return new Promise((resolve,reject)=>{const tx=db.transaction(UPLOAD_STORE,'readonly'),r=tx.objectStore(UPLOAD_STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
async function putUploadJob(job){await queueTx('readwrite',st=>st.put(job));updateSyncUi()}
async function deleteUploadJob(id){await queueTx('readwrite',st=>st.delete(id));updateSyncUi()}
async function enqueueInterventionPhotos(interventionId,files){
  for(let n=0;n<files.length;n++){
    const f=files[n];
    await putUploadJob({id:crypto.randomUUID(),kind:'intervention-photo',interventionId,file:f,fileName:f.name||`foto-${n+1}.jpg`,mimeType:f.type||'image/jpeg',createdAt:Date.now(),retries:0,lastError:''});
  }
  processUploadQueue();
}
async function processUploadQueue(){
  if(uploadWorkerRunning||!navigator.onLine||!session)return;
  uploadWorkerRunning=true;updateSyncUi();
  try{
    const jobs=(await getUploadJobs()).sort((a,b)=>a.createdAt-b.createdAt);
    for(const job of jobs){
      try{
        let file=job.file;
        if(job.kind==='intervention-photo')file=await compressImage(file);
        const safe=(file.name||job.fileName||'file').replace(/[^a-zA-Z0-9._-]/g,'-');
        const path=`interventi/${job.interventionId}/${Date.now()}-${safe}`;
        await uploadFile(path,file);
        const added=await addAttachment({tipo:'foto_generica',intervention_id:job.interventionId,storage_path:path,nome_file:file.name||job.fileName,mime_type:file.type||job.mimeType,dimensione_bytes:file.size,caricato_da:profile.id});
        if(added&&!attachments.some(a=>a.storage_path===added.storage_path))attachments.push(added);
        await deleteUploadJob(job.id);
        toast('✓ Foto sincronizzata');
        const intervention=interventions.find(i=>i.id===job.interventionId);
        if(intervention&&$('historyDialog')?.open&&currentHistoryStoreId===intervention.store_id){
          const st=stores.find(x=>x.id===intervention.store_id);
          if(st)await showHistory(st,true);
        }
      }catch(err){
        job.retries=(job.retries||0)+1;job.lastError=err?.message||String(err);await putUploadJob(job);
        if(job.retries>=3)break;
      }
    }
  }finally{uploadWorkerRunning=false;updateSyncUi()}
}
async function retryUploads(){const jobs=await getUploadJobs();for(const j of jobs){j.retries=0;j.lastError='';await putUploadJob(j)}processUploadQueue()}
async function updateSyncUi(){
  let jobs=[];try{jobs=await getUploadJobs()}catch{}
  const failed=jobs.filter(j=>(j.retries||0)>=3).length;
  const text=uploadWorkerRunning?`⬆️ ${jobs.length} foto in caricamento…`:failed?`⚠️ ${failed} caricamenti da riprovare`:jobs.length?`☁️ ${jobs.length} foto in coda`:'🟢 Tutto sincronizzato';
  const background=$('backgroundSyncStatus');if(background)background.textContent=text
  const badge=$('syncFloatingBadge');if(badge){badge.textContent=text;badge.classList.toggle('hidden',!jobs.length&&!uploadWorkerRunning)}
}
window.addEventListener('online',processUploadQueue);

// ---- Impostazioni account e dipendenti ----
function ensureCloudSettingsUi(){
  const host=$('settingsView')||$('settingsScreen');if(!host)return;
  const wrap=host.querySelector('.settings-content')||host;
  let sec=$('cloudAccountSettings');
  if(sec?.dataset.ready==='1')return;
  if(!sec){sec=document.createElement('section');sec.id='cloudAccountSettings';wrap.appendChild(sec)}
  sec.dataset.ready='1';sec.className='settings-card cloud-account-settings';
  sec.innerHTML=`<div class="settings-section-head"><div><h3>🔐 Account e accessi</h3><p>Cambia la tua password. Lorenzo può creare utenti e modificarne nome, email, ruolo, stato e password.</p></div></div>
  <form id="selfPasswordForm" class="settings-form"><input id="selfNewPassword" type="password" minlength="8" placeholder="Nuova password" required><button type="submit">Cambia la mia password</button></form>
  <div id="adminUsersArea" class="admin-only"><hr><h4>👥 Dipendenti</h4><div id="cloudEmployeeList" class="employee-list"></div>
  <form id="cloudAddEmployeeForm" class="settings-form"><input id="cloudEmployeeName" placeholder="Nome" required><input id="cloudEmployeeEmail" type="email" placeholder="Email di accesso" required><input id="cloudEmployeePassword" type="password" minlength="8" placeholder="Password iniziale" required><button type="submit">Crea dipendente</button></form></div>`;
  const usage=document.createElement('section');usage.id='supabaseUsageCard';usage.className='settings-card admin-only';usage.innerHTML=`<div class="settings-section-head"><div><h3>📊 Utilizzo Supabase</h3><p>Spazio occupato dai file e dimensione del database del progetto.</p></div></div><div class="usage-grid"><div class="usage-metric"><span>Storage</span><strong id="usageStorage">—</strong><small id="usageStorageDetail" class="muted">Calcolo in corso…</small></div><div class="usage-metric"><span>Database</span><strong id="usageDatabase">—</strong><small id="usageDatabaseDetail" class="muted">Calcolo in corso…</small></div></div><p id="usageError" class="error hidden"></p><button id="refreshUsageBtn" type="button" class="secondary">Aggiorna utilizzo</button>`;wrap.appendChild(usage);
  const sync=document.createElement('section');sync.className='settings-card';sync.innerHTML=`<h3>☁️ Sincronizzazione</h3><p id="backgroundSyncStatus">Controllo…</p><button id="retryUploadsBtn" type="button" class="secondary">Riprova caricamenti</button>`;wrap.appendChild(sync);
  const badge=document.createElement('button');badge.id='syncFloatingBadge';badge.type='button';badge.className='sync-floating hidden';badge.onclick=()=>{setView?.('settings');};document.body.appendChild(badge);
  $('selfPasswordForm').onsubmit=async e=>{e.preventDefault();const pw=$('selfNewPassword').value;const {error}=await sb.auth.updateUser({password:pw});if(error)return alert(error.message);e.target.reset();toast('Password aggiornata')};
  $('cloudAddEmployeeForm').onsubmit=async e=>{e.preventDefault();const payload={action:'create',nome:$('cloudEmployeeName').value.trim(),email:$('cloudEmployeeEmail').value.trim(),password:$('cloudEmployeePassword').value};const {data,error}=await sb.functions.invoke('manage-user',{body:payload});if(error||data?.error)return alert(data?.error||error.message);e.target.reset();toast('Dipendente creato');await loadAll()};
  $('retryUploadsBtn').onclick=retryUploads;$('refreshUsageBtn').onclick=loadSupabaseUsage;renderCloudEmployeeList();updateSyncUi();if(admin())loadSupabaseUsage();
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
const admin=()=>profile?.ruolo==='admin';
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function openDialog(id){$(id)?.showModal()}
function closeDialog(d){d.closest('dialog')?.close()}
function isStoreProgrammed(storeId){return scheduleItems.some(item=>item.store_id===storeId&&effectiveScheduleState(item)!=='completato'&&schedules.some(s=>s.id===item.schedule_id))}
function storeHasInterval(s){return s?.intervallo_giorni!==null&&s?.intervallo_giorni!==undefined&&Number(s.intervallo_giorni)>0}
function isUrgentStore(s){if(!storeHasInterval(s))return false;const n=days(s.ultimo_passaggio),lim=Number(s.intervallo_giorni);return n!==null&&n>lim+10}
function status(s){if(isStoreProgrammed(s.id))return'scheduled';if(!storeHasInterval(s))return'ok';const n=days(s.ultimo_passaggio),lim=Number(s.intervallo_giorni);if(n===null||n>lim)return'due';if(n>=lim-3)return'warning';return'ok'}
const CURRENT_VIEW_KEY='overgreen_current_view';
let currentView=localStorage.getItem(CURRENT_VIEW_KEY)||'dashboard';
function setView(name){
  if(!$(name+'View'))name='dashboard';
  currentView=name;localStorage.setItem(CURRENT_VIEW_KEY,name);
  document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$(name+'View').classList.remove('hidden');$('pageTitle').textContent={dashboard:'Dashboard',stores:'Sedi e clienti',schedule:admin()?'Programmazione':'I miei lavori',extras:'Lavori extra',reports:'Report attività',signatures:'Fogli firme Eurospin',archive:'Archivio aziendale',audit:'Log attività',settings:'Impostazioni'}[name];if(name==='dashboard')renderDashboard();if(name==='stores')renderStores();if(name==='schedule')renderSchedules();if(name==='extras')renderExtras();if(name==='reports')renderDailyReport();if(name==='signatures')openSignatureSheetsView();if(name==='archive')openCompanyArchive();if(name==='audit'&&admin())openAuditView();if(name!=='audit')auditViewOpen(name);if(name==='settings'){ensureCloudSettingsUi();renderCloudEmployeeList();updateSyncUi();if(admin())loadSupabaseUsage();}}



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

function auditSectionLabel(s){return {auth:'Accessi',navigation:'Navigazione',stores:'Sedi e clienti',schedule:'Programmazione',interventions:'Interventi ordinari',extras:'Lavori extra',attachments:'File e foto',signatures:'Fogli firme',archive:'Archivio aziendale',users:'Utenti',storage:'Documenti',system:'Sistema'}[s]||s||'Sistema'}
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
async function writeClientAudit(action,section,description,details={}){try{if(!session?.user?.id)return;await sb.rpc('write_client_audit',{p_action:action,p_section:section,p_description:description,p_details:details,p_client:{url:location.href,user_agent:navigator.userAgent,app_version:'V99'}})}catch(e){console.warn('audit',e)}}
function auditViewOpen(name){if(!session?.user?.id)return;const labels={dashboard:'Dashboard',stores:'Sedi e clienti',schedule:'Programmazione',extras:'Lavori extra',reports:'Report attività',signatures:'Fogli firme Eurospin',archive:'Archivio aziendale',audit:'Log attività',settings:'Impostazioni'};if(labels[name])writeClientAudit('VIEW','navigation',`Aperta pagina ${labels[name]}`,{view:name})}
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
async function signOut(){await writeClientAudit('LOGOUT','auth','Uscita dall’app');await sb.auth.signOut();location.reload()}
async function loadAll(){
  if(loadAllPromise)return loadAllPromise;
  loadAllPromise=(async()=>{
  // V100: prima di leggere i dati, riporta a oggi i lavori rimasti aperti
  // nelle programmazioni con continuazione automatica. La funzione SQL è
  // SECURITY DEFINER, quindi può essere richiamata anche dal dipendente.
  try{
    const roll=await sb.rpc('rollover_overgreen_schedules',{p_today:today()});
    if(roll.error&&!String(roll.error.message||'').toLowerCase().includes('rollover_overgreen_schedules'))console.warn('Riporto automatico non riuscito:',roll.error.message);
  }catch(rollErr){console.warn('Riporto automatico non disponibile:',rollErr)}
  const [p,s,i,sch,sm,si,e,ew,iw,a]=await Promise.all([
    sb.from('profiles').select('*').order('nome'),sb.from('stores').select('*').eq('attivo',true),sb.from('interventions').select('*').order('created_at',{ascending:false}),sb.from('schedules').select('*').order('giorno'),sb.from('schedule_members').select('*'),sb.from('schedule_items').select('*').order('posizione'),sb.from('extras').select('*').order('giorno_intervento'),sb.from('extra_workers').select('*'),sb.from('intervention_workers').select('*'),sb.from('attachments').select('*').order('created_at',{ascending:false})
  ]);
  for(const r of [p,s,i,sch,sm,si,e,ew,iw,a])if(r.error)throw r.error;
  profiles=p.data;stores=s.data;interventions=i.data;schedules=sch.data;scheduleMembers=sm.data;scheduleItems=si.data;extras=e.data;extraWorkers=ew.data;interventionWorkers=iw.data;attachments=a.data;
  try{
    const [wi,wp,wn]=await Promise.all([
      sb.from('extra_work_items').select('*').order('posizione'),
      sb.from('extra_work_item_photos').select('*').order('created_at'),
      sb.from('extra_work_item_notes').select('*').order('created_at')
    ]);
    if(wi.error)throw wi.error;if(wp.error)throw wp.error;if(wn.error)throw wn.error;
    extraWorkItems=wi.data||[];extraWorkItemPhotos=wp.data||[];extraWorkItemNotes=wn.data||[];
  }catch(workErr){extraWorkItems=[];extraWorkItemPhotos=[];extraWorkItemNotes=[];console.warn('Lavorazioni multiple non disponibili:',workErr?.message||workErr)}

  try{const [sr,sri]=await Promise.all([sb.from('saved_routes').select('*').order('nome'),sb.from('saved_route_items').select('*').order('posizione')]);if(!sr.error)savedRoutes=sr.data||[];else console.warn('Giri salvati non disponibili:',sr.error.message);if(!sri.error)savedRouteItems=sri.data||[];else console.warn('Elementi giri salvati non disponibili:',sri.error.message)}catch(routeErr){console.warn('Caricamento giri salvati non riuscito:',routeErr)}
  profile=profiles.find(x=>x.id===session.user.id);if(!profile)throw new Error('Profilo non trovato');
  await reconcileProgrammingConsistency();
  $('userLabel').textContent=`${profile.nome} · ${admin()?'Amministratore':'Dipendente'}`;$('settingsUser').textContent=`${profile.nome} — ${session.user.email}`;
  document.querySelectorAll('.admin-only').forEach(x=>x.classList.toggle('hidden',!admin()));
  renderStores();renderWorkers();renderReportFilters();renderPending();renderScheduleFilters();renderSchedules();renderExtras();renderDashboard();ensureCloudSettingsUi();renderCloudEmployeeList();updateSyncUi();processUploadQueue();
  const lastUpdate=$('syncStatus');if(lastUpdate)lastUpdate.textContent='Ultimo aggiornamento dati: '+new Date().toLocaleTimeString('it-IT');
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
function renderDashboard(){
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
  const todaysDoneItems=scheduleItems.filter(i=>itemVisible(i)&&itemDate(i)===todayStr&&itemDone(i));
  const todaysDoneExtras=extras.filter(e=>isExtraVisible(e)&&e.giorno_intervento===todayStr&&extraIsDone(e));
  $('dashToday').textContent=todaysItems.length+todaysExtras.length;
  $('dashPending').textContent=admin()?interventions.filter(i=>i.stato==='in_attesa'&&!i.multi_day_open).length+extras.filter(e=>e.stato==='in_attesa').length:interventions.filter(i=>i.stato==='in_attesa'&&!i.multi_day_open&&i.inserito_da===profile.id).length+extras.filter(e=>e.stato==='in_attesa'&&myExtraIds.has(e.id)).length;
  $('dashDone').textContent=todaysDoneItems.length+todaysDoneExtras.length;

  const dashCards={
    due:$('dashDue')?.closest('.dash-card'),
    scheduled:$('dashScheduled')?.closest('.dash-card'),
    urgent:$('dashUrgent')?.closest('.dash-card'),
    openExtras:$('dashOpenExtras')?.closest('.dash-card')
  };
  if(admin()){
    $('dashDue').textContent=stores.filter(s=>status(s)==='due').length;
    dashCards.due?.querySelector('span')&&(dashCards.due.querySelector('span').textContent='Punti scaduti');
    if(dashCards.due)dashCards.due.dataset.dash='due';
    $('dashScheduled').textContent=stores.filter(s=>status(s)==='scheduled').length;
    $('dashUrgent').textContent=stores.filter(isUrgentStore).length;
    $('dashOpenExtras').textContent=openExtraJobs().length;
    Object.values(dashCards).forEach(card=>card?.classList.remove('hidden'));
  }else{
    const assignedTodayExtras=extras.filter(e=>myExtraIds.has(e.id)&&e.giorno_intervento===todayStr).length;
    $('dashDue').textContent=assignedTodayExtras;
    dashCards.due?.querySelector('span')&&(dashCards.due.querySelector('span').textContent='Extra assegnati oggi');
    if(dashCards.due)dashCards.due.dataset.dash='todayextras';
    dashCards.scheduled?.classList.add('hidden');
    dashCards.urgent?.classList.add('hidden');
    dashCards.openExtras?.classList.add('hidden');
  }

  const oldStrip=$('dashboardOperationalStrip');
  if(oldStrip)oldStrip.remove();

  const next=$('dashboardNext');next.innerHTML='';
  const title=next.closest('.panel')?.querySelector('h2');if(title)title.textContent=admin()?'Programma operativo · prossimi 7 giorni':'I tuoi prossimi 7 giorni';
  const startDate=new Date(todayStr+'T12:00:00');
  for(let offset=0;offset<7;offset++){
    const d=new Date(startDate);d.setDate(d.getDate()+offset);const date=d.toISOString().slice(0,10);
    const ordinary=scheduleItems.filter(i=>itemVisible(i)&&itemDate(i)===date).map(i=>({item:i,schedule:scheduleForItem(i)})).sort((a,b)=>(a.item.posizione||0)-(b.item.posizione||0));
    const linkedIds=new Set(ordinary.flatMap(x=>linkedExtrasForScheduleItem(x.item.id).map(e=>e.id)));
    const dayExtras=extras.filter(e=>isExtraVisible(e)&&e.giorno_intervento===date&&!linkedIds.has(e.id)&&(activeExtraStates.includes(e.stato)||extraIsDone(e))).sort((a,b)=>String(a.titolo||'').localeCompare(String(b.titolo||'')));
    const allJobsCount=ordinary.length+dayExtras.length;
    const completedCount=ordinary.filter(x=>itemDone(x.item)).length+dayExtras.filter(extraIsDone).length;
    const percent=allJobsCount?Math.round(completedCount/allJobsCount*100):0;
    const details=document.createElement('details');details.className='dashboard-day';details.open=offset===0;
    const dayName=new Intl.DateTimeFormat('it-IT',{weekday:'long'}).format(d);
    details.innerHTML=`<summary><span class="dashboard-day-title"><strong>${offset===0?'Oggi · ':''}${esc(dayName.charAt(0).toUpperCase()+dayName.slice(1))}</strong><small>${fmt(date)}</small></span><span class="dashboard-day-summary"><span class="day-type-count"><b>${ordinary.length}</b> ordinari</span><span class="day-type-count extra"><b>${dayExtras.length}</b> extra</span><span class="dashboard-day-count">${allJobsCount}</span></span></summary><div class="dashboard-day-progress"><div style="width:${percent}%"></div></div><div class="dashboard-day-progress-label"><strong>${percent}%</strong><span>${completedCount} completati su ${allJobsCount}</span></div><div class="dashboard-day-jobs"></div>`;
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
    const sortedGroups=[...groups.entries()].sort((a,b)=>a[0]==='unassigned'?1:b[0]==='unassigned'?-1:a[1].label.localeCompare(b[1].label));
    for(const [,group] of sortedGroups){
      const section=document.createElement('section');section.className='dashboard-worker-group';
      section.innerHTML=`<h3>${esc(group.label)} <span>${group.jobs.length}</span></h3><div></div>`;
      const list=section.querySelector('div');
      for(const job of group.jobs){
        if(job.kind==='ordinary'){
          const row=job.row,st=stores.find(x=>x.id===row.item.store_id),linked=linkedExtrasForScheduleItem(row.item.id),done=itemDone(row.item),c=document.createElement('article');
          c.className=`dashboard-line-job ordinary ${done?'is-done':'is-open'}`;
          const pending=itemPending(row.item);
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
        }else{
          const e=job.extra,st=stores.find(s=>s.id===e.store_id),done=extraIsDone(e),urgent=e.urgente===true||e.priorita==='urgente'||elapsedDaysFrom(extraRequestDate(e))>=7,c=document.createElement('article');
          c.className=`dashboard-line-job standalone-extra ${extraCategoryClass(e)} ${done?'is-done':urgent?'is-urgent':'is-open'}`;
          const extraNotes=[e.descrizione,e.note_lorenzo].filter(v=>String(v||'').trim());
          c.innerHTML=`<div class="job-main"><span class="job-kind">EXTRA</span>${clientBadge(e)}<span class="extra-category-badge ${extraCategoryClass(e)}">${esc(extraCategoryLabel(e))}</span><strong>${esc(st?.nome||e.nome_esterno||'Extra')}</strong>${(st?.indirizzo||st?.citta||e.indirizzo_esterno)?`<small class="dashboard-job-address">📍 ${esc([st?.indirizzo||e.indirizzo_esterno,st?.citta].filter(Boolean).join(', '))}</small>`:''}<small>${esc(e.titolo)} · ${done?'Completato':urgent?'Urgente':'Da eseguire'}</small>${extraNotes.length?`<div class="dashboard-job-notes"><strong>${done?'Descrizione / note':'Descrizione'}</strong>${extraNotes.map(n=>`<p>${esc(n)}</p>`).join('')}</div>`:''}</div><div class="actions"><button data-open-extra>Apri extra</button></div>`;c.dataset.routeAddress=routeAddressForExtra(e,st);c.querySelector('[data-open-extra]').onclick=()=>openExtraById(e.id);list.appendChild(c)
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
function renderGlobalSearch(){
  const root=$('globalResults'),q=$('globalSearch')?.value.trim().toLowerCase()||'';if(!root)return;root.innerHTML='';if(q.length<2)return;
  const foundStores=stores.filter(s=>`${s.nome} ${s.citta||''} ${s.indirizzo||''}`.toLowerCase().includes(q)).slice(0,6);
  const foundExtras=extras.filter(e=>`${e.titolo} ${e.numero_target||''} ${e.categoria_target||''} ${extraCategoryLabel(e)} ${e.descrizione||''} ${e.nome_esterno||''} ${stores.find(s=>s.id===e.store_id)?.nome||''}`.toLowerCase().includes(q)).slice(0,5);
  const foundProfiles=profiles.filter(p=>p.nome.toLowerCase().includes(q)).slice(0,4);
  for(const st of foundStores){const c=document.createElement('article');c.className='card global-result';c.innerHTML=`<strong>🏪 ${esc(st.nome)}</strong><small class="muted">Punto vendita · ${esc(st.citta||st.indirizzo||'')}</small>`;c.onclick=()=>showStoreDetail(st);root.appendChild(c)}
  for(const e of foundExtras){const c=document.createElement('article');c.className='card global-result';c.innerHTML=`<strong>🧾 ${esc(e.titolo)}</strong><small class="muted">Extra · richiesta ${fmt(extraRequestDate(e))} · ${esc(elapsedDaysLabel(e))} · ${e.giorno_intervento?`esecuzione ${fmt(e.giorno_intervento)}`:'da programmare'}</small>`;c.onclick=()=>openExtraById(e.id);root.appendChild(c)}
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
    let mixed=mixedScheduleRows(s.id);
    if(scheduleClientFilter!=='all')mixed=mixed.filter(x=>x.kind==='extra'?clientType(x.row)===scheduleClientFilter:scheduleClientMatchesStore(stores.find(st=>st.id===x.row.store_id)));
    if(scheduleWorkerFilter!=='all')mixed=mixed.filter(x=>x.kind==='extra'?extraWorkers.some(w=>w.extra_id===x.id&&w.profile_id===scheduleWorkerFilter):true);
    if(!mixed.length)continue;

    const members=scheduleMembers.filter(m=>m.schedule_id===s.id).map(m=>profiles.find(p=>p.id===m.profile_id)?.nome).filter(Boolean);
    const c=document.createElement('article');c.className='card schedule-day-card';
    c.innerHTML=`<div class="schedule-card-head"><div><span class="schedule-date-label">${fmt(s.giorno)}</span><h3>${esc(members.join(' + ')||'Squadra non indicata')}</h3>${s.nota_generale?`<p class="muted">${esc(s.nota_generale)}</p>`:''}${s.auto_rollover?'<p class="muted"><strong>↪ Continuazione automatica attiva</strong></p>':''}</div>${admin()?'<div class="actions schedule-head-actions"><button class="secondary" data-edit-note>Nota</button><button class="secondary" data-add-stores>+ Lavori</button><button class="secondary" data-duplicate>Duplica</button></div>':''}</div><div class="schedule-progress-label">${mixed.length} lavor${mixed.length===1?'o':'i'} da eseguire</div>`;
    c.querySelector('[data-edit-note]')?.addEventListener('click',()=>editScheduleDayNote(s));
    c.querySelector('[data-add-stores]')?.addEventListener('click',()=>openAddScheduleItems(s));
    c.querySelector('[data-duplicate]')?.addEventListener('click',()=>openDuplicateSchedule(s));

    for(const [displayIndex,entry] of mixed.entries()){
      if(entry.kind==='ordinary'){
        const item=entry.row,st=stores.find(x=>x.id===item.store_id),r=document.createElement('div'),effectiveState=effectiveScheduleState(item);
        r.className=`schedule-item schedule-item-compact ${effectiveState}`;
        r.dataset.routeAddress=routeAddressForStore(st);r.dataset.scheduleItemId=item.id;r.dataset.scheduleOrderKind='ordinary';r.dataset.scheduleOrderId=item.id;
        const stato=effectiveState==='in_attesa'?'In attesa di convalida':'Da eseguire',linked=linkedExtrasForScheduleItem(item.id);
        r.innerHTML=`<div class="schedule-item-main"><div class="schedule-order-number">${displayIndex+1}</div><div class="schedule-item-copy">${scheduleClientBadge(st)}<strong data-store-detail>${esc(st?.nome||'Sede')}</strong><small>${esc(st?.citta||st?.indirizzo||'')} · ${stato}</small></div>${admin()&&scheduleClientFilter==='all'?'<button type="button" class="drag-handle" data-drag-handle title="Tieni premuto e trascina" aria-label="Trascina per cambiare ordine">☰</button>':''}</div>${effectiveState==='da_fare'&&String(st?.next_visit_note||'').trim()?`<div class="schedule-next-visit"><strong>⚠️ Da fare in questo passaggio</strong><p>${esc(st.next_visit_note)}</p></div>`:''}${linked.length?`<div class="linked-extra-reminder compact-linked"><strong>Extra collegati (${linked.length})</strong>${linked.map(e=>`<span class="linked-extra-category ${extraCategoryClass(e)}"><b>${esc(extraCategoryLabel(e))}</b> ${esc(e.titolo)}</span>`).join('')}</div>`:''}<div class="actions schedule-item-actions"><button class="secondary" data-map>Maps</button>${effectiveState==='da_fare'?`<button data-done>${openMultiDayIntervention(st?.id)?'Continua intervento':'Eseguito'}</button>`:''}${admin()&&effectiveState==='da_fare'?'<button class="danger-btn" data-delete-scheduled>Elimina</button>':''}</div>`;
        r.querySelector('[data-store-detail]').onclick=()=>showStoreDetail(st);r.querySelector('[data-map]').onclick=()=>openGoogleMaps(st?.indirizzo,clientLabel(st)+' '+(st?.nome||''),st?.citta);
        r.querySelector('[data-done]')?.addEventListener('click',()=>openDone(st,item.id));r.querySelector('[data-delete-scheduled]')?.addEventListener('click',()=>deleteScheduleItem(item,st));c.appendChild(r);
      }else{
        const e=entry.row,r=extraCard(e);r.classList.add('schedule-extra-card','schedule-item');r.dataset.scheduleExtraId=e.id;r.dataset.scheduleOrderKind='extra';r.dataset.scheduleOrderId=e.id;
        const head=document.createElement('div');head.className='schedule-item-main';
        head.innerHTML=`<div class="schedule-order-number">${displayIndex+1}</div><div class="schedule-item-copy">${clientBadge(e)}<strong>🔧 ${esc(e.titolo||'Extra')}</strong><small>${esc(e.nome_esterno||e.indirizzo_esterno||'Extra senza sede')}</small></div>${admin()&&scheduleClientFilter==='all'?'<button type="button" class="drag-handle" data-drag-handle title="Tieni premuto e trascina" aria-label="Trascina per cambiare ordine">☰</button>':''}`;
        r.prepend(head);
        if(admin()){const actions=r.querySelector('.actions')||r,remove=document.createElement('button');remove.type='button';remove.className='danger-btn';remove.textContent='Togli dalla giornata';remove.onclick=()=>unlinkExtraFromSchedule(e);actions.appendChild(remove)}
        c.appendChild(r);
      }
    }
    enableScheduleDrag(c,s);$('scheduleList').appendChild(c);hydrateScheduleTravel(c,currentScheduleTravelToken);
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
  const r=await sb.from('extras').update({schedule_id:null,giorno_intervento:null,posizione_programmazione:null}).eq('id',extra.id);
  if(r.error)return alert(r.error.message);
  const wr=await sb.from('extra_workers').delete().eq('extra_id',extra.id);
  if(wr.error)return alert(wr.error.message);
  extra.schedule_id=null;extra.giorno_intervento=null;
  extraWorkers=extraWorkers.filter(w=>w.extra_id!==extra.id);
  toast('Extra tolto dalla programmazione');
  await loadAll();
}
function standaloneExtrasForPlanner(){
  return extras.filter(e=>!e.store_id&&!e.schedule_id&&!['completato','in_attesa'].includes(e.stato)&&!extraIsScheduled(e));
}
function schedulePlannerExtraSearchText(e){
  return [e.titolo,e.numero_target,e.descrizione,e.nome_esterno,e.indirizzo_esterno,clientLabel(e),extraCategoryLabel(e)].filter(Boolean).join(' ').toLowerCase();
}
function renderSchedulePicker(){
  const q=String($('scheduleSearch')?.value||'').trim().toLowerCase(),w=$('scheduleStores');if(!w)return;
  const selected=new Set([...w.querySelectorAll('input:checked')].map(x=>x.value));w.innerHTML='';
  const pickerClient=$('schedulePickerClient')?.value||'all';
  const groups=[['eurospin','Eurospin'],['intesa','Intesa Sanpaolo'],['privato','Privati']];
  const searchable=st=>[st.nome,st.citta,st.indirizzo,st.note,clientLabel(st.client_type),storeSiteTypeLabel(st)].some(v=>String(v||'').toLowerCase().includes(q));
  for(const [type,label] of groups){
    if(pickerClient!=='all'&&pickerClient!==type)continue;
    const rows=stores.filter(st=>String(st.client_type||'eurospin')===type&&searchable(st)).sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'it'));
    if(!rows.length)continue;
    const group=document.createElement('details');group.className=`picker-group ${type}`;group.open=!!q||pickerClient!=='all'||type==='eurospin';
    group.innerHTML=`<summary><span>${esc(label)}</span><b>${rows.length}</b></summary><div class="picker-group-list"></div>`;
    const body=group.querySelector('.picker-group-list');
    for(const st of rows){
      const l=document.createElement('label'),programmed=isStoreProgrammed(st.id);
      l.innerHTML=`<input type="checkbox" value="${st.id}" ${selected.has(st.id)?'checked':''}><span><strong>${esc(st.nome)}</strong>${programmed?' <em class="picker-programmed">Già in programma</em>':''}${!storeHasInterval(st)?' <em class="picker-programmed">Solo su richiesta</em>':''}<small>${esc([storeSiteTypeLabel(st),st.citta,st.indirizzo].filter(Boolean).join(' · ')||'Nessun indirizzo')}</small></span>`;
      l.querySelector('input').onchange=updateScheduleSelectedCount;body.appendChild(l)
    }
    w.appendChild(group)
  }

  const standalone=standaloneExtrasForPlanner()
    .filter(e=>(pickerClient==='all'||clientType(e)===pickerClient)&&(!q||schedulePlannerExtraSearchText(e).includes(q)))
    .sort((a,b)=>String(a.titolo||'').localeCompare(String(b.titolo||''),'it'));
  if(standalone.length){
    const group=document.createElement('details');group.className='picker-group extras';group.open=true;
    group.innerHTML=`<summary><span>🔧 Extra senza sede</span><b>${standalone.length}</b></summary><div class="picker-group-list"></div>`;
    const body=group.querySelector('.picker-group-list');
    for(const e of standalone){
      const value=`extra:${e.id}`,l=document.createElement('label');
      const place=e.nome_esterno||e.indirizzo_esterno||'Nessuna sede associata';
      l.innerHTML=`<input type="checkbox" value="${value}" ${selected.has(value)?'checked':''}><span><strong>${esc(e.titolo||'Extra')}</strong><em class="picker-programmed">Extra standalone</em><small>${esc([clientLabel(e),e.numero_target?`Target/Ticket ${e.numero_target}`:null,place].filter(Boolean).join(' · '))}</small></span>`;
      l.querySelector('input').onchange=updateScheduleSelectedCount;body.appendChild(l)
    }
    w.appendChild(group)
  }

  if(!w.children.length)w.innerHTML='<p class="muted picker-empty">Nessuna sede o extra trovato.</p>';
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
    page.drawText('OVERGREEN',{x:margin,y,size:22,font:bold,color:green});page.drawText('REPORT DI CHIUSURA LAVORO EXTRA',{x:margin,y:y-29,size:11,font:bold,color:muted});y-=62;
    const place=st?.nome||e.nome_esterno||'Luogo non indicato',address=st?.indirizzo||[e.indirizzo_esterno,st?.citta].filter(Boolean).join(' · ');
    const fields=[['LAVORO',e.titolo],['CATEGORIA',extraCategory(e)==='verde'?'Verde':extraCategory(e)==='pulizie'?'Pulizie':'Categoria non indicata'],['LUOGO',place],['INDIRIZZO',address||'Non indicato'],['DATA RICHIESTA',fmt(extraRequestDate(e))],['DATA ESECUZIONE',fmt(e.giorno_intervento)],['ORARIO CHIUSURA',fmtClosedAt(e.closed_at)],['CHIUSO DA',closedByName(e)],['OPERATORI',names.join(', ')||'Non indicati'],['STATO','Chiuso e convalidato']];
    for(const [label,value] of fields){page.drawText(label,{x:margin,y,size:8,font:bold,color:muted});const lines=wrapPdfText(value,regular,11,w-105);lines.slice(0,2).forEach((line,i)=>page.drawText(line,{x:margin+105,y:y-i*14,size:11,font:regular,color:rgb(.08,.17,.12)}));y-=Math.max(27,lines.slice(0,2).length*14+8)}
    y-=4;page.drawLine({start:{x:margin,y},end:{x:page.getWidth()-margin,y},thickness:1,color:rgb(.82,.88,.84)});y-=25;
    page.drawText('NOTE DI CHIUSURA',{x:margin,y,size:9,font:bold,color:green});y-=18;const notes=pdfSafeText(e.note_lorenzo||e.descrizione||'Nessuna nota inserita.');for(const line of wrapPdfText(notes,regular,10,w).slice(0,8)){page.drawText(line,{x:margin,y,size:10,font:regular,color:rgb(.08,.17,.12)});y-=14}
    if(pics.length&&y>190){
      y-=10;page.drawText(`FOTO ALLEGATE (${pics.length})`,{x:margin,y,size:9,font:bold,color:green});y-=15;
      const selected=pics.slice(0,4),gap=10,count=selected.length;
      let cols=2,rows=2,cellH=150;
      if(count===1){cols=1;rows=1;cellH=Math.min(300,Math.max(190,y-38))}
      else if(count===2){cols=2;rows=1;cellH=Math.min(245,Math.max(175,y-38))}
      else if(count===3){cols=3;rows=1;cellH=Math.min(215,Math.max(165,y-38))}
      else{cols=2;rows=2;cellH=Math.min(160,Math.max(125,(y-48-gap)/2))}
      const cellW=(w-gap*(cols-1))/cols;
      for(let i=0;i<selected.length;i++){
        try{
          const a=selected[i],bytes=await fetchAttachmentBytes(a),mime=String(a.mime_type||'').toLowerCase(),img=await embedUprightImage(doc,bytes,mime),col=i%cols,row=Math.floor(i/cols),x=margin+col*(cellW+gap),top=y-row*(cellH+gap),scale=Math.min(cellW/img.width,cellH/img.height);
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
  c.innerHTML=`<div class="extra-card-heading"><div>${clientBadge(e)}<h3>EXTRA · ${esc(st?.nome||e.nome_esterno||'')}</h3></div><span class="extra-category-badge ${extraCategoryClass(e)}">${esc(extraCategoryLabel(e))}</span></div><p><strong>${esc(e.titolo)}</strong></p>${e.numero_target?`<p class="target-number"><strong>Numero target:</strong> ${esc(e.numero_target)}</p>`:''}${e.descrizione?`<p>${esc(e.descrizione)}</p>`:''}${structured?`<div class="linked-extra-reminder"><strong>📋 ${structuredItems.length} lavorazioni</strong><p>${structuredItems.map(w=>`${workStateIcon(w.stato)} ${esc(w.titolo)}`).join(' · ')}</p></div>`:''}${deadlineLabel(e)}<div class="extra-date-summary"><p><strong>Richiesta:</strong> ${fmt(extraRequestDate(e))}</p><span class="elapsed-days">⏱ ${esc(elapsedDaysLabel(e))}</span><p><strong>Esecuzione:</strong> ${e.giorno_intervento?fmt(e.giorno_intervento):'Da programmare'}</p></div>${e.con_ordinario?`<p class="linked-ordinary-label">${isIntesaOrdinaryTicket(e)?'🎫 Ticket incluso nel passaggio ordinario · nessun documento richiesto in chiusura':'🔗 Da fare insieme al passaggio ordinario'}</p>`:''}${partialOpen?'<span class="extra-partial-badge">↪ Parziale · da continuare</span>':`<p class="muted">${esc(stateLabel)}</p>`}<p class="assignment-label"><strong>${esc(assignmentLabel)}</strong></p>${showProgress?`<div class="extra-closure-details">${showClosure?`<div class="closure-stamp">🕒 Chiuso: ${esc(closureText(e))}</div><strong>Note finali</strong>`:'<strong>Avanzamento parziale</strong>'}<div class="history-note ${e.note_lorenzo?'':'muted'}">${esc(e.note_lorenzo||(partialOpen?'Nessuna nota parziale inserita':'Nessuna nota inserita'))}</div><div class="pending-photo-head"><strong>Foto del lavoro</strong><span>${pics.length}</span></div><div class="pending-review-photos" data-extra-photos>${pics.length?'<span class="history-loading">Caricamento foto…</span>':'<p class="muted">Nessuna foto allegata.</p>'}</div></div>`:''}<div class="actions">${pdf?'<button class="secondary" data-pdf>Apri PDF richiesta</button>':''}${structured?'<button class="secondary" data-work-progress>📋 Lavorazioni</button>':''}${showClosure&&reportEurospin?'<button class="secondary" data-report-eurospin>File Eurospin</button>':''}${showProgress&&reportOvergreen?'<button class="secondary" data-report-overgreen>File Overgreen</button>':''}${showClosure&&!reportEurospin?'<span class="muted">File Eurospin non presente</span>':''}${showClosure&&!reportOvergreen?'<span class="muted">File Overgreen non presente</span>':''}${structured&&['in_attesa','completato'].includes(e.stato)?'<button data-generate-work-report>Genera report lavorazioni</button>':''}${e.stato==='completato'&&!isIntesaOrdinaryTicket(e)?'<button data-generate-closure>Genera chiusura</button>':''}${admin()&&e.stato==='completato'?'<button class="secondary" data-edit-closure>Modifica chiusura</button>':''}${!isIntesaOrdinaryTicket(e)&&['programmato','ricevuto','da_integrare'].includes(e.stato)&&(admin()||isAssignedToMe)?`<button data-close-extra>${structured?'Chiudi definitivamente':(partialOpen?'Continua / chiudi lavoro':'Chiudi lavoro')}</button>`:''}${admin()&&e.stato==='in_attesa'?'<button data-approve-extra>Convalida</button>':''}${admin()?'<button class="secondary" data-edit-extra>Modifica</button><button class="danger-btn" data-delete-extra>Elimina</button>':''}</div>`;
  c.querySelector('[data-pdf]')?.addEventListener('click',()=>openAttachment(pdf));
  c.querySelector('[data-work-progress]')?.addEventListener('click',()=>openExtraWorkProgress(e));
  c.querySelector('[data-report-eurospin]')?.addEventListener('click',()=>openAttachment(reportEurospin));
  c.querySelector('[data-report-overgreen]')?.addEventListener('click',()=>openAttachment(reportOvergreen));
  c.querySelector('[data-generate-work-report]')?.addEventListener('click',ev=>generateComplexExtraReportPdf(e,ev.currentTarget));
  c.querySelector('[data-generate-closure]')?.addEventListener('click',ev=>generateExtraClosurePdf(e,ev.currentTarget));
  c.querySelector('[data-edit-closure]')?.addEventListener('click',()=>openExtraClosureEdit(e));
  c.querySelector('[data-close-extra]')?.addEventListener('click',()=>{if(!e.giorno_intervento)return alert('Prima di chiudere il lavoro inserisci la data di esecuzione da Modifica.');const assigned=extraWorkers.some(w=>w.extra_id===e.id);if(!assigned)return alert('Prima di chiudere il lavoro assegna almeno un dipendente da Modifica.');openExtraClosureDialog(e,false)});
  c.querySelector('[data-approve-extra]')?.addEventListener('click',()=>approveExtra(e));
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
  const pendingWindow=window.open('about:blank','_blank');
  if(pendingWindow){
    try{
      pendingWindow.document.title='Apertura documento…';
      pendingWindow.document.body.innerHTML='<p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px">Apertura documento…</p>';
    }catch{}
  }
  try{
    const {data,error}=await sb.storage.from('documenti').createSignedUrl(a.storage_path,300);
    if(error)throw error;
    const url=data?.signedUrl;
    if(!url)throw new Error('URL del documento non disponibile.');
    if(pendingWindow)pendingWindow.location.replace(url);
    else location.href=url;
  }catch(err){
    try{
      if(pendingWindow&&!pendingWindow.closed){
        pendingWindow.document.body.innerHTML='<p style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px">Impossibile aprire il documento.</p>';
      }
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
$('globalSearch').oninput=renderGlobalSearch;$('dashboardRefresh').onclick=loadAll;document.querySelectorAll('[data-dash]').forEach(b=>b.onclick=()=>{scheduleExactDate=null;if(b.dataset.dash==='pending')openPendingDialog();else if(b.dataset.dash==='due'){storeFilter='due';setView('stores')}else if(b.dataset.dash==='urgent'){storeFilter='urgent';setView('stores')}else if(b.dataset.dash==='scheduled'){scheduleDateFilter='all';$('scheduleDateFilter').value='all';setView('schedule')}else if(b.dataset.dash==='today'){scheduleDateFilter='today';$('scheduleDateFilter').value='today';setView('schedule')}else if(b.dataset.dash==='openextras')setView('extras');else if(b.dataset.dash==='todayextras'){$('extraSearchInput').value=today();setView('extras');renderExtras()}else setView('stores')});$('scheduleClientFilter').onchange=e=>{scheduleClientFilter=e.target.value;renderSchedules()};$('scheduleWorkerFilter').onchange=e=>{scheduleWorkerFilter=e.target.value;renderSchedules()};$('scheduleDateFilter').onchange=e=>{scheduleExactDate=null;scheduleDateFilter=e.target.value;renderSchedules()};$('searchInput').oninput=renderStores;$('sortSelect').onchange=renderStores;$('addStoreBtn').onclick=()=>openStore();$('bulkIntervalBtn').onclick=openBulkIntervalDialog;$('bulkIntervalClient').onchange=updateBulkIntervalPreview;$('bulkIntervalSiteType').onchange=updateBulkIntervalPreview;$('bulkIntervalDays').oninput=updateBulkIntervalPreview;$('pendingBtn').onclick=openPendingDialog;$('logoutBtn').onclick=signOut;$('refreshBtn').onclick=loadAll;$('seedBtn').onclick=seedStores;$('scheduleSearch').oninput=renderSchedulePicker;$('schedulePickerClient').onchange=renderSchedulePicker;document.querySelectorAll('[data-quick-date]').forEach(b=>b.onclick=()=>{$('scheduleDate').value=b.dataset.quickDate==='today'?today():tomorrow()});$('addScheduleSearch').oninput=renderAddSchedulePicker;$('newExtraBtn').onclick=()=>{$('extraForm').reset();$('extraRequestDate').value=today();$('extraDate').value='';$('extraDeadline').value='';$('extraClient').value='eurospin';syncExtraClosureOptions($('extraClosureProfile'),'eurospin','eurospin');syncExtraNumberLabel();if($('extraIntesaOrdinaryMode'))$('extraIntesaOrdinaryMode').checked=false;if($('extraEurospinOrdinaryMode'))$('extraEurospinOrdinaryMode').checked=false;if($('extraPdfAutoReadStatus')){$('extraPdfAutoReadStatus').textContent='';$('extraPdfAutoReadStatus').classList.add('hidden')}clearDuplicateTargetWarning();if($('extraStoreSearch'))$('extraStoreSearch').value='';if($('extraStructured'))$('extraStructured').checked=false;if($('extraWorkItemsEditor'))$('extraWorkItemsEditor').innerHTML='';syncStructuredCreateUi();syncOrdinaryIncludedCreateUi();renderExtraStoreOptions();syncExtraDestinationUi();openDialog('extraDialog')};
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
$('storeForm').onsubmit=async e=>{e.preventDefault();const id=$('storeId').value,payload={client_type:$('storeClient').value,site_type:$('storeSiteType').value,importo_fisso:$('storeSiteType').value==='atm'&&$('storeFixedAmount').value!==''?Number($('storeFixedAmount').value):null,nome:$('storeName').value.trim(),indirizzo:$('storeAddress').value.trim()||null,citta:$('storeCity').value.trim()||null,ultimo_passaggio:$('storeLast').value||null,intervallo_giorni:$('storeNoInterval')?.checked?null:(Number($('storeInterval').value)||15),note:$('storeNotes').value.trim()||null};const r=id?await sb.from('stores').update(payload).eq('id',id):await sb.from('stores').insert(payload);if(r.error)return alert(r.error.message);$('storeDialog').close();toast('Sede salvata');await loadAll()};
$('doneHasNextVisitNote').onchange=e=>{$('doneNextVisitWrap').classList.toggle('hidden',!e.target.checked);if(!e.target.checked)$('doneNextVisitNote').value=''};
async function saveOrdinaryIntervention(continueAnotherDay,btn){
  const oldText=btn.textContent;btn.disabled=true;btn.textContent='Salvataggio…';
  try{
    const workers=admin()?[...$('doneWorkers').querySelectorAll('input:checked')].map(x=>x.value):[profile.id];
    if(!workers.length)throw new Error('Seleziona chi ha eseguito.');
    const files=[...donePhotoFiles],storeId=$('doneStoreId').value,scheduleItemId=$('doneScheduleItemId').value||null;
    const linkedToClose=scheduleItemId?linkedExtrasForScheduleItem(scheduleItemId):[];const linkedIncludedExtras=linkedToClose.filter(isOrdinaryIncludedExtra);const linkedEurospinTargets=linkedIncludedExtras.filter(isEurospinOrdinaryTarget);const linkedExtrasToClose=linkedToClose.filter(e=>!isOrdinaryIncludedExtra(e));
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
    if(existingOpen){
      const previousNotes=String(existingOpen.note||'').trim();
      const tagged=dayNote?`[${fmt(day)}] ${dayNote}`:'';
      const mergedNotes=[previousNotes,tagged].filter(Boolean).join('\n');
      const ids=[...(existingOpen.schedule_item_ids||[])];if(scheduleItemId&&!ids.includes(scheduleItemId))ids.push(scheduleItemId);
      const update={data_fine:day,note:mergedNotes||null,next_visit_note:nextVisitNote||null,multi_day_open:continueAnotherDay,schedule_item_ids:ids,closed_by:continueAnotherDay?null:profile.id,closed_at:continueAnotherDay?null:new Date().toISOString(),stato:continueAnotherDay?existingOpen.stato:(admin()?'convalidato':'in_attesa'),convalidato_da:continueAnotherDay?existingOpen.convalidato_da:(admin()?profile.id:null),convalidato_il:continueAnotherDay?existingOpen.convalidato_il:(admin()?new Date().toISOString():null)};
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
      const payload={store_id:storeId,schedule_item_id:scheduleItemId,data_intervento:day,data_fine:day,note:initialNote,next_visit_note:nextVisitNote||null,multi_day_open:continueAnotherDay,schedule_item_ids:scheduleItemId?[scheduleItemId]:[],stato:admin()?'convalidato':'in_attesa',inserito_da:profile.id,convalidato_da:admin()?profile.id:null,convalidato_il:admin()?new Date().toISOString():null,closed_by:continueAnotherDay?null:profile.id,closed_at:continueAnotherDay?null:new Date().toISOString()};
      const r=await sb.from('interventions').insert(payload).select().single();if(r.error)throw r.error;data=r.data;
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
    if(!continueAnotherDay&&linkedIncludedExtras.length){const includedState=admin()?'completato':'in_attesa',now=new Date().toISOString(),r=await sb.from('extras').update({stato:includedState,giorno_intervento:day,closed_by:profile.id,closed_at:admin()?now:null,convalidato_da:admin()?profile.id:null,convalidato_il:admin()?now:null}).in('id',linkedIncludedExtras.map(e=>e.id));if(r.error)throw new Error('Intervento salvato, ma aggiornamento ticket/target incluso non riuscito: '+r.error.message)}
    donePhotoFiles=[];renderDonePhotoSelection();$('doneDialog').close();toast(continueAnotherDay?'Giornata salvata · intervento ancora aperto':files.length?`Intervento salvato · ${files.length} foto in caricamento`:admin()?'Intervento convalidato':'Inviato a Lorenzo');renderSchedules();renderDashboard();
    try{await loadAll()}catch(refreshErr){console.warn('Aggiornamento dati non riuscito dopo il salvataggio:',refreshErr)}
    if(files.length)enqueueInterventionPhotos(data.id,files).catch(err=>{console.error(err);toast('⚠️ Foto in attesa di sincronizzazione')});
    if(!continueAnotherDay&&linkedExtrasToClose.length){combinedExtraClosureQueue=linkedExtrasToClose.map(x=>({id:x.id}));setTimeout(()=>openNextCombinedExtraClosure(),250)}
  }catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=oldText}
}
$('doneForm').onsubmit=async e=>{e.preventDefault();await saveOrdinaryIntervention(false,e.submitter||$('doneForm').querySelector('[type=submit]'))};
$('doneContinueBtn').onclick=async e=>{await saveOrdinaryIntervention(true,e.currentTarget)};
$('historyEditForm').onsubmit=async e=>{e.preventDefault();if(!admin())return;const btn=e.submitter||$('historyEditForm').querySelector('[type=submit]'),oldText=btn.textContent;btn.disabled=true;btn.textContent='Salvataggio…';try{const id=$('historyEditId').value,workers=[...$('historyEditWorkers').querySelectorAll('input:checked')].map(x=>x.value),newPhotos=[...historyEditPhotoFiles];if(!workers.length)throw new Error('Seleziona almeno un operatore.');const {error}=await sb.from('interventions').update({data_intervento:$('historyEditDate').value,closed_at:$('historyEditClosedAt').value?new Date($('historyEditClosedAt').value).toISOString():null,note:$('historyEditNotes').value.trim()||null}).eq('id',id);if(error)throw error;let r=await sb.from('intervention_workers').delete().eq('intervention_id',id);if(r.error)throw r.error;r=await sb.from('intervention_workers').insert(workers.map(profile_id=>({intervention_id:id,profile_id})));if(r.error)throw r.error;for(let n=0;n<newPhotos.length;n++){btn.textContent=`Caricamento foto ${n+1}/${newPhotos.length}…`;const file=await compressImage(newPhotos[n]),safe=(file.name||`foto-${n+1}.jpg`).replace(/[^a-zA-Z0-9._-]/g,'-'),path=`interventi/${id}/${Date.now()}-${n}-${safe}`;await uploadFile(path,file);const added=await addAttachment({tipo:'foto_generica',intervention_id:id,storage_path:path,nome_file:file.name||safe,mime_type:file.type||'image/jpeg',dimensione_bytes:file.size,caricato_da:profile.id});attachments.push(added)}const intervention=interventions.find(x=>x.id===id);if(intervention?.stato==='convalidato')await sb.from('stores').update({ultimo_passaggio:$('historyEditDate').value}).eq('id',intervention.store_id);historyEditPhotoFiles=[];$('historyEditDialog').close();toast(newPhotos.length?`Intervento aggiornato · ${newPhotos.length} foto aggiunte`:'Storico aggiornato');await loadAll();const st=stores.find(x=>x.id===intervention?.store_id);if(st)showHistory(st)}catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=oldText}};
$('userEditForm').onsubmit=async e=>{e.preventDefault();if(!admin())return;const payload={action:'update',user_id:$('userEditId').value,nome:$('userEditName').value.trim(),email:$('userEditEmail').value.trim(),ruolo:$('userEditRole').value,attivo:$('userEditActive').checked};if(!payload.nome||!payload.email)return alert('Nome ed email sono obbligatori.');const btn=e.submitter;btn.disabled=true;const old=btn.textContent;btn.textContent='Salvataggio…';try{const {data,error}=await sb.functions.invoke('manage-user',{body:payload});if(error||data?.error)throw new Error(data?.error||error.message);$('userEditDialog').close();toast('Utente aggiornato');await loadAll();await renderCloudEmployeeList()}catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=old}};
$('addScheduleItemsForm').onsubmit=async e=>{
  e.preventDefault();if(!admin())return;
  const scheduleId=$('addScheduleId').value,selected=[...$('addScheduleStores').querySelectorAll('input:checked')].map(x=>x.value);
  if(!selected.length)return alert('Seleziona almeno una sede o un extra.');
  const storeIds=selected.filter(v=>!v.startsWith('extra:')),extraIds=selected.filter(v=>v.startsWith('extra:')).map(v=>v.slice(6));
  const siblings=scheduleItems.filter(i=>i.schedule_id===scheduleId),maxPosition=mixedScheduleRows(scheduleId).reduce((m,x)=>Math.max(m,scheduleOrderValue(x.row,0)),0);
  const sch=schedules.find(x=>x.id===scheduleId),members=scheduleMembers.filter(m=>m.schedule_id===scheduleId).map(m=>m.profile_id);
  let linkedCount=0;

  if(storeIds.length){
    const {data:inserted,error}=await sb.from('schedule_items').insert(storeIds.map((store_id,i)=>({schedule_id:scheduleId,tipo:'ordinario',store_id,posizione:maxPosition+i+1,stato:'da_fare'}))).select();
    if(error)return alert(error.message);
    try{linkedCount=(await linkOrdinaryExtras(scheduleId,sch?.giorno,members,inserted||[])).length}catch(err){return alert('Sedi aggiunte, ma associazione extra non riuscita: '+err.message)}
  }

  const currentMaxPosition=mixedScheduleRows(scheduleId).reduce((m,x)=>Math.max(m,scheduleOrderValue(x.row,0)),0);
  for(const [extraIndex,extraId] of extraIds.entries()){
    let r=await sb.from('extras').update({schedule_id:scheduleId,giorno_intervento:sch?.giorno||today(),posizione_programmazione:currentMaxPosition+storeIds.length+extraIndex+1}).eq('id',extraId);if(r.error)return alert(r.error.message);
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
  const selected=[...$('scheduleStores').querySelectorAll('input:checked')].map(x=>x.value);
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

  for(const [extraIndex,extraId] of selectedExtraIds.entries()){
    let u=await sb.from('extras').update({schedule_id:schedule.id,giorno_intervento:day,posizione_programmazione:selectedStoreIds.length+extraIndex+1}).eq('id',extraId);
    if(u.error)return alert('Impossibile programmare un extra: '+u.error.message);
    u=await sb.from('extra_workers').delete().eq('extra_id',extraId);if(u.error)return alert(u.error.message);
    u=await sb.from('extra_workers').insert(members.map(profile_id=>({extra_id:extraId,profile_id})));if(u.error)return alert(u.error.message);
  }

  const parts=[];
  if(selectedStoreIds.length)parts.push(`${selectedStoreIds.length} ${selectedStoreIds.length===1?'sede':'sedi'}`);
  if(selectedExtraIds.length)parts.push(`${selectedExtraIds.length} extra`);
  if(linkedCount)parts.push(`${linkedCount} extra collegati agli ordinari`);
  toast(`Programmazione salvata · ${parts.join(' · ')}`);
  $('scheduleForm').reset();$('scheduleDate').value=tomorrow();if($('scheduleAutoRollover'))$('scheduleAutoRollover').checked=true;$('schedulePickerClient').value='all';renderSchedulePicker();await loadAll()
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

$('extraForm').onsubmit=async e=>{e.preventDefault();const workers=[...$('extraWorkers').querySelectorAll('input:checked')].map(x=>x.value),external=$('extraDestination').value==='external',pdf=$('extraPdf').files[0],closureMode=$('extraClosureProfile').value;if(!pdf)return alert('Allega il PDF della richiesta.');const duplicateTarget=findExistingExtraByTarget($('extraTargetNumber').value);if(duplicateTarget){showDuplicateTargetWarning(duplicateTarget);const st=stores.find(s=>s.id===duplicateTarget.store_id);return alert(`Target ${$('extraTargetNumber').value.trim()} già presente${st?.nome?` su ${st.nome}`:''}. Apri l’extra esistente invece di crearne un duplicato.`);}const structuredRows=$('extraStructured')?.checked?workEditorRows('extraWorkItemsEditor'):[];if($('extraStructured')?.checked&&!structuredRows.length)return alert('Aggiungi almeno una lavorazione.');if(!external){const chosen=stores.find(s=>s.id===$('extraStore').value);if(!chosen)return alert('Seleziona una sede valida.');if((chosen.client_type||'eurospin')!==$('extraClient').value)return alert('La sede selezionata non appartiene al cliente scelto.');}if(closureMode==='intesa_ordinario'||closureMode==='eurospin_ordinario'){const expected=closureMode==='intesa_ordinario'?'intesa':'eurospin';if($('extraClient').value!==expected)return alert('Il modello di chiusura non corrisponde al cliente selezionato.');if(external)return alert(closureMode==='intesa_ordinario'?'Il ticket Intesa incluso nell’ordinario deve essere collegato a una filiale.':'Il target Eurospin incluso nell’ordinario deve essere collegato a un punto vendita.');if(!$('extraWithOrdinary').checked)return alert('Per questa modalità attiva “Da fare insieme al passaggio ordinario”.');}const payload={client_type:$('extraClient').value,closure_profile:$('extraClosureProfile').value,deadline_at:$('extraDeadline').value?new Date($('extraDeadline').value).toISOString():null,store_id:external?null:$('extraStore').value,nome_esterno:external?$('extraExternalName').value.trim():null,indirizzo_esterno:external?$('extraExternalAddress').value.trim():null,titolo:$('extraTitle').value.trim(),numero_target:$('extraTargetNumber').value.trim()||null,categoria_target:$('extraCategory').value,descrizione:$('extraDescription').value.trim()||null,data_richiesta:$('extraRequestDate').value,giorno_intervento:$('extraDate').value||null,note_lorenzo:null,stato:'programmato',con_ordinario:$('extraWithOrdinary').checked,creato_da:profile.id};const {data,error}=await sb.from('extras').insert(payload).select().single();if(error){const msg=String(error.message||error);if((msg.includes("numero_target")||msg.includes("categoria_target"))&&msg.includes("schema cache"))return alert("Database non aggiornato: esegui MIGRAZIONE-V74.sql su Supabase, poi riprova.");if(msg.includes("con_ordinario")&&msg.includes("schema cache"))return alert("Database non aggiornato: esegui MIGRAZIONE-V59.sql su Supabase, poi riprova.");return alert(msg)}if(structuredRows.length){try{await createExtraWorkItems(data.id,structuredRows)}catch(workErr){await sb.from('extras').delete().eq('id',data.id);return alert('Impossibile creare le lavorazioni. Esegui la migrazione V108 su Supabase.\n'+workErr.message)}}if(workers.length){const r=await sb.from('extra_workers').insert(workers.map(profile_id=>({extra_id:data.id,profile_id})));if(r.error)return alert(r.error.message)}const path=`extra/${data.id}/richiesta-${Date.now()}.pdf`;try{await uploadFile(path,pdf);await addAttachment({tipo:'pdf_richiesta',extra_id:data.id,storage_path:path,nome_file:pdf.name,mime_type:pdf.type,dimensione_bytes:pdf.size,caricato_da:profile.id})}catch(err){return alert('Extra creato, ma PDF non caricato: '+err.message)}$('extraDialog').close();toast(workers.length?'Extra creato':'Extra creato · da programmare e assegnare');await loadAll()};
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
  const pdf=$('extraEditPdf').files[0];if(pdf){const old=attachments.find(a=>a.extra_id===id&&a.tipo==='pdf_richiesta');if(old){await sb.storage.from('documenti').remove([old.storage_path]);await sb.from('attachments').delete().eq('id',old.id)}const path=`extra/${id}/richiesta-${Date.now()}.pdf`;try{await uploadFile(path,pdf);await addAttachment({tipo:'pdf_richiesta',extra_id:id,storage_path:path,nome_file:pdf.name,mime_type:pdf.type,dimensione_bytes:pdf.size,caricato_da:profile.id})}catch(err){return alert('Dati salvati, ma nuovo PDF non caricato: '+err.message)}}
  await syncExtraWorkItemsFromEditor(id);$('extraEditDialog').close();toast('Extra aggiornato');await loadAll();
};
$('duplicateScheduleForm').onsubmit=async e=>{e.preventDefault();const source=$('duplicateScheduleId').value;if(source)openReuseScheduleDialog({type:'schedule',id:source});$('duplicateScheduleDialog').close()};
$('reuseScheduleForm').onsubmit=async e=>{e.preventDefault();if(!admin())return;const btn=e.submitter||$('reuseScheduleForm').querySelector('[type=submit]'),old=btn.textContent;btn.disabled=true;btn.textContent='Creazione…';try{await createScheduleFromReuse()}finally{btn.disabled=false;btn.textContent=old}};
$('reuseScheduleSearch').oninput=renderReuseScheduleStores;
$('openScheduleHistoryBtn').onclick=openScheduleHistory;
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
    const {error}=await sb.from('extras').update({stato:'in_attesa',note_lorenzo:notes,closed_by:profile.id,closed_at:null}).eq('id',id);
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
async function resetBrokenSession(){try{await sb.auth.signOut({scope:'local'})}catch{};localStorage.removeItem('sb-'+new URL(cfg.supabaseUrl).hostname.split('.')[0]+'-auth-token');sessionStorage.clear();session=null;$('app').classList.add('hidden');$('loginScreen').classList.remove('hidden');const box=$('loginError');if(box){box.textContent='La sessione era scaduta o non valida. Accedi di nuovo.';box.classList.remove('hidden')}}

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
  }catch(err){console.error(err);if(isRecoverableJwtError(err))return resetBrokenSession();alert('Errore collegamento: '+err.message)}
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
