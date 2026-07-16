import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PagoForm } from '@/components/cobranza/PagoForm'

describe('PagoForm', () => {
  it('submits monto, metodo, and nota', async () => {
    const onSubmit = vi.fn()
    render(<PagoForm saldoPendiente={600} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '300' } })
    fireEvent.change(screen.getByLabelText(/método/i), { target: { value: 'tarjeta' } })
    fireEvent.change(screen.getByLabelText(/nota/i), { target: { value: 'Pago parcial' } })
    fireEvent.click(screen.getByRole('button', { name: /registrar pago/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ monto: 300, metodo: 'tarjeta', nota: 'Pago parcial' })
    })
  })

  it('sends null for nota when left blank', async () => {
    const onSubmit = vi.fn()
    render(<PagoForm saldoPendiente={600} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '300' } })
    fireEvent.click(screen.getByRole('button', { name: /registrar pago/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ monto: 300, metodo: 'efectivo', nota: null })
    })
  })

  it('shows the pending balance and disables submit above it', () => {
    render(<PagoForm saldoPendiente={600} onSubmit={vi.fn()} />)
    expect(screen.getByText(/600/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '700' } })
    expect(screen.getByRole('button', { name: /registrar pago/i })).toBeDisabled()
  })
})
