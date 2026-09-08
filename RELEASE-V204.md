# V204 — Titolo e descrizione dai target Eurospin

Il lettore Eurospin prima estraeva soltanto numero, data e punto vendita; la compilazione di titolo e descrizione era inoltre limitata a Intesa.

Ora vengono estratti oggetto e richiesta dai campi descrittivi riconosciuti o dal messaggio introdotto dal saluto/richiesta. Il titolo è breve; la descrizione conserva il testo estratto. Recapiti dell'intestazione e formule di fatturazione/saluto riconosciute vengono esclusi. La categoria viene suggerita quando il testo indica chiaramente verde oppure pulizie.

Se il testo non è riconoscibile, l'app invita a controllare titolo e descrizione. Non viene inventata una richiesta dall'intestazione. I PDF senza testo selezionabile richiedono ancora compilazione manuale; questa modifica non aggiunge OCR.

Le letture di PDF sostituiti vengono ignorate; le modifiche manuali a titolo/descrizione durante la lettura vengono conservate. Tutti i campi restano modificabili prima della creazione.

Verifica: 8 test specifici su testi di esempio e sul compilatore effettivo del modulo, incluso formato Intesa, campi mancanti, footer, richieste lunghe e letture concorrenti; 8 gruppi di regressione superati. Nessun PDF reale Eurospin disponibile in questa verifica. Nessuna modifica Supabase.
