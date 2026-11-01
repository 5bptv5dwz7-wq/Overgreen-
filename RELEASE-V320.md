# V320 — Economia del target dalle giornate

Se esiste almeno un’economia giornaliera, il target usa esclusivamente le proprie giornate: il pulsante Economia apre il riepilogo e consente di modificare ciascuna giornata. Nessun dato economico esistente viene riscritto o duplicato. Le giornate mancanti impediscono di considerare completo il target.

Il riepilogo resta nel mese di chiusura del target. Gli Excel riportano una riga per giornata con data, tariffe, notturni, uscita, spese e sconto originali. I PDF economici presentano totale e dettagli giornalieri. La verifica ZIP visualizza tutte le righe e il fingerprint server include giornate ed economie, invalidando conferme precedenti in caso di modifica.

Database: applicata V320-daily-economics.sql (security invoker; autorizzazioni esistenti preservate). Test transazionale live: una modifica giornaliera invalida il fingerprint, rollback completato.

Validazione: 65 test mirati passati; sintassi e versione coerente. Caso Goito 3465361: 1680 + 120 = 1800 euro, anche in presenza di un’economia generale precedente; giornata incompleta e errore di lettura bloccano i totali. La suite generale rileva 15 test preesistenti non aggiornati al flusso di chiusura V319, riprodotti sul commit precedente. Flusso browser autenticato non eseguito.
