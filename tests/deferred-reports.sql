begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $$
declare eid uuid; actor uuid:=auth.uid(); worker uuid; result jsonb; report_id uuid; blocked boolean:=false;
begin
 insert into public.extras(titolo,client_type,nome_esterno,categoria_target,closure_profile) values('V316 QA ROLLBACK','eurospin','QA fixture','verde','eurospin') returning id into eid;
 result:=public.overgreen_close_extra_deferred_v316(eid,jsonb_build_object('stato','in_attesa','closed_by',actor,'closed_at',now(),'giorno_intervento',current_date),array[actor]);
 assert result->>'stato'='completato','admin closure completes without reports';
 assert not exists(select 1 from public.attachments where extra_id=eid),'no placeholder attachments';
 result:=public.save_extra_economics_v202(eid,'{"pricing_mode":"tariffa","pricing_category":"verde","dedicated_trip":false,"operator_count":1,"total_hours":2}'::jsonb,0,null,'verde');
 assert (result->'record'->>'total_hours')::numeric=2,'economics saved before reports';
 insert into public.attachments(extra_id,tipo,storage_path,nome_file) values(eid,'rapportino_eurospin','qa-v316/report.pdf','report.pdf') returning id into report_id;
 assert (select total_hours=2 from public.extra_labor_hours where extra_id=eid),'upload preserves economics';
 result:=public.save_extra_economics_v202(eid,'{"pricing_mode":"tariffa","pricing_category":"verde","dedicated_trip":false,"operator_count":1,"total_hours":2}'::jsonb,1,report_id,'verde');
 assert (result->'record'->>'source_attachment_id')::uuid=report_id,'economics confirmed against uploaded report';
 select id into worker from public.profiles where ruolo='dipendente' and attivo limit 1;
 assert worker is not null,'worker fixture';
 perform set_config('request.jwt.claim.sub',worker::text,true);
 begin perform public.overgreen_close_extra_deferred_v316(eid,'{}',null); exception when insufficient_privilege then blocked:=true; end;
 assert blocked,'worker cannot defer reports';
 assert not has_function_privilege('anon','public.overgreen_close_extra_deferred_v316(uuid,jsonb,uuid[])','EXECUTE'),'anonymous access blocked';
end $$;
rollback;
select 'PASS: deferred admin closure, economics before/after upload, worker denied; fixtures rolled back' as result;
