-- Whole-record inserts bypass column defaults. Preserve the existing RPC,
-- permissions and request-id semantics while defaulting omitted/null night hours.
do $migration$
declare
 definition text;
 marker constant text := '  v_extra.creato_da=auth.uid();';
 replacement constant text := E'  v_extra.night_hours=coalesce(v_extra.night_hours,0);\n  v_extra.creato_da=auth.uid();';
begin
 select pg_get_functiondef('public.overgreen_admin_v198(uuid,text,jsonb)'::regprocedure) into definition;
 if strpos(definition,replacement)>0 then return; end if;
 if length(definition)-length(replace(definition,marker,''))<>length(marker) then
  raise exception 'Unexpected admin RPC definition: night-hours patch not applied';
 end if;
 execute replace(definition,marker,replacement);
end;
$migration$;
