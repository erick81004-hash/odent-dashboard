import type { Cita } from '@/lib/citas/types'
import { START_HOUR, END_HOUR, SLOT_MINUTES, SLOT_HEIGHT_PX, minutesFromStart, sameDay, STATUS_COLOR } from '@/lib/citas/timeGrid'

export function WeekView({
  weekStart,
  citas,
  patientNames,
  onSlotClick,
  onCitaClick,
}: {
  weekStart: Date
  citas: Cita[]
  patientNames: Record<string, string>
  onSlotClick: (startsAt: Date) => void
  onCitaClick: (cita: Cita) => void
}) {
  const totalSlots = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayCitas = citas.filter((c) => sameDay(new Date(c.starts_at), day))
        return (
          <div key={day.toISOString()}>
            <p className="mb-1 text-center text-xs font-medium text-foreground/60">
              {day.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })}
            </p>
            <div className="relative" style={{ height: totalSlots * SLOT_HEIGHT_PX }}>
              {Array.from({ length: totalSlots }).map((_, i) => {
                const slotDate = new Date(day)
                slotDate.setHours(START_HOUR, i * SLOT_MINUTES, 0, 0)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSlotClick(slotDate)}
                    className="absolute w-full border-t border-border/40"
                    style={{ top: i * SLOT_HEIGHT_PX, height: SLOT_HEIGHT_PX }}
                  />
                )
              })}
              {dayCitas.map((cita) => {
                const start = new Date(cita.starts_at)
                const top = (minutesFromStart(start) / SLOT_MINUTES) * SLOT_HEIGHT_PX
                const height = (cita.duration_minutes / SLOT_MINUTES) * SLOT_HEIGHT_PX
                return (
                  <button
                    key={cita.id}
                    type="button"
                    data-testid={`week-cita-${cita.id}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onCitaClick(cita)
                    }}
                    className={`absolute left-0 right-0 overflow-hidden rounded px-1 py-0.5 text-left text-[10px] shadow-sm ${STATUS_COLOR[cita.status]}`}
                    style={{ top, height: Math.max(height, 16) }}
                  >
                    <p className="truncate font-medium">{patientNames[cita.patient_id] ?? 'Paciente'}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
