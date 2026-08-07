'use client'

import { useState } from 'react'
import type { TreatmentEvent } from '@/lib/patients/types'

const GENERAL_TREATMENT_TYPES = [
  'Limpieza dental',
  'Consulta',
  'Radiografía',
  'Extracción',
  'Ortodoncia',
  'Otro',
]

export function TreatmentHistoryList({
  patientId,
  events: initialEvents,
}: {
  patientId: string
  events: TreatmentEvent[]
}) {
  const [events, setEvents] = useState(initialEvents)
  const [adding, setAdding] = useState(false)
  const [treatmentType, setTreatmentType] = useState(GENERAL_TREATMENT_TYPES[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    setSaving(true)
    setError(null)
    try {
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
      const { addTreatmentEvent } = await import('@/lib/patients/mutations')
      const client = createBrowserSupabaseClient()
      const { data: userData } = await client.auth.getUser()
      if (!userData.user) throw new Error('no session')
      const event = await addTreatmentEvent(client, {
        patient_id: patientId,
        tooth_numbers: [],
        treatment_type: treatmentType,
        notes,
        performed_by: userData.user.id,
      })
      setEvents((prev) => [event, ...prev])
      setAdding(false)
      setNotes('')
      setTreatmentType(GENERAL_TREATMENT_TYPES[0])
    } catch {
      setError('No se pudo guardar el evento. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
  )

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAdding((prev) => !prev)}
          className="rounded border border-gray-400 px-3 py-1 text-sm"
        >
          + Agregar evento
        </button>
      </div>

      {adding && (
        <div className="space-y-2 rounded border border-gray-200 p-3 text-sm">
          <label className="block text-xs">
            Tipo
            <select
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm"
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
            >
              {GENERAL_TREATMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            Notas
            <textarea
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          {error && <p className="text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleAdd}
              className="rounded border border-gray-400 px-3 py-1 text-sm disabled:opacity-40"
            >
              Guardar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setAdding(false)}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500">Sin tratamientos registrados.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((event) => (
            <li key={event.id} className="rounded border border-gray-200 p-2 text-sm">
              <span className="font-medium">{event.treatment_type}</span>
              {event.tooth_numbers.length > 0 && (
                <>
                  {' · '}
                  diente(s) {event.tooth_numbers.join(', ')}
                </>
              )}
              {' · '}
              {new Date(event.performed_at).toLocaleDateString()}
              {event.notes && <p className="text-gray-500">{event.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
