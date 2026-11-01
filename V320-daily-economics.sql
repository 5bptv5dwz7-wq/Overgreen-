create or replace function public.extra_package_fingerprint(p_id uuid) returns text
language plpgsql stable security invoker set search_path='' as $$
declare v text;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo amministratori'; end if;
 select md5(jsonb_build_object('extra',to_jsonb(e),'economics',(select to_jsonb(h) from public.extra_labor_hours h where h.extra_id=e.id),
 'attachments',(select jsonb_agg(to_jsonb(a)||jsonb_build_object('stored_updated_at',o.updated_at,'stored_metadata',o.metadata) order by a.id) from public.attachments a left join storage.objects o on o.bucket_id='documenti' and o.name=a.storage_path where a.extra_id=e.id),
 'workers',(select jsonb_agg(to_jsonb(w)||jsonb_build_object('name',p.nome) order by w.profile_id) from public.extra_workers w left join public.profiles p on p.id=w.profile_id where w.extra_id=e.id),
 'days',(select jsonb_agg(to_jsonb(d)||jsonb_build_object('economics',de.record) order by d.id) from public.extra_work_days d left join public.extra_day_economics de on de.day_id=d.id where d.extra_id=e.id),
 'store',(select to_jsonb(s) from public.stores s where s.id=e.store_id))::text) into v from public.extras e where e.id=p_id;
 if v is null then raise exception 'Extra non disponibile'; end if;
 return v;
end $$;
