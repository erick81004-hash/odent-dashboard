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
      className={`relative flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full border text-xs font-medium ${
        selected ? 'ring-2 ring-primary' : ''
      } ${
        activeCount > 0
          ? 'border-primary bg-primary text-on-primary'
          : 'border-border bg-page text-foreground'
      }`}
    >
      {tooth}
      {activeCount > 1 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
          {activeCount}
        </span>
      )}
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
      <ToothRow teeth={UPPER_ROW_FDI.slice(0, 8)} {...rowProps} />
      <ToothRow teeth={UPPER_ROW_FDI.slice(8, 16)} {...rowProps} />
      <div className="my-1 border-t border-border/60" />
      <ToothRow teeth={LOWER_ROW_FDI.slice(0, 8)} {...rowProps} />
      <ToothRow teeth={LOWER_ROW_FDI.slice(8, 16)} {...rowProps} />
    </div>
  )
}
