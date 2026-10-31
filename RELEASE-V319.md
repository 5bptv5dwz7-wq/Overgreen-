# V319 — Rapportini ed economia per giornata

Il salvataggio parziale e la chiusura di un extra registrano una giornata con data, operatori, note, foto e documenti propri. La scheda «Giornate · rapportini» permette di compilare e riaprire l’economia di ogni giornata e generare il suo PDF, con o senza importi, anche a target aperto.

Le economie giornaliere sono riservate agli amministratori e usano tariffe, spese, sconti, notturno e classificazione IVA del modulo esistente. Il totale delle giornate compilate è visibile nella scheda; l’economia complessiva del target e il riepilogo mensile restano separati e non vengono sovrascritti o sommati due volte. I dati precedenti non vengono redistribuiti retroattivamente.

Le giornate conservano i riferimenti ai propri file anche quando un rapportino attivo del target viene sostituito. I salvataggi ripetuti riutilizzano l’identificativo persistito nella bozza. Il salvataggio della giornata e il cambio di stato dell’extra avvengono nella stessa transazione.

Validazione: test DOM dell’editor e del PDF giornaliero; 66 test di regressione economica, navigazione e documenti; test SQL con due giornate, tariffe, isolamento, concorrenza, sostituzione rapportino e autorizzazioni, interamente annullati con rollback. Controlli sintassi e versione coerente V319 superati. Il flusso autenticato reale non è stato eseguito dal browser.
