# Odontograma — modelo de condiciones múltiples + rediseño visual

**Fecha:** 2026-08-12
**Estado:** aprobado, pendiente de implementación

## Contexto

El odontograma actual (`src/components/patients/Odontogram.tsx`) representa cada
diente con **un solo estado excluyente** (`sano` / `caries` / `obturado` /
`corona` / `extraido`), derivado del `treatment_type` del evento más reciente
en `treatment_events` para ese diente. Se dibuja como puntos de color
superpuestos sobre una foto de arcada dental (`/teeth/boca-arco.png`).

El usuario compartió el HTML exportado del odontograma de **Dentality**
(`C:\Users\fonky\Downloads\Dentality - Odontograma del cliente.html`), el
software que Odent está reemplazando, para usarlo como referencia funcional
(no se reutiliza ningún asset visual de Dentality — son propiedad de un
competidor). Ese análisis mostró que Dentality permite **múltiples
condiciones simultáneas por diente** (20 tipos: Caries, Gingivitis,
Periodontitis, Fractura, Apiñamiento, Fluorosis, Ausencia, Infección Pulpar,
Restos Radicular, Endodoncia, Brackets, Corona, Cirugía, Movilidad, Recesión
gingival, Desgaste, Sensibilidad, Placa dental, Bruxismo, Reemplazo de
prótesis), marcadas por diente completo (no por cara/superficie), con dos
vistas (Vestibular / Lingual y palatina) que muestran la misma información.

## Objetivo

1. Cambiar el modelo de datos del odontograma de "un estado por diente" a
   "conjunto de condiciones activas por diente" (0 a 20 simultáneas),
   siguiendo la taxonomía de Dentality.
2. Rediseñar visualmente el odontograma como diagrama vectorial de cuadrícula
   (dos filas por arcada, dos pestañas de vista Vestibular/Lingual),
   reemplazando la imagen fotográfica actual, y alineado con la paleta nueva
   ya aplicada en Inicio (`--color-primary` teal, tarjetas blancas,
   `rounded-xl`, `shadow-sm`).

## Decisiones explícitas

- **Datos existentes no se migran.** Los pacientes reales arrancan sin
  condiciones marcadas en el nuevo modelo. `treatment_events` no se toca —
  sigue existiendo intacto y visible en la pestaña "Historial"
  (`TreatmentHistoryList`), solo deja de alimentar el odontograma.
- **Con historial/auditoría.** Cada activación o desactivación de una
  condición en un diente queda registrada (quién, cuándo), igual que ya
  ocurre con `treatment_events`.
- **Dos vistas (Vestibular / Lingual y palatina).** Mismo layout y mismos
  datos en ambas — es una etiqueta/pestaña, no una fuente de datos distinta,
  ya que las condiciones son por diente completo.
- **Sin fotos ni assets de terceros.** El diagrama es 100% vectorial (formas
  SVG generadas en código), no depende de conseguir una imagen real de la
  vista lingual.
- **Las 20 condiciones son las de Dentality, sin recortar ni agregar.**

## Modelo de datos

### Tabla nueva: `tooth_condition_events`

Tabla de solo-inserción (append-only) — cada fila es un evento de
activar/desactivar una condición en un diente. El estado actual se deriva
tomando, para cada `(patient_id, tooth_number, condition_type)`, el evento
más reciente por `performed_at`.

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

No hay políticas de `update`/`delete`: es append-only por diseño, igual que
un log de auditoría — para "quitar" una condición se inserta un nuevo evento
con `active = false`, nunca se edita ni borra un evento pasado. Esto es más
simple que `treatment_events` (que sí es editable/borrable por admin) porque
aquí el propio modelo de datos ES el historial; no hace falta la tabla
`audit_log` ni triggers.

### Taxonomía de condiciones (`src/lib/odontogram/conditions.ts`)

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

export type ToothConditionKey = typeof TOOTH_CONDITIONS[number]['key']
```

### Derivación de estado (`src/lib/odontogram/deriveConditions.ts`)

Reemplaza a `deriveState.ts`. Firma:

```ts
export type ToothConditionState = {
  activeConditions: ToothConditionKey[]  // orden = el de TOOTH_CONDITIONS
  lastEventByCondition: Record<ToothConditionKey, ToothConditionEvent | null>
}

