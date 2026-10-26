-- Synthetic data only; the entire transaction, including audit entries, rolls back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $test$
declare s uuid; a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); t uuid:=gen_random_uuid(); m uuid:=gen_random_uuid(); r jsonb; blocked boolean; worker uuid;
begin
 insert into public.stores(nome,client_type,attivo,cleaning_enabled,cleaning_start) values('TEST V308 ROLLBACK','eurospin',true,true,'2026-01-01') returning id into s;
 r:=public.overgreen_cleaning_create_v308(a,s,'2026-10-27',array['D/2']);assert (r->>'cleaning_slot')::int=1,'first reservation';
 r:=public.overgreen_cleaning_create_v308(a,s,'2026-10-27',array['D/2']);assert (select count(*)=1 from public.extras where store_id=s),'idempotent retry';
 r:=public.overgreen_cleaning_create_v308(b,s,'2026-11-27',array['D/2']);assert (r->>'cleaning_slot')::int=2,'second reservation';
 blocked:=false;begin perform public.overgreen_cleaning_create_v308(gen_random_uuid(),s,'2026-12-27',array['D/2']);exception when others then blocked:=true;end;assert blocked,'third blocked';
 update public.extras set stato='annullato' where id=b;
 r:=public.overgreen_cleaning_create_v308(gen_random_uuid(),s,'2026-12-27',array['D/2']);assert (r->>'cleaning_slot')::int=2,'cancel releases slot';
 r:=public.overgreen_cleaning_create_v308(m,s,'2026-10-28',array['A/1','A/2','C/1','C/2']);assert (select count(*)=4 from public.extra_work_items where extra_id=m),'single visit four tasks';
 blocked:=false;begin update public.extras set stato='in_attesa' where id=m;exception when others then blocked:=true;end;assert blocked,'unfinished closure blocked';
 update public.extra_work_items set stato='completata' where extra_id=m;
 update public.extras set stato='in_attesa' where id=m;
 update public.extras set stato='completato',convalidato_da=auth.uid(),convalidato_il=now() where id=m;
 insert into public.extras(id,store_id,titolo,client_type,categoria_target,stato,creato_da) values(t,s,'Target prova','eurospin','pulizie','ricevuto',auth.uid());
 r:=public.overgreen_cleaning_create_v308(gen_random_uuid(),s,'2027-01-10',array['D/2'],null,t);assert r->>'id'=t::text,'classifies same target';assert (r->>'cleaning_year')::int=2027,'new year';
 select id into worker from public.profiles where ruolo='dipendente' and attivo limit 1;
 assert worker is not null,'worker exists';perform set_config('request.jwt.claim.sub',worker::text,true);
 blocked:=false;begin perform public.overgreen_cleaning_create_v308(gen_random_uuid(),s,'2027-03-10',array['D/2']);exception when insufficient_privilege then blocked:=true;end;assert blocked,'worker cannot create';
end $test$;
rollback;
