import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/LoginForm'

describe('LoginForm', () => {
  it('calls onSubmit with the entered email and password', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ error: false })
    render(<LoginForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/correo/i), {
      target: { value: 'doctor@odent.test' },
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('doctor@odent.test', 'secret123')
    })
  })

  it('shows the error message when onSubmit reports an error', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ error: true })
    render(<LoginForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/correo/i), {
      target: { value: 'doctor@odent.test' },
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrong' },
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
    })
  })
})
