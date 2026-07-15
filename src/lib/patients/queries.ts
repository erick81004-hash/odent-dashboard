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

export type TreatmentSummary = { count: number; lastType: string | null; lastDate: string | null }

export async function getTreatmentSummaries(
  client: SupabaseClient,
  patientIds: string[]
): Promise<Record<string, TreatmentSummary>> {
  if (patientIds.length === 0) return {}
  const { data, error } = await client
    .from('treatment_events')
    .select('patient_id, treatment_type, performed_at')
    .in('patient_id', patientIds)
    .order('performed_at', { ascending: false })
  if (error) throw error

  const summaries: Record<string, TreatmentSummary> = {}
  for (const event of data as { patient_id: string; treatment_type: string; performed_at: string }[]) {
    const existing = summaries[event.patient_id]
    if (!existing) {
      summaries[event.patient_id] = { count: 1, lastType: event.treatment_type, lastDate: event.performed_at }
    } else {
      existing.count += 1
    }
  }
  return summaries
}

export async function getPatientPhotoUrls(
  client: SupabaseClient,
  patients: Patient[]
): Promise<Record<string, string>> {
  const paths = patients.map((p) => p.photo_path).filter((p): p is string => !!p)
  if (paths.length === 0) return {}
  const { data, error } = await client.storage.from('patient-photos').createSignedUrls(paths, 3600)
  if (error) throw error

  const urls: Record<string, string> = {}
  for (const patient of patients) {
    if (!patient.photo_path) continue
    const match = data?.find((d) => d.path === patient.photo_path)
    if (match?.signedUrl) urls[patient.id] = match.signedUrl
  }
  return urls
}
