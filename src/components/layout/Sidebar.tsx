'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/pacientes', label: 'Pacientes' },
]

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
    <nav className="flex w-44 shrink-0 flex-col border-r border-gray-200 p-3">
      <p className="mb-4 px-2 text-sm font-medium">Odent</p>
      <div className="flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-2 py-2 text-sm ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
      <button
        onClick={handleLogout}
        className="rounded px-2 py-2 text-left text-sm text-gray-600"
      >
        Cerrar sesión
      </button>
    </nav>
  )
}
