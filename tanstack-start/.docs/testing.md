# Testing

## Runners

`bun run test` runs two suites:

- **Vitest** (`vitest.config.ts`) — application tests in `src/**` and script
  tests in `scripts/**`. Environment `jsdom`, `@/` paths from `tsconfig.json`,
  the Intlayer plugin with its packages inlined so dictionaries resolve.
- **Bun test** — only `scripts/braces-security.test.ts`, excluded from Vitest.
  See `.docs/dependencies.md`.

Run one file while iterating: `bunx vitest run src/shared/ui/DataGrid.test.tsx`.

## What to test

| Subject                                                  | Test                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| Bug fix with reproducible behavior                       | Regression test that fails before the fix                     |
| Zod schema, search mapper, request mapper                | Unit test of inputs → outputs, including `.catch()` fallbacks |
| Cache logic, retry policy, domain calculation            | Unit test                                                     |
| Shared UI with behavior (DataGrid, dialogs, form fields) | Component test through roles and user events                  |
| Simple page/feature composition                          | No test; do not add snapshot tests                            |

If a non-trivial change has no test, state the concrete reason.

## Placement and naming

Put `<name>.test.ts(x)` next to the code under test, inside the same slice.
Tests import the unit relatively (`./LoginPage`); they may import other slices
only through their public `index.ts`.

## Style

- Import `describe`, `it`, `expect`, `vi` from `vitest` explicitly.
- Render with `@testing-library/react` and call `afterEach(cleanup)`.
- Query by role and accessible name (`screen.getByRole('button', { name: ... })`);
  avoid test IDs and CSS selectors unless no role exists.
- Simulate input with `fireEvent`; wrap state updates outside React events in
  `act` and wait for async UI with `waitFor`.
- Use plain matchers (`toBeTruthy`, `toBeNull`, `toBe`, `toHaveBeenCalledOnce`);
  `@testing-library/jest-dom` is not installed.
- Test names describe behavior: `'calls onCancel once when the user explicitly cancels'`.
- Use `it.each` for the same behavior across several inputs.
- Wrap components that depend on StrictMode semantics (dialogs, effects) in
  `<StrictMode>` to catch effect replay bugs.

## Providers and mocks

Mock at module boundaries with `vi.mock`, never by editing the unit under test:

- `@/shared/config/env` — always mock when the unit reads env:
  `vi.mock('@/shared/config/env', () => ({ env: { VITE_API_BASE_URL: 'https://api.example.test' } }))`.
- Query: create `new QueryClient({ defaultOptions: { queries: { retry: false } } })`
  per test and seed data with `client.setQueryData(entityKeys...)` instead of
  mocking API clients. Use the entity keys factory, never inline keys.
- Router: build a minimal tree with `createRootRoute`/`createRoute`,
  `createMemoryHistory({ initialEntries })` and `RouterContextProvider`; or
  partially mock `@tanstack/react-router` with `importOriginal` when only a hook
  such as `useNavigate` is needed.
- i18n: wrap in `<IntlayerProvider locale="ru">` to test real dictionaries, or
  mock `react-intlayer`'s `useIntlayer` when copy is irrelevant.
- Dialogs: render inside `DialogProvider` and open through `useDialog`.
- Use `.test` / `example.test` hosts for fake URLs.

Reference tests:

- `src/widgets/admin-layout/ui/AdminBreadcrumbs.test.tsx` — router + query + i18n
- `src/shared/ui/dialog-provider/ConfirmDialog.test.tsx` — dialogs, StrictMode
- `src/shared/lib/hooks/use-data-grid-sorting.test.tsx` — hooks with `renderHook`
- `src/app/integrations/tanstack-query/query-retry.test.ts` — pure policy logic

## Rules

- Never hit a real network or backend; no tests depending on test order.
- Never edit generated files to make a test pass.
- Do not override `retry` in production code for tests; disable it in the test `QueryClient`.
