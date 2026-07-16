'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { listCitasBetween } from '@/lib/citas/queries'
import { createCita, rescheduleCita, updateCitaStatus, CitaConflictError } from '@/lib/citas/mutations'
import type { Cita, CitaStatus } from '@/lib/citas/types'
import { DayView } from './DayView'
import { WeekView } from './WeekView'
import { MonthView } from './MonthView'
import { CitaForm } from './CitaForm'

type Person = { id: string; full_name: string }
type ViewMode = 'dia' | 'semana' | 'mes'
type FormState = { mode: 'create'; startsAt: Date } | { mode: 'edit'; cita: Cita } | null

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

export function addMonthsSafely(date: Date, months: number): Date {
  const result = new Date(date)
  result.setDate(1)
  result.setMonth(result.getMonth() + months)
  return result
}

function rangeForView(view: ViewMode, date: Date): { start: Date; end: Date } {
  if (view === 'dia') {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { start, end }
  }
  if (view === 'semana') {
    const start = startOfWeek(date)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { start, end }
  }
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return { start, end }
}

export function CalendarioClient({ patients, doctors }: { patients: Person[]; doctors: Person[] }) {
  const [view, setView] = useState<ViewMode>('dia')
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [citas, setCitas] = useState<Cita[]>([])
  const [formState, setFormState] = useState<FormState>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const patientNames: Record<string, string> = {}
  for (const p of patients) patientNames[p.id] = p.full_name

  const reload = useCallback(async () => {
    const client = createBrowserSupabaseClient()
    const { start, end } = rangeForView(view, currentDate)
    const data = await listCitasBetween(client, start.toISOString(), end.toISOString())
    setCitas(data)
  }, [view, currentDate])

  useEffect(() => {
    reload()
  }, [reload])

  function navigate(direction: 1 | -1) {
    if (view === 'mes') {
      setCurrentDate(addMonthsSafely(currentDate, direction))
      return
    }
    const next = new Date(currentDate)
    if (view === 'dia') next.setDate(next.getDate() + direction)
    else next.setDate(next.getDate() + direction * 7)
    setCurrentDate(next)
  }

  async function handleCreate(input: {
    patient_id: string
    doctor_id: string
    starts_at: string
    duration_minutes: number
    reason: string
  }) {
    setFormError(null)
    const client = createBrowserSupabaseClient()
    const { data: userData } = await client.auth.getUser()
    if (!userData.user) return
    try {
      await createCita(client, { ...input, created_by: userData.user.id })
      setFormState(null)
      await reload()
    } catch (err) {
      setFormError(err instanceof CitaConflictError ? err.message : 'No se pudo guardar la cita. Intenta de nuevo.')
    }
  }

  async function handleReschedule(input: {
    patient_id: string
    doctor_id: string
    starts_at: string
    duration_minutes: number
    reason: string
  }) {
    if (formState?.mode !== 'edit') return
    setFormError(null)
    const client = createBrowserSupabaseClient()
    try {
      await rescheduleCita(client, formState.cita.id, input)
      setFormState(null)
      await reload()
    } catch (err) {
      setFormError(err instanceof CitaConflictError ? err.message : 'No se pudo guardar la cita. Intenta de nuevo.')
    }
  }

  async function handleStatusChange(status: CitaStatus) {
    if (formState?.mode !== 'edit') return
    const client = createBrowserSupabaseClient()
    await updateCitaStatus(client, formState.cita.id, status)
    setFormState(null)
    await reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(['dia', 'semana', 'mes'] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1 text-sm ${
                view === v ? 'bg-primary text-on-primary' : 'text-foreground/60'
              }`}
            >
              {v === 'dia' ? 'Día' : v === 'semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate(-1)} aria-label="Anterior" className="px-2">
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="rounded border border-border px-2 py-1 text-xs"
          >
            Hoy
          </button>
          <button type="button" onClick={() => navigate(1)} aria-label="Siguiente" className="px-2">
            ›
          </button>
        </div>
      </div>

      {view === 'dia' && (
        <DayView
          date={currentDate}
          citas={citas}
          patientNames={patientNames}
          onSlotClick={(startsAt) => setFormState({ mode: 'create', startsAt })}
          onCitaClick={(cita) => setFormState({ mode: 'edit', cita })}
        />
      )}
      {view === 'semana' && (
        <WeekView
          weekStart={startOfWeek(currentDate)}
          citas={citas}
          patientNames={patientNames}
          onSlotClick={(startsAt) => setFormState({ mode: 'create', startsAt })}
          onCitaClick={(cita) => setFormState({ mode: 'edit', cita })}
        />
      )}
      {view === 'mes' && (
        <MonthView
          monthDate={currentDate}
          citas={citas}
          patientNames={patientNames}
          onDayClick={(date) => {
            setCurrentDate(date)
            setView('dia')
          }}
        />
      )}

      {formState && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold">
                {formState.mode === 'create' ? 'Nueva cita' : 'Editar cita'}
              </h2>
              <button type="button" onClick={() => setFormState(null)} className="text-sm text-foreground/50">
                Cerrar
              </button>
            </div>
            <CitaForm
              patients={patients}
              doctors={doctors}
              initialStartsAt={
                formState.mode === 'create'
                  ? new Date(formState.startsAt.getTime() - formState.startsAt.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                  : undefined
              }
              existingCita={formState.mode === 'edit' ? formState.cita : undefined}
              onSubmit={formState.mode === 'create' ? handleCreate : handleReschedule}
              onStatusChange={formState.mode === 'edit' ? handleStatusChange : undefined}
              error={formError}
            />
          </div>
        </div>
      )}
    </div>
  )
}
