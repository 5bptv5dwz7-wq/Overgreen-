begin;
select set_config('test.admin',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true),set_config('test.worker',(select id::text from public.profiles where ruolo<>'admin' and attivo limit 1),true),set_config('test.extra',gen_random_uuid()::text,true);
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.admin'),true);
insert into public.extras(id,nome_esterno,titolo,stato,creato_da,note_lorenzo) values(current_setting('test.extra')::uuid,'TEST ROLLBACK','Test annullamento','ricevuto',auth.uid(),'Nota precedente');
select set_config('request.jwt.claim.sub',current_setting('test.worker'),true);
do $$begin
 begin
  perform public.overgreen_cancel_extra_v231(current_setting('test.extra')::uuid);
  raise exception 'FAIL: employee cancelled target';
 exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claim.sub',current_setting('test.admin'),true);
select public.overgreen_cancel_extra_v231(current_setting('test.extra')::uuid);
select public.overgreen_cancel_extra_v231(current_setting('test.extra')::uuid);
do $$declare v public.extras;begin
 select * into v from public.extras where id=current_setting('test.extra')::uuid;
 if v.stato<>'annullato' or v.closed_by<>auth.uid() or v.closed_at is null or v.note_lorenzo<>E'Nota precedente\nTarget annullato.' then raise exception 'FAIL: cancellation metadata or retry';end if;
 if exists(select 1 from public.attachments where extra_id=v.id) then raise exception 'FAIL: created unnecessary documents';end if;
 update public.extras set stato='completato' where id=v.id;
 begin
  perform public.overgreen_cancel_extra_v231(v.id);
  raise exception 'FAIL: approved target cancelled';
 exception when raise_exception then
  if SQLERRM like 'FAIL:%' then raise;end if;
 end;
end$$;
rollback;
select 'Cancellation verified without documents; employee denied; retry idempotent; all test data rolled back' as result;
