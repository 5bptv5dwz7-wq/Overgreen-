/* V216 — native Apple scanner bridge, opt-in pilot for Lorenzo only.
 * Shortcuts receives a single-object upload capability, never the login token.
 * Uploaded PDFs stay staged until the usual closure save registers the attachment.
 */
window.AppleDocumentScanner=(()=>{
  'use strict';
  const USER='a59387b9-3e89-4432-bbb6-190874cc9925';
  const KEY='overgreen-apple-scans-v1',SETUP='overgreen-apple-scanner-setup-v1';
  const targets=['eurospin','overgreen'],metadataByFile=new WeakMap(),panels={};
  let options,preparing=false,checking=false,epoch=0;
  const ctx=()=>options?.context?.()||{};
  const allowed=c=>c.userId===USER&&c.profileId===USER;
  const enabled=()=>allowed(ctx())&&ctx().active;
  const ios=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
  const bucket=()=>options.client.storage.from('documenti');
  const key=(c,t)=>[c.userId,c.extraId,t].join(':');
  function jobs(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
  function update(k,value){const all=jobs();if(value)all[k]=value;else delete all[k];localStorage.setItem(KEY,JSON.stringify(all));}
  function validJob(j,c,t){return j&&j.userId===USER&&j.extraId===c.extraId&&j.target===t&&/^[0-9a-f-]{36}$/.test(j.id)&&j.path===`extra/${c.extraId}/${j.id}-apple-${t}.pdf`;}
  function message(t,text){panels[t].status.textContent=text;}
  function controls(){
    const on=enabled(),busy=!!options?.documents.isBusy()||preparing;
    for(const t of targets){const p=panels[t];if(!p)continue;p.root.hidden=!on;p.start.disabled=busy||!ios();p.check.disabled=busy||checking;p.launch.hidden=p.launch.hidden||!on;p.launch.style.pointerEvents=busy?'none':'';}
  }
  function forget(t){const c=ctx();if(!allowed(c)||!targets.includes(t))return;epoch++;update(key(c,t),null);if(panels[t]){panels[t].launch.hidden=true;panels[t].launch.removeAttribute('href');message(t,'');}}
  function metadata(file,extraId,tipo){const m=metadataByFile.get(file);return allowed(ctx())&&m?.extraId===extraId&&'rapportino_'+m.target===tipo?m:null;}
  function committed(file){const m=metadataByFile.get(file);if(!m||!allowed(ctx()))return;const k=key({userId:USER,extraId:m.extraId},m.target);if(jobs()[k]?.id===m.id)update(k,null);}
  async function prepare(t){
    if(!enabled()||!ios()||preparing||options.documents.isBusy())return;
    if(localStorage.getItem(SETUP)!=='1'){panels[t].help.open=true;message(t,'Prima configura il comando rapido con la guida qui sotto.');return;}
    const c={...ctx()},k=key(c,t);
    if((jobs()[k]||options.documents.get(t))&&!confirm('Preparare una nuova scansione? Il documento selezionato resta disponibile finché arriva quello nuovo.'))return;
    preparing=true;controls();message(t,'Preparo la scansione…');const stamp=epoch;
    try{
      // Confirm the real authenticated identity before requesting a signed URL.
      const auth=await options.client.auth.getUser();
      if(auth.error||auth.data?.user?.id!==USER)throw new Error('Scanner disponibile solo per Lorenzo. Accedi di nuovo.');
      const id=crypto.randomUUID(),path=`extra/${c.extraId}/${id}-apple-${t}.pdf`;
      const r=await bucket().createSignedUploadUrl(path,{upsert:false});if(r.error)throw r.error;
      if(!enabled()||ctx().extraId!==c.extraId||epoch!==stamp)return;
      const job={id,path,userId:USER,extraId:c.extraId,target:t,createdAt:Date.now()};
      // Persist the destination before leaving the PWA; do not persist the upload token.
      update(k,job);
      const launch=panels[t].launch;
      launch.href='shortcuts://run-shortcut?name='+encodeURIComponent('Scansiona Overgreen')+'&input=text&text='+encodeURIComponent(r.data.signedUrl);
      launch.hidden=false;
      message(t,'Pronto. Tocca “Apri scanner Apple”. Dopo l’invio torna qui. Collegamento valido 2 ore.');
    }catch(err){message(t,err.message||'Impossibile preparare la scansione. Riprova.');}
    finally{preparing=false;controls();}
  }
  async function check(manual=false){
    if(!enabled()||checking||preparing||options.documents.isBusy())return;
    checking=true;controls();const c={...ctx()},stamp=epoch;
    try{
      for(const t of targets){
        const k=key(c,t),job=jobs()[k];if(!validJob(job,c,t))continue;
        if(metadataByFile.get(options.documents.get(t))?.id===job.id)continue;
        // A registered attachment (e.g. after a failed closure) must not be recreated.
        const saved=await options.client.from('attachments').select('id').eq('id',job.id).maybeSingle();
        if(saved.error)throw saved.error;
        if(saved.data){if(jobs()[k]?.id===job.id)update(k,null);continue;}
        const r=await bucket().download(job.path);
        if(!enabled()||ctx().extraId!==c.extraId||stamp!==epoch||jobs()[k]?.id!==job.id||options.documents.isBusy())return;
        if(r.error){
          const missing=/not found|does not exist|not_found/i.test(r.error.message||'')||String(r.error.statusCode)==='404';
          if(manual||Date.now()-job.createdAt>7200000)message(t,missing?'PDF non ancora ricevuto. Completa il comando rapido oppure prepara una nuova scansione.':'Recupero non riuscito. Controlla la connessione e premi “Recupera scansione”.');
          continue;
        }
        const blob=r.data;
        if(blob.size>50*1024*1024)throw new Error('PDF troppo grande (massimo 50 MB). Scansiona meno pagine.');
        if(await blob.slice(0,5).text()!=='%PDF-')throw new Error('Il comando non ha inviato un PDF valido. Controlla “Usa PDF” e il corpo della richiesta nella guida.');
        if(!enabled()||ctx().extraId!==c.extraId||stamp!==epoch||jobs()[k]?.id!==job.id||options.documents.isBusy())return;
        const file=new File([blob],`Rapportino-${t}-scansione.pdf`,{type:'application/pdf'});
        if(options.documents.select(t,file,'apple')){
          metadataByFile.set(file,job);panels[t].launch.hidden=true;panels[t].launch.removeAttribute('href');
          message(t,'✓ Scansione Apple ricevuta. Conferma il salvataggio dell’extra per allegarla.');
        }
      }
    }catch(err){if(manual&&enabled())for(const t of targets)if(jobs()[key(c,t)])message(t,err.message||'Recupero non riuscito. Riprova.');}
    finally{checking=false;controls();}
  }
  function refresh(){
    epoch++;
    for(const t of targets){if(!panels[t])continue;panels[t].launch.hidden=true;panels[t].launch.removeAttribute('href');message(t,ios()?'':'Apri Overgreen su iPhone o iPad per usare lo scanner Apple.');}
    controls();void check();
  }
  function init(config){
    options=config;
    for(const t of targets){
      const card=document.getElementById(`doc-${t}-card`),root=document.createElement('section');
      root.hidden=true;root.className='apple-scan-pilot';root.style.cssText='margin:12px 0;padding:12px;border:1px solid #a8cab5;border-radius:12px';
      root.innerHTML=`<strong>Scanner Apple · prova Lorenzo</strong><div class="actions" style="margin-top:8px"><button type="button" data-start>Scansiona con iPhone</button><button type="button" class="secondary" data-check>Recupera scansione</button></div><a data-launch hidden style="margin:10px 0;font-weight:700">Apri scanner Apple →</a><p data-status role="status" aria-live="polite"></p><details><summary>Configurazione iniziale iPhone</summary><p>Installa <a href="https://apps.apple.com/it/app/actions/id1586435171" target="_blank" rel="noopener">Actions</a> e crea il comando <strong>Scansiona Overgreen</strong> seguendo la <a href="apple-scanner-setup.html" target="_blank" rel="noopener">guida passo per passo</a>.</p><p>Quando hai finito, torna qui e premi:</p><button type="button" class="secondary" data-ready>Ho configurato il comando rapido</button></details>`;
      card.appendChild(root);
      panels[t]={root,start:root.querySelector('[data-start]'),check:root.querySelector('[data-check]'),launch:root.querySelector('[data-launch]'),status:root.querySelector('[data-status]'),help:root.querySelector('details')};
      panels[t].start.onclick=()=>prepare(t);panels[t].check.onclick=()=>check(true);
      panels[t].launch.onclick=e=>{if(!enabled()||options.documents.isBusy()||preparing){e.preventDefault();return;}message(t,'Scanner aperto. Dopo aver inviato il PDF, torna a Overgreen.');};
      root.querySelector('[data-ready]').onclick=()=>{if(!enabled())return;localStorage.setItem(SETUP,'1');panels[t].help.open=false;message(t,'Configurazione confermata. Ora premi “Scansiona con iPhone”.');};
    }
    document.getElementById('closeExtraDialog').addEventListener('close',refresh);
    window.addEventListener('focus',()=>{controls();void check();});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){controls();void check();}});
    window.setInterval(()=>{controls();if(!document.hidden)void check();},5000);
    controls();
  }
  return {init,refresh,forget,metadata,committed,check,prepare};
})();
