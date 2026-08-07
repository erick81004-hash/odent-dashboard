create or replace function public.delete_cancelled_citas_before_patient_delete()
returns trigger as $$
begin
  delete from public.citas
  where patient_id = old.id and status = 'cancelada';
  return old;
end;
$$ language plpgsql security definer;

create trigger before_patient_delete_clear_cancelled_citas
  before delete on public.patients
  for each row
  execute function public.delete_cancelled_citas_before_patient_delete();
