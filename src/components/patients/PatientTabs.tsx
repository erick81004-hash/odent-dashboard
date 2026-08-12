import Link from 'next/link'

const TABS = [
  { key: 'datos', label: 'Datos generales' },
  { key: 'odontograma', label: 'Odontograma' },
  { key: 'historial', label: 'Historial' },
  { key: 'documentos', label: 'Documentos' },
  { key: 'cobranza', label: 'Cobranza' },
] as const

export function PatientTabs({
  patientId,
  active,
}: {
  patientId: string
  active: (typeof TABS)[number]['key']
}) {
  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/pacientes/${patientId}?tab=${tab.key}`}
          className={`px-3 py-2 text-sm ${
            tab.key === active
              ? 'border-b-2 border-primary font-medium'
              : 'text-foreground/60'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
