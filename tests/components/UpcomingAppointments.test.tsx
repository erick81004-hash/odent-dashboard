import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UpcomingAppointments } from '@/components/inicio/UpcomingAppointments'

describe('UpcomingAppointments', () => {
  it('renders each appointment passed in', () => {
    render(
      <UpcomingAppointments
        appointments={[
          { when: 'Hoy', time: '10:00 a. m.', patientName: 'Ana López', reason: 'Limpieza dental' },
        ]}
      />
    )
    expect(screen.getByText('Ana López')).toBeInTheDocument()
    expect(screen.getByText('Limpieza dental')).toBeInTheDocument()
  })

  it('shows an empty state when there are no appointments', () => {
    render(<UpcomingAppointments appointments={[]} />)
    expect(screen.getByText(/no hay citas próximas/i)).toBeInTheDocument()
  })
})
