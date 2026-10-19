begin;
create table public.extra_package_reviews (
 extra_id uuid not null references public.extras(id) on delete cascade,
 reviewer_id uuid not null references public.profiles(id) on delete cascade,
 fingerprint text not null,
 checks jsonb not null default '{}'::jsonb,
 closure_number text not null default '',
 note text not null default '',
 updated_at timestamptz not null default now(),
 primary key(extra_id,reviewer_id)
);
alter table public.extra_package_reviews enable row level security;
revoke all on public.extra_package_reviews from public,anon,authenticated;
grant select,insert,update,delete on public.extra_package_reviews to authenticated;
create policy review_admin on public.extra_package_reviews for all to authenticated
 using ((select public.is_admin()) and reviewer_id=(select auth.uid()))
 with check ((select public.is_admin()) and reviewer_id=(select auth.uid()));
create table public.extra_report_versions (
 id uuid primary key default gen_random_uuid(),
 extra_id uuid not null references public.extras(id) on delete cascade,
 attachment jsonb not null,
 replaced_by uuid not null references public.profiles(id),
 replaced_at timestamptz not null default now()
);
create index extra_report_versions_extra_idx on public.extra_report_versions(extra_id,replaced_at desc);
alter table public.extra_report_versions enable row level security;
revoke all on public.extra_report_versions from public,anon,authenticated;
grant select,insert on public.extra_report_versions to authenticated;
create policy versions_read on public.extra_report_versions for select to authenticated using ((select public.is_admin()));
create policy versions_insert on public.extra_report_versions for insert to authenticated with check ((select public.is_admin()) and replaced_by=(select auth.uid()));

create function public.extra_package_fingerprint(p_id uuid) returns text
language plpgsql stable security invoker set search_path='' as $$
declare v text;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo amministratori'; end if;
 select md5(jsonb_build_object('extra',to_jsonb(e),'economics',(select to_jsonb(h) from public.extra_labor_hours h where h.extra_id=e.id),
 'attachments',(select jsonb_agg(to_jsonb(a)||jsonb_build_object('stored_updated_at',o.updated_at,'stored_metadata',o.metadata) order by a.id) from public.attachments a left join storage.objects o on o.bucket_id='documenti' and o.name=a.storage_path where a.extra_id=e.id),
 'workers',(select jsonb_agg(to_jsonb(w)||jsonb_build_object('name',p.nome) order by w.profile_id) from public.extra_workers w left join public.profiles p on p.id=w.profile_id where w.extra_id=e.id),
 'store',(select to_jsonb(s) from public.stores s where s.id=e.store_id))::text) into v from public.extras e where e.id=p_id;
 if v is null then raise exception 'Extra non disponibile'; end if;
 return v;
end $$;
create function public.extra_package_review_context(p_ids uuid[]) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare v jsonb;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo amministratori'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('extra_id',e.id,'fingerprint',public.extra_package_fingerprint(e.id),'review',to_jsonb(r))), '[]'::jsonb) into v
 from public.extras e left join public.extra_package_reviews r on r.extra_id=e.id and r.reviewer_id=auth.uid() where e.id=any(p_ids);
 return v;
end $$;
create function public.save_extra_package_review(p_id uuid,p_fingerprint text,p_step text,p_value boolean,p_number text default '',p_note text default '') returns jsonb
language plpgsql security invoker set search_path='' as $$
declare r public.extra_package_reviews; f text;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo amministratori'; end if;
 perform 1 from public.extras where id=p_id for update;
 f=public.extra_package_fingerprint(p_id);
 if f is distinct from p_fingerprint then raise exception 'Dati cambiati: aggiorna la verifica'; end if;
 if p_step not in ('eurospin','overgreen','economics','reset') then raise exception 'Passaggio non valido'; end if;
 select * into r from public.extra_package_reviews where extra_id=p_id and reviewer_id=auth.uid() for update;
 if r.fingerprint is distinct from f then r.checks='{}'::jsonb; end if;
 if p_step='economics' and p_value and (coalesce((r.checks->>'eurospin')::boolean,false)=false or coalesce((r.checks->>'overgreen')::boolean,false)=false or p_number !~ '^[0-9]{5,8}$') then raise exception 'Verifica prima entrambi i rapportini e il numero chiusura'; end if;
 if p_step='reset' then r.checks='{}'::jsonb;
 else r.checks=coalesce(r.checks,'{}'::jsonb)||jsonb_build_object(p_step,p_value); end if;
 insert into public.extra_package_reviews(extra_id,reviewer_id,fingerprint,checks,closure_number,note)
 values(p_id,auth.uid(),f,r.checks,coalesce(p_number,''),left(coalesce(p_note,''),2000))
 on conflict(extra_id,reviewer_id) do update set fingerprint=excluded.fingerprint,checks=excluded.checks,closure_number=excluded.closure_number,note=excluded.note,updated_at=now()
 returning * into r;
 return to_jsonb(r);
end $$;

create function public.replace_review_report(p_id uuid,p_tipo text,p_fingerprint text,p_new_id uuid,p_path text,p_name text,p_mime text,p_size bigint) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare a public.attachments; v public.attachments;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo amministratori'; end if;
 if p_tipo not in ('rapportino_eurospin','rapportino_overgreen','pdf_richiesta') then raise exception 'Tipo non valido'; end if;
 perform 1 from public.extras where id=p_id for update;
 select * into v from public.attachments where id=p_new_id and extra_id=p_id and storage_path=p_path;
 if found then return to_jsonb(v); end if;
 if public.extra_package_fingerprint(p_id) is distinct from p_fingerprint then raise exception 'Documenti o dati cambiati. Aggiorna prima di sostituire.'; end if;
 if p_path not like 'extra/'||p_id::text||'/'||p_new_id::text||'-%' or p_size<=0 or p_mime not in ('application/pdf','image/jpeg','image/png','image/webp') then raise exception 'File non valido'; end if;
 for a in select * from public.attachments where extra_id=p_id and tipo::text=p_tipo for update loop
  insert into public.extra_report_versions(extra_id,attachment,replaced_by) values(p_id,to_jsonb(a),auth.uid());
  delete from public.attachments where id=a.id;
 end loop;
 insert into public.attachments(id,extra_id,tipo,storage_path,nome_file,mime_type,dimensione_bytes,caricato_da)
 values(p_new_id,p_id,p_tipo::public.tipo_allegato,p_path,p_name,p_mime,p_size,auth.uid()) returning * into v;
 if p_tipo in ('rapportino_eurospin','rapportino_overgreen') then
  update public.extra_labor_hours set source_attachment_id=null,revision=revision+1,updated_at=now(),updated_by=auth.uid() where extra_id=p_id;
 end if;
 return to_jsonb(v);
end $$;
revoke all on function public.extra_package_fingerprint(uuid),public.extra_package_review_context(uuid[]),public.save_extra_package_review(uuid,text,text,boolean,text,text),public.replace_review_report(uuid,text,text,uuid,text,text,text,bigint) from public,anon;
grant execute on function public.extra_package_fingerprint(uuid),public.extra_package_review_context(uuid[]),public.save_extra_package_review(uuid,text,text,boolean,text,text),public.replace_review_report(uuid,text,text,uuid,text,text,text,bigint) to authenticated;
commit;
