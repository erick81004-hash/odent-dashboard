import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CalendarioClient } from '@/components/calendario/CalendarioClient'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
  }),
}))

vi.mock('@/lib/citas/queries', () => ({
  listCitasBetween: vi.fn().mockResolvedValue([]),
}))

const PATIENTS = [{ id: 'p1', full_name: 'Ana López' }]
const DOCTORS = [{ id: 'd1', full_name: 'Dra. Gómez' }]

describe('CalendarioClient', () => {
  it('shows the Día view by default', async () => {
    render(<CalendarioClient patients={PATIENTS} doctors={DOCTORS} />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Día' })).toHaveClass('bg-primary')
    })
  })

  it('switches to the Semana view when its tab is clicked', async () => {
    render(<CalendarioClient patients={PATIENTS} doctors={DOCTORS} />)
    await waitFor(() => screen.getByRole('button', { name: 'Día' }))

    fireEvent.click(screen.getByRole('button', { name: 'Semana' }))

    expect(screen.getByRole('button', { name: 'Semana' })).toHaveClass('bg-primary')
    expect(screen.getByRole('button', { name: 'Día' })).not.toHaveClass('bg-primary')
  })
})
