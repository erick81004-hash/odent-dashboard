import type { SupabaseClient } from '@supabase/supabase-js'
import type { Cita, Doctor, CitaStatus } from './types'

export async function listCitasBetween(
  client: SupabaseClient,
  startIso: string,
  endIso: string
): Promise<Cita[]> {
  const { data, error } = await client
    .from('citas')
    .select('*')
    .gte('starts_at', startIso)
    .lt('starts_at', endIso)
    .order('starts_at')
  if (error) throw error
  return data as Cita[]
}

export async function listDoctors(client: SupabaseClient): Promise<Doctor[]> {
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'doctor')
    .order('full_name')
  if (error) throw error
  return data as Doctor[]
}

export async function getPatientNames(
  client: SupabaseClient,
  patientIds: string[]
): Promise<Record<string, string>> {
  if (patientIds.length === 0) return {}
  const { data, error } = await client.from('patients').select('id, full_name').in('id', patientIds)
  if (error) throw error

  const names: Record<string, string> = {}
  for (const p of data as { id: string; full_name: string }[]) {
    names[p.id] = p.full_name
  }
  return names
}

export type AppointmentSummary = {
  when: 'Hoy' | 'Mañana'
  time: string
  patientName: string
  reason: string
}

export async function getUpcomingAppointmentSummaries(
  client: SupabaseClient,
  now: Date
): Promise<AppointmentSummary[]> {
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  const dayAfterTomorrow = new Date(todayStart)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

  const citas = await listCitasBetween(client, todayStart.toISOString(), dayAfterTomorrow.toISOString())
  const active = citas.filter((c) => c.status !== ('cancelada' as CitaStatus))
  if (active.length === 0) return []

  const patientIds = [...new Set(active.map((c) => c.patient_id))]
  const names = await getPatientNames(client, patientIds)

  return active.map((cita) => {
    const start = new Date(cita.starts_at)
    return {
      when: (start >= tomorrowStart ? 'Mañana' : 'Hoy') as 'Hoy' | 'Mañana',
      time: start.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' }),
      patientName: names[cita.patient_id] ?? 'Paciente',
      reason: cita.reason,
    }
  })
}
