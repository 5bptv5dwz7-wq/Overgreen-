-- OVERGREEN CLOUD V94
-- Archivio aziendale: Modulistica / Mezzi / Dati aziendali

begin;

create table if not exists public.company_documents (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('modulistica','mezzi','dati_aziendali')),
  title text not null,
  description text,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  version integer not null default 1 check (version > 0),
  mandatory boolean not null default false,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_documents_category_idx
on public.company_documents(category, updated_at desc);

create table if not exists public.company_document_reads (
  document_id uuid not null references public.company_documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (document_id,user_id)
);

create index if not exists company_document_reads_user_idx
on public.company_document_reads(user_id,read_at desc);

alter table public.company_documents enable row level security;
alter table public.company_document_reads enable row level security;

drop policy if exists "company_documents_read_all" on public.company_documents;
create policy "company_documents_read_all"
on public.company_documents for select
to authenticated
using (true);

drop policy if exists "company_documents_admin_insert" on public.company_documents;
create policy "company_documents_admin_insert"
on public.company_documents for insert
to authenticated
with check (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin')
);

drop policy if exists "company_documents_admin_update" on public.company_documents;
create policy "company_documents_admin_update"
on public.company_documents for update
to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin'))
with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin'));

drop policy if exists "company_documents_admin_delete" on public.company_documents;
create policy "company_documents_admin_delete"
on public.company_documents for delete
to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin'));

drop policy if exists "company_document_reads_own_select" on public.company_document_reads;
create policy "company_document_reads_own_select"
on public.company_document_reads for select
to authenticated
using (
  user_id=auth.uid()
  or exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin')
);

drop policy if exists "company_document_reads_own_insert" on public.company_document_reads;
create policy "company_document_reads_own_insert"
on public.company_document_reads for insert
to authenticated
with check (user_id=auth.uid());

drop policy if exists "company_document_reads_own_update" on public.company_document_reads;
create policy "company_document_reads_own_update"
on public.company_document_reads for update
to authenticated
using (user_id=auth.uid())
with check (user_id=auth.uid());

drop policy if exists "company_document_reads_admin_delete" on public.company_document_reads;
create policy "company_document_reads_admin_delete"
on public.company_document_reads for delete
to authenticated
using (
  user_id=auth.uid()
  or exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin')
);

insert into storage.buckets(id,name,public)
values('documenti','documenti',false)
on conflict(id) do nothing;

drop policy if exists "archivio_aziendale_read" on storage.objects;
create policy "archivio_aziendale_read"
on storage.objects for select
to authenticated
using (bucket_id='documenti' and name like 'archivio-aziendale/%');

drop policy if exists "archivio_aziendale_admin_insert" on storage.objects;
create policy "archivio_aziendale_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id='documenti'
  and name like 'archivio-aziendale/%'
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin')
);

drop policy if exists "archivio_aziendale_admin_update" on storage.objects;
create policy "archivio_aziendale_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id='documenti'
  and name like 'archivio-aziendale/%'
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin')
)
with check (
  bucket_id='documenti'
  and name like 'archivio-aziendale/%'
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin')
);

drop policy if exists "archivio_aziendale_admin_delete" on storage.objects;
create policy "archivio_aziendale_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id='documenti'
  and name like 'archivio-aziendale/%'
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.ruolo='admin')
);

-- Collega l'archivio al log attività, se il sistema audit V93 è già installato.
do $$
begin
  if to_regprocedure('public.audit_table_change()') is not null then
    execute 'drop trigger if exists trg_audit_company_documents on public.company_documents';
    execute 'create trigger trg_audit_company_documents after insert or update or delete on public.company_documents for each row execute function public.audit_table_change()';
  end if;
end $$;

commit;
