---
name: api-query
description: >
  Add or change API access in the tanstack-start frontend: Orval-generated
  endpoints, query keys, queryOptions/mutationOptions, cache invalidation,
  dependent or infinite queries, regenerating the API client, and mutation
  error/toast ownership.
---

# API query or mutation

Contracts (authoritative, read before writing code):

- [.docs/api.md](../../../.docs/api.md) — Orval facades, options pattern, keys, invalidation
- [.docs/error-handling.md](../../../.docs/error-handling.md) — single owner of each error
- Session/auth queries: also [.docs/auth.md](../../../.docs/auth.md)

## Steps

1. Find the generated method through `@/shared/api/admin` or `@/shared/api/auth`.
   If it is missing, regenerate: `OPENAPI_URL=... bun run generate-api`.
   Never edit `src/shared/api/*/{endpoints,model}/**`.
2. Add keys to the entity's `<domain>.keys.ts` factory; keep existing key
   segments unchanged.
3. Add `queryOptions` / `mutationOptions` in `entities/<domain>/api/` and export
   them from the entity `index.ts`.
4. Put cache invalidation in the mutation options `onSuccess`
   (`void mutationContext.client.invalidateQueries({ queryKey: keys.*All() })`).
5. Keep success toast, navigation and dialog closing in the calling page/feature.

## Checklist

- [ ] No handwritten axios/fetch calls and no manual response types
- [ ] No inline query keys
- [ ] Dependent queries use `enabled: !!param`
- [ ] No `toast.error` in `onError`/`catch` unless `meta: { disableToast: true }` is set
- [ ] Errors read via `getMessageFromError`, never `error.message`
- [ ] No local `retry` override without a documented reason
- [ ] Focused tests for non-trivial mappers or cache logic

## Verify

```bash
bun run check
bun run typecheck
bun run test
```
