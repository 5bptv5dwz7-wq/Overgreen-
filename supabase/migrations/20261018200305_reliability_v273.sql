-- Atomic, idempotent planning and extra editing. The caller's RLS stays active.
create or replace function public.overgreen_plan_v273(p_request_id uuid,p_operation text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp set lock_timeout='8s' as $$
declare
 req public.overgreen_requests_v198; e public.extras; edited public.extras; item public.schedule_items;
 sid uuid; eid uuid; storeid uuid; workid uuid; day date; members uuid[]; expected_members uuid[];
 selected_stores uuid[]; selected_extras uuid[]; linked_ids uuid[]:='{}'; jsonrow jsonb; field text;
 pos integer; linked integer:=0; added integer:=0; result jsonb; n integer; old_store uuid;
begin
 if auth.uid() is null or not public.is_admin() or not public.is_active_user() then raise exception 'Operazione riservata agli amministratori attivi'; end if;
 if p_request_id is null or p_operation not in ('add','extra','edit_extra') or p_operation is null or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Richiesta non valida'; end if;
 insert into public.overgreen_requests_v198(request_id,actor_id,operation,payload)
 values(p_request_id,auth.uid(),'plan-v273:'||p_operation,p_payload) on conflict do nothing;
 select * into req from public.overgreen_requests_v198 where request_id=p_request_id for update;
 if not found or req.actor_id<>auth.uid() or req.operation<>'plan-v273:'||p_operation or req.payload is distinct from p_payload then raise exception 'Identificativo richiesta già usato'; end if;
 if req.response is not null then return req.response; end if;
 -- Same lock as rollover and the V271 remove/reorder operations.
 perform pg_advisory_xact_lock(197,1);
 if p_operation='add' then
  sid=(p_payload->>'id')::uuid;
  select giorno into day from public.schedules where id=sid for update;
  if not found then raise exception 'Programmazione non disponibile'; end if;
  select coalesce(array_agg(profile_id order by profile_id),'{}') into members from public.schedule_members where schedule_id=sid;
  select coalesce(array_agg(distinct x::uuid order by x::uuid),'{}') into expected_members from jsonb_array_elements_text(p_payload->'expected_members') x;
  if day is distinct from (p_payload->>'expected_day')::date or members is distinct from expected_members then raise exception 'Data o squadra cambiate da un altro dispositivo. Aggiorna e riprova.'; end if;
  if cardinality(members)=0 then raise exception 'Squadra obbligatoria'; end if;
  select coalesce(array_agg(x::uuid order by ord),'{}') into selected_stores from jsonb_array_elements_text(p_payload->'stores') with ordinality as a(x,ord);
  select coalesce(array_agg(x::uuid order by ord),'{}') into selected_extras from jsonb_array_elements_text(p_payload->'extras') with ordinality as a(x,ord);
  if cardinality(selected_stores)+cardinality(selected_extras) not between 1 and 1000 then raise exception 'Selezione non valida'; end if;
  select coalesce(max(p),0) into pos from (
   select posizione p from public.schedule_items where schedule_id=sid union all select posizione_giro from public.extras where schedule_id=sid union all select posizione from public.schedule_activities where schedule_id=sid
  ) q;
  foreach storeid in array selected_stores loop
   if not exists(select 1 from public.stores where id=storeid and attivo) then raise exception 'Sede non disponibile'; end if;
   select * into item from public.schedule_items where schedule_id=sid and store_id=storeid and tipo::text='ordinario' and stato::text not in ('annullato','riportato') order by posizione limit 1 for update;
   if found then
    if item.stato::text<>'da_fare' then raise exception 'La sede ha già un intervento chiuso in questa giornata'; end if;
   else
    pos=pos+1;insert into public.schedule_items(schedule_id,tipo,store_id,posizione,stato) values(sid,'ordinario',storeid,pos,'da_fare') returning * into item;added=added+1;
   end if;
   for e in select * from public.extras where store_id=storeid and con_ordinario and schedule_item_id is null and stato::text not in ('completato','in_attesa','annullato') order by id for update loop
    update public.extras set schedule_item_id=item.id,schedule_id=sid,giorno_intervento=day where id=e.id;
    insert into public.extra_workers(extra_id,profile_id) select e.id,x from unnest(members) x on conflict do nothing;
    delete from public.extra_workers where extra_id=e.id and not(profile_id=any(members));
    linked=linked+1;linked_ids=array_append(linked_ids,e.id);
   end loop;
  end loop;
  foreach eid in array selected_extras loop
   select * into e from public.extras where id=eid for update;
   if not found or e.stato::text in ('completato','in_attesa','annullato') or e.schedule_item_id is not null then raise exception 'Extra non disponibile o già collegato a un ordinario'; end if;
   if e.schedule_id is distinct from sid or e.posizione_giro is null then pos=pos+1;else pos=greatest(pos,e.posizione_giro);end if;
   update public.extras set schedule_id=sid,giorno_intervento=day,posizione_giro=case when e.schedule_id=sid and e.posizione_giro is not null then e.posizione_giro else pos end where id=eid;
   insert into public.extra_workers(extra_id,profile_id) select eid,x from unnest(members) x on conflict do nothing;
   delete from public.extra_workers where extra_id=eid and not(profile_id=any(members));
   linked_ids=array_append(linked_ids,eid);
  end loop;
  result=jsonb_build_object('id',sid,'linked',linked,'added',added);
 else
  eid=(p_payload->>'id')::uuid;
  select * into e from public.extras where id=eid for update;
  if not found then raise exception 'Extra non disponibile'; end if;
  if p_payload?'expected_updated_at' and e.updated_at is distinct from (p_payload->>'expected_updated_at')::timestamptz then raise exception 'Extra modificato da un altro dispositivo. Aggiorna prima di salvare.'; end if;
  if p_operation='extra' and e.stato::text in ('completato','in_attesa','annullato') then raise exception 'Extra già chiuso o in attesa'; end if;
  select coalesce(array_agg(distinct x::uuid order by x::uuid),'{}') into members from jsonb_array_elements_text(p_payload->'members') x;
  if exists(select 1 from unnest(members) x where not exists(select 1 from public.profiles where id=x and attivo)) then raise exception 'Operatore non disponibile'; end if;
  if p_operation='edit_extra' then
   if jsonb_typeof(p_payload->'extra') is distinct from 'object' then raise exception 'Dati extra mancanti'; end if;
   for field in select jsonb_object_keys(p_payload->'extra') loop
    if not(field=any(array['client_type','closure_profile','execution_date_mode','execution_date','deadline_at','store_id','nome_esterno','indirizzo_esterno','titolo','numero_target','categoria_target','descrizione','data_richiesta','giorno_intervento','con_ordinario'])) then raise exception 'Campo extra non modificabile'; end if;
   end loop;
   edited=jsonb_populate_record(e,p_payload->'extra');old_store=e.store_id;
   if nullif(trim(edited.titolo),'') is null then raise exception 'Titolo obbligatorio'; end if;
   if edited.store_id is not null and not exists(select 1 from public.stores where id=edited.store_id and attivo and coalesce(client_type,'eurospin')=edited.client_type) then raise exception 'Sede o cliente non validi'; end if;
   if nullif(trim(edited.numero_target),'') is not null then
    perform pg_advisory_xact_lock(hashtextextended(edited.client_type||':'||trim(edited.numero_target),198));
    if exists(select 1 from public.extras where id<>eid and coalesce(client_type,'eurospin')=edited.client_type and trim(numero_target)=trim(edited.numero_target)) then raise exception 'Numero target/ticket già presente'; end if;
   end if;
   update public.extras set client_type=edited.client_type,closure_profile=edited.closure_profile,execution_date_mode=edited.execution_date_mode,execution_date=edited.execution_date,deadline_at=edited.deadline_at,
    store_id=edited.store_id,nome_esterno=edited.nome_esterno,indirizzo_esterno=edited.indirizzo_esterno,titolo=edited.titolo,numero_target=edited.numero_target,categoria_target=edited.categoria_target,
    descrizione=edited.descrizione,data_richiesta=edited.data_richiesta,giorno_intervento=edited.giorno_intervento,con_ordinario=edited.con_ordinario where id=eid returning * into e;
   if jsonb_typeof(p_payload->'work_items') is distinct from 'array' or jsonb_array_length(p_payload->'work_items')>200 then raise exception 'Lavorazioni non valide'; end if;
   if exists(select 1 from jsonb_array_elements(p_payload->'work_items') j where nullif(trim(j->>'titolo'),'') is null) then raise exception 'Titolo lavorazione obbligatorio'; end if;
   if exists(select 1 from jsonb_array_elements(p_payload->'work_items') j where nullif(j->>'id','') is not null and not exists(select 1 from public.extra_work_items w where w.id=(j->>'id')::uuid and w.extra_id=eid)) then raise exception 'Lavorazione non appartenente all’extra'; end if;
   if exists(select 1 from jsonb_array_elements(p_payload->'work_items') j where nullif(j->>'id','') is not null group by j->>'id' having count(*)>1) then raise exception 'Lavorazione duplicata'; end if;
   if exists(select 1 from public.extra_work_items w where w.extra_id=eid and not exists(select 1 from jsonb_array_elements(p_payload->'work_items') j where j->>'id'=w.id::text)
    and (w.stato::text<>'da_fare' or nullif(trim(w.nota),'') is not null or exists(select 1 from public.extra_work_item_photos p where p.work_item_id=w.id) or exists(select 1 from public.extra_work_item_notes n where n.work_item_id=w.id))) then raise exception 'Non puoi eliminare lavorazioni con foto, note o attività già registrate'; end if;
   delete from public.extra_work_items w where w.extra_id=eid and not exists(select 1 from jsonb_array_elements(p_payload->'work_items') j where j->>'id'=w.id::text);
   n=0;for jsonrow in select value from jsonb_array_elements(p_payload->'work_items') loop
    n=n+1;workid=nullif(jsonrow->>'id','')::uuid;
    if workid is null then insert into public.extra_work_items(extra_id,titolo,posizione,stato) values(eid,trim(jsonrow->>'titolo'),n,'da_fare');
    else update public.extra_work_items set titolo=trim(jsonrow->>'titolo'),posizione=n where id=workid and extra_id=eid;end if;
   end loop;
   day=e.giorno_intervento;
   if e.schedule_item_id is not null and e.stato::text not in ('completato','in_attesa','annullato') and (not e.con_ordinario or old_store is distinct from e.store_id) then
    update public.extras set schedule_item_id=null,schedule_id=null,posizione_giro=null where id=eid returning * into e;
   end if;
  else day=(p_payload->>'day')::date;if day is null or cardinality(members)=0 then raise exception 'Data e squadra obbligatorie';end if;
  end if;
  if e.schedule_item_id is not null and e.stato::text not in ('completato','in_attesa','annullato') then
   select schedule_id into sid from public.schedule_items where id=e.schedule_item_id;
   if not exists(select 1 from public.schedules where id=sid and giorno=day) or members is distinct from (select array_agg(profile_id order by profile_id) from public.schedule_members where schedule_id=sid) then raise exception 'Extra collegato a un ordinario: cambia data e squadra dalla programmazione'; end if;
  elsif e.stato::text not in ('completato','in_attesa','annullato') then
   sid=null;
   if day is not null and cardinality(members)>0 then
    perform pg_advisory_xact_lock(hashtextextended('extra-day:'||day::text,198));
    select s.id into sid from public.schedules s where s.giorno=day and (select array_agg(m.profile_id order by m.profile_id) from public.schedule_members m where m.schedule_id=s.id)=members order by (s.id=e.schedule_id) desc,s.id limit 1 for update;
    if sid is null then
     insert into public.schedules(giorno,creato_da,auto_rollover) values(day,auth.uid(),true) returning id into sid;
     insert into public.schedule_members(schedule_id,profile_id) select sid,x from unnest(members) x;
    end if;
    select coalesce(max(p),0)+1 into pos from (select posizione p from public.schedule_items where schedule_id=sid union all select posizione_giro from public.extras where schedule_id=sid union all select posizione from public.schedule_activities where schedule_id=sid) q;
   else pos=null;end if;
   update public.extras set schedule_id=sid,giorno_intervento=day,posizione_giro=case when sid is not null and sid=e.schedule_id then coalesce(e.posizione_giro,pos) else pos end where id=eid;
  end if;
  insert into public.extra_workers(extra_id,profile_id) select eid,x from unnest(members) x on conflict do nothing;
  delete from public.extra_workers where extra_id=eid and not(profile_id=any(members));
  linked_ids=array_append(linked_ids,eid);
  result=jsonb_build_object('id',eid,'schedule_id',sid,'updated_at',(select updated_at from public.extras where id=eid));
 end if;
 -- Validate inside the transaction too, including ordinary-linked targets.
 if exists(select 1 from public.extras x where x.id=any(linked_ids) and x.stato::text not in ('completato','in_attesa','annullato') and x.giorno_intervento is not null and (
  (x.execution_date_mode='on' and x.giorno_intervento<>x.execution_date) or
  (x.execution_date_mode='not_before' and x.giorno_intervento<x.execution_date) or
  (x.deadline_at is not null and x.giorno_intervento>(x.deadline_at at time zone 'Europe/Rome')::date)
 )) then raise exception 'La data non rispetta i vincoli del cliente'; end if;
 update public.overgreen_requests_v198 set response=result where request_id=p_request_id;
 return result;
end $$;
revoke all on function public.overgreen_plan_v273(uuid,text,jsonb) from public,anon;
grant execute on function public.overgreen_plan_v273(uuid,text,jsonb) to authenticated;
