import type { Cita } from '@/lib/citas/types'
import { START_HOUR, END_HOUR, SLOT_MINUTES, SLOT_HEIGHT_PX, minutesFromStart, STATUS_COLOR } from '@/lib/citas/timeGrid'

export function DayView({
  date,
  citas,
  patientNames,
  onSlotClick,
  onCitaClick,
}: {
  date: Date
  citas: Cita[]
  patientNames: Record<string, string>
  onSlotClick: (startsAt: Date) => void
  onCitaClick: (cita: Cita) => void
}) {
  const totalSlots = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES

  return (
    <div className="relative" style={{ height: totalSlots * SLOT_HEIGHT_PX }}>
      {Array.from({ length: totalSlots }).map((_, i) => {
        const slotDate = new Date(date)
        slotDate.setHours(START_HOUR, i * SLOT_MINUTES, 0, 0)
        return (
          <button
            key={i}
            type="button"
            data-testid={`slot-${i}`}
            onClick={() => onSlotClick(slotDate)}
            className="absolute left-0 flex w-full items-start border-t border-border/40 pl-2 text-xs text-foreground/40"
            style={{ top: i * SLOT_HEIGHT_PX, height: SLOT_HEIGHT_PX }}
          >
            {i % 2 === 0 ? `${slotDate.getHours()}:00` : ''}
          </button>
        )
      })}

      {citas.map((cita) => {
        const start = new Date(cita.starts_at)
        const top = (minutesFromStart(start) / SLOT_MINUTES) * SLOT_HEIGHT_PX
        const height = (cita.duration_minutes / SLOT_MINUTES) * SLOT_HEIGHT_PX
        return (
          <button
            key={cita.id}
            type="button"
            data-testid={`cita-${cita.id}`}
            onClick={(e) => {
              e.stopPropagation()
              onCitaClick(cita)
            }}
            className={`absolute left-16 right-2 overflow-hidden rounded-lg px-2 py-1 text-left text-xs shadow-sm ${STATUS_COLOR[cita.status]}`}
            style={{ top, height: Math.max(height, 20) }}
          >
            <p className="truncate font-medium">{patientNames[cita.patient_id] ?? 'Paciente'}</p>
            <p className="truncate opacity-80">{cita.reason}</p>
          </button>
        )
      })}
    </div>
  )
}
