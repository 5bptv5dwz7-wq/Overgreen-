-- Extend the existing atomic, idempotent scheduler using its current definition.
-- The per-visit column and admin-only write policy already exist.
do $migration$
declare definition text;
 old_insert text := $$insert into schedule_items(schedule_id,tipo,store_id,posizione,stato) values(v_id,'ordinario',v_sid,v_pos,'da_fare') returning * into v_item;$$;
 new_insert text := $$if length(coalesce(p_payload->'item_notes'->>v_sid::text,''))>2000 then raise exception 'Appunto troppo lungo (massimo 2000 caratteri)'; end if;
   insert into schedule_items(schedule_id,tipo,store_id,posizione,stato,nota) values(v_id,'ordinario',v_sid,v_pos,'da_fare',nullif(trim(p_payload->'item_notes'->>v_sid::text),'')) returning * into v_item;$$;
begin
 select pg_get_functiondef('public.overgreen_admin_v198(uuid,text,jsonb)'::regprocedure) into definition;
 if position(old_insert in definition)=0 then raise exception 'Definizione scheduler cambiata: controllare prima di applicare'; end if;
 execute replace(definition,old_insert,new_insert);
end $migration$;
