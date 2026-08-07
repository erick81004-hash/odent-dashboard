import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PatientDetailsSection } from '@/components/patients/PatientDetailsSection'
import type { Patient } from '@/lib/patients/types'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    storage: {
      from: () => ({ upload: vi.fn().mockResolvedValue({ error: null }) }),
    },
  }),
}))

vi.mock('@/lib/patients/mutations', () => ({
  updatePatient: vi.fn().mockResolvedValue({}),
  updatePatientPhoto: vi.fn().mockResolvedValue(undefined),
  deletePatient: vi.fn().mockResolvedValue(undefined),
}))

import { updatePatient, updatePatientPhoto, deletePatient } from '@/lib/patients/mutations'

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

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
    photo_path: null,
    created_at: '2026-07-16T00:00:00.000Z',
    ...overrides,
  }
}

describe('PatientDetailsSection — view mode', () => {
  it('shows a dash for fields that are not filled in', () => {
    render(<PatientDetailsSection patient={makePatient({})} canDelete={false} />)
    expect(screen.getByText(/Nacimiento: —/)).toBeInTheDocument()
    expect(screen.getByText(/Alergias: —/)).toBeInTheDocument()
    expect(screen.getByText(/Contacto de emergencia: —/)).toBeInTheDocument()
  })

  it('shows the emergency contact phone and relationship together', () => {
    render(
      <PatientDetailsSection
        patient={makePatient({ emergency_contact_phone: '555-1234', emergency_contact_relationship: 'Madre' })}
        canDelete={false}
      />
    )
    expect(screen.getByText(/Contacto de emergencia: 555-1234 \(Madre\)/)).toBeInTheDocument()
  })

  it('shows an Editar información button', () => {
    render(<PatientDetailsSection patient={makePatient({})} canDelete={false} />)
    expect(screen.getByRole('button', { name: /editar información/i })).toBeInTheDocument()
  })

  it('does not show the delete button in view mode even when canDelete is true', () => {
    render(<PatientDetailsSection patient={makePatient({})} canDelete={true} />)
    expect(screen.queryByRole('button', { name: /eliminar paciente/i })).not.toBeInTheDocument()
  })

  it('shows the photo when a photoUrl is provided', () => {
    render(
      <PatientDetailsSection patient={makePatient({})} canDelete={false} photoUrl="https://example.com/photo.jpg" />
    )
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('does not show a photo when no photoUrl is provided', () => {
    render(<PatientDetailsSection patient={makePatient({})} canDelete={false} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

describe('PatientDetailsSection — edit mode', () => {
  it('pre-fills the form with the existing patient data', () => {
    render(
      <PatientDetailsSection
        patient={makePatient({
          allergies: 'Penicilina',
          phone: '555-1234',
          sex: 'Femenino',
          blood_type: 'O+',
          birth_date: '1978-03-15',
        })}
        canDelete={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /editar información/i }))
    expect(screen.getByDisplayValue('Penicilina')).toBeInTheDocument()
    expect(screen.getByDisplayValue('555-1234')).toBeInTheDocument()
    expect(screen.getByLabelText('Sexo')).toHaveValue('Femenino')
    expect(screen.getByLabelText('Tipo de sangre')).toHaveValue('O+')
    expect(screen.getByLabelText('Día de nacimiento')).toHaveValue('15')
    expect(screen.getByLabelText('Mes de nacimiento')).toHaveValue('3')
    expect(screen.getByLabelText('Año de nacimiento')).toHaveValue('1978')
  })

  it('returns to view mode without saving when Cancelar is clicked', () => {
    render(<PatientDetailsSection patient={makePatient({ allergies: 'Penicilina' })} canDelete={false} />)
    fireEvent.click(screen.getByRole('button', { name: /editar información/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByText(/Alergias: Penicilina/)).toBeInTheDocument()
    expect(updatePatient).not.toHaveBeenCalled()
  })

  it('saves the birth date assembled from day/month/year, and blank fields as null', async () => {
    render(<PatientDetailsSection patient={makePatient({ allergies: 'Penicilina' })} canDelete={false} />)
    fireEvent.click(screen.getByRole('button', { name: /editar información/i }))

    fireEvent.change(screen.getByLabelText('Día de nacimiento'), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText('Mes de nacimiento'), { target: { value: '11' } })
    fireEvent.change(screen.getByLabelText('Año de nacimiento'), { target: { value: '1970' } })
    fireEvent.change(screen.getByDisplayValue('Penicilina'), { target: { value: 'Ninguna' } })
    fireEvent.change(screen.getByLabelText('Teléfono de contacto de emergencia'), {
      target: { value: '555-9999' },
    })
    fireEvent.change(screen.getByLabelText('Parentesco'), { target: { value: 'Madre' } })

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(
      () => {
        expect(updatePatient).toHaveBeenCalledWith(
          { storage: expect.any(Object) },
          'p1',
          expect.objectContaining({
            birth_date: '1970-11-05',
            allergies: 'Ninguna',
            emergency_contact_phone: '555-9999',
            emergency_contact_relationship: 'Madre',
            sex: null,
          })
        )
      },
      { timeout: 3000 }
    )
  })

  it('does not show the delete button when canDelete is false', () => {
    render(<PatientDetailsSection patient={makePatient({})} canDelete={false} />)
    fireEvent.click(screen.getByRole('button', { name: /editar información/i }))
    expect(screen.queryByRole('button', { name: /eliminar paciente/i })).not.toBeInTheDocument()
  })

  it('asks for confirmation and deletes the patient when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<PatientDetailsSection patient={makePatient({ full_name: 'Ana López' })} canDelete={true} />)
    fireEvent.click(screen.getByRole('button', { name: /editar información/i }))
    fireEvent.click(screen.getByRole('button', { name: /eliminar paciente/i }))

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Borrar a Ana López? Esta acción no se puede deshacer.'
    )
    await waitFor(() => {
      expect(deletePatient).toHaveBeenCalledWith({ storage: expect.any(Object) }, 'p1')
      expect(push).toHaveBeenCalledWith('/pacientes')
    })
  })

  it('does not delete when the confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<PatientDetailsSection patient={makePatient({})} canDelete={true} />)
    fireEvent.click(screen.getByRole('button', { name: /editar información/i }))
    fireEvent.click(screen.getByRole('button', { name: /eliminar paciente/i }))
    expect(deletePatient).not.toHaveBeenCalled()
  })

  it('shows a friendly error message when deletion is blocked by existing references', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(deletePatient).mockRejectedValueOnce(
      new Error('No se puede borrar: el paciente tiene citas o cargos registrados.')
    )
    render(<PatientDetailsSection patient={makePatient({})} canDelete={true} />)
    fireEvent.click(screen.getByRole('button', { name: /editar información/i }))
    fireEvent.click(screen.getByRole('button', { name: /eliminar paciente/i }))

    await waitFor(() => {
      expect(
        screen.getByText('No se puede borrar: el paciente tiene citas o cargos registrados.')
      ).toBeInTheDocument()
    })
    expect(push).not.toHaveBeenCalled()
  })

  it('uploads a new photo and calls updatePatientPhoto when a file is selected', async () => {
    render(<PatientDetailsSection patient={makePatient({})} canDelete={false} />)
    fireEvent.click(screen.getByRole('button', { name: /editar información/i }))

    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText(/foto para identificación/i)
    fireEvent.change(fileInput, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(
      () => {
        expect(updatePatientPhoto).toHaveBeenCalledWith({ storage: expect.any(Object) }, 'p1', expect.stringContaining('foto.jpg'))
      },
      { timeout: 3000 }
    )
  })

  it('does not call updatePatientPhoto when no file is selected', async () => {
    render(<PatientDetailsSection patient={makePatient({ allergies: 'Penicilina' })} canDelete={false} />)
    fireEvent.click(screen.getByRole('button', { name: /editar información/i }))
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => expect(updatePatient).toHaveBeenCalled())
    expect(updatePatientPhoto).not.toHaveBeenCalled()
  })
})
