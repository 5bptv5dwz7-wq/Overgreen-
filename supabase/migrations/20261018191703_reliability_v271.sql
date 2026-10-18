-- Single MVCC snapshot, caller privileges and all existing row policies retained.
create or replace function public.overgreen_read_data_v271(p_sections text[])
returns jsonb language plpgsql stable security invoker set search_path=public,pg_temp as $$
declare section text; ordering text; rows jsonb; result jsonb='{}';
begin
 if auth.uid() is null or not public.is_active_user() then raise exception 'Sessione non autorizzata'; end if;
 if coalesce(cardinality(p_sections),0)>24 then raise exception 'Troppe sezioni'; end if;
 foreach section in array p_sections loop
  if section<>all(array['profiles','stores','interventions','schedules','schedule_members','schedule_items','extras','extra_workers','intervention_workers','attachments','extra_work_items','extra_work_item_photos','extra_work_item_notes','saved_routes','saved_route_items','work_contacts','contact_stores','schedule_activities','schedule_activity_photos','store_reminders','extra_labor_hours','company_documents','company_document_reads','signature_sheets']) or section is null then raise exception 'Sezione non valida'; end if;
  begin
   ordering=case section when 'profiles' then 'nome,id' when 'schedules' then 'giorno,id' when 'schedule_items' then 'posizione,id' when 'extras' then 'giorno_intervento,id' when 'attachments' then 'created_at desc,id' when 'interventions' then 'created_at desc,id' when 'extra_work_items' then 'posizione,id' when 'saved_routes' then 'nome,id' when 'saved_route_items' then 'posizione,id' when 'work_contacts' then 'nome,id' when 'schedule_activities' then 'posizione,id' else '' end;
   execute format('select coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) from (select * from public.%I%s) t',section,case when ordering='' then '' else ' order by '||ordering end) into rows;
   result=result||jsonb_build_object(section,jsonb_build_object('data',rows));
  exception when others then
   result=result||jsonb_build_object(section,jsonb_build_object('error','Dati non disponibili ('||sqlstate||')'));
  end;
 end loop;
 return result;
end $$;
revoke all on function public.overgreen_read_data_v271(text[]) from public,anon;
grant execute on function public.overgreen_read_data_v271(text[]) to authenticated;

