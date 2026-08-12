'use client'

import { useState } from 'react'
import { FDI_TEETH } from '@/lib/odontogram/fdi'
import { deriveToothConditions } from '@/lib/odontogram/deriveConditions'
import type { ToothConditionKey } from '@/lib/odontogram/conditions'
import { ToothGrid } from './ToothGrid'
import { ToothConditionPanel } from './ToothConditionPanel'
import { OdontogramViewTabs, type OdontogramView } from './OdontogramViewTabs'
import type { ToothConditionEvent } from '@/lib/patients/types'

export function Odontogram({
  patientId,
  events,
  canEdit,
}: {
  patientId: string
  events: ToothConditionEvent[]
  canEdit: boolean
}) {
  const [view, setView] = useState<OdontogramView>('vestibular')
  const [selected, setSelected] = useState<number | null>(null)
  const [localEvents, setLocalEvents] = useState(events)
  const [toggleError, setToggleError] = useState<string | null>(null)

  const states = deriveToothConditions(localEvents)
  const activeConditionsByTooth: Record<number, ToothConditionKey[]> = {}
  for (const tooth of FDI_TEETH) {
    activeConditionsByTooth[tooth] = states[tooth].activeConditions
  }

  async function handleToggle(condition: ToothConditionKey, active: boolean) {
    if (selected === null || !canEdit) return
    setToggleError(null)
    try {
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
      const { toggleToothCondition } = await import('@/lib/patients/mutations')
      const client = createBrowserSupabaseClient()
      const { data: userData } = await client.auth.getUser()
      if (!userData.user) return
      const event = await toggleToothCondition(client, {
        patient_id: patientId,
        tooth_number: selected,
        condition_type: condition,
        active,
        performed_by: userData.user.id,
      })
      setLocalEvents((prev) => [...prev, event])
    } catch {
      setToggleError('No se pudo guardar el cambio. Intenta de nuevo.')
    }
  }

  return (
    <div className="space-y-3">
      <OdontogramViewTabs active={view} onChange={setView} />
      <div className="w-full rounded-xl border border-border bg-page p-4 shadow-sm">
        <ToothGrid
          activeConditionsByTooth={activeConditionsByTooth}
          selected={selected}
          onSelect={setSelected}
        />
      </div>
      {selected !== null && (
        <div className="w-full">
          <ToothConditionPanel
            tooth={selected}
            activeConditions={states[selected].activeConditions}
            onToggle={handleToggle}
            disabled={!canEdit}
          />
          {toggleError && <p className="mt-2 text-xs text-destructive">{toggleError}</p>}
        </div>
      )}
    </div>
  )
}
