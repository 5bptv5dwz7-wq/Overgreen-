begin;
-- Entire fixture and all audit effects are rolled back.
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $$
declare v uuid; sid uuid; child uuid; item uuid; st uuid; rev bigint; r public.trip_mileage; response jsonb; denied boolean:=false;
begin
 insert into public.vehicles(nome,targa) values('TEST ROLLBACK','TEST-303') returning id into v;
 select id into st from public.stores where attivo limit 1;
 response=public.overgreen_admin_v198(gen_random_uuid(),'schedule_create',jsonb_build_object('day',current_date,'members',jsonb_build_array(auth.uid()),'stores',jsonb_build_array(st),'extras','[]'::jsonb,'vehicle_id',v,'auto_rollover',false));sid=(response->>'id')::uuid;
 if (select vehicle_id from public.schedules where id=sid)<>v then raise exception 'FAIL create with vehicle'; end if;
 select id into item from public.schedule_items where schedule_id=sid limit 1;
 select mileage_revision into rev from public.schedules where id=sid;
 select * into r from public.overgreen_capture_mileage_v303(sid,rev,'[{"from":"Casa","to":"PV","km":100,"minutes":90}]');
 if r.completed or r.estimated_km<>100 then raise exception 'FAIL planned'; end if;
 begin perform public.overgreen_capture_mileage_v303(sid,rev-1,'[]');exception when others then denied=true;end;
 if not denied then raise exception 'FAIL stale revision';end if;
 update public.schedule_items set stato='completato' where id=item;
 -- Existing linked extras may keep the fixture open: complete only those linked by this fixture.
 update public.extras set stato='completato' where schedule_id=sid;
 select * into r from public.trip_mileage where schedule_id=sid;
 if not r.completed then raise exception 'FAIL completion trigger';end if;
 update public.schedule_items set stato='da_fare' where id=item;
 if (select completed from public.trip_mileage where schedule_id=sid) then raise exception 'FAIL reopened';end if;
 update public.trip_mileage set actual_km=120,odometer_start=1000,odometer_end=1120,confirmed_at=now(),confirmed_by=auth.uid() where id=r.id;
 select mileage_revision into rev from public.schedules where id=sid;
 select * into r from public.overgreen_capture_mileage_v303(sid,rev,'[{"from":"Casa","to":"PV","km":999,"minutes":90}]');
 if r.estimated_km<>100 or r.actual_km<>120 then raise exception 'FAIL confirmation overwritten';end if;
 update public.vehicles set attivo=false where id=v;
 if not exists(select 1 from public.trip_mileage where schedule_id=sid and vehicle_label like 'TEST%') then raise exception 'FAIL archive history';end if;
end $$;
reset role;
-- Employee can read only records containing their membership, never edit vehicles or capture km.
do $$ declare employee uuid; other uuid; begin
 select id into employee from public.profiles where ruolo<>'admin' and attivo limit 1;
 select id into other from public.profiles where ruolo='admin' and attivo limit 1;
 if employee is null then raise exception 'Employee fixture missing';end if;
 insert into public.trip_mileage(giorno,member_ids,member_names,note) values(current_date,array[employee],'[]','test-own-303'),(current_date,array[other],'[]','test-other-303');
 perform set_config('request.jwt.claim.sub',employee::text,true);
end $$;
set local role authenticated;
do $$ declare denied boolean:=false; begin
 if (select count(*) from public.trip_mileage where note like 'test-%-303')<>1 then raise exception 'FAIL RLS read';end if;
 begin insert into public.vehicles(nome) values('NOT ALLOWED');exception when insufficient_privilege then denied=true;end;
 if not denied then raise exception 'FAIL RLS write';end if;
 denied=false;begin perform public.overgreen_capture_mileage_v303(gen_random_uuid(),0,'[]');exception when others then denied=true;end;
 if not denied then raise exception 'FAIL employee capture';end if;
end $$;
rollback;