-- Delete/unlink and mixed route ordering commit as one transaction.
create or replace function public.overgreen_schedule_v271(p_request_id uuid,p_schedule_id uuid,p_operation text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare request public.overgreen_requests_v198; item public.schedule_items; job jsonb;
 payload jsonb=jsonb_build_object('schedule_id',p_schedule_id,'payload',p_payload);
 current_position integer; current_state text; result jsonb; n integer=0; count_updated integer;
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Operazione riservata agli amministratori'; end if;
 if p_operation not in ('delete','order') or p_operation is null then raise exception 'Operazione non valida'; end if;
 insert into public.overgreen_requests_v198(request_id,actor_id,operation,payload)
 values(p_request_id,auth.uid(),'schedule_v271:'||p_operation,payload) on conflict do nothing;
 select * into request from public.overgreen_requests_v198 where request_id=p_request_id for update;
 if request.actor_id is distinct from auth.uid() or request.operation is distinct from 'schedule_v271:'||p_operation or request.payload is distinct from payload then raise exception 'Identificativo richiesta non valido'; end if;
 if request.response is not null then return request.response; end if;
 -- Same lock and lock order as the daily rollover, then the individual schedule.
 perform pg_advisory_xact_lock(197,1);
 perform 1 from public.schedules where id=p_schedule_id for update;
 if not found then raise exception 'Programma non disponibile. Aggiorna la schermata.'; end if;
 if p_operation='delete' then
  select * into item from public.schedule_items where id=(p_payload->>'item_id')::uuid for update;
  if not found then result=jsonb_build_object('removed',p_payload->>'item_id','already_removed',true);
  else
   if item.schedule_id<>p_schedule_id or item.tipo::text<>'ordinario' or item.stato::text<>'da_fare' then raise exception 'La sede è cambiata o risulta già chiusa. Aggiorna la programmazione.'; end if;
   if exists(select 1 from public.interventions i where i.stato::text in ('in_attesa','convalidato') and (i.schedule_item_id=item.id or item.id=any(i.schedule_item_ids))) then raise exception 'Intervento già registrato: la sede non può essere rimossa.'; end if;
   if exists(select 1 from public.extras e where e.schedule_item_id=item.id and e.stato::text in ('in_attesa','completato')) then raise exception 'Un extra collegato è in attesa o completato. Verifica prima di rimuovere la sede.'; end if;
   update public.extras set schedule_item_id=null where schedule_item_id=item.id and stato::text not in ('completato','annullato');
   delete from public.schedule_items where id=item.id;
   get diagnostics count_updated=row_count;
   if count_updated<>1 then raise exception 'Rimozione non autorizzata'; end if;
   -- Gaps are intentional: renumbering only ordinary jobs changed the order of extras.
   result=jsonb_build_object('removed',item.id,'already_removed',false);
  end if;
 else
  if jsonb_typeof(p_payload->'jobs')<>'array' or jsonb_array_length(p_payload->'jobs') not between 1 and 1000 then raise exception 'Ordine non valido'; end if;
  if (select count(*) from jsonb_array_elements(p_payload->'jobs'))<>(select count(distinct (v->>'kind',v->>'id')) from jsonb_array_elements(p_payload->'jobs') v) then raise exception 'Elementi duplicati'; end if;
  -- Validate the whole submitted list before changing any position.
  for job in select value from jsonb_array_elements(p_payload->'jobs') loop
   current_position=null;current_state=null;
   if job->>'kind'='ordinary' then select posizione,stato::text into current_position,current_state from public.schedule_items where id=(job->>'id')::uuid and schedule_id=p_schedule_id for update;
   elsif job->>'kind'='extra' then select posizione_giro,stato::text into current_position,current_state from public.extras where id=(job->>'id')::uuid and schedule_id=p_schedule_id for update;
   elsif job->>'kind'='activity' then select posizione,stato into current_position,current_state from public.schedule_activities where id=(job->>'id')::uuid and schedule_id=p_schedule_id for update;
   else raise exception 'Tipo di attività non valido'; end if;
   if current_state is null or current_state is distinct from job->>'state' or current_position is distinct from (job->>'position')::integer then raise exception 'Il giro è cambiato da un altro dispositivo. Aggiorna e riprova.'; end if;
  end loop;
  for job in select value from jsonb_array_elements(p_payload->'jobs') loop
   n=n+1;
   if job->>'kind'='ordinary' then update public.schedule_items set posizione=n where id=(job->>'id')::uuid and schedule_id=p_schedule_id;
   elsif job->>'kind'='extra' then update public.extras set posizione_giro=n where id=(job->>'id')::uuid and schedule_id=p_schedule_id;
   else update public.schedule_activities set posizione=n where id=(job->>'id')::uuid and schedule_id=p_schedule_id; end if;
   get diagnostics count_updated=row_count;if count_updated<>1 then raise exception 'Riordino non autorizzato'; end if;
  end loop;
  result=jsonb_build_object('ordered',n);
 end if;
 update public.overgreen_requests_v198 set response=result where request_id=p_request_id;
 return result;
end $$;
revoke all on function public.overgreen_schedule_v271(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.overgreen_schedule_v271(uuid,uuid,text,jsonb) to authenticated;

-- Support the exact lookups used by file policies, retaining their access rules.
create index if not exists attachments_storage_path_v271_idx on public.attachments(storage_path);
create index if not exists extra_work_item_photos_path_v271_idx on public.extra_work_item_photos(storage_path);
create index if not exists store_reminders_requested_by_v271_idx on public.store_reminders(requested_by);
create index if not exists store_reminders_resolved_intervention_v271_idx on public.store_reminders(resolved_intervention_id);
-- Evaluate caller identity once per statement, without changing row predicates.
alter policy "Dipendente vede la propria squadra" on "public"."schedule_members" using ((is_admin() OR (profile_id = (select auth.uid())) OR can_access_schedule(schedule_id)));
alter policy "Dipendente vede assegnazioni extra" on "public"."extra_workers" using ((is_admin() OR (profile_id = (select auth.uid())) OR can_access_extra(extra_id)));
alter policy "Utente carica allegati autorizzati" on "public"."attachments" with check ((is_active_user() AND (caricato_da = (select auth.uid())) AND (((intervention_id IS NOT NULL) AND (extra_id IS NULL) AND can_access_intervention(intervention_id)) OR ((intervention_id IS NULL) AND (extra_id IS NOT NULL) AND can_access_extra(extra_id)))));
alter policy "Dipendente legge propri interventi" on "public"."interventions" using ((inserito_da = (select auth.uid())));
alter policy "signature_sheets_insert_authenticated" on "public"."signature_sheets" with check ((uploaded_by = (select auth.uid())));
alter policy "signature_sheets_update_admin" on "public"."signature_sheets" using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text))))) with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text)))));
alter policy "signature_sheets_delete_admin" on "public"."signature_sheets" using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text)))));
alter policy "firme_eurospin_update_admin" on "storage"."objects" using (((bucket_id = 'documenti'::text) AND (name ~~ 'firme-eurospin/%'::text) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text)))))) with check (((bucket_id = 'documenti'::text) AND (name ~~ 'firme-eurospin/%'::text) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text))))));
alter policy "firme_eurospin_delete_admin" on "storage"."objects" using (((bucket_id = 'documenti'::text) AND (name ~~ 'firme-eurospin/%'::text) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text))))));
alter policy "audit_log_admin_select" on "public"."audit_log" using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text)))));
alter policy "company_documents_admin_insert" on "public"."company_documents" with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text)))));
alter policy "company_documents_admin_update" on "public"."company_documents" using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text))))) with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text)))));
alter policy "company_documents_admin_delete" on "public"."company_documents" using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text)))));
alter policy "company_document_reads_own_select" on "public"."company_document_reads" using (((user_id = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text))))));
alter policy "company_document_reads_own_insert" on "public"."company_document_reads" with check ((user_id = (select auth.uid())));
alter policy "company_document_reads_own_update" on "public"."company_document_reads" using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));
alter policy "company_document_reads_admin_delete" on "public"."company_document_reads" using (((user_id = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text))))));
alter policy "archivio_aziendale_admin_insert" on "storage"."objects" with check (((bucket_id = 'documenti'::text) AND (name ~~ 'archivio-aziendale/%'::text) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text))))));
alter policy "archivio_aziendale_admin_update" on "storage"."objects" using (((bucket_id = 'documenti'::text) AND (name ~~ 'archivio-aziendale/%'::text) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text)))))) with check (((bucket_id = 'documenti'::text) AND (name ~~ 'archivio-aziendale/%'::text) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text))))));
alter policy "archivio_aziendale_admin_delete" on "storage"."objects" using (((bucket_id = 'documenti'::text) AND (name ~~ 'archivio-aziendale/%'::text) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text))))));
alter policy "saved_routes_admin_all" on "public"."saved_routes" using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text) AND (COALESCE(p.attivo, true) = true))))) with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text) AND (COALESCE(p.attivo, true) = true)))));
alter policy "saved_route_items_admin_all" on "public"."saved_route_items" using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text) AND (COALESCE(p.attivo, true) = true))))) with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.ruolo = 'admin'::text) AND (COALESCE(p.attivo, true) = true)))));
alter policy "push_subscriptions_own_select" on "public"."push_subscriptions" using (((select auth.uid()) = user_id));
alter policy "push_subscriptions_own_insert" on "public"."push_subscriptions" with check (((select auth.uid()) = user_id));
alter policy "push_subscriptions_own_update" on "public"."push_subscriptions" using (((select auth.uid()) = user_id)) with check (((select auth.uid()) = user_id));
alter policy "push_subscriptions_own_delete" on "public"."push_subscriptions" using (((select auth.uid()) = user_id));
alter policy "schedule_activities_assigned_update" on "public"."schedule_activities" using ((overgreen_is_admin() OR (EXISTS ( SELECT 1
   FROM schedule_members sm
  WHERE ((sm.schedule_id = schedule_activities.schedule_id) AND (sm.profile_id = (select auth.uid()))))))) with check ((overgreen_is_admin() OR (EXISTS ( SELECT 1
   FROM schedule_members sm
  WHERE ((sm.schedule_id = schedule_activities.schedule_id) AND (sm.profile_id = (select auth.uid())))))));
