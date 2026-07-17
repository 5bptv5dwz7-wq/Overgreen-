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
let session=null,profile=null,profiles=[],managedUsers=[],stores=[],interventions=[],schedules=[],scheduleMembers=[],scheduleItems=[],extras=[],extraWorkers=[],attachments=[];
let storeFilter='all',scheduleWorkerFilter='all',scheduleDateFilter='all';
let loadAllPromise=null,currentHistoryStoreId=null;

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
  const sync=document.createElement('section');sync.className='settings-card';sync.innerHTML=`<h3>☁️ Sincronizzazione</h3><p id="backgroundSyncStatus">Controllo…</p><button id="retryUploadsBtn" type="button" class="secondary">Riprova caricamenti</button>`;wrap.appendChild(sync);
  const badge=document.createElement('button');badge.id='syncFloatingBadge';badge.type='button';badge.className='sync-floating hidden';badge.onclick=()=>{setView?.('settings');};document.body.appendChild(badge);
  $('selfPasswordForm').onsubmit=async e=>{e.preventDefault();const pw=$('selfNewPassword').value;const {error}=await sb.auth.updateUser({password:pw});if(error)return alert(error.message);e.target.reset();toast('Password aggiornata')};
  $('cloudAddEmployeeForm').onsubmit=async e=>{e.preventDefault();const payload={action:'create',nome:$('cloudEmployeeName').value.trim(),email:$('cloudEmployeeEmail').value.trim(),password:$('cloudEmployeePassword').value};const {data,error}=await sb.functions.invoke('manage-user',{body:payload});if(error||data?.error)return alert(data?.error||error.message);e.target.reset();toast('Dipendente creato');await loadAll()};
  $('retryUploadsBtn').onclick=retryUploads;renderCloudEmployeeList();updateSyncUi();
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
const fmt=d=>d?new Intl.DateTimeFormat('it-IT').format(new Date(d+'T12:00:00')):'Mai eseguito';
const days=d=>{if(!d)return null;const a=new Date(d+'T00:00:00'),b=new Date();b.setHours(0,0,0,0);return Math.max(0,Math.floor((b-a)/86400000));};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const admin=()=>profile?.ruolo==='admin';
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function openDialog(id){$(id)?.showModal()}
function closeDialog(d){d.closest('dialog')?.close()}
function status(s){const n=days(s.ultimo_passaggio),lim=s.intervallo_giorni||15;if(n===null||n>lim)return'due';if(n>=lim-3)return'warning';return'ok'}
let currentView='dashboard';
function setView(name){currentView=name;document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$(name+'View').classList.remove('hidden');$('pageTitle').textContent={dashboard:'Dashboard',stores:'Punti vendita',schedule:admin()?'Programmazione':'I miei lavori',extras:'Lavori extra',settings:'Impostazioni'}[name];if(name==='dashboard')renderDashboard();if(name==='schedule')renderSchedules();if(name==='extras')renderExtras();if(name==='settings'){ensureCloudSettingsUi();renderCloudEmployeeList();updateSyncUi();}}
async function signIn(email,password){const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;}
async function signOut(){await sb.auth.signOut();location.reload()}
async function loadAll(){
  if(loadAllPromise)return loadAllPromise;
  loadAllPromise=(async()=>{
  const [p,s,i,sch,sm,si,e,ew,a]=await Promise.all([
    sb.from('profiles').select('*').order('nome'),sb.from('stores').select('*').eq('attivo',true),sb.from('interventions').select('*').order('created_at',{ascending:false}),sb.from('schedules').select('*').order('giorno'),sb.from('schedule_members').select('*'),sb.from('schedule_items').select('*').order('posizione'),sb.from('extras').select('*').order('giorno_intervento'),sb.from('extra_workers').select('*'),sb.from('attachments').select('*').order('created_at',{ascending:false})
  ]);
  for(const r of [p,s,i,sch,sm,si,e,ew,a])if(r.error)throw r.error;
  profiles=p.data;stores=s.data;interventions=i.data;schedules=sch.data;scheduleMembers=sm.data;scheduleItems=si.data;extras=e.data;extraWorkers=ew.data;attachments=a.data;
  profile=profiles.find(x=>x.id===session.user.id);if(!profile)throw new Error('Profilo non trovato');
  $('userLabel').textContent=`${profile.nome} · ${admin()?'Amministratore':'Dipendente'}`;$('settingsUser').textContent=`${profile.nome} — ${session.user.email}`;
  document.querySelectorAll('.admin-only').forEach(x=>x.classList.toggle('hidden',!admin()));
  renderStores();renderWorkers();renderPending();renderScheduleFilters();renderSchedules();renderExtras();renderDashboard();ensureCloudSettingsUi();renderCloudEmployeeList();updateSyncUi();processUploadQueue();
  const lastUpdate=$('syncStatus');if(lastUpdate)lastUpdate.textContent='Ultimo aggiornamento dati: '+new Date().toLocaleTimeString('it-IT');
  })();
  try{return await loadAllPromise}finally{loadAllPromise=null}
}


function assignedExtraIds(){return new Set(extraWorkers.filter(w=>w.profile_id===profile?.id).map(w=>w.extra_id))}

