'use client'

import { useState } from 'react'
import { UpcomingAppointments } from './UpcomingAppointments'
import { WhatsAppInbox } from './WhatsAppInbox'

type Exchange = {
  question: string
  answer: string | null
  error: string | null
}

export function AsistenteChat({ name = '' }: { name: string }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [exchanges, setExchanges] = useState<Exchange[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const currentQuestion = question
    setQuestion('')
    setLoading(true)

    try {
      const response = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion }),
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

  return (
    <div className="mx-auto max-w-5xl">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <UpcomingAppointments />
        <WhatsAppInbox />
      </div>
    </div>
  )
}
