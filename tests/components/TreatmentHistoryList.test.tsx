import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TreatmentHistoryList } from '@/components/patients/TreatmentHistoryList'
import type { TreatmentEvent } from '@/lib/patients/types'

describe('TreatmentHistoryList', () => {
  it('lists events most recent first', () => {
    const events: TreatmentEvent[] = [
      {
        id: 'e1', patient_id: 'p1', tooth_numbers: [11], treatment_type: 'limpieza',
        surface: null, notes: null, performed_by: 'doc-1',
        performed_at: '2025-01-01T00:00:00Z', edited_at: null, edited_by: null,
      },
      {
        id: 'e2', patient_id: 'p1', tooth_numbers: [21], treatment_type: 'corona',
        surface: null, notes: null, performed_by: 'doc-1',
        performed_at: '2025-06-01T00:00:00Z', edited_at: null, edited_by: null,
      },
    ]
    render(<TreatmentHistoryList events={events} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('corona')
    expect(items[1]).toHaveTextContent('limpieza')
  })

  it('shows an empty state with no events', () => {
    render(<TreatmentHistoryList events={[]} />)
    expect(screen.getByText(/sin tratamientos registrados/i)).toBeInTheDocument()
  })
})
