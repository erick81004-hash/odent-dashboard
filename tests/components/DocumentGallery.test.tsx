import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DocumentGallery } from '@/components/patients/DocumentGallery'
import type { PatientDocument } from '@/lib/patients/types'

function makeDoc(overrides: Partial<PatientDocument>): PatientDocument {
  return {
    id: 'd1',
    patient_id: 'p1',
    treatment_event_id: null,
    storage_path: 'p1/rx1.jpg',
    file_type: 'image/jpeg',
    display_name: null,
    uploaded_by: 'doc-1',
    uploaded_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('DocumentGallery', () => {
  it('lists each document by file type', () => {
    render(
      <DocumentGallery patientId="p1" documents={[makeDoc({})]} documentUrls={{}} canDelete={false} />
    )
    expect(screen.getByText('image/jpeg')).toBeInTheDocument()
  })

  it('shows an empty state with no documents', () => {
    render(<DocumentGallery patientId="p1" documents={[]} documentUrls={{}} canDelete={false} />)
    expect(screen.getByText(/sin documentos/i)).toBeInTheDocument()
  })

  it('shows a link to open the document when a signed URL is available', () => {
    render(
      <DocumentGallery
        patientId="p1"
        documents={[makeDoc({})]}
        documentUrls={{ d1: 'https://example.com/signed-url' }}
        canDelete={false}
      />
    )
    expect(screen.getByRole('link', { name: /ver documento/i })).toHaveAttribute(
      'href',
      'https://example.com/signed-url'
    )
  })

  it('shows the display name as the link text when set', () => {
    render(
      <DocumentGallery
        patientId="p1"
        documents={[makeDoc({ display_name: 'Radiografía panorámica' })]}
        documentUrls={{ d1: 'https://example.com/signed-url' }}
        canDelete={false}
      />
    )
    expect(screen.getByRole('link', { name: 'Radiografía panorámica' })).toBeInTheDocument()
  })

  it('opens a menu with Abrir and Cambiar nombre, but not Borrar, when canDelete is false', () => {
    render(
      <DocumentGallery
        patientId="p1"
        documents={[makeDoc({})]}
        documentUrls={{ d1: 'https://example.com/signed-url' }}
        canDelete={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /más opciones/i }))
    expect(screen.getByRole('link', { name: 'Abrir' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cambiar nombre' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Borrar' })).not.toBeInTheDocument()
  })

  it('shows Borrar in the menu when canDelete is true', () => {
    render(
      <DocumentGallery
        patientId="p1"
        documents={[makeDoc({})]}
        documentUrls={{ d1: 'https://example.com/signed-url' }}
        canDelete={true}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /más opciones/i }))
    expect(screen.getByRole('button', { name: 'Borrar' })).toBeInTheDocument()
  })

  it('switches to an editable name field when Cambiar nombre is clicked', () => {
    render(
      <DocumentGallery
        patientId="p1"
        documents={[makeDoc({ display_name: 'Radiografía' })]}
        documentUrls={{ d1: 'https://example.com/signed-url' }}
        canDelete={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /más opciones/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar nombre' }))
    expect(screen.getByDisplayValue('Radiografía')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })
})
