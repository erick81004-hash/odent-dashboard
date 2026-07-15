alter table public.patients add column photo_path text;

insert into storage.buckets (id, name, public)
values ('patient-photos', 'patient-photos', false);

create policy "staff can read patient photos"
  on storage.objects for select
  using (bucket_id = 'patient-photos' and public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can upload patient photos"
  on storage.objects for insert
  with check (bucket_id = 'patient-photos' and public.current_user_role() in ('admin', 'doctor', 'asistente'));
