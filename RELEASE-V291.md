# V291 — Extra programmati su più giornate

L'amministratore può usare “Aggiungi giornata” su un extra già programmato, dalla sua scheda o dalla programmazione. La data propone il giorno successivo all'ultima tappa; si può scegliere una data libera e la squadra specifica. Viene riutilizzata una giornata con stessa data e squadra oppure creata una nuova giornata.

Le tappe aggiuntive usano schedule_items di tipo extra, collegati allo stesso extra_id. Non vengono duplicati extra, allegati, economia o lavorazioni. Dashboard, programma, vista settimanale operativa, filtri cliente e PDF riconoscono le tappe; il riordino usa la posizione della singola tappa. “Togli dalla giornata” rimuove solo la tappa. I riepiloghi economici e lo storico continuano a usare l'extra unico. Il salvataggio parziale mantiene il lavoro aperto; la chiusura definitiva nasconde le tappe future.

Permessi: il registro dipendenti resta in sola lettura. Le squadre delle giornate aggiuntive hanno accesso al lavoro tramite la verifica di assegnazione esistente, estesa alle tappe; non vengono trasformate in assegnazioni globali a tutte le date. RPC amministratore con privilegi chiamante, transazione, controllo dati obsoleti, vincoli data, deduplicazione e retry idempotenti. Nessuna tabella aggiunta; migrazione applicata e privilegi verificati.

Verifica: 326 test superati, incluse prove SQL di retry, rollback, duplicati, autorizzazione e rimozione singola tappa; prove DOM e PDF su date multiple, isolamento dipendente e chiusura anticipata. Versione e sintassi allineate. Browser reale non disponibile nell'ambiente.
