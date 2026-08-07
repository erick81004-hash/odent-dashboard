alter table public.documents add column display_name text;

create policy "staff can rename documents"
  on public.documents for update
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'))
  with check (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "admin and doctor can delete documents"
  on public.documents for delete
  using (public.current_user_role() in ('admin', 'doctor'));

create policy "admin and doctor can delete document files"
  on storage.objects for delete
  using (bucket_id = 'patient-documents' and public.current_user_role() in ('admin', 'doctor'));

grant update, delete on public.documents to authenticated, service_role;
