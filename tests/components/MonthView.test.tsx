import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthView } from '@/components/calendario/MonthView'
import type { Cita } from '@/lib/citas/types'

function makeCita(overrides: Partial<Cita>): Cita {
  return {
    id: 'c1',
    patient_id: 'p1',
    doctor_id: 'd1',
    starts_at: '2026-07-16T10:00:00',
    duration_minutes: 30,
    reason: 'Limpieza',
    status: 'programada',
    created_by: 'u1',
    created_at: '2026-07-15T00:00:00.000Z',
    ...overrides,
  }
}

describe('MonthView', () => {
  it('shows up to 3 patient names per day and a +N indicator for the rest', () => {
    const citas = [
      makeCita({ id: 'c1', patient_id: 'p1' }),
      makeCita({ id: 'c2', patient_id: 'p2' }),
      makeCita({ id: 'c3', patient_id: 'p3' }),
      makeCita({ id: 'c4', patient_id: 'p4' }),
    ]
    render(
      <MonthView
        monthDate={new Date('2026-07-16')}
        citas={citas}
        patientNames={{ p1: 'Ana', p2: 'Luis', p3: 'Bea', p4: 'Carlos' }}
        onDayClick={vi.fn()}
      />
    )
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Luis')).toBeInTheDocument()
    expect(screen.getByText('Bea')).toBeInTheDocument()
    expect(screen.queryByText('Carlos')).not.toBeInTheDocument()
    expect(screen.getByText('+1 más')).toBeInTheDocument()
  })

  it('calls onDayClick with that day when a day cell is clicked', () => {
    const onDayClick = vi.fn()
    render(<MonthView monthDate={new Date('2026-07-16')} citas={[]} patientNames={{}} onDayClick={onDayClick} />)
    fireEvent.click(screen.getByText('16'))
    const calledWith: Date = onDayClick.mock.calls[0][0]
    expect(calledWith.getDate()).toBe(16)
  })
})
