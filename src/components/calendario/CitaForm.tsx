'use client'

import { useState } from 'react'
import type { Cita, CitaStatus } from '@/lib/citas/types'

type Person = { id: string; full_name: string }

const DURATIONS = [15, 30, 45, 60, 90]
const STATUS_OPTIONS: CitaStatus[] = ['programada', 'confirmada', 'cancelada', 'completada']

function toLocalDatetimeInputValue(isoString: string): string {
  const date = new Date(isoString)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

export function CitaForm({
  patients,
  doctors,
  initialStartsAt = '',
  existingCita,
  onSubmit,
  onStatusChange,
  error,
}: {
  patients: Person[]
  doctors: Person[]
  initialStartsAt?: string
  existingCita?: Cita
  onSubmit: (input: {
    patient_id: string
    doctor_id: string
    starts_at: string
    duration_minutes: number
    reason: string
  }) => void
  onStatusChange?: (status: CitaStatus) => void
  error?: string | null
}) {
  const existingPatientName = patients.find((p) => p.id === existingCita?.patient_id)?.full_name ?? ''

  const [patientId, setPatientId] = useState(existingCita?.patient_id ?? '')
  const [patientQuery, setPatientQuery] = useState(existingPatientName)
  const [doctorId, setDoctorId] = useState(existingCita?.doctor_id ?? doctors[0]?.id ?? '')
  const [startsAt, setStartsAt] = useState(
    existingCita ? toLocalDatetimeInputValue(existingCita.starts_at) : initialStartsAt
  )
  const [duration, setDuration] = useState(existingCita?.duration_minutes ?? 30)
  const [reason, setReason] = useState(existingCita?.reason ?? '')

  const matches =
    patientQuery && !patientId
      ? patients.filter((p) => p.full_name.toLowerCase().includes(patientQuery.toLowerCase()))
      : []

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          patient_id: patientId,
          doctor_id: doctorId,
          starts_at: new Date(startsAt).toISOString(),
          duration_minutes: duration,
          reason,
        })
      }}
    >
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
      <label className="block text-sm">
        Doctor
        <select
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
        >
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Fecha y hora
        <input
          type="datetime-local"
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Duración
        <select
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        >
          {DURATIONS.map((d) => (
            <option key={d} value={d}>
              {d} min
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Motivo
        <input
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!patientId}
        className="rounded border border-gray-400 px-3 py-1 text-sm disabled:opacity-40"
      >
        Guardar cita
      </button>

      {existingCita && onStatusChange && (
        <div className="flex flex-wrap gap-2 pt-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={`rounded border px-2 py-1 text-xs ${
                existingCita.status === status ? 'border-primary bg-primary text-on-primary' : 'border-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