function effectiveScheduleState(item){
  if(!item)return 'da_fare';
  if(item.stato==='completato')return 'completato';
  const related=interventions.find(i=>i.schedule_item_id===item.id&&i.stato==='in_attesa');
  if(related)return 'in_attesa';
  return item.stato||'da_fare';
}
function renderDashboard(){
  if(!$('dashToday'))return;
  const todayStr=today();
  const visible=visibleSchedules();
  const todaysItems=scheduleItems.filter(i=>effectiveScheduleState(i)==='da_fare'&&visible.some(s=>s.id===i.schedule_id&&s.giorno===todayStr));
  const myExtraIds=assignedExtraIds();
  const todaysExtras=(admin()?extras:extras.filter(e=>myExtraIds.has(e.id))).filter(e=>e.giorno_intervento===todayStr&&['programmato','ricevuto','da_integrare'].includes(e.stato));
  $('dashToday').textContent=todaysItems.length+todaysExtras.length;
  $('dashPending').textContent=admin()?interventions.filter(i=>i.stato==='in_attesa').length+extras.filter(e=>e.stato==='in_attesa').length:interventions.filter(i=>i.stato==='in_attesa'&&i.inserito_da===profile.id).length+extras.filter(e=>e.stato==='in_attesa'&&myExtraIds.has(e.id)).length;
  $('dashDone').textContent=interventions.filter(i=>i.stato==='convalidato'&&i.data_intervento===todayStr&&(admin()||i.inserito_da===profile.id)).length+extras.filter(e=>e.stato==='completato'&&e.giorno_intervento===todayStr&&(admin()||myExtraIds.has(e.id))).length;
  $('dashDue').textContent=stores.filter(s=>status(s)==='due').length;
  const next=$('dashboardNext');next.innerHTML='';
  if(!admin()){
    const title=next.closest('.panel')?.querySelector('h2');if(title)title.textContent='I tuoi lavori di oggi';
    for(const item of todaysItems.sort((a,b)=>(a.posizione||0)-(b.posizione||0))){const st=stores.find(x=>x.id===item.store_id),c=document.createElement('article');c.className='card dashboard-job';c.innerHTML=`<strong>${esc(st?.nome||'Punto vendita')}</strong><small>Intervento ordinario</small><div class="actions"><button class="secondary" data-map>Maps</button><button data-done>Eseguito</button></div>`;c.querySelector('[data-map]').onclick=()=>openAppleMaps(st?.indirizzo,'Eurospin '+(st?.nome||''));c.querySelector('[data-done]').onclick=()=>openDone(st,item.id);next.appendChild(c)}
    for(const e of todaysExtras){const st=stores.find(s=>s.id===e.store_id),c=document.createElement('article');c.className='card dashboard-job extra-card';c.innerHTML=`<strong>EXTRA · ${esc(st?.nome||e.nome_esterno||'')}</strong><small>${esc(e.titolo)} · Assegnato a te</small><div class="actions"><button data-open-extra>Apri extra</button></div>`;c.querySelector('[data-open-extra]').onclick=()=>setView('extras');next.appendChild(c)}
    if(!next.children.length)next.innerHTML='<p class="muted">Nessun lavoro assegnato per oggi.</p>';
    return;
  }
  const title=next.closest('.panel')?.querySelector('h2');if(title)title.textContent='Prossimi lavori';
  const rows=visible.filter(s=>s.giorno>=todayStr).sort((a,b)=>a.giorno.localeCompare(b.giorno)).slice(0,5);
  if(!rows.length)next.innerHTML='<p class="muted">Nessun lavoro programmato.</p>';
  for(const sch of rows){const count=scheduleItems.filter(i=>i.schedule_id===sch.id&&effectiveScheduleState(i)==='da_fare').length;if(!count)continue;const c=document.createElement('article');c.className='card';c.innerHTML=`<strong>${fmt(sch.giorno)}</strong><small>${count} lavori da fare</small>`;c.onclick=()=>setView('schedule');next.appendChild(c)}
}
function renderGlobalSearch(){
  const root=$('globalResults'),q=$('globalSearch')?.value.trim().toLowerCase()||'';if(!root)return;root.innerHTML='';if(q.length<2)return;
  const foundStores=stores.filter(s=>`${s.nome} ${s.citta||''} ${s.indirizzo||''}`.toLowerCase().includes(q)).slice(0,6);
  const foundExtras=extras.filter(e=>`${e.titolo} ${e.descrizione||''} ${e.nome_esterno||''} ${stores.find(s=>s.id===e.store_id)?.nome||''}`.toLowerCase().includes(q)).slice(0,5);
  const foundProfiles=profiles.filter(p=>p.nome.toLowerCase().includes(q)).slice(0,4);
  for(const st of foundStores){const c=document.createElement('article');c.className='card global-result';c.innerHTML=`<strong>🏪 ${esc(st.nome)}</strong><small class="muted">Punto vendita · ${esc(st.citta||st.indirizzo||'')}</small>`;c.onclick=()=>showStoreDetail(st);root.appendChild(c)}
  for(const e of foundExtras){const c=document.createElement('article');c.className='card global-result';c.innerHTML=`<strong>🧾 ${esc(e.titolo)}</strong><small class="muted">Extra · ${fmt(e.giorno_intervento)} · ${esc(e.stato.replaceAll('_',' '))}</small>`;c.onclick=()=>setView('extras');root.appendChild(c)}
  for(const p of foundProfiles){const c=document.createElement('article');c.className='card global-result';c.innerHTML=`<strong>👤 ${esc(p.nome)}</strong><small class="muted">${p.ruolo==='admin'?'Amministratore':'Dipendente'}</small>`;c.onclick=()=>{scheduleWorkerFilter=p.id;$('scheduleWorkerFilter').value=p.id;setView('schedule')};root.appendChild(c)}
  if(!root.children.length)root.innerHTML='<p class="muted">Nessun risultato.</p>';
}
function renderScheduleFilters(){
  const sel=$('scheduleWorkerFilter');if(!sel)return;const current=scheduleWorkerFilter;sel.innerHTML='<option value="all">Tutte le squadre</option>'+profiles.filter(p=>p.attivo).map(p=>`<option value="${p.id}">${esc(p.nome)}</option>`).join('');sel.value=current;
}
function scheduleMatchesDate(s){if(scheduleDateFilter==='all')return true;if(scheduleDateFilter==='today')return s.giorno===today();if(scheduleDateFilter==='tomorrow')return s.giorno===tomorrow();if(scheduleDateFilter==='week'){const now=new Date(today()+'T12:00:00'),end=new Date(now);end.setDate(end.getDate()+7);return new Date(s.giorno+'T12:00:00')>=now&&new Date(s.giorno+'T12:00:00')<=end}return true}
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
    let file=original;if(kind==='foto')file=await compressImage(original);
    const safe=(file.name||label).replace(/[^a-zA-Z0-9._-]/g,'-');
    const path=`punti-vendita/${store.id}/${kind}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
    await uploadFile(path,file);
  }
  toast(`${files.length} file caricati`);await showStoreDetail(stores.find(x=>x.id===store.id)||store)
}
async function showStoreDetail(s){
  $('storeDetailTitle').textContent=s.nome;const archive=await storeArchiveFiles(s.id);const rows=interventions.filter(i=>i.store_id===s.id).sort((a,b)=>String(b.data_intervento).localeCompare(String(a.data_intervento))),ex=extras.filter(e=>e.store_id===s.id),n=days(s.ultimo_passaggio),plans=archive.filter(a=>archiveKind(a)==='planimetria'),photos=archive.filter(a=>archiveKind(a)==='foto');
  $('storeDetailBody').innerHTML=`<div class="store-detail-grid"><div class="store-detail-stat"><strong>${n===null?'—':n}</strong><span>giorni dall'ultimo passaggio</span></div><div class="store-detail-stat"><strong>${rows.length}</strong><span>interventi registrati</span></div><div class="store-detail-stat"><strong>${ex.length}</strong><span>extra collegati</span></div><div class="store-detail-stat"><strong>${fmt(s.ultimo_passaggio)}</strong><span>ultimo passaggio</span></div></div><div class="store-detail-actions"><button data-detail-map>Maps</button><button data-detail-history>Storico</button>${admin()?'<button class="secondary" data-detail-edit>Modifica</button>':''}</div><h3>Indirizzo</h3><p>${esc([s.indirizzo,s.citta].filter(Boolean).join(', ')||'Non inserito')}</p><h3>Note permanenti</h3><div class="detail-note">${esc(s.note||'Nessuna nota')}</div><section class="store-archive"><div class="archive-head"><h3>Archivio punto vendita</h3><span>${archive.length} file</span></div>${admin()?`<div class="archive-upload-grid"><label class="file-label small"><span>＋ Planimetria</span><input data-upload-plan type="file" accept="application/pdf,image/*"></label><label class="file-label small"><span>＋ Foto</span><input data-upload-photo type="file" accept="image/*" multiple></label></div>`:''}<h4>Planimetrie</h4><div class="archive-list" data-plans>${plans.length?'':'<p class="muted">Nessuna planimetria.</p>'}</div><h4>Foto del punto vendita</h4><div class="archive-gallery" data-archive-photos>${photos.length?'':'<p class="muted">Nessuna foto.</p>'}</div></section><h3>Ultimi interventi</h3>${rows.slice(0,3).map(i=>`<p><strong>${fmt(i.data_intervento)}</strong> <span class="badge-state">${esc(historyStatusLabel(i.stato))}</span><br><small>${esc(i.note||'Nessuna nota')}</small></p>`).join('')||'<p class="muted">Nessun intervento.</p>'}`;
  const body=$('storeDetailBody');body.querySelector('[data-detail-map]').onclick=()=>openAppleMaps(s.indirizzo,'Eurospin '+s.nome);body.querySelector('[data-detail-history]').onclick=()=>showHistory(s);body.querySelector('[data-detail-edit]')?.addEventListener('click',()=>openStore(s));
  body.querySelector('[data-upload-plan]')?.addEventListener('change',e=>uploadStoreArchiveFiles(s,'planimetria',[...e.target.files]).catch(err=>alert(err.message)));
  body.querySelector('[data-upload-photo]')?.addEventListener('change',e=>uploadStoreArchiveFiles(s,'foto',[...e.target.files]).catch(err=>alert(err.message)));
  const planBox=body.querySelector('[data-plans]');for(const a of plans){const row=document.createElement('div');row.className='archive-file';row.innerHTML=`<button class="secondary" data-open>📄 ${esc(a.nome_file||'Planimetria')}</button>${admin()?'<button class="danger-btn compact-btn" data-delete>Elimina</button>':''}`;row.querySelector('[data-open]').onclick=()=>openArchiveAttachment(a);row.querySelector('[data-delete]')?.addEventListener('click',()=>deleteArchiveAttachment(a,s));planBox.appendChild(row)}
  const photoBox=body.querySelector('[data-archive-photos]');for(const a of photos){const card=document.createElement('div');card.className='archive-photo-card';card.innerHTML=`<button data-open><span>📷</span><small>${esc(a.nome_file||'Foto')}</small></button>${admin()?'<button class="danger-btn compact-btn" data-delete>Elimina</button>':''}`;card.querySelector('[data-open]').onclick=()=>openArchiveAttachment(a);card.querySelector('[data-delete]')?.addEventListener('click',()=>deleteArchiveAttachment(a,s));photoBox.appendChild(card)}
  openDialog('storeDetailDialog');
}
function openDuplicateSchedule(s){$('duplicateScheduleId').value=s.id;$('duplicateScheduleDate').value=tomorrow();openDialog('duplicateScheduleDialog')}

