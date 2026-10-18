/* Coordinates reads with writes, including writes made by existing screens. */
(function(root){
 function create({fetch:fetcher,getScope=()=>'',timeoutMs=45000}){
  let revision=0,active=0,epoch=0;const waiters=[],queues=new Map(),controllers=new Set();
  function changed(){revision++}
  function idle(){return active?new Promise(resolve=>waiters.push(resolve)):Promise.resolve()}
  async function request(input,init={}){
   const url=String(input?.url||input),method=(init.method||input?.method||'GET').toUpperCase();
   const write=/\/rest\/v1\//.test(url)&&!['GET','HEAD'].includes(method)&&!url.includes('/rpc/overgreen_read_data_v271')&&!/\/rpc\/write_(?:client_)?audit(?:_log)?(?:[?]|$)/.test(url)&&!/\/(app_devices|app_reload_commands|audit_logs)(?:[?]|$)/.test(url);
   if(write){active++;changed()}
   const controller=new AbortController(),external=init.signal||input?.signal,abort=()=>controller.abort(external?.reason);
   controllers.add(controller);
   if(external?.aborted)abort();else external?.addEventListener('abort',abort,{once:true});
   const timer=setTimeout(()=>controller.abort(new Error('Connessione troppo lenta. Riprova: i dati da inviare restano conservati.')),url.includes('/storage/v1/object/')&&method==='POST'?90000:timeoutMs);
   // Keep the deadline and mutation barrier until JSON is fully received, not
   // just until the headers arrive. A stalled body otherwise blocks the SDK forever.
   let onAbort;
   const cancelled=new Promise((_,reject)=>{onAbort=()=>reject(controller.signal.reason||new Error('Richiesta interrotta'));if(controller.signal.aborted)onAbort();else controller.signal.addEventListener('abort',onAbort,{once:true})});
   try{return await Promise.race([cancelled,(async()=>{
    const response=await fetcher(input,{...init,signal:controller.signal});
    if(response.body&&/\bjson\b/i.test(response.headers?.get('content-type')||'')){
     const body=await response.text();
     return new Response(body,{status:response.status,statusText:response.statusText,headers:response.headers});
    }
    return response;
   })()])}
   finally{clearTimeout(timer);controllers.delete(controller);controller.signal.removeEventListener('abort',onAbort);external?.removeEventListener('abort',abort);if(write){changed();active--;if(!active)waiters.splice(0).forEach(resolve=>resolve())}}
  }
  async function fresh(read){
   const actor=getScope(),startEpoch=epoch;
   for(let attempts=0;attempts<8;attempts++){
    await idle();if(getScope()!==actor||startEpoch!==epoch)throw new Error('Sessione cambiata durante il caricamento');
    const start=revision,result=await read();
    if(getScope()!==actor||startEpoch!==epoch)throw new Error('Sessione cambiata durante il caricamento');
    if(start===revision&&!active)return result;
   }
   throw new Error('Salvataggi in corso. Attendi il completamento e aggiorna.');
  }
  function enqueue(key,action){
   changed();const actor=getScope(),startEpoch=epoch,previous=queues.get(key)||Promise.resolve();
   const pending=previous.catch(()=>{}).then(()=>{if(getScope()!==actor||startEpoch!==epoch)throw new Error('Sessione cambiata: operazione non inviata');return action()});queues.set(key,pending);
   pending.finally(()=>{changed();if(queues.get(key)===pending)queues.delete(key)}).catch(()=>{});return pending;
  }
  function reset(){epoch++;changed();for(const controller of controllers)controller.abort(new Error('Sessione cambiata'));}
  return {fetch:request,fresh,enqueue,changed,reset,idle,revision:()=>revision,pending:()=>queues.size};
 }
 function createReadCache({getScope,getRevision,now=Date.now,ttl=30000}){
  const entries=new Map();let epoch=0;
  async function get(key,read,{force=false}={}){
   const scope=getScope(),version=getRevision(),existing=entries.get(key);
   if(existing?.scope===scope&&existing.epoch===epoch){
    if(existing.pending){await existing.pending;if(scope!==getScope())throw new Error('Sessione cambiata');if(existing.revision===getRevision())return existing.value;return get(key,read,{force})}
    if(!force&&existing.revision===version&&existing.until>now())return existing.value;
   }
   const entry={scope,epoch,revision:version,pending:null};entries.set(key,entry);
   const promise=Promise.resolve().then(read).then(value=>{
    if(scope!==getScope()||entry.epoch!==epoch)throw new Error('Sessione cambiata');
    entry.value=value;entry.revision=getRevision();entry.until=now()+ttl;return value;
   }).catch(error=>{if(entries.get(key)===entry)entries.delete(key);throw error}).finally(()=>{entry.pending=null});
   entry.pending=promise;return promise;
  }
  return {get,clear(){epoch++;entries.clear()}};
 }
 const api={create,createReadCache};if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenDataSync=api;
})(typeof window==='object'?window:globalThis);
