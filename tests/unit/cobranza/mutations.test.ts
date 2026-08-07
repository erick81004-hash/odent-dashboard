import { describe, it, expect } from 'vitest'
import { crearCargo, registrarPago, PagoExcedeSaldoError } from '@/lib/cobranza/mutations'
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

function makeInsertClient(returnRow: unknown) {
  return {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: returnRow, error: null }),
        }),
      }),
    }),
  } as any
}

describe('crearCargo', () => {
  it('inserts and returns the new cargo', async () => {
    const client = makeInsertClient(makeCargo({ id: 'new-1' }))
    const result = await crearCargo(client, {
      patient_id: 'p1',
      concepto: 'Limpieza dental',
      monto: 1000,
      created_by: 'u1',
    })
    expect(result.id).toBe('new-1')
  })
})

describe('registrarPago', () => {
  it('inserts and returns the new pago when it does not exceed the balance', async () => {
    const client = makeInsertClient(makePago({ id: 'new-1' }))
    const cargo = makeCargo({})
    const result = await registrarPago(client, cargo, [], {
      monto: 400,
      metodo: 'efectivo',
      nota: null,
      created_by: 'u1',
    })
    expect(result.id).toBe('new-1')
  })

  it('throws PagoExcedeSaldoError when the pago would exceed the pending balance', async () => {
    const client = makeInsertClient(makePago({}))
    const cargo = makeCargo({ monto: 1000 })
    const existing = [makePago({ monto: 700 })]

    await expect(
      registrarPago(client, cargo, existing, { monto: 400, metodo: 'efectivo', nota: null, created_by: 'u1' })
    ).rejects.toThrow(PagoExcedeSaldoError)
  })

  it('allows a pago that exactly matches the remaining balance', async () => {
    const client = makeInsertClient(makePago({ id: 'new-1', monto: 300 }))
    const cargo = makeCargo({ monto: 1000 })
    const existing = [makePago({ monto: 700 })]

    const result = await registrarPago(client, cargo, existing, {
      monto: 300,
      metodo: 'efectivo',
      nota: null,
      created_by: 'u1',
    })
    expect(result.id).toBe('new-1')
  })
})
