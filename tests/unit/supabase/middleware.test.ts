import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'

describe('updateSession', () => {
  it('redirects to /login when there is no authenticated user', async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: { getUser: async () => ({ data: { user: null } }) },
    } as any)

    const request = new NextRequest('http://localhost:3000/pacientes')
    const response = await updateSession(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('passes the request through when a user is authenticated', async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
    } as any)

    const request = new NextRequest('http://localhost:3000/pacientes')
    const response = await updateSession(request)

    expect(response.status).toBe(200)
  })
})
