/* Shared, session-only media URLs. No file contents or credentials are persisted. */
(function(root){
  // Coalesce visible photos into one Storage signing call. Each result and each
  // cancellation remains independent; a missing image cannot fail the gallery.
  function createBatchSigner({sign,getScope,maxBatch=8}){
    let queue=[],scheduled=false;
    function flush(){
      scheduled=false;const waiting=queue.filter(job=>!job.done);queue=[];
      while(waiting.length){
        const scope=waiting[0].scope,jobs=[];
        for(let i=0;i<waiting.length&&jobs.length<maxBatch;)if(waiting[i].scope===scope)jobs.push(waiting.splice(i,1)[0]);else i++;
        const controller=new AbortController();
        const finish=(job,error,value)=>{if(job.done)return;job.done=true;job.signal?.removeEventListener('abort',job.abort);if(error)job.reject(error);else job.resolve(value)};
        for(const job of jobs)job.group={jobs,controller};
        Promise.resolve().then(()=>{
          if(scope!==getScope())throw new Error('Sessione media cambiata');
          return sign(jobs.map(job=>job.path),{signal:controller.signal,scope});
        }).then(results=>{for(const job of jobs){const value=results.get(job.path);finish(job,scope!==getScope()?new Error('Sessione media cambiata'):value instanceof Error?value:!value?new Error('File non disponibile'):null,value)}})
          .catch(error=>jobs.forEach(job=>finish(job,error)));
      }
    }
    return (path,{signal}={})=>new Promise((resolve,reject)=>{
      const job={path,signal,resolve,reject,scope:getScope(),done:false};
      job.abort=()=>{if(job.done)return;job.done=true;reject(new Error('Richiesta media interrotta'));signal?.removeEventListener('abort',job.abort);if(job.group?.jobs.every(x=>x.done))job.group.controller.abort()};
      if(signal?.aborted){job.abort();return}signal?.addEventListener('abort',job.abort,{once:true});queue.push(job);
      if(!scheduled){scheduled=true;setTimeout(flush,0)}
    });
  }
  function createUrlCache({sign,getScope,now=Date.now,ttl=480000,limit=300,concurrency=4,timeoutMs=15000}){
    const entries=new Map(),queue=[],running=new Set();let active=0,scope=null,generation=0;
    function clear(){generation++;entries.clear();while(queue.length)queue.shift().reject(new Error('Sessione media cambiata'));for(const job of running)job.cancel();}
    function sync(){const next=getScope();if(next!==scope){clear();scope=next}return next;}
    function pump(){
      while(active<concurrency&&queue.length){
        const job=queue.shift();
        if(job.generation!==generation||job.scope!==getScope()){job.reject(new Error('Sessione media cambiata'));continue;}
        active++;
        const controller=new AbortController();let timer;
        const cancelled=new Promise((_,reject)=>{job.cancel=()=>{controller.abort();reject(new Error('Sessione media cambiata'))}});running.add(job);
        const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Collegamento troppo lento. Tocca per riprovare.'))},timeoutMs)});
        Promise.race([Promise.resolve().then(()=>sign(job.path,{signal:controller.signal})),deadline,cancelled]).then(url=>{
          if(job.generation!==generation||job.scope!==getScope())throw new Error('Sessione media cambiata');
          if(!url)throw new Error('Collegamento al file non disponibile');
          job.entry.until=now()+ttl;job.resolve(url);
        }).catch(error=>{if(entries.get(job.path)===job.entry)entries.delete(job.path);job.reject(error)}).finally(()=>{clearTimeout(timer);running.delete(job);active--;pump()});
      }
    }
    function get(path,{refresh=false,priority=0}={}){
      sync();if(!scope||!path)return Promise.reject(new Error('File o sessione non disponibile'));
      if(refresh&&Number.isFinite(entries.get(path)?.until))entries.delete(path);
      let entry=entries.get(path);
      if(entry&&entry.until>now()){entries.delete(path);entries.set(path,entry);const queued=queue.find(j=>j.entry===entry);if(queued&&priority>queued.priority){queued.priority=priority;queue.sort((a,b)=>b.priority-a.priority)}return entry.promise;}
      entry={until:Infinity};
      entry.promise=new Promise((resolve,reject)=>queue.push({path,entry,resolve,reject,scope,generation,priority}));
      entries.set(path,entry);
      // Evict only completed entries: pending requests must stay deduplicated.
      for(const [key,value] of entries){if(entries.size<=limit)break;if(Number.isFinite(value.until))entries.delete(key);}
      queue.sort((a,b)=>b.priority-a.priority);pump();return entry.promise;
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
  const api={createUrlCache,createVisibilityLoader,createBatchSigner};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenMedia=api;
})(typeof window==='object'?window:globalThis);
