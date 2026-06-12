# AGENTS.md — El Salón (frontend)

**El Salón** is the web frontend of an educational platform for an art/design school: a shared
"salon" where students and teachers publish work, comment on it, and organize by course. The UI
and domain language are **Spanish**; this doc keeps domain terms in Spanish.

- **Stack:** Nuxt 3 (SSR, single Node server) · Pinia · PrimeVue (unstyled + custom preset) ·
  Tailwind · Quill (editor) · Plyr (video) · sidebase/nuxt-auth (local provider)
- **Backend:** PayloadCMS at `NUXT_PUBLIC_API_BASE` (this repo is frontend-only; all `/api/*`
  endpoints live in the backend)
- **Auth-gated app, SEO irrelevant** — SSR exists for fast first paint, not for crawlers.

## Running it

```bash
npm install
npm run dev        # dev server; backend expected at NUXT_PUBLIC_API_BASE (see .env)
npm run build      # production build → .output/
node .output/server/index.mjs   # run production build
```

Gotchas:
- `.env` points `NUXT_PUBLIC_API_BASE` at `http://localhost:3000` (the local PayloadCMS).
  **Don't bind the frontend to port 3000** when the backend isn't running — SSR will recursively
  fetch itself rendering error pages. Use `PORT=3100` (or similar) for local prod-build tests,
  or point at the test backend `https://test.elsalon.org`.
- Running `npm run build` overwrites `.nuxt/`. If you then start `npm run dev` and get
  `Package import specifier "#internal/nuxt/paths" is not defined`, delete `.nuxt/` and restart.
- Judge performance on the production build, never on dev (Vite compiles routes on demand).

## Glossary (domain model)

Content:
- **Entrada** — a post: rich HTML `contenido`, `imagenes`, `archivos`, YouTube/Vimeo embeds,
  `etiquetas`, `lastActivity` (sort key). Authored by a user or a grupo (`autoriaGrupal`).
  Lives in a sala, a bitácora, or a grupo. Files: [components/Entrada.vue](components/Entrada.vue),
  [components/EntradaDefault.vue](components/EntradaDefault.vue), API `/api/entradas`.
- **Comentario** — comment on an entrada; structurally an entrada (images, embeds, mentions,
  aprecios, guardado). [components/Comentario.vue](components/Comentario.vue),
  [components/CajaComentario.vue](components/CajaComentario.vue), API `/api/comentarios`.
- **Etiqueta** — tag. Global list lives in the salon store; tag feed at `/etiquetas/[slug]`.

Spaces (where entradas live):
- **Sala** — a course space (`nombre`, `siglas`, `color`, `slug`, `aulas`, optional `archivo`,
  `eventos`, `secciones`). All salas are loaded once into the store at startup.
  Page: [pages/salas/[slug]/index.vue](pages/salas/[slug]/index.vue).
- **El Salón** — the special sala (slug `el-salon`) = platform home (`/`). Its feed
  (`/api/salas/feed`) aggregates destacadas + the user's chronology.
- **Bitácora** — a user's personal journal: their profile page listing their own (non-group)
  entradas. Page: [pages/usuarios/[[slug]]/index.vue](pages/usuarios/[[slug]]/index.vue).
- **Grupo** — student group with `integrantes`; can collectively author entradas
  (**autoría grupal**). Managed at `/opciones/grupos`; profile at `/grupos/[slug]`.
- **Comisión** — a cohort/section *inside* a sala (integrantes + docentes + grupos). Not a
  publication space — a feed filter (`/api/comisiones/{id}/feed`).
  Page: [pages/salas/[slug]/comision-[slugcomision].vue](pages/salas/[slug]/comision-[slugcomision].vue).

Membership & curation:
- **Enlace / enlazarse** — the membership link between the user and a sala/usuario/grupo.
  [components/BtnEnlazar.vue](components/BtnEnlazar.vue) emits `estadoEnlace`:
  `0` hidden · `1` not linked ("Enlazar") · `2` linked ("Desenlazar") · `3` expired ("Re-enlazar").
  Being linked (estado 2) gates posting, secciones editing UI, timeline, and the write button.
