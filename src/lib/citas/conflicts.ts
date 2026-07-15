import type { Cita } from './types'

export function hasConflict(
  doctorId: string,
  startsAt: Date,
  durationMinutes: number,
  existingCitas: Cita[],
  excludeCitaId?: string
): Cita | null {
  const newStart = startsAt.getTime()
  const newEnd = newStart + durationMinutes * 60_000

  for (const cita of existingCitas) {
    if (cita.doctor_id !== doctorId) continue
    if (cita.status === 'cancelada') continue
    if (cita.id === excludeCitaId) continue

    const existingStart = new Date(cita.starts_at).getTime()
    const existingEnd = existingStart + cita.duration_minutes * 60_000

    if (newStart < existingEnd && existingStart < newEnd) {
      return cita
    }
  }
  return null
}
