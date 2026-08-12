export function toothTypeLabel(tooth: number): string {
  const position = tooth % 10
  if (position <= 2) return 'Incisivo'
  if (position === 3) return 'Canino'
  if (position <= 5) return 'Premolar'
  return 'Molar'
}
