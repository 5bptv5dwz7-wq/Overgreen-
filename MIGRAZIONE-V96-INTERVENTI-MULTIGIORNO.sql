-- OVERGREEN CLOUD V96 - Interventi ordinari su più giorni
-- Eseguire una sola volta nel SQL Editor di Supabase PRIMA di pubblicare la V96.

alter table public.interventions
  add column if not exists data_fine date,
  add column if not exists multi_day_open boolean not null default false,
  add column if not exists schedule_item_ids uuid[] not null default '{}'::uuid[];

-- I vecchi interventi restano interventi di un solo giorno.
update public.interventions
set data_fine = data_intervento
where data_fine is null;

-- Conserva anche il collegamento della programmazione già esistente.
update public.interventions
set schedule_item_ids = array[schedule_item_id]::uuid[]
where schedule_item_id is not null
  and coalesce(array_length(schedule_item_ids, 1), 0) = 0;

comment on column public.interventions.data_fine is
  'Ultima giornata dell intervento; coincide con data_intervento per i lavori in giornata.';

comment on column public.interventions.multi_day_open is
  'True quando un intervento è stato salvato a fine giornata ma deve continuare nei giorni successivi.';

comment on column public.interventions.schedule_item_ids is
  'Programmazioni giornaliere collegate allo stesso intervento multigiorno.';
