-- Additive integration: cleaning visits reuse extras, workers, schedules and reports.
alter table public.stores add column if not exists cleaning_enabled boolean not null default false;
alter table public.stores add column if not exists cleaning_start date;
alter table public.stores add column if not exists cleaning_end date;
alter table public.stores add constraint cleaning_dates_valid check(cleaning_end is null or cleaning_start is null or cleaning_end>=cleaning_start);
alter table public.extras add column if not exists cleaning_codes text[];
alter table public.extras add column if not exists cleaning_period date;
alter table public.extras add column if not exists cleaning_year integer;
alter table public.extras add column if not exists cleaning_slot smallint;
alter table public.extras add constraint cleaning_codes_valid check(cleaning_codes is null or (cardinality(cleaning_codes)>0 and cleaning_codes <@ array['A/1','A/2','C/1','C/2','D/2','TARGET']::text[]));
alter table public.extras add constraint cleaning_slot_valid check(cleaning_slot is null or cleaning_slot in (1,2));
create unique index cleaning_semester_slot on public.extras(store_id,cleaning_year,cleaning_slot) where cleaning_slot is not null and stato<>'annullato';

create or replace function public.overgreen_cleaning_guard_v308() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare st public.stores; d date; slot smallint; same_booking boolean:=false;
begin
 if new.cleaning_codes is null then
  if tg_op='UPDATE' and old.cleaning_codes is not null then raise exception 'La classificazione Pulizie non può essere rimossa'; end if;
  return new;
 end if;
 if tg_op='UPDATE' then
  if not public.is_admin() and (new.cleaning_codes is distinct from old.cleaning_codes or new.store_id is distinct from old.store_id or new.cleaning_period is distinct from old.cleaning_period or new.cleaning_slot is distinct from old.cleaning_slot or new.cleaning_year is distinct from old.cleaning_year) then raise exception 'Classificazione riservata amministratore'; end if;
  same_booking:=coalesce(new.store_id=old.store_id and new.cleaning_codes=old.cleaning_codes and coalesce(new.giorno_intervento,new.cleaning_period)=coalesce(old.giorno_intervento,old.cleaning_period),false);
 end if;
 if new.client_type<>'eurospin' or new.categoria_target<>'pulizie' or new.store_id is null or new.con_ordinario then raise exception 'Le pulizie richiedono un PV Eurospin e una visita dedicata'; end if;
 d:=coalesce(new.giorno_intervento,new.cleaning_period);
 if d is null then raise exception 'Data pulizie obbligatoria'; end if;
 -- Lock acquired by administrators at creation/rescheduling, never by workers closing visits.
 if not same_booking then
  select * into st from public.stores where id=new.store_id for update;
  if not found or st.client_type<>'eurospin' then raise exception 'PV Eurospin non disponibile'; end if;
  if new.cleaning_codes<>array['TARGET']::text[] and (not st.cleaning_enabled or st.cleaning_start is null or d<st.cleaning_start or (st.cleaning_end is not null and d>st.cleaning_end)) then raise exception 'Pulizie ordinarie non attive per questo PV nella data scelta'; end if;
 end if;
 if 'TARGET'=any(new.cleaning_codes) and cardinality(new.cleaning_codes)>1 then raise exception 'Target a ore separato dalle prestazioni contrattuali'; end if;
 new.cleaning_year:=extract(year from d)::integer;
 if 'D/2'=any(new.cleaning_codes) and new.stato<>'annullato' then
  if tg_op='UPDATE' and same_booking and old.cleaning_slot is not null then new.cleaning_slot:=old.cleaning_slot;
  else
   select n::smallint into slot from generate_series(1,2) n where not exists(select 1 from public.extras e where e.store_id=new.store_id and e.cleaning_year=new.cleaning_year and e.cleaning_slot=n and e.id<>new.id and e.stato<>'annullato') order by n limit 1;
   if slot is null then raise exception 'Entrambe le semestrali sono già eseguite o prenotate. Usa Target a ore oppure annulla una prenotazione.'; end if;
   new.cleaning_slot:=slot;
  end if;
 else new.cleaning_slot:=null; end if;
 -- A closed contract visit must actually contain all its agreed operations.
 if new.stato in ('in_attesa','completato') and new.cleaning_codes<>array['TARGET']::text[] then
  if exists(select 1 from unnest(new.cleaning_codes) code where not exists(select 1 from public.extra_work_items w where w.extra_id=new.id and w.titolo=code and w.stato='completata')) then raise exception 'Completa tutte le lavorazioni previste prima della chiusura'; end if;
 end if;
 return new;
