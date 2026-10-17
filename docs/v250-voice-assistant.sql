-- Private assistant state. No voice is enabled by this migration.
create table public.voice_assistant_settings (
 owner_id uuid primary key references public.profiles(id),
 enabled boolean not null default false,
 daily_session_limit integer not null default 20 check(daily_session_limit between 1 and 100),
 starts_day date, starts_count integer not null default 0
);
insert into public.voice_assistant_settings(owner_id)
select id from public.profiles where ruolo='admin' and attivo and nome='Lorenzo';
alter table public.voice_assistant_settings enable row level security;
revoke all on public.voice_assistant_settings from anon,authenticated;
grant select on public.voice_assistant_settings to authenticated;
create policy voice_settings_owner on public.voice_assistant_settings for select to authenticated
using(owner_id=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and ruolo='admin' and attivo));
create table public.voice_assistant_state (
 owner_id uuid primary key references public.voice_assistant_settings(owner_id),
 preferences jsonb not null default '[]' check(jsonb_typeof(preferences)='array' and pg_column_size(preferences)<20000),
 conversation jsonb not null default '[]' check(jsonb_typeof(conversation)='array' and pg_column_size(conversation)<100000),
 draft jsonb check(draft is null or (jsonb_typeof(draft)='object' and pg_column_size(draft)<30000)),
 updated_at timestamptz not null default now()
);
alter table public.voice_assistant_state enable row level security;
revoke all on public.voice_assistant_state from anon,authenticated;
grant select,insert,update,delete on public.voice_assistant_state to authenticated;
create policy voice_state_owner on public.voice_assistant_state for all to authenticated
using(owner_id=auth.uid() and exists(select 1 from public.voice_assistant_settings where owner_id=auth.uid()))
with check(owner_id=auth.uid() and exists(select 1 from public.voice_assistant_settings where owner_id=auth.uid()));
create function public.voice_assistant_reserve(p_owner uuid) returns boolean
language plpgsql security definer set search_path=public as $$
declare allowed boolean;
begin
 update voice_assistant_settings set starts_count=case when starts_day=current_date then starts_count+1 else 1 end,starts_day=current_date
 where owner_id=p_owner and enabled and (starts_day is distinct from current_date or starts_count<daily_session_limit)
 returning true into allowed;
 return coalesce(allowed,false);
end $$;
revoke all on function public.voice_assistant_reserve(uuid) from public,anon,authenticated;
grant execute on function public.voice_assistant_reserve(uuid) to service_role;
