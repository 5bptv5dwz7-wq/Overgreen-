create table public.vehicles (
 id uuid primary key default gen_random_uuid(), nome text not null check(length(trim(nome)) between 1 and 120),
 targa text not null default '' check(length(targa)<=30), tipo text not null default 'Furgone' check(length(tipo)<=80),
 note text not null default '' check(length(note)<=2000), attivo boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index vehicles_plate_unique on public.vehicles(upper(replace(targa,' ',''))) where targa<>'';
alter table public.vehicles enable row level security;
create policy vehicles_read on public.vehicles for select to authenticated using ((select public.is_active_user()));
create policy vehicles_admin on public.vehicles for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select,insert,update on public.vehicles to authenticated;
alter table public.schedules add column vehicle_id uuid references public.vehicles(id), add column mileage_revision bigint not null default 0;
alter table public.saved_routes add column vehicle_id uuid references public.vehicles(id);
create index schedules_vehicle_idx on public.schedules(vehicle_id) where vehicle_id is not null;
create index saved_routes_vehicle_idx on public.saved_routes(vehicle_id) where vehicle_id is not null;
create table public.trip_mileage (
 id uuid primary key default gen_random_uuid(),schedule_id uuid unique references public.schedules(id) on delete set null,
 giorno date not null,vehicle_id uuid references public.vehicles(id),vehicle_label text not null default '',
 member_ids uuid[] not null default '{}', member_names jsonb not null default '[]',
 legs jsonb not null default '[]' check(jsonb_typeof(legs)='array'),
 estimated_km numeric check(estimated_km>=0 and estimated_km<100000), estimated_minutes numeric check(estimated_minutes>=0 and estimated_minutes<100000),
 missing_legs integer not null default 0 check(missing_legs>=0), revision bigint not null default -1,
 dirty boolean not null default true, completed boolean not null default false, actual_km numeric check(actual_km>=0 and actual_km<100000),
 odometer_start numeric check(odometer_start>=0),odometer_end numeric check(odometer_end>=odometer_start),
 note text not null default '' check(length(note)<=2000), confirmed_at timestamptz, confirmed_by uuid references public.profiles(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check((odometer_start is null and odometer_end is null) or (odometer_start is not null and odometer_end is not null and actual_km=odometer_end-odometer_start))
);
create index trip_mileage_date_idx on public.trip_mileage(giorno desc,id);
create index trip_mileage_vehicle_idx on public.trip_mileage(vehicle_id);
create index trip_mileage_confirmer_idx on public.trip_mileage(confirmed_by) where confirmed_by is not null;
create index trip_mileage_members_idx on public.trip_mileage using gin(member_ids);
alter table public.trip_mileage enable row level security;
create policy mileage_read on public.trip_mileage for select to authenticated using ((select public.is_admin()) or ((select public.is_active_user()) and (select auth.uid())=any(member_ids)));
create policy mileage_admin on public.trip_mileage for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select,insert,update on public.trip_mileage to authenticated;
create schema if not exists overgreen_private;
revoke all on schema overgreen_private from public,anon,authenticated;
create or replace function overgreen_private.trip_done(sid uuid) returns boolean language sql stable set search_path='' as $$
 with jobs as (
 select si.stato::text as state from public.schedule_items si where si.schedule_id=sid and si.stato::text not in ('annullato','riportato')
 union all select e.stato::text from public.extras e where e.schedule_id=sid and e.schedule_item_id is null and e.stato::text<>'annullato' and not exists(select 1 from public.schedule_items i where i.schedule_id=sid and i.extra_id=e.id)
 union all select a.stato from public.schedule_activities a where a.schedule_id=sid and a.stato<>'annullato'
 ) select count(*)>0 and coalesce(bool_and(state in ('completato','in_attesa','convalidato')),false) from jobs;
$$;
-- Only trigger invocation can maintain history when an employee closes a job.
create or replace function overgreen_private.mileage_changed() returns trigger language plpgsql security definer set search_path='' as $$
declare sid uuid; ids uuid[]; dirty_change boolean:=true; oldj jsonb; newj jsonb;
begin
 if tg_op<>'INSERT' then oldj=to_jsonb(old); end if;
 if tg_op<>'DELETE' then newj=to_jsonb(new); end if;
 if tg_table_name='schedules' then
  if tg_op='UPDATE' and (oldj->'giorno',oldj->'vehicle_id',oldj->'route_endpoints') is not distinct from (newj->'giorno',newj->'vehicle_id',newj->'route_endpoints') then return new; end if;
  ids=array[(newj->>'id')::uuid];
 else
  ids=array[(oldj->>'schedule_id')::uuid,(newj->>'schedule_id')::uuid];
  if tg_table_name='extras' then ids=ids||array(select distinct i.schedule_id from public.schedule_items i where i.extra_id=coalesce((newj->>'id')::uuid,(oldj->>'id')::uuid)); end if;
  if tg_op='UPDATE' then
   dirty_change=(oldj-'stato'-'updated_at'-'closed_at'-'closed_by'-'completed_at'-'completed_by') is distinct from (newj-'stato'-'updated_at'-'closed_at'-'closed_by'-'completed_at'-'completed_by') or (oldj->>'stato' in ('annullato','riportato')) is distinct from (newj->>'stato' in ('annullato','riportato'));
  end if;
 end if;
 for sid in select distinct x from unnest(ids) x where x is not null loop
  if not exists(select 1 from public.schedules where id=sid) then continue; end if;
  if dirty_change then update public.schedules set mileage_revision=mileage_revision+1 where id=sid; end if;
  update public.trip_mileage set dirty=dirty or dirty_change,completed=overgreen_private.trip_done(sid),updated_at=now() where schedule_id=sid;
 end loop;
 return coalesce(new,old);
end $$;
revoke all on function overgreen_private.trip_done(uuid),overgreen_private.mileage_changed() from public,anon,authenticated;
create trigger mileage_schedule after update of giorno,vehicle_id,route_endpoints on public.schedules for each row execute function overgreen_private.mileage_changed();
create trigger mileage_items after insert or update or delete on public.schedule_items for each row execute function overgreen_private.mileage_changed();
create trigger mileage_members after insert or update or delete on public.schedule_members for each row execute function overgreen_private.mileage_changed();
create trigger mileage_extras after insert or update or delete on public.extras for each row execute function overgreen_private.mileage_changed();
create trigger mileage_activities after insert or update or delete on public.schedule_activities for each row execute function overgreen_private.mileage_changed();
-- Invoker RPC: caller retains RLS, administrative writes only.
create or replace function public.overgreen_capture_mileage_v303(p_schedule uuid,p_revision bigint,p_legs jsonb) returns public.trip_mileage language plpgsql set search_path='public','pg_temp' as $$
declare s public.schedules; r public.trip_mileage; people uuid[]; names jsonb; km numeric; mins numeric; missing integer; is_done boolean;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo amministratori'; end if;
 select * into strict s from public.schedules where id=p_schedule for update;
 if s.mileage_revision<>p_revision then raise exception 'Il giro è cambiato: aggiorna e riprova'; end if;
 if jsonb_typeof(p_legs)<>'array' or jsonb_array_length(p_legs)>500 or octet_length(p_legs::text)>500000 then raise exception 'Tratte non valide'; end if;
 if exists(select 1 from jsonb_array_elements(p_legs) x where length(x->>'from')>500 or length(x->>'to')>500 or (x->>'km')::numeric<0 or (x->>'minutes')::numeric<0) then raise exception 'Tratta non valida'; end if;
 select coalesce(array_agg(p.id order by p.id),'{}'),coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.nome) order by p.id),'[]') into people,names from public.schedule_members m join public.profiles p on p.id=m.profile_id where m.schedule_id=s.id;
 select coalesce(sum((x->>'km')::numeric),0),coalesce(sum((x->>'minutes')::numeric),0),count(*) filter(where x->>'km' is null) into km,mins,missing from jsonb_array_elements(p_legs) x;
 select count(*)>0 and coalesce(bool_and(state in ('completato','in_attesa','convalidato')),false) into is_done from (
 select stato::text as state from public.schedule_items where schedule_id=s.id and stato::text not in ('annullato','riportato')
 union all select e.stato::text from public.extras e where e.schedule_id=s.id and e.schedule_item_id is null and e.stato::text<>'annullato' and not exists(select 1 from public.schedule_items i where i.schedule_id=s.id and i.extra_id=e.id)
 union all select stato from public.schedule_activities where schedule_id=s.id and stato<>'annullato') jobs;
 insert into public.trip_mileage(schedule_id,giorno,vehicle_id,vehicle_label,member_ids,member_names,legs,estimated_km,estimated_minutes,missing_legs,revision,dirty,completed)
 values(s.id,s.giorno,s.vehicle_id,coalesce((select nome||case when targa<>'' then ' · '||targa else '' end from public.vehicles where id=s.vehicle_id),''),people,names,p_legs,km,mins,missing,s.mileage_revision,false,is_done)
 on conflict(schedule_id) do update set giorno=excluded.giorno,vehicle_id=excluded.vehicle_id,vehicle_label=excluded.vehicle_label,member_ids=excluded.member_ids,member_names=excluded.member_names,legs=excluded.legs,estimated_km=excluded.estimated_km,estimated_minutes=excluded.estimated_minutes,missing_legs=excluded.missing_legs,revision=excluded.revision,dirty=false,completed=excluded.completed,updated_at=now()
 where trip_mileage.confirmed_at is null
 returning * into r;
 if r.id is null then select * into r from public.trip_mileage where schedule_id=s.id; end if;
 return r;
