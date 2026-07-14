import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DocumentGallery } from '@/components/patients/DocumentGallery'
import type { PatientDocument } from '@/lib/patients/types'

describe('DocumentGallery', () => {
  it('lists each document by file type', () => {
    const documents: PatientDocument[] = [
      {
        id: 'd1', patient_id: 'p1', treatment_event_id: null,
        storage_path: 'p1/rx1.jpg', file_type: 'image/jpeg',
        uploaded_by: 'doc-1', uploaded_at: '2025-01-01T00:00:00Z',
      },
    ]
    render(<DocumentGallery patientId="p1" documents={documents} />)
    expect(screen.getByText('image/jpeg')).toBeInTheDocument()
  })

  it('shows an empty state with no documents', () => {
    render(<DocumentGallery patientId="p1" documents={[]} />)
    expect(screen.getByText(/sin documentos/i)).toBeInTheDocument()
  })
})