export function deriveToothConditions(
  events: ToothConditionEvent[]
): Record<number, ToothConditionState>
```

Para cada diente en `FDI_TEETH`, para cada condición en `TOOTH_CONDITIONS`:
tomar el evento más reciente (por `performed_at`) de ese
`(tooth_number, condition_type)`; si existe y `active === true`, la
condición entra en `activeConditions`.

### Tipo de diente por posición FDI (`src/lib/odontogram/toothType.ts`)

Necesario para el panel de detalle (ej. "11 · Incisivo"). Basado en la
posición dentro del cuadrante FDI (1-8): 1-2 incisivo, 3 canino, 4-5
premolar, 6-8 molar.

```ts
export function toothTypeLabel(tooth: number): string {
  const position = tooth % 10
  if (position <= 2) return 'Incisivo'
  if (position === 3) return 'Canino'
  if (position <= 5) return 'Premolar'
  return 'Molar'
}
```

## Componentes

- **`Odontogram.tsx`** (reescrito) — orquestador: estado de vista activa
  (`vestibular` | `lingual`), estado de diente seleccionado, deriva
  condiciones con `deriveToothConditions`, compone `OdontogramViewTabs` +
  `ToothGrid` + `ToothConditionPanel`.
- **`OdontogramViewTabs.tsx`** (nuevo) — dos pestañas "Vestibular" /
  "Lingual y palatina"; solo cambia una etiqueta de contexto, no filtra
  datos.
- **`ToothGrid.tsx`** (nuevo) — dos filas por arcada (superior:
  18-17-16-15-14-13-12-11 | 21-22-23-24-25-26-27-28; inferior:
  48-47-46-45-44-43-42-41 | 31-32-33-34-35-36-37-38), cada diente como un
  `<button>` con una forma SVG simple (óvalo redondeado) + su número FDI.
  Relleno: `bg-page`/borde `border-border` si `activeConditions.length === 0`
  ("sano"); `bg-primary text-on-primary` si tiene 1+, con un badge numérico
  superpuesto si son 2 o más. Diente seleccionado: anillo `ring-2
  ring-primary`.
- **`ToothConditionPanel.tsx`** (nuevo, reemplaza a `TreatmentEventForm.tsx`)
  — al seleccionar un diente: número + `toothTypeLabel`, lista de 19
  checkboxes (uno por `TOOTH_CONDITIONS`), marcados según
  `activeConditions`. Cada click llama `onToggle(conditionKey, nextActive)`
  de inmediato (sin botón de "guardar" — coincide con el comportamiento de
  Dentality: "cada cambio se guarda al instante").

`TreatmentEventForm.tsx` se elimina — verificado que solo lo usaba
`Odontogram.tsx`.

## Mutations / queries

- **`src/lib/odontogram/mutations.ts`** (nuevo) —
  `toggleToothCondition(client, { patient_id, tooth_number, condition_type, active, performed_by })`
  → inserta una fila en `tooth_condition_events`.
- **`src/lib/patients/queries.ts`** — agregar
  `listToothConditionEvents(client, patientId)` (mismo patrón que la query
  existente que trae `treatment_events` para un paciente).
- **`src/app/(dashboard)/pacientes/[id]/page.tsx`** — cargar
  `toothConditionEvents` además de `events` (treatment_events, sin cambios)
  y pasarlo a `<Odontogram>`.

## Fuera de alcance (explícito)

- `treatment_events`, `TreatmentHistoryList`, y la pestaña "Historial" no
  cambian.
- Cobranza/presupuestos: Odent no tiene módulo de presupuestos hoy; la
  integración de Dentality entre condiciones y presupuestos no aplica.
- "Mostrar piezas temporales" (dientes de leche) de Dentality — no pedido,
  no se construye.
- Migración de datos históricos de `treatment_events` al nuevo modelo — se
  decidió explícitamente empezar en blanco.

## Verificación

- **Tests unitarios** para `deriveToothConditions` (equivalente a
  `tests/unit/odontogram/deriveState.test.ts`, mismo patrón): diente sin
  eventos → sin condiciones activas; una condición activada permanece activa;
  una condición activada y luego desactivada por un evento posterior queda
  inactiva; dos condiciones distintas activas a la vez en el mismo diente.
- **Tests de componente** para `ToothConditionPanel` (equivalente a
  `tests/components/TreatmentEventForm.test.tsx`): checkbox refleja estado
  activo, click dispara `onToggle` con la clave y el nuevo valor correctos.
- **`Odontogram.test.tsx`** se reescribe para el nuevo modelo (selección de
  diente, cambio de pestaña de vista, render de condiciones activas).
- Verificación visual manual en navegador contra la paleta ya aplicada en
  Inicio.
