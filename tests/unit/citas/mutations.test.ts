import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/citas/queries', () => ({
  listCitasBetween: vi.fn(),
}))

import { listCitasBetween } from '@/lib/citas/queries'
import { createCita, rescheduleCita, updateCitaStatus, CitaConflictError } from '@/lib/citas/mutations'
import type { Cita } from '@/lib/citas/types'

function makeCita(overrides: Partial<Cita>): Cita {
  return {
    id: 'existing-1',
    patient_id: 'p-existing',
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

function makeInsertClient(returnRow: any) {
  return {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: returnRow, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: returnRow, error: null }),
          }),
        }),
      }),
    }),
  } as any
}

describe('createCita', () => {
  it('inserts and returns the new cita when there is no conflict', async () => {
    vi.mocked(listCitasBetween).mockResolvedValue([])
    const client = makeInsertClient(makeCita({ id: 'new-1' }))

    const result = await createCita(client, {
      patient_id: 'p1',
      doctor_id: 'd1',
      starts_at: '2026-07-16T10:00:00.000Z',
      duration_minutes: 30,
      reason: 'Limpieza',
      created_by: 'u1',
    })

    expect(result.id).toBe('new-1')
  })

  it('throws CitaConflictError when the doctor already has an overlapping cita', async () => {
    vi.mocked(listCitasBetween).mockResolvedValue([makeCita({})])
    const client = makeInsertClient(makeCita({ id: 'new-1' }))

    await expect(
      createCita(client, {
        patient_id: 'p1',
        doctor_id: 'd1',
        starts_at: '2026-07-16T10:00:00.000Z',
        duration_minutes: 30,
        reason: 'Limpieza',
        created_by: 'u1',
      })
    ).rejects.toThrow(CitaConflictError)
  })
})

describe('rescheduleCita', () => {
  it('excludes the cita being rescheduled from its own conflict check', async () => {
    vi.mocked(listCitasBetween).mockResolvedValue([makeCita({ id: 'c1' })])
    const client = makeInsertClient(makeCita({ id: 'c1', starts_at: '2026-07-16T11:00:00.000Z' }))

    const result = await rescheduleCita(client, 'c1', {
      doctor_id: 'd1',
      starts_at: '2026-07-16T11:00:00.000Z',
      duration_minutes: 30,
    })

    expect(result.id).toBe('c1')
  })
})

describe('updateCitaStatus', () => {
  it('updates and returns the cita with the new status', async () => {
    const client = makeInsertClient(makeCita({ id: 'c1', status: 'confirmada' }))
    const result = await updateCitaStatus(client, 'c1', 'confirmada')
    expect(result.status).toBe('confirmada')
  })

  it('cancelling an appointment updates its status without deleting the row', async () => {
    const client = makeInsertClient(makeCita({ id: 'c1', status: 'cancelada' }))
    const result = await updateCitaStatus(client, 'c1', 'cancelada')
    expect(result.id).toBe('c1')
    expect(result.status).toBe('cancelada')
  })
})
