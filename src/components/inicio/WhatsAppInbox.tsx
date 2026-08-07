'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { getRecentWhatsAppConversations, type WhatsAppConversation } from '@/lib/inicio/whatsapp'

const POLL_INTERVAL_MS = 20_000

export function WhatsAppInbox({ initialConversations }: { initialConversations: WhatsAppConversation[] }) {
  const [conversations, setConversations] = useState(initialConversations)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const client = createBrowserSupabaseClient()
        const fresh = await getRecentWhatsAppConversations(client, new Date())
        setConversations(fresh)
      } catch {
        // silently keep showing the last known conversations if a poll fails
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <h2 className="font-heading text-sm font-semibold text-foreground/70">
          Mensajes de WhatsApp
        </h2>
      </div>
      {conversations.length === 0 ? (
        <p className="text-sm text-foreground/50">Sin mensajes recientes.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.numero}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-white/70 p-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{conversation.contactName}</p>
                <p className="truncate text-xs text-foreground/60">{conversation.preview}</p>
              </div>
              <span className="shrink-0 text-xs text-foreground/40">{conversation.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
