# Odontograma — condiciones múltiples — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el modelo de "un estado por diente" del odontograma por un modelo de "múltiples condiciones activas por diente" (taxonomía de 20 condiciones de Dentality), con un rediseño visual vectorial (cuadrícula de dos filas, dos pestañas de vista), sin tocar `treatment_events` ni la pestaña "Historial".

**Architecture:** Tabla nueva append-only `tooth_condition_events` (una fila por evento de activar/desactivar una condición en un diente). El estado actual por diente se deriva en el cliente tomando, para cada `(tooth_number, condition_type)`, el evento más reciente. La UI se parte en 4 componentes de responsabilidad única: `OdontogramViewTabs` (pestañas Vestibular/Lingual, solo UI), `ToothGrid` (cuadrícula vectorial de 32 dientes), `ToothConditionPanel` (checkboxes de las 20 condiciones del diente seleccionado), y `Odontogram` (orquestador que junta los tres y llama a Supabase).

**Tech Stack:** Next.js 14 App Router, Supabase (Postgres + RLS), TypeScript, Tailwind CSS, Vitest + Testing Library.

## Global Constraints

- No se migran datos existentes de `treatment_events` — el odontograma arranca en blanco con el modelo nuevo (spec: "Decisiones explícitas").
- `treatment_events`, `TreatmentHistoryList`, y la pestaña "Historial" no cambian.
- Las 20 condiciones son exactamente las de Dentality — ni se recortan ni se agregan (spec: "Taxonomía de condiciones").
- `tooth_condition_events` es append-only: sin políticas RLS de `update`/`delete`, sin tabla de auditoría separada — el propio log de inserciones es el historial.
- Sin assets de imagen de terceros — el diagrama es 100% SVG/vectorial generado en código.
- `TreatmentEventForm.tsx` y `src/lib/odontogram/deriveState.ts` (con sus tests) se eliminan — confirmado que nada más los usa.

---

## Task 1: Migración SQL + taxonomía de condiciones + tipo de diente

**Files:**
- Create: `supabase/migrations/0013_tooth_condition_events.sql`
- Create: `src/lib/odontogram/conditions.ts`
- Create: `src/lib/odontogram/toothType.ts`
- Modify: `src/lib/odontogram/fdi.ts`
- Test: `tests/unit/odontogram/toothType.test.ts`

**Interfaces:**
- Produces: `TOOTH_CONDITIONS` (array de `{key, label}`), tipo `ToothConditionKey`, función `toothTypeLabel(tooth: number): string`, y las constantes `UPPER_ROW_FDI`/`LOWER_ROW_FDI` que usarán las Tasks 2, 4 y 5.

- [ ] **Step 1: Crear la migración SQL**

Crear `supabase/migrations/0013_tooth_condition_events.sql`:

```sql
create table public.tooth_condition_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  tooth_number integer not null,
  condition_type text not null,
  active boolean not null,
  performed_by uuid not null references public.profiles(id),
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index tooth_condition_events_patient_tooth_idx
  on public.tooth_condition_events (patient_id, tooth_number, condition_type, performed_at desc);

alter table public.tooth_condition_events enable row level security;

create policy "staff can read tooth condition events"
  on public.tooth_condition_events for select
  using (public.current_user_role() in ('admin', 'doctor', 'asistente'));

create policy "only admin and doctor can insert tooth condition events"
  on public.tooth_condition_events for insert
  with check (public.current_user_role() in ('admin', 'doctor'));

grant select, insert on public.tooth_condition_events to authenticated, service_role;
```

- [ ] **Step 2: Aplicar la migración al Supabase local**

Run: `npx supabase db reset` (o `npx supabase migration up` si ya tienes el stack corriendo — requiere Docker Desktop abierto y `npx supabase start` ejecutado antes)
Expected: la migración `0013_tooth_condition_events` se aplica sin errores; `npx supabase status` sigue reportando el stack sano.

- [ ] **Step 3: Crear la taxonomía de condiciones**

Crear `src/lib/odontogram/conditions.ts`:

