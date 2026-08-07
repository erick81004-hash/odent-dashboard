import { AsistenteChat } from '@/components/inicio/AsistenteChat'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import { getUpcomingAppointmentSummaries, listCitasBetween } from '@/lib/citas/queries'
import { listPatients } from '@/lib/patients/queries'
import { getIngresosHoy } from '@/lib/cobranza/queries'
import { getRecentActivity } from '@/lib/inicio/activity'
import { getRecentWhatsAppConversations } from '@/lib/inicio/whatsapp'

export default async function InicioPage() {
  const client = await createServerSupabaseClient()
  const profile = await getCurrentProfile(client)
  const now = new Date()

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [appointments, patients, monthCitas, ingresosHoy, activityItems, whatsappConversations] = await Promise.all([
    getUpcomingAppointmentSummaries(client, now),
    listPatients(client),
    listCitasBetween(client, monthStart.toISOString(), monthEnd.toISOString()),
    getIngresosHoy(client, now),
    getRecentActivity(client, now),
    getRecentWhatsAppConversations(client, now),
  ])

  const citaCountByDate: Record<string, number> = {}
  for (const cita of monthCitas) {
    if (cita.status === 'cancelada') continue
    const key = cita.starts_at.slice(0, 10)
    citaCountByDate[key] = (citaCountByDate[key] ?? 0) + 1
  }

  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)
  const citasPendientesCount = monthCitas.filter(
    (c) =>
      (c.status === 'programada' || c.status === 'confirmada') &&
      new Date(c.starts_at) >= now &&
      new Date(c.starts_at) <= todayEnd
  ).length

  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newPatientsCount = patients.filter((p) => new Date(p.created_at) >= thirtyDaysAgo).length

  return (
    <AsistenteChat
      name={profile?.full_name ?? ''}
      appointments={appointments}
      newPatientsCount={newPatientsCount}
      citasPendientesCount={citasPendientesCount}
      citaCountByDate={citaCountByDate}
      ingresosHoy={ingresosHoy}
      nowIso={now.toISOString()}
      activityItems={activityItems}
      whatsappConversations={whatsappConversations}
    />
  )
}
