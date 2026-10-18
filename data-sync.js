/* Coordinates reads with writes, including writes made by existing screens. */
(function(root){
 function create({fetch:fetcher,getScope=()=>'',timeoutMs=45000}){
  let revision=0,active=0;const waiters=[],queues=new Map();
  function changed(){revision++}
  function idle(){return active?new Promise(resolve=>waiters.push(resolve)):Promise.resolve()}
  async function request(input,init={}){
   const url=String(input?.url||input),method=(init.method||input?.method||'GET').toUpperCase();
   const write=/\/rest\/v1\//.test(url)&&!['GET','HEAD'].includes(method)&&!url.includes('/rpc/overgreen_read_data_v271')&&!/\/rpc\/write_(?:client_)?audit(?:_log)?(?:[?]|$)/.test(url)&&!/\/(app_devices|app_reload_commands|audit_logs)(?:[?]|$)/.test(url);
   if(write){active++;changed()}
   const controller=new AbortController(),external=init.signal||input?.signal,abort=()=>controller.abort(external?.reason);
   if(external?.aborted)abort();else external?.addEventListener('abort',abort,{once:true});
   const timer=setTimeout(()=>controller.abort(new Error('Connessione troppo lenta. Riprova: i dati da inviare restano conservati.')),url.includes('/storage/v1/object/')&&method==='POST'?90000:timeoutMs);
   try{return await fetcher(input,{...init,signal:controller.signal})}
   finally{clearTimeout(timer);external?.removeEventListener('abort',abort);if(write){changed();active--;if(!active)waiters.splice(0).forEach(resolve=>resolve())}}
  }
  async function fresh(read){
   const actor=getScope();
   for(let attempts=0;attempts<8;attempts++){
    await idle();const start=revision,result=await read();
    if(getScope()!==actor)throw new Error('Sessione cambiata durante il caricamento');
    if(start===revision&&!active)return result;
   }
   throw new Error('Salvataggi in corso. Attendi il completamento e aggiorna.');
  }
  function enqueue(key,action){
   changed();const previous=queues.get(key)||Promise.resolve();
   const pending=previous.catch(()=>{}).then(action);queues.set(key,pending);
   pending.finally(()=>{changed();if(queues.get(key)===pending)queues.delete(key)}).catch(()=>{});return pending;
  }
  return {fetch:request,fresh,enqueue,changed,idle,revision:()=>revision,pending:()=>queues.size};
 }
 const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenDataSync=api;
})(typeof window==='object'?window:globalThis);
