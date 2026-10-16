alter table public.stores add column if not exists next_visit_dismissed_source uuid;
alter table public.stores add column if not exists next_visit_dismissed_text text;
create or replace function public.overgreen_dismiss_next_visit_note_v241(p_store_id uuid,p_expected_note text)
returns void language plpgsql security invoker set search_path='' as $$
declare current_note text; source_id uuid;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Operazione riservata agli amministratori'; end if;
 select next_visit_note into current_note from public.stores where id=p_store_id for update;
 if not found then raise exception 'Sede non disponibile'; end if;
 if current_note is distinct from p_expected_note then raise exception 'Il promemoria è cambiato: aggiorna i dati prima di rimuoverlo'; end if;
 select i.id into source_id from public.interventions i where i.store_id=p_store_id and i.stato='convalidato' and not coalesce(i.multi_day_open,false)
 order by coalesce(i.data_fine,i.data_intervento) desc nulls last,i.closed_at desc nulls last,i.created_at desc,i.id desc limit 1;
 update public.stores set next_visit_dismissed_source=source_id,next_visit_dismissed_text=current_note,next_visit_note=null where id=p_store_id;
end $$;
revoke all on function public.overgreen_dismiss_next_visit_note_v241(uuid,text) from public,anon;
grant execute on function public.overgreen_dismiss_next_visit_note_v241(uuid,text) to authenticated;
do $patch$
declare definition text;
begin
 select pg_get_functiondef('public.overgreen_refresh_last_visit_v196(uuid)'::regprocedure) into definition;
 definition=replace(definition,E'\r','');
 if position('into v_day, v_note' in definition)=0 then raise exception 'Definizione ricalcolo modificata: verifica necessaria'; end if;
 definition=replace(definition,'v_note text;','v_note text; v_source uuid;');
 definition=replace(definition,'i.next_visit_note','i.next_visit_note, i.id');
 definition=replace(definition,'into v_day, v_note','into v_day, v_note, v_source');
 definition=replace(definition,'next_visit_note = v_note','next_visit_note = case when next_visit_dismissed_source=v_source and next_visit_dismissed_text is not distinct from v_note then null else v_note end');
 execute definition;
end $patch$;
