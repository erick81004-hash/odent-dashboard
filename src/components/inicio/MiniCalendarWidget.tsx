import Link from 'next/link'

const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
const MONTH_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function MiniCalendarWidget({
  monthDate,
  citaCountByDate,
}: {
  monthDate: Date
  citaCountByDate: Record<string, number>
}) {
  const today = new Date()
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - first.getDay())
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })

  return (
    <div className="rounded-xl border border-border/60 bg-white/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-sm font-semibold text-foreground">
          {MONTH_LABELS[monthDate.getMonth()]} {monthDate.getFullYear()}
        </p>
        <Link href="/calendario" className="text-xs font-medium text-primary">
          Ver →
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-foreground/40">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === monthDate.getMonth()
          const isToday = sameDay(day, today)
          const key = day.toISOString().slice(0, 10)
          const count = citaCountByDate[key] ?? 0
          return (
            <div
              key={key}
              className={`flex h-7 flex-col items-center justify-center rounded-md text-[11px] ${
                isToday
                  ? 'bg-primary text-on-primary'
                  : isCurrentMonth
                    ? 'text-foreground'
                    : 'text-foreground/25'
              }`}
            >
              <span>{day.getDate()}</span>
              {count > 0 && !isToday && <span className="h-1 w-1 rounded-full bg-primary" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
