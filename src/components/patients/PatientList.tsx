import Link from 'next/link'
import type { Patient } from '@/lib/patients/types'

export function PatientList({ patients }: { patients: Patient[] }) {
  if (patients.length === 0) {
    return <p className="text-sm text-gray-500">No hay pacientes que coincidan con la búsqueda.</p>
  }

  return (
    <ul className="divide-y divide-gray-200">
      {patients.map((patient) => (
        <li key={patient.id}>
          <Link
            href={`/pacientes/${patient.id}`}
            className="flex items-center justify-between py-3 hover:bg-gray-50"
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
  )
}
