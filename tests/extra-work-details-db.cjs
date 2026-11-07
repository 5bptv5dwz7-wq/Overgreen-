const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
test('migration and daily RPC store optional details atomically, preserve retries and revisions',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create role anon;create role authenticated;create schema auth;
 create function auth.uid() returns uuid language sql as $$select '00000000-0000-0000-0000-000000000001'::uuid$$;
 create function public.is_admin() returns boolean language sql as $$select true$$;
 create function public.is_active_user() returns boolean language sql as $$select true$$;
 create function public.can_access_extra(uuid) returns boolean language sql as $$select true$$;
 create table profiles(id uuid primary key);insert into profiles values(auth.uid());
 create table extras(id uuid primary key,giorno_intervento date,note_lorenzo text);
 create table extra_workers(extra_id uuid,profile_id uuid,primary key(extra_id,profile_id));
 create table attachments(id uuid primary key,extra_id uuid,intervention_id uuid,created_at timestamptz,caricato_da uuid,tipo text,storage_path text,nome_file text);
 create function public.overgreen_close_extra_v271(uuid,jsonb,uuid[]) returns jsonb language sql as $$select '{}'::jsonb$$;
 create function public.overgreen_close_extra_deferred_v316(uuid,jsonb,uuid[]) returns jsonb language sql as $$select '{}'::jsonb$$;`);
 const base=fs.readFileSync('V319-daily-work.sql','utf8');await db.exec(base.slice(0,base.indexOf('CREATE OR REPLACE FUNCTION public.save_extra_day_economics_v319')));
 await db.exec(fs.readFileSync('V326-edit-extra-day.sql','utf8'));
 const file=fs.readdirSync('supabase/migrations').find(f=>f.endsWith('_extra_work_details_v328.sql'));await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
 await db.exec(`do $$declare e uuid:=gen_random_uuid(); d uuid:=gen_random_uuid(); d2 uuid:=gen_random_uuid(); r jsonb; blocked boolean:=false; begin
 insert into extras(id) values(e);
 r=overgreen_close_extra_day_v319(e,'{"stato":"da_integrare","giorno_intervento":"2026-11-07","technician_count":5,"work_start":"22:00","work_end":"02:30"}',array[auth.uid()],d,'{}');
 assert r->>'technician_count'='5';assert r->>'work_start'='22:00:00';
 r=overgreen_close_extra_day_v319(e,'{"stato":"da_integrare","giorno_intervento":"2026-11-07"}',array[auth.uid()],d,'{}');assert r->>'technician_count'='5';
 r=overgreen_close_extra_day_v319(e,'{"stato":"in_attesa","giorno_intervento":"2026-11-08"}',array[auth.uid()],d2,'{}');assert r->>'technician_count' is null;
 perform edit_extra_day_v328(d,1,'2026-11-07','edited',array[auth.uid()],'{}','[]','{"technician_count":6,"work_start":"08:00","work_end":"16:00"}');
 assert (select technician_count=6 and revision=2 from extra_work_days where id=d);
 begin perform edit_extra_day_v328(d,2,'2026-11-07','invalid',array[auth.uid()],'{}','[]','{"technician_count":0}');exception when check_violation then blocked=true;end;assert blocked;
 assert (select notes='edited' and technician_count=6 and revision=2 from extra_work_days where id=d);
 perform edit_extra_day_v328(d,2,'2026-11-07','cleared',array[auth.uid()],'{}','[]','{}');assert (select technician_count is null and work_start is null and revision=3 from extra_work_days where id=d);
 blocked=false;begin perform edit_extra_day_v328(d,2,'2026-11-07','stale',array[auth.uid()],'{}','[]','{}');exception when others then blocked=true;end;assert blocked;
 blocked=false;begin perform overgreen_close_extra_day_v319(e,'{"stato":"da_integrare","giorno_intervento":"2026-11-09","work_start":"08:00"}',array[auth.uid()],gen_random_uuid(),'{}');exception when check_violation then blocked=true;end;assert blocked;
 assert (select count(*)=2 from extra_work_days where extra_id=e);
 assert not has_function_privilege('anon','edit_extra_day_v328(uuid,bigint,date,text,uuid[],uuid[],jsonb,jsonb)','EXECUTE');
 end $$;`);
 }finally{await db.close()}
});
