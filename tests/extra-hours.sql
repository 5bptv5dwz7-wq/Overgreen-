-- Integration tests with synthetic data; all writes roll back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $$
declare
  eid uuid; other_id uuid; rid uuid; new_rid uuid; worker uuid; actor uuid:=auth.uid();
  r public.extra_labor_hours; blocked boolean; n integer;
begin
  insert into public.extras(titolo,client_type,nome_esterno) values('V201 QA ROLLBACK','eurospin','QA fixture') returning id into eid;
  insert into public.extras(titolo,client_type,nome_esterno) values('V201 QA OTHER ROLLBACK','intesa','QA fixture') returning id into other_id;
  insert into public.attachments(extra_id,tipo,storage_path,nome_file,created_at)
    values(eid,'rapportino_eurospin','qa-v201/report.pdf','QA report.pdf',now()) returning id into rid;
  r:=public.save_extra_labor_hours_v201(eid,6.5,0,rid);
  assert r.total_hours=6.5 and r.revision=1 and r.updated_by=actor,'saved manual total';
  r:=public.save_extra_labor_hours_v201(eid,6.5,0,rid);
  assert r.revision=1,'lost-response retry is idempotent';
  blocked:=false;
  begin perform public.save_extra_labor_hours_v201(eid,7,0,rid); exception when serialization_failure then blocked:=true; end;
  assert blocked,'stale save cannot overwrite';
  blocked:=false;
  begin perform public.save_extra_labor_hours_v201(eid,-1,1,rid); exception when invalid_parameter_value then blocked:=true; end;
  assert blocked,'negative hours denied';
  blocked:=false;
  begin perform public.save_extra_labor_hours_v201(eid,2.555,1,rid); exception when invalid_parameter_value then blocked:=true; end;
  assert blocked,'excess precision denied';
  blocked:=false;
  begin perform public.save_extra_labor_hours_v201(eid,'NaN'::numeric,1,rid); exception when invalid_parameter_value then blocked:=true; end;
  assert blocked,'NaN denied';
  blocked:=false;
  begin perform public.save_extra_labor_hours_v201(other_id,1,0,rid); exception when invalid_parameter_value then blocked:=true; end;
  assert blocked,'other clients denied';
  insert into public.attachments(extra_id,tipo,storage_path,nome_file,created_at)
    values(eid,'rapportino_eurospin','qa-v201/new-report.pdf','QA new report.pdf',now()+interval '1 second') returning id into new_rid;
  blocked:=false;
  begin perform public.save_extra_labor_hours_v201(eid,8,1,rid); exception when serialization_failure then blocked:=true; end;
  assert blocked,'replaced report requires review';
  delete from public.attachments where id=rid;
  assert (select source_attachment_id is null and total_hours=6.5 from public.extra_labor_hours where extra_id=eid),'report replacement preserves hours';
  r:=public.save_extra_labor_hours_v201(eid,0,1,new_rid);assert r.total_hours=0,'zero is explicit';
  r:=public.save_extra_labor_hours_v201(eid,null,2,new_rid);assert r.total_hours is null,'blank is not zero';
  select id into worker from public.profiles where ruolo='dipendente' and attivo limit 1;
  assert worker is not null,'worker fixture available';
  perform set_config('request.jwt.claim.sub',worker::text,true);
  select count(*) into n from public.extra_labor_hours where extra_id=eid;assert n=0,'worker cannot read hours';
  update public.extra_labor_hours set total_hours=99 where extra_id=eid;get diagnostics n=row_count;assert n=0,'worker cannot update hours';
  blocked:=false;
  begin perform public.save_extra_labor_hours_v201(eid,99,3,new_rid); exception when insufficient_privilege then blocked:=true; end;
  assert blocked,'worker RPC denied';
  blocked:=false;
  begin insert into public.extra_labor_hours(extra_id,total_hours,updated_by) values(other_id,99,worker); exception when insufficient_privilege then blocked:=true; end;
  assert blocked,'worker insert denied';
  perform set_config('request.jwt.claim.sub',actor::text,true);
  assert not has_table_privilege('anon','public.extra_labor_hours','SELECT'),'anonymous table access denied';
  assert not has_function_privilege('anon','public.save_extra_labor_hours_v201(uuid,numeric,bigint,uuid)','EXECUTE'),'anonymous RPC denied';
  delete from public.extras where id=eid;
  assert not exists(select 1 from public.extra_labor_hours where extra_id=eid),'extra deletion cleans hours';
end $$;
rollback;
select 'PASS: manual hours, replay, concurrency, validation, report replacement, role restrictions, deletion; fixtures rolled back' as result;
