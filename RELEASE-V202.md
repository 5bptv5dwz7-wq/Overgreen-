# V202 — Gestione economica degli extra Eurospin

La V201 permetteva di inserire solo le ore. Questa versione completa il pannello **Economia e rapportino** con modalità a tariffa, preventivo o consuntivo, operatori, uscita apposita, attrezzature, spese e totale IVA esclusa.

## Regole

| Categoria | Tariffa oraria per operatore | Uscita per operatore |
|---|---:|---:|
| Verde | 20 € | 100 € |
| Pulizie | 18 € | 50 € |
| Pulizie con attrezzature | 23 € | 50 € |

Le ore sono la somma delle ore di tutti gli operatori: due persone per tre ore significano sei ore. L’app moltiplica questo totale per la tariffa oraria una sola volta. L’uscita viene applicata soltanto se dichiarata apposita, moltiplicando la tariffa di uscita per il numero degli operatori indicato.

Il preventivo sostituisce il calcolo della manodopera nel totale. Le ore rimangono consultabili come dato informativo. È possibile indicare che l’uscita è già compresa nell’importo del preventivo; le spese aggiunte sono esplicitamente extra rispetto al preventivo. Stati disponibili: bozza, inviato, accettato e rifiutato.

Si possono salvare bozze incomplete. I dati mancanti rimangono distinti da zero, e il totale non viene completato usando zeri impliciti.

## Riepilogo e documenti

- Importo e stato economico nella scheda extra.
- Pulsante **Economia Eurospin · riepilogo e Excel** nella pagina Extra.
- Filtri per mese, categoria, modalità e stato del lavoro. Il mese si riferisce alla data di esecuzione, con data richiesta come ripiego.
- I preventivi non accettati e le voci incomplete o da verificare sono esclusi dal totale complessivo, ma rimangono visibili ed esportabili con il loro stato.
- Excel economico dedicato, con dettaglio di ore, uscite, spese, preventivo e note. Il totale non attesta l’emissione o il pagamento di una fattura.
- L’anteprima Eurospin rimane nello stesso pannello, con pagine e zoom. Su telefono il documento e i dati hanno scorrimenti separati per evitare sovrapposizioni dei comandi. L’Excel Eurospin preesistente rimane disponibile come documento distinto.

## Dati e compatibilità

Applicata `extra_economics_v202` da `V202-extra-economics.sql`. I nuovi campi estendono la tabella amministrativa della V201; le ore già inserite vengono conservate. Il vecchio salvataggio delle sole ore rimane compatibile e conserva i dati economici.

Il salvataggio V202 è una singola transazione, verifica la revisione, il rapportino e la categoria del target, valida gli importi prima di arrotondamenti e assegna le tariffe sul server. Il client non può inviare tariffe arbitrarie. Una categoria assente può essere completata nella stessa transazione. La categoria già presente si modifica dalla scheda extra.

RLS e RPC limitano la gestione economica agli amministratori attivi. La vista dipendente svuota anche i dati economici conservati nell’interfaccia. Gli advisor non hanno rilevato nuove segnalazioni riferite a questa modifica.

## Verifica

- 48 test Node/DOM superati, più 8 gruppi di regressione.
- 15 scenari economici condivisi tra i test JavaScript e SQL: verde, pulizie, attrezzature, uscita apposita/assente/inclusa, preventivi, spese, valori mancanti e centesimi.
- Test sul database con dati sintetici e rollback: calcoli, ripetizione sicura, conflitti, precisione, tariffe non modificabili dal client, categoria, rapportino, compatibilità V201 e restrizioni dei ruoli.
- `tests/economics-preview.html` permette di verificare l’interfaccia con larghezza telefono o desktop e un PDF sintetico di due pagine. Salva esclusivamente in memoria e non si collega a Supabase.

La prova autenticata end-to-end su un extra reale richiede una sessione browser dell’amministratore; i test DOM e il documento sintetico non la sostituiscono.
