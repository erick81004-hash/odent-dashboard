import { describe, it, expect } from 'vitest'
import { deriveToothConditions } from '@/lib/odontogram/deriveConditions'
import type { ToothConditionEvent } from '@/lib/patients/types'

function makeEvent(overrides: Partial<ToothConditionEvent>): ToothConditionEvent {
  return {
    id: 'evt-1',
    patient_id: 'pat-1',
    tooth_number: 11,
    condition_type: 'caries',
    active: true,
    performed_by: 'doc-1',
    performed_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('deriveToothConditions', () => {
  it('defaults every tooth to no active conditions with no history', () => {
    const states = deriveToothConditions([])
    expect(states[11].activeConditions).toEqual([])
  })

  it('activates a condition from a single active=true event', () => {
    const events = [makeEvent({ condition_type: 'caries', active: true })]
    const states = deriveToothConditions(events)
    expect(states[11].activeConditions).toEqual(['caries'])
  })

  it('deactivates a condition when a later event sets active=false', () => {
    const events = [
      makeEvent({ id: 'evt-1', condition_type: 'caries', active: true, performed_at: '2025-01-01T00:00:00Z' }),
      makeEvent({ id: 'evt-2', condition_type: 'caries', active: false, performed_at: '2025-06-01T00:00:00Z' }),
    ]
    const states = deriveToothConditions(events)
    expect(states[11].activeConditions).toEqual([])
  })

  it('tracks multiple simultaneously active conditions on the same tooth, in taxonomy order', () => {
    const events = [
      makeEvent({ id: 'evt-1', condition_type: 'movilidad', active: true, performed_at: '2025-01-01T00:00:00Z' }),
      makeEvent({ id: 'evt-2', condition_type: 'caries', active: true, performed_at: '2025-01-02T00:00:00Z' }),
    ]
    const states = deriveToothConditions(events)
    expect(states[11].activeConditions).toEqual(['caries', 'movilidad'])
  })

  it('keeps conditions independent per tooth', () => {
    const events = [
      makeEvent({ tooth_number: 11, condition_type: 'caries', active: true }),
      makeEvent({ tooth_number: 21, condition_type: 'bruxismo', active: true }),
    ]
    const states = deriveToothConditions(events)
    expect(states[11].activeConditions).toEqual(['caries'])
    expect(states[21].activeConditions).toEqual(['bruxismo'])
  })
})
