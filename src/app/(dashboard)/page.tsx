import { AsistenteChat } from '@/components/inicio/AsistenteChat'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import { getUpcomingAppointmentSummaries } from '@/lib/citas/queries'

export default async function InicioPage() {
  const client = await createServerSupabaseClient()
  const profile = await getCurrentProfile(client)
  const appointments = await getUpcomingAppointmentSummaries(client, new Date())

  return <AsistenteChat name={profile?.full_name ?? ''} appointments={appointments} />
}
