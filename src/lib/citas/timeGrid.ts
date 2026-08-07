import type { CitaStatus } from './types'

export const START_HOUR = 7
export const END_HOUR = 20
export const SLOT_MINUTES = 30
export const SLOT_HEIGHT_PX = 40

export function minutesFromStart(date: Date): number {
  return (date.getHours() - START_HOUR) * 60 + date.getMinutes()
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export const STATUS_COLOR: Record<CitaStatus, string> = {
  programada: 'bg-primary text-on-primary',
  confirmada: 'bg-accent text-white',
  cancelada: 'bg-muted text-foreground/40 line-through',
  completada: 'bg-muted text-foreground/70',
}
