import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PatientForm } from '@/components/patients/PatientForm'

describe('PatientForm', () => {
  it('submits the entered full name', () => {
    const onSubmit = vi.fn()
    render(<PatientForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'María González' },
    })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: 'María González' })
    )
  })
})
