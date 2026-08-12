# Rediseño visual — piloto Inicio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar la nueva paleta "premium corporativo + acento teal" a la pantalla de Inicio del dashboard de Odent, sin cambiar ningún dato, prop ni comportamiento.

**Architecture:** El proyecto ya usa tokens de color semánticos (`--color-*` en `src/app/globals.css`, mapeados en `tailwind.config.ts`) que casi todos los componentes de Inicio consumen indirectamente vía clases Tailwind (`bg-primary`, `text-foreground`, `border-border`, etc.). Redefinir los valores de esos tokens re-tema automáticamente la mayoría de las tarjetas de Inicio sin tocar su JSX. Solo `Sidebar.tsx` y `TopBar.tsx`/`GlobalSearch.tsx` necesitan cambios de clase explícitos porque van a un fondo oscuro nuevo que no existía antes (tokens `--color-sidebar-*` nuevos).

**Tech Stack:** Next.js 14 App Router, Tailwind CSS 3.4, Vitest + Testing Library.

## Global Constraints

- Ningún cambio de datos, props, queries, ni comportamiento (spec: "Fuera de alcance").
- Solo se toca Inicio (`Sidebar`, `TopBar`, `GlobalSearch`, y la página de Inicio) — Calendario/Pacientes/Pagos/Login quedan intactos en esta fase.
- La suite de tests existente (`npm test`) debe seguir pasando sin modificaciones.
- Paleta exacta definida en el spec (`docs/superpowers/specs/2026-08-12-inicio-restyle-design.md`):
  - `--background: #F4F5F7`, `--color-primary: #2FA79B`, `--color-page: #FFFFFF`, `--color-muted: #F0F1F3`, `--color-border: #E4E5E9`
  - Nuevos: `--color-sidebar-bg: #14161C`, `--color-sidebar-fg: #C7C9D1`, `--color-sidebar-fg-muted: #6C6F7B`, `--color-sidebar-active: #2FA79B`

---

## Task 1: Nuevos tokens de color en `globals.css` y `tailwind.config.ts`

**Files:**
- Modify: `src/app/globals.css:7-21`
- Modify: `tailwind.config.ts:11-24`
- Test: ninguno nuevo — este paso se verifica con `npm test` (no debe cambiar el resultado) y visualmente en las tareas siguientes.

**Interfaces:**
- Produces: clases Tailwind nuevas `bg-sidebar-bg`, `text-sidebar-fg`, `text-sidebar-fg-muted`, `text-sidebar-active` (y sus variantes `bg-`/`border-`) disponibles para las Tasks 2 y 3.

- [ ] **Step 1: Correr la suite de tests para tener una línea base**

Run: `npm test`
Expected: todos los tests pasan (ninguno debería fallar antes de tocar código).

- [ ] **Step 2: Actualizar los valores de tokens existentes en `globals.css`**

Reemplazar las líneas 7-21 de `src/app/globals.css`:

```css
:root {
  --background: #F4F5F7;
  --foreground: #164e63;

  --color-primary: #2FA79B;
  --color-on-primary: #ffffff;
  --color-secondary: #22d3ee;
  --color-accent: #059669;
  --color-page: #FFFFFF;
  --color-muted: #F0F1F3;
  --color-border: #E4E5E9;
  --color-destructive: #dc2626;
  --color-warning: #854f0b;
  --color-warning-bg: #faeeda;

  --color-sidebar-bg: #14161C;
  --color-sidebar-fg: #C7C9D1;
  --color-sidebar-fg-muted: #6C6F7B;
  --color-sidebar-active: #2FA79B;
}
```

- [ ] **Step 3: Registrar los tokens nuevos en `tailwind.config.ts`**

En `tailwind.config.ts`, dentro de `theme.extend.colors` (línea 11-24), agregar después de `"warning-bg": "var(--color-warning-bg)",` (línea 23):

```ts
        "sidebar-bg": "var(--color-sidebar-bg)",
        "sidebar-fg": "var(--color-sidebar-fg)",
        "sidebar-fg-muted": "var(--color-sidebar-fg-muted)",
        "sidebar-active": "var(--color-sidebar-active)",
```

El bloque `colors` completo debe quedar:

```ts
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        page: "var(--color-page)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        destructive: "var(--color-destructive)",
        warning: "var(--color-warning)",
        "warning-bg": "var(--color-warning-bg)",
        "sidebar-bg": "var(--color-sidebar-bg)",
        "sidebar-fg": "var(--color-sidebar-fg)",
        "sidebar-fg-muted": "var(--color-sidebar-fg-muted)",
        "sidebar-active": "var(--color-sidebar-active)",
      },
```

- [ ] **Step 4: Correr la suite de tests de nuevo**

