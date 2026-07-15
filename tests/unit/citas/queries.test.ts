import { describe, it, expect } from 'vitest'
import { listCitasBetween, listDoctors, getPatientNames, getUpcomingAppointmentSummaries } from '@/lib/citas/queries'

function makeFakeClient(table: Record<string, any[]>) {
  return {
    from: (name: string) => ({
      select: () => ({
        gte: (_col: string, _start: string) => ({
          lt: (_col2: string, _end: string) => ({
            order: async () => ({ data: table[name] ?? [], error: null }),
          }),
        }),
        eq: (col: string, value: string) => ({
          order: async () => ({
            data: (table[name] ?? []).filter((r: any) => r[col] === value),
            error: null,
          }),
        }),
        in: (col: string, values: string[]) => ({
          data: (table[name] ?? []).filter((r: any) => values.includes(r[col])),
          error: null,
        }),
      }),
    }),
  } as any
}

describe('listCitasBetween', () => {
  it('returns citas ordered by start time', async () => {
    const client = makeFakeClient({
      citas: [{ id: 'c1', starts_at: '2026-07-16T10:00:00Z' }],
    })
    const result = await listCitasBetween(client, '2026-07-16T00:00:00Z', '2026-07-17T00:00:00Z')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })
})

describe('listDoctors', () => {
  it('returns only profiles with role doctor', async () => {
    const client = makeFakeClient({
      profiles: [
        { id: 'd1', full_name: 'Dra. Gómez', role: 'doctor' },
        { id: 'a1', full_name: 'Asistente Ruiz', role: 'asistente' },
      ],
    })
    const result = await listDoctors(client)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('d1')
  })
})

describe('getPatientNames', () => {
  it('returns an id-to-name map for the given ids', async () => {
    const client = makeFakeClient({
      patients: [
        { id: 'p1', full_name: 'Ana López' },
        { id: 'p2', full_name: 'Luis Ruiz' },
      ],
    })
    const result = await getPatientNames(client, ['p1'])
    expect(result).toEqual({ p1: 'Ana López' })
  })

  it('returns an empty object when given no ids', async () => {
    const client = makeFakeClient({})
    const result = await getPatientNames(client, [])
    expect(result).toEqual({})
  })
})

describe('getUpcomingAppointmentSummaries', () => {
  it('labels a same-day appointment as Hoy and a next-day one as Mañana', async () => {
    const now = new Date('2026-07-16T08:00:00')
    const client = makeFakeClient({
      citas: [
        {
          id: 'c1',
          patient_id: 'p1',
          starts_at: '2026-07-16T14:00:00',
          duration_minutes: 30,
          reason: 'Limpieza',
          status: 'programada',
        },
        {
          id: 'c2',
          patient_id: 'p2',
          starts_at: '2026-07-17T09:00:00',
          duration_minutes: 30,
          reason: 'Revisión',
          status: 'programada',
        },
      ],
      patients: [
        { id: 'p1', full_name: 'Ana López' },
        { id: 'p2', full_name: 'Luis Ruiz' },
      ],
    })
    const result = await getUpcomingAppointmentSummaries(client, now)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ when: 'Hoy', patientName: 'Ana López', reason: 'Limpieza' })
    expect(result[1]).toMatchObject({ when: 'Mañana', patientName: 'Luis Ruiz', reason: 'Revisión' })
  })

  it('excludes cancelled appointments', async () => {
    const now = new Date('2026-07-16T08:00:00')
    const client = makeFakeClient({
      citas: [
        {
          id: 'c1',
          patient_id: 'p1',
          starts_at: '2026-07-16T14:00:00',
          duration_minutes: 30,
          reason: 'Limpieza',
          status: 'cancelada',
        },
      ],
      patients: [{ id: 'p1', full_name: 'Ana López' }],
    })
    const result = await getUpcomingAppointmentSummaries(client, now)
    expect(result).toHaveLength(0)
  })
})
