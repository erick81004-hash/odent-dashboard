'use client'

import { useState } from 'react'
import type { PatientDocument } from '@/lib/patients/types'
import { DocumentUpload } from './DocumentUpload'

function DocumentItem({
  doc,
  url,
  canDelete,
}: {
  doc: PatientDocument
  url: string | undefined
  canDelete: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(doc.display_name ?? doc.file_type)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRename() {
    setBusy(true)
    setError(null)
    try {
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
      const { renameDocument } = await import('@/lib/patients/mutations')
      const client = createBrowserSupabaseClient()
      await renameDocument(client, doc.id, name)
      window.location.reload()
    } catch {
      setError('No se pudo cambiar el nombre. Intenta de nuevo.')
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('¿Borrar este documento? Esta acción no se puede deshacer.')) return
    setBusy(true)
    setError(null)
    try {
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
      const { deleteDocument } = await import('@/lib/patients/mutations')
      const client = createBrowserSupabaseClient()
      await deleteDocument(client, doc)
      window.location.reload()
    } catch {
      setError('No se pudo borrar el documento. Intenta de nuevo.')
      setBusy(false)
    }
  }

  return (
    <li className="relative rounded border border-gray-200 p-2 text-xs">
      <div className="flex items-start justify-between">
        {renaming ? (
          <div className="flex-1 space-y-1">
            <input
              className="w-full rounded border border-gray-300 px-1 py-0.5 text-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="text-primary hover:underline"
                disabled={busy}
                onClick={handleRename}
              >
                Guardar
              </button>
              <button
                type="button"
                className="text-gray-500 hover:underline"
                disabled={busy}
                onClick={() => {
                  setRenaming(false)
                  setName(doc.display_name ?? doc.file_type)
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {doc.display_name ?? 'Ver documento'}
              </a>
            ) : (
              <p className="text-gray-400">{doc.display_name ?? 'No disponible'}</p>
            )}
            <p>{doc.file_type}</p>
            <p className="text-gray-500">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
          </div>
        )}

        {!renaming && (
          <div className="relative">
            <button
              type="button"
              aria-label="Más opciones"
              className="px-1 text-gray-500 hover:text-gray-800"
              onClick={() => setMenuOpen((open) => !open)}
            >
              ⋮
            </button>
            {menuOpen && (
              <ul className="absolute right-0 top-5 z-10 w-32 rounded border border-gray-200 bg-white text-left shadow-md">
                <li>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!url}
                    className={`block px-2 py-1 hover:bg-gray-50 ${!url ? 'pointer-events-none text-gray-300' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Abrir
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    className="block w-full px-2 py-1 text-left hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false)
                      setRenaming(true)
                    }}
                  >
                    Cambiar nombre
                  </button>
                </li>
                {canDelete && (
                  <li>
                    <button
                      type="button"
                      className="block w-full px-2 py-1 text-left text-destructive hover:bg-gray-50"
                      onClick={() => {
                        setMenuOpen(false)
                        handleDelete()
                      }}
                    >
                      Borrar
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-red-600">{error}</p>}
    </li>
  )
}

export function DocumentGallery({
  patientId,
  documents,
  documentUrls,
  canDelete,
}: {
  patientId: string
  documents: PatientDocument[]
  documentUrls: Record<string, string>
  canDelete: boolean
}) {
  return (
    <div className="space-y-3">
      <DocumentUpload patientId={patientId} />
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">Sin documentos.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {documents.map((doc) => (
            <DocumentItem key={doc.id} doc={doc} url={documentUrls[doc.id]} canDelete={canDelete} />
          ))}
        </ul>
      )}
    </div>
  )
}
