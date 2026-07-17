import type { SupabaseClient } from '@supabase/supabase-js'
import { getPatientNames } from '@/lib/citas/queries'
import type { CitaStatus } from '@/lib/citas/types'
import type { MetodoPago } from '@/lib/cobranza/types'

export type ActivityItem = {
  text: string
  time: string
}

function formatRelativeTime(from: Date, now: Date): string {
  const diffMin = Math.floor((now.getTime() - from.getTime()) / 60000)
  if (diffMin < 1) return 'justo ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  return `hace ${diffD} d`
}

const CITA_STATUS_TEXT: Partial<Record<CitaStatus, string>> = {
  programada: 'agendó una cita',
  confirmada: 'confirmó su cita',
  cancelada: 'canceló su cita',
}

export async function getRecentActivity(
  client: SupabaseClient,
  now: Date,
  limit = 6
): Promise<ActivityItem[]> {
  const [citasRes, cargosRes, pagosRes] = await Promise.all([
    client.from('citas').select('id, patient_id, status, created_at').order('created_at', { ascending: false }).limit(limit),
    client.from('cargos').select('id, patient_id, concepto, monto, created_at').order('created_at', { ascending: false }).limit(limit),
    client.from('pagos').select('id, cargo_id, monto, metodo, created_at').order('created_at', { ascending: false }).limit(limit),
  ])
  if (citasRes.error) throw citasRes.error
  if (cargosRes.error) throw cargosRes.error
  if (pagosRes.error) throw pagosRes.error

  const citas = citasRes.data as { id: string; patient_id: string; status: CitaStatus; created_at: string }[]
  const cargos = cargosRes.data as { id: string; patient_id: string; concepto: string; monto: number; created_at: string }[]
  const pagos = pagosRes.data as { id: string; cargo_id: string; monto: number; metodo: MetodoPago; created_at: string }[]

  const pagoCargoIds = Array.from(new Set(pagos.map((p) => p.cargo_id)))
  const { data: pagoCargosData, error: pagoCargosError } =
    pagoCargoIds.length > 0
      ? await client.from('cargos').select('id, patient_id').in('id', pagoCargoIds)
      : { data: [] as { id: string; patient_id: string }[], error: null }
  if (pagoCargosError) throw pagoCargosError
  const cargoPatientById: Record<string, string> = {}
  for (const c of pagoCargosData as { id: string; patient_id: string }[]) {
    cargoPatientById[c.id] = c.patient_id
  }

  const patientIds = Array.from(
    new Set([
      ...citas.map((c) => c.patient_id),
      ...cargos.map((c) => c.patient_id),
      ...pagos.map((p) => cargoPatientById[p.cargo_id]).filter((id): id is string => Boolean(id)),
    ])
  )
  const names = await getPatientNames(client, patientIds)

  const items: { text: string; at: Date }[] = []

  for (const cita of citas) {
    const statusText = CITA_STATUS_TEXT[cita.status]
    if (!statusText) continue
    items.push({
      text: `${names[cita.patient_id] ?? 'Paciente'} ${statusText}`,
      at: new Date(cita.created_at),
    })
  }

  for (const cargo of cargos) {
    items.push({
      text: `Nuevo cargo para ${names[cargo.patient_id] ?? 'Paciente'}: ${cargo.concepto} ($${cargo.monto.toFixed(2)})`,
      at: new Date(cargo.created_at),
    })
  }

  for (const pago of pagos) {
    const patientId = cargoPatientById[pago.cargo_id]
    items.push({
      text: `${names[patientId] ?? 'Paciente'} pagó $${pago.monto.toFixed(2)}`,
      at: new Date(pago.created_at),
    })
  }

  items.sort((a, b) => b.at.getTime() - a.at.getTime())

  return items.slice(0, limit).map((item) => ({
    text: item.text,
    time: formatRelativeTime(item.at, now),
  }))
}