function openAppleMaps(address,name=''){
  const query=encodeURIComponent(address||name||'');
  // Un solo collegamento: su iPhone apre Maps senza un secondo reindirizzamento al ritorno.
  window.location.href=`https://maps.apple.com/?q=${query}`;
}
function historyStatusLabel(stato){
  return ({convalidato:'Convalidato',in_attesa:'In attesa',rifiutato:'Rifiutato'})[stato]||stato.replaceAll('_',' ');
}

function renderStores(){
 const q=$('searchInput').value.trim().toLowerCase(),sort=$('sortSelect').value;
 let list=stores.filter(s=>`${s.nome} ${s.citta||''} ${s.indirizzo||''}`.toLowerCase().includes(q));
 if(storeFilter!=='all')list=list.filter(s=>storeFilter==='today'?s.ultimo_passaggio===today():status(s)===storeFilter);
 list.sort((a,b)=>sort==='alpha'?a.nome.localeCompare(b.nome,'it'):(days(b.ultimo_passaggio)??9999)-(days(a.ultimo_passaggio)??9999));
 $('storesList').innerHTML='';for(const s of list){const n=days(s.ultimo_passaggio),pending=interventions.some(i=>i.store_id===s.id&&i.stato==='in_attesa');const c=document.createElement('article');c.className=`card store-card ${status(s)}`;c.innerHTML=`<div class="status-bar"></div><div><div class="card-top"><div><h3 data-detail>${esc(s.nome)}</h3><p class="muted">${esc(s.citta||s.indirizzo||'')}</p></div><div class="days">${n===null?'—':n+' gg'}</div></div>${pending?'<p class="pending">⏳ In attesa di convalida</p>':''}<p class="muted">Ultimo passaggio: ${fmt(s.ultimo_passaggio)}</p><div class="actions"><button class="secondary" data-map>Maps</button><button data-history>Storico</button>${!pending?'<button data-done>Eseguito</button>':''}${admin()?'<button class="secondary" data-edit>Modifica</button>':''}</div></div>`;
 c.querySelector('[data-detail]').onclick=()=>showStoreDetail(s);c.querySelector('[data-map]').onclick=()=>openAppleMaps(s.indirizzo,'Eurospin '+s.nome);c.querySelector('[data-history]').onclick=()=>showHistory(s);c.querySelector('[data-done]')?.addEventListener('click',()=>openDone(s));c.querySelector('[data-edit]')?.addEventListener('click',()=>openStore(s));$('storesList').appendChild(c)}
 $('totalCount').textContent=stores.length;$('dueCount').textContent=stores.filter(s=>status(s)==='due').length;$('warningCount').textContent=stores.filter(s=>status(s)==='warning').length;$('todayCount').textContent=stores.filter(s=>s.ultimo_passaggio===today()).length;
}
function renderWorkers(){for(const id of ['doneWorkers','scheduleWorkers','extraWorkers']){const w=$(id);if(!w)continue;w.innerHTML='';profiles.filter(p=>p.attivo).forEach(p=>{const l=document.createElement('label');l.innerHTML=`<input type="checkbox" value="${p.id}"> ${esc(p.nome)}`;w.appendChild(l)})}}
function openStore(s=null){$('storeForm').reset();$('storeId').value=s?.id||'';$('storeName').value=s?.nome||'';$('storeAddress').value=s?.indirizzo||'';$('storeCity').value=s?.citta||'';$('storeLast').value=s?.ultimo_passaggio||'';$('storeInterval').value=s?.intervallo_giorni||15;$('storeNotes').value=s?.note||'';openDialog('storeDialog')}
function openDone(s,scheduleItemId=''){$('doneForm').reset();$('doneStoreId').value=s.id;$('doneScheduleItemId').value=scheduleItemId;$('doneTitle').textContent='Intervento · '+s.nome;$('doneDate').value=today();$('photoLabel').textContent='Nessuna foto';openDialog('doneDialog')}
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
  const rows=interventions.filter(i=>i.store_id===s.id).sort((a,b)=>String(b.data_intervento).localeCompare(String(a.data_intervento)));
  $('historyTitle').textContent=s.nome;
  $('historyList').innerHTML=`<div class="history-summary"><div><strong>${rows.length}</strong><span>interventi</span></div><div><strong>${rows.filter(x=>x.stato==='convalidato').length}</strong><span>convalidati</span></div><div><strong>${attachments.filter(a=>rows.some(r=>r.id===a.intervention_id)&&a.tipo==='foto_generica').length}</strong><span>foto</span></div></div><div class="history-subtitle">Cronologia interventi</div>`;
  if(!rows.length){$('historyList').insertAdjacentHTML('beforeend','<div class="history-empty"><div>🗂️</div><strong>Nessun intervento</strong><span>Gli interventi registrati compariranno qui.</span></div>');if(!refreshOnly&&!$('historyDialog').open)openDialog('historyDialog');return}
  const timeline=document.createElement('div');timeline.className='history-timeline';$('historyList').appendChild(timeline);
  for(const i of rows){
    const names=await workerNames(i.id),pics=attachments.filter(a=>a.intervention_id===i.id&&a.tipo==='foto_generica');
    const d=document.createElement('article');d.className=`history-card history-${i.stato}`;
    const statusText=historyStatusLabel(i.stato);
    d.innerHTML=`<div class="history-dot"></div><div class="history-card-top"><div class="history-date"><span>${fmt(i.data_intervento)}</span><small>Intervento ordinario</small></div><span class="history-status">${esc(statusText)}</span></div>${i.note?`<div class="history-note">${esc(i.note)}</div>`:'<div class="history-note muted">Nessuna nota inserita</div>'}<div class="history-meta"><div class="history-workers">${names.length?names.map(n=>`<span>👤 ${esc(n)}</span>`).join(''):'<span>👤 Operatori non indicati</span>'}</div>${pics.length?`<span class="history-photo-count">📷 ${pics.length}</span>`:''}</div><div class="history-photos" data-photos>${pics.length?'<span class="history-loading">Caricamento foto…</span>':''}</div>${admin()?'<div class="history-admin-actions"><button class="history-edit-btn" data-edit-history>Modifica</button><button class="history-delete-btn" data-delete-history>Elimina</button></div>':''}`;
    d.querySelector('[data-edit-history]')?.addEventListener('click',()=>openHistoryEdit(i));d.querySelector('[data-delete-history]')?.addEventListener('click',()=>deleteHistoryIntervention(i,s));
    timeline.appendChild(d);
    if(pics.length){
      const box=d.querySelector('[data-photos]');box.innerHTML='';
      const urls=await Promise.all(pics.map(async a=>{const {data,error}=await sb.storage.from('documenti').createSignedUrl(a.storage_path,600);return error?null:{a,url:data.signedUrl}}));
      for(const x of urls.filter(Boolean)){const wrap=document.createElement('button');wrap.type='button';wrap.className='history-photo';wrap.innerHTML=`<img src="${x.url}" alt="${esc(x.a.nome_file||'Foto intervento')}" loading="lazy"><span>Apri</span>`;wrap.onclick=()=>window.open(x.url,'_blank');box.appendChild(wrap)}
    }
  }
  if(!refreshOnly&&!$('historyDialog').open)openDialog('historyDialog')
}

