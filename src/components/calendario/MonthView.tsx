import type { Cita } from '@/lib/citas/types'
import { sameDay } from '@/lib/citas/timeGrid'

function startOfCalendarGrid(monthDate: Date): Date {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  return start
}

export function MonthView({
  monthDate,
  citas,
  patientNames,
  onDayClick,
}: {
  monthDate: Date
  citas: Cita[]
  patientNames: Record<string, string>
  onDayClick: (date: Date) => void
}) {
  const gridStart = startOfCalendarGrid(monthDate)
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const dayCitas = citas.filter((c) => sameDay(new Date(c.starts_at), day))
        const isCurrentMonth = day.getMonth() === monthDate.getMonth()
        return (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => onDayClick(day)}
            className={`min-h-20 rounded-lg border border-border/40 p-1 text-left align-top ${
              isCurrentMonth ? 'bg-white/70' : 'bg-white/30 text-foreground/30'
            }`}
          >
            <p className="text-xs font-medium">{day.getDate()}</p>
            {dayCitas.slice(0, 3).map((cita) => (
              <p key={cita.id} className="truncate text-[10px] text-foreground/70">
                {patientNames[cita.patient_id] ?? 'Paciente'}
              </p>
            ))}
            {dayCitas.length > 3 && <p className="text-[10px] text-foreground/50">+{dayCitas.length - 3} más</p>}
          </button>
        )
      })}
    </div>
  )
}
