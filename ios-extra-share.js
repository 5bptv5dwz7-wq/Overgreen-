/* iPhone Share Sheet -> upload-only Shortcut -> authenticated extra form. */
(() => {
  let importing=false,imported=null,epoch=0,lastCheck=0;
  const handled=new Set();
  const endpoint=()=>cfg.supabaseUrl+'/functions/v1/ios-extra-import';
  async function request(action,id){
    const {data,error}=await sb.auth.getSession();
    if(error||!data?.session)throw Error('Accedi a Overgreen per continuare.');
    const response=await fetch(endpoint()+'?'+new URLSearchParams({action,...(id?{id}:{})}),{method:'POST',headers:{Authorization:'Bearer '+data.session.access_token,apikey:cfg.supabaseKey},signal:AbortSignal.timeout(45000)});
    if(!response.ok){const body=await response.json().catch(()=>({}));throw Error(body.error||'Importazione non riuscita. Riprova.');}
    return action==='import'?response.blob():response.json();
  }
  function clearHash(id){const u=new URL(location.href),hash=new URLSearchParams(u.hash.slice(1));if(hash.get('extra-import')===id){hash.delete('extra-import');u.hash=hash.toString();history.replaceState(null,'',u.pathname+u.search+u.hash)}}
  async function receive(force=false){
    let id=new URLSearchParams(new URL(location.href).hash.slice(1)).get('extra-import');
    if(!session?.user?.id||!profile||importing||document.visibilityState==='hidden')return;
    if(!admin()){if(id||force)toast('Accedi come amministratore, senza impersonare dipendenti, per importare il PDF.');return;}
    const standalone=navigator.standalone===true||window.matchMedia?.('(display-mode: standalone)').matches;
    if(!id&&!standalone&&!force)return;
    if(id&&!/^[0-9a-f-]{36}$/i.test(id)){toast('Documento condiviso non valido.');return;}
    if(id&&handled.has(session.user.id+':'+id)&&!force)return;
    if($('extraDialog').open){if(id||force)toast('Chiudi il modulo extra aperto, poi premi Recupera PDF condiviso.');return;}
    if(!id&&!force&&Date.now()-lastCheck<3000)return;
    importing=true;lastCheck=Date.now();const stamp=epoch,owner=session.user.id;
    try{
      if(!id){
        const pending=await request('pending');
        if(stamp!==epoch||session?.user?.id!==owner||!admin())return;
        id=pending.imports?.find(x=>force||!handled.has(owner+':'+x.id))?.id;
        if(!id){if(force)toast('Nessun PDF condiviso in attesa.');return;}
        if($('extraDialog').open)return;
      }
      handled.add(owner+':'+id);
      toast('Recupero il PDF condiviso…');
      const blob=await request('import',id);
      if(stamp!==epoch||session?.user?.id!==owner||!admin())return;
      if(blob.size>10*1024*1024||await blob.slice(0,5).text()!=='%PDF-')throw Error('Il file ricevuto non è un PDF valido.');
      const file=new File([blob],'Richiesta-condivisa.pdf',{type:'application/pdf'});
      // Identify the workspace before using the normal PDF auto-fill path.
      let client='eurospin';
      try{const found=parseKnownExtraPdf(await readPdfText(file));if(['eurospin','intesa'].includes(found.client))client=found.client}catch{}
      if(stamp!==epoch||session?.user?.id!==owner||!admin())return;
      if($('extraDialog').open)throw Error('Hai già aperto un extra. Chiudilo e ricarica la pagina per importare questo PDF.');
      activateClient(client);setView('extras');$('newExtraBtn').click();
      const transfer=new DataTransfer();transfer.items.add(file);$('extraPdf').files=transfer.files;
      const attached=$('extraPdf').files?.[0];
      if(!attached||attached.size!==file.size)throw Error('Il browser non ha caricato il PDF. Riprova in Safari aggiornato.');
      imported={id,file:attached,owner};
      await autoFillExtraFromPdf(attached);
      if(stamp===epoch)toast('PDF caricato. Controlla i dati e premi Crea extra.');
    }catch(error){if(stamp===epoch){if(id)handled.delete(owner+':'+id);if(id||force)alert(error.message+' Riprova da Impostazioni → PDF da iPhone → Recupera PDF condiviso.');}}
    finally{if(stamp===epoch)importing=false;}
  }
  async function saved(){
    const current=imported;if(!current||current.owner!==session?.user?.id||$('extraPdf').files?.[0]!==current.file)return;
    imported=null;clearHash(current.id);
    try{await request('delete',current.id)}catch{toast('Extra salvato. La copia temporanea del PDF sarà ripulita con le prossime importazioni.');}
  }
  function reset(){epoch++;importing=false;handled.clear();imported=null;lastCheck=0;for(const id of ['iosShareToken','iosShareUrl'])if($(id))$(id).value='';if($('iosShareCredentials'))$('iosShareCredentials').hidden=true;}
  const panel=document.createElement('section');panel.className='panel admin-only';panel.id='iosExtraSharePanel';
  panel.innerHTML=`<h2>PDF da iPhone</h2><p>Condividi un PDF con il comando <strong>Nuovo extra Overgreen</strong>: il comando apre l’app sulla Home, che recupera il PDF e lo inserisce nel modulo extra. Il salvataggio resta da confermare.</p>
  <div class="actions"><button type="button" id="iosSharePair">Configura Comandi Rapidi</button><button type="button" class="secondary" id="iosShareRecover">Recupera PDF condiviso</button><button type="button" class="secondary" id="iosShareRevoke">Revoca collegamento iPhone</button></div>
  <p id="iosShareStatus" role="status"></p><div id="iosShareCredentials" hidden>
  <p>Valido per 180 giorni. La nuova configurazione sostituisce quella precedente. Copia questi dati solo nel tuo comando rapido.</p>
  <label>Indirizzo di invio<input id="iosShareUrl" readonly></label><button type="button" class="secondary" data-ios-copy="iosShareUrl">Copia indirizzo</button>
  <label>Autorizzazione personale<textarea id="iosShareToken" readonly rows="3" autocomplete="off" spellcheck="false"></textarea></label><button type="button" class="secondary" data-ios-copy="iosShareToken">Copia autorizzazione</button></div>
  <details><summary>Come configurare il comando sull’iPhone</summary><ol>
  <li>Apri <strong>Comandi Rapidi</strong>, premi <strong>+</strong> e chiamalo <strong>Nuovo extra Overgreen</strong>. Nei dettagli attiva <strong>Mostra in Condividi</strong> e imposta come input <strong>PDF</strong> e <strong>File</strong>.</li>
  <li>Aggiungi <strong>Ottieni contenuti dell’URL</strong>. Come URL incolla l’indirizzo di invio generato qui. Metodo: <strong>POST</strong>.</li>
  <li>Espandi le opzioni: nelle intestazioni aggiungi <strong>Authorization</strong> e incolla l’autorizzazione personale completa (inizia con <strong>Bearer</strong>). Come corpo della richiesta scegli <strong>File</strong> e seleziona la variabile <strong>Input comando rapido</strong>.</li>
  <li>Aggiungi <strong>Ottieni valore del dizionario</strong>: chiave <strong>appUrl</strong> (rispetta la U maiuscola), dizionario = risultato di <strong>Ottieni contenuti dell’URL</strong>.</li>
  <li>Aggiungi <strong>Se</strong> il valore del dizionario <strong>ha un valore</strong>: nel ramo Sì aggiungi <strong>Apri URL</strong> con quel valore. Nel ramo Altrimenti aggiungi <strong>Mostra risultato</strong> con il risultato di <strong>Ottieni contenuti dell’URL</strong>, per leggere l’eventuale errore.</li>
  </ol><p>Se avevi già configurato il comando per Safari, cambia solo la chiave <strong>url</strong> in <strong>appUrl</strong>. Non rigenerare l’autorizzazione.</p>
  <p>Prima prova: apri un PDF nell’app File → Condividi → Nuovo extra Overgreen. Consenti la connessione a Supabase se richiesta. Apri l’app sulla Home con lo stesso amministratore usato per la configurazione. L’apertura tramite webapp:// dipende da iOS: se non parte, tocca tu l’icona di Overgreen; il PDF sarà comunque recuperato.</p>
  <p>Massimo 10 MB per PDF. Se hai già un modulo extra aperto, chiudilo prima di recuperare il prossimo PDF. I PDF in attesa sono recuperabili per 24 ore e vengono ripuliti alla successiva importazione. Se Safari condivide soltanto un link, salva prima il PDF in File.</p></details>`;
  $('settingsView').appendChild(panel);
  $('iosSharePair').onclick=async()=>{
    if(!admin())return;const stamp=epoch,button=$('iosSharePair');button.disabled=true;$('iosShareStatus').textContent='Preparo il collegamento…';
    try{const data=await request('pair');if(stamp!==epoch)return;$('iosShareUrl').value=data.uploadUrl;$('iosShareToken').value='Bearer '+data.token;$('iosShareCredentials').hidden=false;$('iosShareStatus').textContent='Collegamento pronto. Segui le istruzioni qui sotto.';panel.querySelector('details').open=true;}
    catch(error){if(stamp===epoch)$('iosShareStatus').textContent=error.message}finally{button.disabled=false}
  };
  $('iosShareRevoke').onclick=async()=>{if(!admin())return;const button=$('iosShareRevoke');button.disabled=true;try{await request('revoke');reset();$('iosShareStatus').textContent='Collegamento revocato. Il comando non può più inviare PDF.'}catch(error){$('iosShareStatus').textContent=error.message}finally{button.disabled=false}};
  $('iosShareRecover').onclick=()=>void receive(true);
  panel.querySelectorAll('[data-ios-copy]').forEach(button=>button.onclick=async()=>{const field=$(button.dataset.iosCopy);try{await navigator.clipboard.writeText(field.value);toast('Copiato.')}catch{field.focus();field.select();toast('Tieni premuto il testo e scegli Copia.')}});
  window.OvergreenExtraShare={receive,saved,reset};
  window.addEventListener('hashchange',()=>void receive());
  window.addEventListener('pageshow',()=>void receive());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden'){lastCheck=0;void receive()}});
})();
