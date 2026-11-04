create or replace function public.edit_extra_day_v326(p_id uuid,p_revision bigint,p_day date,p_notes text,p_workers uuid[],p_keep uuid[],p_new jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare d public.extra_work_days; current_day boolean; files jsonb; item jsonb; a public.attachments; target uuid;
begin
 if not coalesce(public.is_admin(),false) then raise exception 'Solo amministratore'; end if;
 select extra_id into strict target from public.extra_work_days where id=p_id;
 perform 1 from public.extras where id=target for update;
 select * into strict d from public.extra_work_days where id=p_id for update;
 if d.revision is distinct from p_revision then raise exception 'Giornata modificata da un’altra sessione. Riaprila per aggiornare.'; end if;
 if p_day is null or coalesce(cardinality(p_workers),0)=0 or length(p_notes)>20000 or exists(select 1 from unnest(p_workers) w where not exists(select 1 from public.profiles p where p.id=w)) then raise exception 'Verifica data, note e squadra'; end if;
 select d.id=(select id from public.extra_work_days where extra_id=target order by created_at desc,id desc limit 1) into current_day;
 select coalesce(jsonb_agg(f),'[]') into files from jsonb_array_elements(d.attachments) f where (f->>'id')::uuid=any(p_keep);
 for item in select value from jsonb_array_elements(p_new) loop
  a=jsonb_populate_record(null::public.attachments,item);
  if a.id is null or a.tipo not in ('foto_generica','rapportino_eurospin','rapportino_overgreen') or a.storage_path is distinct from ('extra/'||target||'/'||a.id||'-'||regexp_replace(a.nome_file,'[^a-zA-Z0-9._-]','-','g')) then raise exception 'Allegato non valido'; end if;
  a.extra_id=target; a.intervention_id=null; a.created_at=now(); a.caricato_da=auth.uid();
  if current_day or a.tipo='foto_generica' then insert into public.attachments select a.*; end if;
  files=files||jsonb_build_array(to_jsonb(a));
 end loop;
 delete from public.attachments t where t.extra_id=target and exists(select 1 from jsonb_array_elements(d.attachments) f where f->>'id'=t.id::text) and not exists(select 1 from jsonb_array_elements(files) f where f->>'id'=t.id::text) and not exists(select 1 from public.extra_work_days other where other.extra_id=target and other.id<>p_id and other.attachments @> jsonb_build_array(jsonb_build_object('id',t.id)));
 update public.extra_work_days set day=p_day,notes=p_notes,workers=p_workers,attachments=files,revision=revision+1 where id=p_id;
 if current_day then
  update public.extras set giorno_intervento=case when giorno_intervento=d.day then p_day else giorno_intervento end,note_lorenzo=case when coalesce(note_lorenzo,'')=coalesce(d.notes,'') then p_notes else note_lorenzo end where id=target;
  if d.workers is distinct from p_workers then
   delete from public.extra_workers where extra_id=target and not(profile_id=any(p_workers));
   insert into public.extra_workers select target,w from unnest(p_workers) w on conflict do nothing;
  end if;
 end if;
end $$;
revoke all on function public.edit_extra_day_v326(uuid,bigint,date,text,uuid[],uuid[],jsonb) from public,anon;
grant execute on function public.edit_extra_day_v326(uuid,bigint,date,text,uuid[],uuid[],jsonb) to authenticated;
