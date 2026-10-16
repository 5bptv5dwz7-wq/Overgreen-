import { createClient } from 'npm:@supabase/supabase-js@2.57.4'
import webpush from 'npm:web-push@3.6.7'

Deno.serve(async (req) => {
 const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}})
 if(req.method!=='POST')return json({error:'Method not allowed'},405)
 const token=req.headers.get('x-reminder-token')||''
 if(token.length!==64)return json({error:'Unauthorized'},401)
 try {
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}})
  const checked=await db.rpc('verify_extra_reminder_token',{p_token:token})
  if(checked.error||checked.data!==true)return json({error:'Unauthorized'},401)
  const rows=await db.rpc('extra_daily_reminder_rows');if(rows.error)throw rows.error
  const items=rows.data||[]
  if(!items.length)return json({ok:true,eligible:0,sent:0})
  const admins=await db.from('profiles').select('id').eq('ruolo','admin').eq('attivo',true);if(admins.error)throw admins.error
  const ids=(admins.data||[]).map(x=>x.id);if(!ids.length)return json({ok:true,sent:0})
  const subs=await db.from('push_subscriptions').select('id,endpoint,p256dh,auth').in('profile_id',ids).eq('active',true);if(subs.error)throw subs.error
  const requestBody=await req.json().catch(()=>({}))
  if(requestBody.dry_run===true)return json({ok:true,eligible:items.length,subscriptions:(subs.data||[]).length,vapid_configured:['VAPID_SUBJECT','VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY'].every(k=>!!Deno.env.get(k))})
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!,Deno.env.get('VAPID_PUBLIC_KEY')!,Deno.env.get('VAPID_PRIVATE_KEY')!)
  const labels:Record<string,string>={on:'Tassativamente il',not_before:'Non prima del',deadline:'Entro il'}
  const day=items[0].reminder_day
  const body=items.slice(0,3).map((e:any)=>`${e.pv} · ${e.numero_target?'Target '+e.numero_target:e.titolo}\n${labels[e.rule_mode]} ${e.rule_date.split('-').reverse().join('/')}${!e.giorno_intervento?' · Da programmare':''}`).join('\n')+(items.length>3?`\nAltri ${items.length-3} extra: apri il riepilogo.`:'')
  let sent=0,failed=0
  for(const sub of subs.data||[]){
   const claim=await db.from('extra_reminder_deliveries').insert({subscription_id:sub.id,reminder_day:day})
   if(claim.error){if(claim.error.code==='23505')continue;throw claim.error}
   try{
    await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify({title:`📅 ${items.length} extra da ricordare`,body,tag:`extra-dates-${day}`,url:'?notificationKind=reminders&notificationId=daily'}),{TTL:43200,urgency:'high',timeout:10000})
    sent++
   }catch(err:any){
    failed++
    await db.from('extra_reminder_deliveries').delete().eq('subscription_id',sub.id).eq('reminder_day',day)
    if([404,410].includes(err.statusCode))await db.from('push_subscriptions').update({active:false}).eq('id',sub.id)
    console.error('Reminder delivery failed',{subscription_id:sub.id,status:err.statusCode})
   }
  }
  return json({ok:failed===0,eligible:items.length,sent,failed},failed?503:200)
 }catch(err){console.error('Reminder job failed',String(err));return json({error:'Reminder job failed'},500)}
})
