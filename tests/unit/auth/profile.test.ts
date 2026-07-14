import { describe, it, expect, vi } from 'vitest'
import { getCurrentProfile } from '@/lib/auth/profile'

function makeFakeClient(user: { id: string } | null, profile: any) {
  return {
    auth: { getUser: async () => ({ data: { user } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: profile, error: null }),
        }),
      }),
    }),
  } as any
}

describe('getCurrentProfile', () => {
  it('returns null when there is no logged-in user', async () => {
    const client = makeFakeClient(null, null)
    expect(await getCurrentProfile(client)).toBeNull()
  })

  it('returns the profile for the logged-in user', async () => {
    const client = makeFakeClient(
      { id: 'user-1' },
      { id: 'user-1', role: 'doctor', full_name: 'Dr. Ibarra' }
    )
    const profile = await getCurrentProfile(client)
    expect(profile).toEqual({ id: 'user-1', role: 'doctor', full_name: 'Dr. Ibarra' })
  })
})