alter policy "schedule_activity_photos_assigned_insert" on "public"."schedule_activity_photos" with check ((((caricato_da = (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM (schedule_activities sa
     JOIN schedule_members sm ON ((sm.schedule_id = sa.schedule_id)))
  WHERE ((sa.id = schedule_activity_photos.activity_id) AND (sm.profile_id = (select auth.uid())))))) OR overgreen_is_admin()));
alter policy "v197_insert" on "public"."extra_work_item_photos" with check (((caricato_da = (select auth.uid())) AND overgreen_can_access_work_item_v197(work_item_id)));
alter policy "v197_insert" on "public"."extra_work_item_notes" with check (((created_by = (select auth.uid())) AND overgreen_can_access_work_item_v197(work_item_id)));
alter policy "voice_settings_owner" on "public"."voice_assistant_settings" using (((owner_id = (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.ruolo = 'admin'::text) AND profiles.attivo)))));
alter policy "voice_state_owner" on "public"."voice_assistant_state" using (((owner_id = (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM voice_assistant_settings
  WHERE (voice_assistant_settings.owner_id = (select auth.uid())))))) with check (((owner_id = (select auth.uid())) AND (EXISTS ( SELECT 1
   FROM voice_assistant_settings
  WHERE (voice_assistant_settings.owner_id = (select auth.uid()))))));

