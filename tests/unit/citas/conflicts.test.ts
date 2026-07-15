import { describe, it, expect } from 'vitest'
import { hasConflict } from '@/lib/citas/conflicts'
import type { Cita } from '@/lib/citas/types'

function makeCita(overrides: Partial<Cita>): Cita {
  return {
    id: 'c1',
    patient_id: 'p1',
    doctor_id: 'd1',
    starts_at: '2026-07-16T10:00:00.000Z',
    duration_minutes: 30,
    reason: 'Revisión',
    status: 'programada',
    created_by: 'u1',
    created_at: '2026-07-15T00:00:00.000Z',
    ...overrides,
  }
}

describe('hasConflict', () => {
  it('returns the conflicting cita on an exact time match', () => {
    const existing = makeCita({})
    const conflict = hasConflict('d1', new Date('2026-07-16T10:00:00.000Z'), 30, [existing])
    expect(conflict?.id).toBe('c1')
  })

  it('returns the conflicting cita on a partial overlap at the start', () => {
    const existing = makeCita({ starts_at: '2026-07-16T10:00:00.000Z', duration_minutes: 30 })
    const conflict = hasConflict('d1', new Date('2026-07-16T09:45:00.000Z'), 30, [existing])
    expect(conflict?.id).toBe('c1')
  })

  it('returns the conflicting cita on a partial overlap at the end', () => {
    const existing = makeCita({ starts_at: '2026-07-16T10:00:00.000Z', duration_minutes: 30 })
    const conflict = hasConflict('d1', new Date('2026-07-16T10:15:00.000Z'), 30, [existing])
    expect(conflict?.id).toBe('c1')
  })

  it('returns null for an adjacent, non-overlapping appointment', () => {
    const existing = makeCita({ starts_at: '2026-07-16T10:00:00.000Z', duration_minutes: 30 })
    const conflict = hasConflict('d1', new Date('2026-07-16T10:30:00.000Z'), 30, [existing])
    expect(conflict).toBeNull()
  })

  it('ignores cancelled appointments', () => {
    const existing = makeCita({ status: 'cancelada' })
    const conflict = hasConflict('d1', new Date('2026-07-16T10:00:00.000Z'), 30, [existing])
    expect(conflict).toBeNull()
  })

  it('ignores appointments for a different doctor', () => {
    const existing = makeCita({ doctor_id: 'd2' })
    const conflict = hasConflict('d1', new Date('2026-07-16T10:00:00.000Z'), 30, [existing])
    expect(conflict).toBeNull()
  })

  it('ignores the appointment being edited when excludeCitaId matches', () => {
    const existing = makeCita({ id: 'c1' })
    const conflict = hasConflict('d1', new Date('2026-07-16T10:00:00.000Z'), 30, [existing], 'c1')
    expect(conflict).toBeNull()
  })
})
