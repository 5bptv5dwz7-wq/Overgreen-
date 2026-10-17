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
  const key=`${lat.toFixed(3)},${lon.toFixed(3)}`;
  const {data:cached}=await db.from('weather_forecast_cache').select('*').eq('location_key',key).maybeSingle();
  const now=Date.now();
  if(cached&&Date.parse(cached.expires_at)>now)return reply({forecast:cached.payload,stale:false});
  if(pending.has(key))return reply(await pending.get(key));
  const work=(async()=>{
   try{
    const headers:Record<string,string>={'User-Agent':'Overgreen/244 https://github.com/5bptv5dwz7-wq/Overgreen-'};
    if(cached?.last_modified)headers['If-Modified-Since']=cached.last_modified;
    const response=await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`,{headers,signal:AbortSignal.timeout(12000)});
    if(!response.ok&&response.status!==304)throw new Error('Provider unavailable');
    const payload=response.status===304?cached?.payload:await response.json();
    if(!Array.isArray(payload?.properties?.timeseries))throw new Error('Invalid forecast');
    const expires=Math.max(now+3600000,Date.parse(response.headers.get('Expires')||'')||0);
    const {error:saveError}=await db.from('weather_forecast_cache').upsert({location_key:key,payload,expires_at:new Date(expires).toISOString(),fetched_at:new Date(now).toISOString(),last_modified:response.headers.get('Last-Modified')||cached?.last_modified||null});
    if(saveError)console.error('Weather cache write failed',saveError.code);
    return {forecast:payload,stale:false};
   }catch{
    if(cached&&now-Date.parse(cached.fetched_at)<21600000)return {forecast:cached.payload,stale:true};
    return {error:'Meteo temporaneamente non disponibile'};
   }
  })();
  pending.set(key,work);
  try{return reply(await work)}finally{pending.delete(key)}
 }catch{return reply({error:'Richiesta meteo non valida'},400)}
});
