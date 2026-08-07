import { describe, it, expect } from 'vitest'
import { listCargosForPatient, listAllCargos, listPagosForCargos, getIngresosHoy } from '@/lib/cobranza/queries'

function makeQueryClient(table: string, returnData: unknown) {
  return {
    from: (name: string) => {
      if (name !== table) throw new Error(`unexpected table ${name}`)
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        in: () => builder,
        gte: () => builder,
        lt: () => builder,
        order: async () => ({ data: returnData, error: null }),
        then: (resolve: any) => resolve({ data: returnData, error: null }),
      }
      return builder
    },
  } as any
}

describe('listCargosForPatient', () => {
  it('returns cargos for the given patient', async () => {
    const client = makeQueryClient('cargos', [{ id: 'c1', patient_id: 'p1', concepto: 'Limpieza', monto: 800, created_by: 'u1', created_at: '2026-07-16T00:00:00.000Z' }])
    const result = await listCargosForPatient(client, 'p1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })
})

describe('listAllCargos', () => {
  it('returns all cargos', async () => {
    const client = makeQueryClient('cargos', [
      { id: 'c1', patient_id: 'p1', concepto: 'Limpieza', monto: 800, created_by: 'u1', created_at: '2026-07-16T00:00:00.000Z' },
      { id: 'c2', patient_id: 'p2', concepto: 'Extracción', monto: 1500, created_by: 'u1', created_at: '2026-07-15T00:00:00.000Z' },
    ])
    const result = await listAllCargos(client)
    expect(result).toHaveLength(2)
  })
})

describe('listPagosForCargos', () => {
  it('groups pagos by cargo_id', async () => {
    const client = makeQueryClient('pagos', [
      { id: 'pg1', cargo_id: 'c1', monto: 400, metodo: 'efectivo', nota: null, created_by: 'u1', created_at: '2026-07-16T00:00:00.000Z' },
      { id: 'pg2', cargo_id: 'c1', monto: 400, metodo: 'tarjeta', nota: null, created_by: 'u1', created_at: '2026-07-16T01:00:00.000Z' },
    ])
    const result = await listPagosForCargos(client, ['c1'])
    expect(result['c1']).toHaveLength(2)
  })

  it('returns an empty object without querying when cargoIds is empty', async () => {
    const result = await listPagosForCargos({} as any, [])
    expect(result).toEqual({})
  })
})

describe('getIngresosHoy', () => {
  it('sums the monto of all pagos returned for the day', async () => {
    const client = makeQueryClient('pagos', [{ monto: 400 }, { monto: 250.5 }])
    const total = await getIngresosHoy(client, new Date('2026-07-16T18:00:00.000Z'))
    expect(total).toBe(650.5)
  })
})
