import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/pacientes', label: 'Pacientes' },
]

export function Sidebar({ activeHref }: { activeHref: string }) {
  return (
    <nav className="w-44 shrink-0 border-r border-gray-200 p-3">
      <p className="mb-4 px-2 text-sm font-medium">Odent</p>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`block rounded px-2 py-2 text-sm ${
            item.href === activeHref ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
