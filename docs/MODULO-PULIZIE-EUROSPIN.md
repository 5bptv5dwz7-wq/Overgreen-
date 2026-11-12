# Modulo Pulizie Eurospin — specifica implementativa

Stato: progettazione; **non** attivare automaticamente servizi o migrazioni prima di verificare i dati contrattuali per PV.

## Catalogo capitolato
- A/1: settimanale bagni e spogliatoi (pagine 8–10).
- A/2: settimanale aree esterne, parcheggi, carrelli, cestini (pagine 10–11).
- C/1: mensile bagni/spogliatoi: vetri, davanzali, infissi e zanzariere (pagine 12–13).
- C/2: mensile aree esterne: pavimentazioni, carrelli e rifiuti (pagine 13–14).
- D/2: semestrale aree interne/esterne: deragnatura, vetrate/rivestimenti esterni, bidoni in uso, rifiuti (pagine 15–16).
- Target a ore: interventi extra autorizzati; non un pacchetto ricorrente. Il capitolato a pagina 23 distingue extra C/1, C/2, D/2 e D/3 (quest'ultimo verde).

## Contratti per punto vendita
Un'unica opzione `pulizie_ordinarie_in_gestione`: se true, abilita A/1, A/2, C/1, C/2, D/2 e le scadenze; se false non genera ordinarie, ma consente Target e prestazioni esplicitamente affidate. Nessuna inferenza del contratto dai passaggi storici. Prevedere validità dal/al, conservazione storico e override per affidamenti puntuali.

## Programmazione
Una visita può includere più lavorazioni; una sola presenza nel giro/dashboard, ma rapportino con righe separate. Scadenze e storico indipendenti dal verde; stessa anagrafica PV e calendario trasversale. Non duplicare visite nei contatori.

## D/2
Contatore per PV, annualità contrattuale e affidamento, con disponibilità configurabile (default operativo 2/anno solo per contratti confermati). Stati: disponibile, prenotato, eseguito, annullato. Prenotare in fase di pianificazione; consumare solo alla convalida della chiusura; liberare in caso di annullamento; impedire doppia prenotazione in transazione. Una richiesta Target si può proporre come D/2 solo se attività inclusa nel D/2, affidamento valido e slot non impegnato. Override amministratore motivato, con audit trail. Non convertire automaticamente richieste di vetri bagni C/1 in D/2.

## Economia
Distinguere prestazioni contrattuali da Target a ore. Conservare categorie, prezzi, autorizzazioni, ore, addetti e forfait. Esportare Excel Pulizie distinto, senza doppio conteggio per visite multi-lavorazione.

## UX
Nella selezione tipo intervento e nel dettaglio Dashboard/storico mostrare icona info con legenda breve del capitolato e link al testo completo. Dipendenti: permessi esistenti, nessuna modifica ai ruoli.

## Migrazione e test obbligatori
1. Ispezionare tabelle/RPC, storico e modelli di programmazione prima di scrivere migrazioni.
2. Migrazioni additive e reversibili; non attribuire automaticamente servizi ai PV preesistenti.
3. Test: PV gestito/non gestito; visita multi-lavorazione; due D/2 consumati; prenotazione concorrente; annullamento; cambio annualità; richiesta C/1 vs D/2; Target a ore; fatturazione e permessi dipendenti.
4. Aggiornare versione app.js/index.html/sw.js con scripts/set-version.cjs e superare tests/version-consistency.cjs prima di pubblicare.
