import { createServerSupabaseClient } from '@/lib/supabase/server'
import { listPatients } from '@/lib/patients/queries'
import { listDoctors } from '@/lib/citas/queries'
import { CalendarioClient } from '@/components/calendario/CalendarioClient'

export default async function CalendarioPage() {
  const client = await createServerSupabaseClient()
  const [patients, doctors] = await Promise.all([listPatients(client), listDoctors(client)])

  return (
    <CalendarioClient
      patients={patients.map((p) => ({ id: p.id, full_name: p.full_name }))}
      doctors={doctors}
    />
  )
}
