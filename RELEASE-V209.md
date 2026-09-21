# V209 — Scelta addebito uscita nell’economia Eurospin

La scelta dell’uscita era poco chiara e lontana dal totale. Ora “Addebitare l’uscita?” si trova in fondo alla scheda Economia, dopo ore, spese e note e prima del riepilogo.

- Sì: 50 € per addetto per pulizie, 100 € per addetto per verde. No: uscita non addebitata.
- Mostra tariffa, numero addetti e importo complessivo; conserva la scelta salvata con il campo esistente dedicated_trip e la RPC save_extra_economics_v202.
- Economia separata disponibile solo per extra Eurospin con profilo di chiusura eurospin (richiesta e due rapportini), inclusi i record storici con profilo non specificato. Target compresi nell’ordinario esclusi da scheda e riepilogo/Excel economico.
- Il profilo viene riletto all’apertura per bloccare anche una scheda ormai cambiata in ordinaria.
- Preventivi: conserva la scelta “Uscita già compresa nell’importo del preventivo”, senza doppio addebito.
- Nessuna migrazione o modifica dei record economici esistenti. Nessun addebito automatico sui nuovi extra: scelta iniziale da indicare.

Verifica: 35 test Node/DOM superati su extra-hours ed extra-economics; controllo sintassi degli script modificati. Calcolo SQL esistente verificato con quattro scenari sintetici verde/pulizie × Sì/No, senza scrivere dati reali. Test DOM con chiamate di salvataggio simulate; nessuna prova su iPhone fisico.
