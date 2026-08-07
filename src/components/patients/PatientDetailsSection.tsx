'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Patient } from '@/lib/patients/types'

const SEX_OPTIONS = ['Masculino', 'Femenino']
const BLOOD_TYPE_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const RELATIONSHIP_OPTIONS = ['Padre', 'Madre', 'Esposo/a', 'Hijo/a', 'Hermano/a', 'Otro']

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const CURRENT_YEAR = new Date().getFullYear()
const BIRTH_YEARS = Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => CURRENT_YEAR - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

function pad(n: string): string {
  return n.padStart(2, '0')
}

function parseBirthDate(birthDate: string | null): { day: string; month: string; year: string } {
  if (!birthDate) return { day: '', month: '', year: '' }
  const [year, month, day] = birthDate.split('-')
  return { day: String(Number(day)), month: String(Number(month)), year }
}

type EditableFields = Pick<
  Patient,
  | 'sex'
  | 'phone'
  | 'email'
  | 'address'
  | 'allergies'
  | 'medical_conditions'
  | 'current_medications'
  | 'blood_type'
  | 'emergency_contact_phone'
  | 'emergency_contact_relationship'
  | 'insurance'
>

function toFormState(patient: Patient): Record<keyof EditableFields, string> {
  return {
    sex: patient.sex ?? '',
    phone: patient.phone ?? '',
    email: patient.email ?? '',
    address: patient.address ?? '',
    allergies: patient.allergies ?? '',
    medical_conditions: patient.medical_conditions ?? '',
    current_medications: patient.current_medications ?? '',
    blood_type: patient.blood_type ?? '',
    emergency_contact_phone: patient.emergency_contact_phone ?? '',
    emergency_contact_relationship: patient.emergency_contact_relationship ?? '',
    insurance: patient.insurance ?? '',
  }
}

