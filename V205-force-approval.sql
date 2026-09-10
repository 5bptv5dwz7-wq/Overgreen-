-- V205: explicit admin override; photo counts and uploads remain unchanged.
alter table public.interventions add column if not exists photo_approval_override jsonb;
create or replace function public.guard_photo_approval_override_v205()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if (TG_OP='INSERT' and new.photo_approval_override is not null)
     or (TG_OP='UPDATE' and new.photo_approval_override is distinct from old.photo_approval_override) then
    if not public.is_admin() then raise exception 'Forzatura riservata agli amministratori' using errcode='42501'; end if;
  end if;
  return new;
end $$;
revoke all on function public.guard_photo_approval_override_v205() from public,anon,authenticated;
create trigger guard_photo_approval_override_v205 before insert or update on public.interventions
for each row execute function public.guard_photo_approval_override_v205();
CREATE OR REPLACE FUNCTION public.overgreen_transition_intervention_v196(p_id uuid, p_action text, p_reason text DEFAULT ''::text, p_item_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_record public.interventions%rowtype;
  v_store uuid;
  v_ids uuid[];
  v_last uuid;
  v_actual integer;
  v_target uuid;
  v_now timestamptz := now();
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid()
      and ruolo = 'admin'
      and attivo = true
  ) then
    raise exception 'Operazione riservata agli amministratori';
  end if;

  if p_action not in ('approve', 'force_approve', 'reject', 'reopen')
     or p_action is null then
    raise exception 'Azione non valida';
  end if;

  select store_id into v_store
  from public.interventions
  where id = p_id;

  if not found then
    raise exception 'Intervento assente o non accessibile';
  end if;

  perform 1 from public.stores
  where id = v_store
  for update;

  if not found then
    raise exception 'Sede assente o non accessibile';
  end if;

  select * into v_record
  from public.interventions
  where id = p_id
  for update;

  if not found
     or v_record.store_id is distinct from v_store then
    raise exception 'Intervento modificato: aggiornare e riprovare';
  end if;

  if coalesce(v_record.multi_day_open, false) then
    raise exception 'Intervento multigiorno ancora aperto';
  end if;

  select coalesce(
    array_agg(t.value::uuid order by t.ord),
    array[]::uuid[]
  )
  into v_ids
  from jsonb_array_elements_text(
    coalesce(
      nullif(
        to_jsonb(v_record)->'schedule_item_ids',
        'null'::jsonb
      ),
      '[]'::jsonb
    )
  ) with ordinality as t(value, ord);

  if v_record.schedule_item_id is not null
     and not (v_record.schedule_item_id = any(v_ids)) then
    v_ids = array_prepend(v_record.schedule_item_id, v_ids);
  end if;

  v_last = coalesce(
    p_item_id,
    v_ids[array_length(v_ids, 1)]
  );

  if p_item_id is not null
     and not (p_item_id = any(v_ids)) then
    raise exception 'Giornata non collegata all’intervento';
  end if;

  if p_action = 'force_approve' then
    if length(trim(coalesce(p_reason,''))) not between 5 and 500 then
      raise exception 'Indicare un motivo da 5 a 500 caratteri';
    end if;
    if v_record.stato='convalidato' and v_record.photo_approval_override is not null then return; end if;
    if v_record.stato <> 'in_attesa' then raise exception 'La forzatura richiede un intervento in attesa'; end if;
  end if;

  if p_action in ('approve','force_approve') then

    if v_record.stato not in ('in_attesa', 'convalidato') then
      raise exception 'Stato non convalidabile';
    end if;

    select count(distinct storage_path)
    into v_actual
    from public.attachments
    where intervention_id = p_id
      and tipo = 'foto_generica';

    if p_action='approve' and v_actual < coalesce(v_record.foto_attese, 0) then
      raise exception 'Foto incomplete: % su %',
        v_actual, v_record.foto_attese;
    end if;

    update public.interventions
    set stato = 'convalidato',
        photo_approval_override = case when p_action='force_approve' and v_actual < coalesce(v_record.foto_attese,0)
          then jsonb_build_object('by',auth.uid(),'at',v_now,'reason',trim(p_reason),'expected',v_record.foto_attese,'received',v_actual)
          else photo_approval_override end,
        convalidato_da = auth.uid(),
        convalidato_il = v_now
    where id = p_id;

    if not found then
      raise exception 'Convalida non autorizzata';
    end if;

    for v_target in
      select id from public.schedule_items
      where id = any(v_ids)
    loop
      update public.schedule_items
      set stato = 'completato'
      where id = v_target;

      if not found then
        raise exception 'Aggiornamento programmazione non autorizzato';
      end if;
    end loop;

    for v_target in
      select id from public.extras
      where schedule_item_id = any(v_ids)
        and closure_profile in (
          'intesa_ordinario',
          'eurospin_ordinario'
        )
        and stato <> 'completato'
    loop
      update public.extras
      set stato = 'completato',
          convalidato_da = auth.uid(),
          convalidato_il = v_now,
          closed_at = v_now
      where id = v_target;

      if not found then
        raise exception 'Aggiornamento ticket incluso non autorizzato';
      end if;
    end loop;

  else

    if p_action = 'reopen'
       and v_record.stato <> 'convalidato' then
      raise exception 'Intervento non più convalidato';
    end if;

    if p_action = 'reject'
       and v_record.stato not in ('in_attesa', 'convalidato') then
      raise exception 'Stato non rifiutabile';
    end if;

    update public.interventions
    set stato = 'rifiutato',
        motivo_rifiuto = coalesce(p_reason, ''),
        convalidato_da = auth.uid(),
        convalidato_il = v_now
    where id = p_id;

    if not found then
      raise exception 'Rifiuto non autorizzato';
    end if;

    if v_last is not null then
      update public.schedule_items
      set stato = 'da_fare'
      where id = v_last;

      if not found then
        raise exception 'Giornata da riaprire assente o non modificabile';
      end if;
    end if;

    for v_target in
      select id from public.extras
      where schedule_item_id = any(v_ids)
        and closure_profile in (
          'intesa_ordinario',
          'eurospin_ordinario'
        )
    loop
      update public.extras
      set stato = 'programmato',
          closed_by = null,
          closed_at = null,
          convalidato_da = null,
          convalidato_il = null
      where id = v_target;

      if not found then
        raise exception 'Riapertura ticket incluso non autorizzata';
      end if;
    end loop;

  end if;

  perform public.overgreen_refresh_last_visit_v196(v_store);
end $function$;

revoke all on function public.overgreen_transition_intervention_v196(uuid,text,text,uuid) from public,anon;
grant execute on function public.overgreen_transition_intervention_v196(uuid,text,text,uuid) to authenticated;

