import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CargoForm } from '@/components/cobranza/CargoForm'

const PATIENTS = [
  { id: 'p1', full_name: 'Ana López' },
  { id: 'p2', full_name: 'Luis Ruiz' },
]

describe('CargoForm — searching for a patient', () => {
  it('submits the selected patient, concepto, and monto', async () => {
    const onSubmit = vi.fn()
    render(<CargoForm patients={PATIENTS} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText(/buscar paciente/i), { target: { value: 'Ana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ana López' }))
    fireEvent.change(screen.getByLabelText(/concepto/i), { target: { value: 'Limpieza dental' } })
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '800' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar cargo/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ patient_id: 'p1', concepto: 'Limpieza dental', monto: 800 })
    })
  })

  it('disables the submit button until a patient is selected', () => {
    render(<CargoForm patients={PATIENTS} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /guardar cargo/i })).toBeDisabled()
  })
})

describe('CargoForm — fixedPatientId', () => {
  it('locks the patient and skips the search field', async () => {
    const onSubmit = vi.fn()
    render(<CargoForm patients={PATIENTS} fixedPatientId="p2" onSubmit={onSubmit} />)

    expect(screen.queryByPlaceholderText(/buscar paciente/i)).not.toBeInTheDocument()
    expect(screen.getByText('Luis Ruiz')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/concepto/i), { target: { value: 'Consulta' } })
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '500' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar cargo/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ patient_id: 'p2', concepto: 'Consulta', monto: 500 })
    })
  })
})
