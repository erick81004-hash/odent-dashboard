import { describe, it, expect } from 'vitest'
import { listPatients, getPatientById, getTreatmentEvents } from '@/lib/patients/queries'

function makeFakeClient(table: Record<string, any[]>) {
  return {
    from: (name: string) => ({
      select: () => ({
        ilike: (_col: string, _pattern: string) => ({
          order: async () => ({ data: table[name], error: null }),
        }),
        order: async () => ({ data: table[name], error: null }),
        eq: (_col: string, value: string) => ({
          single: async () => ({
            data: table[name].find((r: any) => r.id === value) ?? null,
            error: null,
          }),
          order: async () => ({
            data: table[name].filter((r: any) => r.patient_id === value),
            error: null,
          }),
        }),
      }),
    }),
  } as any
}

describe('listPatients', () => {
  it('returns all patients when there is no search term', async () => {
    const client = makeFakeClient({ patients: [{ id: 'p1', full_name: 'Ana' }] })
    const result = await listPatients(client)
    expect(result).toHaveLength(1)
  })
})

describe('getPatientById', () => {
  it('returns the matching patient', async () => {
    const client = makeFakeClient({ patients: [{ id: 'p1', full_name: 'Ana' }] })
    const result = await getPatientById(client, 'p1')
    expect(result?.full_name).toBe('Ana')
  })

  it('returns null for a missing patient', async () => {
    const client = makeFakeClient({ patients: [] })
    const result = await getPatientById(client, 'missing')
    expect(result).toBeNull()
  })
})

describe('getTreatmentEvents', () => {
  it('returns events for the given patient', async () => {
    const client = makeFakeClient({
      treatment_events: [{ id: 'e1', patient_id: 'p1' }, { id: 'e2', patient_id: 'p2' }],
    })
    const result = await getTreatmentEvents(client, 'p1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e1')
  })
})
