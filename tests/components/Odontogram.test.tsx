import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Odontogram } from '@/components/patients/Odontogram'
import type { TreatmentEvent } from '@/lib/patients/types'

function makeEvent(overrides: Partial<TreatmentEvent>): TreatmentEvent {
  return {
    id: 'e1',
    patient_id: 'p1',
    tooth_numbers: [11],
    treatment_type: 'corona',
    surface: null,
    notes: null,
    performed_by: 'doc-1',
    performed_at: '2025-03-12T00:00:00Z',
    edited_at: null,
    edited_by: null,
    ...overrides,
  }
}

describe('Odontogram', () => {
  it('renders all 32 teeth', () => {
    render(<Odontogram patientId="p1" events={[]} />)
    expect(screen.getAllByTestId(/^tooth-/)).toHaveLength(32)
  })

  it('shows the last treatment detail for a selected tooth', () => {
    render(<Odontogram patientId="p1" events={[makeEvent({})]} />)
    fireEvent.click(screen.getByTestId('tooth-11'))
    expect(screen.getByText(/Diente 11 seleccionado/)).toBeInTheDocument()
    expect(screen.getByText(/corona/)).toBeInTheDocument()
  })
})
