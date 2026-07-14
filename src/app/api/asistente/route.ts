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

  const { question } = await request.json()
  const webhookUrl = process.env.N8N_ASISTENTE_WEBHOOK_URL!

  const result = await askAsistente(question, session.access_token, webhookUrl)
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
