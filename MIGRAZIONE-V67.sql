-- Overgreen Cloud V67
-- Registra data/ora e utente della chiusura per ordinari ed extra.

alter table public.interventions
  add column if not exists closed_at timestamptz,
  add column if not exists closed_by uuid;

alter table public.extras
  add column if not exists closed_at timestamptz,
  add column if not exists closed_by uuid;

-- Per i nuovi interventi ordinari l'orario viene assegnato dal database.
alter table public.interventions
  alter column closed_at set default now();

-- Per gli extra l'orario deve essere assegnato quando lo stato passa a chiuso/in attesa.
create or replace function public.set_extra_closed_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.stato in ('in_attesa','completato')
     and (old.stato is distinct from new.stato)
     and new.closed_at is null then
    new.closed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_extra_closed_at on public.extras;
create trigger trg_set_extra_closed_at
before update on public.extras
for each row
execute function public.set_extra_closed_at();

-- Impedisce che un nuovo ordinario venga salvato senza timestamp anche se il client invia NULL.
create or replace function public.set_intervention_closed_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.closed_at is null then
    new.closed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_intervention_closed_at on public.interventions;
create trigger trg_set_intervention_closed_at
before insert on public.interventions
for each row
execute function public.set_intervention_closed_at();

notify pgrst, 'reload schema';
