/* V206: durable photo outbox. No network operation precedes the local commit. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenPhotoSync=api})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const DB='overgreen-photo-outbox-v206',STORES=['submissions','jobs','photos','receipts'];
  const RETENTION=7*24*60*60*1000;
  function errorText(e){return String(e?.message||e||'Errore sconosciuto').slice(0,500)}
  function temporary(e){const status=Number(e?.status||e?.statusCode);return !(['LOCAL_FILE_MISSING','INVALID_PHOTO'].includes(e?.code)||[400,403,404,413,415,422].includes(status)||['42501','23514','P0001','22P02'].includes(e?.code))}
  function backoff(n){return Math.min(300000,3000*2**Math.min(7,Math.max(0,n-1)))}
  function timeout(promise,ms,label){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error(label||'Operazione interrotta: riproverò.'),{code:'TIMEOUT'})),ms)})]).finally(()=>clearTimeout(timer))}
  function storage(indexedDB,name=DB){
    async function open(){return new Promise((resolve,reject)=>{
      let expired=false;const req=indexedDB.open(name,1),timer=setTimeout(()=>{expired=true;reject(new Error('Archivio foto occupato. Chiudi le altre finestre di Overgreen e riprova.'))},12000);
      req.onupgradeneeded=()=>{for(const s of STORES)if(!req.result.objectStoreNames.contains(s))req.result.createObjectStore(s,{keyPath:'id'})};
      req.onerror=()=>{clearTimeout(timer);reject(req.error)};
      req.onsuccess=()=>{clearTimeout(timer);if(expired){req.result.close();return}req.result.onversionchange=()=>req.result.close();resolve(req.result)};
    })}
    async function tx(names,mode,run){const db=await open();return new Promise((resolve,reject)=>{
      let transaction,out,timer,done=false;
      const finish=(err)=>{if(done)return;done=true;clearTimeout(timer);db.close();err?reject(err):resolve(typeof out==='function'?out():out)};
      try{transaction=db.transaction(names,mode);transaction.oncomplete=()=>finish();transaction.onerror=()=>finish(transaction.error||new Error('Salvataggio foto non riuscito'));transaction.onabort=()=>finish(transaction.error||new Error('Salvataggio foto interrotto'));timer=setTimeout(()=>{try{transaction.abort()}catch{}finish(new Error('Archivio foto non risponde. Riprova senza chiudere questa finestra.'))},15000);out=run(transaction)}catch(err){try{transaction?.abort()}catch{}finish(err)}
    })}
    const all=name=>tx([name],'readonly',t=>{const r=t.objectStore(name).getAll();return ()=>r.result||[]});
    const get=(name,id)=>tx([name],'readonly',t=>{const r=t.objectStore(name).get(id);return ()=>r.result});
    const put=(name,row)=>tx([name],'readwrite',t=>{t.objectStore(name).put(row)});
    return {tx,all,get,put};
  }
  function create(options){
    const db=options.store||storage(options.indexedDB||globalThis.indexedDB),now=options.now||Date.now;
    const actor=options.actor,api=options.api,changed=()=>{try{options.changed?.()}catch{}};
    let running=null,timer=null,lastError='',stopped=false;
    function belongs(row,who=actor()){return !!who&&row.actorProfileId===who.profileId&&(!row.callerId||row.callerId===who.callerId)}
    function guard(who){const current=actor();if(!current||current.profileId!==who.profileId||current.callerId!==who.callerId)throw Object.assign(new Error('Accedi con lo stesso account per inviare queste foto.'),{status:401})}
    async function materialize(file){
      if(!file?.size)throw Object.assign(new Error('Una foto è vuota o non più leggibile. Selezionala di nuovo.'),{code:'INVALID_PHOTO'});
      const compressed=await timeout(options.compress?options.compress(file):Promise.resolve(file),25000,'Preparazione foto interrotta. Seleziona di nuovo la foto.');
      const bytes=await timeout(compressed.arrayBuffer(),15000,'La foto non è leggibile. Selezionala di nuovo.');
      if(!bytes.byteLength||bytes.byteLength!==compressed.size)throw Object.assign(new Error('Foto incompleta: selezionala di nuovo.'),{code:'INVALID_PHOTO'});
      return {file:new Blob([bytes],{type:compressed.type||file.type||'image/jpeg'}),fileName:compressed.name||file.name||'foto.jpg',mimeType:compressed.type||file.type||'image/jpeg'};
    }
    async function prepare(attempt){
      const id=attempt.args.p_request_id,previous=await db.get('submissions',id);if(previous){if(!belongs(previous))throw new Error('Salvataggio di un altro account');return previous}
      const who=actor();if(!who)throw new Error('Accedi prima di salvare');
      const rows=[];for(let n=0;n<attempt.files.length;n++){const data=await materialize(attempt.files[n]);rows.push({...data,prepared:true,id:attempt.photoIds[n],kind:'intervention-photo',requestId:id,interventionId:null,actorProfileId:who.profileId,callerId:who.callerId,createdAt:now()+n,savedAt:now(),retries:0,nextAttemptAt:0,lastStage:'queued',lastError:'',uploadedAt:null})}
      guard(who);
      const submission={id,args:attempt.args,photoIds:attempt.photoIds,actorProfileId:who.profileId,callerId:who.callerId,createdAt:now(),siteName:attempt.siteName||'',result:null,retries:0,nextAttemptAt:0,lastError:'',blocked:false};
      await db.tx(['submissions','jobs','photos'],'readwrite',t=>{t.objectStore('submissions').add(submission);for(const row of rows){t.objectStore('jobs').add(row);t.objectStore('photos').add(row)}});
      // Read back the actual stored bytes before allowing a server-side closure.
      for(const row of rows){const saved=await db.get('photos',row.id);if(!saved?.file||saved.file.size!==row.file.size||(await saved.file.arrayBuffer()).byteLength!==row.file.size)throw new Error('Verifica copia foto non riuscita. Riprova il salvataggio.')}
      changed();return submission;
    }
    async function error(row,err,storeName){
      row.retries=(row.retries||0)+1;row.lastError=errorText(err);row.blocked=!temporary(err);row.nextAttemptAt=now()+backoff(row.retries);row.failedAt=now();
      if(storeName==='jobs')row.lastStage=row.blocked?'blocked':'retrying';
      await db.put(storeName,row);changed();
      if(row.interventionId)await api.event(row,row.blocked?'blocked':'retrying',row.lastError).catch(()=>{});
    }
    async function sendSubmission(row,who){
      if(row.result)return row;
      guard(who);const photos=[];for(const id of row.photoIds){const p=await db.get('photos',id);if(!p?.file?.size||(await timeout(p.file.arrayBuffer(),15000,'Verifica foto interrotta')).byteLength!==p.file.size)throw Object.assign(new Error('Copia locale della foto mancante. Serve recuperarla dal telefono.'),{code:'LOCAL_FILE_MISSING'});photos.push(p)}
      const result=await api.submit(row,photos);guard(who);
      if(!result?.intervention?.id)throw new Error('Risposta incompleta: riprenderò lo stesso salvataggio.');
      const bound={...row,result,lastError:'',blocked:false};
      await db.tx(['submissions','jobs','photos'],'readwrite',t=>{
        t.objectStore('submissions').put(bound);
        for(const p of photos){p.interventionId=result.intervention.id;t.objectStore('photos').put(p);t.objectStore('jobs').put(p)}
      });
      options.receivedIntervention?.(result.intervention);changed();return bound;
    }
    async function acknowledge(job,result){
      const backup={...job,uploadedAt:now(),lastStage:'received',lastError:'',blocked:false};
      await db.tx(['jobs','photos','receipts'],'readwrite',t=>{t.objectStore('photos').put(backup);t.objectStore('receipts').put({id:job.id,interventionId:job.interventionId,actorProfileId:job.actorProfileId,callerId:job.callerId,receivedAt:now()});t.objectStore('jobs').delete(job.id)});
      options.receivedPhoto?.(result,job);await options.ackLegacy?.(job).catch(()=>{});changed();
    }
    async function sendPhoto(job,who){
      guard(who);
      // Stable server path and receipt make a lost upload/finalize response harmless.
      const registered=await api.register(job);guard(who);job.storagePath=registered.storage_path;
      let receipt=await api.finalize(job);guard(who);
      if(!receipt?.received){
        if(!job.file?.size)throw Object.assign(new Error('Foto assente dalla copia locale. Aggiungila dalla galleria.'),{code:'LOCAL_FILE_MISSING'});
        job.lastStage='uploading';job.attempts=(job.attempts||0)+1;job.lastAttemptAt=now();await db.put('jobs',job);changed();
        await api.event(job,'uploading',null).catch(()=>{});guard(who);
        await api.upload(job);guard(who);
        job.lastStage='verifying';await db.put('jobs',job);changed();
        receipt=await api.finalize(job);guard(who);
        if(!receipt?.received)throw new Error('Ricezione non ancora confermata: ritenterò la verifica.');
      }
      await acknowledge(job,receipt);
    }
    async function pass(){
      const who=actor();if(!who||stopped)return;
      lastError='';
      for(const row of (await db.all('submissions')).filter(r=>belongs(r,who)&&!r.result&&!r.blocked&&r.nextAttemptAt<=now()).sort((a,b)=>a.createdAt-b.createdAt)){
        try{await sendSubmission(row,who)}catch(e){await error(row,e,'submissions')}
      }
      for(const job of (await db.all('jobs')).filter(j=>belongs(j,who)&&j.interventionId&&!j.blocked&&(j.nextAttemptAt||0)<=now()).sort((a,b)=>a.createdAt-b.createdAt)){
        try{await sendPhoto(job,who)}catch(e){await error(job,e,'jobs')}
      }
      await cleanup();
    }
    async function schedule(){clearTimeout(timer);timer=null;if(stopped||!actor())return;
      const rows=[...(await db.all('submissions')).filter(r=>!r.result),...(await db.all('jobs')).filter(r=>r.interventionId)].filter(r=>belongs(r)&&!r.blocked);
      if(rows.length){const delay=Math.max(1000,Math.min(...rows.map(r=>(r.nextAttemptAt||0)-now())));timer=setTimeout(()=>{timer=null;run().catch(()=>{})},delay)}
    }
    function run(){if(running)return running;stopped=false;
      const work=()=>pass();
      // One worker across app tabs; idempotent server operations are also required.
      const task=options.locks?options.locks.request(DB,{ifAvailable:true},lock=>lock?work():undefined):work();
      running=Promise.resolve(task).catch(e=>{lastError=errorText(e);throw e}).finally(async()=>{running=null;changed();try{await schedule()}catch(e){lastError=errorText(e)}});changed();return running;
    }
    async function retry(){const who=actor();if(!who)return;for(const name of ['submissions','jobs'])for(const r of await db.all(name))if(belongs(r,who)&&!(name==='submissions'&&r.result)){r.nextAttemptAt=0;r.blocked=false;await db.put(name,r)}return run()}
    async function resume(){const who=actor();if(!who)return;for(const name of ['submissions','jobs'])for(const r of await db.all(name))if(belongs(r,who)&&!r.blocked&&!(name==='submissions'&&r.result)){r.nextAttemptAt=0;await db.put(name,r)}return run()}
    async function restore(rows){
      const who=actor();if(!who)return;
      for(const original of rows){if(!belongs(original,who)||!original.interventionId)continue;if(await db.get('receipts',original.id)||await db.get('jobs',original.id))continue;
        // Already-acknowledged backups are never resurrected after an intentional deletion.
        if(original.uploadedAt)continue;
        const backup=await db.get('photos',original.id);if(backup?.uploadedAt)continue;
        let data={file:original.file,fileName:original.fileName,mimeType:original.mimeType};
        try{if(original.file&&!original.prepared)data=await materialize(original.file);if(original.file&&!original.file.name&&original.fileName)data.fileName=original.fileName}catch(e){lastError=errorText(e);continue}
        const row={...original,...data,prepared:true,kind:'intervention-photo',callerId:original.callerId||who.callerId,retries:0,nextAttemptAt:0,blocked:false,lastStage:'queued',uploadedAt:null,savedAt:original.savedAt||now()};
        await db.tx(['jobs','photos'],'readwrite',t=>{t.objectStore('jobs').put(row);t.objectStore('photos').put(row)});
      }
      changed();
    }
    async function attach(interventionId,files,ids,siteName=''){
      const who=actor();if(!who)throw new Error('Accedi prima di aggiungere foto');
      const rows=[];for(let n=0;n<files.length;n++)rows.push({...await materialize(files[n]),prepared:true,id:ids[n],kind:'intervention-photo',interventionId,siteName,actorProfileId:who.profileId,callerId:who.callerId,createdAt:now()+n,savedAt:now(),retries:0,nextAttemptAt:0,lastStage:'queued',uploadedAt:null});
      guard(who);await db.tx(['jobs','photos'],'readwrite',t=>{for(const row of rows){t.objectStore('jobs').put(row);t.objectStore('photos').put(row)}});changed();
    }
    async function cleanup(){const cut=now()-RETENTION;await db.tx(['photos','submissions','jobs'],'readwrite',t=>{
      const photos=t.objectStore('photos').openCursor();photos.onsuccess=()=>{const c=photos.result;if(c){if(c.value.uploadedAt&&c.value.uploadedAt<cut)c.delete();c.continue()}};
      const submissions=t.objectStore('submissions').openCursor();submissions.onsuccess=()=>{const c=submissions.result;if(c){const r=c.value;if(r.result&&r.createdAt<cut){const pending=t.objectStore('jobs').getAll();pending.onsuccess=()=>{if(!pending.result.some(j=>j.requestId===r.id))t.objectStore('submissions').delete(r.id)}}c.continue()}};
    })}
    async function snapshot(){return {jobs:(await db.all('jobs')).filter(r=>belongs(r)),submissions:(await db.all('submissions')).filter(r=>belongs(r)),running:!!running,error:lastError}}
    function stop(){stopped=true;clearTimeout(timer);timer=null}
    return {prepare,run,retry,resume,restore,attach,snapshot,cleanup,stop,db,getSubmission:id=>db.get('submissions',id)};
  }
  return {create,storage,temporary,backoff,timeout,DB};
});