- **Fijada** — a pin record (entrada + contexto + duración `dia|semana|mes|anno` + `fin`).
  Docentes pin entries to the top of a sala. [components/FijarEntrada.vue](components/FijarEntrada.vue),
  API `/api/fijadas`. ListaEntradas renders fijadas above the paginated feed.
- **Destacada** — docente-promoted entrada that appears on the El Salón home feed
  (`/api/entradas/{id}/destacar`).
- **Aprecio** — a like, on entradas or comentarios (`contenidotipo`). [components/Aprecio.vue](components/Aprecio.vue).
- **Guardado** — personal bookmark with category (`referencias`, `tecnicas`, `ideas`,
  `lecturas` — see [utils/categories.js](utils/categories.js)). Viewed at `/guardados`.

Sala features (per-sala toggles):
- **Archivo / Periodos** — historical archive by academic period. `sala.archivo` has `activar`,
  `frecuencia` (`cuatrimestral` = two periods/year, `anual`), `annoInicio`; the period list is
  computed **server-side** in [server/routes/cache/config.ts](server/routes/cache/config.ts).
  Pages at `/salas/[slug]/archivo-[periodo]` filter entries by the period's date range. The
  *current* period also constrains the sala's main feed and active enlaces/miembros.
- **Eventos / LineaDeTiempo** — docente-managed calendar per sala
  ([pages/salas/[slug]/eventos.vue](pages/salas/[slug]/eventos.vue), preview in
  [components/LineaDeTiempo.vue](components/LineaDeTiempo.vue)).
- **Secciones** — docente-configurable buttons on the sala header: external links or internal
  rich-text pages ([components/SeccionesSala/](components/SeccionesSala/),
  pages at `/salas/[slug]/pagina/[slugPagina]`).
- **Biblioteca** — special sala rendered as an image grid ([pages/salas/biblioteca.vue](pages/salas/biblioteca.vue)).

People & system:
- **Identidad** — the authorship selector when posting: yourself or one of your grupos
  ([components/SelectorIdentidad.vue](components/SelectorIdentidad.vue),
  [composables/useEntradaIdentidad.js](composables/useEntradaIdentidad.js)).
- **Mención** — `@user` mentions in the editor (quill-mention); stored as `mencionados` and
  rendered as profile links; triggers notifications.
- **Notificación** — per-user alerts (comentario, aprecio, mención, rol-docente). Badge polled
  every 60 s (deliberate decision: polling stays always-on). [stores/notificaciones.js](stores/notificaciones.js).
- **Nodo** — static help area: `/nodo/ayuda` (general help), `/nodo/docente` (teacher guide).
- **Onboarding** — date-versioned tutorial dialogs shown once per user
  ([composables/useOnboarding.js](composables/useOnboarding.js), [components/onboarding/](components/onboarding/)).

Roles: **alumno** (default) → post/comment/apreciar/guardar/enlazar/create grupos ·
**docente** (`user.rol === 'docente'`) → + fijar, destacar, comisiones, eventos, secciones,
edit sala metadata · **admin** (`user.isAdmin`) → + grant docente. The recurring check is
`rol === 'docente' || isAdmin`; ownership checks live in `useEntradaIdentidad` (`UsuarioTieneAutoridad`).

## How the app works (request-to-render)

1. **Startup:** global middleware [middleware/01.fetchSalon.global.js](middleware/01.fetchSalon.global.js)
   awaits `useSalonStore().fetchConfig()` → `GET /cache/config` (a **Nitro server route** with a
   3-hour in-memory cache, [server/routes/cache/config.ts](server/routes/cache/config.ts)) →
   all salas (with parsed periodos + secciones) and etiquetas land in the store once. Admin
   actions invalidate via `/cache/invalidate` ([server/routes/cache/invalidate.ts](server/routes/cache/invalidate.ts)).
   Single-Node deployment is assumed — the in-memory cache is by design.
