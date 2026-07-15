const STATUS_COLOR: Record<string, string> = {
  sano: 'bg-muted border-accent',
  caries: 'bg-red-50 border-destructive',
  obturado: 'bg-warning-bg border-warning',
  corona: 'bg-secondary/20 border-primary',
  extraido: 'bg-gray-200 border-gray-400',
}

export function ToothCell({
  tooth,
  status,
  selected,
  onSelect,
}: {
  tooth: number
  status: string
  selected: boolean
  onSelect: (tooth: number) => void
}) {
  const colorClass = STATUS_COLOR[status] ?? STATUS_COLOR.sano
  return (
    <button
      data-testid={`tooth-${tooth}`}
      onClick={() => onSelect(tooth)}
      className={`h-7 w-7 rounded border text-[9px] ${colorClass} ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      aria-label={`Diente ${tooth}, estado ${status}`}
    >
      {tooth}
    </button>
  )
}
