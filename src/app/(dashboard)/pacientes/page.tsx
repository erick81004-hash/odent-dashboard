import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { listPatients, getTreatmentSummaries, getPatientPhotoUrls } from '@/lib/patients/queries'
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
  const [summaries, photoUrls] = await Promise.all([
    getTreatmentSummaries(client, patients.map((p) => p.id)),
    getPatientPhotoUrls(client, patients),
  ])

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Pacientes</h1>
        <Link href="/pacientes/nuevo" className="text-sm text-blue-700">
          + Nuevo paciente
        </Link>
      </div>
      <PatientSearch />
      <PatientList patients={patients} summaries={summaries} photoUrls={photoUrls} />
    </div>
  )
}
