import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'

const mockUsePathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
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
