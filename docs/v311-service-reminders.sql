alter table public.store_reminders add column service text not null default 'verde' check(service in ('verde','pulizie'));
alter table public.store_reminders add column resolved_extra_id uuid references public.extras(id) on delete set null;
alter table public.store_reminders drop constraint store_reminders_pkey;
alter table public.store_reminders add primary key(store_id,service);
create or replace function public.overgreen_set_store_reminder_v234(p_store_id uuid,p_due_date date default null,p_note text default null,p_active boolean default true)
returns public.store_reminders language plpgsql security invoker set search_path='' as $$
declare result public.store_reminders;begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo amministratore' using errcode='42501';end if;
 if not exists(select 1 from public.stores where id=p_store_id and attivo) then raise exception 'Sede non disponibile';end if;
 insert into public.store_reminders(store_id,due_date,note,active,requested_by)
 values(p_store_id,p_due_date,nullif(trim(p_note),''),p_active,auth.uid())
 on conflict(store_id,service) do update set due_date=excluded.due_date,note=excluded.note,active=excluded.active,
 requested_at=now(),updated_at=now(),requested_by=auth.uid(),resolved_at=null,resolved_intervention_id=null
 returning * into result;
 return result;
end $$;
revoke all on function public.overgreen_set_store_reminder_v234(uuid,date,text,boolean) from public,anon;
grant execute on function public.overgreen_set_store_reminder_v234(uuid,date,text,boolean) to authenticated;

create or replace function public.overgreen_resolve_store_reminder_v234() returns trigger
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
  where r.service='verde' and r.store_id=NEW.store_id and r.active
   and coalesce(NEW.data_fine,NEW.data_intervento)>=(r.requested_at at time zone 'Europe/Rome')::date
   and coalesce(NEW.closed_at,NEW.created_at)>=r.requested_at;
 end if;
 return NEW;
end $$;
revoke all on function public.overgreen_resolve_store_reminder_v234() from public,anon,authenticated;
create or replace function public.overgreen_set_cleaning_reminder_v311(p_store_id uuid,p_due_date date default null,p_note text default null,p_active boolean default true)
returns public.store_reminders language plpgsql security invoker set search_path='' as $$
declare result public.store_reminders;begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo amministratore' using errcode='42501';end if;
 if not exists(select 1 from public.stores where id=p_store_id and attivo) then raise exception 'Sede non disponibile';end if;
 insert into public.store_reminders(store_id,due_date,note,active,requested_by,service)
 values(p_store_id,p_due_date,nullif(trim(p_note),''),p_active,auth.uid(),'pulizie')
 on conflict(store_id,service) do update set due_date=excluded.due_date,note=excluded.note,active=excluded.active,
 requested_at=now(),updated_at=now(),requested_by=auth.uid(),resolved_at=null,resolved_intervention_id=null,resolved_extra_id=null
 returning * into result;
 return result;
end $$;
revoke all on function public.overgreen_set_cleaning_reminder_v311(uuid,date,text,boolean) from public,anon;
grant execute on function public.overgreen_set_cleaning_reminder_v311(uuid,date,text,boolean) to authenticated;


create function public.overgreen_resolve_cleaning_reminder_v311() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' then
  update public.store_reminders set active=true,resolved_at=null,resolved_extra_id=null,updated_at=now() where service='pulizie' and resolved_extra_id=OLD.id;
  return OLD;
 end if;
 update public.store_reminders r set active=true,resolved_at=null,resolved_extra_id=null,updated_at=now()
 where r.service='pulizie' and r.resolved_extra_id=NEW.id and (NEW.stato::text<>'completato' or NEW.store_id<>r.store_id or coalesce(NEW.giorno_intervento,NEW.cleaning_period)<(r.requested_at at time zone 'Europe/Rome')::date);
 if NEW.stato::text='completato' and NEW.cleaning_codes is not null and not ('TARGET'=any(NEW.cleaning_codes)) then
  update public.store_reminders r set active=false,resolved_at=now(),resolved_extra_id=NEW.id,updated_at=now()
  where r.service='pulizie' and r.store_id=NEW.store_id and r.active
   and coalesce(NEW.giorno_intervento,NEW.cleaning_period)>=(r.requested_at at time zone 'Europe/Rome')::date
   and coalesce(NEW.closed_at,NEW.created_at)>=r.requested_at;
 end if;
 return NEW;
end $$;
revoke all on function public.overgreen_resolve_cleaning_reminder_v311() from public,anon,authenticated;
create trigger resolve_cleaning_reminder after insert or update on public.extras for each row execute function public.overgreen_resolve_cleaning_reminder_v311();
create trigger restore_cleaning_reminder before delete on public.extras for each row execute function public.overgreen_resolve_cleaning_reminder_v311();
