-- Run after V319 schema, inside a transaction; fixtures always roll back.
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $$
declare eid uuid; d1 uuid:=gen_random_uuid(); d2 uuid:=gen_random_uuid(); actor uuid:=auth.uid(); worker uuid; a1 uuid; a2 uuid; result jsonb; values1 jsonb; blocked boolean; n integer;
begin
 insert into public.extras(titolo,client_type,nome_esterno,categoria_target,closure_profile) values('V319 QA ROLLBACK','eurospin','QA fixture','manutenzioni','eurospin') returning id into eid;
 insert into public.attachments(extra_id,tipo,storage_path,nome_file) values(eid,'rapportino_eurospin','extra/'||eid||'/qa-day.pdf','giornata-1.pdf') returning id into a1;
 perform public.overgreen_close_extra_day_v319(eid,jsonb_build_object('stato','da_integrare','giorno_intervento','2026-10-30','note_lorenzo','Prima giornata','night_hours',2),array[actor],d1,array[a1]);
 assert (select stato='da_integrare' from public.extras where id=eid),'target stays open';
 perform public.overgreen_close_extra_day_v319(eid,jsonb_build_object('stato','da_integrare','giorno_intervento','2026-10-30','note_lorenzo','Prima giornata','night_hours',2),array[actor],d1,array[a1]);
 assert (select count(*)=1 from public.extra_work_days where extra_id=eid),'retry idempotent';
 values1='{"pricing_mode":"tariffa","pricing_category":"manutenzioni","total_hours":10,"night_hours":2,"expected_night_hours":2,"operator_count":2,"equipment":true,"dedicated_trip":true,"expenses":[{"description":"Materiali","amount":12}],"discount_amount":5}'::jsonb;
 result=public.save_extra_day_economics_v319(d1,values1,0,a1,'manutenzioni');
 assert (result->'record'->>'total_hours')::numeric=10,'day hours saved';
 assert (result->'calculation'->>'total')::numeric=45300,'night, equipment, trip, expenses, discount exact';
 assert not exists(select 1 from public.extra_labor_hours where extra_id=eid),'daily save does not overwrite target economics';
 delete from public.attachments where id=a1;
 assert (select attachments->0->>'nome_file'='giornata-1.pdf' from public.extra_work_days where id=d1),'snapshot retained after active report replacement';
 insert into public.attachments(extra_id,tipo,storage_path,nome_file) values(eid,'foto_generica','extra/'||eid||'/qa.jpg','giornata-2.jpg') returning id into a2;
 perform public.overgreen_close_extra_day_v319(eid,jsonb_build_object('stato','da_integrare','giorno_intervento','2026-10-31','note_lorenzo','Seconda giornata','night_hours',0),array[actor],d2,array[a2]);
 assert (select count(*)=2 from public.extra_work_days where extra_id=eid),'two distinct days';
 result=public.save_extra_day_economics_v319(d2,values1||'{"total_hours":4,"night_hours":0,"expected_night_hours":0,"dedicated_trip":false}',0,null,'manutenzioni');
 assert (select (record->>'total_hours')::numeric=10 from public.extra_day_economics where day_id=d1),'other day unchanged';
 blocked=false;begin perform public.save_extra_day_economics_v319(d1,values1||'{"total_hours":11}',0,a1,'manutenzioni');exception when serialization_failure then blocked=true;end;
 assert blocked,'stale save rejected';
 select id into worker from public.profiles where ruolo='dipendente' and attivo limit 1;
 perform set_config('request.jwt.claim.sub',worker::text,true);
 select count(*) into n from public.extra_day_economics where day_id in(d1,d2);assert n=0,'workers cannot read finances';
 blocked=false;begin perform public.save_extra_day_economics_v319(d1,values1,1,a1,'manutenzioni');exception when insufficient_privilege then blocked=true;end;assert blocked,'worker financial RPC denied';
 assert not has_table_privilege('anon','public.extra_day_economics','SELECT'),'anonymous cannot read finances';
end $$;
reset role;
