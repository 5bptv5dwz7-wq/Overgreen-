-- OVERGREEN CLOUD V92
-- Archivio Fogli firme Eurospin
begin;
create table if not exists public.signature_sheets (
  id uuid primary key default gen_random_uuid(),
  year integer not null check (year between 2020 and 2100),
  month integer not null check (month between 1 and 12),
  round integer not null check (round in (1,2)),
  sheet_number integer not null default 1 check (sheet_number > 0),
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists signature_sheets_period_idx on public.signature_sheets (year desc,month desc,round,created_at desc);
alter table public.signature_sheets enable row level security;
drop policy if exists "signature_sheets_select_authenticated" on public.signature_sheets;
create policy "signature_sheets_select_authenticated" on public.signature_sheets for select to authenticated using (true);
drop policy if exists "signature_sheets_insert_authenticated" on public.signature_sheets;
create policy "signature_sheets_insert_authenticated" on public.signature_sheets for insert to authenticated with check (uploaded_by=auth.uid());
drop policy if exists "signature_sheets_update_admin" on public.signature_sheets;
create policy "signature_sheets_update_admin" on public.signature_sheets for update to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin'))
with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin'));
drop policy if exists "signature_sheets_delete_admin" on public.signature_sheets;
create policy "signature_sheets_delete_admin" on public.signature_sheets for delete to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin'));
insert into storage.buckets(id,name,public) values('documenti','documenti',false) on conflict(id) do nothing;
drop policy if exists "firme_eurospin_read_authenticated" on storage.objects;
create policy "firme_eurospin_read_authenticated" on storage.objects for select to authenticated
using (bucket_id='documenti' and name like 'firme-eurospin/%');
drop policy if exists "firme_eurospin_insert_authenticated" on storage.objects;
create policy "firme_eurospin_insert_authenticated" on storage.objects for insert to authenticated
with check (bucket_id='documenti' and name like 'firme-eurospin/%');
drop policy if exists "firme_eurospin_update_admin" on storage.objects;
create policy "firme_eurospin_update_admin" on storage.objects for update to authenticated
using (bucket_id='documenti' and name like 'firme-eurospin/%' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin'))
with check (bucket_id='documenti' and name like 'firme-eurospin/%' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin'));
drop policy if exists "firme_eurospin_delete_admin" on storage.objects;
create policy "firme_eurospin_delete_admin" on storage.objects for delete to authenticated
using (bucket_id='documenti' and name like 'firme-eurospin/%' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin'));
commit;
