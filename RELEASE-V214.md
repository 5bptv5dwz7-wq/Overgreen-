# V214 — Recupero archivio locale iPhone

La V213 intercettava solo l'errore sincrono nella creazione di una transazione. La lettura iniziale della coda e gli errori asincroni potevano ancora bloccare l'apertura del rapportino.

- Riutilizzo della connessione IndexedDB e riapertura dopo chiusura inattesa, cambio versione o connessione non valida.
- Massimo tre tentativi per gli errori di connessione, compresi apertura e transazioni asincrone. Nessuna cancellazione del database e nessun invio prima della conservazione locale delle foto.
- Le scritture fallite attendono l'abort; una preparazione ripetuta non sovrascrive una richiesta già registrata. Identificativi delle richieste e foto invariati durante i tentativi.
- Ripresa del worker dopo un errore dell'archivio, senza attendere necessariamente un nuovo evento di rete.
- Recupero guidato tramite ricaricamento, impedito quando il modulo o le foto non salvate sono ancora aperti. Gli errori persistenti indicano di riavviare l'iPhone senza eliminare dati locali.
- Un rapportino non verificabile non viene dichiarato conservato: modulo, foto e richiesta restano disponibili per riprovare.
- Il pulsante ordinario “Eseguito” diventa “Registra lavoro”, distinto dagli stati “Completato” e “In attesa”.
- Versione visibile, JavaScript e service worker aggiornati a V214.

Verifica: `npm test` in `tests/`, 137 test superati e 8 gruppi di regressione. Simulati errori di apertura, connessione obsoleta, chiusura inattesa, abort asincrono, errore persistente, quota esaurita e preparazioni concorrenti. I test precedenti coprono anche perdita della risposta server e riavvio della coda senza duplicati. Nessuna prova fisica sull'iPhone di Roberto; nessuna modifica ai dati di produzione o allo schema Supabase.
