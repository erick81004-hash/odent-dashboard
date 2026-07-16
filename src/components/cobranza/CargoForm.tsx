'use client'

import { useState } from 'react'

type Person = { id: string; full_name: string }

export function CargoForm({
  patients,
  fixedPatientId,
  onSubmit,
  error,
}: {
  patients: Person[]
  fixedPatientId?: string
  onSubmit: (input: { patient_id: string; concepto: string; monto: number }) => void
  error?: string | null
}) {
  const fixedPatient = fixedPatientId ? patients.find((p) => p.id === fixedPatientId) : undefined

  const [patientId, setPatientId] = useState(fixedPatientId ?? '')
  const [patientQuery, setPatientQuery] = useState('')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')

  const matches =
    !fixedPatientId && patientQuery && !patientId
      ? patients.filter((p) => p.full_name.toLowerCase().includes(patientQuery.toLowerCase()))
      : []

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ patient_id: patientId, concepto, monto: Number(monto) })
      }}
    >
      {fixedPatient ? (
        <p className="text-sm font-medium">{fixedPatient.full_name}</p>
      ) : (
        <label className="block text-sm">
          Paciente
          <input
            className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
            value={patientQuery}
            placeholder="Buscar paciente por nombre"
            onChange={(e) => {
              setPatientQuery(e.target.value)
              setPatientId('')
            }}
          />
          {matches.length > 0 && (
            <ul className="mt-1 max-h-40 overflow-y-auto rounded border border-gray-200">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="block w-full px-2 py-1 text-left text-sm hover:bg-gray-50"
                    onClick={() => {
                      setPatientId(p.id)
                      setPatientQuery(p.full_name)
                    }}
                  >
                    {p.full_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </label>
      )}
      <label className="block text-sm">
        Concepto
        <input
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Monto
        <input
          type="number"
          min="0.01"
          step="0.01"
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!patientId}
        className="rounded border border-gray-400 px-3 py-1 text-sm disabled:opacity-40"
      >
        Guardar cargo
      </button>
    </form>
  )
}
