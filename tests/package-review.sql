-- Transactional verification: every test write is rolled back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $$
declare e uuid; f text; r jsonb; old_count integer; new_id uuid:=gen_random_uuid(); path text;
begin
 select id into e from public.extras where stato='completato' limit 1;
 if e is null then raise exception 'No completed extra for verification'; end if;
 f=public.extra_package_fingerprint(e);
 perform public.save_extra_package_review(e,f,'reset',false,'','');
 perform public.save_extra_package_review(e,f,'eurospin',true,'','');
 perform public.save_extra_package_review(e,f,'overgreen',true,'','');
 r=public.save_extra_package_review(e,f,'economics',true,'123456','');
 if r->'checks'->>'economics'<>'true' then raise exception 'Review not saved'; end if;
 update public.extras set titolo=titolo||' [transaction test]' where id=e;
 if public.extra_package_fingerprint(e)=f then raise exception 'Fingerprint failed to invalidate'; end if;
 begin
  perform public.save_extra_package_review(e,f,'economics',true,'123456','');
  raise exception 'STALE_REVIEW_ACCEPTED';
 exception when others then if sqlerrm='STALE_REVIEW_ACCEPTED' then raise; end if; end;
 f=public.extra_package_fingerprint(e);
 select count(*) into old_count from public.attachments where extra_id=e and tipo='rapportino_overgreen';
 path='extra/'||e||'/'||new_id||'-test.pdf';
 r=public.replace_review_report(e,'rapportino_overgreen',f,new_id,path,'test.pdf','application/pdf',100);
 if (select count(*) from public.attachments where extra_id=e and tipo='rapportino_overgreen')<>1 then raise exception 'Replacement not atomic'; end if;
 if (select count(*) from public.extra_report_versions where extra_id=e and attachment->>'tipo'='rapportino_overgreen')<old_count then raise exception 'History missing'; end if;
 if public.extra_package_fingerprint(e)=f then raise exception 'Replacement did not invalidate'; end if;
 perform public.replace_review_report(e,'rapportino_overgreen',f,new_id,path,'test.pdf','application/pdf',100);
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo<>'admin' and attivo limit 1),true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.extra_package_reviews) then raise exception 'Worker can read reviews'; end if;
 if exists(select 1 from public.extra_report_versions) then raise exception 'Worker can read archived reports'; end if;
 begin
  perform public.extra_package_review_context('{}'::uuid[]);
  raise exception 'WORKER_ALLOWED';
 exception when others then if sqlerrm='WORKER_ALLOWED' then raise; end if; end;
end $$;
reset role;
select 'PASS: admin review, stale rejection, atomic replacement, history, idempotent retry and worker denial' as result;
rollback;
