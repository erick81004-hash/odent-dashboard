import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DayView } from '@/components/calendario/DayView'
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

describe('DayView', () => {
  it('renders the patient name and reason for a cita', () => {
    render(
      <DayView
        date={new Date('2026-07-16')}
        citas={[CITA]}
        patientNames={{ p1: 'Ana López' }}
        onSlotClick={vi.fn()}
        onCitaClick={vi.fn()}
      />
    )
    expect(screen.getByText('Ana López')).toBeInTheDocument()
    expect(screen.getByText('Limpieza dental')).toBeInTheDocument()
  })

  it('calls onCitaClick with the cita when its block is clicked', () => {
    const onCitaClick = vi.fn()
    render(
      <DayView
        date={new Date('2026-07-16')}
        citas={[CITA]}
        patientNames={{ p1: 'Ana López' }}
        onSlotClick={vi.fn()}
        onCitaClick={onCitaClick}
      />
    )
    fireEvent.click(screen.getByTestId('cita-c1'))
    expect(onCitaClick).toHaveBeenCalledWith(CITA)
  })

  it('calls onSlotClick with the correct date/time when an empty slot is clicked', () => {
    const onSlotClick = vi.fn()
    render(
      <DayView
        date={new Date('2026-07-16')}
        citas={[]}
        patientNames={{}}
        onSlotClick={onSlotClick}
        onCitaClick={vi.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('slot-0'))
    const calledWith: Date = onSlotClick.mock.calls[0][0]
    expect(calledWith.getHours()).toBe(7)
    expect(calledWith.getMinutes()).toBe(0)
  })
})
