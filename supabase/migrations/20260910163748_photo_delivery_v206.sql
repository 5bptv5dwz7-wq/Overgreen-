-- V206. Photo manifests are registered with the closure, then acknowledged only
-- after the exact Storage object and attachment have been verified server-side.
alter table public.overgreen_save_requests_v197 add column photo_manifest jsonb;
create table public.intervention_photo_uploads (
  id uuid primary key,
  intervention_id uuid not null references public.interventions(id) on delete cascade,
  actor_id uuid not null references public.profiles(id),
  file_name text not null,
  expected_bytes bigint not null check (expected_bytes>=0),
  storage_path text not null unique,
  stage text not null default 'queued' check(stage in ('queued','uploading','retrying','blocked','received')),
  attempts integer not null default 0 check(attempts>=0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  received_at timestamptz
);
create index intervention_photo_uploads_intervention_idx on public.intervention_photo_uploads(intervention_id);
create index intervention_photo_uploads_actor_idx on public.intervention_photo_uploads(actor_id);
alter table public.intervention_photo_uploads enable row level security;
revoke all on public.intervention_photo_uploads from public,anon,authenticated;
grant select on public.intervention_photo_uploads to authenticated;
create policy photo_delivery_read on public.intervention_photo_uploads for select to authenticated
  using (public.can_access_intervention(intervention_id));
create trigger audit_photo_delivery after insert or update or delete on public.intervention_photo_uploads
  for each row execute function public.audit_table_change();

create function public.overgreen_register_photo_v206(p_id uuid,p_intervention_id uuid,p_name text,p_bytes bigint,p_actor_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.intervention_photo_uploads; safe text; path text;
begin
  if auth.uid() is null or not public.is_active_user() or not public.can_access_intervention(p_intervention_id)
    or (p_actor_id is distinct from auth.uid() and not public.is_admin()) then raise exception 'Foto non autorizzata' using errcode='42501'; end if;
  if p_id is null or p_actor_id is null or p_bytes is null or p_bytes<0 or p_bytes>52428800
    or nullif(trim(p_name),'') is null or length(p_name)>255 then raise exception 'Dati foto non validi' using errcode='23514'; end if;
  safe=regexp_replace(p_name,'[^a-zA-Z0-9._-]','-','g');
  path='interventi/'||p_intervention_id::text||'/'||p_id::text||'-'||safe;
  insert into public.intervention_photo_uploads(id,intervention_id,actor_id,file_name,expected_bytes,storage_path)
    values(p_id,p_intervention_id,p_actor_id,p_name,p_bytes,path) on conflict(id) do nothing;
  select * into strict v from public.intervention_photo_uploads where id=p_id;
  if v.intervention_id<>p_intervention_id or v.actor_id<>p_actor_id or v.storage_path<>path
    or (v.expected_bytes<>p_bytes and p_bytes<>0) then raise exception 'Identificativo foto già usato con dati diversi' using errcode='23514'; end if;
  return to_jsonb(v);
end $$;

create function public.overgreen_save_ordinary_v206(p_request jsonb,p_photos jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; p jsonb; workers uuid[]; count_photos integer; saved_manifest jsonb;
begin
  if auth.uid() is null or not public.is_active_user() then raise exception 'Accesso non autorizzato' using errcode='42501'; end if;
  if jsonb_typeof(p_photos) is distinct from 'array' then raise exception 'Elenco foto non valido' using errcode='23514'; end if;
  count_photos=jsonb_array_length(p_photos);
  if count_photos<>(p_request->>'p_photo_count')::integer or count_photos>1000
    or (select count(distinct x->>'id') from jsonb_array_elements(p_photos) x)<>count_photos then raise exception 'Conteggio foto non valido' using errcode='23514'; end if;
  select array_agg(x::uuid) into workers from jsonb_array_elements_text(p_request->'p_workers') x;
  result=public.overgreen_save_ordinary_v197((p_request->>'p_request_id')::uuid,(p_request->>'p_store_id')::uuid,
    (p_request->>'p_item_id')::uuid,(p_request->>'p_day')::date,p_request->>'p_note',p_request->>'p_next_note',
    (p_request->>'p_continue')::boolean,workers,count_photos,(p_request->>'p_actor_id')::uuid);
  select photo_manifest into saved_manifest from public.overgreen_save_requests_v197 where request_id=(p_request->>'p_request_id')::uuid;
  if saved_manifest is not null and saved_manifest<>p_photos then raise exception 'Richiesta già usata con foto diverse' using errcode='23514'; end if;
  update public.overgreen_save_requests_v197 set photo_manifest=p_photos where request_id=(p_request->>'p_request_id')::uuid and photo_manifest is null;
  for p in select * from jsonb_array_elements(p_photos) loop
    if coalesce((p->>'bytes')::bigint,0)<=0 then raise exception 'Foto vuota' using errcode='23514'; end if;
    perform public.overgreen_register_photo_v206((p->>'id')::uuid,(result->'intervention'->>'id')::uuid,
      p->>'name',(p->>'bytes')::bigint,(p_request->>'p_actor_id')::uuid);
  end loop;
  return result;
end $$;

create function public.overgreen_photo_event_v206(p_id uuid,p_stage text,p_attempt integer,p_error text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.intervention_photo_uploads;
begin
  select * into strict v from public.intervention_photo_uploads where id=p_id;
  if auth.uid() is null or not public.is_active_user() or not public.can_access_intervention(v.intervention_id)
    or (v.actor_id<>auth.uid() and not public.is_admin()) then raise exception 'Foto non autorizzata' using errcode='42501'; end if;
  if p_stage is null or p_stage not in ('queued','uploading','retrying','blocked') or p_attempt is null or p_attempt<0 then raise exception 'Stato foto non valido' using errcode='23514'; end if;
  perform 1 from public.interventions where id=v.intervention_id for update;
  select * into strict v from public.intervention_photo_uploads where id=p_id for update;
  if v.stage='received' then return to_jsonb(v); end if;
  update public.intervention_photo_uploads set stage=p_stage,attempts=greatest(attempts,p_attempt),
    last_error=coalesce(nullif(left(p_error,500),''),last_error),updated_at=now() where id=p_id returning * into v;
  perform public.overgreen_photo_status_v197(v.intervention_id,
    case p_stage when 'uploading' then 'syncing' when 'blocked' then 'error' else 'pending' end,p_error);
  return to_jsonb(v);
end $$;

create function public.overgreen_finalize_photo_v206(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.intervention_photo_uploads; obj storage.objects; a public.attachments; i jsonb;
begin
  select * into strict v from public.intervention_photo_uploads where id=p_id;
  if auth.uid() is null or not public.is_active_user() or not public.can_access_intervention(v.intervention_id) then raise exception 'Foto non autorizzata' using errcode='42501'; end if;
  -- Every finalizer takes the intervention lock before a photo lock, preventing
  -- duplicate attachments and preserving the same order as photo status updates.
  perform 1 from public.interventions where id=v.intervention_id for update;
  select * into strict v from public.intervention_photo_uploads where id=p_id for update;
  select * into obj from storage.objects where bucket_id='documenti' and name=v.storage_path;
  if not found then return jsonb_build_object('received',false); end if;
  if coalesce((obj.metadata->>'size')::bigint,0)<=0
    or (v.expected_bytes>0 and (obj.metadata->>'size')::bigint<>v.expected_bytes)
    or coalesce(obj.metadata->>'mimetype','') not like 'image/%' then raise exception 'File ricevuto incompleto o non valido' using errcode='23514'; end if;
  select * into a from public.attachments where intervention_id=v.intervention_id and storage_path=v.storage_path and tipo='foto_generica' order by created_at limit 1;
  if not found then
    insert into public.attachments(intervention_id,tipo,storage_path,nome_file,mime_type,dimensione_bytes,caricato_da)
      values(v.intervention_id,'foto_generica',v.storage_path,v.file_name,obj.metadata->>'mimetype',(obj.metadata->>'size')::bigint,v.actor_id) returning * into a;
  end if;
  if v.stage<>'received' then
    update public.intervention_photo_uploads set stage='received',last_error=null,received_at=coalesce(received_at,now()),updated_at=now() where id=p_id;
  end if;
  i=public.overgreen_photo_status_v197(v.intervention_id);
  return jsonb_build_object('received',true,'attachment',to_jsonb(a),'intervention',i);
end $$;

create function public.overgreen_reconcile_photos_v206(p_intervention_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare photo record; r jsonb; rows jsonb:='[]'::jsonb; i jsonb;
begin
  if auth.uid() is null or not public.is_active_user() or not public.can_access_intervention(p_intervention_id) then raise exception 'Intervento non autorizzato' using errcode='42501'; end if;
  for photo in select id from public.intervention_photo_uploads where intervention_id=p_intervention_id and stage<>'received' order by id loop
    r=public.overgreen_finalize_photo_v206(photo.id);
    if (r->>'received')::boolean then rows=rows||jsonb_build_array(r->'attachment'); end if;
  end loop;
  select to_jsonb(x) into i from public.interventions x where id=p_intervention_id;
  return jsonb_build_object('intervention',i,'attachments',rows);
end $$;

revoke execute on function public.overgreen_register_photo_v206(uuid,uuid,text,bigint,uuid) from public,anon;
revoke execute on function public.overgreen_save_ordinary_v206(jsonb,jsonb) from public,anon;
revoke execute on function public.overgreen_photo_event_v206(uuid,text,integer,text) from public,anon;
revoke execute on function public.overgreen_finalize_photo_v206(uuid) from public,anon;
revoke execute on function public.overgreen_reconcile_photos_v206(uuid) from public,anon;
grant execute on function public.overgreen_register_photo_v206(uuid,uuid,text,bigint,uuid) to authenticated;
grant execute on function public.overgreen_save_ordinary_v206(jsonb,jsonb) to authenticated;
grant execute on function public.overgreen_photo_event_v206(uuid,text,integer,text) to authenticated;
grant execute on function public.overgreen_finalize_photo_v206(uuid) to authenticated;
grant execute on function public.overgreen_reconcile_photos_v206(uuid) to authenticated;

-- Preserve useful errors through metadata refreshes; clear only on full receipt.
create or replace function public.overgreen_photo_status_v197(p_id uuid,p_status text default null,p_error text default null,p_notified boolean default false)
returns jsonb language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_row public.interventions%rowtype; v_actual integer; v_status text;
begin
  if not public.can_access_intervention(p_id) then raise exception 'Intervento non accessibile'; end if;
  select * into strict v_row from public.interventions where id=p_id for update;
  select count(distinct storage_path) into v_actual from public.attachments where intervention_id=p_id and tipo='foto_generica';
  v_status=coalesce(p_status,v_row.photo_upload_status);
  if v_status not in ('none','pending','syncing','synced','error') then raise exception 'Stato foto non valido'; end if;
  if v_status in ('none','synced') and v_actual<v_row.foto_attese then v_status='pending'; end if;
  if v_actual>=v_row.foto_attese then v_status=case when v_actual=0 then 'none' else 'synced' end; end if;
  update public.interventions set foto_sincronizzate=v_actual,photo_upload_status=v_status,
    photo_upload_error=case when v_actual>=v_row.foto_attese then null else coalesce(nullif(left(p_error,500),''),v_row.photo_upload_error) end,
    photo_upload_updated_at=case when p_status is not null or v_actual<>v_row.foto_sincronizzate or p_error is not null then now() else v_row.photo_upload_updated_at end,
    photo_sync_notified_at=case when p_notified and not multi_day_open and stato in ('in_attesa','convalidato')
      and v_actual>=foto_attese and (closed_by=auth.uid() or public.is_admin()) then coalesce(photo_sync_notified_at,now()) else photo_sync_notified_at end
    where id=p_id returning * into v_row;
  return to_jsonb(v_row);
end $$;
