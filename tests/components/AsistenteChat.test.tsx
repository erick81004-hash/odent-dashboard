import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AsistenteChat } from '@/components/inicio/AsistenteChat'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AsistenteChat', () => {
  it('shows the answer after a successful question', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ ok: true, answer: 'No tiene alergias registradas.' }),
      })
    )

    render(
      <AsistenteChat
        name="Test User"
        appointments={[]}
        patientCount={0}
        citasPendientesCount={0}
        citaCountByDate={{}}
        ingresosHoy={0}
        nowIso="2026-07-16T12:00:00.000Z"
      />)
    fireEvent.change(screen.getByPlaceholderText(/escribe tu pregunta/i), {
      target: { value: '¿Alergias de Ana?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(screen.getByText(/pensando/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('No tiene alergias registradas.')).toBeInTheDocument()
    })
    expect(screen.getByText('¿Alergias de Ana?')).toBeInTheDocument()
  })

  it('shows the error message when the API returns ok: false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ ok: false, error: 'no se pudo obtener respuesta, intenta de nuevo' }),
      })
    )

    render(
      <AsistenteChat
        name="Test User"
        appointments={[]}
        patientCount={0}
        citasPendientesCount={0}
        citaCountByDate={{}}
        ingresosHoy={0}
        nowIso="2026-07-16T12:00:00.000Z"
      />)
    fireEvent.change(screen.getByPlaceholderText(/escribe tu pregunta/i), {
      target: { value: '¿Alergias de Ana?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      expect(screen.getByText('no se pudo obtener respuesta, intenta de nuevo')).toBeInTheDocument()
    })
  })

  it('shows a generic error and clears loading when the fetch itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

    render(
      <AsistenteChat
        name="Test User"
        appointments={[]}
        patientCount={0}
        citasPendientesCount={0}
        citaCountByDate={{}}
        ingresosHoy={0}
        nowIso="2026-07-16T12:00:00.000Z"
      />)
    fireEvent.change(screen.getByPlaceholderText(/escribe tu pregunta/i), {
      target: { value: '¿Alergias de Ana?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      expect(screen.getByText('no se pudo obtener respuesta, intenta de nuevo')).toBeInTheDocument()
    })
    expect(screen.queryByText(/pensando/i)).not.toBeInTheDocument()
  })
})
