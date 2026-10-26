do $patch$
declare definition text;
old_guard text := 'if not v_admin and (cardinality(p_workers)<>1 or p_workers[1]<>v_actor) then raise exception ''Puoi registrare soltanto il tuo lavoro''; end if;';
new_guard text := $guard$if not v_admin and (cardinality(p_workers)<>1 or p_workers[1]<>v_actor) then
    -- V306: employees may submit exactly their assigned active team, never arbitrary workers.
    if p_item_id is null or not exists (
      select 1 from public.schedule_items si
      where si.id=p_item_id and si.store_id=p_store_id and si.tipo='ordinario'
        and exists(select 1 from public.schedule_members sm where sm.schedule_id=si.schedule_id and sm.profile_id=v_actor)
        and not exists(select 1 from unnest(p_workers) w where not exists(
          select 1 from public.schedule_members sm where sm.schedule_id=si.schedule_id and sm.profile_id=w))
        and not exists(select 1 from public.schedule_members sm join public.profiles p on p.id=sm.profile_id and p.attivo
          where sm.schedule_id=si.schedule_id and not(sm.profile_id=any(p_workers)))
    ) then raise exception 'Puoi registrare soltanto il tuo lavoro o la squadra assegnata'; end if;
  end if;$guard$;
begin
  definition := pg_get_functiondef('public.overgreen_save_ordinary_v197(uuid,uuid,uuid,date,text,text,boolean,uuid[],integer,uuid)'::regprocedure);
  if position(old_guard in definition)=0 then raise exception 'Unexpected ordinary worker guard; patch aborted'; end if;
  execute replace(definition,old_guard,new_guard);
end $patch$;
