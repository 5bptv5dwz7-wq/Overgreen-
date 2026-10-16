create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'extra_reminder_cron_token');

create table public.extra_reminder_deliveries (
 subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
 reminder_day date not null,
 created_at timestamptz not null default now(),
 primary key(subscription_id,reminder_day)
);
alter table public.extra_reminder_deliveries enable row level security;
revoke all on public.extra_reminder_deliveries from anon,authenticated;
grant all on public.extra_reminder_deliveries to service_role;
create policy service_only on public.extra_reminder_deliveries to service_role using(true) with check(true);

create function public.verify_extra_reminder_token(p_token text) returns boolean
language sql security definer set search_path='' as $$
 select exists(select 1 from vault.decrypted_secrets where name='extra_reminder_cron_token' and decrypted_secret=p_token and length(p_token)=64);
$$;
revoke all on function public.verify_extra_reminder_token(text) from public,anon,authenticated;
grant execute on function public.verify_extra_reminder_token(text) to service_role;

create function public.extra_daily_reminder_rows() returns jsonb
language sql security invoker set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(r) order by r.rule_date,r.pv),'[]'::jsonb) from (
 select e.id,e.titolo,e.numero_target,coalesce(s.nome,e.nome_esterno,'Extra') as pv,e.giorno_intervento,
 coalesce(e.execution_date_mode,'deadline') as rule_mode,
 coalesce(e.execution_date,(e.deadline_at at time zone 'Europe/Rome')::date) as rule_date,
 (now() at time zone 'Europe/Rome')::date as reminder_day
 from public.extras e left join public.stores s on s.id=e.store_id
 where e.stato not in ('completato','annullato','in_attesa')
 and coalesce(e.execution_date,(e.deadline_at at time zone 'Europe/Rome')::date)<=(now() at time zone 'Europe/Rome')::date+10
 ) r;
$$;
revoke all on function public.extra_daily_reminder_rows() from public,anon,authenticated;
grant execute on function public.extra_daily_reminder_rows() to service_role;

-- 06:00 Italian time, with hourly retries until 09:00 for failed deliveries.
-- Successful devices receive at most one summary per calendar day.
select cron.schedule('overgreen-extra-daily-reminders','0 * * * *',$cron$
 select net.http_post(
 url:='https://jwrzhydsqwmurorbwpbv.supabase.co/functions/v1/extra-daily-reminders',
 headers:=jsonb_build_object('Content-Type','application/json','x-reminder-token',(select decrypted_secret from vault.decrypted_secrets where name='extra_reminder_cron_token')),
 body:='{}'::jsonb,timeout_milliseconds:=60000
 ) where extract(hour from now() at time zone 'Europe/Rome') between 6 and 9;
$cron$);
