import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { listPatients } from '@/lib/patients/queries'
import { PatientList } from '@/components/patients/PatientList'
import { PatientSearch } from '@/components/patients/PatientSearch'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const client = await createServerSupabaseClient()
  const patients = await listPatients(client, q)

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Pacientes</h1>
        <Link href="/pacientes/nuevo" className="text-sm text-blue-700">
          + Nuevo paciente
        </Link>
      </div>
      <PatientSearch />
      <PatientList patients={patients} />
    </div>
  )
}
