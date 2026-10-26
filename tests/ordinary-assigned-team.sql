begin;
do $test$
declare a uuid; w1 uuid; w2 uuid; st uuid; sch uuid; item uuid; result jsonb; iid uuid; req uuid:=gen_random_uuid(); blocked boolean;
begin
  select id into a from public.profiles where ruolo='admin' and attivo limit 1;
  select id into w1 from public.profiles where ruolo='dipendente' and attivo order by id limit 1;
  select id into w2 from public.profiles where ruolo='dipendente' and attivo and id<>w1 order by id limit 1;
  assert a is not null and w1 is not null and w2 is not null, 'Need test actors';
  perform set_config('request.jwt.claim.sub',a::text,true);
  insert into public.stores(nome) values('V306 QA ROLLBACK') returning id into st;
  insert into public.schedules(giorno,creato_da) values('2099-01-01',a) returning id into sch;
  insert into public.schedule_members(schedule_id,profile_id) values(sch,w1),(sch,w2);
  insert into public.schedule_items(schedule_id,tipo,store_id,posizione) values(sch,'ordinario',st,1) returning id into item;
  perform set_config('request.jwt.claim.sub',w1::text,true);
  blocked=false;
  begin
    perform public.overgreen_save_ordinary_v197(gen_random_uuid(),st,item,'2099-01-01','','',false,array[w1,a],0,w1);
  exception when others then blocked=true; end;
  assert blocked, 'Unassigned workers rejected';
  result=public.overgreen_save_ordinary_v197(req,st,item,'2099-01-01','','',false,array[w1,w2],0,w1);
  iid=(result->'intervention'->>'id')::uuid;
  assert (select count(*)=2 from public.intervention_workers where intervention_id=iid),'Whole team saved';
  assert (select stato='in_attesa' from public.interventions where id=iid),'Employee still requires approval';
  assert public.overgreen_save_ordinary_v197(req,st,item,'2099-01-01','','',false,array[w1,w2],0,w1)=result,'Retry idempotent';
  perform set_config('request.jwt.claim.sub',a::text,true);
  blocked=false;
  begin
    perform public.overgreen_save_ordinary_v197(gen_random_uuid(),st,null,'2099-01-02','','',false,array[w1,w2],0,w1);
  exception when others then blocked=true; end;
  assert blocked,'Impersonation cannot submit arbitrary team without assignment';
end $test$;
rollback;
