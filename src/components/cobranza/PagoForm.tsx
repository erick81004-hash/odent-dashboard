'use client'

import { useState } from 'react'
import type { MetodoPago } from '@/lib/cobranza/types'

const METODOS: MetodoPago[] = ['efectivo', 'tarjeta', 'transferencia']

export function PagoForm({
  saldoPendiente,
  onSubmit,
  error,
}: {
  saldoPendiente: number
  onSubmit: (input: { monto: number; metodo: MetodoPago; nota: string | null }) => void
  error?: string | null
}) {
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [nota, setNota] = useState('')

  const montoNumber = Number(monto)
  const exceedsBalance = monto !== '' && montoNumber > saldoPendiente

  return (
    <form
      className="space-y-3"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ monto: montoNumber, metodo, nota: nota.trim() ? nota : null })
      }}
    >
      <p className="text-sm text-gray-600">
        Saldo pendiente: <span className="font-medium">${saldoPendiente.toFixed(2)}</span>
      </p>
      <label className="block text-sm">
        Monto
        <input
          type="number"
          min="0"
          step="50"
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Método
        <select
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={metodo}
          onChange={(e) => setMetodo(e.target.value as MetodoPago)}
        >
          {METODOS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Nota
        <input
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
      </label>
      {exceedsBalance && <p className="text-sm text-red-600">El monto excede el saldo pendiente.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!monto || exceedsBalance}
        className="rounded border border-gray-400 px-3 py-1 text-sm disabled:opacity-40"
      >
        Registrar pago
      </button>
    </form>
  )
}