async function deleteHistoryIntervention(i,store){
  if(!admin())return;
  const label=`${fmt(i.data_intervento)}${i.note?' · '+i.note:''}`;
  if(!confirm(`Eliminare definitivamente questo intervento?\n\n${label}\n\nVerranno eliminate anche le foto collegate.`))return;
  const {data,error}=await sb.functions.invoke('manage-user',{body:{action:'delete_intervention',intervention_id:i.id}});
  if(error||data?.error)return alert(data?.error||error.message);
  toast('Intervento eliminato');$('historyDialog').close();await loadAll();const refreshed=stores.find(x=>x.id===store.id);if(refreshed)showHistory(refreshed)
}
function openHistoryEdit(i){
  $('historyEditId').value=i.id;$('historyEditDate').value=i.data_intervento;$('historyEditNotes').value=i.note||'';
  $('historyEditWorkers').innerHTML=profiles.filter(p=>p.attivo).map(p=>`<label><input type="checkbox" value="${p.id}"><span>${esc(p.nome)}</span></label>`).join('');
  sb.from('intervention_workers').select('profile_id').eq('intervention_id',i.id).then(({data})=>{const ids=new Set((data||[]).map(x=>x.profile_id));$('historyEditWorkers').querySelectorAll('input').forEach(x=>x.checked=ids.has(x.value))});
  openDialog('historyEditDialog');
}
async function workerNames(interventionId){const {data}=await sb.from('intervention_workers').select('profile_id').eq('intervention_id',interventionId);return (data||[]).map(x=>profiles.find(p=>p.id===x.profile_id)?.nome).filter(Boolean)}
function renderPending(){const p=interventions.filter(i=>i.stato==='in_attesa');$('pendingBadge').textContent=p.length;$('pendingBadge').classList.toggle('hidden',!p.length);$('pendingList').innerHTML='';for(const i of p){const s=stores.find(x=>x.id===i.store_id);const c=document.createElement('article');c.className='card pending';c.innerHTML=`<h3>${esc(s?.nome||'Intervento')}</h3><p>${fmt(i.data_intervento)} · ${esc(i.note||'')}</p><div class="actions"><button data-ok>Convalida</button><button class="danger-btn" data-no>Rifiuta</button></div>`;c.querySelector('[data-ok]').onclick=()=>approveIntervention(i);c.querySelector('[data-no]').onclick=()=>rejectIntervention(i);$('pendingList').appendChild(c)}}
async function approveIntervention(i){const {error}=await sb.from('interventions').update({stato:'convalidato',convalidato_da:profile.id,convalidato_il:new Date().toISOString()}).eq('id',i.id);if(error)return alert(error.message);const {error:e2}=await sb.from('stores').update({ultimo_passaggio:i.data_intervento}).eq('id',i.store_id);if(e2)return alert(e2.message);if(i.schedule_item_id)await sb.from('schedule_items').update({stato:'completato'}).eq('id',i.schedule_item_id);toast('Intervento convalidato');await loadAll()}
async function rejectIntervention(i){const reason=prompt('Motivo del rifiuto','')||'';const {error}=await sb.from('interventions').update({stato:'rifiutato',motivo_rifiuto:reason,convalidato_da:profile.id,convalidato_il:new Date().toISOString()}).eq('id',i.id);if(error)return alert(error.message);if(i.schedule_item_id)await sb.from('schedule_items').update({stato:'da_fare'}).eq('id',i.schedule_item_id);toast('Intervento rifiutato');await loadAll()}
function visibleSchedules(){return admin()?schedules:schedules.filter(s=>scheduleMembers.some(m=>m.schedule_id===s.id&&m.profile_id===profile.id))}
const helpPages={
  dashboard:{title:'Come usare la Dashboard',html:`<p>Questa schermata riassume il lavoro dell’azienda.</p><ul><li>Tocca i riquadri in alto per vedere lavori di oggi, convalide e punti vendita scaduti.</li><li>Usa <strong>Ricerca globale</strong> per trovare punti vendita, extra o dipendenti.</li><li>Premi <strong>Aggiorna</strong> per scaricare manualmente i dati più recenti.</li></ul>`},
  stores:{title:'Come usare Punti vendita',html:`<p>Qui trovi l’anagrafica di tutti i punti vendita.</p><ul><li>Usa i contatori per filtrare scaduti, in scadenza o fatti oggi.</li><li>Tocca un punto vendita per aprire scheda, storico, note, foto e planimetrie.</li><li>Lorenzo può aggiungere o modificare i punti vendita.</li><li>Il pulsante <strong>Maps</strong> apre la navigazione verso l’indirizzo salvato.</li></ul>`},
  schedule:{title:'Come usare la Programmazione',html:`<p>Qui vengono mostrati soltanto i lavori ancora da eseguire.</p><ul><li>Lorenzo può creare una programmazione scegliendo data, squadra e punti vendita.</li><li>Le frecce <strong>↑ ↓</strong> cambiano l’ordine di esecuzione del dipendente.</li><li>Il pulsante <strong>Elimina</strong> rimuove un singolo punto vendita programmato, dopo conferma.</li><li><strong>Duplica</strong> copia una programmazione su un’altra data.</li><li>Il dipendente preme <strong>Eseguito</strong> per chiudere il lavoro e allegare le foto.</li></ul>`},
  extras:{title:'Come usare gli Extra',html:`<p>Gli extra sono separati tra aperti ed eseguiti.</p><ul><li>Lorenzo crea l’extra, assegna la squadra e allega il PDF della richiesta.</li><li>Il dipendente chiude il lavoro caricando i file Eurospin e Overgreen.</li><li>Lorenzo convalida l’extra e può successivamente modificarlo o eliminarlo.</li></ul>`},
  settings:{title:'Come usare le Impostazioni',html:`<p>Da questa schermata puoi gestire l’app e il tuo account.</p><ul><li><strong>Aggiorna dati</strong> scarica manualmente le informazioni più recenti.</li><li>Lorenzo può creare, modificare o disattivare gli utenti.</li><li><strong>Esci</strong> termina l’accesso sul dispositivo.</li></ul>`}
};
function openHelp(){const h=helpPages[currentView]||helpPages.dashboard;$('helpTitle').textContent=h.title;$('helpBody').innerHTML=h.html;openDialog('helpDialog')}
async function deleteScheduleItem(item,store){
  if(!admin()||item.stato!=='da_fare')return;
  if(!confirm(`Rimuovere “${store?.nome||'questo punto vendita'}” dalla programmazione?`))return;
  const {error}=await sb.from('schedule_items').delete().eq('id',item.id);if(error)return alert(error.message);
  const remaining=scheduleItems.filter(x=>x.schedule_id===item.schedule_id&&x.id!==item.id);
  if(!remaining.length){
    let r=await sb.from('schedule_members').delete().eq('schedule_id',item.schedule_id);if(r.error)return alert(r.error.message);
    r=await sb.from('schedules').delete().eq('id',item.schedule_id);if(r.error)return alert(r.error.message);
  }
  toast('Punto vendita rimosso dalla programmazione');await loadAll();
}

