'use client'

import { TOOTH_CONDITIONS, type ToothConditionKey } from '@/lib/odontogram/conditions'
import { toothTypeLabel } from '@/lib/odontogram/toothType'

export function ToothConditionPanel({
  tooth,
  activeConditions,
  onToggle,
  disabled = false,
}: {
  tooth: number
  activeConditions: ToothConditionKey[]
  onToggle: (condition: ToothConditionKey, active: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-page p-4 shadow-sm">
      <p className="font-heading text-sm font-semibold text-foreground">
        Diente {tooth} · {toothTypeLabel(tooth)}
      </p>
      <p className="mt-1 text-xs text-foreground/60">
        Selecciona lo que observas en esta pieza. Los cambios quedan guardados de inmediato en el expediente.
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {TOOTH_CONDITIONS.map((condition) => {
          const checked = activeConditions.includes(condition.key)
          return (
            <li key={condition.key}>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={(e) => onToggle(condition.key, e.target.checked)}
                />
                {condition.label}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
