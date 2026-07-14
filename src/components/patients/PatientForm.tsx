'use client'

import { useState } from 'react'
import type { Patient } from '@/lib/patients/types'

export function PatientForm({
  onSubmit,
}: {
  onSubmit: (input: Partial<Patient>) => void
}) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [allergies, setAllergies] = useState('')

  return (
    <form
      className="max-w-md space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ full_name: fullName, phone, allergies: allergies || null })
      }}
    >
      <label className="block text-sm">
        Nombre completo
        <input
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Teléfono
        <input
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Alergias
        <input
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />
      </label>
      <button type="submit" className="rounded border border-gray-400 px-3 py-1 text-sm">
        Guardar paciente
      </button>
    </form>
  )
}
