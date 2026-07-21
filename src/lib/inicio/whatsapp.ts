import type { SupabaseClient } from '@supabase/supabase-js'

export type WhatsAppConversation = {
  numero: string
  contactName: string
  preview: string
  time: string
}

function formatRelativeTime(from: Date, now: Date): string {
  const diffMin = Math.floor((now.getTime() - from.getTime()) / 60000)
  if (diffMin < 1) return 'justo ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  return `hace ${diffD} d`
}

export async function getRecentWhatsAppConversations(
  client: SupabaseClient,
  now: Date,
  limit = 4
): Promise<WhatsAppConversation[]> {
  const { data, error } = await client
    .from('whatsapp_messages')
    .select('numero, mensaje, created_at, patients(full_name)')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error

  const rows = data as unknown as {
    numero: string
    mensaje: string
    created_at: string
    patients: { full_name: string }[] | { full_name: string } | null
  }[]

  const seen = new Set<string>()
  const conversations: WhatsAppConversation[] = []
  for (const row of rows) {
    if (seen.has(row.numero)) continue
    seen.add(row.numero)
    conversations.push({
      numero: row.numero,
      contactName: (Array.isArray(row.patients) ? row.patients[0]?.full_name : row.patients?.full_name) ?? row.numero,
      preview: row.mensaje,
      time: formatRelativeTime(new Date(row.created_at), now),
    })
    if (conversations.length >= limit) break
  }

  return conversations
}
