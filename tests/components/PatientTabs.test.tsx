import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PatientTabs } from '@/components/patients/PatientTabs'

describe('PatientTabs', () => {
  it('renders a Cobranza tab linking to ?tab=cobranza', () => {
    render(<PatientTabs patientId="p1" active="datos" />)
    const link = screen.getByRole('link', { name: 'Cobranza' })
    expect(link).toHaveAttribute('href', '/pacientes/p1?tab=cobranza')
  })

  it('marks the active tab', () => {
    render(<PatientTabs patientId="p1" active="cobranza" />)
    expect(screen.getByRole('link', { name: 'Cobranza' })).toHaveClass('border-blue-600')
  })
})