2. **Auth:** sidebase local provider against Payload (`/api/users/login|logout|me`), Bearer token,
   60-day expiry, hourly session refresh, `globalAppMiddleware: true`. Every API call goes through
   `$api` ([plugins/api.ts](plugins/api.ts)) / `useAPI()` ([composables/UseFetchAuth.ts](composables/UseFetchAuth.ts)),
   which waits for auth, injects the token, and redirects to `/login` on 401.
3. **Page setup:** each page calls `salonStore.setContext(type, id)` — `contexto`
   (`salon|bitacora|grupo|entrada|opciones`) + `contextoId` drive what the editor publishes to,
   what fijadas load, and enlace checks. Sala pages resolve the sala **synchronously from the
   store** (404 if absent); data fetches are non-blocking (see Performance rules).
4. **Feeds:** [components/ListaEntradas.vue](components/ListaEntradas.vue) +
   [composables/usePaginatedList.js](composables/usePaginatedList.js) — cursor pagination on
   `lastActivity`, IntersectionObserver infinite scroll, fijadas merged on top, PayloadCMS-style
   `qs` queries (`where/and/equals`, `depth`, `populate`).
5. **Publishing:** `CrearEntradaBtn` → FullScreenModal → `LazyCrearEntradaDrawer` →
   [components/EditorRichText.client.vue](components/EditorRichText.client.vue) (Quill, lazy-loaded):
   localStorage autosave per context, drag-drop uploads (`/api/imagenes`, `/api/archivos` via
   `useUploadFile`), images embedded as `[image:id]` tokens, mentions/etiquetas as link tokens,
   identidad selection, destination-sala confirmation → `POST/PATCH /api/entradas`.
6. **Rendering content:** [composables/useRenderSalonHtml.js](composables/useRenderSalonHtml.js)
   expands the stored tokens into HTML ([components/ContenidoRendereado.vue](components/ContenidoRendereado.vue));
   PhotoSwipe provides the image lightbox; entries with >2 videos offer the
   [components/VideoPlaylist.vue](components/VideoPlaylist.vue) full-screen player (Plyr, lazy-loaded).
7. **Cross-component events** use `useNuxtApp().hooks` as an event bus:
   `publicacion:creada|editar|editada`, `entrada:fijar|fijada|desfijada`, `comentario:creado`,
   `videoplaylist:open`. Lists, drawers and detail pages stay in sync through these — when adding
   a mutation flow, emit/listen on this bus rather than prop-drilling.
8. **Notifications:** [plugins/notificationStartPolling.js](plugins/notificationStartPolling.js)
   polls `/api/notificaciones/nuevas` every 60 s (count only; full docs when the dialog is open).
9. **Analytics:** Mixpanel — identify on login ([plugins/analyticsIdentify.client.js](plugins/analyticsIdentify.client.js)),
   pageview per route ([middleware/02.AnalyticsTrackPage.global.js](middleware/02.AnalyticsTrackPage.global.js)),
   plus feature events (destacar, búsqueda, grupos…).

## Structure

```
pages/            routes (see glossary for the map); auth pages use LayoutCredenciales,
                  everything else uses LayoutContenido
layouts/          LayoutContenido.vue = sticky header (MenuPrincipal | title | MenuUsuario)
                  + Onboarding + NotificacionesDialog + VideoPlaylist, auto-hiding header on
                  mobile scroll (useScrollDirection)
components/       flat, Spanish names; Btn* = action buttons, Caja* = inline editable boxes,
                  Lista* = feeds/collections, Modal*/dialogs inside FullScreenModal
composables/      useAPI/useUploadFile, usePaginatedList, useEntrada{Acciones,Comentarios,
                  Identidad}, useRenderSalonHtml, useOnboarding, useScrollDirection, ...
stores/           SalonConfig.ts (salas/etiquetas/context — the app's backbone),
                  notificaciones.js (badge + polling)
server/routes/    cache/config.ts + cache/invalidate.ts — the only server-side code
plugins/          api.ts, notificationStartPolling, analyticsIdentify, set-color-mode,
                  dateFormatter, fadeInObserver
middleware/       01.fetchSalon.global, 02.AnalyticsTrackPage.global, redirect-settings
primevue-presets/salon/   custom PrimeVue passthrough preset (the design system)
utils/            categories.js (guardado categories), date helpers
```

