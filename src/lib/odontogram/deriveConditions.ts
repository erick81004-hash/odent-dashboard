import { FDI_TEETH } from './fdi'
import { TOOTH_CONDITIONS, type ToothConditionKey } from './conditions'
import type { ToothConditionEvent } from '@/lib/patients/types'

export type ToothConditionState = {
  activeConditions: ToothConditionKey[]
  lastEventByCondition: Record<ToothConditionKey, ToothConditionEvent | null>
}

export function deriveToothConditions(
  events: ToothConditionEvent[]
): Record<number, ToothConditionState> {
  const states: Record<number, ToothConditionState> = {}

  for (const tooth of FDI_TEETH) {
    const lastEventByCondition = {} as Record<ToothConditionKey, ToothConditionEvent | null>
    for (const condition of TOOTH_CONDITIONS) {
      lastEventByCondition[condition.key] = null
    }
    states[tooth] = { activeConditions: [], lastEventByCondition }
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime()
  )

  for (const event of sorted) {
    const state = states[event.tooth_number]
    if (!state) continue
    state.lastEventByCondition[event.condition_type as ToothConditionKey] = event
  }

  for (const tooth of FDI_TEETH) {
    const state = states[tooth]
    state.activeConditions = TOOTH_CONDITIONS.filter(
      (c) => state.lastEventByCondition[c.key]?.active === true
    ).map((c) => c.key)
  }

  return states
}
