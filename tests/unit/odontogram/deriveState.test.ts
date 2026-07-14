import { describe, it, expect } from 'vitest'
import { deriveToothStates } from '@/lib/odontogram/deriveState'
import type { TreatmentEvent } from '@/lib/patients/types'

function makeEvent(overrides: Partial<TreatmentEvent>): TreatmentEvent {
  return {
    id: 'evt-1',
    patient_id: 'pat-1',
    tooth_numbers: [11],
    treatment_type: 'caries',
    surface: null,
    notes: null,
    performed_by: 'doc-1',
    performed_at: '2025-01-01T00:00:00Z',
    edited_at: null,
    edited_by: null,
    ...overrides,
  }
}

describe('deriveToothStates', () => {
  it('defaults every tooth to sano with no history', () => {
    const states = deriveToothStates([])
    expect(states[11].status).toBe('sano')
    expect(states[11].lastEvent).toBeNull()
  })

  it('sets a tooth status from its most recent event', () => {
    const events = [
      makeEvent({ id: 'evt-1', tooth_numbers: [11], treatment_type: 'caries', performed_at: '2025-01-01T00:00:00Z' }),
      makeEvent({ id: 'evt-2', tooth_numbers: [11], treatment_type: 'corona', performed_at: '2025-06-01T00:00:00Z' }),
    ]
    const states = deriveToothStates(events)
    expect(states[11].status).toBe('corona')
    expect(states[11].lastEvent?.id).toBe('evt-2')
  })

  it('applies one event to multiple teeth', () => {
    const events = [makeEvent({ id: 'evt-1', tooth_numbers: [11, 21], treatment_type: 'limpieza' })]
    const states = deriveToothStates(events)
    expect(states[11].status).toBe('limpieza')
    expect(states[21].status).toBe('limpieza')
  })
})
