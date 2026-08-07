import type { Pago } from './types'

export function totalPagado(pagos: Pago[]): number {
  return pagos.reduce((sum, p) => sum + p.monto, 0)
}

export function saldoPendiente(montoCargo: number, pagos: Pago[]): number {
  return Math.round((montoCargo - totalPagado(pagos)) * 100) / 100
}

export type CargoStatus = 'pagado' | 'parcial' | 'pendiente'

export function deriveCargoStatus(montoCargo: number, pagos: Pago[]): CargoStatus {
  const saldo = saldoPendiente(montoCargo, pagos)
  if (saldo <= 0) return 'pagado'
  if (pagos.length > 0) return 'parcial'
  return 'pendiente'
}