```ts
export const TOOTH_CONDITIONS = [
  { key: 'caries', label: 'Caries' },
  { key: 'gingivitis', label: 'Gingivitis' },
  { key: 'periodontitis', label: 'Periodontitis' },
  { key: 'fractura', label: 'Fractura' },
  { key: 'apinamiento', label: 'Apiñamiento' },
  { key: 'fluorosis', label: 'Fluorosis' },
  { key: 'ausencia', label: 'Ausencia' },
  { key: 'infeccion_pulpar', label: 'Infección Pulpar' },
  { key: 'restos_radicular', label: 'Restos Radicular' },
  { key: 'endodoncia', label: 'Endodoncia' },
  { key: 'brackets', label: 'Brackets' },
  { key: 'corona', label: 'Corona' },
  { key: 'cirugia', label: 'Cirugía' },
  { key: 'movilidad', label: 'Movilidad' },
  { key: 'recesion_gingival', label: 'Recesión gingival' },
  { key: 'desgaste', label: 'Desgaste' },
  { key: 'sensibilidad', label: 'Sensibilidad' },
  { key: 'placa_dental', label: 'Placa dental' },
  { key: 'bruxismo', label: 'Bruxismo' },
  { key: 'reemplazo_protesis', label: 'Reemplazo de prótesis' },
] as const

export type ToothConditionKey = (typeof TOOTH_CONDITIONS)[number]['key']
```

- [ ] **Step 4: Crear el helper de tipo de diente**

Crear `src/lib/odontogram/toothType.ts`:

```ts
export function toothTypeLabel(tooth: number): string {
  const position = tooth % 10
  if (position <= 2) return 'Incisivo'
  if (position === 3) return 'Canino'
  if (position <= 5) return 'Premolar'
  return 'Molar'
}
```

- [ ] **Step 5: Escribir el test del helper de tipo de diente (falla primero)**

Crear `tests/unit/odontogram/toothType.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { toothTypeLabel } from '@/lib/odontogram/toothType'

describe('toothTypeLabel', () => {
  it('labels positions 1-2 as Incisivo', () => {
    expect(toothTypeLabel(11)).toBe('Incisivo')
    expect(toothTypeLabel(42)).toBe('Incisivo')
  })

  it('labels position 3 as Canino', () => {
    expect(toothTypeLabel(13)).toBe('Canino')
    expect(toothTypeLabel(43)).toBe('Canino')
  })

  it('labels positions 4-5 as Premolar', () => {
    expect(toothTypeLabel(14)).toBe('Premolar')
    expect(toothTypeLabel(25)).toBe('Premolar')
  })

  it('labels positions 6-8 as Molar', () => {
    expect(toothTypeLabel(16)).toBe('Molar')
    expect(toothTypeLabel(38)).toBe('Molar')
  })
})
```

Run: `npx vitest run tests/unit/odontogram/toothType.test.ts`
Expected: PASS (the function was written in Step 4, before this test — if it fails, the position math is wrong; fix `toothType.ts`, not the test).

- [ ] **Step 6: Agregar las filas ordenadas de FDI a `fdi.ts`**

En `src/lib/odontogram/fdi.ts`, agregar al final del archivo (después de `isValidFdiTooth`):

```ts
export const UPPER_ROW_FDI: number[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const LOWER_ROW_FDI: number[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
```

- [ ] **Step 7: Correr toda la suite para confirmar que nada se rompió**

Run: `npm test`
Expected: todos los tests existentes siguen pasando, más el nuevo `toothType.test.ts` (4 casos).

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/0013_tooth_condition_events.sql src/lib/odontogram/conditions.ts src/lib/odontogram/toothType.ts src/lib/odontogram/fdi.ts tests/unit/odontogram/toothType.test.ts
git commit -m "feat: tabla tooth_condition_events, taxonomia de 19 condiciones y helper de tipo de diente"
```

---

## Task 2: Tipo `ToothConditionEvent` + `deriveToothConditions`

**Files:**
- Modify: `src/lib/patients/types.ts`
- Create: `src/lib/odontogram/deriveConditions.ts`
- Test: `tests/unit/odontogram/deriveConditions.test.ts`
- Delete: `src/lib/odontogram/deriveState.ts`
- Delete: `tests/unit/odontogram/deriveState.test.ts`

**Interfaces:**
- Consumes: `TOOTH_CONDITIONS`, `ToothConditionKey` (Task 1), `FDI_TEETH` (existente en `fdi.ts`).
- Produces: tipo `ToothConditionEvent`, tipo `ToothConditionState = { activeConditions: ToothConditionKey[]; lastEventByCondition: Record<ToothConditionKey, ToothConditionEvent | null> }`, función `deriveToothConditions(events: ToothConditionEvent[]): Record<number, ToothConditionState>` — Tasks 3, 5 y 6 dependen de este tipo y función exactos.

- [ ] **Step 1: Agregar el tipo `ToothConditionEvent`**

En `src/lib/patients/types.ts`, agregar después de la definición existente de `TreatmentEvent` (línea 34):

```ts
export type ToothConditionEvent = {
  id: string
  patient_id: string
  tooth_number: number
  condition_type: string
  active: boolean
  performed_by: string
  performed_at: string
}
```

- [ ] **Step 2: Escribir el test de `deriveToothConditions` (falla primero — la función no existe aún)**

Crear `tests/unit/odontogram/deriveConditions.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { deriveToothConditions } from '@/lib/odontogram/deriveConditions'
import type { ToothConditionEvent } from '@/lib/patients/types'

