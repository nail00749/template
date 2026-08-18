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

- Use FSD architecture.
- shared must never import features or widgets.
- routes must stay thin.
- Use existing project structure.

See: .docs/architecture.md

---

## UI

- Use shadcn/ui components from @/shared/ui.
- Do not create custom Button, Select, Input, Dialog — use existing ones.
- Do not build custom UI primitives unless the existing component is provably insufficient.
- Use DataGrid for all new tables.
- Do not use raw Table for new implementations.
- UI is built on @base-ui/react — use `render` prop, never `asChild`.
- **Select**: `SelectValue` does NOT auto-render the label — always pass the display text as children: `<SelectValue>{LABEL_MAP[value]}</SelectValue>`. See `.docs/ui.md → Select`.
- **Combobox**: use `ComboboxSelectTrigger` + `ComboboxValue`, not `SelectTrigger`. Wrap API-backed selects in a dedicated component.
- **Button loading**: use the `loading` prop, not manual spinner + `disabled`.
- **Controlled vs uncontrolled**: pick one for a component's lifetime — never switch. Verify component props/controlled model against Base UI docs before writing forms/UI.

See: .docs/ui.md
See: .docs/datagrid.md

---

## Forms

- Use useAppForm.
- Use Zod v4.
- Use validators.onSubmit by default; use validators.onChange for reactive field validation.
- Do not use raw useForm unless necessary.

See: .docs/forms.md

---

## Dialogs

- Use useDialog.
- Use ConfirmDialog for confirmation flows.

See: .docs/dialogs.md

---

## Routing

- Use validateSearch with Zod.
- Use .catch() for search params.
- Preserve existing search params via updater functions.

See: .docs/router.md

---

## API

- Use Orval generated clients only.
- Never manually create API clients.
- Prefer queryOptions and mutationOptions.
- Query keys live in `<domain>.keys.ts` using factory pattern.
- Always invalidate via parent `*All()` key after mutations.

See: .docs/api.md

---

## TypeScript

- Never use `any` — use `unknown` or generics.
- Never use type assertions (`as X`) unless working with Orval-generated code.
- Import types with `import type` when value is used only as a type.
- Infer types from Zod schemas: `type X = z.infer<typeof schema>`.
- No default exports for components — always named exports.

See: .docs/conventions.md

---

## Code Style

- No nested ternaries.
- Always use braces — no inline/brace-less bodies for `if`/`else`/`for`/`while`.
- One component per file.
- Use interfaces for props.
- Use @/ imports only.
- Errors in mutations: always `toast.error(getMessageFromError(e))`, never `e.message`.
- Dates: always `formatDate()` + `DATE_FORMATS` from @/shared/lib/formatDate.
- Required string schemas: use `requiredString` from @/shared/lib/schemas.
- Display strings and status mappers go in `*Presentation.ts`, not inline in JSX.
- Prefix floating promises with `void` (e.g. `void context.client.invalidateQueries(...)`).

See: .docs/conventions.md

---

## Hooks

- Debounce values with `useDebouncedValue` from `@/shared/hooks/use-debounced-value` — never inline `setTimeout` + `useRef` in a component.

---

## Routing — Search Params

- Simple schemas (≤3 params, no mapping): schema lives in the route file.
- Complex schemas (pagination, date ranges, API mappers): schema + `map*SearchToParams` in `features/<domain>/model/`.
- Always `z.coerce.number()` for numeric URL params.
- Optional params: `.optional().catch(undefined)`.

See: .docs/router.md

---

## Git

- Branches: `feature/{TICKET-ID}/{short_description}` (or `fix/...` for bugfixes).
- Commits: `[{TICKET-ID}] {description}` — ticket ID in brackets, uppercase, description in English.

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
