-- Official Eurospin store: https://www.eurospin.it/punti-vendita/mazzano-via-padana-superiore/
-- Its Maps directions link specifies destination=45.500379047325,10.347979028977.
-- Data repair only; existing fields and RLS are unchanged. Repeatable; aborts
-- instead of overwriting a different point already confirmed by an operator.
begin;
do $$
declare v_count integer;
begin
  perform id from public.stores
  where client_type='eurospin' and lower(trim(nome))='mazzano' and lower(trim(citta))='mazzano'
  for update;
  get diagnostics v_count = row_count;
  if v_count<>1 then raise exception 'Expected exactly one Eurospin Mazzano, found %',v_count; end if;
  update public.stores set
    latitudine=45.500379047325,longitudine=10.347979028977,
    route_latitude=45.500379047325,route_longitude=10.347979028977,
    route_geocode_label='Eurospin Mazzano · posizione dal sito ufficiale',route_geocoded_at=now()
  where client_type='eurospin' and lower(trim(nome))='mazzano' and lower(trim(citta))='mazzano'
    and ((latitudine is null and longitudine is null)
      or (latitudine=45.500379047325 and longitudine=10.347979028977));
  get diagnostics v_count = row_count;
  if v_count<>1 then raise exception 'A different confirmed location already exists; review before updating'; end if;
end $$;
commit;
