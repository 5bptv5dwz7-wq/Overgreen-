-- Disposable fixtures only; always run inside this rollback transaction.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $$
declare e uuid; d1 uuid:=gen_random_uuid(); d2 uuid:=gen_random_uuid(); d3 uuid:=gen_random_uuid(); actor uuid:=auth.uid(); worker uuid; r jsonb; blocked boolean;
begin
 insert into public.extras(titolo,client_type,nome_esterno,categoria_target,closure_profile) values('V328 QA ROLLBACK','eurospin','QA fixture','manutenzioni','eurospin') returning id into e;
 r=public.overgreen_close_extra_day_v319(e,jsonb_build_object('stato','da_integrare','giorno_intervento',current_date,'note_lorenzo','First','technician_count',5,'work_start','22:00','work_end','02:30'),array[actor],d1,'{}');
 assert r->>'technician_count'='5' and r->>'work_start'='22:00:00';
 r=public.overgreen_close_extra_day_v319(e,jsonb_build_object('stato','da_integrare','giorno_intervento',current_date),array[actor],d1,'{}');
 assert r->>'technician_count'='5','idempotent retry preserves details';
 select id into worker from public.profiles where ruolo='dipendente' and attivo limit 1;
 if worker is not null then
  insert into public.extra_workers(extra_id,profile_id) values(e,worker);
  perform set_config('request.jwt.claim.sub',worker::text,true);
  r=public.overgreen_close_extra_day_v319(e,jsonb_build_object('stato','da_integrare','giorno_intervento',current_date,'note_lorenzo','Worker day','technician_count',3,'work_start','08:00','work_end','16:00'),null,d2,'{}');
  assert r->>'technician_count'='3','assigned employee can save details';
  blocked=false;begin perform public.edit_extra_day_v328(d1,1,current_date,'forbidden',array[worker],'{}','[]','{}');exception when others then blocked=true;end;assert blocked,'employee cannot edit saved admin day';
  perform set_config('request.jwt.claim.sub',actor::text,true);
 end if;
 r=public.overgreen_close_extra_day_v319(e,jsonb_build_object('stato','in_attesa','giorno_intervento',current_date,'note_lorenzo','Final','closed_by',actor,'closed_at',now()),array[actor],d3,'{}',true);
 assert r->>'technician_count' is null and r->>'work_start' is null,'blank optional fields accepted on final closure';
 assert (select technician_count=5 and work_end=time '02:30' from public.extra_work_days where id=d1),'other days unchanged';
 perform public.edit_extra_day_v328(d1,1,current_date,'Edited',array[actor],'{}','[]','{"technician_count":6,"work_start":"09:00","work_end":"17:30"}');
 assert (select technician_count=6 and revision=2 from public.extra_work_days where id=d1);
 blocked=false;begin perform public.edit_extra_day_v328(d1,2,current_date,'Invalid',array[actor],'{}','[]','{"technician_count":0}');exception when check_violation then blocked=true;end;assert blocked;
 assert (select notes='Edited' and revision=2 from public.extra_work_days where id=d1),'failed edit atomic';
 perform public.edit_extra_day_v328(d1,2,current_date,'Cleared',array[actor],'{}','[]','{}');
 assert (select technician_count is null and work_start is null from public.extra_work_days where id=d1);
 assert not exists(select 1 from public.extra_labor_hours where extra_id=e),'economics untouched';
 assert not exists(select 1 from public.extra_day_economics where day_id in(d1,d2,d3)),'daily economics untouched';
 assert not has_function_privilege('anon','public.edit_extra_day_v328(uuid,bigint,date,text,uuid[],uuid[],jsonb,jsonb)','execute');
end $$;
rollback;
