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
}: {
  patientId: string
  events: ToothConditionEvent[]
}) {
  const [view, setView] = useState<OdontogramView>('vestibular')
  const [selected, setSelected] = useState<number | null>(null)
  const [localEvents, setLocalEvents] = useState(events)

  const states = deriveToothConditions(localEvents)
  const activeConditionsByTooth: Record<number, ToothConditionKey[]> = {}
  for (const tooth of FDI_TEETH) {
    activeConditionsByTooth[tooth] = states[tooth].activeConditions
  }

  async function handleToggle(condition: ToothConditionKey, active: boolean) {
    if (selected === null) return
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
  }

  return (
    <div className="space-y-3">
      <OdontogramViewTabs active={view} onChange={setView} />
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="mx-auto w-full max-w-md shrink-0 rounded-xl border border-border bg-page p-4 shadow-sm">
          <ToothGrid
            activeConditionsByTooth={activeConditionsByTooth}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
        {selected !== null && (
          <div className="md:flex-1">
            <ToothConditionPanel
              tooth={selected}
              activeConditions={states[selected].activeConditions}
              onToggle={handleToggle}
            />
          </div>
        )}
      </div>
    </div>
  )
}
