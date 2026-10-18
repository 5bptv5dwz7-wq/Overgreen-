/* Durable extra closure drafts, isolated by login and acting profile. */
(function(root){
 function create({store,scope,uuid=()=>crypto.randomUUID(),File:FileType=File}){
  const ids=new WeakMap(),queues=new Map();
  function fileId(file,key,id){let map=ids.get(file);if(!map){map=new Map();ids.set(file,map)}if(id)map.set(key,id);if(!map.has(key))map.set(key,uuid());return map.get(key)}
  const key=id=>scope()+':'+id;
  function serial(id,fn){const before=queues.get(id)||Promise.resolve(),next=before.catch(()=>{}).then(fn);queues.set(id,next);next.finally(()=>{if(queues.get(id)===next)queues.delete(id)}).catch(()=>{});return next}
  function save(extraId,fields,files){
   const owner=scope();if(!owner)return Promise.reject(new Error('Sessione non disponibile'));const id=key(extraId);
   const entries=files.filter(x=>x.file).map(x=>({...x,id:x.id||fileId(x.file,x.tipo),fileName:x.file.name,mimeType:x.file.type}));
   return serial(id,async()=>{
    for(const x of entries)if(!x.file.size)throw new Error('File vuoto: selezionalo di nuovo.');
    await store.put('submissions',{id,owner,extraId,fields,files:entries,updatedAt:Date.now()});
    const saved=await store.get('submissions',id);
    if(!saved||saved.files.some((x,i)=>x.file?.size!==entries[i].file.size))throw new Error('Copia locale dei documenti non confermata. Riprova.');
    return saved;
   });
  }
  async function load(extraId){
   const owner=scope(),id=key(extraId);await queues.get(id)?.catch(()=>{});const row=await store.get('submissions',id);
   if(!row||row.owner!==owner||scope()!==owner)return null;
   row.files=row.files.map(x=>{const file=new FileType([x.file],x.fileName,{type:x.mimeType});fileId(file,x.tipo,x.id);return {...x,file}});return row;
  }
  function remove(extraId){const id=key(extraId);return serial(id,()=>store.tx(['submissions'],'readwrite',t=>{t.objectStore('submissions').delete(id)}))}
  async function list(){const owner=scope();const rows=await store.all('submissions');return scope()===owner?rows.filter(x=>x.owner===owner):[]}
  return {save,load,remove,list,fileId,busy:()=>queues.size>0};
 }
 const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenExtraDrafts=api;
})(typeof window==='object'?window:globalThis);
