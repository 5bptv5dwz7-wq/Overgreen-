# V199 — verifiche dal browser autenticato

## Correzioni emerse durante le prove
- La selezione sedi della programmazione veniva renderizzata prima del caricamento dei dati e non aggiornata da loadAll: ora viene popolata dopo la lettura delle sedi.
- Per le sedi senza indirizzo e città, il calcolo percorso usava soltanto “Italia”: ora usa il nome sede, rifiuta un indirizzo vuoto o il solo paese e ignora coordinate precedenti etichettate “Italia”. Cache percorsi rinnovata; risultati senza indirizzo stradale indicati come approssimativi.

## Prove reali completate
- Login amministratore e apertura dashboard.
- Navigazione a programmazione, rubrica, statistiche, archivio aziendale, firme, log, impostazioni, report ed extra.
- Rubrica: creazione e modifica di un contatto fittizio, con riscontro dei dati salvati in Supabase.
- Programmazione: creazione su sede fittizia, data futura e rollover disattivato; cambio data; aggiunta di un componente squadra. Esiti verificati su interfaccia e database.
- Ordinario: chiusura con note e senza foto da amministratore, convalida e presenza nei report.
- PDF programma: generazione e comparsa del pulsante di condivisione. Il report sintetico ha mostrato conferma di download, ma l'evento download non è stato intercettato dal browser remoto: contenuto del file non certificato.
- Ricerca sedi e filtro cliente nei report.
- Nuovo extra: apertura modulo e validazione categoria obbligatoria.

## Limiti delle prove
Il browser remoto ha smesso di rispondere durante la prova di creazione extra; il salvataggio non è stato completato. Non risultano extra o file creati da quella prova. Fotocamera, condivisione nativa iPhone, consegna push, OCR completo, sostituzione PDF e avanzamento extra con foto non sono certificati end-to-end da questa sessione. Archivio, firme e log sono stati aperti, senza testarne tutte le scritture. Non sono stati creati utenti né cambiate credenziali. La vista dipendente e i suoi percorsi reali richiedono una prova separata.

## Pulizia e verifiche
Rimossi contatto, sede, programmazione, membri e intervento fittizi tramite identificativi esatti. Controllo finale: zero fixture operative residue. I log di audit e i registri tecnici delle richieste mantengono traccia delle prove.
Otto gruppi di regressione JavaScript superati; sintassi verificata. Le nuove correzioni sono state verificate nel codice, ma il blocco del browser ha impedito di riprovarle nella sessione autenticata prima della pubblicazione.
