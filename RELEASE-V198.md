# Overgreen V198

## Correzioni
- Rubrica: campi allineati al database; salvataggio contatto e sedi in una transazione.
- Creazione e riutilizzo programmazioni: transazione server, protezione contro doppio invio e recupero della risposta persa.
- Creazione extra: PDF caricato prima della transazione; extra, squadra, lavorazioni e allegato registrati insieme.
- Cambio data: extra completati, in attesa di convalida e annullati preservati.
- Cambio squadra: assegnazioni dirette degli extra aperti sincronizzate nella stessa transazione.
- PDF richiesta e allegati di chiusura: nuovo file confermato prima della rimozione del precedente.
- Foto extra, attività e lavorazioni: recupero dei tentativi interrotti; note avanzamento con identificativi stabili.
- Cache report PDF sensibile a modifiche delle note e sostituzioni foto.
- Numeri target/ticket distinti per cliente.
- Cancellazione storico multigiorno: ripristino di tutti i collegamenti e ultima visita calcolata sulla data finale. Aggiornata anche la funzione Edge manage-user.
- Attività annullate escluse dal conteggio delle sedi programmate.
- Excel: dati invalidati quando cambiano mese o categoria; controllo ulteriore al download.
- Esportazione mensile verde + pulizie in un solo ZIP, con cartelle separate e limite totale 10 MB.
- Versione visibile e cache PWA aggiornate a V198.

## Supabase
Migrazioni additive applicate al progetto esistente. Nuovo RPC amministrativo SECURITY INVOKER, con verifica amministratore attivo e RLS. Tabella richieste protetta da RLS. Ripetere la stessa richiesta restituisce il risultato senza duplicare le scritture. Aggiunti indici per chiavi esterne mancanti, limitato l'accesso anonimo alle funzioni interne, fissato search_path di set_updated_at. Le policy di recupero Storage richiedono proprietà del file e accesso al lavoro.

## Verifica
- `node tests/flows.cjs`: sette gruppi di regressione superati.
- Sintassi app.js e sw.js verificata con Node.
- `test-database.sql`: transazioni, contatti, retry, errori intermedi, cambio data, cambio squadra, creazione extra e cancellazione multigiorno verificati sul database con ROLLBACK finale.
- Verificato il rifiuto del nuovo RPC per dipendenti e anonimi.
- Ricontrollati gli advisor: nessuna segnalazione di FK senza indice, accesso anonimo a SECURITY DEFINER o search_path modificabile.

## Limiti e punti operativi
La foto di Dormelletto del 1 settembre non è presente sul server: nessuna modifica può ricostruirla; serve il dispositivo originale o una nuova copia.
La protezione dalle password compromesse resta disabilitata: il connettore disponibile non espone la modifica della configurazione Auth. Restano avvisi sugli indici inutilizzati (compresi quelli appena creati), policy multiple e ottimizzazioni delle policy: non equivalgono a guasti nei pulsanti. Le funzioni SECURITY DEFINER accessibili agli autenticati restano necessarie a diversi flussi e non sono state rimosse indiscriminatamente.
Le prove complete con login su iPhone, fotocamera e condivisione nativa richiedono una sessione sul dispositivo; non sono certificate da queste prove isolate.

## Ripristino
Il codice V197 rimane nella cronologia GitHub al commit 9a9370c34c837937a89b5cdef9f9cfff1cb76b09. Le modifiche database sono additive e compatibili con il codice precedente. Conservare schema e richieste V198 anche in caso di ripristino del solo frontend.
