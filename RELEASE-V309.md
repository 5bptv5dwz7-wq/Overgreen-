# V309 — modalità Verde / Pulizie

La barra Verde / Pulizie cambia il servizio attivo e il tema dei comandi. Sedi e Programmazione mostrano i punti vendita con affidamento pulizie attivo; la Dashboard mantiene il giro completo con le visite pulizie riconoscibili in blu. Il menu Affidamenti pulizie raccoglie selezione delle sedi, date, impostazioni, storico e gestione Target / D/2.

Le lavorazioni previste sono selezionabili nella programmazione ordinaria. Alla chiusura dalla Dashboard si confermano quelle effettivamente eseguite: settimanale A/1 + A/2, mensili C/1 e C/2, semestrale D/2. Le attività omesse rimangono dovute e una D/2 prevista ma non eseguita libera lo slot. Le attività eseguite alimentano storico, export e riepilogo PDF.

La migrazione docs/v309-cleaning-workflow.sql aggiunge la consuntivazione e due RPC atomiche per pianificazione e chiusura, mantenendo i controlli di ruolo e assegnazione esistenti. Applicata al database prima del rilascio del client.

Validazione: 354 test superati; versione e asset coerenti V309; integrazione sul database reale in transazione interamente annullata (pianificazione idempotente, assegnazione, chiusura operatore, liberazione/prenotazione slot, aggiunta al giro e controllo permessi). Nessuna nuova segnalazione di sicurezza relativa alle funzioni pulizie. Verifica visuale browser non eseguita perché Chromium non disponibile; flusso UI verificato tramite DOM integration test.
