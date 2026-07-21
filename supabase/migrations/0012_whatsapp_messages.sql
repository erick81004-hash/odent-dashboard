create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id),
  numero text not null,
  direction text not null check (direction in ('in', 'out')),
  mensaje text not null,
  created_at timestamptz not null default now()
);

create index whatsapp_messages_numero_created_at_idx
  on public.whatsapp_messages (numero, created_at desc);

alter table public.whatsapp_messages enable row level security;

create policy "staff can read whatsapp_messages"
  on public.whatsapp_messages for select
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

grant select, insert on public.whatsapp_messages to authenticated, service_role;
