create table public.treatment_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  tooth_numbers integer[] not null,
  treatment_type text not null,
  surface text,
  notes text,
  performed_by uuid not null references public.profiles(id),
  performed_at timestamptz not null default now(),
  edited_at timestamptz,
  edited_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.treatment_events enable row level security;

create policy "staff can read treatment events"
  on public.treatment_events for select
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "only admin and doctor can insert treatment events"
  on public.treatment_events for insert
  with check (public.current_user_role() in ('admin', 'doctor'));

create policy "only admin can update treatment events"
  on public.treatment_events for update
  using (public.current_user_role() = 'admin');

create policy "only admin can delete treatment events"
  on public.treatment_events for delete
  using (public.current_user_role() = 'admin');

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb
);

alter table public.audit_log enable row level security;

create policy "only admin can read audit log"
  on public.audit_log for select
  using (public.current_user_role() = 'admin');

create or replace function public.audit_treatment_event_update()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_log (table_name, record_id, action, changed_by, old_data, new_data)
  values ('treatment_events', old.id, 'update', auth.uid(), to_jsonb(old), to_jsonb(new));
  new.edited_at := now();
  new.edited_by := auth.uid();
  return new;
end;
$$;

create trigger treatment_events_audit_update
  before update on public.treatment_events
  for each row execute function public.audit_treatment_event_update();

grant select, insert, update, delete on public.treatment_events to authenticated, service_role;
grant select on public.audit_log to authenticated, service_role;
