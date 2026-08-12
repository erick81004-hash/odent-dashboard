create table public.tooth_condition_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  tooth_number integer not null,
  condition_type text not null,
  active boolean not null,
  performed_by uuid not null references public.profiles(id),
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index tooth_condition_events_patient_tooth_idx
  on public.tooth_condition_events (patient_id, tooth_number, condition_type, performed_at desc);

alter table public.tooth_condition_events enable row level security;

create policy "staff can read tooth condition events"
  on public.tooth_condition_events for select
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "only admin and doctor can insert tooth condition events"
  on public.tooth_condition_events for insert
  with check (public.current_user_role() in ('admin', 'doctor'));

grant select, insert on public.tooth_condition_events to authenticated, service_role;
