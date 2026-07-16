import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CobranzaClient } from '@/components/cobranza/CobranzaClient'
import type { Cargo } from '@/lib/cobranza/types'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
  }),
}))

vi.mock('@/lib/cobranza/mutations', () => ({
  crearCargo: vi.fn(),
  registrarPago: vi.fn(),
  PagoExcedeSaldoError: class PagoExcedeSaldoError extends Error {},
}))

import { crearCargo, registrarPago } from '@/lib/cobranza/mutations'

afterEach(() => {
  vi.restoreAllMocks()
})

const PATIENTS = [{ id: 'p1', full_name: 'Ana López' }]

function makeCargo(overrides: Partial<Cargo>): Cargo {
  return {
    id: 'c1',
    patient_id: 'p1',
    concepto: 'Limpieza dental',
    monto: 1000,
    created_by: 'u1',
    created_at: '2026-07-16T00:00:00.000Z',
    ...overrides,
  }
}

describe('CobranzaClient', () => {
  it('opens the CargoForm modal and calls crearCargo on submit', async () => {
    vi.mocked(crearCargo).mockResolvedValue(makeCargo({ id: 'new-1' }))
    render(<CobranzaClient patients={PATIENTS} cargos={[]} pagosByCargo={{}} />)

    fireEvent.click(screen.getByRole('button', { name: /nuevo cargo/i }))
    fireEvent.change(screen.getByPlaceholderText(/buscar paciente/i), { target: { value: 'Ana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ana López' }))
    fireEvent.change(screen.getByLabelText(/concepto/i), { target: { value: 'Limpieza dental' } })
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '1000' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar cargo/i }))

    await waitFor(() => {
      expect(crearCargo).toHaveBeenCalledWith(
        expect.any(Object),
        { patient_id: 'p1', concepto: 'Limpieza dental', monto: 1000, created_by: 'u1' }
      )
    })
  })

  it('opens the PagoForm modal for a clicked cargo and calls registrarPago on submit', async () => {
    vi.mocked(registrarPago).mockResolvedValue({
      id: 'pg1',
      cargo_id: 'c1',
      monto: 300,
      metodo: 'efectivo',
      nota: null,
      created_by: 'u1',
      created_at: '2026-07-16T00:00:00.000Z',
    })
    const cargo = makeCargo({})
    render(<CobranzaClient patients={PATIENTS} cargos={[cargo]} pagosByCargo={{}} />)

    fireEvent.click(screen.getByText('Limpieza dental'))
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '300' } })
    fireEvent.click(screen.getByRole('button', { name: /registrar pago/i }))

    await waitFor(() => {
      expect(registrarPago).toHaveBeenCalledWith(
        expect.any(Object),
        cargo,
        [],
        { monto: 300, metodo: 'efectivo', nota: null, created_by: 'u1' }
      )
    })
  })
})
