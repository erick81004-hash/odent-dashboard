import { describe, it, expect } from 'vitest'
import { listPatients, getPatientById, getTreatmentEvents, getDocuments } from '@/lib/patients/queries'

function makeFakeClient(table: Record<string, any[]>) {
  return {
    from: (name: string) => ({
      select: () => ({
        ilike: (col: string, pattern: string) => {
          // Extract search term from pattern like '%search%'
          const searchTerm = pattern.slice(1, -1)
          return {
            order: async () => ({
              data: table[name].filter((r: any) =>
                r[col].toLowerCase().includes(searchTerm.toLowerCase())
              ),
              error: null,
            }),
          }
        },
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

  it('returns filtered patients when a search term is provided', async () => {
    const client = makeFakeClient({
      patients: [
        { id: 'p1', full_name: 'Ana Silva' },
        { id: 'p2', full_name: 'Bob Johnson' },
        { id: 'p3', full_name: 'Anabel Martinez' },
      ],
    })
    const result = await listPatients(client, 'ana')
    expect(result).toHaveLength(2)
    expect(result[0].full_name).toBe('Ana Silva')
    expect(result[1].full_name).toBe('Anabel Martinez')
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

describe('getDocuments', () => {
  it('returns documents for the given patient', async () => {
    const client = makeFakeClient({
      documents: [
        { id: 'd1', patient_id: 'p1', uploaded_at: '2024-01-01' },
        { id: 'd2', patient_id: 'p2', uploaded_at: '2024-01-02' },
      ],
    })
    const result = await getDocuments(client, 'p1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('d1')
  })
})
