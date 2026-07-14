'use client'

import { useState } from 'react'

type TreatmentEventInput = {
  patient_id: string
  tooth_numbers: number[]
  treatment_type: string
  notes: string
}

export function TreatmentEventForm({
  patientId,
  selectedTeeth,
  onSubmit,
}: {
  patientId: string
  selectedTeeth: number[]
  onSubmit?: (input: TreatmentEventInput) => void
}) {
  const [treatmentType, setTreatmentType] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <form
      className="mt-2 space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.({
          patient_id: patientId,
          tooth_numbers: selectedTeeth,
          treatment_type: treatmentType,
          notes,
        })
      }}
    >
      <label className="block text-xs">
        Tipo de tratamiento
        <input
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm"
          value={treatmentType}
          onChange={(e) => setTreatmentType(e.target.value)}
        />
      </label>
      <label className="block text-xs">
        Notas
        <textarea
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <button type="submit" className="rounded border border-gray-400 px-3 py-1 text-sm">
        Registrar evento
      </button>
    </form>
  )
}
