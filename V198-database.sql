-- V198: additive schema, transactional administrator operations, recoverable retries.
alter table public.work_contacts add column if not exists client_type text;
alter table public.work_contacts add column if not exists attivo boolean not null default true;
alter table public.work_contacts add column if not exists creato_da uuid references public.profiles(id);
create index if not exists work_contacts_creato_da_idx on public.work_contacts(creato_da);

create table public.overgreen_requests_v198 (
 request_id uuid primary key, actor_id uuid not null references public.profiles(id),
 operation text not null, payload jsonb not null, response jsonb, created_at timestamptz not null default now()
);
alter table public.overgreen_requests_v198 enable row level security;
revoke all on public.overgreen_requests_v198 from anon;
grant select,insert,update on public.overgreen_requests_v198 to authenticated;
create policy request_admin on public.overgreen_requests_v198 for all to authenticated
 using(actor_id=(select auth.uid()) and (select public.is_admin()))
 with check(actor_id=(select auth.uid()) and (select public.is_admin()));
create index on public.overgreen_requests_v198(actor_id);

create policy v198_owned_upload_retry on storage.objects for update to authenticated
 using(bucket_id='documenti' and owner_id=(select auth.uid())::text
 and split_part(name,'/',1) in ('extra','extra-work','attivita') and public.can_access_document_path(name))
 with check(bucket_id='documenti' and owner_id=(select auth.uid())::text
 and split_part(name,'/',1) in ('extra','extra-work','attivita') and public.can_access_document_path(name));

