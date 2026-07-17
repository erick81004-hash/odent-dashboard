import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CargoList } from '@/components/cobranza/CargoList'
import type { Cargo, Pago } from '@/lib/cobranza/types'

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

describe('CargoList', () => {
  it('shows concepto, monto, saldo pendiente, and derived status', () => {
    const cargos = [makeCargo({})]
    const pagosByCargo: Record<string, Pago[]> = {
      c1: [
        {
          id: 'pg1',
          cargo_id: 'c1',
          monto: 400,
          metodo: 'efectivo',
          nota: null,
          created_by: 'u1',
          created_at: '2026-07-16T00:00:00.000Z',
        },
      ],
    }
    render(<CargoList cargos={cargos} pagosByCargo={pagosByCargo} onCargoClick={vi.fn()} />)

    expect(screen.getByText('Limpieza dental')).toBeInTheDocument()
    expect(screen.getByText(/600/)).toBeInTheDocument()
    expect(screen.getByText('parcial')).toBeInTheDocument()
  })

  it('shows the patient name column when patientNames is provided', () => {
    const cargos = [makeCargo({})]
    render(
      <CargoList
        cargos={cargos}
        pagosByCargo={{}}
        patientNames={{ p1: 'Ana López' }}
        onCargoClick={vi.fn()}
      />
    )
    expect(screen.getByText('Ana López')).toBeInTheDocument()
  })

  it('calls onCargoClick with the clicked cargo', () => {
    const onCargoClick = vi.fn()
    const cargo = makeCargo({})
    render(<CargoList cargos={[cargo]} pagosByCargo={{}} onCargoClick={onCargoClick} />)

    fireEvent.click(screen.getByRole('button', { name: /cobrar/i }))
    expect(onCargoClick).toHaveBeenCalledWith(cargo)
  })
})
