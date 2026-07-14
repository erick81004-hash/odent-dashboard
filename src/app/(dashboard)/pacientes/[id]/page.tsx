import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPatientById, getTreatmentEvents, getDocuments } from '@/lib/patients/queries'
import { AllergyBadge } from '@/components/patients/AllergyBadge'
import { PatientTabs } from '@/components/patients/PatientTabs'
import { Odontogram } from '@/components/patients/Odontogram'
import { TreatmentHistoryList } from '@/components/patients/TreatmentHistoryList'
import { DocumentGallery } from '@/components/patients/DocumentGallery'

type Tab = 'datos' | 'odontograma' | 'historial' | 'documentos'

export default async function PatientProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const activeTab = (tab as Tab) ?? 'datos'

  const client = await createServerSupabaseClient()
  const patient = await getPatientById(client, id)
  if (!patient) notFound()

  const events = await getTreatmentEvents(client, id)
  const documents = await getDocuments(client, id)

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">{patient.full_name}</h1>
        <AllergyBadge allergies={patient.allergies} />
      </div>
      <PatientTabs patientId={id} active={activeTab} />

      {activeTab === 'datos' && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <section>
            <h2 className="font-medium mb-2">Información personal</h2>
            <p>Nacimiento: {patient.birth_date ?? '—'}</p>
            <p>Sexo: {patient.sex ?? '—'}</p>
            <p>Teléfono: {patient.phone ?? '—'}</p>
            <p>Email: {patient.email ?? '—'}</p>
            <p>Dirección: {patient.address ?? '—'}</p>
          </section>
          <section>
            <h2 className="font-medium mb-2">Información médica</h2>
            <p>Alergias: {patient.allergies ?? '—'}</p>
            <p>Condiciones: {patient.medical_conditions ?? '—'}</p>
            <p>Medicamentos: {patient.current_medications ?? '—'}</p>
            <p>Tipo de sangre: {patient.blood_type ?? '—'}</p>
          </section>
          <section>
            <h2 className="font-medium mb-2">Administrativo</h2>
            <p>Contacto de emergencia: {patient.emergency_contact ?? '—'}</p>
            <p>Aseguradora: {patient.insurance ?? '—'}</p>
          </section>
        </div>
      )}

      {activeTab === 'odontograma' && <Odontogram patientId={id} events={events} />}
      {activeTab === 'historial' && <TreatmentHistoryList events={events} />}
      {activeTab === 'documentos' && <DocumentGallery patientId={id} documents={documents} />}
    </div>
  )
}
