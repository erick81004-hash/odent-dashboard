import { GlobalSearch } from './GlobalSearch'

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  doctor: 'Odontólogo General',
  asistente: 'Asistente',
}

export function TopBar({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-4 px-6 pt-4">
      <GlobalSearch />

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          disabled
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-foreground/60 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
              d="M10 3a5 5 0 0 0-5 5v2.6c0 .5-.2 1-.5 1.4L3 14h14l-1.5-2c-.3-.4-.5-.9-.5-1.4V8a5 5 0 0 0-5-5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M8 16.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>

        <button
          type="button"
          disabled
          aria-label="Mensajes de WhatsApp"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-accent disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
              d="M10 3a7 7 0 0 0-6 10.6L3 17l3.5-1a7 7 0 1 0 3.5-13z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-medium text-on-primary">
            {initials(name)}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-foreground/50">{ROLE_LABEL[role] ?? role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
