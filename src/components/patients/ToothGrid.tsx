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
      className={`relative flex h-10 w-10 flex-col items-center justify-center rounded-full border text-xs font-medium ${
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

export function ToothGrid({
  activeConditionsByTooth,
  selected,
  onSelect,
}: {
  activeConditionsByTooth: Record<number, ToothConditionKey[]>
  selected: number | null
  onSelect: (tooth: number) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-1.5">
        {UPPER_ROW_FDI.map((tooth) => (
          <ToothCell
            key={tooth}
            tooth={tooth}
            activeCount={activeConditionsByTooth[tooth]?.length ?? 0}
            selected={selected === tooth}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
        {LOWER_ROW_FDI.map((tooth) => (
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
