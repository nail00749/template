# MANDATORY INSTRUCTIONS

Before every task:

1. Read AGENTS.md completely.
2. Determine which documentation files are relevant.
3. Read only the relevant documentation.
4. Follow all mandatory rules.
5. Verify generated code against these rules before finishing.
6. Run the Definition of Done checks (see below) before claiming the task is complete.

Failure to follow AGENTS.md is considered a bug.

**Source of truth:** AGENTS.md is a short index. The files in `.docs/*` are the
authoritative source for each topic. If anything conflicts, `.docs/*` wins —
update it there, then sync the summary here.

---

# Project

Frontend for Proback Legal Platform.

Stack:

- React 19
- TanStack Start
- TanStack Router
- TanStack Query
- Tailwind CSS v4
- shadcn/ui
- Bun
- Nitro
- Vite 7

---

# Critical Rules

## Architecture

- Use FSD architecture (`app`, `routes`, `features`, `widgets`, `shared`).
- shared must never import features or widgets.
- routes must stay thin.
- Page components may call their `use<Feature>` hook directly and render the
  page; do not add proxy components or `<PageName>View` layers without a real
  reuse or complexity benefit.
- Keep non-trivial page logic (queries, mutations, forms, navigation, event
  handlers, and derived state) in a co-located `use<Feature>` hook. Trivial
  local UI state may remain in the component.

See: .docs/architecture.md

---

## TanStack Start (SSR, loaders, links)

- Loaders — only `context.queryClient.ensureQueryData(...)`; never call API directly.
- Use `linkOptions` for typed links; never build paths as strings.
- Use `createIsomorphicFn` for code that differs between server and client.
- Environment — only via `@/env`, never `import.meta.env` directly.

See: .docs/start.md

---

## Auth

- Protected routes — `beforeLoad` + `ensureQueryData(meQueryOptions())`.
- On missing user — `throw redirect({ to: '/login' })`.
- Logout — `router.navigate({ to: '/login', replace: true })` in `onSuccess`.

See: .docs/auth.md

---

## Error Handling

- Mutation errors — `toast.error(getMessageFromError(e))`. Never `e.message`.
- Query errors — global handler shows toast; do not duplicate.
- Page-level crashes — handled by `RootErrorBoundary`; do not add local
  error boundaries without a real need.

See: .docs/error-handling.md

---

## UI

- Use shadcn/ui components from @/shared/ui.
- Do not create custom Button, Select, Input, Dialog — use existing ones.
- Do not build custom UI primitives unless the existing component is provably insufficient.
- Use DataGrid for all new tables. Never use raw Table.
- UI is built on @base-ui/react — use `render` prop, never `asChild`.
- **Select**: `SelectValue` does NOT auto-render the label — pass children explicitly.
- **Combobox**: `ComboboxSelectTrigger` + `ComboboxValue`, not `SelectTrigger`.
- **Button loading**: use the `loading` prop, not manual spinner + `disabled`.
- Use Skeleton for page/content loading; never a generic spinner for full pages.
- Controlled vs uncontrolled: pick one mode, never switch. Verify against Base UI docs.
- Links — `linkOptions`, never string paths.

See: .docs/ui.md
See: .docs/datagrid.md

---

## Forms

- Use `useAppForm`, Zod v4. Never raw `useForm`.
- `validators.onSubmit` by default; `validators.onChange` for reactive fields.
- One Zod schema per form — single source of truth.
- `requiredString` from `@/shared/lib/schemas` for required strings.
- After create — navigate to detail page when it exists.
- Edit forms — mount after data loads; never `form.reset()` in `useEffect`.

See: .docs/forms.md

---

## Dialogs

- Use `useDialog`. `ConfirmDialog` for destructive actions.
- Dialog component returns `DialogContent` only — never wraps in `<Dialog>`.
- Async `onConfirm` must return a Promise; do not close before resolution.

See: .docs/dialogs.md

---

## Files

- Use `FileFieldForm` from `@/shared/form` for uploads.
- Use `buildFormData` from `@/shared/api/formData` for multipart requests.
- Server-side file validation errors — via `getFileValidationErrorMessage`.

See: .docs/files.md

---

## Routing

- Always `validateSearch` with Zod. All fields must `.catch()`.
- `z.coerce.number()` for numeric URL params. `.optional().catch(undefined)` for optional.
- Simple schemas (≤3 params) in route file; complex schemas + mappers in `features/<domain>/model/`.
- Preserve existing search params via updater functions: `(prev) => ({ ...prev, page: 2 })`.
- Use `useNavigate`/`router.navigate` for programmatic navigation; `throw redirect()` in loaders only.

See: .docs/router.md

---

## API

- Orval-generated clients only. Never manual fetch/axios calls.
- `queryOptions` / `mutationOptions` wrappers, never inline.
- Query keys in `<domain>.keys.ts` via factory. Invalidate via `*All()` after mutations.
- Files upload — `buildFormData` + `FileFieldForm`.
- Regenerate with `bun run generate-api`; never edit `endpoints/` by hand.

See: .docs/api.md

---

## TypeScript

- Never `any` — `unknown` or generics.
- Never type assertions (`as X`) except with Orval-generated code.
- `import type` for type-only imports.
- Infer from Zod: `type X = z.infer<typeof schema>`.
- No default exports for components.
- `_` prefix only for fixed-signature callback params; otherwise delete unused.

See: .docs/conventions.md

---

## Code Style

- No nested ternaries. Always braces for `if`/`for`/`while`.
- One component per file. Props via `interface`.
- `@/` imports only.
- `cn()` for conditional classes. Tailwind utilities first; CSS modules for complex.
- Dates: `formatDate()` + `DATE_FORMATS` from `@/shared/lib/formatDate`.
- Display strings / status mappers — in `*Presentation.ts`, not inline JSX.
- Floating promises: prefix with `void`.
- After successful mutations: `toast.success('Сохранено')` (or `'Создано'` / `'Удалено'`).

See: .docs/conventions.md

---

## Hooks

- `useDebouncedValue` from `@/shared/hooks/use-debounced-value` — never inline
  `setTimeout` + `useRef` for debouncing.
- `useIsMobile`, `useDataGridState` — check `@/shared/hooks` before rolling your own.

---

## Git

- Branches: `feature/{TICKET-ID}/{short_description}` or `fix/{TICKET-ID}/{...}`.
- Commits: `[{TICKET-ID}] {description}` — English, starts with a verb.
- Fix without ticket: `fix/{short_description}` + commit prefix `[NO-TICKET]`.

See: .docs/git.md

---

## Testing

- Tests are not required. Do not write unit/integration tests unless explicitly asked.

---

## Definition of Done

Run before claiming a task is complete (Bun):

```bash
bun run check       # oxfmt --write . && oxlint --fix
bun run typecheck   # tsc --noEmit
bun run build       # production build must pass
```

- All three must pass with no errors.
- Use `bun run <script>` / `bunx <bin>` — never `npx`.
- API clients are regenerated with `bun run generate-api` (Orval) — never hand-edit generated code.
