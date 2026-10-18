# V271 — Reattività e affidabilità

## Correzioni

- Rimozione sedi: interfaccia aggiornata subito, coda per programma, RPC atomica e idempotente. La stessa richiesta ripetuta dopo un problema di rete non produce un falso errore di permessi. Le posizioni degli extra non vengono alterate dalla cancellazione di un ordinario.
- Riordino misto: tutte le posizioni vengono aggiornate in una transazione; una posizione o uno stato cambiati nel frattempo producono un conflitto esplicito.
- Caricamento principale: un singolo snapshot SQL di 21 sezioni, con RLS del chiamante, sostituisce le circa 40 letture osservate nella V270. Una risposta precedente a un salvataggio viene scartata. Gli aggiornamenti delle convalide e del rollover condividono lo stesso coordinamento; un rollover senza modifiche non rilegge i dati.
- Navigazione: rendering della sola sezione aperta durante il refresh; i pulsanti di navigazione riutilizzano il DOM quando la revisione dei dati è invariata. Lo storico usa gli operatori già presenti in memoria.
- Foto e documenti: foto dei report visibili su richiesta; URL firmati condivisi anche per archivio, firme, attività e lavorazioni; priorità all'apertura esplicita, timeout e annullamento HTTP delle firme bloccate. Le fotografie originali sono conservate.
- PDF: nessuna generazione pesante durante la modifica dei filtri, cache limitate per PDF e immagini compresse, riuso fra anteprima e download, preparazione parallela delle due immagini della riga. Una foto mancante blocca l'esportazione completa con un errore esplicito. Restano disponibili i percorsi di condivisione iOS esistenti.
- Avvio: PDF, Excel, ZIP, lettore PDF e OCR vengono caricati solo quando richiesti. Versioni esterne fissate. Il service worker riusa gli asset con versione e conserva la risposta offline senza memorizzare API o URL firmati.
- Extra: bozze di chiusura persistenti e separate per account/profilo, con foto, rapportini, note, squadra e dati di chiusura; identificativi degli allegati conservati dopo il riavvio. I file vengono copiati localmente prima dell'invio; la bozza viene rimossa dopo conferma. Chiusura e squadra sono salvate in un'unica transazione.
- Controllo remoto: polling ogni 60 secondi e heartbeat ogni 120 secondi o al cambio dello stato occupato; controllo immediato quando si torna online/in primo piano.
- Database: indice sui percorsi dei file e sulle due chiavi esterne dei solleciti; identità utente valutata una volta per query; policy permissive consolidate con l'OR degli stessi predicati, mantenendo le policy restrittive; eliminato l'indice duplicato sullo stato degli extra.

## Verifica

Eseguire `cd tests && npm ci && npm test`. Il runner include automaticamente tutti i test, anche quelli che in precedenza non erano richiamati da npm test.

Verificati: risposte fuori ordine; cancellazioni consecutive; errore su una sola cancellazione; riordino e rollback SQL; retry idempotenti; isolamento RLS; chiusura atomica; bozze recuperate dopo un riavvio simulato; coda media bloccata e priorità; foto assente nel PDF; singola RPC di caricamento; avvio dell'intera applicazione con servizi simulati; regressioni preesistenti.

Sul database reale: tutte le 21 sezioni lette senza errori come amministratore; letture dipendente ristrette ai dati autorizzati e dati economici non esposti. Impronta e numero delle righe accessibili in tutte le sezioni identici prima e dopo il consolidamento delle policy. Nessun dato operativo modificato dai test. Gli advisor prestazioni non riportano più initplan RLS, policy multiple, indici duplicati o chiavi esterne prive di indice; rimangono le segnalazioni informative sugli indici non ancora utilizzati.

I tempi percepiti su un iPhone reale e su rete mobile non sono misurati da questa suite. Non sono state eseguite cancellazioni o chiusure di lavori reali per provare il rilascio. Il recupero delle bozze si riferisce al modulo di chiusura degli extra; l'outbox esistente degli interventi ordinari resta invariata.
