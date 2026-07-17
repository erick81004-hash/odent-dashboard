import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CitaForm } from '@/components/calendario/CitaForm'
import type { Cita } from '@/lib/citas/types'

const PATIENTS = [
  { id: 'p1', full_name: 'Ana López' },
  { id: 'p2', full_name: 'Luis Ruiz' },
]
const DOCTORS = [{ id: 'd1', full_name: 'Dra. Gómez' }]

describe('CitaForm — create mode', () => {
  it('submits the selected patient, doctor, time, duration, and reason', async () => {
    const onSubmit = vi.fn()
    render(
      <CitaForm patients={PATIENTS} doctors={DOCTORS} initialStartsAt="2026-07-16T10:00" onSubmit={onSubmit} />
    )

    fireEvent.change(screen.getByPlaceholderText(/buscar paciente/i), { target: { value: 'Ana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ana López' }))
    fireEvent.change(screen.getByLabelText(/motivo/i), { target: { value: 'Limpieza dental' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar cita/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        patient_id: 'p1',
        doctor_id: 'd1',
        starts_at: new Date('2026-07-16T10:00').toISOString(),
        duration_minutes: 30,
        reason: 'Limpieza dental',
      })
    })
  })

  it('disables the submit button until a patient is selected', () => {
    render(<CitaForm patients={PATIENTS} doctors={DOCTORS} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /guardar cita/i })).toBeDisabled()
  })

  it('does not show the new-patient button when onCreatePatient is not provided', () => {
    render(<CitaForm patients={PATIENTS} doctors={DOCTORS} onSubmit={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /nuevo paciente/i })).not.toBeInTheDocument()
  })

  it('creates a patient inline and selects them when onCreatePatient is provided', async () => {
    const onCreatePatient = vi.fn().mockResolvedValue({ id: 'p3', full_name: 'Carlos Nuevo' })
    const onSubmit = vi.fn()
    render(
      <CitaForm
        patients={PATIENTS}
        doctors={DOCTORS}
        initialStartsAt="2026-07-16T10:00"
        onSubmit={onSubmit}
        onCreatePatient={onCreatePatient}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /nuevo paciente/i }))
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Carlos Nuevo' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar paciente/i }))

    await waitFor(() => {
      expect(onCreatePatient).toHaveBeenCalledWith(
        { full_name: 'Carlos Nuevo', phone: '', allergies: null },
        null
      )
    })

    // back on the cita form, with the new patient selected
    fireEvent.click(screen.getByRole('button', { name: /guardar cita/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ patient_id: 'p3' }))
    })
  })
})

describe('CitaForm — edit mode', () => {
  const existingCita: Cita = {
    id: 'c1',
    patient_id: 'p1',
    doctor_id: 'd1',
    starts_at: '2026-07-16T10:00:00.000Z',
    duration_minutes: 30,
    reason: 'Revisión',
    status: 'programada',
    created_by: 'u1',
    created_at: '2026-07-15T00:00:00.000Z',
  }

  it('shows status buttons and calls onStatusChange when one is clicked', () => {
    const onStatusChange = vi.fn()
    render(
      <CitaForm
        patients={PATIENTS}
        doctors={DOCTORS}
        existingCita={existingCita}
        onSubmit={vi.fn()}
        onStatusChange={onStatusChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'confirmada' }))
    expect(onStatusChange).toHaveBeenCalledWith('confirmada')
  })

  it('round-trips starts_at through the datetime-local input without timezone drift', async () => {
    const onSubmit = vi.fn()
    render(
      <CitaForm patients={PATIENTS} doctors={DOCTORS} existingCita={existingCita} onSubmit={onSubmit} />
    )

    fireEvent.click(screen.getByRole('button', { name: /guardar cita/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ starts_at: '2026-07-16T10:00:00.000Z' })
      )
    })
  })
})
