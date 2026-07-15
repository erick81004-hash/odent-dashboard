export type CitaStatus = 'programada' | 'confirmada' | 'cancelada' | 'completada'

export type Cita = {
  id: string
  patient_id: string
  doctor_id: string
  starts_at: string
  duration_minutes: number
  reason: string
  status: CitaStatus
  created_by: string
  created_at: string
}

export type Doctor = {
  id: string
  full_name: string
}
