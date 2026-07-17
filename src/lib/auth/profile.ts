import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/patients/types'

export type Profile = {
  id: string
  role: UserRole
  full_name: string
}

// Uses the local session instead of auth.getUser(): middleware already
// validated the session for this request (that's the network round trip to
// Supabase Auth), so re-validating here on every call was redundant.
export async function getCurrentProfile(
  client: SupabaseClient
): Promise<Profile | null> {
  const { data: sessionData } = await client.auth.getSession()
  const user = sessionData.session?.user
  if (!user) return null

  const { data, error } = await client
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .single()

  if (error || !data) return null
  return data as Profile
}
