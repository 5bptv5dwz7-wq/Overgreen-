-- Exercise the same RPC as Crea extra, with actual authenticated RLS.
-- Synthetic data and request records are always rolled back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $test$
declare
 eid uuid; rid uuid; payload jsonb; result jsonb; hours jsonb; expected numeric;
begin
 foreach hours in array array['{}'::jsonb,'{"night_hours":null}'::jsonb,'{"night_hours":0}'::jsonb,'{"night_hours":2.5}'::jsonb] loop
  eid:=gen_random_uuid(); rid:=gen_random_uuid();
  payload:=jsonb_build_object('extra',jsonb_build_object('id',eid,'titolo','V224 QA ROLLBACK','nome_esterno','QA extra creation','categoria_target','pulizie')||hours,
   'members','[]'::jsonb,'work_items',jsonb_build_array(jsonb_build_object('titolo','QA work item')),
   'attachment',jsonb_build_object('id',gen_random_uuid(),'storage_path','extra/'||eid||'/qa.pdf','nome_file','qa.pdf','mime_type','application/pdf','dimensione_bytes',1));
  result:=public.overgreen_admin_v198(rid,'extra_create',payload);
  expected:=coalesce((hours->>'night_hours')::numeric,0);
  assert result->>'id'=eid::text,'RPC returns created extra';
  assert (select night_hours=expected from public.extras where id=eid),'missing/null defaults to zero; explicit value preserved';
  assert (select count(*)=1 from public.attachments where extra_id=eid),'attachment saved';
  assert (select count(*)=1 from public.extra_work_items where extra_id=eid),'work item saved';
  assert public.overgreen_admin_v198(rid,'extra_create',payload)=result,'retry returns same extra';
  assert (select count(*)=1 from public.attachments where extra_id=eid),'retry cannot duplicate attachment';
 end loop;
end;
$test$;
rollback;
select 'PASS V224: extra creation, omitted/null/zero/partial night hours, attachments, work items and idempotent retry; fixtures rolled back' as result;
