alter table public.extras add column if not exists cleaning_done_codes text[];
alter table public.extras add constraint cleaning_done_codes_valid check(cleaning_done_codes is null or (cardinality(cleaning_done_codes)>0 and cleaning_done_codes <@ array['A/1','A/2','C/1','C/2','D/2']::text[]));
create or replace function public.overgreen_cleaning_guard_v308() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare st public.stores; d date; slot smallint; codes text[]; prior text[]; same_booking boolean:=false;
begin
 if new.cleaning_codes is null then
  if tg_op='UPDATE' and old.cleaning_codes is not null then raise exception 'La classificazione Pulizie non può essere rimossa'; end if;
  if new.cleaning_done_codes is not null then raise exception 'Visita pulizie obbligatoria'; end if;
  return new;
 end if;
 codes:=case when new.stato in ('in_attesa','completato') and new.cleaning_done_codes is not null then new.cleaning_done_codes else new.cleaning_codes end;
 if tg_op='UPDATE' then
  prior:=case when old.stato in ('in_attesa','completato') and old.cleaning_done_codes is not null then old.cleaning_done_codes else old.cleaning_codes end;
  if not public.is_admin() and (new.cleaning_codes is distinct from old.cleaning_codes or new.store_id is distinct from old.store_id or new.cleaning_period is distinct from old.cleaning_period or new.cleaning_slot is distinct from old.cleaning_slot or new.cleaning_year is distinct from old.cleaning_year or (old.stato in ('in_attesa','completato','annullato') and new.cleaning_done_codes is distinct from old.cleaning_done_codes)) then raise exception 'Classificazione riservata amministratore'; end if;
  same_booking:=coalesce(new.store_id=old.store_id and codes=prior and coalesce(new.giorno_intervento,new.cleaning_period)=coalesce(old.giorno_intervento,old.cleaning_period),false);
 end if;
 if new.client_type<>'eurospin' or new.categoria_target<>'pulizie' or new.store_id is null or new.con_ordinario then raise exception 'Le pulizie richiedono un PV Eurospin e una visita dedicata'; end if;
 if new.cleaning_codes=array['TARGET']::text[] and new.cleaning_done_codes is not null then raise exception 'Il Target a ore non è una visita contrattuale'; end if;
 d:=coalesce(new.giorno_intervento,new.cleaning_period);
 if d is null then raise exception 'Data pulizie obbligatoria'; end if;
 if not same_booking then
  -- Serialize reservations without requiring workers to hold UPDATE rights on stores.
  perform pg_advisory_xact_lock(hashtextextended('cleaning:'||new.store_id::text,0));
  select * into st from public.stores where id=new.store_id;
  if not found or st.client_type<>'eurospin' then raise exception 'PV Eurospin non disponibile'; end if;
  if codes<>array['TARGET']::text[] and (not st.cleaning_enabled or st.cleaning_start is null or d<st.cleaning_start or (st.cleaning_end is not null and d>st.cleaning_end)) then raise exception 'Pulizie ordinarie non attive per questo PV nella data scelta'; end if;
 end if;
 if 'TARGET'=any(new.cleaning_codes) and cardinality(new.cleaning_codes)>1 then raise exception 'Target a ore separato dalle prestazioni contrattuali'; end if;
 new.cleaning_year:=extract(year from d)::integer;
 if 'D/2'=any(codes) and new.stato<>'annullato' then
  if tg_op='UPDATE' and same_booking and old.cleaning_slot is not null then new.cleaning_slot:=old.cleaning_slot;
  else
   select n::smallint into slot from generate_series(1,2) n where not exists(select 1 from public.extras e where e.store_id=new.store_id and e.cleaning_year=new.cleaning_year and e.cleaning_slot=n and e.id<>new.id and e.stato<>'annullato') order by n limit 1;
   if slot is null then raise exception 'Entrambe le semestrali sono già eseguite o prenotate. Aggiorna e verifica il Target a ore.'; end if;
   new.cleaning_slot:=slot;
  end if;
 else new.cleaning_slot:=null; end if;
 if new.stato in ('in_attesa','completato') and new.cleaning_done_codes is null and new.cleaning_codes<>array['TARGET']::text[] then
  if exists(select 1 from unnest(new.cleaning_codes) code where not exists(select 1 from public.extra_work_items w where w.extra_id=new.id and w.titolo=code and w.stato='completata')) then raise exception 'Completa tutte le lavorazioni previste prima della chiusura'; end if;
 end if;
 return new;
end $$;

