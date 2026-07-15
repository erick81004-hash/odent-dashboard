type MessageStatus = 'urgente' | 'pendiente' | 'respondido'

type MockMessage = {
  contactName: string
  preview: string
  time: string
  status: MessageStatus
}

const MOCK_MESSAGES: MockMessage[] = [
  {
    contactName: 'María Fernanda López Torres',
    preview: 'Me duele muchísimo la muela desde anoche, no aguanto el dolor',
    time: 'hace 4 min',
    status: 'urgente',
  },
  {
    contactName: 'Jorge Alberto Ramírez Sosa',
    preview: '¿Puedo mover mi cita de mañana a la tarde?',
    time: 'hace 22 min',
    status: 'pendiente',
  },
  {
    contactName: 'Daniela Guadalupe Pérez Núñez',
    preview: 'Perfecto, ahí estaré a las 9am, gracias',
    time: 'hace 1 h',
    status: 'respondido',
  },
  {
    contactName: 'Roberto Salinas Duarte',
    preview: 'Confirmo mi cita de extracción de mañana',
    time: 'hace 2 h',
    status: 'respondido',
  },
]

const STATUS_STYLE: Record<MessageStatus, string> = {
  urgente: 'bg-red-400 border-red-500',
  pendiente: 'bg-amber-400 border-amber-500',
  respondido: 'bg-emerald-500 border-emerald-600',
}

const STATUS_LABEL: Record<MessageStatus, string> = {
  urgente: 'Urgente',
  pendiente: 'Falta atender',
  respondido: 'Respondido',
}

export function WhatsAppInbox() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <h2 className="font-heading text-sm font-semibold text-foreground/70">
          Mensajes de WhatsApp
        </h2>
      </div>
      <div className="space-y-2">
        {MOCK_MESSAGES.map((message, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-white/70 p-3 shadow-sm"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{message.contactName}</p>
              <p className="truncate text-xs text-foreground/60">{message.preview}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${STATUS_STYLE[message.status]}`}
              >
                {STATUS_LABEL[message.status]}
              </span>
              <span className="text-xs text-foreground/40">{message.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