async function moveScheduleItem(item,direction){
  if(!admin())return;const siblings=scheduleItems.filter(x=>x.schedule_id===item.schedule_id&&x.stato!=='completato').sort((a,b)=>(a.posizione||0)-(b.posizione||0));const at=siblings.findIndex(x=>x.id===item.id),swap=siblings[at+direction];if(at<0||!swap)return;
  const p1=item.posizione||at+1,p2=swap.posizione||at+direction+1;
  let r=await sb.from('schedule_items').update({posizione:p2}).eq('id',item.id);if(r.error)return alert(r.error.message);r=await sb.from('schedule_items').update({posizione:p1}).eq('id',swap.id);if(r.error)return alert(r.error.message);toast('Ordine aggiornato');await loadAll();
}
function renderSchedules(){
  $('scheduleTitle').textContent=admin()?'Programmazioni':'I miei lavori';
  $('scheduleList').innerHTML='';
  let list=visibleSchedules().filter(scheduleMatchesDate);
  if(scheduleWorkerFilter!=='all')list=list.filter(s=>scheduleMembers.some(m=>m.schedule_id===s.id&&m.profile_id===scheduleWorkerFilter));
  for(const s of list){
    const items=scheduleItems.filter(i=>i.schedule_id===s.id&&effectiveScheduleState(i)!=='completato').sort((a,b)=>(a.posizione||0)-(b.posizione||0));
    if(!items.length)continue;
    const members=scheduleMembers.filter(m=>m.schedule_id===s.id).map(m=>profiles.find(p=>p.id===m.profile_id)?.nome).filter(Boolean);
    const c=document.createElement('article');c.className='card';
    c.innerHTML=`<div class="schedule-card-head"><div><h3>${fmt(s.giorno)}</h3><p class="muted">${esc(members.join(' + '))}</p></div>${admin()?'<button class="secondary" data-duplicate>Duplica</button>':''}</div><p>${esc(s.nota_generale||'')}</p>`;
    c.querySelector('[data-duplicate]')?.addEventListener('click',()=>openDuplicateSchedule(s));
    for(const item of items){if(item.tipo==='ordinario'){
      const st=stores.find(x=>x.id===item.store_id),r=document.createElement('div');
      const effectiveState=effectiveScheduleState(item);
      r.className=`schedule-item ${effectiveState}`;
      const stato=effectiveState==='in_attesa'?'In attesa di convalida':'Da fare';
      r.innerHTML=`<div class="schedule-order-line"><strong data-store-detail>${esc(st?.nome||'Punto vendita')}</strong>${admin()?'<div class="order-buttons"><button type="button" class="secondary compact-btn" data-up title="Sposta prima">↑</button><button type="button" class="secondary compact-btn" data-down title="Sposta dopo">↓</button></div>':''}</div><small>${stato}</small><div class="actions"><button class="secondary" data-map>Maps</button>${effectiveState==='da_fare'?'<button data-done>Eseguito</button>':''}${admin()&&effectiveState==='da_fare'?'<button class="danger-btn" data-delete-scheduled>Elimina</button>':''}</div>`;
      r.querySelector('[data-store-detail]').onclick=()=>showStoreDetail(st);r.querySelector('[data-up]')?.addEventListener('click',()=>moveScheduleItem(item,-1));r.querySelector('[data-down]')?.addEventListener('click',()=>moveScheduleItem(item,1));r.querySelector('[data-map]').onclick=()=>openAppleMaps(st?.indirizzo,'Eurospin '+(st?.nome||''));
      r.querySelector('[data-done]')?.addEventListener('click',()=>openDone(st,item.id));r.querySelector('[data-delete-scheduled]')?.addEventListener('click',()=>deleteScheduleItem(item,st));c.appendChild(r)
    }}
    $('scheduleList').appendChild(c)
  }
  if(!$('scheduleList').children.length)$('scheduleList').innerHTML='<p class="muted">Nessun lavoro da mostrare con questi filtri.</p>';
}
function renderSchedulePicker(){const q=$('scheduleSearch').value.toLowerCase(),w=$('scheduleStores');const selected=new Set([...w.querySelectorAll('input:checked')].map(x=>x.value));w.innerHTML='';stores.filter(s=>s.nome.toLowerCase().includes(q)).sort((a,b)=>(days(b.ultimo_passaggio)??9999)-(days(a.ultimo_passaggio)??9999)).forEach(s=>{const l=document.createElement('label');l.innerHTML=`<input type="checkbox" value="${s.id}" ${selected.has(s.id)?'checked':''}><span><strong>${esc(s.nome)}</strong><br><small>${days(s.ultimo_passaggio)??'—'} giorni · ultimo ${fmt(s.ultimo_passaggio)}</small></span>`;w.appendChild(l)})}
function extraCard(e){
  const st=stores.find(s=>s.id===e.store_id),pdf=attachments.find(a=>a.extra_id===e.id&&a.tipo==='pdf_richiesta'),reportEurospin=attachments.find(a=>a.extra_id===e.id&&a.tipo==='rapportino_eurospin'),reportOvergreen=attachments.find(a=>a.extra_id===e.id&&a.tipo==='rapportino_overgreen');
  const showReports=admin()&&['in_attesa','completato'].includes(e.stato),c=document.createElement('article');
  const assignedNames=extraWorkers.filter(w=>w.extra_id===e.id).map(w=>profiles.find(p=>p.id===w.profile_id)?.nome).filter(Boolean);
  const assignmentLabel=admin()?`Assegnato a: ${assignedNames.join(' + ')||'nessuno'}`:'Assegnato a te';
  c.className=`card extra-card ${e.stato}`;
  c.innerHTML=`<h3>EXTRA · ${esc(st?.nome||e.nome_esterno||'')}</h3><p><strong>${esc(e.titolo)}</strong></p><p>${esc(e.descrizione||'')}</p><p class="muted">${fmt(e.giorno_intervento)} · ${esc(e.stato.replaceAll('_',' '))}</p><p class="assignment-label"><strong>${esc(assignmentLabel)}</strong></p><div class="actions">${pdf?'<button class="secondary" data-pdf>Apri PDF richiesta</button>':''}${showReports&&reportEurospin?'<button class="secondary" data-report-eurospin>File Eurospin</button>':''}${showReports&&reportOvergreen?'<button class="secondary" data-report-overgreen>File Overgreen</button>':''}${showReports&&!reportEurospin?'<span class="muted">File Eurospin non presente</span>':''}${showReports&&!reportOvergreen?'<span class="muted">File Overgreen non presente</span>':''}${!admin()&&['programmato','ricevuto','da_integrare'].includes(e.stato)?'<button data-close-extra>Chiudi lavoro</button>':''}${admin()&&e.stato==='in_attesa'?'<button data-approve-extra>Convalida</button>':''}${admin()&&e.stato==='completato'?'<button class="secondary" data-edit-extra>Modifica</button><button class="danger-btn" data-delete-extra>Elimina</button>':''}</div>`;
  c.querySelector('[data-pdf]')?.addEventListener('click',()=>openAttachment(pdf));
  c.querySelector('[data-report-eurospin]')?.addEventListener('click',()=>openAttachment(reportEurospin));
  c.querySelector('[data-report-overgreen]')?.addEventListener('click',()=>openAttachment(reportOvergreen));
  c.querySelector('[data-close-extra]')?.addEventListener('click',()=>{$('closeExtraId').value=e.id;openDialog('closeExtraDialog')});
  c.querySelector('[data-approve-extra]')?.addEventListener('click',()=>approveExtra(e));
  c.querySelector('[data-edit-extra]')?.addEventListener('click',()=>openExtraEdit(e));
  c.querySelector('[data-delete-extra]')?.addEventListener('click',()=>deleteExtra(e));
  return c;
}
function renderExtras(){
  const root=$('extrasList');root.innerHTML='';
  const visible=admin()?extras:extras.filter(e=>extraWorkers.some(w=>w.extra_id===e.id&&w.profile_id===profile.id));
  const open=visible.filter(e=>e.stato!=='completato'),done=visible.filter(e=>e.stato==='completato');
  const addSection=(title,list,empty)=>{const h=document.createElement('h2');h.className='extra-section-title';h.textContent=title;root.appendChild(h);if(!list.length){const p=document.createElement('p');p.className='muted extra-empty';p.textContent=empty;root.appendChild(p)}else list.forEach(e=>root.appendChild(extraCard(e)))};
  addSection('Extra aperti',open,'Nessun extra aperto.');
  addSection('Extra eseguiti',done,'Nessun extra eseguito.');
}
function openExtraEdit(e){
  $('extraEditId').value=e.id;$('extraEditTitle').value=e.titolo||'';$('extraEditDescription').value=e.descrizione||'';$('extraEditDate').value=e.giorno_intervento||'';
  const external=!e.store_id;$('extraEditDestination').value=external?'external':'store';renderExtraEditStoreOptions(e.store_id);$('extraEditExternalName').value=e.nome_esterno||'';$('extraEditExternalAddress').value=e.indirizzo_esterno||'';toggleExtraEditDestination();
  $('extraEditWorkers').innerHTML=profiles.filter(p=>p.attivo).map(p=>`<label><input type="checkbox" value="${p.id}"><span>${esc(p.nome)}</span></label>`).join('');
  const ids=new Set(extraWorkers.filter(w=>w.extra_id===e.id).map(w=>w.profile_id));$('extraEditWorkers').querySelectorAll('input').forEach(x=>x.checked=ids.has(x.value));$('extraEditPdf').value='';openDialog('extraEditDialog');
}
function renderExtraEditStoreOptions(selected){$('extraEditStore').innerHTML=stores.map(s=>`<option value="${s.id}" ${s.id===selected?'selected':''}>${esc(s.nome)}</option>`).join('')}
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
async function openAttachment(a){const {data,error}=await sb.storage.from('documenti').createSignedUrl(a.storage_path,300);if(error)return alert(error.message);window.open(data.signedUrl,'_blank')}
async function approveExtra(e){const {error}=await sb.from('extras').update({stato:'completato',convalidato_da:profile.id,convalidato_il:new Date().toISOString()}).eq('id',e.id);if(error)return alert(error.message);toast('Extra convalidato');await loadAll()}
async function seedStores(){if(!admin())return;if(stores.length&&!confirm(`Sono già presenti ${stores.length} punti vendita. Continuare?`))return;const rows=SEED_STORES.filter(x=>!stores.some(s=>s.nome===x.name)).map(x=>({nome:x.name,ultimo_passaggio:x.lastDone,intervallo_giorni:15,attivo:true}));if(!rows.length)return toast('Nessun punto vendita da importare');const {error}=await sb.from('stores').insert(rows);if(error)return alert(error.message);toast(`${rows.length} punti vendita importati`);await loadAll()}

