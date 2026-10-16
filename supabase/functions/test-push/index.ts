import { createClient } from 'npm:@supabase/supabase-js@2.57.4'
import webpush from 'npm:web-push@3.6.7'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}
Deno.serve(async(req)=>{
 const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
 if(req.method!=='POST')return json({error:'Metodo non consentito'},405)
 const token=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'')
 if(!token)return json({error:'Accedi di nuovo per inviare il test'},401)
 try{
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}})
  const user=await db.auth.getUser(token)
  if(user.error||!user.data.user)return json({error:'Sessione non valida'},401)
  const uid=user.data.user.id
  const profile=await db.from('profiles').select('ruolo,attivo').eq('id',uid).single()
  if(profile.error||profile.data?.ruolo!=='admin'||!profile.data?.attivo)return json({error:'Riservato agli amministratori'},403)
  const body=await req.json()
  if(typeof body.endpoint!=='string')return json({error:'Dispositivo non indicato'},400)
  // Only send to a stored subscription belonging to the authenticated caller.
  const sub=await db.from('push_subscriptions').select('id,endpoint,p256dh,auth').eq('endpoint',body.endpoint).eq('user_id',uid).eq('profile_id',uid).eq('active',true).maybeSingle()
  if(sub.error)throw sub.error
  if(!sub.data)return json({error:'Notifiche non registrate: disattivale e riattivale su questo dispositivo.'},400)
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!,Deno.env.get('VAPID_PUBLIC_KEY')!,Deno.env.get('VAPID_PRIVATE_KEY')!)
  try{
   await webpush.sendNotification({endpoint:sub.data.endpoint,keys:{p256dh:sub.data.p256dh,auth:sub.data.auth}},JSON.stringify({title:'🔔 Overgreen · Notifica di test',body:'Se leggi questo messaggio, le notifiche arrivano su questo dispositivo.',tag:'overgreen-push-test',url:'?notificationKind=settings&notificationId=push'}),{TTL:300,urgency:'high',timeout:10000})
  }catch(err:any){
   if([404,410].includes(err.statusCode)){await db.from('push_subscriptions').update({active:false}).eq('id',sub.data.id);return json({error:'Registrazione scaduta: disattiva e riattiva le notifiche.'},400)}
   throw err
  }
  return json({ok:true})
 }catch(err){console.error('Push test failed',String(err));return json({error:'Invio non riuscito. Riprova tra poco.'},500)}
})
