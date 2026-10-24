-- Existing generic documents remain available; new uploads belong to their workspace.
alter table public.company_documents add column if not exists client_type text check (client_type in ('eurospin','intesa','privato'));
alter table public.schedule_activities add column if not exists client_type text check (client_type in ('eurospin','intesa','privato'));

