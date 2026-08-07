'use client'

import type { Cargo, Pago } from '@/lib/cobranza/types'
import { saldoPendiente, deriveCargoStatus } from '@/lib/cobranza/balance'

const DATE_FORMATTER = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

function lastPagoDate(pagos: Pago[]): string | null {
  if (pagos.length === 0) return null
  const latest = pagos.reduce((max, p) => (p.created_at > max ? p.created_at : max), pagos[0].created_at)
  return DATE_FORMATTER.format(new Date(latest))
}

export function CargoList({
  cargos,
  pagosByCargo,
  patientNames,
  onCargoClick,
}: {
  cargos: Cargo[]
  pagosByCargo: Record<string, Pago[]>
  patientNames?: Record<string, string>
  onCargoClick: (cargo: Cargo) => void
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500">
          {patientNames && <th className="py-2 pr-4">Paciente</th>}
          <th className="py-2 pr-4">Concepto</th>
          <th className="py-2 pr-4">Monto</th>
          <th className="py-2 pr-4">Saldo pendiente</th>
          <th className="py-2 pr-4">Estado</th>
          <th className="py-2 pr-4">Fecha inicial</th>
          <th className="py-2 pr-4">Último cobro</th>
          <th className="py-2 pr-4">Acción</th>
        </tr>
      </thead>
      <tbody>
        {cargos.map((cargo) => {
          const pagos = pagosByCargo[cargo.id] ?? []
          const saldo = saldoPendiente(cargo.monto, pagos)
          const status = deriveCargoStatus(cargo.monto, pagos)
          return (
            <tr key={cargo.id} className="border-b border-gray-100">
              {patientNames && <td className="py-2 pr-4">{patientNames[cargo.patient_id] ?? 'Paciente'}</td>}
              <td className="py-2 pr-4">{cargo.concepto}</td>
              <td className="py-2 pr-4">${cargo.monto.toFixed(2)}</td>
              <td className="py-2 pr-4">${saldo.toFixed(2)}</td>
              <td className="py-2 pr-4">{status}</td>
              <td className="py-2 pr-4">{DATE_FORMATTER.format(new Date(cargo.created_at))}</td>
              <td className="py-2 pr-4">{lastPagoDate(pagos) ?? '—'}</td>
              <td className="py-2 pr-4">
                <button
                  type="button"
                  className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                  onClick={() => onCargoClick(cargo)}
                >
                  Cobrar
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
