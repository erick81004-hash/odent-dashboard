'use client'

import { useState } from 'react'
import type { Patient } from '@/lib/patients/types'

export function PatientForm({
  onSubmit,
}: {
  onSubmit: (input: Partial<Patient>, photoFile: File | null) => void
}) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [allergies, setAllergies] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  return (
    <form
      className="max-w-md space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ full_name: fullName, phone, allergies: allergies || null }, photoFile)
      }}
    >
      <label className="block text-sm">
        Foto para identificación en el expediente (opcional, uso interno)
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
        />
      </label>
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
