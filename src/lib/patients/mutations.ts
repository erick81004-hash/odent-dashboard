import type { SupabaseClient } from '@supabase/supabase-js'
import type { Patient, TreatmentEvent, PatientDocument } from './types'

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

export async function updatePatient(
  client: SupabaseClient,
  patientId: string,
  input: Partial<Patient>
): Promise<Patient> {
  const { data, error } = await client
    .from('patients')
    .update(input)
    .eq('id', patientId)
    .select()
    .single()
  if (error) throw error
  return data as Patient
}

export class PatientHasReferencesError extends Error {
  constructor() {
    super('No se puede borrar: el paciente tiene citas o cargos registrados.')
  }
}

export async function deletePatient(client: SupabaseClient, patientId: string): Promise<void> {
  const { error } = await client.from('patients').delete().eq('id', patientId)
  if (error) {
    if (error.code === '23503') throw new PatientHasReferencesError()
    throw error
  }
}

export async function updatePatientPhoto(
  client: SupabaseClient,
  patientId: string,
  photoPath: string
): Promise<void> {
  const { error } = await client.from('patients').update({ photo_path: photoPath }).eq('id', patientId)
  if (error) throw error
}

export async function renameDocument(
  client: SupabaseClient,
  documentId: string,
  displayName: string
): Promise<void> {
  const { error } = await client
    .from('documents')
    .update({ display_name: displayName })
    .eq('id', documentId)
  if (error) throw error
}

export async function deleteDocument(client: SupabaseClient, document: PatientDocument): Promise<void> {
  try {
    await client.storage.from('patient-documents').remove([document.storage_path])
  } catch {
    // best-effort: an orphaned storage object is harmless, a dangling DB row is not
  }
  const { error } = await client.from('documents').delete().eq('id', document.id)
  if (error) throw error
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
