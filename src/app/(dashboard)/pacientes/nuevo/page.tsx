'use client'

import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { createPatient, updatePatientPhoto } from '@/lib/patients/mutations'
import { PatientForm } from '@/components/patients/PatientForm'
import type { Patient } from '@/lib/patients/types'

export default function NuevoPacientePage() {
  const router = useRouter()

  async function handleSubmit(input: Partial<Patient>, photoFile: File | null) {
    const client = createBrowserSupabaseClient()
    const patient = await createPatient(client, input)
    if (photoFile) {
      const path = `${patient.id}/${Date.now()}-${photoFile.name}`
      const { error: uploadError } = await client.storage.from('patient-photos').upload(path, photoFile)
      if (!uploadError) {
        await updatePatientPhoto(client, patient.id, path)
      }
    }
    router.push(`/pacientes/${patient.id}`)
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium">Nuevo paciente</h1>
      <PatientForm onSubmit={handleSubmit} />
    </div>
  )
}
