// A revocable, upload-only Shortcut credential. Reading still requires an admin login.
const MAX=10*1024*1024,DAY=86400000;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}});
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
async function digest(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('')}
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
async function bytes(req,max){
  if(Number(req.headers.get('content-length'))>max)fail('PDF troppo grande: massimo 10 MB.',413);
  const reader=req.body?.getReader();if(!reader)fail('PDF mancante.');
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail('PDF troppo grande: massimo 10 MB.',413)}chunks.push(value)}
  const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length}return result;
}
export function createHandler(db,base,appUrl){
  const storage=db.storage.from('documenti');
  async function activeAdmin(id){const {data,error}=await db.from('profiles').select('ruolo,attivo').eq('id',id).maybeSingle();if(error)fail('Profilo non disponibile.',503);if(data?.ruolo!=='admin'||data.attivo!==true)fail('Operazione riservata a un amministratore attivo.',403)}
  async function checked(result){if(result.error)fail('Servizio temporaneamente non disponibile. Riprova.',503);return result.data}
  return async req=>{
    if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
    if(req.method!=='POST')return json({error:'Metodo non consentito.'},405);
    try{
      const url=new URL(req.url),action=url.searchParams.get('action')||'',token=(req.headers.get('authorization')||'').replace(/^Bearer /i,'');
      if(!['pair','revoke','upload','pending','import','delete'].includes(action))fail('Operazione non valida.');
      let userId;
      if(action==='upload'){
        const parts=token.split('.');
        if(parts.length!==2||!UUID.test(parts[0])||!/^[0-9a-f]{64}$/.test(parts[1]))fail('Collegamento iPhone non valido. Configuralo dalle impostazioni.',401);
        userId=parts[0];
        const record=await storage.download(`ios-extra-import/${userId}/device.json`);
        if(record.error)fail('Collegamento revocato o non configurato.',401);
        const stored=JSON.parse(await record.data.text());
        if(!equal(stored.hash,await digest(token))||stored.expiresAt<=Date.now())fail('Collegamento scaduto o revocato. Rigeneralo dalle impostazioni.',401);
      }else{
        if(!token||token.length>4096)fail('Accedi a Overgreen per continuare.',401);
        const {data,error}=await db.auth.getUser(token);
        if(error||!data?.user?.id)fail('Accedi a Overgreen per continuare.',401);
        userId=data.user.id;
      }
      if(!UUID.test(userId))fail('Utente non valido.',401);
      await activeAdmin(userId);
      const prefix=`ios-extra-import/${userId}`;
      if(action==='pair'){
        const secret=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''),credential=userId+'.'+secret;
        const expiresAt=Date.now()+180*DAY;
        await checked(await storage.upload(prefix+'/device.json',JSON.stringify({hash:await digest(credential),expiresAt}),{upsert:true,contentType:'application/json'}));
        return json({token:credential,expiresAt,uploadUrl:base+'/functions/v1/ios-extra-import?action=upload'});
      }
      if(action==='revoke'){await checked(await storage.remove([prefix+'/device.json']));return json({ok:true})}
      if(action==='pending'){
        const files=await checked(await storage.list(prefix,{limit:1000}));
        const imports=files.filter(x=>x.name.endsWith('.pdf')&&UUID.test(x.name.slice(0,-4))&&Date.parse(x.created_at)>=Date.now()-DAY)
          .sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at))
          .map(x=>({id:x.name.slice(0,-4),createdAt:x.created_at}));
        return json({imports});
      }
      if(action==='upload'){
        // Reclaim abandoned imports on the next upload. Never touch normal attachments.
        const files=await checked(await storage.list(prefix,{limit:1000}));
        const pdfs=files.filter(x=>UUID.test(x.name.replace(/\.pdf$/,''))&&x.name.endsWith('.pdf'));
        const expired=pdfs.filter(x=>Date.parse(x.created_at)<Date.now()-DAY);
        if(expired.length)await checked(await storage.remove(expired.map(x=>prefix+'/'+x.name)));
        if(pdfs.length-expired.length>=30)fail('Troppi PDF in attesa. Completa gli extra già importati o riprova domani.',429);
        const content=await bytes(req,MAX);
        if(new TextDecoder().decode(content.subarray(0,5))!=='%PDF-')fail('Condividi il file PDF, non il link alla pagina.');
        const id=crypto.randomUUID();
        await checked(await storage.upload(prefix+'/'+id+'.pdf',content,{contentType:'application/pdf',upsert:false}));
        const target=new URL(appUrl);target.hash=new URLSearchParams({'extra-import':id}).toString();
        // webapp:// launches the installed app but may discard query/hash data.
        // The app retrieves its authenticated pending queue on foreground instead.
        return json({url:target.href,appUrl:appUrl.replace(/^https?:/,'webapp:')});
      }
      const id=url.searchParams.get('id')||'';if(!UUID.test(id))fail('Documento non valido.');
      const path=prefix+'/'+id+'.pdf';
      if(action==='delete'){await checked(await storage.remove([path]));return json({ok:true})}
      const result=await storage.download(path);if(result.error)fail('PDF non disponibile. Condividilo di nuovo dal tuo iPhone.',404);
      return new Response(result.data,{headers:{...cors,'Content-Type':'application/pdf'}});
    }catch(error){return json({error:error.status?error.message:'Servizio temporaneamente non disponibile. Riprova.'},error.status||500)}
  };
}