export function PatientDetailsSection({
  patient,
  canDelete,
  photoUrl,
}: {
  patient: Patient
  canDelete: boolean
  photoUrl?: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() => toFormState(patient))
  const [birthDate, setBirthDate] = useState(() => parseBirthDate(patient.birth_date))
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function field(key: keyof EditableFields, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
      const { updatePatient, updatePatientPhoto } = await import('@/lib/patients/mutations')
      const client = createBrowserSupabaseClient()
      const input: Partial<Patient> = {}
      for (const key of Object.keys(form) as (keyof EditableFields)[]) {
        input[key] = form[key] === '' ? null : form[key]
      }
      input.birth_date =
        birthDate.day && birthDate.month && birthDate.year
          ? `${birthDate.year}-${pad(birthDate.month)}-${pad(birthDate.day)}`
          : null
      await updatePatient(client, patient.id, input)
      if (photoFile) {
        const path = `${patient.id}/${Date.now()}-${photoFile.name}`
        const { error: uploadError } = await client.storage.from('patient-photos').upload(path, photoFile)
        if (!uploadError) {
          await updatePatientPhoto(client, patient.id, path)
        }
      }
      window.location.reload()
    } catch {
      setError('No se pudo guardar la información. Intenta de nuevo.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`¿Borrar a ${patient.full_name}? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    setError(null)
    try {
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
      const { deletePatient } = await import('@/lib/patients/mutations')
      const client = createBrowserSupabaseClient()
      await deletePatient(client, patient.id)
      router.push('/pacientes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo borrar el paciente. Intenta de nuevo.')
      setDeleting(false)
    }
  }

  if (!editing) {
    const emergencyContact =
      patient.emergency_contact_phone || patient.emergency_contact_relationship
        ? `${patient.emergency_contact_phone ?? '—'}${
            patient.emergency_contact_relationship ? ` (${patient.emergency_contact_relationship})` : ''
          }`
        : '—'
    return (
      <div className="grid grid-cols-2 gap-4 text-sm">
        {photoUrl && (
          <div className="col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={`Foto de identificación de ${patient.full_name}`}
              className="h-24 w-24 rounded object-cover"
            />
          </div>
        )}
        <section>
          <h2 className="font-medium mb-2">Información personal</h2>
          <p>Nacimiento: {patient.birth_date ?? '—'}</p>
          <p>Sexo: {patient.sex ?? '—'}</p>
          <p>Teléfono: {patient.phone ?? '—'}</p>
          <p>Email: {patient.email ?? '—'}</p>
          <p>Dirección: {patient.address ?? '—'}</p>
        </section>
        <section>
          <h2 className="font-medium mb-2">Información médica</h2>
          <p>Alergias: {patient.allergies ?? '—'}</p>
          <p>Condiciones: {patient.medical_conditions ?? '—'}</p>
          <p>Medicamentos: {patient.current_medications ?? '—'}</p>
          <p>Tipo de sangre: {patient.blood_type ?? '—'}</p>
        </section>
        <section>
          <h2 className="font-medium mb-2">Administrativo</h2>
          <p>Contacto de emergencia: {emergencyContact}</p>
          <p>Aseguradora: {patient.insurance ?? '—'}</p>
        </section>
        <div>
          <button
            type="button"
            onClick={() => {
              setForm(toFormState(patient))
              setBirthDate(parseBirthDate(patient.birth_date))
              setEditing(true)
            }}
            className="rounded border border-gray-400 px-3 py-1 text-sm"
          >
            Editar información
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4 text-sm">
      <label className="block">
        Foto para identificación en el expediente (opcional, uso interno)
        {photoUrl && !photoFile && (
          <div className="mt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={`Foto de identificación de ${patient.full_name}`}
              className="h-16 w-16 rounded object-cover"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <section className="space-y-2">
          <h2 className="font-medium">Información personal</h2>
          <div>
            Nacimiento
            <div className="mt-1 flex gap-1">
              <select
                aria-label="Día de nacimiento"
                className="rounded border border-gray-300 px-1 py-1"
                value={birthDate.day}
                onChange={(e) => setBirthDate((prev) => ({ ...prev, day: e.target.value }))}
              >
                <option value="">Día</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                aria-label="Mes de nacimiento"
                className="rounded border border-gray-300 px-1 py-1"
                value={birthDate.month}
                onChange={(e) => setBirthDate((prev) => ({ ...prev, month: e.target.value }))}
              >
                <option value="">Mes</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                aria-label="Año de nacimiento"
                className="rounded border border-gray-300 px-1 py-1"
                value={birthDate.year}
                onChange={(e) => setBirthDate((prev) => ({ ...prev, year: e.target.value }))}
              >
                <option value="">Año</option>
                {BIRTH_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="block">
            Sexo
            <select
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.sex}
              onChange={(e) => field('sex', e.target.value)}
            >
              <option value="">Sin especificar</option>
              {SEX_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Teléfono
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.phone}
              onChange={(e) => field('phone', e.target.value)}
            />
          </label>
          <label className="block">
            Email
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.email}
              onChange={(e) => field('email', e.target.value)}
            />
          </label>
          <label className="block">
            Dirección
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.address}
              onChange={(e) => field('address', e.target.value)}
            />
          </label>
        </section>
        <section className="space-y-2">
          <h2 className="font-medium">Información médica</h2>
          <label className="block">
            Alergias
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.allergies}
              onChange={(e) => field('allergies', e.target.value)}
            />
          </label>
          <label className="block">
            Condiciones
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.medical_conditions}
              onChange={(e) => field('medical_conditions', e.target.value)}
            />
          </label>
          <label className="block">
            Medicamentos
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.current_medications}
              onChange={(e) => field('current_medications', e.target.value)}
            />
          </label>
          <label className="block">
            Tipo de sangre
            <select
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.blood_type}
              onChange={(e) => field('blood_type', e.target.value)}
            >
              <option value="">Sin especificar</option>
              {BLOOD_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section className="space-y-2">
          <h2 className="font-medium">Administrativo</h2>
          <label className="block">
            Teléfono de contacto de emergencia
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.emergency_contact_phone}
              onChange={(e) => field('emergency_contact_phone', e.target.value)}
            />
          </label>
          <label className="block">
            Parentesco
            <select
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.emergency_contact_relationship}
              onChange={(e) => field('emergency_contact_relationship', e.target.value)}
            >
              <option value="">Sin especificar</option>
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Aseguradora
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-2 py-1"
              value={form.insurance}
              onChange={(e) => field('insurance', e.target.value)}
            />
          </label>
        </section>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving || deleting}
            onClick={handleSave}
            className="rounded border border-gray-400 px-3 py-1 text-sm disabled:opacity-40"
          >
            Guardar
          </button>
          <button
            type="button"
            disabled={saving || deleting}
            onClick={() => setEditing(false)}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-500"
          >
            Cancelar
          </button>
        </div>
        {canDelete && (
          <button
            type="button"
            disabled={saving || deleting}
            onClick={handleDelete}
            className="rounded border border-destructive px-2 py-1 text-xs text-destructive disabled:opacity-40"
          >
            Eliminar paciente
          </button>
        )}
      </div>
    </div>
  )
}
