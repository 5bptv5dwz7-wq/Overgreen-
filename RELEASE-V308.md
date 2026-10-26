# V308 — Pulizie Eurospin condivise

La sezione Pulizie è disponibile dal menu Altro. Affidamenti per PV con inizio/fine abilitano insieme A/1, A/2, C/1, C/2 e D/2; nessun PV preesistente è attivato automaticamente. Scadenze calcolate dalle visite convalidate, legenda e storico indipendenti dal verde.

Le visite usano le tabelle extras/extra_work_items e gli attuali giri, squadre, convalide, fotografie e report. Più lavorazioni nello stesso PV/giorno confluiscono nella visita contrattuale aperta. I dipendenti mantengono accesso operativo solo dalla Dashboard per incarichi assegnati.

Due D/2 per PV/anno solare: prenotazione alla creazione, esecuzione alla convalida, rilascio all'annullamento. Vincolo univoco e controlli server impediscono sovraprenotazioni. Richieste esistenti possono essere classificate D/2 o Target conservando identità e documenti; l'amministratore conferma che la richiesta rientri nel D/2. Senza contratto o disponibilità si propone Target a ore. Le visite contrattuali non possono ricevere tariffazione Target, anche da vecchi client.

Excel mensile: visite convalidate, riepilogo contrattuale e foglio Target con economia esistente. Canone mensile e prezzo D/2 restano celle esplicitamente da compilare: non sono inferiti dal numero di visite. Il riepilogo è una base da verificare prima della fatturazione. I Target preesistenti completati non vengono riclassificati o conteggiati automaticamente come D/2.

Database: docs/v308-pulizie.sql (operazioni additive applicate tramite due migrazioni remote). Verifica reale con tests/cleaning-live.sql, transazione interamente annullata. Suite completa: 352 test superati, più controllo versione e startup. Test SQL aggiuntivo dopo l'unificazione delle visite superato. Il test visivo Chromium non è stato eseguibile perché il download del browser non era disponibile; interfaccia e invii verificati con DOM e applicazione completa.