end $$;
revoke all on function public.overgreen_cleaning_guard_v308() from public,anon,authenticated;
create trigger cleaning_guard_v308 before insert or update on public.extras for each row execute function public.overgreen_cleaning_guard_v308();

create or replace function public.overgreen_cleaning_create_v308(p_id uuid,p_store uuid,p_day date,p_codes text[],p_description text default null,p_existing uuid default null)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare e public.extras; st public.stores; codes text[]; code text; n integer:=0;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Accesso riservato amministratore' using errcode='42501'; end if;
 select * into st from public.stores where id=p_store and attivo for update;
 if not found then raise exception 'PV non disponibile'; end if;
 select array_agg(distinct x order by x) into codes from unnest(p_codes) x;
 if codes is null then raise exception 'Seleziona una lavorazione'; end if;
 if p_existing is not null then
  select * into e from public.extras where id=p_existing for update;
  if not found or e.store_id<>p_store or e.categoria_target<>'pulizie' or e.client_type<>'eurospin' or e.stato in ('completato','in_attesa','annullato') or e.cleaning_codes is not null then raise exception 'Target non disponibile per la classificazione'; end if;
  if exists(select 1 from public.extra_labor_hours where extra_id=e.id) then raise exception 'Il Target ha già dati economici: verifica prima la fatturazione'; end if;
  if codes<>array['D/2']::text[] and codes<>array['TARGET']::text[] then raise exception 'Classificazione Target non valida'; end if;
  update public.extras set cleaning_codes=codes,cleaning_period=p_day where id=e.id returning * into e;
 else
  select * into e from public.extras where id=p_id;
  if found then
   if e.store_id=p_store and e.cleaning_period=p_day and e.cleaning_codes=codes then return to_jsonb(e); end if;
   raise exception 'Identificativo già utilizzato';
  end if;
  -- Add services to the same open contract visit, retaining its team and schedule.
  select * into e from public.extras where store_id=p_store and coalesce(giorno_intervento,cleaning_period)=p_day and cleaning_codes is not null and cleaning_codes<>array['TARGET']::text[] and stato not in ('completato','in_attesa','annullato') and codes<>array['TARGET']::text[] order by created_at,id limit 1 for update;
  if found then
   select array_agg(distinct x order by x) into codes from unnest(codes||e.cleaning_codes) x;
   update public.extras set cleaning_codes=codes,titolo='Pulizie · '||array_to_string(codes,' + '),descrizione=case when nullif(p_description,'') is null then descrizione else concat_ws(E'\n',descrizione,p_description) end where id=e.id returning * into e;
  else
   if exists(select 1 from public.extras where store_id=p_store and coalesce(giorno_intervento,cleaning_period)=p_day and cleaning_codes is not null and stato<>'annullato' and cleaning_codes && codes) then raise exception 'Lavorazione già presente per questo PV e questa data'; end if;
  insert into public.extras(id,store_id,titolo,descrizione,client_type,categoria_target,closure_profile,data_richiesta,stato,creato_da,cleaning_codes,cleaning_period)
   values(p_id,p_store,'Pulizie · '||array_to_string(codes,' + '),p_description,'eurospin','pulizie','eurospin',current_date,'ricevuto',auth.uid(),codes,p_day) returning * into e;
  end if;
 end if;
 foreach code in array codes loop
  if code<>'TARGET' and not exists(select 1 from public.extra_work_items where extra_id=e.id and titolo=code) then
   n:=n+1;insert into public.extra_work_items(extra_id,titolo,posizione,stato) values(e.id,code,n,'da_fare');
  end if;
 end loop;
 return to_jsonb(e);
end $$;
revoke all on function public.overgreen_cleaning_create_v308(uuid,uuid,date,text[],text,uuid) from public,anon;
grant execute on function public.overgreen_cleaning_create_v308(uuid,uuid,date,text[],text,uuid) to authenticated;

-- Prevent older clients from billing a contract visit as an hourly Target.
create or replace function public.overgreen_cleaning_economics_guard_v308() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if exists(select 1 from public.extras where id=new.extra_id and cleaning_codes is not null and not ('TARGET'=any(cleaning_codes))) then
  raise exception 'Visita contrattuale: usa il riepilogo Pulizie, non la tariffazione Target a ore';
 end if;
 return new;
end $$;
revoke all on function public.overgreen_cleaning_economics_guard_v308() from public,anon,authenticated;
create trigger cleaning_economics_guard_v308 before insert or update on public.extra_labor_hours for each row execute function public.overgreen_cleaning_economics_guard_v308();
