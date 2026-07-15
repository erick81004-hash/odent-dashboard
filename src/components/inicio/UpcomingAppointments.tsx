type MockAppointment = {
  when: 'Hoy' | 'Mañana'
  time: string
  patientName: string
  reason: string
}

const MOCK_APPOINTMENTS: MockAppointment[] = [
  { when: 'Hoy', time: '10:00 am', patientName: 'María Fernanda López Torres', reason: 'Limpieza dental' },
  { when: 'Hoy', time: '4:30 pm', patientName: 'Jorge Alberto Ramírez Sosa', reason: 'Revisión de corona' },
  { when: 'Mañana', time: '9:00 am', patientName: 'Daniela Guadalupe Pérez Núñez', reason: 'Consulta inicial' },
  { when: 'Mañana', time: '12:00 pm', patientName: 'Roberto Salinas Duarte', reason: 'Extracción' },
]

export function UpcomingAppointments() {
  return (
    <div>
      <h2 className="mb-3 font-heading text-sm font-semibold text-foreground/70">Próximas citas</h2>
      <div className="space-y-2">
        {MOCK_APPOINTMENTS.map((appointment, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-white/70 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  appointment.when === 'Hoy' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                }`}
              >
                {appointment.when}
              </span>
              <span className="text-xs text-foreground/50">{appointment.time}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{appointment.patientName}</p>
            <p className="text-xs text-foreground/60">{appointment.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
