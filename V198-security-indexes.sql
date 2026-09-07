-- Internal authorization/audit functions are not anonymous APIs.
do $$declare f record;begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.prosecdef and has_function_privilege('anon',p.oid,'EXECUTE')
 and p.proname in ('audit_actor_email','audit_actor_name','audit_storage_change','audit_table_change','can_access_document_path','can_access_extra','can_access_intervention','can_access_schedule','handle_new_user','is_active_user','is_admin','overgreen_is_admin','write_audit_log','write_client_audit') loop
  execute format('grant execute on function %s to authenticated,service_role',f.signature);
  execute format('revoke execute on function %s from public,anon',f.signature);
 end loop;
end $$;
-- Add missing leading-column FK indexes without removing workload-dependent indexes.
set local lock_timeout='3s';
do $$declare fk record; cols text;begin
 for fk in select c.oid,c.conrelid,c.conkey,t.relname from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace
 where c.contype='f' and n.nspname='public'
 and not exists(select 1 from pg_index i where i.indrelid=c.conrelid and i.indisvalid and i.indpred is null and (i.indkey::smallint[])[0:cardinality(c.conkey)-1] @> c.conkey)
 loop
  select string_agg(quote_ident(a.attname),',' order by u.ord) into cols from unnest(fk.conkey) with ordinality u(attnum,ord) join pg_attribute a on a.attrelid=fk.conrelid and a.attnum=u.attnum;
  execute format('create index if not exists %I on %s (%s)',left(fk.relname,35)||'_fk_'||fk.oid||'_v198',fk.conrelid::regclass,cols);
 end loop;
end $$;
