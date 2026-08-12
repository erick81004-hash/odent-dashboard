'use client'

import { UPPER_ROW_FDI, LOWER_ROW_FDI } from '@/lib/odontogram/fdi'
import type { ToothConditionKey } from '@/lib/odontogram/conditions'

function ToothCell({
  tooth,
  activeCount,
  selected,
  onSelect,
}: {
  tooth: number
  activeCount: number
  selected: boolean
  onSelect: (tooth: number) => void
}) {
  return (
    <button
      type="button"
      data-testid={`tooth-${tooth}`}
      onClick={() => onSelect(tooth)}
      aria-label={`Diente ${tooth}, ${activeCount} condiciones activas`}
      className={`relative flex shrink-0 flex-col items-center gap-0.5 rounded-lg p-1 ${
        selected ? 'bg-primary/10 ring-2 ring-primary' : ''
      }`}
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/teeth/pieza/${tooth}.png`} alt="" className="h-14 w-auto" />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
            {activeCount}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium text-foreground">{tooth}</span>
    </button>
  )
}

function ToothRow({
  teeth,
  activeConditionsByTooth,
  selected,
  onSelect,
}: {
  teeth: number[]
  activeConditionsByTooth: Record<number, ToothConditionKey[]>
  selected: number | null
  onSelect: (tooth: number) => void
}) {
  return (
    <div className="overflow-x-auto">
      <div className="mx-auto flex w-max gap-1">
        {teeth.map((tooth) => (
          <ToothCell
            key={tooth}
            tooth={tooth}
            activeCount={activeConditionsByTooth[tooth]?.length ?? 0}
            selected={selected === tooth}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

export function ToothGrid({
  activeConditionsByTooth,
  selected,
  onSelect,
}: {
  activeConditionsByTooth: Record<number, ToothConditionKey[]>
  selected: number | null
  onSelect: (tooth: number) => void
}) {
  const rowProps = { activeConditionsByTooth, selected, onSelect }
  return (
    <div className="space-y-2">
      <p className="text-center text-[10px] text-foreground/40">Desliza para ver todos los dientes →</p>
      <ToothRow teeth={UPPER_ROW_FDI} {...rowProps} />
      <div className="my-1 border-t border-border/60" />
      <ToothRow teeth={LOWER_ROW_FDI} {...rowProps} />
    </div>
  )
}
