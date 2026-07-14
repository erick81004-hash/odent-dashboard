'use client'

import { useState } from 'react'

type Exchange = {
  question: string
  answer: string | null
  error: string | null
}

export function AsistenteChat() {
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

  return (
    <div className="max-w-xl space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label className="flex-1 text-sm">
          Pregunta
          <input
            className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={loading || !question}
          className="self-end rounded border border-gray-400 px-3 py-1 text-sm"
        >
          Enviar
        </button>
      </form>

      {loading && <p className="text-sm text-gray-500">Pensando…</p>}

      <ul className="space-y-3">
        {exchanges.map((exchange, i) => (
          <li key={i} className="rounded border border-gray-200 p-3 text-sm">
            <p className="font-medium">{exchange.question}</p>
            {exchange.answer && <p className="mt-1">{exchange.answer}</p>}
            {exchange.error && <p className="mt-1 text-red-600">{exchange.error}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
