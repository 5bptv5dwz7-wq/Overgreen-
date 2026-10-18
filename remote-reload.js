/* V230: authenticated device polling; never clears credentials or local files. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenRemoteReload=api})(typeof window==='object'?window:globalThis,function(){
  const statuses={pending:'Inviato · attendo il dispositivo',waiting:'Ricevuto · attendo fine lavoro',reloading:'Ricarica avviata · attendo conferma',completed:'Ricarica confermata',failed:'Ricarica non confermata / versione non aggiornata'};
  function action(command,busy,now=Date.now()){
    if(!command||!['pending','waiting'].includes(command.status)||!Number.isFinite(Date.parse(command.expires_at))||Date.parse(command.expires_at)<=now)return 'none';
    return command.mode==='safe'&&busy?'wait':'reload';
  }
  function versionReached(loaded,required){return /^V\d+$/.test(loaded)&&/^V\d+$/.test(required)&&Number(loaded.slice(1))>=Number(required.slice(1))}
  function create(o){
    const win=o.window,doc=o.document,storage=o.storage,deviceStorage=o.deviceStorage||storage;let polling=false,reloading=false,registered='',id='',actor='',timer,lastHeartbeat=0,lastBusy=null;
    const prefix='overgreen-remote-v230:',boot=o.uuid();
    async function busyState(){let timer;try{return await Promise.race([o.busy(),new Promise(resolve=>{timer=win.setTimeout(()=>resolve(true),2000)})])}catch{return true}finally{win.clearTimeout(timer)}}
    function identity(user){
      if(actor===user&&id)return id;
      actor=user;registered='';id=deviceStorage.getItem(prefix+user);
      if(!id){id=o.uuid();deviceStorage.setItem(prefix+user,id)}return id;
    }
    async function tick(){
      if(polling||reloading||doc.visibilityState==='hidden')return;
      const user=o.user();if(!user)return;polling=true;
      try{
        identity(user);const busy=await busyState();if(o.user()!==user)return;
        if(registered!==id){await o.register({id,user_id:user,label:o.label(),version:o.version,busy});registered=id;lastHeartbeat=Date.now();lastBusy=busy}
        else if(Date.now()-lastHeartbeat>=120000||busy!==lastBusy){await o.heartbeat(id,{version:o.version,busy});lastHeartbeat=Date.now();lastBusy=busy}
        const key=prefix+'ack:'+user,marker=JSON.parse(storage.getItem(key)||'null');
        if(marker&&marker.device===id&&marker.boot!==boot&&marker.phase==='reloading'){
          await o.ack(marker.command,{status:versionReached(o.version,marker.version)?'completed':'failed',loaded_version:o.version});storage.removeItem(key);
        }
        const command=await o.latest(id);if(o.user()!==user)return;
        const decision=action(command,busy);
        if(decision==='wait'){
          if(command.status!=='waiting')await o.ack(command.id,{status:'waiting'});
          return;
        }
        if(decision!=='reload')return;
        // No automatic reload unless receipt and recovery marker are durable.
        storage.setItem(key,JSON.stringify({device:id,command:command.id,version:command.required_version,boot,phase:'prepared'}));
        await o.ack(command.id,{status:'reloading'});
        // Recheck after network waits: the employee may have opened a form.
        if(command.mode==='safe'&&await busyState()){
          storage.removeItem(key);await o.ack(command.id,{status:'waiting'});return;
        }
        if(o.user()!==user){storage.removeItem(key);return}
        storage.setItem(key,JSON.stringify({device:id,command:command.id,version:command.required_version,boot,phase:'reloading'}));
        reloading=true;o.notice('Aggiornamento dell’app richiesto dall’amministratore…');
        await o.updateWorker();o.reload();
      }catch(error){o.error?.(error)}finally{polling=false}
    }
    function start(){if(timer)return;timer=win.setInterval(()=>void tick(),60000);doc.addEventListener('visibilitychange',()=>void tick());win.addEventListener('online',()=>void tick());void tick()}
    return {start,tick,deviceId:()=>id};
  }
  return {create,action,versionReached,statuses};
});
