-- V201: manual total operator hours, separate from employee-editable extras.
create table public.extra_labor_hours (
  extra_id uuid primary key references public.extras(id) on delete cascade,
  total_hours numeric(7,2),
  revision bigint not null default 1 check (revision > 0),
  source_attachment_id uuid references public.attachments(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint extra_labor_hours_range check (total_hours is null or total_hours between 0 and 99999.99)
);
comment on column public.extra_labor_hours.total_hours is 'Sum of hours worked by all operators; NULL means not entered. No automatic multiplication by crew size.';
create index extra_labor_hours_attachment_idx on public.extra_labor_hours(source_attachment_id);
create index extra_labor_hours_updated_by_idx on public.extra_labor_hours(updated_by);
alter table public.extra_labor_hours enable row level security;
revoke all on public.extra_labor_hours from public, anon, authenticated;
grant select, insert, update on public.extra_labor_hours to authenticated;
create policy extra_hours_admin_select on public.extra_labor_hours for select to authenticated
  using ((select public.is_admin()));
create policy extra_hours_admin_insert on public.extra_labor_hours for insert to authenticated
  with check ((select public.is_admin()) and updated_by = (select auth.uid()));
create policy extra_hours_admin_update on public.extra_labor_hours for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()) and updated_by = (select auth.uid()));

create function public.save_extra_labor_hours_v201(
  p_extra_id uuid, p_total_hours numeric, p_expected_revision bigint, p_source_attachment_id uuid
) returns public.extra_labor_hours
language plpgsql security invoker set search_path = '' as $$
declare
  v_row public.extra_labor_hours;
  v_report_id uuid;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Solo un amministratore attivo può inserire le ore.' using errcode = '42501';
  end if;
  if p_total_hours is not null and
    (p_total_hours < 0 or p_total_hours > 99999.99 or p_total_hours <> round(p_total_hours, 2)) then
    raise exception 'Inserisci ore tra 0 e 99999,99, con al massimo due decimali.' using errcode = '22023';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'Versione delle ore non valida. Riapri la scheda.' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('extra-hours:' || p_extra_id::text, 201));
  perform 1 from public.extras e where e.id = p_extra_id and e.client_type = 'eurospin';
  if not found then
    raise exception 'Extra Eurospin non trovato o non accessibile.' using errcode = '22023';
  end if;
  select a.id into v_report_id from public.attachments a
    where a.extra_id = p_extra_id and a.tipo = 'rapportino_eurospin'
    order by a.created_at desc, a.id desc limit 1;
  if v_report_id is distinct from p_source_attachment_id then
    raise exception 'Il rapportino è cambiato. Riapri Ore e rapportino e controlla le ore prima di salvare.' using errcode = '40001';
  end if;
  select * into v_row from public.extra_labor_hours where extra_id = p_extra_id for update;
  if found then
    if v_row.revision <> p_expected_revision then
      -- Retrying an acknowledged or lost-response save is safe.
      if v_row.total_hours is not distinct from p_total_hours and
        v_row.source_attachment_id is not distinct from p_source_attachment_id then
        return v_row;
      end if;
      raise exception 'Le ore sono state modificate da un’altra sessione. Annota il valore e riapri la scheda per confrontarlo.' using errcode = '40001';
    end if;
    update public.extra_labor_hours set total_hours = p_total_hours,
      source_attachment_id = p_source_attachment_id, revision = revision + 1,
      updated_by = auth.uid(), updated_at = now()
      where extra_id = p_extra_id returning * into v_row;
  else
    if p_expected_revision <> 0 then
      raise exception 'I dati sono cambiati. Riapri la scheda.' using errcode = '40001';
    end if;
    insert into public.extra_labor_hours(extra_id, total_hours, source_attachment_id, updated_by)
      values (p_extra_id, p_total_hours, p_source_attachment_id, auth.uid()) returning * into v_row;
  end if;
  return v_row;
end;
$$;
revoke all on function public.save_extra_labor_hours_v201(uuid,numeric,bigint,uuid) from public, anon;
grant execute on function public.save_extra_labor_hours_v201(uuid,numeric,bigint,uuid) to authenticated;
