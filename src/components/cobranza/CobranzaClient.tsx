'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { crearCargo, registrarPago, PagoExcedeSaldoError } from '@/lib/cobranza/mutations'
import type { Cargo, Pago } from '@/lib/cobranza/types'
import { CargoForm } from './CargoForm'
import { PagoForm } from './PagoForm'
import { CargoList } from './CargoList'
import { saldoPendiente } from '@/lib/cobranza/balance'

type Person = { id: string; full_name: string }
type ModalState = { mode: 'nuevo-cargo' } | { mode: 'nuevo-pago'; cargo: Cargo } | null

export function CobranzaClient({
  patients,
  cargos: initialCargos,
  pagosByCargo: initialPagos,
  patientNames,
  fixedPatientId,
}: {
  patients: Person[]
  cargos: Cargo[]
  pagosByCargo: Record<string, Pago[]>
  patientNames?: Record<string, string>
  fixedPatientId?: string
}) {
  const [cargos, setCargos] = useState(initialCargos)
  const [pagosByCargo, setPagosByCargo] = useState(initialPagos)
  const [modal, setModal] = useState<ModalState>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCrearCargo(input: { patient_id: string; concepto: string; monto: number }) {
    setError(null)
    const client = createBrowserSupabaseClient()
    const { data: userData } = await client.auth.getUser()
    if (!userData.user) return
    try {
      const cargo = await crearCargo(client, { ...input, created_by: userData.user.id })
      setCargos((prev) => [cargo, ...prev])
      setModal(null)
    } catch {
      setError('No se pudo guardar el cargo. Intenta de nuevo.')
    }
  }

  async function handleRegistrarPago(input: { monto: number; metodo: Pago['metodo']; nota: string | null }) {
    if (modal?.mode !== 'nuevo-pago') return
    setError(null)
    const client = createBrowserSupabaseClient()
    const { data: userData } = await client.auth.getUser()
    if (!userData.user) return
    const cargo = modal.cargo
    const pagosExistentes = pagosByCargo[cargo.id] ?? []
    try {
      const pago = await registrarPago(client, cargo, pagosExistentes, { ...input, created_by: userData.user.id })
      setPagosByCargo((prev) => ({ ...prev, [cargo.id]: [...(prev[cargo.id] ?? []), pago] }))
      setModal(null)
    } catch (err) {
      setError(err instanceof PagoExcedeSaldoError ? err.message : 'No se pudo registrar el pago. Intenta de nuevo.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModal({ mode: 'nuevo-cargo' })}
          className="rounded border border-gray-400 px-3 py-1 text-sm"
        >
          Nuevo cargo
        </button>
      </div>

      <CargoList
        cargos={cargos}
        pagosByCargo={pagosByCargo}
        patientNames={patientNames}
        onCargoClick={(cargo) => setModal({ mode: 'nuevo-pago', cargo })}
      />

      {modal?.mode === 'nuevo-cargo' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Nuevo cargo</h2>
              <button type="button" onClick={() => setModal(null)} className="text-sm text-gray-500">
                Cerrar
              </button>
            </div>
            <CargoForm patients={patients} fixedPatientId={fixedPatientId} onSubmit={handleCrearCargo} error={error} />
          </div>
        </div>
      )}

      {modal?.mode === 'nuevo-pago' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{modal.cargo.concepto}</h2>
              <button type="button" onClick={() => setModal(null)} className="text-sm text-gray-500">
                Cerrar
              </button>
            </div>
            <PagoForm
              saldoPendiente={saldoPendiente(modal.cargo.monto, pagosByCargo[modal.cargo.id] ?? [])}
              onSubmit={handleRegistrarPago}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  )
}
