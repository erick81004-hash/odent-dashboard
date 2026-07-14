'use client'

import { useState } from 'react'
import { FDI_TEETH } from '@/lib/odontogram/fdi'
import { deriveToothStates } from '@/lib/odontogram/deriveState'
import { ToothCell } from './ToothCell'
import { TreatmentEventForm } from './TreatmentEventForm'
import type { TreatmentEvent } from '@/lib/patients/types'

const UPPER_RIGHT_TO_LEFT = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_RIGHT_TO_LEFT = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

export function Odontogram({
  patientId,
  events,
}: {
  patientId: string
  events: TreatmentEvent[]
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const states = deriveToothStates(events)

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-1">
        {UPPER_RIGHT_TO_LEFT.filter((t) => FDI_TEETH.includes(t)).map((tooth) => (
          <ToothCell
            key={tooth}
            tooth={tooth}
            status={states[tooth].status}
            selected={selected === tooth}
            onSelect={setSelected}
          />
        ))}
      </div>
      <div className="flex justify-center gap-1">
        {LOWER_RIGHT_TO_LEFT.filter((t) => FDI_TEETH.includes(t)).map((tooth) => (
          <ToothCell
            key={tooth}
            tooth={tooth}
            status={states[tooth].status}
            selected={selected === tooth}
            onSelect={setSelected}
          />
        ))}
      </div>

      {selected !== null && (
        <div className="rounded bg-gray-50 p-3 text-sm">
          <p>
            Diente {selected} seleccionado
            {states[selected].lastEvent
              ? ` · ${states[selected].status} · ${new Date(states[selected].lastEvent!.performed_at).toLocaleDateString()}`
              : ' · sin eventos registrados'}
          </p>
          <TreatmentEventForm
            patientId={patientId}
            selectedTeeth={[selected]}
            onSubmit={async (input) => {
              const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
              const { addTreatmentEvent } = await import('@/lib/patients/mutations')
              const client = createBrowserSupabaseClient()
              const { data: userData } = await client.auth.getUser()
              await addTreatmentEvent(client, {
                ...input,
                performed_by: userData.user!.id,
              })
              window.location.reload()
            }}
          />
        </div>
      )}
    </div>
  )
}