Run: `npm test`
Expected: mismo resultado que el Step 1 — todos pasan (cambiar valores de CSS/tokens no debe afectar ningún test, ya que ninguno hace snapshot de color).

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "style: nueva paleta premium/teal para el rediseño de Inicio"
```

---

## Task 2: Sidebar oscuro con acento teal

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: clases `bg-sidebar-bg`, `text-sidebar-fg`, `text-sidebar-fg-muted`, `text-sidebar-active` producidas en Task 1.
- Produces: ninguna interfaz nueva — mismo componente `Sidebar()`, sin props, sin cambio de comportamiento.

- [ ] **Step 1: Cambiar el fondo del `<nav>` y el logo (línea 28-42)**

Reemplazar:

```tsx
    <nav className="flex w-56 shrink-0 flex-col border-r border-border bg-page p-3">
      <div className="mb-4 flex items-center gap-2 px-2">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-primary">
          <path
            d="M12 3c-2.2 0-3.5 1.1-4.7 1.1-1.4 0-2.5-.9-3.5-.4-1.2.6-1.3 2.4-1 4 .5 2.7 1.6 5.7 2.7 8.3.7 1.6 1.3 3.5 2.8 3.5 1.6 0 1.6-2.7 2.1-4.5.3-1.1.7-2 1.6-2s1.3.9 1.6 2c.5 1.8.5 4.5 2.1 4.5 1.5 0 2.1-1.9 2.8-3.5 1.1-2.6 2.2-5.6 2.7-8.3.3-1.6.2-3.4-1-4-1-.5-2.1.4-3.5.4C15.5 4.1 14.2 3 12 3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="font-heading text-[15px] font-medium leading-tight text-foreground">Odent</p>
          <p className="text-[11px] leading-tight text-foreground/50">Clínica Dental</p>
        </div>
      </div>
```

Por:

```tsx
    <nav className="flex w-56 shrink-0 flex-col bg-sidebar-bg p-3">
      <div className="mb-4 flex items-center gap-2 px-2">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-sidebar-active">
          <path
            d="M12 3c-2.2 0-3.5 1.1-4.7 1.1-1.4 0-2.5-.9-3.5-.4-1.2.6-1.3 2.4-1 4 .5 2.7 1.6 5.7 2.7 8.3.7 1.6 1.3 3.5 2.8 3.5 1.6 0 1.6-2.7 2.1-4.5.3-1.1.7-2 1.6-2s1.3.9 1.6 2c.5 1.8.5 4.5 2.1 4.5 1.5 0 2.1-1.9 2.8-3.5 1.1-2.6 2.2-5.6 2.7-8.3.3-1.6.2-3.4-1-4-1-.5-2.1.4-3.5.4C15.5 4.1 14.2 3 12 3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="font-heading text-[15px] font-medium leading-tight text-sidebar-fg">Odent</p>
          <p className="text-[11px] leading-tight text-sidebar-fg-muted">Clínica Dental</p>
        </div>
      </div>
```

- [ ] **Step 2: Cambiar los ítems de navegación y la sección "Próximamente" (línea 44-71)**

Reemplazar:

```tsx
      <div className="flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-2 py-2 text-sm ${
                isActive ? 'bg-primary text-on-primary' : 'text-foreground'
              }`}
            >
              {item.label}
            </Link>
          )
        })}

        <div className="mt-2 space-y-1 border-t border-border/60 pt-2">
          {UPCOMING_ITEMS.map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-foreground/40"
            >
              <span>{label}</span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">Pronto</span>
            </div>
          ))}
        </div>
      </div>
```

Por:

```tsx
      <div className="flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-2 py-2 text-sm ${
                isActive ? 'bg-sidebar-active/15 text-sidebar-active' : 'text-sidebar-fg'
              }`}
            >
              {item.label}
            </Link>
          )
        })}

        <div className="mt-2 space-y-1 border-t border-sidebar-fg-muted/30 pt-2">
          {UPCOMING_ITEMS.map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-sidebar-fg-muted"
            >
              <span>{label}</span>
              <span className="rounded-full bg-sidebar-fg-muted/20 px-1.5 py-0.5 text-[10px]">Pronto</span>
            </div>
          ))}
        </div>
      </div>
```

- [ ] **Step 3: Cambiar el tip "¿Sabías que?" y el botón de cerrar sesión (línea 74-86)**

Reemplazar:

```tsx
      <div className="mb-3 rounded-xl bg-primary/10 p-3">
        <p className="text-xs font-semibold text-primary">¿Sabías que?</p>
        <p className="mt-1 text-xs text-foreground/70">
          El 80% de las caries se pueden prevenir con una buena higiene bucal.
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg px-2 py-2 text-left text-sm text-foreground"
      >
        Cerrar sesión
      </button>
```

Por:

```tsx
      <div className="mb-3 rounded-xl bg-sidebar-active/15 p-3">
        <p className="text-xs font-semibold text-sidebar-active">¿Sabías que?</p>
        <p className="mt-1 text-xs text-sidebar-fg-muted">
          El 80% de las caries se pueden prevenir con una buena higiene bucal.
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg px-2 py-2 text-left text-sm text-sidebar-fg"
      >
        Cerrar sesión
      </button>
```

- [ ] **Step 4: Correr la suite de tests**

Run: `npm test`
Expected: todos pasan (no hay tests que dependan de clases CSS específicas del Sidebar).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "style: sidebar oscuro con acento teal"
```

