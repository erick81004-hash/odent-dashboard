'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function PatientSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <input
      type="text"
      placeholder="Buscar paciente por nombre"
      defaultValue={searchParams.get('q') ?? ''}
      className="w-full rounded border border-border bg-page px-3 py-2 text-sm text-foreground"
      onChange={(e) => {
        const params = new URLSearchParams(searchParams)
        if (e.target.value) params.set('q', e.target.value)
        else params.delete('q')
        router.push(`/pacientes?${params.toString()}`)
      }}
    />
  )
}
