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
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (patients.length === 0) {
    return <p className="text-sm text-gray-500">No hay pacientes que coincidan con la búsqueda.</p>
  }

  return (
    <ul className="divide-y divide-gray-200">
      {patients.map((patient) => {
        const summary = summaries[patient.id]
        return (
          <li
            key={patient.id}
            className="relative"
            onMouseEnter={() => setHoveredId(patient.id)}
            onMouseLeave={() => setHoveredId((current) => (current === patient.id ? null : current))}
          >
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

            {hoveredId === patient.id && (
              <div className="pointer-events-none absolute left-full top-0 z-20 ml-3 w-56 rounded-lg border border-border bg-white p-3 shadow-lg">
                <div className="flex items-center gap-3">
                  {photoUrls[patient.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrls[patient.id]}
                      alt={patient.full_name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-medium text-primary">
                      {initials(patient.full_name)}
                    </div>
                  )}
                  <p className="font-heading text-base font-semibold text-foreground">
                    {patient.full_name}
                  </p>
                </div>
                <p className="mt-2 text-xs text-foreground/70">
                  {summary
                    ? `${summary.count} tratamiento${summary.count === 1 ? '' : 's'} · último: ${summary.lastType}`
                    : 'Sin tratamientos registrados'}
                </p>
              </div>
            )}
          </li>
        )
      })}
    </ul>
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
