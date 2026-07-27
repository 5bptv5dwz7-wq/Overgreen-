-- Eseguire una sola volta nel SQL Editor di Supabase
alter table public.extras
  add column if not exists data_richiesta date;

-- Imposta come data richiesta la data di creazione per gli extra già esistenti
update public.extras
set data_richiesta = created_at::date
where data_richiesta is null;

-- La data di esecuzione deve poter rimanere vuota fino alla programmazione
alter table public.extras
  alter column giorno_intervento drop not null;
