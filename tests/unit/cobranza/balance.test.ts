import { describe, it, expect } from 'vitest'
import { totalPagado, saldoPendiente, deriveCargoStatus } from '@/lib/cobranza/balance'
import type { Pago } from '@/lib/cobranza/types'

function makePago(overrides: Partial<Pago>): Pago {
  return {
    id: 'pg1',
    cargo_id: 'c1',
    monto: 100,
    metodo: 'efectivo',
    nota: null,
    created_by: 'u1',
    created_at: '2026-07-16T00:00:00.000Z',
    ...overrides,
  }
}

describe('totalPagado', () => {
  it('sums monto across all pagos', () => {
    expect(totalPagado([makePago({ monto: 300 }), makePago({ monto: 200 })])).toBe(500)
  })

  it('returns 0 for no pagos', () => {
    expect(totalPagado([])).toBe(0)
  })
})

describe('saldoPendiente', () => {
  it('subtracts total pagado from the cargo amount', () => {
    expect(saldoPendiente(1000, [makePago({ monto: 400 })])).toBe(600)
  })

  it('returns the full amount when there are no pagos', () => {
    expect(saldoPendiente(1000, [])).toBe(1000)
  })

  it('returns 0 when fully paid', () => {
    expect(saldoPendiente(1000, [makePago({ monto: 1000 })])).toBe(0)
  })
})

describe('deriveCargoStatus', () => {
  it('returns pendiente when there are no pagos', () => {
    expect(deriveCargoStatus(1000, [])).toBe('pendiente')
  })

  it('returns parcial when some but not all has been paid', () => {
    expect(deriveCargoStatus(1000, [makePago({ monto: 400 })])).toBe('parcial')
  })

  it('returns pagado when the balance reaches zero', () => {
    expect(deriveCargoStatus(1000, [makePago({ monto: 1000 })])).toBe('pagado')
  })
})
