-- Synthetic records only; all writes (including audit rows) roll back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $test$
declare
 eid uuid; data jsonb; saved jsonb; again jsonb; equipment boolean; night numeric; expected numeric;
 blocked boolean; rev bigint:=0; old_night numeric; worker uuid;
begin
 insert into public.extras(titolo,nome_esterno,client_type,categoria_target,night_hours)
 values('V223 QA ROLLBACK','QA night hours','eurospin','pulizie',2.5) returning id into eid;
 data:='{"total_hours":6,"night_hours":2.5,"expected_night_hours":2.5,"pricing_mode":"tariffa","pricing_category":"pulizie","dedicated_trip":false,"operator_count":2,"equipment":false,"expenses":[]}'::jsonb;
 foreach equipment in array array[false,true] loop
  foreach night in array array[0::numeric,2.5,6] loop
   select night_hours into old_night from public.extras where id=eid;
   data:=data||jsonb_build_object('equipment',equipment,'night_hours',night,'expected_night_hours',old_night);
   saved:=public.save_extra_economics_v202(eid,data,rev,null,'pulizie');
   expected:=((6-night)*(case when equipment then 23 else 18 end)+night*(case when equipment then 30 else 25 end))*100;
   assert (saved->'calculation'->>'total')::numeric=expected,'mixed night/day exact total';
   assert (saved->'calculation'->>'dayHours')::numeric=6-night,'day split';
   assert (saved->'record'->>'night_hourly_rate')::numeric=case when equipment then 30 else 25 end,'night tariff';
   assert (select night_hours=night from public.extras where id=eid),'operational hours synchronized';
   again:=public.save_extra_economics_v202(eid,data,rev,null,'pulizie');assert again=saved,'retry is idempotent';
   rev:=(saved->'record'->>'revision')::bigint;
  end loop;
 end loop;
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data||'{"night_hours":7}'::jsonb,rev,null,'pulizie'); exception when invalid_parameter_value then blocked:=true; end;
 assert blocked,'night cannot exceed crew total';
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data||'{"night_hours":1.333}'::jsonb,rev,null,'pulizie'); exception when invalid_parameter_value then blocked:=true; end;
 assert blocked,'precision rejected before rounding';
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data||'{"night_hourly_rate":1}'::jsonb,rev,null,'pulizie'); exception when invalid_parameter_value then blocked:=true; end;
 assert blocked,'rates cannot be spoofed';
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data||'{"expected_night_hours":1}'::jsonb,rev,null,'pulizie'); exception when serialization_failure then blocked:=true; end;
 assert blocked,'concurrent closure change rejected';
 -- An older economics client may omit new keys; it must preserve the split.
 data:=data-array['night_hours','expected_night_hours'];
 saved:=public.save_extra_economics_v202(eid,data,rev,null,'pulizie');
 assert (saved->'record'->>'night_hours')::numeric=6,'old client preserves night hours';
 rev:=(saved->'record'->>'revision')::bigint;
 -- A quote replaces hourly labor, including night work; discount still applies.
 data:=data||'{"pricing_mode":"preventivo","quote_amount":1000,"quote_status":"accettato","discount_amount":20}'::jsonb;
 saved:=public.save_extra_economics_v202(eid,data,rev,null,'pulizie');
 assert (saved->'calculation'->>'total')::numeric=98000,'quote does not add night labor';
 rev:=(saved->'record'->>'revision')::bigint;
 -- Blank total remains a draft for hourly work, rather than zero hours.
 data:=data||'{"pricing_mode":"tariffa","total_hours":null,"discount_amount":0}'::jsonb;
 saved:=public.save_extra_economics_v202(eid,data,rev,null,'pulizie');
 assert saved->'calculation'->'total'='null'::jsonb,'blank total remains incomplete';
 select id into worker from public.profiles where ruolo='dipendente' and attivo limit 1;
 assert worker is not null,'worker fixture';
 perform set_config('request.jwt.claim.sub',worker::text,true);
 assert (select count(*)=0 from public.extra_labor_hours where extra_id=eid),'workers cannot read prices';
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data,0,null,'pulizie'); exception when insufficient_privilege then blocked:=true; end;
 assert blocked,'workers cannot call economics RPC';
 assert not has_function_privilege('anon','public.save_extra_economics_v202(uuid,jsonb,bigint,uuid,text)','execute'),'anonymous RPC blocked';
end;
$test$;
rollback;
select 'PASS V223: mixed/full night work, tariffs, exact totals, quotes, drafts, retries, conflicts, old clients and permissions; fixtures rolled back' as result;
