import { describe, it, expect, vi } from 'vitest'
import { askAsistente } from '@/lib/asistente/askAsistente'

describe('askAsistente', () => {
  it('returns the answer on a successful webhook call', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: 'El paciente no tiene alergias registradas.' }),
    })
    const result = await askAsistente(
      '¿alergias de Ana?',
      'token-123',
      'https://n8n.example.com/webhook/asistente',
      fetchImpl as unknown as typeof fetch
    )
    expect(result).toEqual({ ok: true, answer: 'El paciente no tiene alergias registradas.' })
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://n8n.example.com/webhook/asistente',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ question: '¿alergias de Ana?', accessToken: 'token-123' }),
      })
    )
  })

  it('returns a normalized error when the webhook responds with a non-ok status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
    const result = await askAsistente(
      '¿alergias de Ana?',
      'token-123',
      'https://n8n.example.com/webhook/asistente',
      fetchImpl as unknown as typeof fetch
    )
    expect(result).toEqual({ ok: false, error: 'no se pudo obtener respuesta, intenta de nuevo' })
  })

  it('returns a normalized error when fetch rejects (network failure or timeout abort)', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network error'))
    const result = await askAsistente(
      '¿alergias de Ana?',
      'token-123',
      'https://n8n.example.com/webhook/asistente',
      fetchImpl as unknown as typeof fetch
    )
    expect(result).toEqual({ ok: false, error: 'no se pudo obtener respuesta, intenta de nuevo' })
  })
})