end $$;
revoke all on function public.overgreen_capture_mileage_v303(uuid,bigint,jsonb) from public,anon;
grant execute on function public.overgreen_capture_mileage_v303(uuid,bigint,jsonb) to authenticated;
do $patch$
declare def text; old text; new text;
begin
 select pg_get_functiondef('public.overgreen_admin_v198(uuid,text,jsonb)'::regprocedure) into def;
 old=$x$insert into schedules(giorno,nota_generale,creato_da,auto_rollover,route_endpoints)
  values(v_day,p_payload->>'note',auth.uid(),coalesce((p_payload->>'auto_rollover')::boolean,true),coalesce(p_payload->'route_endpoints','{}'::jsonb)) returning id into v_id;$x$;
 new=$x$if nullif(p_payload->>'vehicle_id','') is not null and not exists(select 1 from public.vehicles where id=(p_payload->>'vehicle_id')::uuid and attivo) then raise exception 'Mezzo non disponibile'; end if;
  insert into schedules(giorno,nota_generale,creato_da,auto_rollover,route_endpoints,vehicle_id)
  values(v_day,p_payload->>'note',auth.uid(),coalesce((p_payload->>'auto_rollover')::boolean,true),coalesce(p_payload->'route_endpoints','{}'::jsonb),nullif(p_payload->>'vehicle_id','')::uuid) returning id into v_id;$x$;
 if strpos(def,old)=0 then raise exception 'Scheduler changed'; end if; execute replace(def,old,new);
 select pg_get_functiondef('public.overgreen_rollover_target_v197(uuid,date)'::regprocedure) into def;
 old='insert into public.schedules(giorno,nota_generale,creato_da,auto_rollover,rollover_from,route_endpoints)';
 if strpos(def,old)=0 then raise exception 'Rollover changed'; end if;
 def=replace(def,old,'insert into public.schedules(giorno,nota_generale,creato_da,auto_rollover,rollover_from,route_endpoints,vehicle_id)');
 execute replace(def,'values(p_day,v_source.nota_generale,v_source.creato_da,true,v_source.id,v_source.route_endpoints)','values(p_day,v_source.nota_generale,v_source.creato_da,true,v_source.id,v_source.route_endpoints,v_source.vehicle_id)');
end $patch$;
