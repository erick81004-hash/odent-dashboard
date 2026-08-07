create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  sex text,
  phone text,
  email text,
  address text,
  allergies text,
  medical_conditions text,
  current_medications text,
  blood_type text,
  emergency_contact text,
  insurance text,
  assigned_doctor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.patients enable row level security;

create policy "staff can read patients"
  on public.patients for select
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can insert patients"
  on public.patients for insert
  with check (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can update patient general data"
  on public.patients for update
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

grant select, insert, update on public.patients to authenticated, service_role;
