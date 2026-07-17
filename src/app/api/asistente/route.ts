import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { askAsistente } from '@/lib/asistente/askAsistente'

export async function POST(request: Request) {
  const client = await createServerSupabaseClient()
  const {
    data: { session },
  } = await client.auth.getSession()

  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'Tu sesión expiró, vuelve a iniciar sesión.' },
      { status: 401 }
    )
  }

  let question: string
  let history: { question: string; answer: string }[] = []
  try {
    const body = await request.json()
    question = body.question
    if (typeof question !== 'string' || !question.trim()) {
      throw new Error('invalid question')
    }
    if (Array.isArray(body.history)) {
      history = body.history
        .filter((h: unknown) => {
          const item = h as { question?: unknown; answer?: unknown }
          return typeof item?.question === 'string' && typeof item?.answer === 'string'
        })
        .slice(-3)
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: 'no se pudo obtener respuesta, intenta de nuevo' },
      { status: 400 }
    )
  }

  const webhookUrl = process.env.N8N_ASISTENTE_WEBHOOK_URL!

  const result = await askAsistente(question, session.access_token, webhookUrl, history)
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
