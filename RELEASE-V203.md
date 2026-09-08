# V203 — Chiusura extra più semplice

La scansione automatica dei rapportini aggiungeva una finestra e richiedeva di correggere bordi spesso rilevati male. La chiusura Eurospin ora usa direttamente una foto o un PDF.

- Due riquadri distinti: Rapportino Eurospin e File Overgreen.
- Scatta foto apre la fotocamera nativa; Scegli file accetta immagini e PDF.
- Foto intera, senza rilevamento bordi, ritaglio, prospettiva o filtri scanner. Rimane la compressione immagini già usata nel caricamento.
- Anteprima della foto, nome del file, Apri e Rimuovi. Annullare il selettore conserva la scelta precedente.
- I documenti già presenti sono visibili in entrambi i riquadri. Rimuovere una nuova selezione ripristina la visualizzazione del documento salvato senza cancellarlo.
- Sede, target e titolo identificano l'extra nella schermata. Le foto del lavoro sono distinte dai rapportini.
- Salvataggio definitivo, parziale e caricamenti con recupero dopo errore mantengono le regole precedenti. I documenti non si possono sostituire durante l'invio.
- Rimossi codice, finestra, stili scanner e caricamento OpenCV.

Nessuna modifica a schema, permessi o dati Supabase.

## Verifica

58 test Node/DOM e 8 gruppi di regressione superati. I 10 nuovi casi verificano acquisizione originale, annullamento, PDF, sostituzione/rimozione, documenti esistenti, invio finale, parziale, requisiti e retry dopo errore.

`node tests/build-closure-preview.cjs <percorso.html>` genera una pagina di prova autonoma con la schermata e gli handler reali; dati e upload restano in memoria. Il browser cloud ha bloccato l'apertura della pagina locale, quindi non è stata completata la verifica visiva né provata una fotocamera iPhone fisica.
