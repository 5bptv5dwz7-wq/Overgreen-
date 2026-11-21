# V332 — Nuovo extra dal menu Condividi di iPhone

## Risultato

Un comando Apple chiamato **Nuovo extra Overgreen** riceve un PDF dall'app File,
lo invia al servizio `ios-extra-import`, legge la proprietà `url` della risposta
e apre il modulo extra in Safari. Il PDF è già allegato e passa dal parser
esistente Eurospin/Intesa. L'utente controlla i dati e conferma Crea extra.

La voce si trova tra le azioni del menu Condividi, non tra le icone delle app
native. Non è implementata una Share Extension iOS e non si promette l'apertura
della PWA standalone installata sulla Home.

## Attivazione

1. Distribuire `supabase/functions/ios-extra-import/index.ts` e `handler.mjs`
   come Edge Function `ios-extra-import`, con `verify_jwt: false`: il corpo
   valida esplicitamente il JWT utente oppure il token limitato del comando.
2. Pubblicare l'app V332, inclusi app.js, index.html, sw.js e ios-extra-share.js.
3. In Overgreen: Impostazioni → PDF da iPhone → Configura Comandi Rapidi.
4. Seguire le istruzioni visibili nel pannello: Mostra in Condividi, input
   PDF/File, POST con corpo File e intestazione Authorization, estrazione
   della chiave url, apertura condizionale dell'URL o visualizzazione errore.
5. Provare con un PDF in File, accedendo in Safari con lo stesso amministratore.

Non viene generato un file .shortcut non firmato: la configurazione avviene
una sola volta nell'app Comandi Rapidi sul telefono. Nessuna app terza richiesta.

## Accessi e conservazione

- Solo un amministratore attivo può generare/revocare il collegamento o leggere
  i PDF. Il token del comando consente soltanto nuovi caricamenti.
- Token casuale da 256 bit, hash SHA-256 conservato sul server, durata 180 giorni.
  Rigenerarlo invalida il precedente. Non viene scritto in sorgenti o log.
- Usa il bucket privato esistente documenti e il prefisso dedicato
  ios-extra-import/{user_id}; nessuna modifica alle policy o alle tabelle.
  Le policy correnti consentono l'accesso a questo prefisso solo agli admin.
- Massimo 10 MB per documento, controllo firma PDF e limite di 30 importazioni
  in attesa per utente (limite operativo, non contatore atomico antiabuso).
- Il documento rimane recuperabile ricaricando il medesimo URL prima del
  salvataggio; viene eliminato dalla coda solo dopo extra_create riuscito.
  I file abbandonati più vecchi di 24 ore vengono rimossi alla successiva
  importazione dell'utente. Non viene toccato nessun allegato degli extra.
- Il comando non contiene service-role key né la sessione Supabase dell'utente.
- Gli identificativi nel frammento URL non concedono accesso al documento:
  è necessario autenticarsi con l'utente che lo ha inviato.

## Verifica

Eseguire:

    node tests/version-consistency.cjs
    node tests/app-startup.cjs
    node --test tests/ios-extra-import.cjs tests/extra-pdf.cjs

I test locali simulano caricamento, permessi, isolamento fra utenti, revoca,
scadenza, pulizia, login differito, apertura modulo e allegato PDF. Non
sostituiscono la prova fisica su iPhone. Prima del rilascio verificare il servizio
distribuito con richieste senza credenziali e con un PDF di prova autorizzato.

## Dismissione

Revocare il collegamento dal pannello e rimuovere il comando dall'iPhone.
La normale creazione di extra e il caricamento manuale continuano a funzionare.
