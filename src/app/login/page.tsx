'use client'

import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()

  async function handleSubmit(email: string, password: string) {
    const client = createBrowserSupabaseClient()
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: true }
    }
    router.push('/')
    router.refresh()
    return { error: false }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <h1 className="mb-4 text-lg font-medium">Odent</h1>
        <LoginForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
