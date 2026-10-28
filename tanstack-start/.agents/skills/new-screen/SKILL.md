---
name: new-screen
description: >
  Add a new screen, route or FSD slice to the tanstack-start frontend. Use when
  creating a page, a route file under src/routes, a loader or auth guard, search
  params, or when deciding whether code belongs in a page, widget, feature or
  entity. Project contracts from .docs win over generic FSD or TanStack examples.
---

# New screen

Contracts (authoritative, read before writing code):

- [.docs/architecture.md](../../../.docs/architecture.md) — layers, public APIs, ownership
- [.docs/conventions.md](../../../.docs/conventions.md) — component and hook structure
- [.docs/router.md](../../../.docs/router.md) — search schemas, navigation, links
- [.docs/start.md](../../../.docs/start.md) — loaders, SSR, env, isomorphic code
- Protected route or login flow: also [.docs/auth.md](../../../.docs/auth.md)
- User-facing text: also [.docs/i18n.md](../../../.docs/i18n.md)

Use the `feature-sliced-design` skill only for placement questions these
documents do not answer.

## Steps

1. Inspect the closest existing screen (`src/pages/templates`,
   `src/pages/template-detail`) and its route adapter in `src/routes/`.
2. Place code:
   - `src/routes/...` — adapter only: `validateSearch`, `loader`, `beforeLoad`,
     metadata, then render the page entry point with typed props.
   - `src/pages/<name>/ui` — JSX; `src/pages/<name>/model` — `use<PageName>`
     hook, search schema with a mapper when it is non-trivial.
   - `src/features/<action>` — only for a reusable or independent user action.
   - `src/entities/<domain>/api` — keys and query/mutation options.
3. Export the slice through `index.ts`; import other slices only through it.
4. Detail data needed before render: `loader` with
   `context.queryClient.ensureQueryData(...)`, the same query options in the
   component. Lists: `useQuery` + Skeleton, no loader.
5. Put user-facing copy in a co-located `*.content.ts` dictionary.

## Checklist

- [ ] Route file has no markup, columns, forms, mutations or handlers
- [ ] No page/feature imports a `Route` object; params arrive via props
- [ ] Dependency direction `routes → pages → widgets → features → entities → shared`
- [ ] Every search field has `.catch()`; navigation updaters spread `prev`
- [ ] Links use `linkOptions`, never interpolated paths
- [ ] No direct `import.meta.env`, no browser API during SSR
- [ ] `src/routeTree.gen.ts` not edited by hand

## Verify

```bash
bun run check
bun run typecheck
bun run build
```
