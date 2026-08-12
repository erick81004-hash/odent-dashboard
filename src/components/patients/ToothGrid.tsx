'use client'

import { UPPER_ROW_FDI, LOWER_ROW_FDI } from '@/lib/odontogram/fdi'
import type { ToothConditionKey } from '@/lib/odontogram/conditions'

function ToothCell({
  tooth,
  activeCount,
  selected,
  onSelect,
  numberPosition,
}: {
  tooth: number
  activeCount: number
  selected: boolean
  onSelect: (tooth: number) => void
  numberPosition: 'top' | 'bottom'
}) {
  const number = (
    <span className="text-[11px] font-medium text-foreground">{tooth}</span>
  )
  const image = (
    <div className="relative w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/teeth/pieza/${tooth}.png`} alt="" className="w-full" />
      {activeCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
          {activeCount}
        </span>
      )}
    </div>
  )

  return (
    <button
      type="button"
      data-testid={`tooth-${tooth}`}
      onClick={() => onSelect(tooth)}
      aria-label={`Diente ${tooth}, ${activeCount} condiciones activas`}
      className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg p-0.5 ${
        selected ? 'bg-primary/10 ring-2 ring-primary' : ''
      }`}
    >
      {numberPosition === 'top' ? (
        <>
          {number}
          {image}
        </>
      ) : (
        <>
          {image}
          {number}
        </>
      )}
    </button>
  )
}

function ToothRow({
  teeth,
  activeConditionsByTooth,
  selected,
  onSelect,
  numberPosition,
}: {
  teeth: number[]
  activeConditionsByTooth: Record<number, ToothConditionKey[]>
  selected: number | null
  onSelect: (tooth: number) => void
  numberPosition: 'top' | 'bottom'
}) {
  return (
    <div className="flex w-full items-end gap-1">
      {teeth.map((tooth) => (
        <ToothCell
          key={tooth}
          tooth={tooth}
          activeCount={activeConditionsByTooth[tooth]?.length ?? 0}
          selected={selected === tooth}
          onSelect={onSelect}
          numberPosition={numberPosition}
        />
      ))}
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
    <div className="space-y-1">
      <ToothRow teeth={UPPER_ROW_FDI} numberPosition="top" {...rowProps} />
      <div className="border-t border-border/60" />
      <ToothRow teeth={LOWER_ROW_FDI} numberPosition="bottom" {...rowProps} />
    </div>
  )
}
