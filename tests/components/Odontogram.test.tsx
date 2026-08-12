import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Odontogram } from '@/components/patients/Odontogram'
import type { ToothConditionEvent } from '@/lib/patients/types'

function makeEvent(overrides: Partial<ToothConditionEvent>): ToothConditionEvent {
  return {
    id: 'evt-1',
    patient_id: 'p1',
    tooth_number: 11,
    condition_type: 'caries',
    active: true,
    performed_by: 'doc-1',
    performed_at: '2025-03-12T00:00:00Z',
    ...overrides,
  }
}

describe('Odontogram', () => {
  it('renders all 32 teeth and both view tabs', () => {
    render(<Odontogram patientId="p1" events={[]} canEdit={true} />)
    expect(screen.getAllByTestId(/^tooth-/)).toHaveLength(32)
    expect(screen.getByText('Vestibular')).toBeInTheDocument()
    expect(screen.getByText('Lingual y palatina')).toBeInTheDocument()
  })

  it('shows the condition panel for a selected tooth with its active conditions checked', () => {
    render(<Odontogram patientId="p1" events={[makeEvent({})]} canEdit={true} />)
    fireEvent.click(screen.getByTestId('tooth-11'))
    expect(screen.getByText(/Diente 11/)).toBeInTheDocument()
    expect(screen.getByLabelText('Caries')).toBeChecked()
  })

  it('shows no condition panel until a tooth is selected', () => {
    render(<Odontogram patientId="p1" events={[]} canEdit={true} />)
    expect(screen.queryByText(/Diente \d+/)).not.toBeInTheDocument()
  })

  it('switches the active view tab without losing the current selection', () => {
    render(<Odontogram patientId="p1" events={[makeEvent({})]} canEdit={true} />)
    fireEvent.click(screen.getByTestId('tooth-11'))
    fireEvent.click(screen.getByText('Lingual y palatina'))
    expect(screen.getByText(/Diente 11/)).toBeInTheDocument()
    expect(screen.getByLabelText('Caries')).toBeChecked()
  })
})
