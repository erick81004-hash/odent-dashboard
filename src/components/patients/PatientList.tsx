'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Patient } from '@/lib/patients/types'
import type { TreatmentSummary } from '@/lib/patients/queries'

export function PatientList({
  patients,
  summaries,
  photoUrls,
}: {
  patients: Patient[]
  summaries: Record<string, TreatmentSummary>
  photoUrls: Record<string, string>
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(patients[0]?.id ?? null)

  if (patients.length === 0) {
    return <p className="text-sm text-gray-500">No hay pacientes que coincidan con la búsqueda.</p>
  }

  const previewPatient = patients.find((p) => p.id === hoveredId) ?? patients[0]
  const previewSummary = summaries[previewPatient.id]

  return (
    <div className="flex items-start gap-8">
      <ul className="max-w-md flex-1 divide-y divide-gray-200">
        {patients.map((patient) => (
          <li key={patient.id} onMouseEnter={() => setHoveredId(patient.id)}>
            <Link
              href={`/pacientes/${patient.id}`}
              className="flex items-center justify-between py-3 hover:bg-muted"
            >
              <span className="font-medium">{patient.full_name}</span>
              {patient.allergies && (
                <span className="text-xs rounded bg-amber-100 text-amber-800 px-2 py-1">
                  Alergia: {patient.allergies}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="sticky top-4 w-80 shrink-0 rounded-xl border border-border bg-white p-6 text-center shadow-sm">
        {photoUrls[previewPatient.id] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrls[previewPatient.id]}
            alt={previewPatient.full_name}
            className="mx-auto h-56 w-56 rounded-xl object-cover"
          />
        ) : (
          <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-xl bg-muted text-5xl font-medium text-primary">
            {initials(previewPatient.full_name)}
          </div>
        )}
        <p className="mt-4 font-heading text-xl font-semibold text-foreground">
          {previewPatient.full_name}
        </p>
        <div className="mt-3 space-y-1 text-sm text-foreground/70">
          {previewPatient.allergies && (
            <p>
              <span className="font-medium text-amber-800">Alergia:</span> {previewPatient.allergies}
            </p>
          )}
          {previewPatient.blood_type && (
            <p>
              <span className="font-medium">Tipo de sangre:</span> {previewPatient.blood_type}
            </p>
          )}
          <p>
            {previewSummary
              ? `${previewSummary.count} tratamiento${previewSummary.count === 1 ? '' : 's'} · último: ${previewSummary.lastType}`
              : 'Sin tratamientos registrados'}
          </p>
        </div>
      </div>
    </div>
  )
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
