create or replace function public.overgreen_cancel_extra_v231(p_id uuid)
returns public.extras language plpgsql security invoker set search_path='' as $$
declare v public.extras;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Solo un amministratore può annullare un target' using errcode='42501'; end if;
 select * into v from public.extras where id=p_id for update;
 if not found then raise exception 'Target non trovato'; end if;
 if v.stato='annullato' then return v; end if;
 if v.stato not in ('ricevuto','programmato','da_integrare','in_attesa') then raise exception 'Il target è già completato: non può essere annullato da questa azione'; end if;
 update public.extras set stato='annullato',closed_at=now(),closed_by=auth.uid(),
 note_lorenzo=concat_ws(E'\n',nullif(btrim(note_lorenzo),''),'Target annullato.')
 where id=p_id returning * into v;
 return v;
end;$$;
revoke all on function public.overgreen_cancel_extra_v231(uuid) from public,anon;
grant execute on function public.overgreen_cancel_extra_v231(uuid) to authenticated;
