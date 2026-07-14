'use client'

import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { createPatient } from '@/lib/patients/mutations'
import { PatientForm } from '@/components/patients/PatientForm'
import type { Patient } from '@/lib/patients/types'

export default function NuevoPacientePage() {
  const router = useRouter()

  async function handleSubmit(input: Partial<Patient>) {
    const client = createBrowserSupabaseClient()
    const patient = await createPatient(client, input)
    router.push(`/pacientes/${patient.id}`)
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium">Nuevo paciente</h1>
      <PatientForm onSubmit={handleSubmit} />
    </div>
  )
}
