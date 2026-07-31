-- OVERGREEN CLOUD V69
-- Categorie target per gli extra: verde / pulizie.
-- Eseguire una sola volta in Supabase > SQL Editor.

alter table public.extras
  add column if not exists categoria_target text;

-- Accetta esclusivamente le due categorie previste.
alter table public.extras
  drop constraint if exists extras_categoria_target_check;

alter table public.extras
  add constraint extras_categoria_target_check
  check (categoria_target is null or categoria_target in ('verde', 'pulizie'));

create index if not exists idx_extras_categoria_target
  on public.extras(categoria_target);

notify pgrst, 'reload schema';
