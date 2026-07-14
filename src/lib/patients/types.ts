export type UserRole = 'admin' | 'doctor' | 'asistente'

export type Patient = {
  id: string
  full_name: string
  birth_date: string | null
  sex: string | null
  phone: string | null
  email: string | null
  address: string | null
  allergies: string | null
  medical_conditions: string | null
  current_medications: string | null
  blood_type: string | null
  emergency_contact: string | null
  insurance: string | null
  assigned_doctor_id: string | null
  created_at: string
}

export type TreatmentEvent = {
  id: string
  patient_id: string
  tooth_numbers: number[]
  treatment_type: string
  surface: string | null
  notes: string | null
  performed_by: string
  performed_at: string
  edited_at: string | null
  edited_by: string | null
}

export type PatientDocument = {
  id: string
  patient_id: string
  treatment_event_id: string | null
  storage_path: string
  file_type: string
  uploaded_by: string
  uploaded_at: string
}
