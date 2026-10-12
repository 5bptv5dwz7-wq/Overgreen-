# V222 — Data e operatori nella chiusura extra

La finestra di chiusura extra, in vista amministratore, permette di scegliere data e ora di chiusura e tutti gli operatori che hanno eseguito il lavoro. Funziona anche senza programmazione precedente. Se presenti, data e squadra precedenti sono proposte e modificabili; gli operatori inattivi già assegnati rimangono selezionabili.

Prima della chiusura definitiva sono richiesti una data valida e almeno un operatore. La data scelta aggiorna `giorno_intervento` e `closed_at` (conversione dell'ora locale in UTC); la squadra viene salvata in `extra_workers`, usata dai report. `closed_by` conserva l'identità dell'utente che conferma. Il salvataggio non crea giornate di programmazione e non aggiorna l'ultimo ordinario.

Le assegnazioni vengono lette dal database anche al retry, aggiunte prima di rimuovere quelle precedenti e verificate tramite le righe restituite. Un errore impedisce il passaggio a `in_attesa` e conserva il modulo per riprovare. Le operazioni restano separate: se il successivo aggiornamento dell'extra fallisce, la squadra già registrata viene riutilizzata al retry.

Il salvataggio parziale lascia l'extra aperto senza registrare una chiusura; i dipendenti mantengono data automatica e squadra assegnata. Documenti, foto e convalida seguono i requisiti esistenti. Nessuna migrazione SQL o modifica alle autorizzazioni. Cache e versione dell'app aggiornate a V222.

## Verifica

- Test di chiusura con data retroattiva, ora e più operatori; modifica della squadra programmata; conservazione degli inattivi assegnati; campi mancanti; errori e retry; parziale e vista dipendente.
- Sintassi JavaScript e diff verificati.
- Suite completa: 155 test passati, 8 errori preesistenti dello scanner Apple, riprodotti sulla V221 senza modifiche. Gli 8 gruppi di regressione aggiuntivi passano.
- Nessuna chiusura di dati reali effettuata durante i test. Verifica sul dispositivo iPhone da eseguire dopo l'aggiornamento.
