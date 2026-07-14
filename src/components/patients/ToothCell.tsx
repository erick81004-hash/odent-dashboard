const STATUS_COLOR: Record<string, string> = {
  sano: 'bg-green-100 border-green-400',
  caries: 'bg-red-100 border-red-400',
  obturado: 'bg-amber-100 border-amber-400',
  corona: 'bg-blue-100 border-blue-400',
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
        selected ? 'ring-2 ring-blue-600' : ''
      }`}
      aria-label={`Diente ${tooth}, estado ${status}`}
    >
      {tooth}
    </button>
  )
}
