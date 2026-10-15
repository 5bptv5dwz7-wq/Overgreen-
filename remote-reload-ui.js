/* Device status and admin controls. Requests bypass the auth callback lock. */
let remoteReloadClient=null,remoteReloadPanelBusy=false;
const remoteDirtyForms=new Set();
document.addEventListener('input',event=>{const form=event.target.closest?.('form');if(form)remoteDirtyForms.add(form)},true);
document.addEventListener('change',event=>{const form=event.target.closest?.('form');if(form)remoteDirtyForms.add(form)},true);
document.addEventListener('reset',event=>remoteDirtyForms.delete(event.target),true);
async function remoteReloadBusy(){
  if(ordinarySaveBusy||extraSaveBusy||document.querySelector('dialog[open]'))return true;
  if(donePhotoFiles.length||closeExtraPhotoFiles.length||historyEditPhotoFiles.length||activityCompletePhotoFiles.length)return true;
  if(window.ExtraClosureDocuments?.isBusy?.()||window.ExtraClosureDocuments?.get('eurospin')||window.ExtraClosureDocuments?.get('overgreen'))return true;
  if([...document.querySelectorAll('input[type=file]')].some(input=>input.files?.length))return true;
  if([...remoteDirtyForms].some(form=>form.isConnected&&!form.closest('dialog')&&form.getClientRects().length))return true;
  if([...document.querySelectorAll('button[type=submit]')].some(button=>button.disabled&&button.getClientRects().length))return true;
  if(typeof photoDelivery!=='undefined'&&photoDelivery){const state=await photoDelivery.snapshot();if(state.running||state.jobs.length||state.submissions.some(s=>!s.result))return true}
  return false;
}
async function remoteReloadHttp(path,method='GET',body){
  const token=session?.access_token;if(!token)throw new Error('Sessione non disponibile.');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(cfg.supabaseUrl+'/rest/v1/'+path,{method,signal:controller.signal,headers:{apikey:cfg.supabaseKey,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
    const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||'Controllo remoto non disponibile.');return data;
  }finally{clearTimeout(timeout)}
}
function startRemoteReload(){
  if(remoteReloadClient)return;
  try{
    const deviceLabel=()=> (/iPhone/.test(navigator.userAgent)?'iPhone':/iPad/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)?'iPad':/Android/.test(navigator.userAgent)?'Android':'Computer')+(navigator.standalone||matchMedia('(display-mode: standalone)').matches?' · App':' · Browser');
    remoteReloadClient=window.OvergreenRemoteReload.create({window,document,storage:sessionStorage,deviceStorage:localStorage,uuid:()=>crypto.randomUUID(),user:()=>session?.user?.id,version:APP_VERSION,label:deviceLabel,busy:remoteReloadBusy,
      async register(row){
        const existing=await remoteReloadHttp('app_devices?id=eq.'+row.id+'&select=id');
        if(existing.length)await remoteReloadHttp('app_devices?id=eq.'+row.id,'PATCH',{version:row.version,busy:row.busy,label:row.label});
        else await remoteReloadHttp('app_devices','POST',row);
      },
      heartbeat:(id,row)=>remoteReloadHttp('app_devices?id=eq.'+id,'PATCH',row),
      latest:async id=>(await remoteReloadHttp('app_reload_commands?device_id=eq.'+id+'&order=created_at.desc&limit=1'))[0],
      async ack(id,row){const result=await remoteReloadHttp('app_reload_commands?id=eq.'+id,'PATCH',row);if(!result?.length)throw new Error('Conferma comando non ricevuta')},
      notice:message=>toast(message),error:error=>console.warn('Controllo remoto:',error.message),
      async updateWorker(){
        let timer;try{await Promise.race([(async()=>{const registration=await navigator.serviceWorker?.getRegistration();await registration?.update()})(),new Promise(resolve=>{timer=setTimeout(resolve,4000)})])}catch{}finally{clearTimeout(timer)}
      },
      reload(){const url=new URL(location.href);url.searchParams.set('app_reload',Date.now());location.replace(url.href)}
    });remoteReloadClient.start();
    setInterval(()=>{if(admin()&&currentView==='settings'&&document.visibilityState!=='hidden')void renderRemoteReloadPanel()},20000);
  }catch(error){console.warn('Controllo remoto:',error.message)}
}
async function renderRemoteReloadPanel(){
  let panel=$('remoteReloadPanel');
  if(!admin()){panel?.remove();return}
  if(!panel){panel=document.createElement('section');panel.id='remoteReloadPanel';panel.className='settings-card admin-only';$('settingsView').appendChild(panel)}
  if(remoteReloadPanelBusy)return;remoteReloadPanelBusy=true;
  try{
    const [devices,commands]=await Promise.all([remoteReloadHttp('app_devices?order=last_seen.desc&limit=200'),remoteReloadHttp('app_reload_commands?order=created_at.desc&limit=500')]);
    if(!admin()){panel.remove();return}
    const latest=new Map();for(const command of commands)if(!latest.has(command.device_id))latest.set(command.device_id,command);
    panel.innerHTML='<h3>Dispositivi e riavvio app</h3><p>Ogni dispositivo deve aprire almeno una volta la v230. L’app chiusa o senza rete riceverà il comando alla riapertura, entro 24 ore. Il comando normale aspetta la fine delle attività.</p><div class="actions"><button type="button" class="secondary" data-refresh>Aggiorna stato</button></div><div data-devices></div>';
    panel.querySelector('[data-refresh]').onclick=()=>void renderRemoteReloadPanel();const list=panel.querySelector('[data-devices]');
    const staff=profiles.filter(p=>p.attivo!==false&&!devices.some(d=>d.user_id===p.id));
    if(staff.length){const p=document.createElement('p');p.className='muted';p.textContent='Non ancora collegati alla nuova funzione: '+staff.map(p=>p.nome||'Utente').join(', ');list.append(p)}
    for(const device of devices){
      const command=latest.get(device.id),row=document.createElement('article');row.className='remote-device';
      const age=Math.max(0,Date.now()-Date.parse(device.last_seen));
      const contact=age<60000?'Contatto recente':age<3600000?'Ultimo contatto '+Math.floor(age/60000)+' min fa':new Date(device.last_seen).toLocaleString('it-IT');
      const commandStatus=command?((Date.parse(command.expires_at)<Date.now()&&['pending','waiting'].includes(command.status))?'Comando scaduto':window.OvergreenRemoteReload.statuses[command.status]):'Nessun comando inviato';
      row.innerHTML=`<strong>${esc(profiles.find(p=>p.id===device.user_id)?.nome||'Utente')} · ${esc(device.label)}</strong><p>${esc(device.version)} · ${esc(contact)} · ${device.busy?'Attività in corso':'Nessuna attività segnalata'}<br><small>Dispositivo ${esc(device.id.slice(0,8))} · ${esc(commandStatus)}${command?.loaded_version?' · '+esc(command.loaded_version):''}</small></p><div class="actions"><button type="button" class="secondary" data-safe>Richiedi aggiornamento</button><button type="button" class="danger-btn" data-force>Forza ricaricamento</button></div>`;
      for(const mode of ['safe','force'])row.querySelector('[data-'+mode+']').onclick=async()=>{
        if(!admin())return;
        if(mode==='force'&&!confirm('Forzare la ricarica di '+(profiles.find(p=>p.id===device.user_id)?.nome||'questo utente')+' su '+device.label+'? Foto, note e modifiche non salvate potrebbero andare perse.'))return;
        row.querySelectorAll('button').forEach(b=>b.disabled=true);
        try{await remoteReloadHttp('app_reload_commands','POST',{device_id:device.id,mode,required_version:APP_VERSION});toast('Comando inviato. Attendo la conferma del dispositivo.');await renderRemoteReloadPanel()}
        catch(error){alert(error.message);row.querySelectorAll('button').forEach(b=>b.disabled=false)}
      };
      list.append(row);
    }
  }catch(error){panel.textContent='Dispositivi: '+error.message;const button=document.createElement('button');button.textContent='Riprova';button.onclick=()=>void renderRemoteReloadPanel();panel.append(button)}finally{remoteReloadPanelBusy=false}
}
