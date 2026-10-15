begin;
select set_config('test.worker_a',(select id::text from public.profiles where attivo and ruolo<>'admin' order by id limit 1),true);
select set_config('test.worker_b',(select id::text from public.profiles where attivo and ruolo<>'admin' order by id offset 1 limit 1),true);
select set_config('test.admin',(select id::text from public.profiles where attivo and ruolo='admin' limit 1),true);
select set_config('test.device_a',gen_random_uuid()::text,true),set_config('test.device_b',gen_random_uuid()::text,true);
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.worker_a'),true);
insert into public.app_devices(id,user_id,label,version) values(current_setting('test.device_a')::uuid,auth.uid(),'TEST ROLLBACK','V230');
update public.app_devices set busy=true,version='V230' where id=current_setting('test.device_a')::uuid;
do $$begin
 begin
  insert into public.app_reload_commands(device_id,mode,required_version) values(current_setting('test.device_a')::uuid,'force','V230');
  raise exception 'FAIL: employee sent a command';
 exception when insufficient_privilege then null;end;
 begin
  update public.app_devices set user_id=current_setting('test.worker_b')::uuid where id=current_setting('test.device_a')::uuid;
  raise exception 'FAIL: device ownership changed';
 exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claim.sub',current_setting('test.worker_b'),true);
insert into public.app_devices(id,user_id,label,version) values(current_setting('test.device_b')::uuid,auth.uid(),'TEST ROLLBACK','V230');
do $$begin
 if exists(select 1 from public.app_devices where id=current_setting('test.device_a')::uuid) then raise exception 'FAIL: staff read another device';end if;
 update public.app_devices set busy=true where id=current_setting('test.device_a')::uuid;
 if found then raise exception 'FAIL: staff changed another device';end if;
end$$;
select set_config('request.jwt.claim.sub',current_setting('test.admin'),true);
insert into public.app_reload_commands(device_id,mode,required_version) values(current_setting('test.device_a')::uuid,'safe','V230');
do $$begin
 if (select count(*) from public.app_devices where id in(current_setting('test.device_a')::uuid,current_setting('test.device_b')::uuid))<>2 then raise exception 'FAIL: admin cannot read devices';end if;
end$$;
select set_config('request.jwt.claim.sub',current_setting('test.worker_b'),true);
do $$begin
 if exists(select 1 from public.app_reload_commands where device_id=current_setting('test.device_a')::uuid) then raise exception 'FAIL: staff read another command';end if;
 update public.app_reload_commands set status='completed' where device_id=current_setting('test.device_a')::uuid;
 if found then raise exception 'FAIL: staff acknowledged another device';end if;
end$$;
select set_config('request.jwt.claim.sub',current_setting('test.worker_a'),true);
update public.app_reload_commands set status='waiting' where device_id=current_setting('test.device_a')::uuid;
update public.app_reload_commands set status='reloading' where device_id=current_setting('test.device_a')::uuid;
update public.app_reload_commands set status='completed',loaded_version='V230' where device_id=current_setting('test.device_a')::uuid;
do $$begin
 if not exists(select 1 from public.app_reload_commands where device_id=current_setting('test.device_a')::uuid and status='completed') then raise exception 'FAIL: own acknowledgement failed';end if;
 begin
  update public.app_reload_commands set mode='force' where device_id=current_setting('test.device_a')::uuid;
  raise exception 'FAIL: employee changed mode';
 exception when insufficient_privilege then null;end;
end$$;
set local role anon;
do $$begin
 begin
  perform 1 from public.app_devices;
  raise exception 'FAIL: anonymous read';
 exception when insufficient_privilege then null;end;
end$$;
rollback;
select 'Remote reload RLS tests passed; all test devices and commands rolled back' as result;
