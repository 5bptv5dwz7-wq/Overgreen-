-- Explicit customer reminders are separate from the ordinary maintenance interval.
create table public.store_reminders (
 store_id uuid primary key references public.stores(id) on delete cascade,
 due_date date,
 note text check (length(note)<=2000),
 active boolean not null default true,
 requested_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 requested_by uuid not null references public.profiles(id),
 resolved_intervention_id uuid references public.interventions(id) on delete set null,
 resolved_at timestamptz
);
alter table public.store_reminders enable row level security;
revoke all on public.store_reminders from anon,authenticated;
grant select,insert,update on public.store_reminders to authenticated;
create policy reminder_read on public.store_reminders for select to authenticated using(public.is_active_user());
create policy reminder_admin_insert on public.store_reminders for insert to authenticated with check(public.is_admin());
create policy reminder_admin_update on public.store_reminders for update to authenticated using(public.is_admin()) with check(public.is_admin());

create function public.overgreen_set_store_reminder_v234(p_store_id uuid,p_due_date date default null,p_note text default null,p_active boolean default true)
returns public.store_reminders language plpgsql security invoker set search_path='' as $$
declare result public.store_reminders;begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo amministratore' using errcode='42501';end if;
 if not exists(select 1 from public.stores where id=p_store_id and attivo) then raise exception 'Sede non disponibile';end if;
 insert into public.store_reminders(store_id,due_date,note,active,requested_by)
 values(p_store_id,p_due_date,nullif(trim(p_note),''),p_active,auth.uid())
 on conflict(store_id) do update set due_date=excluded.due_date,note=excluded.note,active=excluded.active,
 requested_at=now(),updated_at=now(),requested_by=auth.uid(),resolved_at=null,resolved_intervention_id=null
 returning * into result;
 return result;
end $$;
revoke all on function public.overgreen_set_store_reminder_v234(uuid,date,text,boolean) from public,anon;
grant execute on function public.overgreen_set_store_reminder_v234(uuid,date,text,boolean) to authenticated;

-- Trigger-only definer: updates reminders after an already-authorized intervention
-- write. No RPC execution is granted; no function changes users' assignments.
create function public.overgreen_resolve_store_reminder_v234() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' then
  update public.store_reminders set active=true,resolved_at=null,resolved_intervention_id=null,updated_at=now() where resolved_intervention_id=OLD.id;
  return OLD;
 end if;
 -- A rejected, reopened, moved or partial visit restores the reminder it resolved.
 update public.store_reminders r set active=true,resolved_at=null,resolved_intervention_id=null,updated_at=now()
 where r.resolved_intervention_id=NEW.id and (NEW.stato::text<>'convalidato' or coalesce(NEW.multi_day_open,false) or NEW.store_id<>r.store_id or coalesce(NEW.data_fine,NEW.data_intervento)<(r.requested_at at time zone 'Europe/Rome')::date);
 if NEW.stato::text='convalidato' and not coalesce(NEW.multi_day_open,false) then
  update public.store_reminders r set active=false,resolved_at=now(),resolved_intervention_id=NEW.id,updated_at=now()
  where r.store_id=NEW.store_id and r.active
   and coalesce(NEW.data_fine,NEW.data_intervento)>=(r.requested_at at time zone 'Europe/Rome')::date
   and coalesce(NEW.closed_at,NEW.created_at)>=r.requested_at;
 end if;
 return NEW;
end $$;
revoke all on function public.overgreen_resolve_store_reminder_v234() from public,anon,authenticated;
create trigger resolve_store_reminder after insert or update on public.interventions for each row execute function public.overgreen_resolve_store_reminder_v234();
create trigger restore_store_reminder before delete on public.interventions for each row execute function public.overgreen_resolve_store_reminder_v234();
