# V212 — Sconto in euro nell’economia extra

Campo facoltativo Sconto in euro, dopo la scelta dell’uscita e prima del riepilogo. Il prezzo finale è manodopera (o preventivo) + uscita + spese − sconto, IVA esclusa. Il riepilogo mostra subtotale, sconto e prezzo finale. Il registro economico e l’Excel usano il netto; l’Excel contiene anche subtotale e sconto separati.

Supabase: colonna discount_amount con default zero sulla tabella amministrativa esistente; aggiornate le funzioni di calcolo e salvataggio, conservando SECURITY INVOKER e i permessi. Validazione di importo non negativo, due decimali e sconto non superiore al subtotale. I client precedenti che omettono il campo conservano lo sconto già registrato. I valori preesistenti rimangono invariati, con sconto zero.

Verifica: 38 test Node/DOM superati, compresi salvataggio e riapertura, cancellazione dello sconto, tutte le modalità, importi non validi e colonne Excel. Test SQL transazionale con record sintetico e rollback: subtotale 580 €, sconto 80 €, finale 500 €; persistenza, retry idempotente, compatibilità vecchi client, sconto zero/totale e rifiuto importi invalidi. Sintassi JS verificata. Nessun test su iPhone fisico.

Controllo Supabase: nessuna segnalazione relativa alle due funzioni modificate o alla tabella economica. Rimangono avvisi su funzioni SECURITY DEFINER preesistenti, tabella tecnica con RLS senza policy e protezione password compromesse disabilitata; non modificati in questo intervento.

La migrazione remota applicata è riportata in V212-discount.sql. Il rollback del solo frontend conserva i dati di sconto, ma i client vecchi non mostrano il totale netto: preferire un eventuale hotfix in avanti.
