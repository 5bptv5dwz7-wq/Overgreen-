alter table public.stores add column grass_kind text not null default 'unknown' check(grass_kind in ('unknown','cool','warm'));
alter table public.stores add column grass_irrigation text not null default 'unknown' check(grass_irrigation in ('unknown','yes','no'));
comment on column public.stores.grass_kind is 'Grass growth estimate: unknown, cool-season or warm-season. Existing admin-only store UPDATE RLS applies.';
comment on column public.stores.grass_irrigation is 'Grass growth estimate: irrigation present yes/no/unknown; does not guarantee sufficient water.';
