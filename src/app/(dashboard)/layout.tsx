import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const client = await createServerSupabaseClient()
  const profile = await getCurrentProfile(client)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        {profile && <TopBar name={profile.full_name} />}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
