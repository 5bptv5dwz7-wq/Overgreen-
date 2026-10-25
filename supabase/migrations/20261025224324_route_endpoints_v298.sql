-- Optional departure/return metadata; existing access policies remain unchanged.
create or replace function public.overgreen_valid_route_endpoints_v298(value jsonb)
returns boolean language plpgsql immutable security invoker
set search_path=public,pg_temp as $$
declare k text; p jsonb;
begin
 if value is null or jsonb_typeof(value)<>'object' then return false; end if;
 for k,p in select * from jsonb_each(value) loop
  if k not in ('start','end') then return false; end if;
  if p='null'::jsonb then continue; end if;
  if jsonb_typeof(p)<>'object' then return false; end if;
  if coalesce(jsonb_typeof(p->'label'),'')<>'string' or coalesce(jsonb_typeof(p->'lat'),'')<>'number' or coalesce(jsonb_typeof(p->'lon'),'')<>'number' then return false; end if;
  if length(trim(p->>'label'))=0 or length(p->>'label')>500 then return false; end if;
  if (p->>'lat')::numeric not between -90 and 90 or (p->>'lon')::numeric not between -180 and 180 then return false; end if;
 end loop;
 return true;
end $$;
revoke all on function public.overgreen_valid_route_endpoints_v298(jsonb) from public,anon;
grant execute on function public.overgreen_valid_route_endpoints_v298(jsonb) to authenticated,service_role;
alter table public.schedules add column route_endpoints jsonb not null default '{}'::jsonb;
alter table public.saved_routes add column route_endpoints jsonb not null default '{}'::jsonb;
alter table public.schedules add constraint schedules_route_endpoints_v298 check(public.overgreen_valid_route_endpoints_v298(route_endpoints));
alter table public.saved_routes add constraint saved_routes_route_endpoints_v298 check(public.overgreen_valid_route_endpoints_v298(route_endpoints));
do $patch$
declare definition text;
 old_insert text := $old$insert into schedules(giorno,nota_generale,creato_da,auto_rollover)
  values(v_day,p_payload->>'note',auth.uid(),coalesce((p_payload->>'auto_rollover')::boolean,true)) returning id into v_id;$old$;
 new_insert text := $new$insert into schedules(giorno,nota_generale,creato_da,auto_rollover,route_endpoints)
  values(v_day,p_payload->>'note',auth.uid(),coalesce((p_payload->>'auto_rollover')::boolean,true),coalesce(p_payload->'route_endpoints','{}'::jsonb)) returning id into v_id;$new$;
begin
 select pg_get_functiondef('public.overgreen_admin_v198(uuid,text,jsonb)'::regprocedure) into definition;
 if strpos(definition,old_insert)=0 then raise exception 'Scheduler definition changed: inspect before applying'; end if;
 execute replace(definition,old_insert,new_insert);
 select pg_get_functiondef('public.overgreen_rollover_target_v197(uuid,date)'::regprocedure) into definition;
 if strpos(definition,'insert into public.schedules(giorno,nota_generale,creato_da,auto_rollover,rollover_from)')=0 or strpos(definition,'values(p_day,v_source.nota_generale,v_source.creato_da,true,v_source.id)')=0 then raise exception 'Rollover definition changed: inspect before applying'; end if;
 definition=replace(definition,'insert into public.schedules(giorno,nota_generale,creato_da,auto_rollover,rollover_from)','insert into public.schedules(giorno,nota_generale,creato_da,auto_rollover,rollover_from,route_endpoints)');
 execute replace(definition,'values(p_day,v_source.nota_generale,v_source.creato_da,true,v_source.id)','values(p_day,v_source.nota_generale,v_source.creato_da,true,v_source.id,v_source.route_endpoints)');
end $patch$;
