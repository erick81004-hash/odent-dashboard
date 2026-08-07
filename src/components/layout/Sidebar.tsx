'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/pacientes', label: 'Pacientes' },
  { href: '/calendario', label: 'Calendario' },
  { href: '/pagos', label: 'Pagos' },
]

const UPCOMING_ITEMS = ['Reportes', 'Inventario', 'Configuración']

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const client = createBrowserSupabaseClient()
    await client.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="flex w-56 shrink-0 flex-col border-r border-border bg-page p-3">
      <div className="mb-4 flex items-center gap-2 px-2">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-primary">
          <path
            d="M12 3c-2.2 0-3.5 1.1-4.7 1.1-1.4 0-2.5-.9-3.5-.4-1.2.6-1.3 2.4-1 4 .5 2.7 1.6 5.7 2.7 8.3.7 1.6 1.3 3.5 2.8 3.5 1.6 0 1.6-2.7 2.1-4.5.3-1.1.7-2 1.6-2s1.3.9 1.6 2c.5 1.8.5 4.5 2.1 4.5 1.5 0 2.1-1.9 2.8-3.5 1.1-2.6 2.2-5.6 2.7-8.3.3-1.6.2-3.4-1-4-1-.5-2.1.4-3.5.4C15.5 4.1 14.2 3 12 3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="font-heading text-[15px] font-medium leading-tight text-foreground">Odent</p>
          <p className="text-[11px] leading-tight text-foreground/50">Clínica Dental</p>
        </div>
      </div>

      <div className="flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-2 py-2 text-sm ${
                isActive ? 'bg-primary text-on-primary' : 'text-foreground'
              }`}
            >
              {item.label}
            </Link>
          )
        })}

        <div className="mt-2 space-y-1 border-t border-border/60 pt-2">
          {UPCOMING_ITEMS.map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-foreground/40"
            >
              <span>{label}</span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">Pronto</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 rounded-xl bg-primary/10 p-3">
        <p className="text-xs font-semibold text-primary">¿Sabías que?</p>
        <p className="mt-1 text-xs text-foreground/70">
          El 80% de las caries se pueden prevenir con una buena higiene bucal.
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg px-2 py-2 text-left text-sm text-foreground"
      >
        Cerrar sesión
      </button>
    </nav>
  )
}
