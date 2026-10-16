alter table public.schedule_items add column if not exists instruction_photos jsonb not null default '[]'::jsonb check(jsonb_typeof(instruction_photos)='array');
create or replace function public.overgreen_visit_photo_v243(p_item_id uuid,p_photo jsonb default null,p_remove_id text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare item public.schedule_items; result jsonb; prefix text;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Operazione riservata agli amministratori'; end if;
 select * into item from public.schedule_items where id=p_item_id for update;
 if not found or item.tipo<>'ordinario' then raise exception 'Passaggio non disponibile'; end if;
 if p_remove_id is not null then
  select coalesce(jsonb_agg(x),'[]'::jsonb) into result from jsonb_array_elements(item.instruction_photos) x where x->>'id'<>p_remove_id;
 else
  if item.stato in ('riportato','annullato') then raise exception 'Passaggio spostato o annullato: aggiorna il programma'; end if;
  prefix='punti-vendita/'||item.store_id||'/passaggi/'||item.id||'/';
  if p_photo->>'id' is null or p_photo->>'path' is null or p_photo->>'original_path' is null
   or left(p_photo->>'path',length(prefix))<>prefix or left(p_photo->>'original_path',length(prefix))<>prefix
   or length(coalesce(p_photo->>'caption',''))>500 then raise exception 'Dati foto non validi'; end if;
  if exists(select 1 from jsonb_array_elements(item.instruction_photos) x where x->>'id'=p_photo->>'id') then return item.instruction_photos; end if;
  if jsonb_array_length(item.instruction_photos)>=20 then raise exception 'Massimo 20 foto per passaggio'; end if;
  result=item.instruction_photos||jsonb_build_array(jsonb_build_object('id',p_photo->>'id','path',p_photo->>'path','original_path',p_photo->>'original_path','caption',coalesce(p_photo->>'caption',''),'created_at',now()));
 end if;
 update public.schedule_items set instruction_photos=result where id=p_item_id;
 return result;
end $$;
revoke all on function public.overgreen_visit_photo_v243(uuid,jsonb,text) from public,anon;
grant execute on function public.overgreen_visit_photo_v243(uuid,jsonb,text) to authenticated;
do $patch$
declare definition text;
begin
 select replace(pg_get_functiondef('public.rollover_overgreen_schedules(date)'::regprocedure),E'\r','') into definition;
 if position('itm.nota,' in definition)=0 then raise exception 'Rollover modificato: verifica necessaria'; end if;
 definition=replace(definition,'schedule_items(schedule_id,tipo,store_id,posizione,nota,stato)','schedule_items(schedule_id,tipo,store_id,posizione,nota,stato,instruction_photos)');
 definition=replace(definition,$$itm.nota,'da_fare'$$,$$itm.nota,'da_fare',itm.instruction_photos$$);
 execute definition;
 select replace(pg_get_functiondef('public.overgreen_save_ordinary_v197(uuid,uuid,uuid,date,text,text,boolean,uuid[],integer,uuid)'::regprocedure),E'\r','') into definition;
 if position('v_item.nota,' in definition)=0 then raise exception 'Continuazione modificata: verifica necessaria'; end if;
 definition=replace(definition,'schedule_items(schedule_id,tipo,store_id,posizione,nota,stato)','schedule_items(schedule_id,tipo,store_id,posizione,nota,stato,instruction_photos)');
 definition=replace(definition,$$v_item.nota,'da_fare'$$,$$v_item.nota,'da_fare',coalesce(v_item.instruction_photos,'[]'::jsonb)$$);
 definition=replace(definition,'    update public.extras set schedule_item_id=v_next_item',
 $merge$    update public.schedule_items si set instruction_photos=(select coalesce(jsonb_agg(distinct x),'[]'::jsonb) from jsonb_array_elements(si.instruction_photos||coalesce(v_item.instruction_photos,'[]'::jsonb)) x) where si.id=v_next_item;
    update public.extras set schedule_item_id=v_next_item$merge$);
 execute definition;
end $patch$;