## Design goals & conventions

- **No new npm packages, small conventional diffs.** Solve things with built-in Nuxt/Vue features
  (Lazy components, dynamic `import()`, `useAsyncData` options, the hooks bus).
- **Navigation must be instant.** Never `await` a fetch at the top level of a page/component
  `<script setup>` unless the whole template needs it synchronously (and then keep it to one
  small query). The house pattern is `useAsyncData(key, fn, { lazy: true, server: false })`
  consumed **reactively** (watch `data`/`status` or computed — never via the returned promise:
  during hydration the fetch is deferred but the promise resolves immediately, with `data` still
  null). Loading placeholders ("Cargando…", `.texto-cargando`) are the accepted UX. See
  `usePaginatedList.initialFetch` for the canonical implementation.
- **Heavy libraries load on demand:** Quill loads inside `EditorRichText` when the drawer opens
  (`LazyCrearEntradaDrawer`); Plyr + its CSS load inside `VideoPlaylist` when a playlist opens.
  Keep it that way — nothing heavy in the every-page bundle.
- **State split:** Pinia holds *global config* (salas, etiquetas, context, user groups) and
  notifications; everything else is fetched per page with `useAsyncData` cache keys
  (`sala${slug}`, `entrada-${id}`, `miembros-${id}`, `etiqueta-${slug}`…). Always pass a
  distinct cache key per logical view or stale data leaks across navigations.
- **The store is the source of truth for salas** — they're all loaded at startup, so existence
  checks and sala metadata reads are synchronous; fetch the API only for fresher/deeper fields.
- Spanish for UI strings, domain identifiers, and code comments is the norm — match it.

## Aesthetics

Minimal, text-first, archival. The app is a neutral backdrop; the only saturated color comes
from **sala/user identity colors** (each sala has a `color`; [components/AvatarSalon.vue](components/AvatarSalon.vue)
renders square colored-initial avatars, also used by [components/LogoSala.vue](components/LogoSala.vue)
and the main menu).

- **Palette:** zinc/neutral grayscale, near-white light mode / near-black dark mode. Primary is
  effectively black (white in dark mode). Defined via `--p-surface-*` custom properties in
  [assets/css/main.css](assets/css/main.css) and the preset theme
  ([primevue-presets/salon/](primevue-presets/salon/), extends Aura with a zinc palette).
- **Dark mode:** class-based (`.dark`), `@nuxtjs/color-mode` with system default; user preference
  saved to their profile ([plugins/set-color-mode.client.js](plugins/set-color-mode.client.js)).
  Every style ships both modes (`dark:` variants throughout) — keep parity when styling.
- **Typography:** system sans for content; **`font-mono` for inputs, buttons, and metadata** —
  the deliberate "logbook" feel. Prose content uses `@tailwindcss/typography`.
- **Shape & motion:** mostly square corners (square avatars, no dialog rounding); subtle
  ≤300 ms transitions; header hides on mobile scroll-down; `.texto-cargando` is an animated
  gradient text used for all loading states; edit-highlight flashes orange and fades.
- **Layout:** single readable column (`.container-small` 640px / `.container-medium` 768px),
  grid layouts only for biblioteca/archive views.
- PrimeVue runs **unstyled**: all component styling lives in the passthrough preset
  ([primevue-presets/salon/](primevue-presets/salon/)) as Tailwind class arrays — style new
  PrimeVue components there, not with scoped CSS overrides.
