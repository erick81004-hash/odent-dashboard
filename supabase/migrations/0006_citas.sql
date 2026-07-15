create table public.citas (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  doctor_id uuid not null references public.profiles(id),
  starts_at timestamptz not null,
  duration_minutes integer not null,
  reason text not null,
  status text not null default 'programada'
    check (status in ('programada', 'confirmada', 'cancelada', 'completada')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.citas enable row level security;

create policy "staff can read citas"
  on public.citas for select
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can insert citas"
  on public.citas for insert
  with check (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can update citas"
  on public.citas for update
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

grant select, insert, update on public.citas to authenticated, service_role;
