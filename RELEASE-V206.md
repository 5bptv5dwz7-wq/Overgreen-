# V206 — Foto conservate e invii recuperabili

La chiusura ordinaria ora conserva richiesta, identificativi delle foto e copie
leggibili delle immagini in una singola transazione IndexedDB prima di inviare
la richiesta a Supabase. La richiesta sopravvive alla riapertura e mantiene il
medesimo identificativo anche quando la risposta del server viene persa.

- Coda separata per utente e sessione amministratore/impersonata; importazione
  delle vecchie code e copie non ancora inviate, senza cancellarle prima della
  conferma di ricezione.
- Nuovi tentativi per gli errori temporanei con intervallo crescente fino a
  cinque minuti, ripresa alla riapertura/ritorno online e timeout delle richieste.
  Gli errori che richiedono una correzione restano visibili e ritentabili.
- Copie non inviate senza scadenza automatica. Copie confermate conservate per
  sette giorni dalla ricezione; ricevute leggere impediscono di reimportare foto
  già inviate, anche dopo una loro successiva eliminazione intenzionale.
- Manifesto delle foto registrato nella stessa transazione della chiusura.
  Conferma lato server soltanto dopo controllo di percorso, dimensione, tipo del
  file e collegamento all’intervento. Invii o risposte ripetuti sono idempotenti.
- Dettagli e messaggi degli errori nelle impostazioni, avviso per foto mancanti
  da oltre dieci minuti, riconciliazione dei file già arrivati. Recupero e aggiunta
  delle foto originali disponibili anche dopo una convalida forzata.
- La finestra di invio non attende indefinitamente: dopo dodici secondi distingue
  ciò che è conservato sul telefono da ciò che il server ha già ricevuto.

## Verifica

91 test automatici, più 8 gruppi di regressione: riapertura, transazione locale
interrotta, foto illeggibile, risposta persa durante chiusura/caricamento/conferma,
errore locale dopo la chiusura sul server, oltre tre tentativi, errore permanente,
isolamento account, avvii concorrenti, conservazione delle copie, ripristino Blob,
vecchie code e interventi già convalidati. Restano verificati i flussi economici,
i documenti extra, la lettura target/ticket e la convalida forzata.

Prove SQL eseguite con rollback: manifesto atomico, identificativi immutabili,
ricevuta impossibile senza file, verifica di un oggetto Storage esistente senza
duplicare l’allegato, errori conservati, RLS e divieto di accesso per altri
dipendenti o utenti anonimi. Ripetute le prove V205 di convalida e foto tardive.
Nessun oggetto Storage è stato creato o cancellato per questi test.

Le quattro nuove funzioni SECURITY DEFINER sono endpoint intenzionali con
verifiche di utente attivo e accesso all’intervento, ricerca schema fissata,
scritture dirette vietate e accesso anonimo revocato. Il controllo Supabase le
segnala perché eseguibili dagli utenti autenticati: i relativi controlli di
autorizzazione sono coperti dalle prove SQL. Gli avvisi preesistenti restano.

## Distribuzione e limiti

Migrazione applicata: `20260910163748_photo_delivery_v206.sql`. Il vecchio client
V205 resta compatibile con le funzioni esistenti. I nuovi script sono caricati
prima di app.js, con versione V206 visibile e service worker aggiornato.

Questa verifica non comprende una prova fisica sul telefono di Roberto: le foto
di Mantova possono essere recuperate soltanto se una copia esiste ancora sul
dispositivo o nella galleria. Il salvataggio locale non protegge dalla rimozione
dei dati del browser/dispositivo prima della ricezione sul server. I caricamenti
riprendono quando l’app torna attiva; non viene garantita esecuzione continua
con iOS sospeso. Il nuovo outbox riguarda le foto degli interventi ordinari;
i documenti e le foto degli extra mantengono i propri flussi esistenti.

Rollback frontend: ripubblicare il commit V205. Non eliminare le nuove tabelle o
gli archivi locali: potrebbero contenere invii pendenti e ricevute utili al recupero.