---

## Task 3: TopBar oscuro y buscador legible

**Files:**
- Modify: `src/components/layout/TopBar.tsx`
- Modify: `src/components/layout/GlobalSearch.tsx:60-67`

**Interfaces:**
- Consumes: clases `bg-sidebar-bg`, `text-sidebar-fg` de Task 1; sin dependencias de Task 2.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Dar fondo oscuro al contenedor de `TopBar` y ajustar el texto de usuario (línea 20, 61-64)**

Reemplazar la línea 20:

```tsx
    <div className="flex items-center gap-4 px-6 pt-4">
```

Por:

```tsx
    <div className="flex items-center gap-4 bg-sidebar-bg px-6 py-4">
```

Reemplazar las líneas 61-64:

```tsx
          <div className="leading-tight">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-foreground/50">{ROLE_LABEL[role] ?? role}</p>
          </div>
```

Por:

```tsx
          <div className="leading-tight">
            <p className="text-sm font-medium text-sidebar-fg">{name}</p>
            <p className="text-xs text-sidebar-fg-muted">{ROLE_LABEL[role] ?? role}</p>
          </div>
```

- [ ] **Step 2: Ajustar el input de `GlobalSearch` para que se vea como píldora clara sobre fondo oscuro**

En `src/components/layout/GlobalSearch.tsx`, reemplazar la línea 60-67:

```tsx
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar paciente…"
        className="w-full rounded-full border border-border bg-white/70 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40"
      />
```

Por:

```tsx
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar paciente…"
        className="w-full rounded-full border border-transparent bg-white py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40"
      />
```

(El resto de `GlobalSearch.tsx` — el ícono de lupa en línea 55 usa `text-foreground/40`, que sigue siendo legible porque está dentro del input blanco, no sobre el fondo oscuro directamente; no requiere cambio.)

- [ ] **Step 3: Correr la suite de tests**

Run: `npm test`
Expected: todos pasan.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/TopBar.tsx src/components/layout/GlobalSearch.tsx
git commit -m "style: topbar oscuro y buscador legible sobre fondo oscuro"
```

---

## Task 4: Verificación visual completa de Inicio

**Files:** ninguno se modifica en esta tarea — es puramente verificación. (Se confirmó al inspeccionar `WhatsAppInbox.tsx`, `UpcomingAppointments.tsx`, `QuickActions.tsx`, `StatsCards.tsx`, `ActivityFeed.tsx` y `MiniCalendarWidget.tsx` que ya consumen únicamente tokens semánticos — `border-border`, `bg-white/*`, `text-foreground`, `bg-primary`, `text-primary`, `bg-accent`, `bg-secondary`, `bg-warning-bg` — así que se re-temean solos con los cambios de Task 1, sin tocar su JSX.)

**Interfaces:**
- Consumes: la paleta completa de Task 1 y los componentes de layout de Tasks 2-3.

- [ ] **Step 1: Levantar el servidor de desarrollo**

Run: `npm run dev`
Expected: arranca sin errores en `http://localhost:3000`.

- [ ] **Step 2: Verificar visualmente contra el mockup aprobado**

Abrir `http://localhost:3000` (requiere sesión iniciada — usar credenciales de prueba existentes) y comparar contra el mockup `visual-style-v2.html` aprobado en el companion de brainstorming:
- Sidebar y TopBar forman una sola pieza oscura en "L".
- Ítem de navegación activo se ve en teal.
- El buscador global es una píldora blanca legible sobre el fondo oscuro.
- Las tarjetas de Inicio (Próximas citas, WhatsApp, accesos rápidos, stats, mini-calendario, actividad reciente) se ven blancas con acentos teal en vez de cian.
- No hay texto oscuro sobre fondo oscuro en ninguna parte del Sidebar/TopBar (si lo hay, es una regresión de Task 2/3 — corregir ahí antes de continuar).

- [ ] **Step 3: Correr la suite de tests completa una última vez**

Run: `npm test`
Expected: todos pasan, mismo conteo que antes de empezar el rediseño.

- [ ] **Step 4: Commit final de confirmación (si hubo ajustes menores durante la verificación)**

Si el Step 2 no requirió ningún ajuste de código, no hay nada que commitear en este paso — las Tasks 1-3 ya quedaron commiteadas. Si sí hubo un ajuste menor de contraste u otro detalle visual, commitear con:

```bash
git add -A
git commit -m "style: ajustes finales de contraste tras verificación visual de Inicio"
```

---

## Notas para la siguiente fase (no incluida en este plan)

Una vez que el usuario valide este piloto en producción, replicar la misma paleta (Tasks 1-3 ya cubren los tokens globales y el layout compartido) a Calendario, Pacientes, Pagos y Login — esas pantallas heredan automáticamente los tokens de `globals.css`/`Sidebar`/`TopBar` en cuanto se despliegue este cambio, así que probablemente solo necesiten una revisión visual, no un plan tan grande como este.
