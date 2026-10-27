# V314 — servizio limitato a Sedi e Programmazione

Il selettore Verde / Pulizie e il tema blu compaiono solo in Sedi e Programmazione. La scelta viene ricordata tornando su queste pagine; selezioni, ricerca e appunti di programmazione restano separati per servizio. Dashboard e altre pagine mantengono la vista generale. I solleciti della Dashboard comprendono entrambi i servizi e aprono esplicitamente quello corretto.

Registrazione ordinaria pulizie da Sedi in un solo modulo: senza allegati, creazione e invio avvengono in una transazione, con ID stabile e risposta riutilizzata ai tentativi successivi. Con foto resta il flusso di caricamento recuperabile. Anche nelle convalide gli ordinari pulizie usano la scheda dedicata, senza etichetta EXTRA, tempo dalla richiesta o rapportini Eurospin/Overgreen.

Le scelte delle lavorazioni vengono renderizzate solo per i PV selezionati, anche quando si aggiungono sedi a una giornata. Sono specifiche della data e inoltrano gli appunti per sede. Gli indici per PV evitano scansioni ripetute nelle schede. I Target del selettore mostrano prima la sede e una descrizione compatta.

La verifica D/2 comprende anche i Target già classificati a ore. Una conversione riuscita mantiene intervento, squadra e allegati, senza aprire obbligatoriamente la programmazione. Se l'affidamento o gli slot non permettono D/2, viene mostrato un errore senza cambiare implicitamente la scelta in Target a ore. La disponibilità in chiusura usa l'anno della data effettiva ed esclude la prenotazione della visita corrente.

Database: applicata `v314_cleaning_reliability` da `docs/v314-cleaning-reliability.sql`. Nuovo RPC SECURITY INVOKER, riservato agli amministratori autenticati; nessuna nuova tabella. La creazione considera le lavorazioni effettivamente eseguite per permettere il recupero di quelle omesse.

Verifica: 365 test superati, controllo versione e diff. Otto nuove prove DOM del flusso reale; prove PostgreSQL locali e tre script transazionali sul database collegato, con dati sintetici e rollback, per pianificazione, chiusura, retry, conversione, slot, solleciti e ruoli. Nessuna nuova segnalazione rispetto agli advisory precedenti. Nessuna nuova verifica visuale su dispositivo fisico; fotocamera e notifiche push non provate end-to-end in questa release.
