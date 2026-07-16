create table public.cargos (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  concepto text not null,
  monto numeric(10,2) not null check (monto > 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.cargos enable row level security;

create policy "staff can read cargos"
  on public.cargos for select
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can insert cargos"
  on public.cargos for insert
  with check (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "only admin can update cargos"
  on public.cargos for update
  using (public.current_user_role() = 'admin');

create policy "only admin can delete cargos"
  on public.cargos for delete
  using (public.current_user_role() = 'admin');

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  cargo_id uuid not null references public.cargos(id),
  monto numeric(10,2) not null check (monto > 0),
  metodo text not null check (metodo in ('efectivo', 'tarjeta', 'transferencia')),
  nota text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.pagos enable row level security;

create policy "staff can read pagos"
  on public.pagos for select
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "staff can insert pagos"
  on public.pagos for insert
  with check (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "only admin can update pagos"
  on public.pagos for update
  using (public.current_user_role() = 'admin');

create policy "only admin can delete pagos"
  on public.pagos for delete
  using (public.current_user_role() = 'admin');

create or replace function public.audit_cargo_update()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_log (table_name, record_id, action, changed_by, old_data, new_data)
  values ('cargos', old.id, 'update', auth.uid(), to_jsonb(old), to_jsonb(new));
  return new;
end;
$$;

create trigger cargos_audit_update
  before update on public.cargos
  for each row execute function public.audit_cargo_update();

create or replace function public.audit_cargo_delete()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_log (table_name, record_id, action, changed_by, old_data, new_data)
  values ('cargos', old.id, 'delete', auth.uid(), to_jsonb(old), null);
  return old;
end;
$$;

create trigger cargos_audit_delete
  before delete on public.cargos
  for each row execute function public.audit_cargo_delete();

create or replace function public.audit_pago_update()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_log (table_name, record_id, action, changed_by, old_data, new_data)
  values ('pagos', old.id, 'update', auth.uid(), to_jsonb(old), to_jsonb(new));
  return new;
end;
$$;

create trigger pagos_audit_update
  before update on public.pagos
  for each row execute function public.audit_pago_update();

create or replace function public.audit_pago_delete()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_log (table_name, record_id, action, changed_by, old_data, new_data)
  values ('pagos', old.id, 'delete', auth.uid(), to_jsonb(old), null);
  return old;
end;
$$;

create trigger pagos_audit_delete
  before delete on public.pagos
  for each row execute function public.audit_pago_delete();

grant select, insert, update, delete on public.cargos to authenticated, service_role;
grant select, insert, update, delete on public.pagos to authenticated, service_role;
