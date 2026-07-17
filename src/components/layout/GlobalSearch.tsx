'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { listPatients } from '@/lib/patients/queries'
import type { Patient } from '@/lib/patients/types'

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    let cancelled = false
    const client = createBrowserSupabaseClient()
    const timeout = setTimeout(async () => {
      const patients = await listPatients(client, query)
      if (!cancelled) setResults(patients.slice(0, 6))
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectPatient(patientId: string) {
    setOpen(false)
    setQuery('')
    router.push(`/pacientes/${patientId}`)
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-lg flex-1">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40"
      >
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar paciente…"
        className="w-full rounded-full border border-border bg-white/70 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40"
      />

      {open && query.trim() && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-white shadow-md">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-foreground/50">Sin resultados</li>
          ) : (
            results.map((patient) => (
              <li key={patient.id}>
                <button
                  type="button"
                  onClick={() => selectPatient(patient.id)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-muted"
                >
                  {patient.full_name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
