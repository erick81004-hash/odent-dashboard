'use client'

import { useState } from 'react'
import { FDI_TEETH } from '@/lib/odontogram/fdi'
import { deriveToothStates } from '@/lib/odontogram/deriveState'
import { TreatmentEventForm } from './TreatmentEventForm'
import type { TreatmentEvent } from '@/lib/patients/types'

// Percentage position (of /teeth/boca-arco.png's width/height) of each tooth,
// measured directly against the image using a percentage-grid overlay.
const FDI_POSITION: Record<number, { x: number; y: number }> = {
  11: { x: 46.6, y: 7.2 },
  12: { x: 39.8, y: 8.6 },
  13: { x: 33.5, y: 11.4 },
  14: { x: 27.8, y: 15.4 },
  15: { x: 22.9, y: 20.5 },
  16: { x: 19.1, y: 26.6 },
  17: { x: 16.5, y: 33.3 },
  18: { x: 15.2, y: 40.4 },
  21: { x: 53.4, y: 7.2 },
  22: { x: 60.2, y: 8.6 },
  23: { x: 66.5, y: 11.4 },
  24: { x: 72.2, y: 15.4 },
  25: { x: 77.1, y: 20.5 },
  26: { x: 80.9, y: 26.6 },
  27: { x: 83.5, y: 33.3 },
  28: { x: 84.8, y: 40.4 },
  41: { x: 46.6, y: 90.8 },
  42: { x: 39.8, y: 89.4 },
  43: { x: 33.5, y: 86.7 },
  44: { x: 27.8, y: 82.8 },
  45: { x: 22.9, y: 77.8 },
  46: { x: 19.1, y: 72.0 },
  47: { x: 16.5, y: 65.5 },
  48: { x: 15.2, y: 58.5 },
  31: { x: 53.4, y: 90.8 },
  32: { x: 60.2, y: 89.4 },
  33: { x: 66.5, y: 86.7 },
  34: { x: 72.2, y: 82.8 },
  35: { x: 77.1, y: 77.8 },
  36: { x: 80.9, y: 72.0 },
  37: { x: 83.5, y: 65.5 },
  38: { x: 84.8, y: 58.5 },
}

const STATUS_FILL: Record<string, string> = {
  sano: 'text-accent',
  caries: 'text-destructive',
  obturado: 'text-warning',
  corona: 'text-primary',
  extraido: 'text-gray-400',
}

function ToothMarker({
  tooth,
  status,
  selected,
  onSelect,
}: {
  tooth: number
  status: string
  selected: boolean
  onSelect: (tooth: number) => void
}) {
  const pos = FDI_POSITION[tooth]
  const r = 2.8
  const colorClass = STATUS_FILL[status] ?? STATUS_FILL.sano

  return (
    <g
      data-testid={`tooth-${tooth}`}
      onClick={() => onSelect(tooth)}
      role="button"
      aria-label={`Diente ${tooth}, estado ${status}`}
      className="cursor-pointer"
    >
      {selected && (
        <circle cx={pos.x} cy={pos.y} r={r + 1.4} className="fill-none stroke-primary" strokeWidth={0.8} />
      )}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={r}
        className={`${colorClass} stroke-white`}
        fill="currentColor"
        strokeWidth={0.5}
      />
      <text
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="central"
        className="select-none fill-white font-medium"
        style={{ fontSize: '2.3px' }}
      >
        {tooth}
      </text>
    </g>
  )
}

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
    <div className="flex flex-col gap-3 md:flex-row md:items-start">
      <div className="relative mx-auto aspect-[896/1200] w-full max-w-sm shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/teeth/boca-arco.png"
          alt="Diagrama de arcada dental"
          className="h-full w-full object-contain"
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {FDI_TEETH.map((tooth) => (
            <ToothMarker
              key={tooth}
              tooth={tooth}
              status={states[tooth].status}
              selected={selected === tooth}
              onSelect={setSelected}
            />
          ))}
        </svg>
      </div>

      {selected !== null && (
        <div className="rounded bg-gray-50 p-3 text-sm md:flex-1">
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
