# V207 — Posizione precisa per Maps e percorsi

Con un indirizzo generico il pulsante Maps perdeva il nome del cliente e cercava
solo la strada. La dashboard usava un'altra posizione, ottenuta automaticamente,
che poteva corrispondere a un comune e veniva riutilizzata come se fosse precisa.
Inoltre, la memoria dei percorsi non cambiava quando si correggevano le coordinate.

## Comportamento

- Nell'anagrafica, **Imposta posizione Maps** permette di scegliere l'ingresso
  sulla mappa, trascinare il punto, incollare un collegamento o le coordinate,
  oppure acquisire la posizione GPS quando si è sul posto. Salva memorizza il
  punto insieme alla sede; chiudere senza salvare scarta la modifica.
- `latitudine` e `longitudine`, già presenti e non utilizzati dalle 171 sedi
  prima di V207, conservano la posizione esplicitamente scelta. Indirizzo e
  coordinate sono separati: una correzione del testo non sposta il negozio.
- Ordinari, extra collegati, attività nella stessa sede, dettagli, programmazione
  e condivisione usano le medesime coordinate. Un'attività con luogo diverso
  mantiene il proprio indirizzo.
- Senza posizione confermata, Maps mantiene nome, cliente, località e indirizzo.
  La ricerca online propone risultati da controllare; non sovrascrive il testo
  digitato e non conferma automaticamente la prima sede trovata.
- Comuni, zone e più sedi omonime richiedono verifica. I calcoli basati su una via
  o su un risultato ancora non confermato restano indicativi anche dopo riapertura.
  I riepiloghi distinguono le posizioni indicative e i percorsi calcolati solo
  parzialmente. I minuti sono stime OSRM, senza traffico in tempo reale.
- La memoria V207 distingue sedi con indirizzo uguale e include le coordinate
  effettive di partenza e arrivo. I punti vengono risolti prima di cercare un
  percorso già calcolato, evitando il riutilizzo dei vecchi km dopo una modifica.
- Le vecchie coordinate `route_*` servono solo come suggerimento nel selettore;
  non vengono promosse a posizioni confermate. Non sono eliminati altri dati.

## Dati e servizi

`V207-mazzano-location.sql` corregge esclusivamente Eurospin Mazzano usando il
collegamento Maps della [pagina ufficiale](https://www.eurospin.it/punti-vendita/mazzano-via-padana-superiore/):
45.500379047325, 10.347979028977. Il controllo interrompe l'operazione se trova più
sedi o una posizione diversa già confermata. Non servono nuove colonne o policy.

La funzione `resolve-maps-link` richiede JWT valido e amministratore attivo,
verificato con il token dell'utente e RLS. Nessuna chiave privilegiata. Ogni
redirect è limitato a host e percorsi Maps autorizzati, senza inoltrare credenziali.
Il parser distingue la destinazione dalle coordinate della visuale o della
partenza. I link brevi che non espongono coordinate utilizzabili richiedono la
scelta del punto sulla mappa: non si ricavano coordinate dal solo centro visibile.

Leaflet 1.9.4 è incluso con licenza e risorse. Lo sfondo usa OpenStreetMap;
ricerca e calcolo mantengono Nominatim, Photon e OSRM. Errori di rete non cancellano
il punto scelto. Le ricerche concorrenti sono accorpate e Nominatim è distanziato
di almeno 1,1 secondi per istanza dell'app.

## Verifica

109 test automatici e 8 gruppi di regressione: punto Mazzano, link ufficiale,
indirizzo mancante, comune omonimo, più negozi, coordinate non valide, punto di
visualizzazione diverso dalla destinazione, cache dopo spostamento e riapertura,
stesso indirizzo su due sedi, richieste concorrenti, ricerca in ritardo, annullamento,
salvataggio della bozza, errori, autorizzazione e redirect non consentiti.

`tests/locations.sql` verifica con rollback che l'amministratore salvi e rilegga
il punto, i dipendenti possano leggerlo senza modificarlo e l'accesso anonimo
non possa aggiornarlo. Restano verificati i flussi precedenti, comprese le foto.
Nessuna prova fisica su iPhone è inclusa nella verifica automatica.

Rollback frontend: ripubblicare il commit V206. I campi esistenti e i dati
rimangono compatibili. La nuova funzione legge esclusivamente e non modifica sedi.
