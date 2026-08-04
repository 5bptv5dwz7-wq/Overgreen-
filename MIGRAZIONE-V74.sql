-- OVERGREEN CLOUD V74
-- Clienti, sedi, scadenze e modelli di chiusura

alter table public.stores
  add column if not exists client_type text not null default 'eurospin',
  add column if not exists site_type text not null default 'punto_vendita';

alter table public.extras
  add column if not exists client_type text not null default 'eurospin',
  add column if not exists closure_profile text not null default 'eurospin',
  add column if not exists deadline_at timestamptz;

alter table public.stores drop constraint if exists stores_client_type_check;
alter table public.stores add constraint stores_client_type_check check (client_type in ('eurospin','intesa','privato'));
alter table public.extras drop constraint if exists extras_client_type_check;
alter table public.extras add constraint extras_client_type_check check (client_type in ('eurospin','intesa','privato'));
alter table public.extras drop constraint if exists extras_closure_profile_check;
alter table public.extras add constraint extras_closure_profile_check check (closure_profile in ('eurospin','intesa','privato'));

create index if not exists idx_stores_client_type on public.stores(client_type);
create index if not exists idx_extras_client_type on public.extras(client_type);
create index if not exists idx_extras_deadline_at on public.extras(deadline_at);

-- Allinea gli extra esistenti al cliente della sede collegata.
update public.extras e
set client_type=s.client_type, closure_profile=coalesce(nullif(e.closure_profile,''),s.client_type)
from public.stores s
where e.store_id=s.id;

notify pgrst, 'reload schema';
