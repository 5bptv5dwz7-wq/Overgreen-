-- Device sessions contain no notes, photos, addresses or credentials.
create table public.app_devices (
 id uuid primary key,
 user_id uuid not null references public.profiles(id) on delete cascade,
 label text not null check(length(label)<=80),
 version text not null check(length(version)<=30),
 busy boolean not null default false,
 last_seen timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create index app_devices_user_idx on public.app_devices(user_id);
create table public.app_reload_commands (
 id uuid primary key default gen_random_uuid(),
 device_id uuid not null references public.app_devices(id) on delete cascade,
 requested_by uuid not null default auth.uid() references public.profiles(id),
 mode text not null check(mode in ('safe','force')),
 required_version text not null check(length(required_version)<=30),
 status text not null default 'pending' check(status in ('pending','waiting','reloading','completed','failed')),
 loaded_version text check(length(loaded_version)<=30),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '24 hours'),
 updated_at timestamptz not null default now()
);
create index app_reload_commands_device_idx on public.app_reload_commands(device_id,created_at desc);
create index app_reload_commands_requester_idx on public.app_reload_commands(requested_by);
alter table public.app_devices enable row level security;
alter table public.app_reload_commands enable row level security;
revoke all on public.app_devices,public.app_reload_commands from anon,authenticated;
grant select,insert on public.app_devices to authenticated;
grant update(label,version,busy) on public.app_devices to authenticated;
grant select,insert on public.app_reload_commands to authenticated;
grant update(status,loaded_version) on public.app_reload_commands to authenticated;
create policy devices_read on public.app_devices for select to authenticated using ((select public.is_active_user()) and (user_id=(select auth.uid()) or (select public.is_admin())));
create policy devices_insert on public.app_devices for insert to authenticated with check ((select public.is_active_user()) and user_id=(select auth.uid()));
create policy devices_update on public.app_devices for update to authenticated using ((select public.is_active_user()) and user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy reload_read on public.app_reload_commands for select to authenticated using ((select public.is_active_user()) and ((select public.is_admin()) or device_id in (select id from public.app_devices where user_id=(select auth.uid()))));
create policy reload_insert on public.app_reload_commands for insert to authenticated with check ((select public.is_admin()) and requested_by=(select auth.uid()) and status='pending' and loaded_version is null);
create policy reload_ack on public.app_reload_commands for update to authenticated using ((select public.is_active_user()) and device_id in (select id from public.app_devices where user_id=(select auth.uid()))) with check (device_id in (select id from public.app_devices where user_id=(select auth.uid())));
-- Timestamps are server-owned. Invoker triggers do not bypass RLS.
create function public.app_device_stamp() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 new.last_seen=now();
 if TG_OP='INSERT' then new.created_at=now(); end if;
 return new;
end;$$;
create trigger app_device_stamp before insert or update on public.app_devices for each row execute function public.app_device_stamp();
create function public.app_reload_stamp() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 new.updated_at=now();
 if TG_OP='INSERT' then new.created_at=now();new.expires_at=now()+interval '24 hours'; end if;
 return new;
end;$$;
create trigger app_reload_stamp before insert or update on public.app_reload_commands for each row execute function public.app_reload_stamp();
revoke all on function public.app_device_stamp(),public.app_reload_stamp() from public,anon,authenticated;
