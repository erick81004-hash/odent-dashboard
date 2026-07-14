import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TreatmentEventForm } from '@/components/patients/TreatmentEventForm'

describe('TreatmentEventForm', () => {
  it('calls onSubmit with the entered treatment type and selected teeth', () => {
    const onSubmit = vi.fn()
    render(<TreatmentEventForm patientId="p1" selectedTeeth={[11]} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/tipo de tratamiento/i), {
      target: { value: 'limpieza' },
    })
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      patient_id: 'p1',
      tooth_numbers: [11],
      treatment_type: 'limpieza',
      notes: '',
    })
  })
})
