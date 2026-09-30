# V215 — Contatori e separazione ordinari/extra

- Dashboard: eseguiti del giorno ricavati dai rapporti ordinari convalidati e conclusi, anche fuori programma. Per gli extra si usa la data locale italiana di chiusura; data pianificata solo come fallback per record storici privi di chiusura.
- Target/extra eseguiti insieme all'ordinario compaiono nel dettaglio, senza aumentare il numero delle visite. Il dettaglio del contatore elenca gli elementi contati.
- Programma: denominatore stabile alla chiusura degli extra collegati, esclusione delle righe annullate/riportate e non ordinarie. Composizione visibile anche su telefono.
- Dashboard e Sedi usano la stessa scadenza: oltre intervallo include gli urgenti e le sedi da avviare. La programmazione non elimina il ritardo. Numero di urgenti già programmati esplicito.
- Ordinamento per gravità e ritardo rispetto all'intervallo; sedi su richiesta in fondo. Giorni di calendario indipendenti dal cambio d'ora.
- Azioni distinte Registra ordinario / Extra della sede; ultimo ordinario esplicito e spiegazione del comportamento nei moduli. Nessuna modifica al backend di salvataggio: gli extra non aggiornano stores.ultimo_passaggio.

## Verifica
- Audit read-only del database: nessuna divergenza tra ultimo_passaggio e ultimo ordinario concluso/convalidato nelle sedi con storico. Nessuna correzione di dati necessaria; date manuali/storiche conservate.
- 7 nuovi test: extra senza reset, date effettive, target collegati, cambio d'ora, gravità e ordinamento, denominatore invariato 15 con 12 completati, riepilogo sedi.
- 137 test esistenti e 8 gruppi di regressione superati, compreso il recupero dell'archivio locale V214.
