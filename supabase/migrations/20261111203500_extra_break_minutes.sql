alter table public.extra_work_days add column break_minutes integer,
 add constraint extra_work_break_duration check (
  break_minutes is null or (work_start is not null and work_end is not null
   and break_minutes between 0 and mod(extract(epoch from (work_end-work_start))::integer+86400,86400)/60)
 );

create or replace function public.overgreen_close_extra_day_v319(p_extra_id uuid,p_payload jsonb,p_workers uuid[],p_day_id uuid,p_attachments uuid[],p_deferred boolean default false)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare d public.extra_work_days; result jsonb; files jsonb; members uuid[]; work_day date;
begin
 if auth.uid() is null or not public.is_active_user() or not public.can_access_extra(p_extra_id) then raise exception 'Extra non accessibile'; end if;
 perform 1 from public.extras where id=p_extra_id for update;
 select * into d from public.extra_work_days where id=p_day_id;
 if found then
  if d.extra_id<>p_extra_id then raise exception 'Giornata non valida'; end if;
  return to_jsonb(d);
 end if;
 work_day=(p_payload->>'giorno_intervento')::date;
 if p_day_id is null or work_day is null then raise exception 'Data della giornata obbligatoria'; end if;
 if length(coalesce(p_payload->>'note_lorenzo',''))>20000 then raise exception 'Note troppo lunghe'; end if;
 if exists(select 1 from unnest(p_attachments) a where not exists(select 1 from public.attachments where id=a and extra_id=p_extra_id)) then raise exception 'Allegato non disponibile'; end if;
 select coalesce(jsonb_agg(to_jsonb(a)),'[]') into files from public.attachments a where a.id=any(p_attachments) and a.extra_id=p_extra_id;
 if p_deferred then
  result=public.overgreen_close_extra_deferred_v316(p_extra_id,p_payload,p_workers);
 else
  result=public.overgreen_close_extra_v271(p_extra_id,p_payload,p_workers);
 end if;
 select coalesce(p_workers,array_agg(profile_id),'{}') into members from public.extra_workers where extra_id=p_extra_id;
 insert into public.extra_work_days(id,extra_id,day,notes,workers,attachments,night_hours,final,created_by,technician_count,work_start,work_end,break_minutes)
 values(p_day_id,p_extra_id,work_day,coalesce(p_payload->>'note_lorenzo',''),members,files,coalesce((p_payload->>'night_hours')::numeric,0),p_payload->>'stato'='in_attesa',auth.uid(),nullif(p_payload->>'technician_count','')::integer,nullif(p_payload->>'work_start','')::time,nullif(p_payload->>'work_end','')::time,nullif(p_payload->>'break_minutes','')::integer) returning * into d;
 return to_jsonb(d);
end $$;
revoke all on function public.overgreen_close_extra_day_v319(uuid,jsonb,uuid[],uuid,uuid[],boolean) from public,anon;
grant execute on function public.overgreen_close_extra_day_v319(uuid,jsonb,uuid[],uuid,uuid[],boolean) to authenticated;

-- Reuse the existing authorization, revision guard and attachment transaction.
create or replace function public.edit_extra_day_v328(p_id uuid,p_revision bigint,p_day date,p_notes text,p_workers uuid[],p_keep uuid[],p_new jsonb,p_work_details jsonb)
returns void language plpgsql security invoker set search_path='' as $$
begin
 perform public.edit_extra_day_v326(p_id,p_revision,p_day,p_notes,p_workers,p_keep,p_new);
 update public.extra_work_days set
  technician_count=nullif(p_work_details->>'technician_count','')::integer,
  work_start=nullif(p_work_details->>'work_start','')::time,
  work_end=nullif(p_work_details->>'work_end','')::time,
  break_minutes=case when p_work_details ? 'break_minutes' then nullif(p_work_details->>'break_minutes','')::integer else break_minutes end
 where id=p_id;
end $$;
revoke all on function public.edit_extra_day_v328(uuid,bigint,date,text,uuid[],uuid[],jsonb,jsonb) from public,anon;
grant execute on function public.edit_extra_day_v328(uuid,bigint,date,text,uuid[],uuid[],jsonb,jsonb) to authenticated;
