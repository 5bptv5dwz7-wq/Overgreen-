-- Verify the existing admin/employee boundary on the reused coordinate fields.
-- All changes are rolled back; no users, stores or policies are created.
begin;
select set_config('request.jwt.claims',json_build_object('sub',id,'role','authenticated')::text,true)
from public.profiles where ruolo='admin' and attivo is true order by id limit 1;
set local role authenticated;
do $$
declare n integer;
begin
  update public.stores set latitudine=45.500379047325,longitudine=10.347979028977
  where client_type='eurospin' and lower(trim(nome))='mazzano' and lower(trim(citta))='mazzano';
  get diagnostics n=row_count;
  if n<>1 then raise exception 'Admin cannot update the Mazzano location'; end if;
  if not exists(select 1 from public.stores where client_type='eurospin' and lower(trim(nome))='mazzano' and latitudine=45.500379047325 and longitudine=10.347979028977)
  then raise exception 'Admin cannot read back the saved point'; end if;
end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',id,'role','authenticated')::text,true)
from public.profiles where ruolo<>'admin' and attivo is true order by id limit 1;
set local role authenticated;
do $$
declare n integer;
begin
  if not exists(select 1 from public.stores where client_type='eurospin' and lower(trim(nome))='mazzano' and latitudine=45.500379047325)
  then raise exception 'Employee cannot read the confirmed location'; end if;
  update public.stores set latitudine=0,longitudine=0 where client_type='eurospin' and lower(trim(nome))='mazzano';
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Employee can overwrite store coordinates'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"anon"}',true);
set local role anon;
do $$
declare n integer;
begin
  begin
    update public.stores set latitudine=0,longitudine=0 where client_type='eurospin' and lower(trim(nome))='mazzano';
    get diagnostics n=row_count;
    if n<>0 then raise exception 'Anonymous user can update location'; end if;
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
select 'Location access tests passed; all writes rolled back' as result;
