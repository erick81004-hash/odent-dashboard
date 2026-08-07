import type { ActivityItem } from '@/lib/inicio/activity'

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-xl border border-border/60 bg-white/80 p-4 shadow-sm">
      <p className="mb-3 font-heading text-sm font-semibold text-foreground">Actividad reciente</p>
      {items.length === 0 ? (
        <p className="text-sm text-foreground/50">Sin actividad reciente.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-2 text-sm">
              <span className="text-foreground/80">{item.text}</span>
              <span className="shrink-0 text-xs text-foreground/40">{item.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
