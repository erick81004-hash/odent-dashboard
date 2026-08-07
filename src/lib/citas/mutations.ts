import type { SupabaseClient } from '@supabase/supabase-js'
import type { Cita, CitaStatus } from './types'
import { hasConflict } from './conflicts'
import { listCitasBetween } from './queries'

export class CitaConflictError extends Error {
  conflictingCita: Cita

  constructor(conflictingCita: Cita) {
    super('El doctor ya tiene una cita en ese horario.')
    this.conflictingCita = conflictingCita
  }
}

async function citasForDayOf(client: SupabaseClient, startsAt: string): Promise<Cita[]> {
  const dayStart = new Date(startsAt)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)
  return listCitasBetween(client, dayStart.toISOString(), dayEnd.toISOString())
}

export async function createCita(
  client: SupabaseClient,
  input: {
    patient_id: string
    doctor_id: string
    starts_at: string
    duration_minutes: number
    reason: string
    created_by: string
  }
): Promise<Cita> {
  const existing = await citasForDayOf(client, input.starts_at)
  const conflict = hasConflict(input.doctor_id, new Date(input.starts_at), input.duration_minutes, existing)
  if (conflict) throw new CitaConflictError(conflict)

  const { data, error } = await client
    .from('citas')
    .insert({ ...input, status: 'programada' })
    .select()
    .single()
  if (error) throw error
  return data as Cita
}

export async function rescheduleCita(
  client: SupabaseClient,
  citaId: string,
  input: { patient_id: string; doctor_id: string; starts_at: string; duration_minutes: number; reason: string }
): Promise<Cita> {
  const existing = await citasForDayOf(client, input.starts_at)
  const conflict = hasConflict(
    input.doctor_id,
    new Date(input.starts_at),
    input.duration_minutes,
    existing,
    citaId
  )
  if (conflict) throw new CitaConflictError(conflict)

  const { data, error } = await client.from('citas').update(input).eq('id', citaId).select().single()
  if (error) throw error
  return data as Cita
}

export async function updateCitaStatus(
  client: SupabaseClient,
  citaId: string,
  status: CitaStatus
): Promise<Cita> {
  const { data, error } = await client.from('citas').update({ status }).eq('id', citaId).select().single()
  if (error) throw error
  return data as Cita
}
