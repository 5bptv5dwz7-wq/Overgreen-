begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $$
declare eid uuid:=gen_random_uuid(); wid uuid; a uuid:=auth.uid(); d date:=(now() at time zone 'Europe/Rome')::date+3; aid uuid:=gen_random_uuid(); x jsonb;
begin
 x=public.overgreen_admin_v198(gen_random_uuid(),'extra_create',jsonb_build_object('extra',jsonb_build_object('id',eid,'titolo','V235 QA ROLLBACK','nome_esterno','TEST','execution_date_mode','on','execution_date',d),'members','[]'::jsonb,'work_items','[]'::jsonb,'attachment',jsonb_build_object('id',aid,'storage_path','extra/'||eid::text||'/request.pdf','nome_file','test.pdf','mime_type','application/pdf','dimensione_bytes',1)));
 assert (select execution_date_mode='on' and execution_date=d and deadline_at is null from public.extras where id=eid),'creation RPC preserves precise date';
 update public.extras set giorno_intervento=d+1 where id=eid;
 assert (select execution_date=d from public.extras where id=eid),'rescheduling preserves date rule';
 select id into wid from public.profiles where ruolo<>'admin' and attivo limit 1;
 insert into public.extra_workers(extra_id,profile_id) values(eid,wid);
 perform set_config('request.jwt.claim.sub',wid::text,true);
 assert (select execution_date=d from public.extras where id=eid),'employee reads rule';
 begin update public.extras set execution_date=d+1 where id=eid;raise exception 'FAIL employee changed rule';exception when insufficient_privilege then null;end;
 update public.extras set note_lorenzo='Normal progress',stato='da_integrare' where id=eid;
 assert (select stato='da_integrare' from public.extras where id=eid),'employee progress remains possible';
 perform set_config('request.jwt.claim.sub',a::text,true);
 update public.extras set execution_date_mode='not_before' where id=eid;
 assert (select execution_date_mode='not_before' from public.extras where id=eid),'minimum date saved';
 begin update public.extras set execution_date=null where id=eid;raise exception 'FAIL incomplete rule accepted';exception when check_violation then null;end;
 update public.extras set execution_date=null,execution_date_mode=null,deadline_at=now()+interval '2 days' where id=eid;
 assert (select deadline_at is not null from public.extras where id=eid),'legacy deadline supported';
end $$;
rollback;
