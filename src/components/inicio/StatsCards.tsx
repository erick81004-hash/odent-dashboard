import Link from 'next/link'

export function StatsCards({
  newPatientsCount,
  citasPendientesCount,
  ingresosHoy,
}: {
  newPatientsCount: number
  citasPendientesCount: number
  ingresosHoy: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-border/60 bg-white/80 p-4 shadow-sm">
        <p className="text-2xl font-semibold text-foreground">{newPatientsCount}</p>
        <p className="text-xs text-foreground/60">Pacientes nuevos (30 días)</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-white/80 p-4 shadow-sm">
        <p className="text-2xl font-semibold text-foreground">{citasPendientesCount}</p>
        <p className="text-xs text-foreground/60">Citas pendientes hoy</p>
        <Link href="/calendario" className="mt-1 inline-block text-xs font-medium text-primary">
          Ver agenda →
        </Link>
      </div>

      <div className="rounded-xl border border-border/60 bg-white/80 p-4 shadow-sm">
        <p className="text-2xl font-semibold text-destructive">1</p>
        <p className="text-xs text-foreground/60">Urgencias hoy</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-white/80 p-4 shadow-sm">
        <p className="text-2xl font-semibold text-foreground">${ingresosHoy.toFixed(2)}</p>
        <p className="text-xs text-foreground/60">Ingresos hoy</p>
        <Link href="/pagos" className="mt-1 inline-block text-xs font-medium text-primary">
          Ver pagos →
        </Link>
      </div>
    </div>
  )
}
