-- OVERGREEN CLOUD V52
-- Rende visibili a tutti gli utenti autenticati tutti gli extra,
-- le relative assegnazioni e i relativi allegati.
-- I permessi di modifica/chiusura già esistenti non vengono ampliati:
-- questa migrazione aggiunge soltanto permessi di LETTURA.

alter table public.extras enable row level security;
alter table public.extra_workers enable row level security;
alter table public.attachments enable row level security;

-- Tutti i dipendenti autenticati possono leggere tutti gli extra.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'extras'
      and policyname = 'extras_select_all_authenticated'
  ) then
    create policy extras_select_all_authenticated
      on public.extras
      for select
      to authenticated
      using (true);
  end if;
end $$;

-- Tutti possono vedere a chi è assegnato ciascun extra.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'extra_workers'
      and policyname = 'extra_workers_select_all_authenticated'
  ) then
    create policy extra_workers_select_all_authenticated
      on public.extra_workers
      for select
      to authenticated
      using (true);
  end if;
end $$;

-- Tutti possono vedere i record degli allegati collegati agli extra.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'attachments'
      and policyname = 'extra_attachments_select_all_authenticated'
  ) then
    create policy extra_attachments_select_all_authenticated
      on public.attachments
      for select
      to authenticated
      using (extra_id is not null);
  end if;
end $$;

-- Permette agli utenti autenticati di aprire i file del bucket documenti.
-- Non concede caricamento, modifica o eliminazione.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'documenti_select_authenticated'
  ) then
    create policy documenti_select_authenticated
      on storage.objects
      for select
      to authenticated
      using (bucket_id = 'documenti');
  end if;
end $$;
