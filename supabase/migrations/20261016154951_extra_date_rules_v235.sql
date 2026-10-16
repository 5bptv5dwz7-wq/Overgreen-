alter table public.extras add column execution_date_mode text, add column execution_date date;
alter table public.extras add constraint extras_execution_date_rule_check check (
 (execution_date_mode is null and execution_date is null) or
 (execution_date_mode is not null and execution_date_mode in ('on','not_before') and execution_date is not null and deadline_at is null)
);
-- Only administrators may change customer timing rules; workers keep ordinary progress rights.
create function public.overgreen_guard_extra_date_rule_v235() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if (NEW.execution_date_mode,NEW.execution_date,NEW.deadline_at) is distinct from (OLD.execution_date_mode,OLD.execution_date,OLD.deadline_at)
  and auth.uid() is not null and not public.is_admin() then
  raise exception 'Solo l’amministratore può modificare i vincoli di data' using errcode='42501';
 end if;
 return NEW;
end $$;
revoke all on function public.overgreen_guard_extra_date_rule_v235() from public,anon,authenticated;
create trigger guard_extra_date_rule before update on public.extras for each row execute function public.overgreen_guard_extra_date_rule_v235();
