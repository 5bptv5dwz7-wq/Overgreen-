# V200 — Da gestire e squadre nei prossimi sette giorni

## Perché
Le azioni quotidiane erano distribuite tra sedi, extra, convalide, storico e attività. La nuova pagina amministratore riunisce i lavori che richiedono attenzione e li collega ai moduli esistenti.

## Novità
- Accesso dalla Dashboard e da **Altro → Da gestire**.
- Un elenco con priorità, passaggi da programmare, interventi multigiorno ed extra parziali da riprendere, foto attese ma non registrate, target mancanti, convalide e consuntivi da completare.
- Una voce per record, anche con più segnalazioni; filtri per cliente, ricerca e tipo di azione, contatori e paginazione da 30 voci.
- Le sedi già programmate e quelle con un intervento multigiorno aperto non generano una seconda richiesta di programmazione. Le copie riportate e i lavori annullati sono esclusi dalla nuova vista.
- **Prepara programma** aggiunge la sede alla selezione corrente senza perdere data o altre sedi selezionate; il programma viene salvato dal modulo abituale.
- **Controlla foto** apre l’editor dell’intervento preciso. Sono segnalati soltanto scostamenti fra foto attese e foto registrate: le chiusure senza foto attese non sono considerate anomalie.
- **Squadre · 7 giorni** mostra ordinari, extra e attività, con conteggi separati per lavori da fare, in attesa di convalida e completati. Gli extra collegati sono conteggiati una sola volta, separatamente dall’ordinario.
- Un operatore presente in più squadre con lavori aperti nello stesso giorno genera un invito a controllare gli orari. Non è una misura della durata dei lavori né una prova di sovrapposizione.
- Il pulsante PDF apre il generatore esistente, con l’intervallo di sette giorni preselezionato. Il PDF riguarda tutte le squadre e tutti i clienti del periodo; i filtri della vista restano separati.
- Apertura diretta degli extra corretta: azzera anche il precedente filtro cliente, che poteva nascondere l’extra richiesto.
- Guida della pagina, etichette accessibili, colori delle priorità e layout dedicato agli schermi piccoli.

## Integrazione
La pagina deriva i riepiloghi dai dati già caricati dall’app. I pulsanti aprono le funzioni e i moduli esistenti. La visibilità è limitata all’amministratore anche entrando da una vista salvata o passando alla vista dipendente. L’aggiornamento dati ricalcola i riepiloghi; la schermata indica l’ora dell’ultima lettura riuscita.

Gli script e gli stili della pagina sono locali, con URL V200. Sono aggiornati il numero visibile, la registrazione del service worker e il nome della cache. Nessuna migrazione è necessaria per questa versione.

## Verifiche
- Otto gruppi di regressione V198/V199 superati.
- Dieci test sul modello: deduplicazione, filtri cliente, scadenze, foto, multigiorno, annullati/riportati, consuntivi, squadre, cambi di calendario e protezione della vista dipendente.
- Otto test di interazione sul DOM: navigazione, filtri, escaping dei nomi, collegamenti agli interventi, selezione del programma, vista settimanale, ruoli, gestione degli errori, PDF e paginazione.
- Controllo di sintassi JavaScript, identificativi HTML univoci e riferimenti agli asset locali.
- Letture di controllo su Supabase; i test automatici usano dati fittizi in memoria.

Per ripetere: `npm ci --prefix tests --ignore-scripts` e `npm test --prefix tests`. LinkeDOM 0.18.12 è usato soltanto dai test e ha un lockfile dedicato.

## Limite della verifica
Il browser remoto continua a terminare le richieste per timeout. I test del DOM non eseguono il rendering CSS e non certificano la resa su iPhone. Foto, fotocamera, condivisione nativa e consegna push non hanno ricevuto una nuova prova end-to-end in questa release. Le prove complete rimaste aperte in V199 restano tali.