function makeEvent(overrides: Partial<ToothConditionEvent>): ToothConditionEvent {
  return {
    id: 'evt-1',
    patient_id: 'pat-1',
    tooth_number: 11,
    condition_type: 'caries',
    active: true,
    performed_by: 'doc-1',
    performed_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('deriveToothConditions', () => {
  it('defaults every tooth to no active conditions with no history', () => {
    const states = deriveToothConditions([])
    expect(states[11].activeConditions).toEqual([])
  })

  it('activates a condition from a single active=true event', () => {
    const events = [makeEvent({ condition_type: 'caries', active: true })]
    const states = deriveToothConditions(events)
    expect(states[11].activeConditions).toEqual(['caries'])
  })

  it('deactivates a condition when a later event sets active=false', () => {
    const events = [
      makeEvent({ id: 'evt-1', condition_type: 'caries', active: true, performed_at: '2025-01-01T00:00:00Z' }),
      makeEvent({ id: 'evt-2', condition_type: 'caries', active: false, performed_at: '2025-06-01T00:00:00Z' }),
    ]
    const states = deriveToothConditions(events)
    expect(states[11].activeConditions).toEqual([])
  })

  it('tracks multiple simultaneously active conditions on the same tooth, in taxonomy order', () => {
    const events = [
      makeEvent({ id: 'evt-1', condition_type: 'movilidad', active: true, performed_at: '2025-01-01T00:00:00Z' }),
      makeEvent({ id: 'evt-2', condition_type: 'caries', active: true, performed_at: '2025-01-02T00:00:00Z' }),
    ]
    const states = deriveToothConditions(events)
    expect(states[11].activeConditions).toEqual(['caries', 'movilidad'])
  })

  it('keeps conditions independent per tooth', () => {
    const events = [
      makeEvent({ tooth_number: 11, condition_type: 'caries', active: true }),
      makeEvent({ tooth_number: 21, condition_type: 'bruxismo', active: true }),
    ]
    const states = deriveToothConditions(events)
    expect(states[11].activeConditions).toEqual(['caries'])
    expect(states[21].activeConditions).toEqual(['bruxismo'])
  })
})
```

Run: `npx vitest run tests/unit/odontogram/deriveConditions.test.ts`
Expected: FAIL — `Cannot find module '@/lib/odontogram/deriveConditions'` (the module doesn't exist yet).

- [ ] **Step 3: Implementar `deriveToothConditions`**

Crear `src/lib/odontogram/deriveConditions.ts`:

```ts
import { FDI_TEETH } from './fdi'
import { TOOTH_CONDITIONS, type ToothConditionKey } from './conditions'
import type { ToothConditionEvent } from '@/lib/patients/types'

export type ToothConditionState = {
  activeConditions: ToothConditionKey[]
  lastEventByCondition: Record<ToothConditionKey, ToothConditionEvent | null>
}

export function deriveToothConditions(
  events: ToothConditionEvent[]
): Record<number, ToothConditionState> {
  const states: Record<number, ToothConditionState> = {}

  for (const tooth of FDI_TEETH) {
    const lastEventByCondition = {} as Record<ToothConditionKey, ToothConditionEvent | null>
    for (const condition of TOOTH_CONDITIONS) {
      lastEventByCondition[condition.key] = null
    }
    states[tooth] = { activeConditions: [], lastEventByCondition }
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime()
  )

  for (const event of sorted) {
    const state = states[event.tooth_number]
    if (!state) continue
    state.lastEventByCondition[event.condition_type as ToothConditionKey] = event
  }

  for (const tooth of FDI_TEETH) {
    const state = states[tooth]
    state.activeConditions = TOOTH_CONDITIONS.filter(
      (c) => state.lastEventByCondition[c.key]?.active === true
    ).map((c) => c.key)
  }

  return states
}
```

- [ ] **Step 4: Correr el test de nuevo (debe pasar)**

Run: `npx vitest run tests/unit/odontogram/deriveConditions.test.ts`
Expected: PASS (5/5).

- [ ] **Step 5: Eliminar el modelo viejo**

```bash
git rm src/lib/odontogram/deriveState.ts tests/unit/odontogram/deriveState.test.ts
```

(Confirmado en el spec que nada más los usa — solo `Odontogram.tsx`, que se reescribe en la Task 6.)

**Nota:** después de este `git rm`, `src/components/patients/Odontogram.tsx` (todavía sin tocar) queda con un import roto a `deriveState`. Eso es esperado — se corrige en la Task 6. No correr `npm test` completo en este punto porque `Odontogram.test.tsx` fallará por esa razón; correr solo el test específico de este task (Step 4) es suficiente aquí.

- [ ] **Step 6: Commit**

```bash
git add src/lib/patients/types.ts src/lib/odontogram/deriveConditions.ts tests/unit/odontogram/deriveConditions.test.ts
git commit -m "feat: tipo ToothConditionEvent y deriveToothConditions (reemplaza deriveState)"
```

---

## Task 3: Queries y mutation de Supabase

**Files:**
- Modify: `src/lib/patients/queries.ts`
- Modify: `src/lib/patients/mutations.ts`

**Interfaces:**
- Consumes: tipo `ToothConditionEvent` (Task 2).
- Produces: `listToothConditionEvents(client, patientId): Promise<ToothConditionEvent[]>`, `toggleToothCondition(client, input): Promise<ToothConditionEvent>` — la Task 6 (Odontogram orchestrator) y el wiring de la página de paciente dependen de estas dos funciones exactas.

- [ ] **Step 1: Agregar `listToothConditionEvents` a `queries.ts`**

En `src/lib/patients/queries.ts`, actualizar el import de tipos (línea 2):

```ts
import type { Patient, TreatmentEvent, PatientDocument, ToothConditionEvent } from './types'
```

Y agregar, después de `getTreatmentEvents` (después de la línea 41):

```ts
export async function listToothConditionEvents(
  client: SupabaseClient,
  patientId: string
): Promise<ToothConditionEvent[]> {
  const { data, error } = await client
    .from('tooth_condition_events')
    .select('*')
    .eq('patient_id', patientId)
    .order('performed_at')
  if (error) throw error
  return data as ToothConditionEvent[]
}
```

- [ ] **Step 2: Agregar `toggleToothCondition` a `mutations.ts`**

En `src/lib/patients/mutations.ts`, actualizar el import de tipos (línea 2):

```ts
import type { Patient, TreatmentEvent, PatientDocument, ToothConditionEvent } from './types'
```

Y agregar al final del archivo:

```ts
export async function toggleToothCondition(
  client: SupabaseClient,
  input: {
    patient_id: string
    tooth_number: number
    condition_type: string
    active: boolean
    performed_by: string
  }
): Promise<ToothConditionEvent> {
  const { data, error } = await client
    .from('tooth_condition_events')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as ToothConditionEvent
}
```

- [ ] **Step 3: Verificar que el proyecto compila**

Run: `npx tsc --noEmit`
Expected: sin errores de tipo nuevos atribuibles a estos dos archivos (puede haber errores preexistentes en `Odontogram.tsx` por el `deriveState` eliminado en la Task 2 — esos se resuelven en la Task 6, ignóralos en este paso).

- [ ] **Step 4: Commit**

```bash
git add src/lib/patients/queries.ts src/lib/patients/mutations.ts
git commit -m "feat: listToothConditionEvents y toggleToothCondition"
```

---

## Task 4: `ToothConditionPanel` (checkboxes de condiciones)

**Files:**
- Create: `src/components/patients/ToothConditionPanel.tsx`
- Test: `tests/components/ToothConditionPanel.test.tsx`
- Delete: `src/components/patients/TreatmentEventForm.tsx`
- Delete: `tests/components/TreatmentEventForm.test.tsx`

**Interfaces:**
- Consumes: `TOOTH_CONDITIONS`, `ToothConditionKey` (Task 1), `toothTypeLabel` (Task 1).
- Produces: componente `ToothConditionPanel({ tooth: number, activeConditions: ToothConditionKey[], onToggle: (condition: ToothConditionKey, active: boolean) => void })` — la Task 6 lo consume con esta firma exacta.

- [ ] **Step 1: Escribir el test del componente (falla primero)**

Crear `tests/components/ToothConditionPanel.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToothConditionPanel } from '@/components/patients/ToothConditionPanel'

describe('ToothConditionPanel', () => {
  it('renders all 20 conditions as checkboxes', () => {
    render(<ToothConditionPanel tooth={11} activeConditions={[]} onToggle={vi.fn()} />)
    expect(screen.getAllByRole('checkbox')).toHaveLength(20)
    expect(screen.getByLabelText('Caries')).toBeInTheDocument()
    expect(screen.getByLabelText('Reemplazo de prótesis')).toBeInTheDocument()
  })

  it('shows the tooth number and its type', () => {
    render(<ToothConditionPanel tooth={13} activeConditions={[]} onToggle={vi.fn()} />)
    expect(screen.getByText(/Diente 13/)).toBeInTheDocument()
    expect(screen.getByText(/Canino/)).toBeInTheDocument()
  })

  it('checks the boxes for active conditions', () => {
    render(<ToothConditionPanel tooth={11} activeConditions={['caries', 'movilidad']} onToggle={vi.fn()} />)
    expect(screen.getByLabelText('Caries')).toBeChecked()
    expect(screen.getByLabelText('Movilidad')).toBeChecked()
    expect(screen.getByLabelText('Gingivitis')).not.toBeChecked()
  })

  it('calls onToggle with the condition key and true when checking an unchecked box', () => {
    const onToggle = vi.fn()
    render(<ToothConditionPanel tooth={11} activeConditions={[]} onToggle={onToggle} />)
    fireEvent.click(screen.getByLabelText('Caries'))
    expect(onToggle).toHaveBeenCalledWith('caries', true)
  })

  it('calls onToggle with the condition key and false when unchecking a checked box', () => {
    const onToggle = vi.fn()
    render(<ToothConditionPanel tooth={11} activeConditions={['caries']} onToggle={onToggle} />)
    fireEvent.click(screen.getByLabelText('Caries'))
    expect(onToggle).toHaveBeenCalledWith('caries', false)
  })
})
```

Run: `npx vitest run tests/components/ToothConditionPanel.test.tsx`
Expected: FAIL — `Cannot find module '@/components/patients/ToothConditionPanel'`.

- [ ] **Step 2: Implementar `ToothConditionPanel`**

Crear `src/components/patients/ToothConditionPanel.tsx`:

```tsx
'use client'

import { TOOTH_CONDITIONS, type ToothConditionKey } from '@/lib/odontogram/conditions'
import { toothTypeLabel } from '@/lib/odontogram/toothType'

export function ToothConditionPanel({
  tooth,
  activeConditions,
  onToggle,
}: {
  tooth: number
  activeConditions: ToothConditionKey[]
  onToggle: (condition: ToothConditionKey, active: boolean) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-page p-4 shadow-sm">
      <p className="font-heading text-sm font-semibold text-foreground">
        Diente {tooth} · {toothTypeLabel(tooth)}
      </p>
      <p className="mt-1 text-xs text-foreground/60">
        Marca o desmarca condiciones de la pieza {tooth}. Cada cambio se guarda al instante.
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {TOOTH_CONDITIONS.map((condition) => {
          const checked = activeConditions.includes(condition.key)
          return (
            <li key={condition.key}>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={checked}
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
```

- [ ] **Step 3: Correr el test de nuevo (debe pasar)**

Run: `npx vitest run tests/components/ToothConditionPanel.test.tsx`
Expected: PASS (5/5).

- [ ] **Step 4: Eliminar el formulario viejo**

```bash
git rm src/components/patients/TreatmentEventForm.tsx tests/components/TreatmentEventForm.test.tsx
```

(Confirmado en el spec que solo lo usaba `Odontogram.tsx`, que se reescribe en la Task 6. Igual que en la Task 2, no correr `npm test` completo aquí — `Odontogram.test.tsx` sigue roto hasta la Task 6.)

- [ ] **Step 5: Commit**

```bash
git add src/components/patients/ToothConditionPanel.tsx tests/components/ToothConditionPanel.test.tsx
git commit -m "feat: ToothConditionPanel, reemplaza a TreatmentEventForm"
```

---

## Task 5: `ToothGrid` + `OdontogramViewTabs`

**Files:**
- Create: `src/components/patients/ToothGrid.tsx`
- Create: `src/components/patients/OdontogramViewTabs.tsx`
- Test: `tests/components/ToothGrid.test.tsx`
- Test: `tests/components/OdontogramViewTabs.test.tsx`

**Interfaces:**
- Consumes: `UPPER_ROW_FDI`, `LOWER_ROW_FDI` (Task 1), `ToothConditionKey` (Task 1).
- Produces: componente `ToothGrid({ activeConditionsByTooth: Record<number, ToothConditionKey[]>, selected: number | null, onSelect: (tooth: number) => void })` con `data-testid="tooth-${n}"` en cada diente (mismo patrón que el `Odontogram` viejo, para que la Task 6 pueda reescribir su test con el mismo estilo de selector); componente `OdontogramViewTabs({ active: 'vestibular' | 'lingual', onChange: (view) => void })` y tipo exportado `OdontogramView = 'vestibular' | 'lingual'` — la Task 6 depende de ambas firmas exactas.

- [ ] **Step 1: Escribir el test de `ToothGrid` (falla primero)**

Crear `tests/components/ToothGrid.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToothGrid } from '@/components/patients/ToothGrid'

describe('ToothGrid', () => {
  it('renders all 32 teeth', () => {
    render(<ToothGrid activeConditionsByTooth={{}} selected={null} onSelect={vi.fn()} />)
    expect(screen.getAllByTestId(/^tooth-/)).toHaveLength(32)
  })

  it('shows a count badge only when a tooth has 2+ active conditions', () => {
    render(
      <ToothGrid
        activeConditionsByTooth={{ 11: ['caries'], 12: ['caries', 'movilidad'] }}
        selected={null}
        onSelect={vi.fn()}
      />
    )
    expect(screen.queryByText('2', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByTestId('tooth-11')).not.toHaveTextContent('1')
  })

  it('calls onSelect with the clicked tooth number', () => {
    const onSelect = vi.fn()
    render(<ToothGrid activeConditionsByTooth={{}} selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('tooth-24'))
    expect(onSelect).toHaveBeenCalledWith(24)
  })
})
```

Run: `npx vitest run tests/components/ToothGrid.test.tsx`
Expected: FAIL — `Cannot find module '@/components/patients/ToothGrid'`.

- [ ] **Step 2: Implementar `ToothGrid`**

Crear `src/components/patients/ToothGrid.tsx`:

```tsx
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
```

- [ ] **Step 3: Correr el test de `ToothGrid` (debe pasar)**

Run: `npx vitest run tests/components/ToothGrid.test.tsx`
Expected: PASS (3/3).

- [ ] **Step 4: Escribir el test de `OdontogramViewTabs` (falla primero)**

Crear `tests/components/OdontogramViewTabs.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OdontogramViewTabs } from '@/components/patients/OdontogramViewTabs'

describe('OdontogramViewTabs', () => {
  it('renders both tabs', () => {
    render(<OdontogramViewTabs active="vestibular" onChange={vi.fn()} />)
    expect(screen.getByText('Vestibular')).toBeInTheDocument()
    expect(screen.getByText('Lingual y palatina')).toBeInTheDocument()
  })

  it('calls onChange with the clicked tab key', () => {
    const onChange = vi.fn()
    render(<OdontogramViewTabs active="vestibular" onChange={onChange} />)
    fireEvent.click(screen.getByText('Lingual y palatina'))
    expect(onChange).toHaveBeenCalledWith('lingual')
  })
})
```

Run: `npx vitest run tests/components/OdontogramViewTabs.test.tsx`
Expected: FAIL — `Cannot find module '@/components/patients/OdontogramViewTabs'`.

- [ ] **Step 5: Implementar `OdontogramViewTabs`**

Crear `src/components/patients/OdontogramViewTabs.tsx`:

```tsx
'use client'

export type OdontogramView = 'vestibular' | 'lingual'

const TABS: { key: OdontogramView; label: string }[] = [
  { key: 'vestibular', label: 'Vestibular' },
  { key: 'lingual', label: 'Lingual y palatina' },
]

export function OdontogramViewTabs({
  active,
  onChange,
}: {
  active: OdontogramView
  onChange: (view: OdontogramView) => void
}) {
  return (
    <div className="flex gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-3 py-1 text-sm ${
            active === tab.key ? 'bg-primary text-on-primary' : 'text-foreground/60'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Correr el test de `OdontogramViewTabs` (debe pasar)**

Run: `npx vitest run tests/components/OdontogramViewTabs.test.tsx`
Expected: PASS (2/2).

- [ ] **Step 7: Commit**

```bash
git add src/components/patients/ToothGrid.tsx src/components/patients/OdontogramViewTabs.tsx tests/components/ToothGrid.test.tsx tests/components/OdontogramViewTabs.test.tsx
git commit -m "feat: ToothGrid y OdontogramViewTabs"
```

---

## Task 6: Reescribir `Odontogram` (orquestador) y conectar la página de paciente

**Files:**
- Modify: `src/components/patients/Odontogram.tsx` (reescritura completa)
- Modify: `tests/components/Odontogram.test.tsx` (reescritura completa)
- Modify: `src/app/(dashboard)/pacientes/[id]/page.tsx`

**Interfaces:**
- Consumes: `deriveToothConditions` (Task 2), `ToothConditionEvent` (Task 2), `listToothConditionEvents`/`toggleToothCondition` (Task 3), `ToothConditionPanel` (Task 4), `ToothGrid`/`OdontogramViewTabs`/`OdontogramView` (Task 5), `FDI_TEETH` (existente).
- Produces: `Odontogram({ patientId: string, events: ToothConditionEvent[] })` — cambia la firma pública respecto a la versión vieja (antes recibía `TreatmentEvent[]`, ahora `ToothConditionEvent[]`), por eso el call site en `page.tsx` también cambia en este mismo task.

- [ ] **Step 1: Reescribir `Odontogram.tsx`**

Reemplazar el contenido completo de `src/components/patients/Odontogram.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { FDI_TEETH } from '@/lib/odontogram/fdi'
import { deriveToothConditions } from '@/lib/odontogram/deriveConditions'
import type { ToothConditionKey } from '@/lib/odontogram/conditions'
import { ToothGrid } from './ToothGrid'
import { ToothConditionPanel } from './ToothConditionPanel'
import { OdontogramViewTabs, type OdontogramView } from './OdontogramViewTabs'
import type { ToothConditionEvent } from '@/lib/patients/types'

export function Odontogram({
  patientId,
  events,
}: {
  patientId: string
  events: ToothConditionEvent[]
}) {
  const [view, setView] = useState<OdontogramView>('vestibular')
  const [selected, setSelected] = useState<number | null>(null)
  const [localEvents, setLocalEvents] = useState(events)

  const states = deriveToothConditions(localEvents)
  const activeConditionsByTooth: Record<number, ToothConditionKey[]> = {}
  for (const tooth of FDI_TEETH) {
    activeConditionsByTooth[tooth] = states[tooth].activeConditions
  }

  async function handleToggle(condition: ToothConditionKey, active: boolean) {
    if (selected === null) return
    const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
    const { toggleToothCondition } = await import('@/lib/patients/mutations')
    const client = createBrowserSupabaseClient()
    const { data: userData } = await client.auth.getUser()
    if (!userData.user) return
    const event = await toggleToothCondition(client, {
      patient_id: patientId,
      tooth_number: selected,
      condition_type: condition,
      active,
      performed_by: userData.user.id,
    })
    setLocalEvents((prev) => [...prev, event])
  }

  return (
    <div className="space-y-3">
      <OdontogramViewTabs active={view} onChange={setView} />
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="mx-auto w-full max-w-md shrink-0 rounded-xl border border-border bg-page p-4 shadow-sm">
          <ToothGrid
            activeConditionsByTooth={activeConditionsByTooth}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
        {selected !== null && (
          <div className="md:flex-1">
            <ToothConditionPanel
              tooth={selected}
              activeConditions={states[selected].activeConditions}
              onToggle={handleToggle}
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Reescribir `Odontogram.test.tsx`**

Reemplazar el contenido completo de `tests/components/Odontogram.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Odontogram } from '@/components/patients/Odontogram'
import type { ToothConditionEvent } from '@/lib/patients/types'

function makeEvent(overrides: Partial<ToothConditionEvent>): ToothConditionEvent {
  return {
    id: 'evt-1',
    patient_id: 'p1',
    tooth_number: 11,
    condition_type: 'caries',
    active: true,
    performed_by: 'doc-1',
    performed_at: '2025-03-12T00:00:00Z',
    ...overrides,
  }
}

describe('Odontogram', () => {
  it('renders all 32 teeth and both view tabs', () => {
    render(<Odontogram patientId="p1" events={[]} />)
    expect(screen.getAllByTestId(/^tooth-/)).toHaveLength(32)
    expect(screen.getByText('Vestibular')).toBeInTheDocument()
    expect(screen.getByText('Lingual y palatina')).toBeInTheDocument()
  })

  it('shows the condition panel for a selected tooth with its active conditions checked', () => {
    render(<Odontogram patientId="p1" events={[makeEvent({})]} />)
    fireEvent.click(screen.getByTestId('tooth-11'))
    expect(screen.getByText(/Diente 11/)).toBeInTheDocument()
    expect(screen.getByLabelText('Caries')).toBeChecked()
  })

  it('shows no condition panel until a tooth is selected', () => {
    render(<Odontogram patientId="p1" events={[]} />)
    expect(screen.queryByText(/Diente \d+/)).not.toBeInTheDocument()
  })

  it('switches the active view tab without losing the current selection', () => {
    render(<Odontogram patientId="p1" events={[makeEvent({})]} />)
    fireEvent.click(screen.getByTestId('tooth-11'))
    fireEvent.click(screen.getByText('Lingual y palatina'))
    expect(screen.getByText(/Diente 11/)).toBeInTheDocument()
    expect(screen.getByLabelText('Caries')).toBeChecked()
  })
})
```

- [ ] **Step 3: Correr el test de `Odontogram` (debe pasar)**

Run: `npx vitest run tests/components/Odontogram.test.tsx`
Expected: PASS (4/4).

- [ ] **Step 4: Conectar la página de paciente a los datos nuevos**

En `src/app/(dashboard)/pacientes/[id]/page.tsx`, actualizar el import de queries (línea 4-10):

```tsx
import {
  getPatientById,
  getTreatmentEvents,
  listToothConditionEvents,
  getDocuments,
  getDocumentUrls,
  getPatientPhotoUrls,
} from '@/lib/patients/queries'
```

Agregar, después de la línea `const events = await getTreatmentEvents(client, id)` (línea 38):

```tsx
  const toothConditionEvents = await listToothConditionEvents(client, id)
```

Y cambiar la línea que renderiza el odontograma (línea 73):

```tsx
      {activeTab === 'odontograma' && <Odontogram patientId={id} events={toothConditionEvents} />}
```

(La línea de `historial` justo debajo sigue usando `events`, sin cambios — `treatment_events` no se toca.)

- [ ] **Step 5: Correr toda la suite**

Run: `npm test`
Expected: todos los tests pasan (el conteo total cambia respecto al baseline: se restan los tests de `deriveState.test.ts` y `TreatmentEventForm.test.tsx` eliminados, se suman los de `toothType.test.ts`, `deriveConditions.test.ts`, `ToothConditionPanel.test.tsx`, `ToothGrid.test.tsx`, `OdontogramViewTabs.test.tsx`, y el `Odontogram.test.tsx` reescrito). Sigue esperándose la única falla preexistente en `tests/integration/rls.test.ts` por la env var faltante.

- [ ] **Step 6: Verificar que no quedan referencias sueltas al modelo viejo**

Run: `grep -rn "deriveState\|deriveToothStates\|TreatmentEventForm\|ToothState\b" src/ tests/`
Expected: sin resultados (todo lo viejo fue reemplazado y eliminado en las Tasks 2, 4 y este mismo task).

- [ ] **Step 7: Verificación visual manual**

Run: `npm run dev` (requiere `.env.local` apuntando a un Supabase con la migración de la Task 1 aplicada — local con Docker corriendo, o el proyecto en la nube).
Ir a un paciente existente → pestaña "Odontograma". Confirmar: se ven 32 dientes en dos filas por arcada, las pestañas "Vestibular"/"Lingual y palatina" cambian de estado activo al hacer clic, seleccionar un diente abre el panel con las 20 condiciones, marcar una condición la refleja de inmediato en el color/badge del diente en la cuadrícula sin recargar la página.

- [ ] **Step 8: Commit**

```bash
git add src/components/patients/Odontogram.tsx tests/components/Odontogram.test.tsx "src/app/(dashboard)/pacientes/[id]/page.tsx"
git commit -m "feat: odontograma con modelo de condiciones multiples y vista de dos pestañas"
```

---

## Notas para la implementación

- Task 1 requiere Docker Desktop abierto y el stack local de Supabase corriendo (`npx supabase start`) para aplicar la migración — si no está disponible al momento de ejecutar, avisar y esperar confirmación antes de continuar, igual que ocurrió en la fase anterior del proyecto.
- Las Tasks 2 y 4 dejan al repo en un estado intermedio donde `Odontogram.tsx`/`Odontogram.test.tsx` no compilan (por los `git rm` de `deriveState`/`TreatmentEventForm`) hasta que la Task 6 los reescribe — esto es intencional y está anotado en cada task; no ejecutar `npm test` completo (solo el test específico del task) entre las Tasks 2-5.
