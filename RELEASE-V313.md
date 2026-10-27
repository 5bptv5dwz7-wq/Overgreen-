# V313 — registrazione ordinaria pulizie in un solo modulo

Da Sedi, Registra ordinario apre direttamente la chiusura con lavorazioni effettive, data, operatori, note e foto. Rimossa la precedente visita guidata di creazione seguita da un secondo modulo. Nessuna scrittura avviene all'apertura o all'annullamento: la visita viene materializzata dopo la validazione e prima degli upload, durante l'unico invio finale.

ID stabile per sede e sessione, bozze locali e riutilizzo dell'ID confermato proteggono i tentativi dopo errori. Una visita già aperta oggi viene riutilizzata. La creazione usa il RPC esistente e conserva il controllo server su affidamenti, duplicati e slot semestrali.

Verifica: suite completa 357 test, inclusi apertura senza scritture, riapertura con lo stesso ID, materializzazione e regressioni della chiusura extra. Nessuna modifica al database. Nessuna verifica visuale su dispositivo fisico.
