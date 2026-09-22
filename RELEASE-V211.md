# V211 — Nascondere i target compresi nei completati

Nei Completati è disponibile la spunta “Nascondi quelli compresi nell’ordinario”, inizialmente disattivata. Si combina con mese, cliente, categoria e ricerca. Non modifica le sezioni Da fare e Programmati.

La classificazione usa closure_profile (eurospin_ordinario / intesa_ordinario), mai il flag con_ordinario né l’esistenza di una scheda economica. Un extra a due rapportini, anche svolto insieme al passaggio ordinario, rimane visibile e conserva l’economia da compilare.

Verificata la logica economica esistente: isBillableExtra accetta i profili Eurospin a due rapportini indipendentemente da con_ordinario; esclude i target compresi. Nessuna modifica alle tariffe o ai dati salvati.

L’apertura diretta di un extra azzera entrambi i filtri dei Completati per non nascondere la destinazione. Il contatore mostra filtrati / totale quando è attivo uno dei due filtri.

Verifica: 5 test Node/DOM passati (mese, fuso italiano, ricerca, link diretto, classificazione dei tre casi e filtro combinato). Sintassi app.js verificata. Nessuna prova su iPhone fisico.
