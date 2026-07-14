import type { PatientDocument } from '@/lib/patients/types'
import { DocumentUpload } from './DocumentUpload'

export function DocumentGallery({
  patientId,
  documents,
}: {
  patientId: string
  documents: PatientDocument[]
}) {
  return (
    <div className="space-y-3">
      <DocumentUpload patientId={patientId} />
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">Sin documentos.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {documents.map((doc) => (
            <li key={doc.id} className="rounded border border-gray-200 p-2 text-xs">
              <p>{doc.file_type}</p>
              <p className="text-gray-500">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
