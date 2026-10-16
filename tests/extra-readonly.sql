begin;
select set_config('test.admin',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true),set_config('test.worker',(select id::text from public.profiles where ruolo<>'admin' and attivo limit 1),true),set_config('test.extra',gen_random_uuid()::text,true);
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.admin'),true);
insert into public.extras(id,nome_esterno,titolo,stato,creato_da) values(current_setting('test.extra')::uuid,'TEST ROLLBACK','Test sola lettura','ricevuto',auth.uid());
select set_config('request.jwt.claim.sub',current_setting('test.worker'),true);
do $$declare n int;begin
 if not exists(select 1 from public.extras where id=current_setting('test.extra')::uuid) then raise exception 'FAIL cannot read unassigned extra';end if;
 update public.extras set titolo='NOT ALLOWED' where id=current_setting('test.extra')::uuid;
 get diagnostics n=row_count;if n<>0 then raise exception 'FAIL employee updated unassigned';end if;
 delete from public.extras where id=current_setting('test.extra')::uuid;
 get diagnostics n=row_count;if n<>0 then raise exception 'FAIL employee deleted unassigned';end if;
 begin
  insert into public.extra_workers(extra_id,profile_id) values(current_setting('test.extra')::uuid,auth.uid());
  raise exception 'FAIL employee self assigned';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.extras(nome_esterno,titolo,stato,creato_da) values('TEST','NOT ALLOWED','ricevuto',auth.uid());
  raise exception 'FAIL employee created extra';
 exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claim.sub',current_setting('test.admin'),true);
insert into public.extra_workers(extra_id,profile_id) values(current_setting('test.extra')::uuid,current_setting('test.worker')::uuid);
select set_config('request.jwt.claim.sub',current_setting('test.worker'),true);
do $$declare n int;begin
 update public.extras set stato='da_integrare',note_lorenzo='Test progress' where id=current_setting('test.extra')::uuid;
 get diagnostics n=row_count;if n<>1 then raise exception 'FAIL assigned progress denied';end if;
 update public.extras set stato='in_attesa',closed_by=auth.uid(),closed_at=now() where id=current_setting('test.extra')::uuid;
 get diagnostics n=row_count;if n<>1 then raise exception 'FAIL assigned closure denied';end if;
end$$;
reset role;
rollback;
