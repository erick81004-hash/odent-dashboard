import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WeekView } from '@/components/calendario/WeekView'
import type { Cita } from '@/lib/citas/types'

const CITA: Cita = {
  id: 'c1',
  patient_id: 'p1',
  doctor_id: 'd1',
  starts_at: '2026-07-16T10:00:00',
  duration_minutes: 30,
  reason: 'Limpieza dental',
  status: 'programada',
  created_by: 'u1',
  created_at: '2026-07-15T00:00:00.000Z',
}

describe('WeekView', () => {
  it('renders a cita only on its own day column', () => {
    render(
      <WeekView
        weekStart={new Date('2026-07-12')}
        citas={[CITA]}
        patientNames={{ p1: 'Ana López' }}
        onSlotClick={vi.fn()}
        onCitaClick={vi.fn()}
      />
    )
    expect(screen.getByText('Ana López')).toBeInTheDocument()
  })

  it('calls onCitaClick with the cita when its block is clicked', () => {
    const onCitaClick = vi.fn()
    render(
      <WeekView
        weekStart={new Date('2026-07-12')}
        citas={[CITA]}
        patientNames={{ p1: 'Ana López' }}
        onSlotClick={vi.fn()}
        onCitaClick={onCitaClick}
      />
    )
    fireEvent.click(screen.getByTestId('week-cita-c1'))
    expect(onCitaClick).toHaveBeenCalledWith(CITA)
  })
})
