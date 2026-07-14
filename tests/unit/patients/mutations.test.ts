import { describe, it, expect } from 'vitest'
import { createPatient, addTreatmentEvent } from '@/lib/patients/mutations'

function makeFakeClient(returnRow: any) {
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

describe('createPatient', () => {
  it('inserts and returns the new patient', async () => {
    const client = makeFakeClient({ id: 'p1', full_name: 'Ana' })
    const result = await createPatient(client, { full_name: 'Ana' })
    expect(result.id).toBe('p1')
  })
})

describe('addTreatmentEvent', () => {
  it('inserts and returns the new event', async () => {
    const client = makeFakeClient({ id: 'e1', tooth_numbers: [11], treatment_type: 'limpieza' })
    const result = await addTreatmentEvent(client, {
      patient_id: 'p1',
      tooth_numbers: [11],
      treatment_type: 'limpieza',
      performed_by: 'doc-1',
    })
    expect(result.id).toBe('e1')
  })
})