create or replace function public.overgreen_cleaning_plan_v309(p_request_id uuid,p_payload jsonb,p_add boolean default false)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare req public.overgreen_requests_v198; item jsonb; sid uuid; eid uuid; day date; codes text[]; ex jsonb:=coalesce(p_payload->'extras','[]'); transformed jsonb; result jsonb; subid uuid;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Accesso riservato amministratore' using errcode='42501'; end if;
 insert into public.overgreen_requests_v198(request_id,actor_id,operation,payload) values(p_request_id,auth.uid(),'cleaning_plan_v309',p_payload||jsonb_build_object('_add',p_add)) on conflict do nothing;
 select * into req from public.overgreen_requests_v198 where request_id=p_request_id for update;
 if req.actor_id is distinct from auth.uid() or req.operation<>'cleaning_plan_v309' or req.payload is distinct from (p_payload||jsonb_build_object('_add',p_add)) then raise exception 'Richiesta non corrispondente'; end if;
 if req.response is not null then return req.response; end if;
 day:=case when p_add then (p_payload->>'expected_day')::date else (p_payload->>'day')::date end;
 if day is null then raise exception 'Data obbligatoria'; end if;
 perform 1 from public.stores where id in (select (value->>'id')::uuid from jsonb_array_elements(coalesce(p_payload->'cleaning_stores','[]'))) order by id for update;
 for item in select value from jsonb_array_elements(coalesce(p_payload->'cleaning_stores','[]')) loop
  sid:=(item->>'id')::uuid;
  select array_agg(x) into codes from jsonb_array_elements_text(item->'codes') x;
  if codes is null or codes && array['TARGET'] then raise exception 'Lavorazioni contrattuali obbligatorie'; end if;
  eid:=(public.overgreen_cleaning_create_v308(md5(p_request_id::text||sid::text)::uuid,sid,day,codes,item->>'note')->>'id')::uuid;
  ex:=ex||jsonb_build_array(eid);
 end loop;
 select coalesce(jsonb_agg(value order by pos),'[]') into ex from (select value,min(ord) pos from jsonb_array_elements(ex) with ordinality a(value,ord) group by value) ordered;
 transformed:=(p_payload-'cleaning_stores')||jsonb_build_object('stores','[]'::jsonb,'extras',ex);
 subid:=md5(p_request_id::text||':schedule')::uuid;
 if p_add then result:=public.overgreen_plan_v273(subid,'add',transformed);
 else result:=public.overgreen_admin_v198(subid,'schedule_create',transformed); end if;
 update public.overgreen_requests_v198 set response=result where request_id=p_request_id;
 return result;
end $$;
revoke all on function public.overgreen_cleaning_plan_v309(uuid,jsonb,boolean) from public,anon;
grant execute on function public.overgreen_cleaning_plan_v309(uuid,jsonb,boolean) to authenticated;

create or replace function public.overgreen_cleaning_close_v309(p_extra_id uuid,p_codes text[],p_payload jsonb,p_workers uuid[] default null)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare e public.extras; codes text[];
begin
 if auth.uid() is null or not public.is_active_user() or not public.can_access_extra(p_extra_id) then raise exception 'Visita non assegnata' using errcode='42501'; end if;
 select * into e from public.extras where id=p_extra_id for update;
 if not found or e.cleaning_codes is null or 'TARGET'=any(e.cleaning_codes) then raise exception 'Visita pulizie non disponibile'; end if;
 select array_agg(distinct x order by x) into codes from unnest(p_codes) x;
 if codes is null or not codes <@ array['A/1','A/2','C/1','C/2','D/2']::text[] then raise exception 'Seleziona le lavorazioni eseguite'; end if;
 if p_payload->>'stato' is distinct from 'in_attesa' then raise exception 'Stato chiusura non valido'; end if;
 if e.stato='in_attesa' then
  if e.cleaning_done_codes is distinct from codes then raise exception 'Chiusura già ricevuta con lavorazioni diverse'; end if;
  return public.overgreen_close_extra_v271(p_extra_id,p_payload,p_workers);
 end if;
 if e.stato not in ('ricevuto','programmato','da_integrare') then raise exception 'Visita già chiusa'; end if;
 update public.extras set cleaning_done_codes=codes where id=p_extra_id;
 update public.extra_work_items set stato=case when titolo=any(codes) then 'completata' else 'non_eseguita' end,nota=case when titolo=any(codes) then nota else 'Non eseguita in questa visita' end where extra_id=p_extra_id and titolo=any(e.cleaning_codes);
 return public.overgreen_close_extra_v271(p_extra_id,p_payload,p_workers);
end $$;
revoke all on function public.overgreen_cleaning_close_v309(uuid,text[],jsonb,uuid[]) from public,anon;
grant execute on function public.overgreen_cleaning_close_v309(uuid,text[],jsonb,uuid[]) to authenticated;
