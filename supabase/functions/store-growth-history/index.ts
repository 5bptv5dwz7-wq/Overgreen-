import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
const pending=new Map<string,Promise<unknown>>();
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return reply({error:'Metodo non consentito'},405);
 try{
  const token=req.headers.get('Authorization')?.replace(/^Bearer\s+/i,'');
  if(!token)return reply({error:'Accesso richiesto'},401);
  const url=Deno.env.get('SUPABASE_URL')!;
  const db=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
  const {data:{user},error}=await db.auth.getUser(token);
  if(error||!user)return reply({error:'Sessione non valida'},401);
  const {data:profile}=await db.from('profiles').select('attivo').eq('id',user.id).single();
  if(!profile?.attivo)return reply({error:'Accesso non consentito'},403);
  const body=await req.json();
  if(typeof body.store_id!=='string')return reply({error:'Sede richiesta'},400);
  const scoped=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const {data:store}=await scoped.from('stores').select('id,latitudine,longitudine').eq('id',body.store_id).single();
  if(!store)return reply({error:'Sede non accessibile'},403);
  const confirmed=store.latitudine!=null&&store.longitudine!=null;
  const lat=Number(confirmed?store.latitudine:body.lat),lon=Number(confirmed?store.longitudine:body.lon);
  if((!confirmed&&(body.lat==null||body.lon==null))||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return reply({error:'Posizione non disponibile'},400);
  const gridLat=Math.max(-90,Math.min(90,Math.round(lat*2)/2)),gridLon=Math.max(-180,Math.min(180,Math.round(lon/0.625)*0.625));
  const key=`nasa-growth:${gridLat},${gridLon}`;
  const {data:cached}=await db.from('weather_forecast_cache').select('*').eq('location_key',key).maybeSingle();
  const now=Date.now();
  if(cached&&Date.parse(cached.expires_at)>now)return reply({history:cached.payload,latitude:lat,stale:false});
  if(pending.has(key)){const data=await pending.get(key) as Record<string,unknown>;return reply({...data,latitude:lat})}
  const work=(async()=>{
   try{
    const end=new Date(now-86400000),start=new Date(now-32*86400000),stamp=(d:Date)=>d.toISOString().slice(0,10).replaceAll('-','');
    const response=await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR&community=AG&latitude=${gridLat}&longitude=${gridLon}&start=${stamp(start)}&end=${stamp(end)}&format=JSON&time-standard=UTC`,{signal:AbortSignal.timeout(18000)});
    if(!response.ok)throw new Error('NASA unavailable');
    const raw=await response.json(),history=normalizeHistory(raw,gridLat,gridLon);
    if(!history.days.length)throw new Error('No usable history');
    const {error}=await db.from('weather_forecast_cache').upsert({location_key:key,payload:history,expires_at:new Date(now+43200000).toISOString(),fetched_at:new Date(now).toISOString(),last_modified:null});
    if(error)console.error('Growth cache write failed',error.code);
    return {history,stale:false};
   }catch{
    if(cached&&now-Date.parse(cached.fetched_at)<172800000)return {history:cached.payload,stale:true};
    return {history:null,error:'Storico temporaneamente non disponibile'};
   }
  })();pending.set(key,work);
  try{return reply({...await work,latitude:lat})}finally{pending.delete(key)}
 }catch{return reply({error:'Richiesta non valida'},400)}
});
function normalizeHistory(raw:any,lat:number,lon:number){
 const parameters=raw?.properties?.parameter||{},temperatures=parameters.T2M||{},rain=parameters.PRECTOTCORR||{};
 const valid=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n!==-999;
 const days=Object.keys(temperatures).filter(k=>/^\d{8}$/.test(k)).sort().map(k=>({date:`${k.slice(0,4)}-${k.slice(4,6)}-${k.slice(6,8)}`,temp:valid(temperatures[k])?temperatures[k]:null,rain:valid(rain[k])&&rain[k]>=0?rain[k]:null})).filter(d=>d.temp!==null||d.rain!==null);
 return {days,grid:{lat,lon},source:'NASA POWER',timeStandard:'UTC',retrievedAt:new Date().toISOString()};
}
