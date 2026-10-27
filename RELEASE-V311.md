# V311 — schermate condivise Verde / Pulizie

Sedi utilizza lo stesso renderer e lo stesso menu di azioni per i due servizi: Maps, Registra ordinario, Storico, Extra della sede, Sollecito, Condividi e Modifica. Contatori, ricerca, ordinamento e filtri restano nella stessa disposizione. In Pulizie le sedi derivano dagli affidamenti attivi e l'ultimo ordinario dalle pulizie settimanali convalidate, senza modificare i dati del verde.

Registra ordinario riutilizza una visita pulizie aperta di oggi oppure permette di creare la visita e proseguire alla chiusura. Lo storico pulizie si apre nella finestra dello storico con le schede delle visite. Programmazione e Aggiungi lavoro utilizzano i renderer condivisi; la programmazione conserva le opzioni delle lavorazioni pulizie e i filtri/selettori del verde. Le frequenze contrattuali restano gestite nelle Scadenze.

I solleciti sono separati per servizio nella tabella esistente, conservando le policy RLS. Il vecchio RPC resta compatibile per il verde. Un nuovo RPC invoker salva i solleciti pulizie; un trigger non richiamabile via API li risolve alla convalida e li ripristina alla riapertura. Migrazione docs/v311-service-reminders.sql applicata prima del client.

Verifiche: 355 test superati, incluso confronto dei pulsanti Sedi e controlli di programmazione; test transazionali sul database reale per indipendenza dei solleciti, convalida, riapertura e permessi, con rollback completo. Nessun nuovo advisory relativo alle funzioni introdotte. Nessuna verifica visuale su dispositivo fisico.
