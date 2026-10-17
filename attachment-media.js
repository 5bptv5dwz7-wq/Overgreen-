/* Shared, session-only media URLs. No file contents or credentials are persisted. */
(function(root){
  function createUrlCache({sign,getScope,now=Date.now,ttl=480000,limit=300,concurrency=4}){
    const entries=new Map(),queue=[];let active=0,scope=null,generation=0;
    function clear(){generation++;entries.clear();while(queue.length)queue.shift().reject(new Error('Sessione media cambiata'));}
    function sync(){const next=getScope();if(next!==scope){clear();scope=next}return next;}
    function pump(){
      while(active<concurrency&&queue.length){
        const job=queue.shift();
        if(job.generation!==generation||job.scope!==getScope()){job.reject(new Error('Sessione media cambiata'));continue;}
        active++;
        Promise.resolve().then(()=>sign(job.path)).then(url=>{
          if(job.generation!==generation||job.scope!==getScope())throw new Error('Sessione media cambiata');
          if(!url)throw new Error('Collegamento al file non disponibile');
          job.entry.until=now()+ttl;job.resolve(url);
        }).catch(error=>{if(entries.get(job.path)===job.entry)entries.delete(job.path);job.reject(error)}).finally(()=>{active--;pump()});
      }
    }
    function get(path,{refresh=false}={}){
      sync();if(!scope||!path)return Promise.reject(new Error('File o sessione non disponibile'));
      if(refresh)entries.delete(path);
      let entry=entries.get(path);
      if(entry&&entry.until>now()){entries.delete(path);entries.set(path,entry);return entry.promise;}
      entry={until:Infinity};
      entry.promise=new Promise((resolve,reject)=>queue.push({path,entry,resolve,reject,scope,generation}));
      entries.set(path,entry);
      // Evict only completed entries: pending requests must stay deduplicated.
      for(const [key,value] of entries){if(entries.size<=limit)break;if(Number.isFinite(value.until))entries.delete(key);}
      pump();return entry.promise;
    }
    return {get,clear,invalidate:path=>entries.delete(path)};
  }
  function createVisibilityLoader({IntersectionObserver,MutationObserver,document}){
    const pending=new Map();let observer=null,cleanup=null;
    function cancel(node){pending.delete(node);observer?.unobserve(node);}
    function observe(node,load){
      if(!IntersectionObserver){queueMicrotask(()=>{if(node.isConnected)load()});return;}
      if(!observer){
        observer=new IntersectionObserver(rows=>{for(const row of rows){const fn=pending.get(row.target);if(row.isIntersecting&&row.target.isConnected&&fn){cancel(row.target);fn();}}},{rootMargin:'120px'});
        if(MutationObserver){cleanup=new MutationObserver(()=>{for(const node of pending.keys())if(!node.isConnected)cancel(node)});cleanup.observe(document.body,{childList:true,subtree:true});}
      }
      pending.set(node,load);observer.observe(node);
    }
    return {observe,cancel};
  }
  const api={createUrlCache,createVisibilityLoader};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenMedia=api;
})(typeof window==='object'?window:globalThis);
