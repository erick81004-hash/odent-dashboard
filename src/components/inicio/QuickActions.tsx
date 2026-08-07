import Link from 'next/link'

type Action = {
  label: string
  href?: string
  colorClass: string
  icon: React.ReactNode
}

const ICON_PROPS = { viewBox: '0 0 20 20', fill: 'none', className: 'h-5 w-5' } as const

const ACTIONS: Action[] = [
  {
    label: 'Nueva cita',
    href: '/calendario',
    colorClass: 'bg-primary/10 text-primary',
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M10 11v4M8 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Nuevo paciente',
    href: '/pacientes/nuevo',
    colorClass: 'bg-secondary/20 text-primary',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 17c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M16 7v4M14 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Registrar pago',
    href: '/pagos',
    colorClass: 'bg-accent/10 text-accent',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 6.5v7M8 13c0 .8.9 1.5 2 1.5s2-.6 2-1.4-.9-1.2-2-1.4-2-.6-2-1.4.9-1.4 2-1.4 2 .6 2 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Enviar recordatorio',
    colorClass: 'bg-warning-bg text-warning',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 6l6 4 6-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((action) => {
        const content = (
          <>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${action.colorClass}`}>
              {action.icon}
            </span>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </>
        )
        if (action.href) {
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/80 p-3 shadow-sm transition hover:shadow-md"
            >
              {content}
            </Link>
          )
        }
        return (
          <div
            key={action.label}
            className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-dashed border-border/60 bg-white/40 p-3 opacity-60"
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
