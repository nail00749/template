# Архитектура

Проект использует Feature-Sliced Design (FSD): верхние слои собирают нижние,
а каждый slice скрывает внутреннюю реализацию за публичным `index.ts`.
Термины «слой», «slice» и «segment» соответствуют официальному справочнику
[FSD](https://fsd.how/docs/reference/layers/) и
[правилам slices/segments](https://fsd.how/docs/reference/slices-segments/).

## Каноническая структура

```text
src/
├── routes/                 — TanStack Router adapters (framework convention)
├── router.tsx              — router factory (framework entry)
├── client.tsx              — client entry (framework convention)
├── routeTree.gen.ts        — generated route tree
├── app/
│   ├── providers/          — application providers
│   ├── integrations/       — Query and devtools integrations
│   ├── app.d.ts            — app typings
│   └── styles/             — global CSS and fonts
├── pages/
│   ├── login/               — login screen
│   ├── templates/           — templates list and its table
│   └── template-detail/     — template detail and slide grid
├── widgets/
│   ├── admin-layout/         — app-wide admin layout
│   ├── root-error-boundary/ — root error boundary
│   └── not-found/           — not-found screen
├── features/
│   ├── edit-template/
│   ├── upload-template/
│   ├── delete-template/
│   ├── reupload-template/
│   ├── annotate-slide/
│   ├── delete-slide/
│   ├── sync-template/
│   └── logout/
├── entities/
│   ├── session/              — auth API, keys, queries
│   └── template/             — template API, keys, queries, SlidePreview
└── shared/
    ├── api/                  — transport and generated API clients/types
    ├── config/               — env.ts
    ├── lib/                  — focused utilities and hooks
    └── ui/                   — primitives, forms and dialogs
```

Empty layers and empty segments are not created. A segment is added only when
the responsibility exists. Within a slice, `ui/` contains rendering,
`model/` state and orchestration, and `api/` request bindings.

Dependency direction is:

```text
app + routes → pages → widgets → features → entities → shared
```

The direction is one-way. A lower layer never imports a higher layer; slices at
the same layer do not import one another. A page may compose its own features,
entities and shared UI. A widget may compose several features when that
composition is genuinely cross-domain. Routes remain adapters.

## Public APIs

External imports use a slice's public entry point:

```ts
import { TemplatesPage } from '@/pages/templates'
import { templateQueries } from '@/entities/template'
import { UploadTemplateDialog } from '@/features/upload-template'
```

Imports such as `@/pages/templates/ui/TemplatesPage` or imports into another
slice's `model/` are forbidden. Relative imports are for files inside the same
slice or segment. `shared` has focused imports (`@/shared/ui/button`,
`@/shared/lib/formatDate`) and no catch-all barrel.

The public entity contracts are stable:

- `entities/session` exports `authKeys`, `meQueryOptions`,
  `AuthUnavailableError`, and `logoutMutationOptions`;
- `entities/template` exports `templateKeys`, `templateQueries`,
  `templateMutations`, and `SlidePreview`.

`features/*/index.ts` exposes only the action entry points needed by pages or
widgets. Internal hooks, forms and view helpers remain private.

## Ownership rules

Pages own screen orchestration and page-specific markup. The templates page
owns its table and columns; the template-detail page owns its slide grid.
User actions are feature slices: edit, upload, delete, reupload, annotate,
delete-slide, sync and logout. Domain data access belongs to its entity.
Generic components and infrastructure belong to `shared`.

For new code, keep page-only logic in its page slice. Extract a feature when an
action has a meaningful independent responsibility or is reused; do not create
a feature for every button. Screen orchestration lives in `pages/*/model`,
with JSX in `pages/*/ui`.

The `shared/api/admin/{endpoints,model}` and
`shared/api/auth/{endpoints,model}` trees contain Orval output. These files are
moved byte-identically during the migration and must never be edited by hand.
Handwritten `shared/api/admin.ts` and `shared/api/auth.ts` provide the focused
client/type facade. Future regeneration still requires `OPENAPI_URL`.

## Routes and app wiring

Keep framework paths at their TanStack Start defaults. `routes/`, `router.tsx`,
`client.tsx` and `routeTree.gen.ts` live directly under `src/` and belong to
App logically. This integration boundary avoids custom framework path settings;
it does not permit screen implementations or domain code at the source root.

Files under `routes` define the URL contract, search validation, metadata,
loaders and auth guards, then render a public page or widget entry point. They
must not contain page markup, table columns, forms, mutations or domain event
handlers. A page or feature must not import a `Route` object.

The root route additionally owns the HTML document shell and provider wiring.

`router.tsx` creates a router per SSR request, `client.tsx` is the client
entry, and `routeTree.gen.ts` is generated by TanStack Router. Global CSS
and fonts live under `app/styles`.

## Server/client and generated boundaries

Server-only code uses `*.server.ts` or `createIsomorphicFn`; browser APIs must
not execute during SSR. Read environment values only through
`@/shared/config/env`. Never expose server secrets or disable TLS validation.

Never edit `routeTree.gen.ts` or any Orval endpoint/model. Change route
source files and run the project's generators when regeneration is required.

## Automated checks

`bun run check` includes `bun run check:architecture`. Oxlint provides immediate
feedback for alias imports; `scripts/check-architecture.ts` resolves local
imports (including relative, dynamic and type imports) and checks layer
direction, slice isolation, public entry points and generated API facades.
It also rejects source files outside FSD layers and slices without `index.ts`,
except for the standard Start entries listed above. Those entries and `routes/`
are classified as app-level code; lower layers cannot import them.
These checks enforce dependency boundaries; responsibility placement still
requires code review.