$('rememberAccess').checked=localStorage.getItem(REMEMBER_ACCESS_KEY)!=='0';
$('loginForm').onsubmit = async (e) => { e.preventDefault(); const b=$('loginForm').querySelector('button[type=submit]'); const box=$('loginError'); box.classList.add('hidden'); box.textContent=''; b.disabled=true; b.textContent='Accesso…'; try { const email=$('loginEmail').value.trim(); const password=$('loginPassword').value; if(!email||!password) throw new Error('Inserisci email e password.'); localStorage.setItem(REMEMBER_ACCESS_KEY,$('rememberAccess').checked?'1':'0'); await signIn(email,password); } catch(err) { console.error(err); box.textContent=err?.message||'Accesso non riuscito.'; box.classList.remove('hidden'); } finally { b.disabled=false; b.textContent='Accedi'; } };
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeDialog(b));$('helpBtn').onclick=openHelp;document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{storeFilter=b.dataset.filter;renderStores()});
$('globalSearch').oninput=renderGlobalSearch;$('dashboardRefresh').onclick=loadAll;document.querySelectorAll('[data-dash]').forEach(b=>b.onclick=()=>{if(b.dataset.dash==='pending')openDialog('pendingDialog');else if(b.dataset.dash==='due'){storeFilter='due';setView('stores')}else if(b.dataset.dash==='today'){scheduleDateFilter='today';$('scheduleDateFilter').value='today';setView('schedule')}else setView('stores')});$('scheduleWorkerFilter').onchange=e=>{scheduleWorkerFilter=e.target.value;renderSchedules()};$('scheduleDateFilter').onchange=e=>{scheduleDateFilter=e.target.value;renderSchedules()};$('searchInput').oninput=renderStores;$('sortSelect').onchange=renderStores;$('addStoreBtn').onclick=()=>openStore();$('pendingBtn').onclick=()=>openDialog('pendingDialog');$('logoutBtn').onclick=signOut;$('refreshBtn').onclick=loadAll;$('seedBtn').onclick=seedStores;$('scheduleSearch').oninput=renderSchedulePicker;$('newExtraBtn').onclick=()=>{$('extraForm').reset();$('extraDate').value=tomorrow();renderExtraStoreOptions();openDialog('extraDialog')};
$('donePhotos').onchange=e=>$('photoLabel').textContent=`${e.target.files.length} foto selezionate`;
$('storeForm').onsubmit=async e=>{e.preventDefault();const id=$('storeId').value,payload={nome:$('storeName').value.trim(),indirizzo:$('storeAddress').value.trim()||null,citta:$('storeCity').value.trim()||null,ultimo_passaggio:$('storeLast').value||null,intervallo_giorni:Number($('storeInterval').value)||15,note:$('storeNotes').value.trim()||null};const r=id?await sb.from('stores').update(payload).eq('id',id):await sb.from('stores').insert(payload);if(r.error)return alert(r.error.message);$('storeDialog').close();toast('Punto vendita salvato');await loadAll()};
$('doneForm').onsubmit=async e=>{e.preventDefault();const btn=e.submitter||$('doneForm').querySelector('[type=submit]');const oldText=btn.textContent;btn.disabled=true;btn.textContent='Salvataggio…';try{const workers=[...$('doneWorkers').querySelectorAll('input:checked')].map(x=>x.value);if(!workers.length)throw new Error('Seleziona chi ha eseguito.');const files=[...$('donePhotos').files];const payload={store_id:$('doneStoreId').value,schedule_item_id:$('doneScheduleItemId').value||null,data_intervento:$('doneDate').value,note:$('doneNotes').value.trim()||null,stato:admin()?'convalidato':'in_attesa',inserito_da:profile.id,convalidato_da:admin()?profile.id:null,convalidato_il:admin()?new Date().toISOString():null};const {data,error}=await sb.from('interventions').insert(payload).select().single();if(error)throw error;const ir=await sb.from('intervention_workers').insert(workers.map(profile_id=>({intervention_id:data.id,profile_id})));if(ir.error)throw ir.error;if(payload.schedule_item_id){const nextState=admin()?'completato':'in_attesa';const r=await sb.from('schedule_items').update({stato:nextState}).eq('id',payload.schedule_item_id);if(r.error)console.warn('Stato programmazione non aggiornato direttamente:',r.error.message);const localItem=scheduleItems.find(x=>x.id===payload.schedule_item_id);if(localItem)localItem.stato=nextState}if(admin()){const r=await sb.from('stores').update({ultimo_passaggio:payload.data_intervento}).eq('id',payload.store_id);if(r.error)throw r.error}interventions.unshift(data);$('doneDialog').close();toast(files.length?`Intervento salvato · ${files.length} foto in caricamento`:admin()?'Intervento convalidato':'Inviato a Lorenzo');renderSchedules();renderDashboard();try{await loadAll()}catch(refreshErr){console.warn('Aggiornamento dati non riuscito dopo il salvataggio:',refreshErr)}if(files.length)enqueueInterventionPhotos(data.id,files).catch(err=>{console.error(err);toast('⚠️ Foto in attesa di sincronizzazione')})}catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=oldText}};
$('historyEditForm').onsubmit=async e=>{e.preventDefault();if(!admin())return;const id=$('historyEditId').value,workers=[...$('historyEditWorkers').querySelectorAll('input:checked')].map(x=>x.value);if(!workers.length)return alert('Seleziona almeno un operatore.');const {error}=await sb.from('interventions').update({data_intervento:$('historyEditDate').value,note:$('historyEditNotes').value.trim()||null}).eq('id',id);if(error)return alert(error.message);let r=await sb.from('intervention_workers').delete().eq('intervention_id',id);if(r.error)return alert(r.error.message);r=await sb.from('intervention_workers').insert(workers.map(profile_id=>({intervention_id:id,profile_id})));if(r.error)return alert(r.error.message);const intervention=interventions.find(x=>x.id===id);if(intervention?.stato==='convalidato')await sb.from('stores').update({ultimo_passaggio:$('historyEditDate').value}).eq('id',intervention.store_id);$('historyEditDialog').close();toast('Storico aggiornato');await loadAll();const st=stores.find(x=>x.id===intervention?.store_id);if(st)showHistory(st)};
$('userEditForm').onsubmit=async e=>{e.preventDefault();if(!admin())return;const payload={action:'update',user_id:$('userEditId').value,nome:$('userEditName').value.trim(),email:$('userEditEmail').value.trim(),ruolo:$('userEditRole').value,attivo:$('userEditActive').checked};if(!payload.nome||!payload.email)return alert('Nome ed email sono obbligatori.');const btn=e.submitter;btn.disabled=true;const old=btn.textContent;btn.textContent='Salvataggio…';try{const {data,error}=await sb.functions.invoke('manage-user',{body:payload});if(error||data?.error)throw new Error(data?.error||error.message);$('userEditDialog').close();toast('Utente aggiornato');await loadAll();await renderCloudEmployeeList()}catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=old}};
$('scheduleForm').onsubmit=async e=>{e.preventDefault();const members=[...$('scheduleWorkers').querySelectorAll('input:checked')].map(x=>x.value),selected=[...$('scheduleStores').querySelectorAll('input:checked')].map(x=>x.value);if(!members.length||!selected.length)return alert('Seleziona squadra e punti vendita.');const {data,error}=await sb.from('schedules').insert({giorno:$('scheduleDate').value,nota_generale:$('scheduleNote').value.trim()||null,creato_da:profile.id}).select().single();if(error)return alert(error.message);let r=await sb.from('schedule_members').insert(members.map(profile_id=>({schedule_id:data.id,profile_id})));if(r.error)return alert(r.error.message);r=await sb.from('schedule_items').insert(selected.map((store_id,i)=>({schedule_id:data.id,tipo:'ordinario',store_id,posizione:i+1,stato:'da_fare'})));if(r.error)return alert(r.error.message);toast('Programmazione salvata');$('scheduleForm').reset();$('scheduleDate').value=tomorrow();renderSchedulePicker();await loadAll()};
function renderExtraStoreOptions(){$('extraStore').innerHTML=stores.map(s=>`<option value="${s.id}">${esc(s.nome)}</option>`).join('')}
$('extraDestination').onchange=()=>{const ext=$('extraDestination').value==='external';$('extraStoreWrap').classList.toggle('hidden',ext);$('extraExternalWrap').classList.toggle('hidden',!ext)};
$('extraForm').onsubmit=async e=>{e.preventDefault();const workers=[...$('extraWorkers').querySelectorAll('input:checked')].map(x=>x.value),external=$('extraDestination').value==='external',pdf=$('extraPdf').files[0];if(!workers.length||!pdf)return alert('Seleziona dipendenti e PDF.');const payload={store_id:external?null:$('extraStore').value,nome_esterno:external?$('extraExternalName').value.trim():null,indirizzo_esterno:external?$('extraExternalAddress').value.trim():null,titolo:$('extraTitle').value.trim(),descrizione:$('extraDescription').value.trim()||null,giorno_intervento:$('extraDate').value,note_lorenzo:null,stato:'programmato',creato_da:profile.id};const {data,error}=await sb.from('extras').insert(payload).select().single();if(error)return alert(error.message);let r=await sb.from('extra_workers').insert(workers.map(profile_id=>({extra_id:data.id,profile_id})));if(r.error)return alert(r.error.message);const path=`extra/${data.id}/richiesta-${Date.now()}.pdf`;try{await uploadFile(path,pdf);await addAttachment({tipo:'pdf_richiesta',extra_id:data.id,storage_path:path,nome_file:pdf.name,mime_type:pdf.type,dimensione_bytes:pdf.size,caricato_da:profile.id})}catch(err){return alert('Extra creato, ma PDF non caricato: '+err.message)}$('extraDialog').close();toast('Extra creato');await loadAll()};
$('extraEditDestination').onchange=toggleExtraEditDestination;
$('extraEditForm').onsubmit=async e=>{
  e.preventDefault();if(!admin())return;
  const id=$('extraEditId').value,workers=[...$('extraEditWorkers').querySelectorAll('input:checked')].map(x=>x.value),external=$('extraEditDestination').value==='external';
  if(!workers.length)return alert('Seleziona almeno un dipendente.');
  const payload={store_id:external?null:$('extraEditStore').value,nome_esterno:external?$('extraEditExternalName').value.trim():null,indirizzo_esterno:external?$('extraEditExternalAddress').value.trim():null,titolo:$('extraEditTitle').value.trim(),descrizione:$('extraEditDescription').value.trim()||null,giorno_intervento:$('extraEditDate').value};
  let r=await sb.from('extras').update(payload).eq('id',id);if(r.error)return alert(r.error.message);
  r=await sb.from('extra_workers').delete().eq('extra_id',id);if(r.error)return alert(r.error.message);
  r=await sb.from('extra_workers').insert(workers.map(profile_id=>({extra_id:id,profile_id})));if(r.error)return alert(r.error.message);
  const pdf=$('extraEditPdf').files[0];if(pdf){const old=attachments.find(a=>a.extra_id===id&&a.tipo==='pdf_richiesta');if(old){await sb.storage.from('documenti').remove([old.storage_path]);await sb.from('attachments').delete().eq('id',old.id)}const path=`extra/${id}/richiesta-${Date.now()}.pdf`;try{await uploadFile(path,pdf);await addAttachment({tipo:'pdf_richiesta',extra_id:id,storage_path:path,nome_file:pdf.name,mime_type:pdf.type,dimensione_bytes:pdf.size,caricato_da:profile.id})}catch(err){return alert('Dati salvati, ma nuovo PDF non caricato: '+err.message)}}
  $('extraEditDialog').close();toast('Extra aggiornato');await loadAll();
};
$('duplicateScheduleForm').onsubmit=async e=>{e.preventDefault();if(!admin())return;const source=$('duplicateScheduleId').value,newDate=$('duplicateScheduleDate').value,src=schedules.find(x=>x.id===source);if(!src||!newDate)return;const members=scheduleMembers.filter(m=>m.schedule_id===source),items=scheduleItems.filter(i=>i.schedule_id===source&&i.stato!=='completato');if(!items.length)return alert('Non ci sono lavori da duplicare.');const {data,error}=await sb.from('schedules').insert({giorno:newDate,nota_generale:src.nota_generale,creato_da:profile.id}).select().single();if(error)return alert(error.message);let r=await sb.from('schedule_members').insert(members.map(m=>({schedule_id:data.id,profile_id:m.profile_id})));if(r.error)return alert(r.error.message);r=await sb.from('schedule_items').insert(items.map((i,pos)=>({schedule_id:data.id,tipo:i.tipo,store_id:i.store_id,posizione:pos+1,stato:'da_fare'})));if(r.error)return alert(r.error.message);$('duplicateScheduleDialog').close();toast('Programmazione duplicata');await loadAll()};
$('closeExtraForm').onsubmit=async e=>{e.preventDefault();const id=$('closeExtraId').value,files=[['rapportino_eurospin',$('reportEurospin').files[0]],['rapportino_overgreen',$('reportOvergreen').files[0]]];for(const [tipo,file] of files){if(!file)return alert('Servono entrambi i rapportini.');const path=`extra/${id}/${tipo}-${Date.now()}-${file.name}`;try{await uploadFile(path,file);await addAttachment({tipo,extra_id:id,storage_path:path,nome_file:file.name,mime_type:file.type,dimensione_bytes:file.size,caricato_da:profile.id})}catch(err){return alert(err.message)}}const {error}=await sb.from('extras').update({stato:'in_attesa'}).eq('id',id);if(error)return alert(error.message);$('closeExtraDialog').close();toast('Extra inviato a Lorenzo');await loadAll()};


function isRecoverableJwtError(err){const m=String(err?.message||err||'').toLowerCase();return m.includes('jwt issued at future')||m.includes('jwt expired')||m.includes('invalid refresh token')||m.includes('refresh token not found')}
async function resetBrokenSession(){try{await sb.auth.signOut({scope:'local'})}catch{};localStorage.removeItem('sb-'+new URL(cfg.supabaseUrl).hostname.split('.')[0]+'-auth-token');sessionStorage.clear();session=null;$('app').classList.add('hidden');$('loginScreen').classList.remove('hidden');const box=$('loginError');if(box){box.textContent='La sessione era scaduta o non valida. Accedi di nuovo.';box.classList.remove('hidden')}}
sb.auth.onAuthStateChange(async(_event,s)=>{session=s;if(!s){$('loginScreen').classList.remove('hidden');$('app').classList.add('hidden');return}$('loginScreen').classList.add('hidden');$('app').classList.remove('hidden');try{await loadAll();setView('dashboard')}catch(err){console.error(err);if(isRecoverableJwtError(err))return resetBrokenSession();alert('Errore collegamento: '+err.message)}});
$('scheduleDate').value=tomorrow();renderSchedulePicker();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
