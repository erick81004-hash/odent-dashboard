import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TreatmentHistoryList } from '@/components/patients/TreatmentHistoryList'
import type { TreatmentEvent } from '@/lib/patients/types'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
  }),
}))

vi.mock('@/lib/patients/mutations', () => ({
  addTreatmentEvent: vi.fn(),
}))

import { addTreatmentEvent } from '@/lib/patients/mutations'

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

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
    render(<TreatmentHistoryList patientId="p1" events={events} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('corona')
    expect(items[1]).toHaveTextContent('limpieza')
  })

  it('shows an empty state with no events', () => {
    render(<TreatmentHistoryList patientId="p1" events={[]} />)
    expect(screen.getByText(/sin tratamientos registrados/i)).toBeInTheDocument()
  })

  it('adds a general event not tied to any tooth', async () => {
    const newEvent: TreatmentEvent = {
      id: 'e3', patient_id: 'p1', tooth_numbers: [], treatment_type: 'Consulta',
      surface: null, notes: 'Revisión general', performed_by: 'u1',
      performed_at: '2026-07-16T00:00:00Z', edited_at: null, edited_by: null,
    }
    vi.mocked(addTreatmentEvent).mockResolvedValue(newEvent)

    render(<TreatmentHistoryList patientId="p1" events={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /agregar evento/i }))
    fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: 'Consulta' } })
    fireEvent.change(screen.getByLabelText(/notas/i), { target: { value: 'Revisión general' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(addTreatmentEvent).toHaveBeenCalledWith(
        { auth: expect.any(Object) },
        {
          patient_id: 'p1',
          tooth_numbers: [],
          treatment_type: 'Consulta',
          notes: 'Revisión general',
          performed_by: 'u1',
        }
      )
    })
    expect(await screen.findByText('Consulta')).toBeInTheDocument()
  })
})
