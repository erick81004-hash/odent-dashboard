# Modo oscuro completo con interruptor

**Fecha:** 2026-08-12
**Estado:** aprobado, pendiente de implementación

## Contexto

El sidebar y el topbar de Odent ya son oscuros (`--color-sidebar-*`, fijados en el
rediseño de Inicio). El área de contenido (fondo de página, tarjetas, texto,
bordes) sigue siendo clara en todas las pantallas. El usuario quiere modo
oscuro completo en toda la app, con un interruptor claro/oscuro (no un
reemplazo fijo), oscuro por defecto.

Al mapear el código se encontró que, además de los tokens semánticos ya
existentes (`--background`, `--color-page`, `--color-muted`,
`--color-border`, `text-foreground`), hay **más de 100 usos sueltos** de la
paleta gris/blanca nativa de Tailwind (`border-gray-300`, `bg-white`,
`text-gray-500`, `bg-gray-50`, etc.) en componentes construidos antes de que
existiera el sistema de tokens — sobre todo formularios de Pacientes,
Calendario y Cobranza.

## Objetivo

1. Modo oscuro para toda el área de contenido de la app (no solo
   sidebar/topbar, que ya lo son).
2. Interruptor claro/oscuro persistente en `localStorage`, oscuro por
   defecto, sin parpadeo de tema incorrecto al cargar.
3. Migrar los usos sueltos de grises de Tailwind a los tokens semánticos
   existentes, para que un solo cambio de variables CSS retemee toda la
   app — en vez de agregar `dark:` a cada clase una por una.

## Decisiones explícitas

- **Interruptor, no reemplazo fijo.** Cada quien elige; se guarda en
  `localStorage` (preferencia de dispositivo/navegador, no de cuenta —
  no se persiste en la base de datos).
- **Oscuro por defecto** la primera vez que alguien entra (antes de tocar
  el interruptor).
- **Sidebar/topbar no cambian** — ya son oscuros en el estado actual y
  se quedan igual en ambos modos. Solo cambia el área de contenido.
- **Login respeta el mismo oscuro por defecto**, sin interruptor propio
  (una sola pantalla, sin sesión activa).
- **Excepción de migración:** los `bg-white`/`bg-white/70` que están
  colocados intencionalmente sobre el topbar/sidebar (siempre oscuros,
  ej. el buscador global, los botones de ícono en `TopBar.tsx` y
  `GlobalSearch.tsx`) **no se migran** — deben seguir siendo blancos
  literales en ambos modos, porque están sobre un fondo que nunca cambia.
  Solo se migran los grises/blancos que están en el área de contenido
  (que sí cambia con el tema).
- Cero cambios de datos, queries, o comportamiento — 100% visual.

## Paleta oscura (nuevos valores bajo `.dark`)

Los tokens de acento (`--color-primary`, `--color-on-primary`,
`--color-secondary`, `--color-accent`) se quedan igual — ya funcionan bien
sobre fondo oscuro. Los tokens de superficie/texto se redefinen:

| Token | Valor claro (actual) | Valor oscuro (nuevo) |
|---|---|---|
| `--background` | `#F4F5F7` | `#16171C` |
| `--foreground` | `#164e63` | `#E4E5E9` |
| `--color-page` | `#FFFFFF` | `#1E2027` |
| `--color-muted` | `#F0F1F3` | `#2A2C34` |
| `--color-border` | `#E4E5E9` | `#34363F` |
| `--color-destructive` | `#dc2626` | `#f87171` |
| `--color-warning` | `#854f0b` | `#F0B429` |
| `--color-warning-bg` | `#faeeda` | `#3A2E12` |

`--color-sidebar-*` no se tocan (ya son oscuros en ambos modos).

## Arquitectura del interruptor

- `tailwind.config.ts`: agregar `darkMode: 'class'`.
- `src/app/globals.css`: agregar un bloque `.dark { ... }` con la tabla de
  arriba (mismas variables, nuevos valores), después del bloque `:root`.
