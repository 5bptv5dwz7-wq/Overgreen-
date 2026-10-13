# V223 — Pulizie con ore notturne anche parziali

Nella chiusura di un target di pulizie, amministratori e operatori possono indicare lavoro notturno e il numero complessivo di ore notturne della squadra. Il valore viene conservato anche nei salvataggi parziali: si inserisce il totale svolto finora, senza sommarlo di nuovo a ogni salvataggio. Nessun importo viene richiesto nella chiusura.

Economia riporta le ore notturne della chiusura e permette di correggerle. Le ore notturne sono comprese nelle ore totali: il resto è diurno. Il calcolo usa 18 €/h diurne e 25 €/h notturne, oppure 23 e 30 €/h quando si selezionano le attrezzature. Le ore della squadra non vengono moltiplicate di nuovo per gli operatori. Nei preventivi la manodopera rimane informativa; uscita, spese e sconto seguono le regole precedenti.

La scheda extra, i PDF di chiusura e l'Excel economico includono il dato notturno. Se le ore della chiusura cambiano dopo il salvataggio di Economia, il riepilogo segnala la verifica necessaria ed esclude la voce dal totale verificato. Un controllo di concorrenza impedisce di sovrascrivere una modifica alle ore intervenuta mentre Economia era aperta.

La migrazione aggiunge ore operative a `extras` e un riepilogo con tariffa notturna a `extra_labor_hours`, conservando gli importi esistenti, i permessi e la compatibilità delle vecchie chiamate RPC. La pagina economica resta riservata agli amministratori. Cache e versione dell'app aggiornate a V223.

## Verifica

- 62 test mirati di Economia, chiusura e documenti superati, inclusi i nuovi casi di notturno parziale/totale, attrezzature, ore squadra, parziali, decimali, preventivi e valori non validi.
- Test SQL sintetici con rollback superati: sei combinazioni giorno/notte e attrezzature, tariffe, quote, bozze, retry, conflitti, compatibilità dei vecchi client e permessi. Superate anche le regressioni SQL V202 e V212.
- Suite completa: 161 test superati; 8 errori preesistenti nei test dello scanner Apple, riprodotti sul commit V222 senza questa modifica. Gli 8 gruppi aggiuntivi di regressione passano.
- Sintassi JavaScript e diff verificati. Nessuna chiusura di target reali effettuata nei test. Prova sul dispositivo iPhone da eseguire dopo l'aggiornamento.
