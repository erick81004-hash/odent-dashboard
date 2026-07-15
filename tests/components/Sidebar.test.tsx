import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'

const mockUsePathname = vi.fn()
const signOutMock = vi.fn().mockResolvedValue({ error: null })
const pushMock = vi.fn()
const refreshMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signOut: signOutMock },
  }),
}))

describe('Sidebar', () => {
  it('highlights Inicio as active when on /', () => {
    mockUsePathname.mockReturnValue('/')
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveClass('bg-blue-50')
    expect(screen.getByRole('link', { name: 'Pacientes' })).not.toHaveClass('bg-blue-50')
  })

  it('highlights Pacientes as active on /pacientes and its subroutes', () => {
    mockUsePathname.mockReturnValue('/pacientes/nuevo')
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: 'Pacientes' })).toHaveClass('bg-blue-50')
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveClass('bg-blue-50')
  })
})

describe('Sidebar logout', () => {
  it('signs out and redirects to /login when the logout button is clicked', async () => {
    mockUsePathname.mockReturnValue('/')
    render(<Sidebar />)
    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled()
      expect(pushMock).toHaveBeenCalledWith('/login')
    })
  })
})