-- Closure metadata and team change together. Uploads remain recoverable on failure.
create or replace function public.overgreen_close_extra_v271(p_extra_id uuid,p_payload jsonb,p_workers uuid[] default null)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare e public.extras; actor uuid; updated public.extras; n integer;
begin
 if auth.uid() is null or not public.is_active_user() or not public.can_access_extra(p_extra_id) then raise exception 'Extra non assegnato o sessione non autorizzata'; end if;
 select * into e from public.extras where id=p_extra_id for update;
 if not found then raise exception 'Extra non disponibile'; end if;
 if e.stato::text in ('annullato','completato') then raise exception 'Questo extra è già chiuso o annullato. Aggiorna i dati.'; end if;
 if p_payload->>'stato' not in ('da_integrare','in_attesa') or p_payload->>'stato' is null then raise exception 'Stato non valido'; end if;
 if e.stato::text='in_attesa' then
  if p_payload->>'stato'='in_attesa' and e.closed_by=coalesce((p_payload->>'closed_by')::uuid,auth.uid()) and e.note_lorenzo is not distinct from p_payload->>'note_lorenzo' and (p_payload->>'giorno_intervento' is null or e.giorno_intervento=(p_payload->>'giorno_intervento')::date) then return to_jsonb(e); end if;
  raise exception 'Chiusura già ricevuta. Aggiorna i dati prima di modificare.';
 end if;
 actor=coalesce((p_payload->>'closed_by')::uuid,auth.uid());
 if actor<>auth.uid() and not public.is_admin() then raise exception 'Operatore non valido'; end if;
 if not exists(select 1 from public.profiles where id=actor and attivo) then raise exception 'Operatore non attivo'; end if;
 if p_workers is not null then
  if not public.is_admin() or cardinality(p_workers)=0 then raise exception 'Squadra non valida'; end if;
  if exists(select 1 from unnest(p_workers) w where not exists(select 1 from public.profiles p where p.id=w and (p.attivo or exists(select 1 from public.extra_workers old where old.extra_id=p_extra_id and old.profile_id=p.id)))) then raise exception 'Operatore della squadra non attivo'; end if;
  insert into public.extra_workers(extra_id,profile_id) select p_extra_id,w from unnest(p_workers) w on conflict do nothing;
  delete from public.extra_workers where extra_id=p_extra_id and not(profile_id=any(p_workers));
 end if;
 update public.extras set stato=(p_payload->>'stato')::public.stato_extra,
 note_lorenzo=p_payload->>'note_lorenzo',
 closed_by=case when p_payload->>'stato'='in_attesa' then actor else null end,
 closed_at=case when p_payload->>'stato'='in_attesa' then (p_payload->>'closed_at')::timestamptz else null end,
 giorno_intervento=coalesce((p_payload->>'giorno_intervento')::date,giorno_intervento),
 night_hours=case when p_payload?'night_hours' then (p_payload->>'night_hours')::numeric else night_hours end
 where id=p_extra_id returning * into updated;
 if not found then raise exception 'Chiusura non autorizzata'; end if;
 return to_jsonb(updated);
end $$;
revoke all on function public.overgreen_close_extra_v271(uuid,jsonb,uuid[]) from public,anon;
grant execute on function public.overgreen_close_extra_v271(uuid,jsonb,uuid[]) to authenticated;
