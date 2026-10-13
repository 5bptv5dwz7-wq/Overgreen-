# V224 — Correzione creazione extra

Correzione server immediata, compatibile con il frontend V223 e con i moduli già aperti.

La RPC `overgreen_admin_v198` inserisce un record completo: `jsonb_populate_record` imposta a NULL i campi omessi, saltando il DEFAULT della colonna. Dopo V223, la creazione senza `night_hours` violava quindi il vincolo NOT NULL.

La migrazione inizializza a zero le ore notturne omesse o nulle, mantenendo i valori espliciti. Conserva firma, permessi, controlli e idempotenza della RPC. Nessuna modifica alle tariffe o ai dati esistenti.

Verifiche sul database con ruolo authenticated e dati sintetici annullati tramite rollback:
- Riprodotto il vincolo NOT NULL prima della correzione.
- `tests/extra-create-night-hours.sql`: creazione mediante la RPC effettiva, ore omesse/nulle/zero/parziali, allegato, lavorazione e ripetizione idempotente: PASS.
- `tests/night-work.sql`: calcoli diurni/notturni, attrezzature, preventivi, conflitti e permessi: PASS.

Segnalazione connessioni: al controllo 42 sessioni su limite 60, nessuna attesa su lock e nessuna transazione inattiva. Le query e i test hanno risposto correttamente. Non è stata dimostrata la causa dell'errore transitorio mostrato nel client; nessuna modifica arbitraria ai limiti o ai pool.
