# V210 — Filtro mese di chiusura negli extra completati

La sezione Extra → Completati contiene un selettore “Mese di chiusura target”, con Tutti i mesi, mesi presenti dal più recente, e Senza data di chiusura quando necessario. La scelta mostra il numero filtrato rispetto al totale della sezione.

Il mese deriva da closed_at nel fuso Europe/Rome, non dalla data richiesta, programmata o di convalida. I record senza data rimangono consultabili separatamente. Il gruppo Completati conserva gli stessi stati precedenti (completato e in_attesa).

Il filtro si combina con cliente, categoria e ricerca; non modifica Da fare e Programmati. Aprire uno specifico extra, anche dalla ricerca globale, azzera il filtro mese per rendere visibile la destinazione. Non sono necessarie modifiche al database.

Verifica: tre test DOM/logica superati, inclusi confini mese/anno in Italia, ripristino Tutti i mesi, record senza data, combinazione con ricerca/clienti e apertura diretta di un extra. Sintassi app.js verificata. Nessuna prova su iPhone fisico.
