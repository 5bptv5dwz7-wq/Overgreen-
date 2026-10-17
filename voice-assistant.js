/* Voice UI: business mutations are only made by the explicit confirm button. */
(function(){
'use strict';
const core=window.OvergreenVoiceCore;
let dialog,adapter,pc,channel,mic,audio,closing=false,starting=false,generation=0,timer,closeTimer,saveTimer;
let state={preferences:[],conversation:[],draft:null},pendingMemory='',saveChain=Promise.resolve(),seen=new Set(),toolChain=Promise.resolve();
let owner=null,ready=false,confirmedDraft=null,stopResolve=null,stopPromise=null;
const node=id=>document.getElementById('voice'+id);
const status=text=>{if(node('Status'))node('Status').textContent=text};
const guard=()=>{if(!adapter?.allowed())throw Error('Assistente non disponibile in questa vista')};
function send(event){if(channel?.readyState==='open')channel.send(JSON.stringify(event))}
function save(){
 clearTimeout(saveTimer);const copy=JSON.parse(JSON.stringify(state)),uid=owner;
 saveChain=saveChain.catch(()=>{}).then(async()=>{guard();if(uid!==adapter.userId())throw Error('Utente cambiato');await adapter.saveState(uid,copy)});
 saveChain.catch(()=>status('Memoria non sincronizzata. Riprova prima di uscire.'));return saveChain;
}
function render(){
 node('Conversation').replaceChildren();for(const row of state.conversation){const p=document.createElement('p');p.className=row.role==='user'?'voice-user':'voice-answer';const b=document.createElement('strong');b.textContent=row.role==='user'?'Tu: ':'Overgreen: ';p.append(b,document.createTextNode(row.text));node('Conversation').append(p)}
 node('Conversation').scrollTop=node('Conversation').scrollHeight;
 const draft=node('Draft');draft.replaceChildren();node('Confirm').hidden=!state.draft;
 if(state.draft){const ctx=adapter.context(),d=state.draft;const heading=document.createElement('h3');heading.textContent='Bozza · '+d.day;draft.append(heading);
 const p=document.createElement('p');p.textContent='Squadra: '+d.members.map(id=>ctx.profiles.find(x=>x.id===id)?.nome||'Dipendente non disponibile').join(', ');draft.append(p);
 for(const id of d.stores){const p=document.createElement('p');p.textContent=(ctx.stores.find(x=>x.id===id)?.nome||'Sede non disponibile')+(d.item_notes[id]?' — '+d.item_notes[id]:'');draft.append(p)}
 for(const id of d.extras){const p=document.createElement('p');p.textContent='Extra: '+(ctx.extras.find(x=>x.id===id)?.titolo||id);draft.append(p)}
 const n=document.createElement('p');n.textContent=(d.note||'')+' · Riporto automatico: '+(d.auto_rollover?'sì':'no');draft.append(n);
 }
 node('Preferences').replaceChildren();for(const text of state.preferences){const row=document.createElement('div'),p=document.createElement('span'),b=document.createElement('button');p.textContent=text;b.textContent='Dimentica';b.type='button';b.className='secondary';b.onclick=async()=>{state.preferences=state.preferences.filter(x=>x!==text);render();await save();status('Preferenza rimossa. Sarà esclusa dalla prossima conversazione.')};row.append(p,b);node('Preferences').append(row)}
 node('MemoryProposal').textContent=pendingMemory;node('Remember').hidden=!pendingMemory;
}
function cleanup(){
 generation++;stopResolve?.();stopResolve=null;stopPromise=null;clearTimeout(timer);clearTimeout(closeTimer);clearTimeout(saveTimer);
 mic?.getTracks().forEach(t=>t.stop());mic=null;
 const old=channel;channel=null;old?.close();const peer=pc;pc=null;peer?.close();
 if(audio)audio.srcObject=null;ready=false;starting=false;closing=false;
 if(dialog){node('Start').disabled=false;node('Stop').disabled=true;node('Mute').disabled=true;node('Mute').textContent='Microfono off'}
}
async function stop(){
 if(closing)return stopPromise;closing=true;clearTimeout(timer);
 stopPromise=new Promise(resolve=>{stopResolve=resolve});const done=stopPromise;
 if(ready&&channel?.readyState==='open'){status('Chiusura conversazione…');node('Stop').disabled=true;send({type:'session.close'});closeTimer=setTimeout(()=>{cleanup();status('Connessione chiusa; consumo finale non confermato.')},15000)}else cleanup();
 await save().catch(()=>{});await done;
}
async function handleTool(item,epoch){
 guard();if(epoch!==generation||closing)return;
 let output;
 try{
  const args=JSON.parse(item.arguments||'{}');
  if(item.name==='read_overgreen'){await adapter.refresh();guard();if(epoch!==generation||closing)return;output=adapter.snapshot()}
  else if(item.name==='read_weather')output=await adapter.weather(args.store_id);
  else if(item.name==='prepare_schedule'){
   const draft=core.validateDraft(args,adapter.context());if(confirmedDraft===JSON.stringify(draft))throw Error('Questo programma è già stato confermato in questa conversazione');
   state.draft=draft;await save();render();output={status:'draft',message:'Bozza pronta, NON salvata. Lorenzo deve premere Conferma programma.'};
  }else if(item.name==='propose_memory'){core.remember(state.preferences,args.text);pendingMemory=args.text.trim();render();output={status:'awaiting_confirmation',message:'Preferenza proposta, deve essere confermata a schermo.'}}
  else throw Error('Strumento non consentito');
 }catch(e){output={error:e.message}}
 if(epoch!==generation||closing)return;
 send({type:'response.item.create',item:{type:'function_call_output',call_id:item.call_id,output:JSON.stringify(output)}});send({type:'response.create'});
}
function handleEvent(event,epoch){
 if(epoch!==generation)return;
 if(event.type==='session.started'){clearTimeout(timer);ready=true;starting=false;node('Stop').disabled=false;node('Mute').disabled=false;status('Ti ascolto · sessione a consumo. Durata massima locale: 5 minuti.');timer=setTimeout(()=>void stop(),300000)}
 else if(event.type==='session.closed'){cleanup();status('Conversazione terminata'+(Number.isFinite(event.usage?.seconds)?' · '+Math.round(event.usage.seconds)+' secondi':'') );void save()}
 else if(event.type==='session.input_transcript.delta'||event.type==='session.output_transcript.delta'){
  state.conversation=core.transcript(state.conversation,event.type.includes('input_')?'user':'assistant',String(event.delta||''));render();clearTimeout(saveTimer);saveTimer=setTimeout(()=>void save(),1500);
 }else if(event.type==='response.event'&&event.event?.type==='response.output_item.done'&&event.event.item?.type==='function_call'){
  const item=event.event.item;if(seen.has(item.call_id))return;seen.add(item.call_id);toolChain=toolChain.catch(()=>{}).then(()=>handleTool(item,epoch)).catch(e=>status(e.message));
 }else if(event.type==='error'){status('Errore vocale: '+(event.error?.message||'servizio non disponibile'));void stop()}
}
async function start(){
 if(starting||pc)return;guard();starting=true;node('Start').disabled=true;status('Verifico il servizio…');const epoch=++generation;
 try{
  const config=await adapter.invoke({action:'status'});if(epoch!==generation)return;
  if(!config.available)throw Error(config.configured?'Servizio predisposto, attivazione ancora necessaria.':'Per attivare la voce serve la chiave API sul server. Nessun costo è stato attivato.');
  if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection)throw Error('Microfono non disponibile. Apri Overgreen in Safari con connessione sicura.');
  status('Consenti il microfono per parlare.');const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  if(epoch!==generation){stream.getTracks().forEach(t=>t.stop());return}mic=stream;
  pc=new RTCPeerConnection();const peer=pc;audio=node('Audio');audio.autoplay=true;
  pc.ontrack=e=>{if(epoch!==generation)return;audio.srcObject=new MediaStream([e.track]);audio.play().catch(()=>status('Premi Riproduci qui sotto per ascoltare.'))};
  for(const t of mic.getTracks())pc.addTrack(t,mic);
  channel=pc.createDataChannel('oai-events');channel.onmessage=e=>{try{handleEvent(JSON.parse(e.data),epoch)}catch{status('Evento vocale non valido')}};
  channel.onclose=()=>{if(epoch===generation){cleanup();status('Connessione interrotta. La bozza resta disponibile.');void save()}};
  pc.onconnectionstatechange=()=>{if(epoch===generation&&['failed','disconnected'].includes(peer.connectionState)){void stop()}};
  const offer=await pc.createOffer();await pc.setLocalDescription(offer);
  await new Promise((resolve,reject)=>{if(peer.iceGatheringState==='complete')return resolve();const timeout=setTimeout(()=>{peer.removeEventListener('icegatheringstatechange',check);reject(Error('Connessione audio scaduta'))},10000);function check(){if(peer.iceGatheringState==='complete'){clearTimeout(timeout);peer.removeEventListener('icegatheringstatechange',check);resolve()}}peer.addEventListener('icegatheringstatechange',check);check()});
  if(epoch!==generation)return;status('Collego l’assistente…');seen=new Set();toolChain=Promise.resolve();
  const answer=await adapter.invoke({action:'start',sdp:pc.localDescription.sdp});if(epoch!==generation)return;
  if(!answer.transport?.sdp)throw Error('Risposta audio non valida');await pc.setRemoteDescription({type:'answer',sdp:answer.transport.sdp});
  if(!ready){clearTimeout(timer);timer=setTimeout(()=>{if(!ready){cleanup();status('L’assistente non ha risposto. Riprova.')}},20000);}
 }catch(e){if(epoch===generation){cleanup();status(e.name==='NotAllowedError'?'Consenti l’accesso al microfono nelle impostazioni di Safari.':e.message)}}
}
async function open(){
 guard();if(!dialog)build();dialog.showModal();status('Carico memoria e bozza…');node('Start').disabled=true;
 try{await saveChain.catch(()=>{});owner=adapter.userId();const saved=await adapter.loadState(owner);guard();state={preferences:saved?.preferences||[],conversation:saved?.conversation||[],draft:saved?.draft||null};render();const config=await adapter.invoke({action:'status'});status(config.available?'Pronto. Premi Inizia conversazione.':'Assistente predisposto · voce non ancora attiva. Serve configurare l’accesso API sul server.')}catch(e){status(e.message)}finally{node('Start').disabled=false}
}
function build(){
 dialog=document.createElement('dialog');dialog.id='voiceAssistantDialog';dialog.innerHTML=`<div class="voice-head"><div><small>OVERGREEN · ASSISTENTE IA</small><h2>Parliamone</h2></div><button type="button" id="voiceClose" class="secondary" aria-label="Chiudi">×</button></div><p id="voiceStatus" role="status"></p><div class="voice-controls"><button type="button" id="voiceStart">Inizia conversazione</button><button type="button" id="voiceMute" class="secondary" disabled>Microfono off</button><button type="button" id="voiceStop" class="secondary" disabled>Termina</button></div><audio id="voiceAudio" controls></audio><p class="voice-hint">Voce IA · 0,05 $/min di sessione + elaborazioni. Anche le pause contano. Le modifiche richiedono la tua conferma.</p><div class="voice-columns"><section><h3>Conversazione</h3><div id="voiceConversation" role="log"></div></section><section><div id="voiceDraft"></div><button type="button" id="voiceConfirm" hidden>Conferma programma</button><button type="button" id="voiceDiscard" class="secondary">Elimina bozza</button></section></div><details><summary>Cosa ricorda di me</summary><div id="voicePreferences"></div><label>Preferenza da ricordare<input id="voiceMemory" maxlength="500" placeholder="Es. Preferisco partire dalla sede più lontana"></label><button type="button" id="voiceAddMemory" class="secondary">Memorizza preferenza</button><p id="voiceMemoryProposal"></p><button type="button" id="voiceRemember" hidden>Conferma questa preferenza</button><button type="button" id="voiceForget" class="secondary">Cancella conversazione</button></details>`;
 document.body.append(dialog);node('Start').onclick=()=>void start();node('Stop').onclick=()=>void stop();
 node('Close').onclick=()=>{void stop();dialog.close()};dialog.addEventListener('cancel',()=>void stop());
 node('Mute').onclick=()=>{const enabled=mic?.getAudioTracks()[0]?.enabled;mic?.getAudioTracks().forEach(t=>t.enabled=!enabled);node('Mute').textContent=enabled?'Riattiva microfono':'Microfono off'};
 node('Confirm').onclick=async()=>{
  if(!state.draft)return;node('Confirm').disabled=true;
  try{guard();await stop();await toolChain;await adapter.refresh();const draft=core.validateDraft(state.draft,adapter.context());await adapter.confirm(draft);confirmedDraft=JSON.stringify(draft);state.draft=null;render();await save();status('Programma salvato. Puoi riprendere la conversazione.')}catch(e){status(e.message)}finally{node('Confirm').disabled=false}
 };
 node('Discard').onclick=async()=>{await stop();state.draft=null;render();await save();status('Bozza eliminata')};
 const add=async text=>{try{state.preferences=core.remember(state.preferences,text);pendingMemory='';node('Memory').value='';render();await save();status('Preferenza memorizzata per le prossime conversazioni.')}catch(e){status(e.message)}};
 node('AddMemory').onclick=()=>void add(node('Memory').value);node('Remember').onclick=()=>void add(pendingMemory);
 node('Forget').onclick=async()=>{await stop();state.conversation=[];render();await save();status('Conversazione cancellata; preferenze e bozza conservate.')};
}
window.OvergreenVoice={async close(){await stop();dialog?.close()},init(a){adapter=a},sync(){
 if(!adapter)return;let button=document.getElementById('voiceAssistantOpen');
 if(!adapter.allowed()){if(pc||starting)cleanup();dialog?.close();button?.remove();state={preferences:[],conversation:[],draft:null};return}
 if(!button){button=document.createElement('button');button.id='voiceAssistantOpen';button.type='button';button.className='secondary';button.textContent='🎙 Parla con Overgreen';button.onclick=()=>void open();document.querySelector('#dashboardProgram .panel-head .actions')?.append(button)}
}};
window.addEventListener('pagehide',()=>{send({type:'session.close'});cleanup()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(pc||starting))void stop()});
})();