create or replace function public.overgreen_admin_v198(p_request_id uuid,p_operation text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare
 v_result jsonb; v_request public.overgreen_requests_v198; v_id uuid; v_sid uuid;
 v_day date; v_old_day date; v_members uuid[]; v_stores uuid[]; v_extras uuid[]; v_items uuid[];
 v_item public.schedule_items; v_extra public.extras; v_contact public.work_contacts;
 v_intervention public.interventions; v_json jsonb; v_pos integer:=0; v_linked integer:=0; v_paths jsonb;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Operazione riservata agli amministratori attivi'; end if;
 if p_request_id is null then raise exception 'Identificativo richiesta obbligatorio'; end if;
 insert into public.overgreen_requests_v198(request_id,actor_id,operation,payload)
 values(p_request_id,auth.uid(),p_operation,p_payload) on conflict do nothing;
 select * into v_request from public.overgreen_requests_v198 where request_id=p_request_id for update;
 if not found or v_request.actor_id<>auth.uid() or v_request.operation<>p_operation or v_request.payload<>p_payload then
  raise exception 'Richiesta già utilizzata con dati differenti';
 end if;
 if v_request.response is not null then return v_request.response; end if;
 select coalesce(array_agg(distinct x::uuid order by x::uuid),'{}') into v_members from jsonb_array_elements_text(coalesce(p_payload->'members','[]')) x;
 if exists(select 1 from unnest(v_members) x where not exists(select 1 from profiles where id=x and attivo)) then raise exception 'Componente squadra non valido o disattivato'; end if;
 v_id=nullif(p_payload->>'id','')::uuid;
 if p_operation='contact' then
  v_contact=jsonb_populate_record(null::public.work_contacts,p_payload->'contact');
  v_id=coalesce(v_id,gen_random_uuid());
  if nullif(trim(v_contact.nome),'') is null then raise exception 'Nome obbligatorio'; end if;
  insert into work_contacts(id,nome,azienda,ruolo,telefono,email,competenze,note,client_type,attivo,creato_da)
  values(v_id,v_contact.nome,v_contact.azienda,v_contact.ruolo,v_contact.telefono,v_contact.email,v_contact.competenze,v_contact.note,v_contact.client_type,true,auth.uid())
  on conflict(id) do update set nome=excluded.nome,azienda=excluded.azienda,ruolo=excluded.ruolo,telefono=excluded.telefono,email=excluded.email,competenze=excluded.competenze,note=excluded.note,client_type=excluded.client_type,updated_at=now();
  delete from contact_stores where contact_id=v_id;
  insert into contact_stores(contact_id,store_id) select v_id,x::uuid from jsonb_array_elements_text(p_payload->'stores') x;
  v_result=jsonb_build_object('id',v_id);
 elsif p_operation='schedule_create' then
  v_day=(p_payload->>'day')::date;
  if v_day is null or cardinality(v_members)=0 then raise exception 'Data e squadra obbligatorie'; end if;
  select coalesce(array_agg(x::uuid),'{}') into v_stores from jsonb_array_elements_text(p_payload->'stores') x;
  select coalesce(array_agg(x::uuid),'{}') into v_extras from jsonb_array_elements_text(p_payload->'extras') x;
  if cardinality(v_stores)+cardinality(v_extras)=0 then raise exception 'Seleziona sedi o extra'; end if;
  insert into schedules(giorno,nota_generale,creato_da,auto_rollover)
  values(v_day,p_payload->>'note',auth.uid(),coalesce((p_payload->>'auto_rollover')::boolean,true)) returning id into v_id;
  insert into schedule_members select v_id,x from unnest(v_members) x;
  foreach v_sid in array v_stores loop
   v_pos=v_pos+1;
   insert into schedule_items(schedule_id,tipo,store_id,posizione,stato) values(v_id,'ordinario',v_sid,v_pos,'da_fare') returning * into v_item;
   for v_extra in select * from extras where store_id=v_sid and con_ordinario and schedule_item_id is null and stato::text not in ('completato','in_attesa','annullato') for update loop
    update extras set schedule_item_id=v_item.id,schedule_id=v_id,giorno_intervento=v_day where id=v_extra.id;
    delete from extra_workers where extra_id=v_extra.id;
    insert into extra_workers select v_extra.id,x from unnest(v_members) x;
    v_linked=v_linked+1;
   end loop;
  end loop;
  foreach v_sid in array v_extras loop
   select * into v_extra from extras where id=v_sid for update;
   if not found or v_extra.stato::text in ('completato','in_attesa','annullato') then raise exception 'Extra non disponibile'; end if;
   if v_extra.schedule_item_id is not null then raise exception 'Extra già collegato a un ordinario: aggiorna la selezione'; end if;
   v_pos=v_pos+1;
   update extras set schedule_id=v_id,giorno_intervento=v_day,posizione_giro=v_pos where id=v_sid;
   delete from extra_workers where extra_id=v_sid;
   insert into extra_workers select v_sid,x from unnest(v_members) x;
  end loop;
  v_result=jsonb_build_object('id',v_id,'linked',v_linked);
 elsif p_operation in ('schedule_date','schedule_team') then
  select giorno into v_old_day from schedules where id=v_id for update;
  if not found then raise exception 'Programmazione non disponibile'; end if;
  select coalesce(array_agg(id),'{}') into v_items from schedule_items where schedule_id=v_id;
  if p_operation='schedule_date' then
   v_day=(p_payload->>'day')::date;
   if v_day is null then raise exception 'Data obbligatoria'; end if;
   update schedules set giorno=v_day where id=v_id;
   update extras set giorno_intervento=v_day where (schedule_id=v_id or schedule_item_id=any(v_items))
    and giorno_intervento=v_old_day and stato::text not in ('completato','in_attesa','annullato');
  else
   if cardinality(v_members)=0 then raise exception 'Squadra obbligatoria'; end if;
   delete from schedule_members where schedule_id=v_id;
   insert into schedule_members select v_id,x from unnest(v_members) x;
   for v_sid in select id from extras where (schedule_id=v_id or schedule_item_id=any(v_items)) and stato::text not in ('completato','in_attesa','annullato') for update loop
    delete from extra_workers where extra_id=v_sid;
    insert into extra_workers select v_sid,x from unnest(v_members) x;
   end loop;
  end if;
  v_result=jsonb_build_object('id',v_id);
 elsif p_operation='extra_create' then
  v_extra=jsonb_populate_record(null::public.extras,jsonb_build_object('id',gen_random_uuid(),'created_at',now(),'updated_at',now(),'insieme_ordinario',false,'con_ordinario',false,'stato','programmato','client_type','eurospin','closure_profile','eurospin')||(p_payload->'extra'));
  v_extra.creato_da=auth.uid();
  if nullif(trim(v_extra.titolo),'') is null then raise exception 'Titolo obbligatorio'; end if;
  if nullif(trim(v_extra.numero_target),'') is not null then
   perform pg_advisory_xact_lock(hashtextextended(v_extra.client_type||':'||trim(v_extra.numero_target),198));
   if exists(select 1 from extras where coalesce(client_type,'eurospin')=v_extra.client_type and trim(numero_target)=trim(v_extra.numero_target)) then raise exception 'Numero target/ticket già presente per questo cliente'; end if;
  end if;
  insert into extras select v_extra.* returning id into v_id;
  insert into extra_workers select v_id,x from unnest(v_members) x;
  for v_json in select value from jsonb_array_elements(p_payload->'work_items') loop
   v_pos=v_pos+1;
   insert into extra_work_items(extra_id,titolo,posizione,stato) values(v_id,v_json->>'titolo',v_pos,'da_fare');
  end loop;
  if v_extra.giorno_intervento is not null and cardinality(v_members)>0 and v_extra.schedule_item_id is null and v_extra.stato::text not in ('completato','in_attesa','annullato') then
   -- Serialize matching-day/team lookup, including concurrent extra creation.
   perform pg_advisory_xact_lock(hashtextextended('extra-day:'||v_extra.giorno_intervento::text,198));
   select s.id into v_sid from schedules s where s.giorno=v_extra.giorno_intervento
    and (select array_agg(m.profile_id order by m.profile_id) from schedule_members m where m.schedule_id=s.id)=v_members limit 1;
   if v_sid is null then
    insert into schedules(giorno,creato_da,auto_rollover) values(v_extra.giorno_intervento,auth.uid(),true) returning id into v_sid;
    insert into schedule_members select v_sid,x from unnest(v_members) x;
   end if;
   perform 1 from schedules where id=v_sid for update;
   select coalesce(max(pos),0)+1 into v_pos from (select posizione as pos from schedule_items where schedule_id=v_sid union all select posizione_giro from extras where schedule_id=v_sid) positions;
   update extras set schedule_id=v_sid,posizione_giro=v_pos where id=v_id;
  end if;
  v_json=p_payload->'attachment';
  if v_json is null or v_json->>'storage_path' not like 'extra/'||v_id::text||'/%' then raise exception 'PDF richiesta obbligatorio'; end if;
  insert into attachments(id,tipo,extra_id,storage_path,nome_file,mime_type,dimensione_bytes,caricato_da)
   values((v_json->>'id')::uuid,'pdf_richiesta',v_id,v_json->>'storage_path',v_json->>'nome_file',v_json->>'mime_type',(v_json->>'dimensione_bytes')::bigint,auth.uid());
  v_result=jsonb_build_object('id',v_id);
 elsif p_operation='delete_intervention' then
  select * into v_intervention from interventions where id=v_id for update;
  if not found then raise exception 'Intervento non disponibile'; end if;
  v_items=array_append(coalesce(v_intervention.schedule_item_ids,'{}'),v_intervention.schedule_item_id);
  select coalesce(jsonb_agg(storage_path),'[]') into v_paths from attachments where intervention_id=v_id;
  delete from interventions where id=v_id;
  update schedule_items si set stato='da_fare' where si.id=any(v_items)
   and not exists(select 1 from interventions i where i.schedule_item_id=si.id or si.id=any(i.schedule_item_ids));
  perform public.overgreen_refresh_last_visit_v196(v_intervention.store_id);
  v_result=jsonb_build_object('id',v_id,'paths',v_paths);
 else raise exception 'Operazione non supportata';
 end if;
 update overgreen_requests_v198 set response=v_result where request_id=p_request_id;
 return v_result;
end $$;
revoke all on function public.overgreen_admin_v198(uuid,text,jsonb) from public,anon;
grant execute on function public.overgreen_admin_v198(uuid,text,jsonb) to authenticated;
alter function public.set_updated_at() set search_path=public,pg_temp;
notify pgrst,'reload schema';
