import type { SupabaseClient } from '@supabase/supabase-js'
import type { Patient, TreatmentEvent, PatientDocument } from './types'

export async function listPatients(
  client: SupabaseClient,
  search?: string
): Promise<Patient[]> {
  const base = client.from('patients').select('*')
  const query = search ? base.ilike('full_name', `%${search}%`) : base
  const { data, error } = await query.order('full_name')
  if (error) throw error
  return data as Patient[]
}

export async function getPatientById(
  client: SupabaseClient,
  id: string
): Promise<Patient | null> {
  const { data, error } = await client
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Patient
}

export async function getTreatmentEvents(
  client: SupabaseClient,
  patientId: string
): Promise<TreatmentEvent[]> {
  const { data, error } = await client
    .from('treatment_events')
    .select('*')
    .eq('patient_id', patientId)
    .order('performed_at')
  if (error) throw error
  return data as TreatmentEvent[]
}

export async function getDocuments(
  client: SupabaseClient,
  patientId: string
): Promise<PatientDocument[]> {
  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('patient_id', patientId)
    .order('uploaded_at')
  if (error) throw error
  return data as PatientDocument[]
}
