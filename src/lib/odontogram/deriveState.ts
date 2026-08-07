import { FDI_TEETH } from './fdi'
import type { TreatmentEvent } from '@/lib/patients/types'

export type ToothState = {
  status: string
  lastEvent: TreatmentEvent | null
}

export function deriveToothStates(
  events: TreatmentEvent[]
): Record<number, ToothState> {
  const states: Record<number, ToothState> = {}
  for (const tooth of FDI_TEETH) {
    states[tooth] = { status: 'sano', lastEvent: null }
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime()
  )

  for (const event of sorted) {
    for (const tooth of event.tooth_numbers) {
      states[tooth] = { status: event.treatment_type, lastEvent: event }
    }
  }

  return states
}
