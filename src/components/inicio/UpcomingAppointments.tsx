'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { getUpcomingAppointmentSummaries, type AppointmentSummary } from '@/lib/citas/queries'

const POLL_INTERVAL_MS = 20_000

export function UpcomingAppointments({ initialAppointments }: { initialAppointments: AppointmentSummary[] }) {
  const [appointments, setAppointments] = useState(initialAppointments)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const client = createBrowserSupabaseClient()
        const fresh = await getUpcomingAppointmentSummaries(client, new Date())
        setAppointments(fresh)
      } catch {
        // silently keep showing the last known appointments if a poll fails
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h2 className="mb-3 font-heading text-sm font-semibold text-foreground/70">Próximas citas</h2>
      {appointments.length === 0 ? (
        <p className="text-sm text-foreground/50">No hay citas próximas.</p>
      ) : (
        <div className="space-y-2">
          {appointments.map((appointment, i) => (
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
      )}
    </div>
  )
}
