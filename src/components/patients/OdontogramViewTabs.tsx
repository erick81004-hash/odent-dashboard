'use client'

export type OdontogramView = 'vestibular' | 'lingual'

const TABS: { key: OdontogramView; label: string }[] = [
  { key: 'vestibular', label: 'Vestibular' },
  { key: 'lingual', label: 'Lingual y palatina' },
]

export function OdontogramViewTabs({
  active,
  onChange,
}: {
  active: OdontogramView
  onChange: (view: OdontogramView) => void
}) {
  return (
    <div className="flex gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-3 py-1 text-sm ${
            active === tab.key ? 'bg-primary text-on-primary' : 'text-foreground/60'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
