export type AsistenteResult =
  | { ok: true; answer: string }
  | { ok: false; error: string }

const TIMEOUT_MS = 30_000
const GENERIC_ERROR = 'no se pudo obtener respuesta, intenta de nuevo'

export async function askAsistente(
  question: string,
  accessToken: string,
  webhookUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<AsistenteResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, accessToken }),
      signal: controller.signal,
    })

    if (!response.ok) {
      return { ok: false, error: GENERIC_ERROR }
    }

    const data = await response.json()
    return { ok: true, answer: data.answer }
  } catch {
    return { ok: false, error: GENERIC_ERROR }
  } finally {
    clearTimeout(timeout)
  }
}
