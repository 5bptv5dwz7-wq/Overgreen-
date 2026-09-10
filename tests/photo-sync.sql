begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
-- Read-only reference to a real object, used to verify receipts without writing
-- any Storage object. All manifest/metadata operations below are rolled back.
create temp table v206_object as select o.name,(o.metadata->>'size')::bigint bytes,i.id intervention_id,i.inserito_da actor_id
  from storage.objects o join public.interventions i on 'interventi/'||i.id::text||'/'=substring(o.name from 1 for 48)
  where o.bucket_id='documenti' and o.metadata->>'mimetype' like 'image/%'
    and split_part(o.name,'/',3) ~ '^[0-9a-f-]{36}-' order by o.created_at desc limit 1;
grant select on v206_object to authenticated;
set local role authenticated;
do $$
declare st uuid; iid uuid; pid uuid:=gen_random_uuid(); request_id uuid:=gen_random_uuid(); actor uuid:=auth.uid(); worker uuid;
  req jsonb; photos jsonb; r jsonb; blocked boolean; snapshot jsonb; obj record; photo_id uuid; fname text; before_count integer;
begin
  insert into public.stores(nome) values('V206 QA ROLLBACK') returning id into st;
  req=jsonb_build_object('p_request_id',request_id,'p_store_id',st,'p_item_id',null,'p_day','2099-01-01','p_note','QA',
    'p_next_note','','p_continue',false,'p_workers',jsonb_build_array(actor),'p_photo_count',1,'p_actor_id',actor);
  photos=jsonb_build_array(jsonb_build_object('id',pid,'name','foto.jpg','bytes',123));
  r=public.overgreen_save_ordinary_v206(req,photos);iid=(r->'intervention'->>'id')::uuid;
  assert (select foto_attese=1 and foto_sincronizzate=0 from public.interventions where id=iid),'truthful counts before delivery';
  assert (select count(*)=1 from public.intervention_photo_uploads where intervention_id=iid),'manifest registered atomically';
  assert public.overgreen_save_ordinary_v206(req,photos)=r,'same request idempotent';
  assert (select count(*)=1 from public.intervention_photo_uploads where intervention_id=iid),'no duplicate manifest';
  blocked=false;begin perform public.overgreen_save_ordinary_v206(req,jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'name','other.jpg','bytes',123)));exception when check_violation then blocked=true;end;assert blocked,'cannot replay with different photo IDs';
  blocked=false;begin perform public.overgreen_save_ordinary_v206(req,jsonb_build_array(jsonb_build_object('id',pid,'name','foto.jpg','bytes',0)));exception when check_violation then blocked=true;end;assert blocked,'cannot replay with changed bytes';
  assert (public.overgreen_finalize_photo_v206(pid)->>'received')::boolean=false,'absent object cannot be acknowledged';
  assert (select count(*)=0 from public.attachments where intervention_id=iid),'no phantom attachment';
  perform public.overgreen_photo_event_v206(pid,'retrying',4,'Connessione interrotta QA');
  perform public.overgreen_photo_status_v197(iid);
  assert (select photo_upload_error='Connessione interrotta QA' from public.interventions where id=iid),'metadata refresh retains diagnostic';
  assert (select attempts=4 and last_error='Connessione interrotta QA' from public.intervention_photo_uploads where id=pid),'per-photo diagnostic';
  blocked=false;begin perform public.overgreen_photo_event_v206(pid,'received',5,null);exception when check_violation then blocked=true;end;assert blocked,'client cannot forge receipt';
  blocked=false;begin update public.intervention_photo_uploads set stage='received' where id=pid;exception when insufficient_privilege then blocked=true;end;assert blocked,'direct state writes denied';
  select id into worker from public.profiles where ruolo='dipendente' and attivo limit 1;
  perform set_config('request.jwt.claim.sub',worker::text,true);
  assert (select count(*)=0 from public.intervention_photo_uploads where id=pid),'RLS isolates other work';
  blocked=false;begin perform public.overgreen_finalize_photo_v206(pid);exception when insufficient_privilege then blocked=true;end;assert blocked,'other worker finalizer denied';
  blocked=false;begin perform public.overgreen_photo_event_v206(pid,'retrying',5,'fake');exception when insufficient_privilege then blocked=true;end;assert blocked,'other worker diagnostic denied';
  blocked=false;begin perform public.overgreen_register_photo_v206(gen_random_uuid(),iid,'fake.jpg',2,worker);exception when insufficient_privilege then blocked=true;end;assert blocked,'other worker registration denied';
  perform set_config('request.jwt.claim.sub',actor::text,true);
  -- Existing real object, exact name and size: no upload and no duplicate row.
  select * into obj from v206_object;assert found,'existing Storage reference available';
  photo_id=substring(split_part(obj.name,'/',3) from 1 for 36)::uuid;fname=substring(split_part(obj.name,'/',3) from 38);
  select count(*) into before_count from public.attachments where intervention_id=obj.intervention_id;
  perform public.overgreen_register_photo_v206(photo_id,obj.intervention_id,fname,obj.bytes,obj.actor_id);
  r=public.overgreen_finalize_photo_v206(photo_id);
  assert (r->>'received')::boolean,'exact Storage object acknowledged';
  assert (select count(*)=before_count from public.attachments where intervention_id=obj.intervention_id),'existing attachment not duplicated';
  perform public.overgreen_finalize_photo_v206(photo_id);
  perform public.overgreen_photo_event_v206(photo_id,'retrying',9,'late error');
  assert (select stage='received' and last_error is null from public.intervention_photo_uploads where id=photo_id),'late events cannot undo receipt';
  assert not has_function_privilege('anon','public.overgreen_save_ordinary_v206(jsonb,jsonb)','execute'),'anonymous closure denied';
  assert not has_function_privilege('anon','public.overgreen_finalize_photo_v206(uuid)','execute'),'anonymous receipt denied';
end $$;
rollback;
select 'PASS: atomic manifest, idempotence, immutable photo IDs/bytes, missing object, exact receipt, no duplicate attachment, error retention, stale events, RLS and worker/anon permissions. All test data rolled back.' as result;
