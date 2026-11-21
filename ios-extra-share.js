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
  panel.innerHTML=`<h2>PDF da iPhone</h2><p>Alla fine userai: <strong>apri il PDF → Condividi → Nuovo extra Overgreen</strong>. L’app si aprirà con il PDF già inserito.</p>
  <p>Questa configurazione si fa una volta sola. Il comando con solo «URL» e «Apri URL» era una prova: qui creiamo quello completo per inviare anche il documento.</p>
  <div class="actions"><button type="button" id="iosShareRecover" class="secondary">Recupera PDF già condiviso</button></div>
  <section aria-label="Configurazione guidata iPhone" style="margin-top:16px;padding:16px;border:1px solid #a8cab5;border-radius:12px">
  <p id="iosShareStepCount" aria-live="polite" class="muted"></p>
  <div data-ios-step>
    <h3>Prepara Overgreen</h3><p>Rimani qui e premi il pulsante sotto. Prepara i due valori che dovrai copiare nei passaggi successivi.</p>
    <button type="button" id="iosSharePair">Prepara i dati da copiare</button>
    <p id="iosShareStatus" role="status"></p>
    <p>Se il comando completo funziona già, non rigenerare i dati: puoi leggere la guida con Avanti. La generazione di nuovi dati sostituisce il collegamento precedente.</p>
  </div>
  <div data-ios-step hidden>
    <h3>Crea un nuovo comando</h3><ol><li>Apri l’app Apple <strong>Comandi Rapidi</strong>.</li><li>Premi <strong>+</strong> per creare un comando vuoto.</li><li>Chiamalo <strong>Nuovo extra Overgreen</strong>.</li><li>Apri i dettagli del comando e attiva <strong>Mostra in Condividi</strong>.</li><li>Nella riga iniziale «Ricevi … da Condividi», scegli <strong>PDF</strong> e <strong>File</strong>.</li></ol>
    <p>Torna qui quando hai finito e premi Avanti. Se hai già un comando completo puoi correggere quello; lascia da parte quello di sola prova.</p>
  </div>
  <div data-ios-step hidden>
    <h3>Aggiungi l’invio del PDF</h3><p>In Comandi Rapidi cerca e aggiungi l’azione <strong>Ottieni contenuti dell’URL</strong>.</p>
    <ol><li>Premi qui <strong>Copia indirizzo di invio</strong>.</li><li>Torna al comando e incollalo nel campo <strong>URL</strong> di quell’azione.</li><li>Espandi le opzioni dell’azione e cambia il <strong>Metodo</strong> da GET a <strong>POST</strong>.</li></ol>
    <button type="button" class="secondary" data-ios-copy="iosShareUrl">Copia indirizzo di invio</button>
    <p>L’indirizzo copiato inizia con <strong>https://</strong>. In questo campo non va l’indirizzo <strong>webapp://</strong> della prova.</p>
  </div>
  <div data-ios-step hidden>
    <h3>Autorizza l’invio</h3><p>Rimani nell’azione <strong>Ottieni contenuti dell’URL</strong>. Apri <strong>Intestazioni</strong> e aggiungi una riga.</p>
    <p>Compila i due campi così:</p><ul><li><strong>Chiave:</strong> scrivi esattamente <code>Authorization</code>.</li><li><strong>Valore:</strong> incolla il testo copiato con il pulsante qui sotto.</li></ul>
    <button type="button" class="secondary" data-ios-copy="iosShareToken">Copia autorizzazione completa</button>
    <p>Il testo copiato contiene già <strong>Bearer</strong> e lo spazio: incollalo tutto, senza aggiungere o togliere nulla.</p>
  </div>
  <div data-ios-step hidden>
    <h3>Scegli il PDF da inviare</h3><p>Sempre nell’azione <strong>Ottieni contenuti dell’URL</strong>:</p><ol><li>Alla voce <strong>Corpo della richiesta</strong> scegli <strong>File</strong>.</li><li>Tocca il campo del file e scegli la variabile <strong>Input comando rapido</strong>. Se necessario tieni premuto e usa «Seleziona variabile».</li></ol>
    <p><strong>Non selezionare un PDF fisso.</strong> La variabile serve a usare ogni volta il documento su cui premi Condividi.</p>
  </div>
  <div data-ios-step hidden>
    <h3>Leggi l’indirizzo per aprire Overgreen</h3><p>Sotto l’azione appena configurata, aggiungi <strong>Ottieni valore del dizionario</strong>.</p><ul><li>Nel campo <strong>Chiave</strong> scrivi <code>appUrl</code>, con la <strong>U maiuscola</strong>.</li><li>Come <strong>Dizionario</strong> seleziona il risultato dell’azione precedente: <strong>Contenuti dell’URL</strong>.</li></ul>
    <p><code>appUrl</code> è una parola da scrivere, non un link da incollare. L’indirizzo che aprirà l’app viene restituito dopo l’invio del PDF.</p>
  </div>
  <div data-ios-step hidden>
    <h3>Apri l’app dopo l’invio</h3><ol><li>Aggiungi l’azione <strong>Se</strong>.</li><li>Come dato scegli <strong>Valore del dizionario</strong>, il risultato del passaggio precedente.</li><li>Come condizione scegli <strong>ha un valore</strong>.</li><li>Tra <strong>Se</strong> e <strong>Altrimenti</strong> inserisci <strong>Apri URL</strong>. Il suo valore deve essere <strong>Valore del dizionario</strong>.</li><li>Tra <strong>Altrimenti</strong> e <strong>Fine se</strong> inserisci <strong>Mostra risultato</strong>. Qui seleziona <strong>Contenuti dell’URL</strong>, cioè la risposta dell’invio.</li></ol>
    <p>Così, se l’invio riesce, si apre Overgreen. Se fallisce, il comando mostra il motivo.</p>
  </div>
  <div data-ios-step hidden>
    <h3>Fai la prima prova</h3><ol><li>Salva il comando.</li><li>Apri un PDF nell’app <strong>File</strong> dell’iPhone.</li><li>Premi <strong>Condividi</strong> e scorri l’elenco delle azioni.</li><li>Tocca <strong>Nuovo extra Overgreen</strong>.</li><li>Consenti la connessione se l’iPhone la richiede.</li></ol>
    <p>Si deve aprire Overgreen con il PDF nel modulo <strong>Nuovo extra</strong>. Controlla i dati e premi <strong>Crea extra</strong>.</p>
    <p>Per questa prova parti dal PDF in File, non dal pulsante ▶︎ dentro Comandi Rapidi: senza un documento condiviso non c’è un PDF da inviare.</p>
  </div>
  <div class="actions" style="margin-top:16px"><button type="button" class="secondary" id="iosSharePrevious">Indietro</button><button type="button" id="iosShareNext">Avanti</button></div>
  </section>
  <details style="margin-top:16px"><summary>Il comando è già configurato o qualcosa non funziona?</summary>
  <p><strong>Prima si apriva Safari:</strong> cambia solo la chiave <code>url</code> in <code>appUrl</code> nell’azione «Ottieni valore del dizionario». Non rigenerare l’autorizzazione.</p>
  <p><strong>Si apre l’app ma manca il PDF:</strong> chiudi eventuali moduli extra già aperti e premi «Recupera PDF già condiviso» qui sopra. Usa lo stesso account amministratore con cui hai preparato il collegamento.</p>
  <p><strong>Non parte l’app:</strong> aprila tu dall’icona sulla Home; recupererà il PDF in attesa.</p>
  <p><strong>Il comando non compare in Condividi:</strong> controlla «Mostra in Condividi» e i tipi PDF e File nei dettagli del comando.</p>
  <p>Massimo 10 MB per PDF. I documenti in attesa sono recuperabili per 24 ore. I nomi dei comandi possono variare leggermente con la versione di iOS.</p>
  <button type="button" class="secondary" id="iosShareRevoke">Disattiva il collegamento con Comandi Rapidi</button></details>
  <div id="iosShareCredentials" hidden><p>Se la copia automatica non riesce, tieni premuto il valore necessario e scegli Copia.</p><label>Indirizzo di invio<input id="iosShareUrl" readonly></label><label>Autorizzazione completa<textarea id="iosShareToken" readonly rows="3" autocomplete="off" spellcheck="false"></textarea></label></div>`;
  $('settingsView').appendChild(panel);
  let step=0;
  const steps=[...panel.querySelectorAll('[data-ios-step]')];
  function showStep(index){step=Math.max(0,Math.min(steps.length-1,index));steps.forEach((el,i)=>el.hidden=i!==step);$('iosShareStepCount').textContent='Passaggio '+(step+1)+' di '+steps.length;$('iosSharePrevious').disabled=step===0;$('iosShareNext').hidden=step===steps.length-1;}
  $('iosSharePrevious').onclick=()=>showStep(step-1);
  $('iosShareNext').onclick=()=>showStep(step+1);
  showStep(0);
  $('iosSharePair').onclick=async()=>{
    if(!admin())return;if($('iosShareToken').value){showStep(1);return;}const stamp=epoch,button=$('iosSharePair');button.disabled=true;$('iosShareStatus').textContent='Preparo il collegamento…';
    try{const data=await request('pair');if(stamp!==epoch)return;$('iosShareUrl').value=data.uploadUrl;$('iosShareToken').value='Bearer '+data.token;$('iosShareStatus').textContent='Dati pronti. Li copierai nei passaggi 3 e 4. Ora premi Avanti.';}
    catch(error){if(stamp===epoch)$('iosShareStatus').textContent=error.message}finally{button.disabled=false}
  };
  $('iosShareRevoke').onclick=async()=>{if(!admin())return;const button=$('iosShareRevoke');button.disabled=true;try{await request('revoke');reset();$('iosShareStatus').textContent='Collegamento revocato. Il comando non può più inviare PDF.'}catch(error){$('iosShareStatus').textContent=error.message}finally{button.disabled=false}};
  $('iosShareRecover').onclick=()=>void receive(true);
  panel.querySelectorAll('[data-ios-copy]').forEach(button=>button.onclick=async()=>{const field=$(button.dataset.iosCopy);if(!field.value){showStep(0);$('iosShareStatus').textContent='Prima premi Prepara i dati da copiare, poi torna a questo passaggio.';return;}try{await navigator.clipboard.writeText(field.value);toast('Copiato.')}catch{$('iosShareCredentials').hidden=false;field.focus();field.select();toast('Tieni premuto il testo e scegli Copia.')}});
  window.OvergreenExtraShare={receive,saved,reset};
  window.addEventListener('hashchange',()=>void receive());
  window.addEventListener('pageshow',()=>void receive());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden'){lastCheck=0;void receive()}});
})();
