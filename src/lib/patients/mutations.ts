import type { SupabaseClient } from '@supabase/supabase-js'
import type { Patient, TreatmentEvent } from './types'

export async function createPatient(
  client: SupabaseClient,
  input: Partial<Patient>
): Promise<Patient> {
  const { data, error } = await client
    .from('patients')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Patient
}

export async function addTreatmentEvent(
  client: SupabaseClient,
  input: {
    patient_id: string
    tooth_numbers: number[]
    treatment_type: string
    surface?: string
    notes?: string
    performed_by: string
  }
): Promise<TreatmentEvent> {
  const { data, error } = await client
    .from('treatment_events')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as TreatmentEvent
}
