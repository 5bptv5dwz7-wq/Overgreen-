# V333 — Importazione PDF nell'app sulla Home

Lorenzo ha verificato sul proprio iPhone che
`webapp://5bptv5dwz7-wq.github.io/Overgreen-/` apre Overgreen in modalità app.
La V333 usa questa apertura al posto di Safari. Non è un protocollo Apple
documentato: resta disponibile il recupero aprendo manualmente l'icona.

## Comando rapido

Il caricamento resta quello configurato nella V332. Cambiare soltanto la chiave
letta dalla risposta: **appUrl** al posto di **url**, mantenendo Apri URL.
La risposta continua a includere url per compatibilità con i comandi precedenti.
Non rigenerare il token di invio se il comando è già configurato.

## App

`webapp://` può perdere query e frammenti. L'app standalone ora consulta
`action=pending` dopo login, al caricamento e al ritorno in primo piano. Questo
endpoint richiede un JWT utente e un amministratore attivo; il token limitato
di Comandi Rapidi non può consultarlo.

Vengono restituiti solo gli identificativi dei PDF caricati dall'utente nelle
ultime 24 ore, dal più vecchio al più recente. Il modulo usa la normale
importazione e compilazione PDF già presente. La conferma Crea extra resta
manuale. Un modulo già aperto non viene sostituito. I PDF già aperti non vengono
riaperti automaticamente nella stessa sessione; il pulsante **Recupera PDF
condiviso** permette di riprovare anche dopo aver annullato un modulo.

Il caricamento manuale di un altro file non elimina una precedente importazione
in attesa. La copia temporanea viene eliminata solo quando si salva l'extra che
contiene il PDF importato. Resta il comportamento V332 per gli URL Safari con
frammento extra-import.

## Rilascio e test

Distribuire prima la nuova Edge Function ios-extra-import, poi tutti gli asset
V333 aggiornati da scripts/set-version.cjs. Nessuna modifica SQL o alle policy.

Verifiche locali: tests/ios-extra-import.cjs (coda per utente, autorizzazioni,
scadenza e compatibilità URL), tests/app-startup.cjs (avvio standalone senza hash,
allegato, parser e tutela dei moduli aperti), tests/version-consistency.cjs e
tests/extra-pdf.cjs. La prova completa con Condividi va eseguita sul telefono.
