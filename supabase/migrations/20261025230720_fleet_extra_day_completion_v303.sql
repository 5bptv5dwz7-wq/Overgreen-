do $patch$
declare def text;
begin
 select pg_get_functiondef('overgreen_private.trip_done(uuid)'::regprocedure) into def;
 def=replace(def,'select si.stato::text as state from public.schedule_items si','select case when si.tipo::text=''extra'' then coalesce((select e.stato::text from public.extras e where e.id=si.extra_id),si.stato::text) else si.stato::text end as state from public.schedule_items si');
 execute def;
 select pg_get_functiondef('public.overgreen_capture_mileage_v303(uuid,bigint,jsonb)'::regprocedure) into def;
 def=replace(def,'select stato::text as state from public.schedule_items where schedule_id=s.id and stato::text not in (''annullato'',''riportato'')','select case when si.tipo::text=''extra'' then coalesce((select e.stato::text from public.extras e where e.id=si.extra_id),si.stato::text) else si.stato::text end as state from public.schedule_items si where si.schedule_id=s.id and si.stato::text not in (''annullato'',''riportato'')');
 execute def;
end $patch$;
