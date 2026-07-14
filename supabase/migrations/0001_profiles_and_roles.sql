create type public.user_role as enum ('admin', 'doctor', 'asistente');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by any authenticated staff"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

grant usage on schema public to authenticated, service_role;
grant select, insert, update on public.profiles to authenticated, service_role;
