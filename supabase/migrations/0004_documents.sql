insert into storage.buckets (id, name, public)
values ('patient-documents', 'patient-documents', false);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  treatment_event_id uuid references public.treatment_events(id),
  storage_path text not null,
  file_type text not null,
  uploaded_by uuid not null references public.profiles(id),
  uploaded_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "staff can read documents"
  on public.documents for select
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can upload documents"
  on public.documents for insert
  with check (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can read document files"
  on storage.objects for select
  using (bucket_id = 'patient-documents' and public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can upload document files"
  on storage.objects for insert
  with check (bucket_id = 'patient-documents' and public.current_user_role() in ('admin', 'doctor', 'asistente'));

grant select, insert on public.documents to authenticated, service_role;
