-- Admin closure with deferred reports. Report completeness remains an export prerequisite.
create or replace function public.overgreen_close_extra_deferred_v316(p_extra_id uuid,p_payload jsonb,p_workers uuid[] default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare e public.extras;
begin
 if auth.uid() is null or not coalesce(public.is_admin(),false) then
  raise exception 'Solo amministratori possono rimandare i rapportini' using errcode='42501';
 end if;
 select * into e from public.extras where id=p_extra_id for update;
 if not found then raise exception 'Extra non disponibile'; end if;
 if e.client_type<>'eurospin' or coalesce(e.closure_profile,'eurospin')<>'eurospin'
  or (e.cleaning_codes is not null and not ('TARGET'=any(e.cleaning_codes))) then
  raise exception 'Chiusura differita disponibile solo per extra con rapportini';
 end if;
 if e.stato='completato' and e.convalidato_da=auth.uid() then return to_jsonb(e); end if;
 if p_payload->>'stato' is distinct from 'in_attesa' then raise exception 'Chiusura definitiva richiesta'; end if;
 if exists(select 1 from public.extra_work_items w where w.extra_id=e.id and w.stato not in ('completata','non_eseguita')) then
  raise exception 'Completa le lavorazioni prima di chiudere';
 end if;
 perform public.overgreen_close_extra_v271(p_extra_id,p_payload,p_workers);
 update public.extras set stato='completato',convalidato_da=auth.uid(),convalidato_il=now()
 where id=p_extra_id returning * into e;
 return to_jsonb(e);
end $$;
revoke all on function public.overgreen_close_extra_deferred_v316(uuid,jsonb,uuid[]) from public,anon;
grant execute on function public.overgreen_close_extra_deferred_v316(uuid,jsonb,uuid[]) to authenticated;
