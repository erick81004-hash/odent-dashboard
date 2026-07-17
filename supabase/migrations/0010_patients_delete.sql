create policy "admin can delete patients"
  on public.patients for delete
  using (public.current_user_role() = 'admin');

grant delete on public.patients to authenticated, service_role;
