---
name: testing
description: >
  Write or fix tests in the tanstack-start frontend with Vitest, jsdom and
  Testing Library: regression tests for bug fixes, unit tests for schemas,
  mappers and cache logic, component tests needing QueryClient, router,
  Intlayer or dialog providers, and mocking env or modules.
---

# Testing

Contract (authoritative): [.docs/testing.md](../../../.docs/testing.md).
Test policy: the "Tests" section of `AGENTS.md`.

## Steps

1. Decide whether a test is needed using the table in `.docs/testing.md`.
   Bug fix: write the regression test first and see it fail.
2. Open the closest reference test listed there and copy its setup.
3. Create `<name>.test.ts(x)` next to the unit; import it relatively.
4. Provide only the providers the unit needs (QueryClient with `retry: false`,
   memory router, `IntlayerProvider`, `DialogProvider`); seed data with
   `setQueryData` and the entity keys factory.
5. Mock `@/shared/config/env` and other module boundaries with `vi.mock`.
6. Assert through roles and accessible names.
7. Iterate with `bunx vitest run <file>`, then run the whole suite.

## Checklist

- [ ] Test fails without the fix (bug fixes)
- [ ] No real network calls; fake hosts use `.test`
- [ ] `afterEach(cleanup)` present for rendered components
- [ ] No snapshot tests, no test IDs where a role exists
- [ ] No jest-dom matchers (not installed)
- [ ] Production code not changed only to make testing easier

## Verify

```bash
bun run test
bun run typecheck
bun run check
```
