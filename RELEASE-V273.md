# Overgreen V273 — velocità e affidabilità

Data: 18 ottobre 2026.

## Cambiamenti

- Le operazioni di programmazione e modifica degli extra salvano dati, squadra, lavorazioni e collegamenti in una sola transazione. Identificativi di richiesta stabili evitano duplicazioni; i controlli sulle revisioni impediscono di sovrascrivere modifiche più recenti.
- Le richieste hanno un limite di tempo anche durante la lettura del corpo della risposta. Logout e cambio account interrompono le richieste pendenti e impediscono che risultati tardivi aggiornino la sessione successiva.
- Gli URL temporanei degli allegati vengono richiesti in gruppi fino a otto. Un file mancante non blocca gli altri e una richiesta annullata libera la coda.
- L'archivio aziendale e le firme riutilizzano letture recenti. I salvataggi ricaricano solo le sezioni coinvolte; il selettore della programmazione viene ricostruito quando serve e le selezioni della squadra restano stabili.
- L'apertura di PDF e allegati avvia subito la finestra del browser per evitare blocchi dei popup sui browser mobili. Le anteprime obsolete non sostituiscono quelle più recenti.
- Il service worker usa esclusivamente la cache della versione corrente e recupera i file già memorizzati in caso di errore del server o di rete.
- Il processo dei promemoria ignora atomicamente le consegne già registrate, evitando gli errori di unicità durante i tentativi successivi.
- Il numero di versione visibile, i riferimenti agli asset e la cache sono allineati a V273. Lo script di rilascio ripara anche riferimenti rimasti a versioni precedenti.

## Verifica

- `npm --prefix tests test`: 299 test superati, nessun errore.
- Test PostgreSQL isolati: transazioni, rollback, ripetizione delle richieste, revisioni obsolete, autorizzazioni e vincoli sulle date.
- Test di rete e interfaccia: timeout del corpo della risposta, cambio sessione, annullamenti, cache delle letture, selezioni della squadra e ordine delle anteprime.
- Test degli allegati: otto firme in una richiesta, errori indipendenti per file, cancellazioni indipendenti.
- Test dei promemoria con invio simulato: nessun invio duplicato, nessun invio in modalità prova o con credenziali non valide.
- Controlli di sintassi, coerenza delle versioni e `git diff --check` superati.

La migrazione `20261018200305_reliability_v273.sql` è applicata. La funzione mantiene i permessi dell'utente chiamante, richiede un amministratore attivo e non è eseguibile dal ruolo anonimo. La funzione `extra-daily-reminders` è distribuita come revisione 4. Le prove non hanno modificato dati operativi o inviato notifiche reali.

La riduzione da otto a una richiesta per le firme degli allegati è verificata nei test. Non è stata misurata una percentuale di miglioramento complessiva né la velocità su un iPhone reale. I flussi autenticati sono coperti dai test automatici; il browser disponibile richiede l'accesso.
