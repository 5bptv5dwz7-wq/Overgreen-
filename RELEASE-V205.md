# V205 — Convalida con foto mancanti

In Da convalidare, gli amministratori possono scegliere **Forza convalida · foto mancanti** quando le foto sono incomplete. Il dialogo indica la sede e le foto ricevute/attese e richiede un motivo da 5 a 500 caratteri. Annullare non modifica il lavoro. La normale convalida continua a richiedere tutte le foto.

La transizione server aggiorna intervento, programmazione, ultimo passaggio e target/ticket inclusi usando la stessa transazione della convalida normale. Memorizza amministratore, data, motivo e conteggi al momento della forzatura nel campo protetto `photo_approval_override`. Il log modifiche esistente registra l'aggiornamento; lo storico mostra motivo, data e conteggi originari/attuali.

Nessun azzeramento delle foto attese, nessuna finta sincronizzazione, nessuna cancellazione di file o code. Foto arrivate successivamente restano associabili. Multigiorno ancora aperti e stati non convalidabili restano protetti; i tentativi ripetuti conservano la prima forzatura. Un trigger impedisce ai dipendenti di falsificare il nuovo campo.

Migrazione Supabase: `force_photo_approval_v205`. Verificati con rollback: blocco normale, motivo, forzatura, conteggi, audit, retry, programmazione/target inclusi, foto tardive, multigiorno e permessi dipendente/anonimo. Cinque test DOM/azione e otto gruppi di regressione passati; nessun nuovo avviso sicurezza relativo alla modifica.

L'intervento reale mostrato dall'utente non è stato convalidato automaticamente. La modifica aggiunge il comando perché sia l'amministratore a decidere.
