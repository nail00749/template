# Architecture

## Architecture model

The project uses an **FSD-inspired, domain-oriented architecture**. It is not a
strict copy of every FSD layer: `features/<domain>` is a vertical domain module
that may contain API integration, model code, hooks, and its screen entry
points. Follow this document instead of applying a different FSD variant from
memory.

```text
src/
├── app/        — bootstrap, providers, integrations, global configuration
├── routes/     — TanStack Router adapters; no screen implementation
├── widgets/    — optional cross-domain/app-wide compositions and layouts
├── features/   — isolated domain modules (api, model, hooks, ui)
└── shared/     — domain-agnostic infrastructure, UI kit, forms and utilities
```

Do not create additional top-level architectural layers without an explicit
decision recorded in this document.

## Dependency direction

```text
app/routes -> widgets -> features -> shared
```

- `shared` imports only from `shared` and external packages. The sole explicit
  exception is validated environment access through `@/env`.
- A feature imports from its own slice and `shared`.
- A feature **must not import another feature**. If two domains participate in
  one screen, compose them in a widget or route-level adapter.
- A widget may import multiple features and `shared`.
- Routes may import public APIs of features/widgets and app routing utilities.
- `app` wires providers and integrations; domain workflows do not live there.

## Public APIs

Every feature and widget exposes an `index.ts`. Code outside the slice imports
only from that entry point:

```ts
// Correct: external consumer uses the slice contract
import { TemplatesPage, adminQueries } from '@/features/admin'

// Wrong: reaches into another slice's implementation
import { TemplatesPage } from '@/features/admin/ui/TemplatesPage'
```

Inside the same slice, use relative imports. Shared has no top-level barrel;
import from a focused shared module such as `@/shared/ui/button` or
`@/shared/lib/formatDate`.

Public APIs should be small. Do not export internal helpers preemptively.

These dependency and deep-import rules are enforced by `.oxlintrc.json`. Do not
disable the rule for a new import; move composition to the correct layer or
extend the slice's intentional public API.

## Route ownership

Routes are adapters. They may:

- define `validateSearch`, `beforeLoad`, `loader`, `head`, and route metadata;
- read `Route.useParams()` / `Route.useSearch()` in a small adapter component;
- pass validated params/search to a feature or widget entry point;
- render an imported layout or screen.

Routes must not contain page markup, forms, mutations, table columns, navigation
menus, or domain event handlers. A feature/widget must not import a `Route`
object; route values flow downward through props.

## Feature structure

```text
src/features/<domain>/
├── index.ts                    — public API
├── api/
│   ├── endpoints/             — Orval generated; do not edit
│   ├── model/                 — Orval generated; do not edit
│   ├── <domain>.keys.ts       — query-key factory
│   └── <subject>.queries.ts   — queryOptions/mutationOptions
├── hooks/                     — domain orchestration hooks
├── model/                     — schemas, mappers, domain constants
└── ui/                        — screens and domain UI
```

Create a file only when its responsibility exists. Do not create empty segment
folders or speculative abstractions.

## Responsibility ownership

| Location                | Owns                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| `api/*.queries.ts`      | request binding, query keys, cache consistency/invalidation                     |
| `model/`                | schemas, URL-to-API mappers, domain state and calculations                      |
| `hooks/use<Feature>.ts` | form/query/mutation orchestration, navigation, dialogs, handlers, derived state |
| screen component        | composition and rendering                                                       |
| route                   | URL contract, guard, loader, metadata                                           |
| `shared`                | domain-agnostic infrastructure only                                             |

Do not duplicate cache invalidation in a screen if mutation options already own
it. Do not wrap every query in a custom hook; add a hook when it coordinates a
user flow or hides meaningful domain behavior.

## Screen components and hooks

- A screen may call its co-located `use<Feature>` hook and render JSX directly.
- Extract queries, mutations, forms, navigation, substantial handlers, and
  derived state into the hook when the screen becomes non-trivial.
- Trivial local UI state and one-line handlers may remain in the component.
- Do not create a proxy component that only forwards hook output to
  `<PageName>View`.
- Split a view only when it is reused or a genuinely large screen becomes
  clearer.

Typical structure:

```text
features/posts/ui/create-post/
├── CreatePostPage.tsx
└── useCreatePost.ts
```

## Widgets

Widgets are optional. Use them for stable app-wide layouts, error boundaries,
or cross-domain composition. Do not move a single-domain screen into widgets
just because it is visually large, and do not put reusable domain logic there.

## Shared placement

`shared` contains infrastructure without business semantics:

- `ui/` — generic primitives and established reusable components;
- `form/`, `dialog/` — generic form/dialog infrastructure;
- `api/` — transport client and multipart helpers;
- `hooks/` — domain-agnostic hooks;
- `lib/` — focused utilities;
- `styles/` — global styles and fonts.

A component missing from `shared/ui` does not automatically belong there. Keep
a one-off domain component in its feature. Promote it to shared only when it is
domain-agnostic and has real reuse.

Avoid catch-all files such as `helpers.ts`, `types.ts`, or adding more unrelated
functions to `shared/lib/utils.ts`. Prefer focused names such as
`format-date.ts` or `get-message-from-error.ts`.

## Server/client boundaries

- Put server-only implementation in `*.server.ts` or behind
  `createIsomorphicFn`.
- Never expose `SERVER_*` values through a client-importable return value.
- Browser APIs (`window`, `document`, `File`, object URLs) require a client-safe
  lifecycle and must not execute during SSR.
- A new QueryClient/router instance must be created for every SSR request.
- Never disable TLS certificate validation. Configure a trusted CA through the
  server HTTPS-agent integration.

## Generated boundaries

Never edit `src/routeTree.gen.ts`, Orval endpoints, or Orval models. Handwritten
query wrappers and public APIs live outside generated directories. Orval's
`clean` option may delete any handwritten file placed inside its output.

## Placement decision for agents

Before creating code:

1. Search the owning feature and `shared` for an existing implementation.
2. If code has domain meaning, keep it in the owning feature.
3. If multiple domains must be composed, use a widget.
4. If code is generic infrastructure with demonstrated reuse, use `shared`.
5. When uncertain, keep code local; extraction is easier than undoing a wrong
   global abstraction.
