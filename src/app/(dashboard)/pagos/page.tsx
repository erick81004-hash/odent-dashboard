import { createServerSupabaseClient } from '@/lib/supabase/server'
import { listAllCargos, listPagosForCargos } from '@/lib/cobranza/queries'
import { listPatients } from '@/lib/patients/queries'
import { getPatientNames } from '@/lib/citas/queries'
import { CobranzaClient } from '@/components/cobranza/CobranzaClient'

export default async function PagosPage() {
  const client = await createServerSupabaseClient()
  const [cargos, patients] = await Promise.all([listAllCargos(client), listPatients(client)])

  const patientIds = Array.from(new Set(cargos.map((c) => c.patient_id)))
  const [pagosByCargo, patientNames] = await Promise.all([
    listPagosForCargos(client, cargos.map((c) => c.id)),
    getPatientNames(client, patientIds),
  ])

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-lg font-medium">Pagos</h1>
      <CobranzaClient
        patients={patients.map((p) => ({ id: p.id, full_name: p.full_name }))}
        cargos={cargos}
        pagosByCargo={pagosByCargo}
        patientNames={patientNames}
      />
    </div>
  )
}
