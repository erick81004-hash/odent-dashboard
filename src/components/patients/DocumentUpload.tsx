'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

export function DocumentUpload({ patientId }: { patientId: string }) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    const client = createBrowserSupabaseClient()
    const path = `${patientId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await client.storage
      .from('patient-documents')
      .upload(path, file)
    if (uploadError) {
      setUploading(false)
      return
    }
    const { data: userData } = await client.auth.getUser()
    await client.from('documents').insert({
      patient_id: patientId,
      storage_path: path,
      file_type: file.type,
      uploaded_by: userData.user!.id,
    })
    setUploading(false)
    window.location.reload()
  }

  return (
    <input
      type="file"
      disabled={uploading}
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
      }}
      className="text-sm"
    />
  )
}
