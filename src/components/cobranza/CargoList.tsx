'use client'

import type { Cargo, Pago } from '@/lib/cobranza/types'
import { saldoPendiente, deriveCargoStatus } from '@/lib/cobranza/balance'

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
              <td className="py-2 pr-4">
                <button type="button" className="text-left hover:underline" onClick={() => onCargoClick(cargo)}>
                  {cargo.concepto}
                </button>
              </td>
              <td className="py-2 pr-4">${cargo.monto.toFixed(2)}</td>
              <td className="py-2 pr-4">${saldo.toFixed(2)}</td>
              <td className="py-2 pr-4">{status}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
