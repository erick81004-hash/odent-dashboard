# Rediseño visual — piloto Inicio

**Fecha:** 2026-08-12
**Estado:** aprobado, pendiente de implementación

## Contexto

El dashboard de Odent está en producción con datos reales de la clínica. El
usuario quiere iniciar un rediseño visual del software, empezando por la
pantalla de Inicio como piloto: si el estilo funciona, se replica después a
Calendario, Pacientes, Pagos y Login en fases separadas.

El proyecto ya usa un sistema de tokens de color semánticos (`--color-*` en
`src/app/globals.css`, mapeados en `tailwind.config.ts` a nombres como
`primary`, `background`, `border`, etc.), así que el rediseño es
principalmente redefinir esos tokens y ajustar clases Tailwind en los
componentes existentes — no una reescritura de componentes ni de lógica.

## Objetivo

Aplicar una nueva dirección visual ("premium corporativo con acento teal") a
la pantalla de Inicio, sin cambiar ningún dato, query, prop o comportamiento
de los componentes existentes.

## Dirección visual aprobada

Definida y validada con mockups en el companion visual de brainstorming.
Combina el estilo "premium/corporativo" (sidebar oscuro) con el acento verde
teal del estilo "clínico confiable" (en vez del dorado original del mockup
premium).

- **Sidebar + TopBar:** fondo casi negro `#14161C`, se ven como una sola
  pieza en forma de "L" (top bar y sidebar comparten el mismo fondo oscuro).
  Texto de navegación en gris claro `#C7C9D1` (inactivo) / teal `#2FA79B`
  (activo). El buscador global (`GlobalSearch`) se muestra como una píldora
  clara sobre el fondo oscuro del TopBar.
- **Área de contenido:** fondo gris neutro claro `#F4F5F7` (reemplaza el tono
  cian actual `#ecfeff`). Tarjetas en blanco puro, `rounded-xl`, `shadow-sm`
  sutil en vez del borde grueso actual.
- **Acento primario:** teal `#2FA79B` para botones, elementos activos y
  highlights dentro del contenido (reemplaza el cian actual `#0891b2`).
- **Tipografía:** sin cambios — Figtree (headings) + Noto Sans (cuerpo).

## Cambios de tokens (`src/app/globals.css`)

Tokens existentes que cambian de valor:

| Token | Valor actual | Valor nuevo |
|---|---|---|
| `--background` | `#f0fbfa` | `#F4F5F7` |
| `--color-primary` | `#0891b2` | `#2FA79B` |
| `--color-page` | `#ecfeff` | `#FFFFFF` |
| `--color-muted` | `#e8f1f6` | `#F0F1F3` |
| `--color-border` | `#a5f3fc` | `#E4E5E9` |

`--color-secondary`, `--color-accent`, `--color-destructive`,
`--color-warning`, `--color-warning-bg`, `--color-on-primary`,
`--foreground` no cambian.

Tokens nuevos (no existen hoy, hay que agregarlos a `:root` y a
`tailwind.config.ts` bajo `theme.extend.colors`):

| Token nuevo | Valor | Uso |
|---|---|---|
| `--color-sidebar-bg` | `#14161C` | fondo de `Sidebar` y `TopBar` |
| `--color-sidebar-fg` | `#C7C9D1` | texto/iconos inactivos en sidebar/topbar |
| `--color-sidebar-fg-muted` | `#6C6F7B` | separadores/detalles secundarios en sidebar |
| `--color-sidebar-active` | `#2FA79B` | ítem de navegación activo (mismo valor que `--color-primary`, token separado para poder desacoplarlos después si hace falta) |

## Componentes que se tocan

Todos son cambios de clases Tailwind únicamente — ninguno cambia props,
queries, ni lógica:

1. **`src/app/globals.css`** — nuevos valores de tokens + los 4 tokens nuevos.
2. **`tailwind.config.ts`** — registrar los 4 tokens nuevos en
   `theme.extend.colors` (`sidebar-bg`, `sidebar-fg`, `sidebar-fg-muted`,
   `sidebar-active`).
3. **`src/components/layout/Sidebar.tsx`** — fondo `bg-sidebar-bg`, texto
   `text-sidebar-fg`, ítem activo con `text-sidebar-active` (y opcionalmente
   un indicador visual, ej. punto o borde izquierdo, del mismo color).
4. **`src/components/layout/TopBar.tsx`** — mismo fondo `bg-sidebar-bg`;
   `GlobalSearch` necesita un pequeño ajuste de estilo local (su `<input>`
   usa hoy `bg-white/70 border-border text-foreground`, que sobre fondo
   oscuro no se lee bien) para verse como píldora clara legible sobre fondo
   oscuro.
5. **Tarjetas/widgets de Inicio** (`src/components/inicio/`):
   `WhatsAppInbox.tsx`, `UpcomingAppointments.tsx`, `MiniCalendarWidget.tsx`,
   `QuickActions.tsx`, `AsistenteChat.tsx`, y cualquier tarjeta de stats en
   `src/app/(dashboard)/page.tsx` — mismos datos y props, solo actualizar
   clases de fondo/borde/sombra/radio para alinear con el nuevo estilo de
   tarjeta (blanco, `rounded-xl`, `shadow-sm`, acentos en `text-primary` /
   `bg-primary`).

## Fuera de alcance (explícito)

- Calendario, Pacientes, Pagos, Login — quedan con el estilo actual hasta
  que se valide este piloto en Inicio y se decida replicarlo.
- No se agregan, quitan, ni reordenan widgets de Inicio.
- No cambia ningún dato, query, prop, ni comportamiento (polling, auto-
  refresh, memoria del chat, etc.) — es un cambio puramente visual.
- No se toca el asistente de WhatsApp ni ningún workflow de n8n.
- No se resuelve la alerta de pausa de Supabase (decisión aparte, pospuesta
  hasta que haya cierre comercial con el cliente).

## Verificación

- Verificación visual manual: `npm run dev`, comparar Inicio contra el
  mockup aprobado en el companion de brainstorming.
- La suite de tests unitarios existente (`npm test`) no debería requerir
  cambios ni romperse, porque ningún test hace snapshot de colores/clases
  específicas y el comportamiento no cambia — solo confirmar que sigue en
  verde después del cambio.
