'use client'

import { useState } from 'react'
import type { AppointmentSummary } from '@/lib/citas/queries'
import type { ActivityItem } from '@/lib/inicio/activity'
import { UpcomingAppointments } from './UpcomingAppointments'
import { WhatsAppInbox } from './WhatsAppInbox'
import { QuickActions } from './QuickActions'
import { StatsCards } from './StatsCards'
import { MiniCalendarWidget } from './MiniCalendarWidget'
import { ActivityFeed } from './ActivityFeed'

type Exchange = {
  question: string
  answer: string | null
  error: string | null
}

export function AsistenteChat({
  name = '',
  appointments,
  newPatientsCount,
  citasPendientesCount,
  citaCountByDate,
  ingresosHoy,
  nowIso,
  activityItems,
}: {
  name: string
  appointments: AppointmentSummary[]
  newPatientsCount: number
  citasPendientesCount: number
  citaCountByDate: Record<string, number>
  ingresosHoy: number
  nowIso: string
  activityItems: ActivityItem[]
}) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [exchanges, setExchanges] = useState<Exchange[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const currentQuestion = question
    const history = exchanges
      .filter((ex) => ex.answer !== null)
      .slice(-3)
      .map((ex) => ({ question: ex.question, answer: ex.answer as string }))
    setQuestion('')
    setLoading(true)

    try {
      const response = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, history }),
      })
      const result = await response.json()

      setExchanges((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answer: result.ok ? result.answer : null,
          error: result.ok ? null : result.error,
        },
      ])
    } catch {
      setExchanges((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answer: null,
          error: 'no se pudo obtener respuesta, intenta de nuevo',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const firstName = name.split(' ')[0]

  const now = new Date(nowIso)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="py-4 text-center">
        <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
          Bienvenido, {firstName}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-foreground/60">¿En qué te ayudo hoy?</p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 flex max-w-lg items-center gap-2 rounded-full bg-white/80 py-1.5 pl-5 pr-1.5 shadow-md"
        >
          <input
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
            placeholder="Escribe tu pregunta…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !question}
            aria-label="Enviar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        {loading && <p className="mt-4 text-sm text-foreground/50">Pensando…</p>}
      </div>

      {exchanges.length > 0 && (
        <ul className="mx-auto mb-6 max-w-lg space-y-3">
          {exchanges.map((exchange, i) => (
            <li key={i} className="rounded-xl border border-border/60 bg-white/70 p-4 text-sm shadow-sm">
              <p className="font-medium text-foreground">{exchange.question}</p>
              {exchange.answer && <p className="mt-1 text-foreground/80">{exchange.answer}</p>}
              {exchange.error && <p className="mt-1 text-destructive">{exchange.error}</p>}
            </li>
          ))}
        </ul>
      )}

      <div className="mb-6 space-y-6">
        <QuickActions />
        <StatsCards newPatientsCount={newPatientsCount} citasPendientesCount={citasPendientesCount} ingresosHoy={ingresosHoy} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2">
          <UpcomingAppointments appointments={appointments} />
          <WhatsAppInbox />
        </div>
        <div className="space-y-6">
          <MiniCalendarWidget monthDate={now} citaCountByDate={citaCountByDate} />
          <ActivityFeed items={activityItems} />
        </div>
      </div>
    </div>
  )
}
