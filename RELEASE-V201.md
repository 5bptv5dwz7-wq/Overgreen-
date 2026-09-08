# V201 — Ore manuali e anteprima del rapportino

Nella scheda di ogni extra Eurospin, l’amministratore trova **Ore e rapportino**. Il pannello mostra il rapportino Eurospin già allegato alla chiusura e consente di inserire, modificare o svuotare le ore senza passare a un’altra pagina.

- Anteprima di PDF multipagina e immagini, pagine precedente/successiva, zoom, adatta e apertura dell’originale.
- Ore totali di tutti gli operatori: due persone per tre ore significano sei ore. Virgola e punto sono accettati; un campo vuoto è distinto da zero.
- Ore salvate in Supabase con accesso limitato agli amministratori attivi. La nuova tabella è separata dagli extra modificabili dai dipendenti.
- Revisione verificata al salvataggio per impedire sovrascritture da sessioni concorrenti. Ripetere lo stesso salvataggio dopo una risposta persa è sicuro.
- Il riferimento al rapportino permette di segnalare una sostituzione e richiedere una verifica delle ore; la sostituzione del file non elimina le ore.
- In caso di errore di salvataggio, il valore inserito resta nella schermata. L’anteprima non disponibile consente comunque l’apertura dell’originale e l’inserimento manuale.

## Distribuzione

Applicata la migrazione `extra_labor_hours_v201` da `V201-labor-hours.sql`, prima della pubblicazione degli asset V201. Gli altri dati esistenti non richiedono conversione. Per un rollback dell’interfaccia, è sufficiente ripristinare gli asset V200: la nuova tabella può rimanere per conservare le ore.

## Verifica

Superati 26 test Node/DOM e 8 gruppi di regressione. I test `tests/extra-hours.cjs` coprono ore manuali, riapertura, cancellazione del valore, errori, doppio invio, permessi, sostituzione del rapporto, paginazione/zoom e render PDF concorrenti simulati.

Superati i test transazionali `tests/extra-hours.sql` sul database con dati sintetici e rollback: salvataggio, idempotenza, conflitti, validazione numerica, cambio rapportino, restrizioni RLS e pulizia dopo eliminazione dell’extra. Nessun dato di prova conservato.

Gli advisor non rilevano nuove segnalazioni di sicurezza. I due nuovi indici per le chiavi esterne risultano inizialmente inutilizzati, informazione attesa su una tabella appena creata ([documentazione advisor](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)).

La sessione del browser di verifica è disconnessa: non è stata eseguita una prova autenticata del pannello su un rapportino reale. Le prove DOM simulano il motore PDF e non verificano l’aspetto grafico o il rendering effettivo del documento.

Le ore sono archiviate come base per i flussi economici in studio; questa versione non calcola tariffe o importi e non cambia l’Excel mensile.
