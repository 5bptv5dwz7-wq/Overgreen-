create table public.weather_forecast_cache (
 location_key text primary key,
 payload jsonb not null,
 fetched_at timestamptz not null default now(),
 expires_at timestamptz not null,
 last_modified text
);
alter table public.weather_forecast_cache enable row level security;
revoke all on public.weather_forecast_cache from public, anon, authenticated;
grant select, insert, update, delete on public.weather_forecast_cache to service_role;
comment on table public.weather_forecast_cache is 'Public MET Norway forecasts. Only authenticated Edge Function accesses the shared cache.';
