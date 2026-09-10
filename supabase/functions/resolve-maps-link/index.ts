// Only expand known map links, after validating an active administrator.
// The shared parser never substitutes a map viewport for the destination pin.
import '../../../locations.js';
const geo=(globalThis as any).OvergreenLocations;
const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return reply({error:'Metodo non consentito'},405);
  try{
    const authorization=req.headers.get('Authorization')||'';
    if(!/^Bearer\s+\S+$/i.test(authorization))return reply({error:'Sessione non valida'},401);
    const base=Deno.env.get('SUPABASE_URL')!,apikey=Deno.env.get('SUPABASE_ANON_KEY')!;
    const headers={Authorization:authorization,apikey};
    const userRes=await fetch(base+'/auth/v1/user',{headers,signal:AbortSignal.timeout(8000)});
    if(!userRes.ok)return reply({error:'Sessione non valida'},401);
    const user=await userRes.json();if(!user.id)return reply({error:'Sessione non valida'},401);
    // Uses the caller's token and RLS; no service key or privileged database writes.
    const profileRes=await fetch(base+'/rest/v1/profiles?select=ruolo,attivo&id=eq.'+encodeURIComponent(user.id),{headers,signal:AbortSignal.timeout(8000)});
    if(!profileRes.ok)return reply({error:'Profilo non disponibile'},403);
    const profiles=await profileRes.json(),profile=profiles[0];
    if(!profile?.attivo||profile.ruolo!=='admin')return reply({error:'Operazione riservata all’amministratore'},403);
    if(Number(req.headers.get('content-length'))>8192)return reply({error:'Link troppo lungo'},413);
    const reader=req.body?.getReader();if(!reader)return reply({error:'Link mancante'},400);
    let length=0,text='';const decoder=new TextDecoder();
    while(true){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>8192){await reader.cancel();return reply({error:'Link troppo lungo'},413)}text+=decoder.decode(value,{stream:true})}
    text+=decoder.decode();
    let body;try{body=JSON.parse(text)}catch{return reply({error:'Richiesta non valida'},400)}
    if(typeof body.url!=='string'||body.url.length>4096)return reply({error:'Link non valido'},400);
    const point=await geo.resolveMapsLink(body.url,fetch);
    return reply({point});
  }catch(e){return reply({error:e instanceof Error?e.message:'Link non leggibile'},422)}
});
