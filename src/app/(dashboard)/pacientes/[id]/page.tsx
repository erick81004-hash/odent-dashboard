import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  getPatientById,
  getTreatmentEvents,
  getDocuments,
  getDocumentUrls,
  getPatientPhotoUrls,
} from '@/lib/patients/queries'
import { getCurrentProfile } from '@/lib/auth/profile'
import { AllergyBadge } from '@/components/patients/AllergyBadge'
import { PatientDetailsSection } from '@/components/patients/PatientDetailsSection'
import { PatientTabs } from '@/components/patients/PatientTabs'
import { Odontogram } from '@/components/patients/Odontogram'
import { TreatmentHistoryList } from '@/components/patients/TreatmentHistoryList'
import { DocumentGallery } from '@/components/patients/DocumentGallery'
import { listCargosForPatient, listPagosForCargos } from '@/lib/cobranza/queries'
import { CobranzaClient } from '@/components/cobranza/CobranzaClient'

type Tab = 'datos' | 'odontograma' | 'historial' | 'documentos' | 'cobranza'

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
  const documentUrls = await getDocumentUrls(client, documents)
  const profile = await getCurrentProfile(client)
  const canDeleteDocuments = profile?.role === 'admin' || profile?.role === 'doctor'
  const canDeletePatient = profile?.role === 'admin'
  const photoUrls = await getPatientPhotoUrls(client, [patient])
  const cargos = await listCargosForPatient(client, id)
  const pagosByCargo = await listPagosForCargos(client, cargos.map((c) => c.id))

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/pacientes"
            aria-label="Volver a pacientes"
            className="rounded p-1 text-lg text-foreground/60 hover:bg-muted"
          >
            ←
          </Link>
          <h1 className="text-lg font-medium">{patient.full_name}</h1>
        </div>
        <AllergyBadge allergies={patient.allergies} />
      </div>
      <PatientTabs patientId={id} active={activeTab} />

      {activeTab === 'datos' && (
        <PatientDetailsSection
          patient={patient}
          canDelete={canDeletePatient}
          photoUrl={photoUrls[patient.id]}
        />
      )}

      {activeTab === 'odontograma' && <Odontogram patientId={id} events={events} />}
      {activeTab === 'historial' && <TreatmentHistoryList patientId={id} events={events} />}
      {activeTab === 'documentos' && (
        <DocumentGallery
          patientId={id}
          documents={documents}
          documentUrls={documentUrls}
          canDelete={canDeleteDocuments}
        />
      )}
      {activeTab === 'cobranza' && (
        <CobranzaClient
          patients={[{ id: patient.id, full_name: patient.full_name }]}
          cargos={cargos}
          pagosByCargo={pagosByCargo}
          fixedPatientId={patient.id}
        />
      )}
    </div>
  )
}
