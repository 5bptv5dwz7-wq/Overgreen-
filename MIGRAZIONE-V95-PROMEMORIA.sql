-- OVERGREEN CLOUD V95 - Promemoria per il prossimo passaggio
-- Eseguire una sola volta nel SQL Editor di Supabase.

alter table public.stores
  add column if not exists next_visit_note text;

alter table public.interventions
  add column if not exists next_visit_note text;

comment on column public.stores.next_visit_note is
  'Promemoria operativo da mostrare nel prossimo intervento ordinario programmato';

comment on column public.interventions.next_visit_note is
  'Promemoria lasciato alla chiusura dell intervento per il passaggio successivo';
