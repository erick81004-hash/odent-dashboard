import { AsistenteChat } from '@/components/inicio/AsistenteChat'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'

export default async function InicioPage() {
  const client = await createServerSupabaseClient()
  const profile = await getCurrentProfile(client)

  return <AsistenteChat name={profile?.full_name ?? ''} />
}
