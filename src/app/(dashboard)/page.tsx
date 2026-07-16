import { AsistenteChat } from '@/components/inicio/AsistenteChat'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import { getUpcomingAppointmentSummaries, listCitasBetween } from '@/lib/citas/queries'
import { listPatients } from '@/lib/patients/queries'
import { getIngresosHoy } from '@/lib/cobranza/queries'

export default async function InicioPage() {
  const client = await createServerSupabaseClient()
  const profile = await getCurrentProfile(client)
  const now = new Date()

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [appointments, patients, monthCitas, ingresosHoy] = await Promise.all([
    getUpcomingAppointmentSummaries(client, now),
    listPatients(client),
    listCitasBetween(client, monthStart.toISOString(), monthEnd.toISOString()),
    getIngresosHoy(client, now),
  ])

  const citaCountByDate: Record<string, number> = {}
  for (const cita of monthCitas) {
    if (cita.status === 'cancelada') continue
    const key = cita.starts_at.slice(0, 10)
    citaCountByDate[key] = (citaCountByDate[key] ?? 0) + 1
  }

  const citasPendientesCount = monthCitas.filter(
    (c) => (c.status === 'programada' || c.status === 'confirmada') && new Date(c.starts_at) >= now
  ).length

  return (
    <AsistenteChat
      name={profile?.full_name ?? ''}
      appointments={appointments}
      patientCount={patients.length}
      citasPendientesCount={citasPendientesCount}
      citaCountByDate={citaCountByDate}
      ingresosHoy={ingresosHoy}
      nowIso={now.toISOString()}
    />
  )
}
