import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
  try{
    const supabaseUrl=Deno.env.get('SUPABASE_URL')!
    const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPublic=Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivate=Deno.env.get('VAPID_PRIVATE_KEY')!
    const vapidSubject=Deno.env.get('VAPID_SUBJECT')!
    if(!vapidPublic||!vapidPrivate||!vapidSubject)throw new Error('Configurazione VAPID incompleta')
    if(!vapidSubject.startsWith('mailto:')&&!vapidSubject.startsWith('https://'))throw new Error('VAPID_SUBJECT non valido')

    const auth=req.headers.get('Authorization')||''
    const token=auth.replace(/^Bearer\s+/i,'')
    if(!token)throw new Error('Non autenticato')
    const admin=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false}})
    const {data:userData,error:userErr}=await admin.auth.getUser(token)
    if(userErr||!userData.user)throw new Error('Sessione non valida')
    const {data:caller,error:callerErr}=await admin.from('profiles').select('id,nome,ruolo,attivo').eq('id',userData.user.id).single()
    if(callerErr||!caller)throw new Error('Profilo non trovato')
    if(caller.attivo!==true)throw new Error('Profilo disattivato')

    const body=await req.json()
    const kind=body.kind==='extra'?'extra':'intervention',id=String(body.id||'')
    let photoCount=Math.max(0,Number(body.photo_count)||0)
    if(!id)throw new Error('ID mancante')

    let record:any,store:any,workLabel=''
    if(kind==='intervention'){
      const r=await admin.from('interventions').select('id,store_id,closed_by,data_intervento,foto_attese,foto_sincronizzate,photo_upload_status,stato,multi_day_open').eq('id',id).single()
      if(r.error)throw r.error
      record=r.data
      workLabel='Intervento ordinario'
      if(record.multi_day_open||!['in_attesa','convalidato'].includes(record.stato))throw new Error('Intervento non chiuso')

      // V112-36: il server non si fida del conteggio dichiarato dal telefono.
      // La push parte solo dopo che tutte le foto attese esistono davvero in attachments.
      const counted=await admin.from('attachments').select('id',{count:'exact',head:true}).eq('intervention_id',id).eq('tipo','foto_generica')
      if(counted.error)throw counted.error
      const actualPhotos=Math.max(0,Number(counted.count)||0)
      const expectedPhotos=Math.max(0,Number(record.foto_attese)||0)
      if(actualPhotos<expectedPhotos){
        console.log('Notifica rinviata: foto non sincronizzate',{id,expectedPhotos,actualPhotos,status:record.photo_upload_status})
        return json({ok:true,sent:0,waiting_photos:true,expected:expectedPhotos,actual:actualPhotos})
      }
      photoCount=actualPhotos
    }else{
      const r=await admin.from('extras').select('id,store_id,closed_by,titolo,nome_esterno,stato').eq('id',id).single()
      if(r.error)throw r.error
      record=r.data
      workLabel=record.titolo||'Lavoro extra'
      if(!['in_attesa','completato'].includes(record.stato))throw new Error('Extra non chiuso')
      const counted=await admin.from('attachments').select('id',{count:'exact',head:true}).eq('extra_id',id).eq('tipo','foto_generica')
      if(counted.error)throw counted.error
      photoCount=Math.max(0,Number(counted.count)||0)
    }

    if(record.closed_by!==caller.id)throw new Error("La chiusura non appartiene all'utente corrente")
    if(record.store_id){const r=await admin.from('stores').select('nome,citta').eq('id',record.store_id).maybeSingle();store=r.data}
    const place=store?.nome||record.nome_esterno||'Sede non indicata'
    const photos=photoCount?` \u00b7 \ud83d\udcf7 ${photoCount} foto`:''
    const title=kind==='extra'?'\ud83d\udd27 Extra completato':'\u2705 Intervento completato'
    const message=`${caller.nome||'Dipendente'} \u00b7 ${place}\n${workLabel}${photos}`

    const {data:admins,error:adminsErr}=await admin.from('profiles').select('id').eq('ruolo','admin').eq('attivo',true)
    if(adminsErr)throw adminsErr
    const adminIds=(admins||[]).map(x=>x.id)
    if(!adminIds.length)return json({ok:true,sent:0})
    const {data:subs,error:subsErr}=await admin.from('push_subscriptions').select('*').in('profile_id',adminIds).eq('active',true)
    if(subsErr)throw subsErr

    webpush.setVapidDetails(vapidSubject,vapidPublic,vapidPrivate)
    let sent=0
    for(const sub of subs||[]){
      try{
        const endpointOrigin=new URL(sub.endpoint).origin
        console.log('Tentativo push',{subscription_id:sub.id,endpoint_origin:endpointOrigin,vapid_subject:vapidSubject,public_key_prefix:vapidPublic.substring(0,12)})
        const result=await webpush.sendNotification(
          {endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},
          JSON.stringify({title,body:message,tag:`${kind}-${id}`,url:`?notificationKind=${kind}&notificationId=${encodeURIComponent(id)}`}),
          {TTL:60,urgency:'high',vapidDetails:{subject:vapidSubject,publicKey:vapidPublic,privateKey:vapidPrivate}}
        )
        console.log('Push inviata',sub.id,result?.statusCode)
        sent++
      }catch(err:any){
        console.error('Push fallita',sub.id,{message:err?.message,statusCode:err?.statusCode||err?.status,body:err?.body,headers:err?.headers,endpoint:sub.endpoint,vapidSubject})
        const code=err?.statusCode||err?.status
        if(code===404||code===410)await admin.from('push_subscriptions').update({active:false,updated_at:new Date().toISOString()}).eq('id',sub.id)
      }
    }
    return json({ok:true,sent,subscriptions:(subs||[]).length})
  }catch(err:any){
    console.error('ERRORE FUNZIONE',{message:err?.message,stack:err?.stack})
    return json({error:err?.message||String(err)},400)
  }
})

function json(data:any,status=200){return new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'Content-Type':'application/json'}})}
