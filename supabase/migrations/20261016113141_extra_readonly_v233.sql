-- V233: all active employees can consult extras; assignment remains required for writes.
-- Do not broaden can_access_extra: it is also used by upload and write policies.
drop policy if exists v197_active on public.extras;
create policy v233_extra_read on public.extras for select to authenticated using (public.is_active_user());
drop policy if exists v197_active on public.extra_workers;
create policy v233_assignment_read on public.extra_workers for select to authenticated using (public.is_active_user());
-- Keep ordinary attachment behavior; restrict extra attachment writes to the assigned team.
alter policy v197_active on public.attachments using (public.is_active_user() and (extra_id is null or public.can_access_extra(extra_id))) with check (public.is_active_user() and (extra_id is null or public.can_access_extra(extra_id)));
create policy v233_attachment_read on public.attachments for select to authenticated using (public.is_active_user() and extra_id is not null);
create policy v233_work_read on public.extra_work_items for select to authenticated using (public.is_active_user());
create policy v233_work_notes_read on public.extra_work_item_notes for select to authenticated using (public.is_active_user());
create policy v233_work_photos_read on public.extra_work_item_photos for select to authenticated using (public.is_active_user());
-- Only read access to files actually registered against an extra/work item.
create policy v233_extra_file_read on storage.objects for select to authenticated using (
  bucket_id='documenti' and public.is_active_user() and (
    exists(select 1 from public.attachments a where a.extra_id is not null and a.storage_path=name)
    or exists(select 1 from public.extra_work_item_photos p where p.storage_path=name)
  )
);
