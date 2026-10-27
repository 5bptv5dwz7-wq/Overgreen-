begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $$
declare s uuid; a uuid:=auth.uid(); w uuid; rid uuid:=gen_random_uuid(); p jsonb; r jsonb; t uuid:=gen_random_uuid(); d date:=(now() at time zone 'Europe/Rome')::date;
begin
 insert into public.stores(nome,client_type,cleaning_enabled,cleaning_start) values('TEST V314 ROLLBACK','eurospin',true,d-1) returning id into s;
 p:=jsonb_build_object('stato','in_attesa','giorno_intervento',d,'closed_at',clock_timestamp(),'closed_by',a,'note_lorenzo','Una sola registrazione');
 begin perform public.overgreen_cleaning_register_v314(rid,s,array['A/1','A/2'],p,array[]::uuid[]);raise exception 'Invalid team accepted';exception when others then if sqlerrm='Invalid team accepted' then raise;end if;end;
 assert not exists(select 1 from public.extras where store_id=s),'failed registration must roll back visit';
 r:=public.overgreen_cleaning_register_v314(rid,s,array['A/1','A/2'],p,array[a]);
 assert r->>'stato'='in_attesa';assert public.overgreen_cleaning_register_v314(rid,s,array['A/1','A/2'],p,array[a])=r,'retry';
 assert (select count(*)=1 from public.extras where store_id=s),'one visit';
 perform public.overgreen_cleaning_create_v308(t,s,d,array['TARGET']);
 perform public.overgreen_cleaning_create_v308(gen_random_uuid(),s,d,array['D/2'],null,t);
 assert (select cleaning_codes=array['D/2'] and cleaning_slot=1 from public.extras where id=t),'classified target converts';
 perform public.overgreen_cleaning_create_v308(gen_random_uuid(),s,d,array['D/2'],null,t);
 assert (select cleaning_slot=1 from public.extras where id=t),'conversion retry keeps slot';
 select id into w from public.profiles where ruolo='dipendente' and attivo limit 1;perform set_config('request.jwt.claim.sub',w::text,true);
 begin perform public.overgreen_cleaning_register_v314(gen_random_uuid(),s,array['A/1'],p,array[w]);raise exception 'Worker allowed';exception when insufficient_privilege then null;end;
 assert not has_function_privilege('anon','public.overgreen_cleaning_register_v314(uuid,uuid,text[],jsonb,uuid[])','execute');
end $$;
rollback;
