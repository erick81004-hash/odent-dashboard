import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PatientList } from '@/components/patients/PatientList'
import type { Patient } from '@/lib/patients/types'

function makePatient(overrides: Partial<Patient>): Patient {
  return {
    id: 'p1',
    full_name: 'Ana López',
    birth_date: null,
    sex: null,
    phone: null,
    email: null,
    address: null,
    allergies: null,
    medical_conditions: null,
    current_medications: null,
    blood_type: null,
    emergency_contact_phone: null,
    emergency_contact_relationship: null,
    insurance: null,
    assigned_doctor_id: null,
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('PatientList', () => {
  it('renders every patient name', () => {
    render(
      <PatientList
        patients={[makePatient({ id: 'p1', full_name: 'Ana López' }), makePatient({ id: 'p2', full_name: 'Luis Ruiz' })]}
        summaries={{}}
        photoUrls={{}}
      />
    )
    expect(screen.getAllByText('Ana López').length).toBeGreaterThan(0)
    expect(screen.getByText('Luis Ruiz')).toBeInTheDocument()
  })

  it('shows an empty state when there are no patients', () => {
    render(<PatientList patients={[]} summaries={{}} photoUrls={{}} />)
    expect(screen.getByText(/no hay pacientes/i)).toBeInTheDocument()
  })
})
