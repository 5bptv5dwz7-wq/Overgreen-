-- Synthetic data and all audit entries are rolled back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $test$
declare a uuid:=auth.uid(); w uuid; s uuid; request uuid:=gen_random_uuid(); p jsonb; r jsonb; e uuid; sch uuid; e2 uuid; payload jsonb; blocked boolean;
begin
 select id into w from public.profiles where ruolo='dipendente' and attivo limit 1;assert w is not null;
 insert into public.stores(nome,client_type,attivo,cleaning_enabled,cleaning_start) values('TEST V309 ROLLBACK','eurospin',true,true,'2026-01-01') returning id into s;
 p:=jsonb_build_object('day','2026-10-27','members',jsonb_build_array(w),'stores',jsonb_build_array(s),'extras','[]'::jsonb,'cleaning_stores',jsonb_build_array(jsonb_build_object('id',s,'codes',jsonb_build_array('A/1','A/2','D/2'))));
 r:=public.overgreen_cleaning_plan_v309(request,p,false);
 assert public.overgreen_cleaning_plan_v309(request,p,false)=r,'planning retry';
 select id,schedule_id into e,sch from public.extras where store_id=s;
 assert e is not null and sch is not null,'planned visit';
 assert (select count(*)=1 from public.extras where store_id=s),'one shared visit';
 assert not exists(select 1 from public.schedule_items where store_id=s and tipo='ordinario'),'no green intervention';
 assert exists(select 1 from public.extra_workers where extra_id=e and profile_id=w),'assigned team';
 assert (select cleaning_slot=1 from public.extras where id=e),'reserved semester';
 perform set_config('request.jwt.claim.sub',w::text,true);
 payload:=jsonb_build_object('stato','in_attesa','giorno_intervento','2026-10-27','closed_by',w,'closed_at','2026-10-27T12:00:00Z','note_lorenzo','Solo settimanale eseguita');
 r:=public.overgreen_cleaning_close_v309(e,array['A/1','A/2'],payload,null);
 assert (select cleaning_slot is null and cleaning_done_codes=array['A/1','A/2'] from public.extras where id=e),'unused semester released';
 assert (select stato='non_eseguita' from public.extra_work_items where extra_id=e and titolo='D/2'),'planned omitted task recorded';
 assert public.overgreen_cleaning_close_v309(e,array['A/1','A/2'],payload,null)=r,'closure retry';
 perform set_config('request.jwt.claim.sub',a::text,true);
 update public.extras set stato='completato',convalidato_da=a,convalidato_il=now() where id=e;
 assert (select cleaning_slot is null from public.extras where id=e),'approval preserves actual tasks';
 p:=jsonb_build_object('id',sch,'expected_day','2026-10-27','expected_members',jsonb_build_array(w),'stores',jsonb_build_array(s),'extras','[]'::jsonb,'cleaning_stores',jsonb_build_array(jsonb_build_object('id',s,'codes',jsonb_build_array('C/1'))));
 r:=public.overgreen_cleaning_plan_v309(gen_random_uuid(),p,true);
 select id into e2 from public.extras where store_id=s and id<>e;
 assert e2 is not null and (select schedule_id=sch from public.extras where id=e2),'add to existing route';
 perform set_config('request.jwt.claim.sub',w::text,true);
 r:=public.overgreen_cleaning_close_v309(e2,array['C/1','D/2'],payload,null);
 assert (select cleaning_slot=1 and cleaning_done_codes=array['C/1','D/2'] from public.extras where id=e2),'unplanned semester captured by assigned worker';
 blocked:=false;begin perform public.overgreen_cleaning_plan_v309(gen_random_uuid(),p,true);exception when insufficient_privilege then blocked:=true;end;assert blocked,'worker cannot plan';
 assert not has_function_privilege('anon','public.overgreen_cleaning_close_v309(uuid,text[],jsonb,uuid[])','execute'),'anonymous denied';
end $test$;
rollback;
