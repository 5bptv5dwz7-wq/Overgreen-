begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $$
declare s uuid; i uuid; e uuid:=gen_random_uuid(); a uuid:=auth.uid(); w uuid; d date:=(now() at time zone 'Europe/Rome')::date;
begin
 insert into public.stores(nome,client_type,cleaning_enabled,cleaning_start) values('TEST V311 ROLLBACK','eurospin',true,d-10) returning id into s;
 perform public.overgreen_set_store_reminder_v234(s,null,'Verde',true);
 perform public.overgreen_set_cleaning_reminder_v311(s,d,'Pulizie',true);
 assert (select count(*)=2 from public.store_reminders where store_id=s),'two independent reminders';
 insert into public.interventions(store_id,inserito_da,stato,data_intervento) values(s,a,'convalidato',d) returning id into i;
 assert (select active from public.store_reminders where store_id=s and service='pulizie'),'green must not resolve cleaning';
 assert (select not active from public.store_reminders where store_id=s and service='verde'),'green resolved';
 perform public.overgreen_set_store_reminder_v234(s,null,'Verde nuovo',true);
 perform public.overgreen_cleaning_create_v308(e,s,d,array['A/1','A/2']);
 perform public.overgreen_cleaning_close_v309(e,array['A/1','A/2'],jsonb_build_object('stato','in_attesa','giorno_intervento',d,'closed_at',clock_timestamp(),'closed_by',a),array[a]);
 assert (select active from public.store_reminders where store_id=s and service='pulizie'),'pending must not resolve';
 update public.extras set stato='completato' where id=e;
 assert (select not active from public.store_reminders where store_id=s and service='pulizie'),'cleaning approved resolves';
 assert (select active from public.store_reminders where store_id=s and service='verde'),'cleaning must not resolve green';
 update public.extras set stato='in_attesa' where id=e;
 assert (select active from public.store_reminders where store_id=s and service='pulizie'),'reopen restores';
 select id into w from public.profiles where ruolo='dipendente' and attivo limit 1;
 perform set_config('request.jwt.claim.sub',w::text,true);
 begin perform public.overgreen_set_cleaning_reminder_v311(s,null,'Forbidden',true);raise exception 'worker allowed';exception when insufficient_privilege then null;end;
 assert not has_function_privilege('anon','public.overgreen_set_cleaning_reminder_v311(uuid,date,text,boolean)','execute');
end $$;
rollback;
