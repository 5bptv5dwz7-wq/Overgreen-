-- Overgreen Cloud V49
-- Consente di collegare un extra al successivo passaggio ordinario.

alter table public.extras
  add column if not exists con_ordinario boolean not null default false;

alter table public.extras
  add column if not exists schedule_item_id uuid;

-- Crea il collegamento alla voce della programmazione, senza errori se esiste già.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'extras_schedule_item_id_fkey'
  ) then
    alter table public.extras
      add constraint extras_schedule_item_id_fkey
      foreign key (schedule_item_id)
      references public.schedule_items(id)
      on delete set null;
  end if;
end $$;

create index if not exists extras_schedule_item_id_idx
  on public.extras(schedule_item_id);

create index if not exists extras_con_ordinario_store_idx
  on public.extras(con_ordinario, store_id)
  where stato <> 'completato';
