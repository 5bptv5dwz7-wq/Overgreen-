-- Additional visits reuse the existing typed schedule items. The extra remains unique.
create or replace function public.overgreen_extra_day_v291(p_request_id uuid,p_operation text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp set lock_timeout='8s' as $$
declare req public.overgreen_requests_v198; e public.extras; sid uuid; item public.schedule_items; day date; members uuid[]; pos integer; result jsonb;
begin
 if auth.uid() is null or not public.is_admin() or not public.is_active_user() then raise exception 'Operazione riservata agli amministratori attivi'; end if;
 if p_request_id is null or p_operation is null or p_operation not in ('add_day','remove_day') or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Richiesta non valida'; end if;
 insert into public.overgreen_requests_v198(request_id,actor_id,operation,payload) values(p_request_id,auth.uid(),'extra-day-v291:'||p_operation,p_payload) on conflict do nothing;
 select * into req from public.overgreen_requests_v198 where request_id=p_request_id for update;
 if not found or req.actor_id<>auth.uid() or req.operation<>'extra-day-v291:'||p_operation or req.payload is distinct from p_payload then raise exception 'Identificativo richiesta già usato'; end if;
 if req.response is not null then return req.response; end if;
 perform pg_advisory_xact_lock(197,1);
 select * into e from public.extras where id=(p_payload->>'id')::uuid for update;
 if not found then raise exception 'Extra non disponibile'; end if;
 if e.stato::text in ('completato','in_attesa','annullato') then raise exception 'Extra già chiuso o in attesa'; end if;
 if p_payload?'expected_updated_at' and e.updated_at is distinct from (p_payload->>'expected_updated_at')::timestamptz then raise exception 'Extra modificato. Aggiorna prima di salvare.'; end if;
 if p_operation='remove_day' then
  select * into item from public.schedule_items where id=(p_payload->>'item_id')::uuid and extra_id=e.id and tipo='extra' for update;
  if not found then raise exception 'Giornata non disponibile'; end if;
  delete from public.schedule_items where id=item.id;
  result=jsonb_build_object('removed',item.id);
 else
  day=(p_payload->>'day')::date;
  select coalesce(array_agg(distinct x::uuid order by x::uuid),'{}') into members from jsonb_array_elements_text(p_payload->'members') x;
  if day is null or cardinality(members)=0 then raise exception 'Data e squadra obbligatorie'; end if;
  if exists(select 1 from unnest(members) x where not exists(select 1 from public.profiles where id=x and attivo)) then raise exception 'Operatore non disponibile'; end if;
  if e.execution_date_mode='on' and e.execution_date is not null and day<>e.execution_date then raise exception 'Data fissa: modifica prima il vincolo della richiesta'; end if;
  if e.execution_date_mode='not_before' and e.execution_date is not null and day<e.execution_date then raise exception 'Data precedente al vincolo della richiesta'; end if;
  if e.deadline_at is not null and day>(e.deadline_at at time zone 'Europe/Rome')::date then raise exception 'Data oltre la scadenza della richiesta'; end if;
  if e.giorno_intervento=day or exists(select 1 from public.schedule_items i join public.schedules s on s.id=i.schedule_id where i.extra_id=e.id and i.tipo='extra' and s.giorno=day and i.stato::text not in ('annullato','riportato')) then raise exception 'Extra già programmato in questa data'; end if;
  select s.id into sid from public.schedules s where s.giorno=day and (select array_agg(m.profile_id order by m.profile_id) from public.schedule_members m where m.schedule_id=s.id)=members order by s.id limit 1 for update;
  if sid is null then
   insert into public.schedules(giorno,creato_da,auto_rollover) values(day,auth.uid(),false) returning id into sid;
   insert into public.schedule_members(schedule_id,profile_id) select sid,x from unnest(members) x;
  end if;
  select coalesce(max(p),0)+1 into pos from (select posizione p from public.schedule_items where schedule_id=sid union all select posizione_giro from public.extras where schedule_id=sid and schedule_item_id is null union all select posizione from public.schedule_activities where schedule_id=sid) q;
  insert into public.schedule_items(schedule_id,tipo,extra_id,posizione,stato) values(sid,'extra',e.id,pos,'da_fare') returning * into item;
  result=jsonb_build_object('item',to_jsonb(item),'schedule_id',sid);
 end if;
 update public.extras set updated_at=now() where id=e.id;
 update public.overgreen_requests_v198 set response=result where request_id=p_request_id;
 return result;
end $$;
revoke all on function public.overgreen_extra_day_v291(uuid,text,jsonb) from public,anon;
grant execute on function public.overgreen_extra_day_v291(uuid,text,jsonb) to authenticated;

-- Extend the existing assignment check to additional visits; retain its auth gate.
create or replace function public.can_access_extra(p_extra_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select public.is_active_user() and (
  public.is_admin()
  or exists(select 1 from public.extra_workers w where w.extra_id=p_extra_id and w.profile_id=auth.uid())
  or exists(select 1 from public.extras e join public.schedule_members m on m.schedule_id=e.schedule_id where e.id=p_extra_id and m.profile_id=auth.uid())
  or exists(select 1 from public.extras e join public.schedule_items i on i.id=e.schedule_item_id join public.schedule_members m on m.schedule_id=i.schedule_id where e.id=p_extra_id and m.profile_id=auth.uid())
  or exists(select 1 from public.schedule_items i join public.schedule_members m on m.schedule_id=i.schedule_id where i.tipo='extra' and i.extra_id=p_extra_id and i.stato::text not in ('annullato','riportato') and m.profile_id=auth.uid())
 );
$$;
