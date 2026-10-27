create or replace function public.overgreen_cleaning_create_v308(p_id uuid,p_store uuid,p_day date,p_codes text[],p_description text default null,p_existing uuid default null)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare e public.extras; st public.stores; codes text[]; code text; n integer:=0;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Accesso riservato amministratore' using errcode='42501'; end if;
 select * into st from public.stores where id=p_store and attivo for update;
 if not found then raise exception 'PV non disponibile'; end if;
 select array_agg(distinct x order by x) into codes from unnest(p_codes) x;
 if codes is null then raise exception 'Seleziona una lavorazione'; end if;
 if p_existing is not null then
  select * into e from public.extras where id=p_existing for update;
  if not found or e.store_id<>p_store or e.categoria_target<>'pulizie' or e.client_type<>'eurospin' or e.stato in ('completato','in_attesa','annullato') or (e.cleaning_codes is not null and e.cleaning_codes<>array['TARGET']::text[] and e.cleaning_codes is distinct from codes) then raise exception 'Target non disponibile per la classificazione'; end if;
  if e.cleaning_codes=codes then return to_jsonb(e);end if;
  if exists(select 1 from public.extra_labor_hours where extra_id=e.id) then raise exception 'Il Target ha già dati economici: verifica prima la fatturazione'; end if;
  if codes<>array['D/2']::text[] and codes<>array['TARGET']::text[] then raise exception 'Classificazione Target non valida'; end if;
  update public.extras set cleaning_codes=codes,cleaning_period=p_day where id=e.id returning * into e;
 else
  select * into e from public.extras where id=p_id;
  if found then
   if e.store_id=p_store and e.cleaning_period=p_day and e.cleaning_codes=codes then return to_jsonb(e); end if;
   raise exception 'Identificativo già utilizzato';
  end if;
  -- Add services to the same open contract visit, retaining its team and schedule.
  select * into e from public.extras where store_id=p_store and coalesce(giorno_intervento,cleaning_period)=p_day and cleaning_codes is not null and cleaning_codes<>array['TARGET']::text[] and stato not in ('completato','in_attesa','annullato') and codes<>array['TARGET']::text[] order by created_at,id limit 1 for update;
  if found then
   select array_agg(distinct x order by x) into codes from unnest(codes||e.cleaning_codes) x;
   update public.extras set cleaning_codes=codes,titolo='Pulizie · '||array_to_string(codes,' + '),descrizione=case when nullif(p_description,'') is null then descrizione else concat_ws(E'\n',descrizione,p_description) end where id=e.id returning * into e;
  else
   if exists(select 1 from public.extras where store_id=p_store and coalesce(giorno_intervento,cleaning_period)=p_day and cleaning_codes is not null and stato<>'annullato' and (case when stato in ('in_attesa','completato') then coalesce(cleaning_done_codes,cleaning_codes) else cleaning_codes end) && codes) then raise exception 'Lavorazione già presente per questo PV e questa data'; end if;
  insert into public.extras(id,store_id,titolo,descrizione,client_type,categoria_target,closure_profile,data_richiesta,stato,creato_da,cleaning_codes,cleaning_period)
   values(p_id,p_store,'Pulizie · '||array_to_string(codes,' + '),p_description,'eurospin','pulizie','eurospin',current_date,'ricevuto',auth.uid(),codes,p_day) returning * into e;
  end if;
 end if;
 foreach code in array codes loop
  if code<>'TARGET' and not exists(select 1 from public.extra_work_items where extra_id=e.id and titolo=code) then
   n:=n+1;insert into public.extra_work_items(extra_id,titolo,posizione,stato) values(e.id,code,n,'da_fare');
  end if;
 end loop;
 return to_jsonb(e);
end $$;
revoke all on function public.overgreen_cleaning_create_v308(uuid,uuid,date,text[],text,uuid) from public,anon;
grant execute on function public.overgreen_cleaning_create_v308(uuid,uuid,date,text[],text,uuid) to authenticated;


-- No-photo ordinary registration is one transaction: no orphan if closure validation fails.
create or replace function public.overgreen_cleaning_register_v314(p_request_id uuid,p_store uuid,p_codes text[],p_payload jsonb,p_workers uuid[])
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare req public.overgreen_requests_v198; fingerprint jsonb; result jsonb; eid uuid;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Accesso riservato amministratore' using errcode='42501';end if;
 fingerprint:=jsonb_build_object('store',p_store,'codes',p_codes,'closure',p_payload,'workers',p_workers);
 insert into public.overgreen_requests_v198(request_id,actor_id,operation,payload) values(p_request_id,auth.uid(),'cleaning_register_v314',fingerprint) on conflict do nothing;
 select * into req from public.overgreen_requests_v198 where request_id=p_request_id for update;
 if req.actor_id is distinct from auth.uid() or req.operation<>'cleaning_register_v314' or req.payload is distinct from fingerprint then raise exception 'Invio già utilizzato con dati diversi. Aggiorna prima di modificare.';end if;
 if req.response is not null then return req.response;end if;
 if nullif(p_payload->>'giorno_intervento','') is null then raise exception 'Data obbligatoria';end if;
 eid:=(public.overgreen_cleaning_create_v308(p_request_id,p_store,(p_payload->>'giorno_intervento')::date,p_codes,p_payload->>'note_lorenzo')->>'id')::uuid;
 result:=public.overgreen_cleaning_close_v309(eid,p_codes,p_payload,p_workers);
 update public.overgreen_requests_v198 set response=result where request_id=p_request_id;
 return result;
end $$;
revoke all on function public.overgreen_cleaning_register_v314(uuid,uuid,text[],jsonb,uuid[]) from public,anon;
grant execute on function public.overgreen_cleaning_register_v314(uuid,uuid,text[],jsonb,uuid[]) to authenticated;