- `src/app/layout.tsx`: agregar un `<script>` inline (antes de que se
  pinte la página) que lea `localStorage.getItem('odent-theme')` y
  agregue la clase `dark` a `<html>` si el valor es `'dark'` o si no hay
  valor guardado (oscuro por defecto). Esto evita el parpadeo de tema
  claro→oscuro al cargar, porque corre antes de la hidratación de React.
- `src/components/layout/ThemeToggle.tsx` (nuevo, client component): botón
  con ícono sol/luna. Al hacer clic, alterna la clase `dark` en
  `document.documentElement` y guarda la preferencia en `localStorage`.
  Se coloca en `TopBar.tsx`, junto a los otros íconos (notificaciones,
  WhatsApp).

## Migración de grises sueltos a tokens

Reemplazar (sin cambiar layout, tamaños, ni espaciados — solo el nombre de
la clase de color):

| Clase Tailwind cruda | Token semántico equivalente |
|---|---|
| `bg-white` (en contexto de tarjeta/contenido) | `bg-page` |
| `bg-gray-50` | `bg-muted` |
| `border-gray-200` / `border-gray-300` / `border-gray-400` | `border-border` |
| `text-gray-500` / `text-gray-600` | `text-foreground/60` |
| `text-gray-800` | `text-foreground` |
| `text-gray-300` / `text-gray-400` (iconos deshabilitados) | `text-foreground/40` |

**Archivos a migrar** (todos en área de contenido, confirmado que ninguno
está sobre el sidebar/topbar siempre-oscuro):
`src/components/patients/PatientForm.tsx`,
`src/components/patients/PatientDetailsSection.tsx`,
`src/components/patients/PatientList.tsx`,
`src/components/patients/PatientSearch.tsx`,
`src/components/patients/PatientTabs.tsx`,
`src/components/patients/DocumentGallery.tsx`,
`src/components/patients/TreatmentHistoryList.tsx`,
`src/components/calendario/CitaForm.tsx`,
`src/components/calendario/MonthView.tsx`,
`src/components/calendario/CalendarioClient.tsx`,
`src/components/cobranza/CargoForm.tsx`,
`src/components/cobranza/CargoList.tsx`,
`src/components/cobranza/PagoForm.tsx`,
`src/components/cobranza/CobranzaClient.tsx`,
`src/components/auth/LoginForm.tsx`.

**Archivos explícitamente excluidos de esta migración** (blancos
intencionales sobre fondo siempre-oscuro, deben quedarse literales):
`src/components/layout/TopBar.tsx`, `src/components/layout/GlobalSearch.tsx`.

## Fuera de alcance

- No se agrega el interruptor a la pantalla de login.
- No se persiste la preferencia de tema en la base de datos ni por usuario
  de cuenta — es puramente `localStorage` del navegador.
- No se cambia ningún layout, tamaño, espaciado, ni estructura de
  componente — solo colores.
- No se toca `Sidebar.tsx`, `OdontogramViewTabs.tsx`, `ToothGrid.tsx`,
  `ToothConditionPanel.tsx`, ni ningún componente que ya use
  exclusivamente tokens semánticos (ya se retematizan solos).

## Verificación

- Verificación visual manual en navegador: alternar el interruptor en
  cada pantalla (Inicio, Calendario, Pacientes — lista/detalle/odontograma/
  historial/documentos/cobranza, Pagos, Login) y confirmar que no queda
  texto ilegible (texto oscuro sobre fondo oscuro, o claro sobre claro) en
  ninguna.
- Confirmar que recargar la página mantiene el tema elegido (persistencia
  en `localStorage`) sin parpadeo visible del tema contrario.
- La suite de tests existente (`npm test`) no debería requerir cambios ni
  romperse — ningún test hace snapshot de clases de color específicas.
