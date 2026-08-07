'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

export function DocumentUpload({ patientId }: { patientId: string }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    const client = createBrowserSupabaseClient()
    const path = `${patientId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await client.storage
      .from('patient-documents')
      .upload(path, file)
    if (uploadError) {
      setError('No se pudo subir el archivo. Intenta de nuevo.')
      setUploading(false)
      return
    }
    const { data: userData } = await client.auth.getUser()
    if (!userData.user) {
      try {
        await client.storage.from('patient-documents').remove([path])
      } catch {
        // best-effort cleanup
      }
      setError('Tu sesión expiró. Vuelve a iniciar sesión e intenta de nuevo.')
      setUploading(false)
      return
    }
    const { error: insertError } = await client.from('documents').insert({
      patient_id: patientId,
      storage_path: path,
      file_type: file.type,
      display_name: file.name,
      uploaded_by: userData.user.id,
    })
    if (insertError) {
      try {
        await client.storage.from('patient-documents').remove([path])
      } catch {
        // best-effort cleanup
      }
      setError('No se pudo guardar el documento. Intenta de nuevo.')
      setUploading(false)
      return
    }
    setUploading(false)
    window.location.reload()
  }

  return (
    <div>
      <input
        type="file"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        className="text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
