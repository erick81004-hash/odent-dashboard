import type { TreatmentEvent } from '@/lib/patients/types'

export function TreatmentHistoryList({ events }: { events: TreatmentEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-gray-500">Sin tratamientos registrados.</p>
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
  )

  return (
    <ul className="space-y-2">
      {sorted.map((event) => (
        <li key={event.id} className="rounded border border-gray-200 p-2 text-sm">
          <span className="font-medium">{event.treatment_type}</span>
          {' · '}
          diente(s) {event.tooth_numbers.join(', ')}
          {' · '}
          {new Date(event.performed_at).toLocaleDateString()}
          {event.notes && <p className="text-gray-500">{event.notes}</p>}
        </li>
      ))}
    </ul>
  )
}
