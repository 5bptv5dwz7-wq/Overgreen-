(function(root){
 'use strict';
 function pool(limit){let active=0;const queue=[];const run=()=>{while(active<limit&&queue.length){const {task,resolve,reject}=queue.shift();active++;Promise.resolve().then(task).then(resolve,reject).finally(()=>{active--;run()})}};return task=>new Promise((resolve,reject)=>{queue.push({task,resolve,reject});run()})}
 function create({geocode,invoke,storage,scope=()=>'',now=Date.now}){
  const weatherPool=pool(4),historyPool=pool(2),pending=new Map();
  let disk={},currentScope=null;
  const storageKey=()=> 'overgreen-weather-v249:'+String(scope());
  const ensureScope=()=>{const s=storageKey();if(s!==currentScope){currentScope=s;try{disk=JSON.parse(storage?.getItem(s)||'{}')||{}}catch{disk={}}}return s};
  const save=(namespace,key,value,ttl)=>{
   if(namespace!==currentScope)return;
   const at=now();disk[key]={value,until:at+ttl,savedAt:at};
   const weather=Object.entries(disk).filter(([k,e])=>k.startsWith('weather:')&&e?.until>at).sort((a,b)=>b[1].savedAt-a[1].savedAt).slice(0,20);
   const history=Object.entries(disk).filter(([k,e])=>k.startsWith('history:')&&e?.until>at).sort((a,b)=>b[1].savedAt-a[1].savedAt).slice(0,80);
   disk=Object.fromEntries([...weather,...history]);
   try{storage?.setItem(namespace,JSON.stringify(disk))}catch{/* A full/private browser store must not break the weather. */}
  };
  function cached(namespace,key,ttl,task,valid){
   const pkey=namespace+'|'+key,entry=namespace===currentScope?disk[key]:null;
   if(entry?.until>now())return Promise.resolve(entry.value);
   if(pending.has(pkey))return pending.get(pkey);
   const promise=Promise.resolve().then(task).then(value=>{if(valid(value))save(namespace,key,value,ttl);return value});
   pending.set(pkey,promise);promise.finally(()=>pending.delete(pkey)).catch(()=>{});return promise;
  }
  // Geocoding keeps its own provider throttle and happens outside the API pools:
  // an unresolved address cannot block an already located store.
  async function weather(st){
   const namespace=ensureScope();let point;try{point=await geocode(st)}catch{throw new Error('location')}
   const key=`weather:${point.lat.toFixed(3)},${point.lon.toFixed(3)}`;
   const data=await cached(namespace,key,3600000,()=>weatherPool(async()=>{
    const data=await invoke('store-weather',{store_id:st.id,lat:point.lat,lon:point.lon});
    if(!data?.forecast)throw new Error('weather');return data;
   }),data=>!!data?.forecast&&!data.stale);
   return {...data,approximate:point.approximate};
  }
  async function history(st){
   const namespace=ensureScope(),point=await geocode(st);
   const gridLat=Math.max(-90,Math.min(90,Math.round(point.lat*2)/2)),gridLon=Math.max(-180,Math.min(180,Math.round(point.lon/.625)*.625));
   const key=`history:${gridLat},${gridLon}`;
   const data=await cached(namespace,key,43200000,()=>historyPool(()=>invoke('store-growth-history',{store_id:st.id,lat:point.lat,lon:point.lon})),data=>!!data?.history&&!data.stale);
   return {...data,latitude:point.lat};
  }
  return {weather,history};
 }
 const api={create,pool};if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenWeatherLoader=api;
})(typeof window!=='undefined'?window:globalThis);
