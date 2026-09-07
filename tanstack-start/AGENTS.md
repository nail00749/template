# MANDATORY INSTRUCTIONS

Before every task:

1. Read this file completely.
2. Read only the topic documents required by the table below.
3. Inspect the affected code and nearby public APIs before creating new code.
4. Preserve unrelated changes and keep the implementation minimal.
5. Run the checks appropriate for the changed behavior before reporting completion.

Failure to follow these rules is a bug.

**Source of truth:** this file is an index. `.docs/*` is authoritative for each
topic. When a rule changes, update its topic document first and keep only the
short invariant here.

## Project

Frontend for Proback Legal Platform.

Stack: React 19, TanStack Start/Router/Query, Tailwind CSS v4, shadcn/ui,
Base UI, Bun, Nitro, Vite 8.

## Documentation selection

| Task                                   | Read                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| Any structural change or new screen    | `.docs/architecture.md`, `.docs/conventions.md`              |
| Route, loader, redirect, search params | `.docs/router.md`, `.docs/start.md`                          |
| Query, mutation, generated endpoint    | `.docs/api.md`, `.docs/error-handling.md`                    |
| Authentication/session                 | `.docs/auth.md`, `.docs/error-handling.md`, `.docs/start.md` |
| Form                                   | `.docs/forms.md`, `.docs/ui.md`, `.docs/error-handling.md`   |
| Dialog                                 | `.docs/dialogs.md`, `.docs/ui.md`                            |
| Table/list                             | `.docs/datagrid.md`, `.docs/router.md`, `.docs/api.md`       |
| File upload                            | `.docs/files.md`, `.docs/forms.md`, `.docs/api.md`           |
| UI component or styling                | `.docs/ui.md`, `.docs/conventions.md`                        |
| Git operation requested by the user    | `.docs/git.md`                                               |

## Local skills

Repository skills live in `../.agents/skills/`:

- [shadcn](../.agents/skills/shadcn/SKILL.md): component APIs, composition,
  registry operations and styling when working on shadcn UI.
- [feature-sliced-design](../.agents/skills/feature-sliced-design/SKILL.md):
  placement decisions, public APIs and FSD dependency boundaries.

Use them only for the relevant task. This file and `.docs/*` define the project
contracts when upstream examples differ. Run shadcn commands from this
directory with Bun; inspect `components.json` and the existing wrappers first.
Keep Base UI `render`, TanStack Form, DataGrid, the existing Sonner integration
and documented FSD ownership. Installing or invoking a skill does not authorize
a component-library or architecture migration.

## Architecture invariants

- The project uses FSD; follow the exact layers and public APIs in
  `.docs/architecture.md`, not assumptions from another FSD variant.
- Dependency direction: `app + routes -> pages -> widgets -> features -> entities -> shared`.
- Keep Start entries and `routes/` at their default paths under `src/`; treat them as App.
- Lower layers never import higher layers; same-layer slices never import one another.
- Compose user actions and entities in a page or widget.
- External consumers import a page/widget/feature/entity through its `index.ts`; direct
  imports into another slice's internals are forbidden.
- Routes are adapters only: guards, loaders, search/params validation, metadata,
  and rendering a page/widget entry point. The root route owns the document shell.
- Pages own screen orchestration; reusable actions belong in feature slices.
- Reuse existing shared UI, forms, dialogs, hooks, and utilities before adding
  another abstraction.

## Runtime invariants

- Loaders populate Query cache with `queryClient.ensureQueryData(...)`; never
  call API clients directly from a loader.
- Auth guards use the freshness contract from `.docs/auth.md`; a frontend guard
  never replaces backend authorization.
- Use `linkOptions` for reusable/dynamic links; never interpolate route paths.
- Use `createIsomorphicFn` or a `*.server.ts` module for server/client boundaries.
- Read environment variables only through `@/shared/config/env`.
- Use Orval-generated API clients and `queryOptions`/`mutationOptions` wrappers.
- Mutation errors have one owner: the global handler by default. A local custom
  toast must first disable the global toast via query/mutation metadata.
- Use `useAppForm` with one Zod v4 schema and the shared `<Form form={form}>`
  wrapper; do not duplicate native submit boilerplate.
- Use DataGrid for API-backed tables and Skeleton for page/content loading.
- Use Base UI's `render` prop, never Radix's `asChild` pattern.

## TypeScript and code style

- No `any`; prefer `unknown`, generics, type guards, and `satisfies`.
- Avoid type assertions. At validated/generated boundaries, keep an unavoidable
  assertion local and explain the guarantee.
- Use `import type` for type-only imports.
- Infer schema-backed types with `z.infer`.
- No nested ternaries; always use braces for conditionals and loops.
- Use named component exports and interfaces for exported component props.
- Use relative imports inside one slice and `@/` imports across slices/layers.
- Prefix deliberately floating promises with `void`.

## Generated files

Never edit these by hand:

- `src/routeTree.gen.ts`
- `src/shared/api/admin/endpoints/**`
- `src/shared/api/admin/model/**`
- `src/shared/api/auth/endpoints/**`
- `src/shared/api/auth/model/**`

Regenerate API files with `bun run generate-api`. Generated output is not a
place for handwritten query wrappers, hooks, or business logic.

## Tests

- Always run existing tests relevant to changed behavior.
- Add a regression test for a bug fix when the behavior can be tested reliably.
- Add focused tests for non-trivial schemas, mappers, cache logic, and domain
  calculations. Do not add low-value snapshot tests for simple UI composition.
- If a non-trivial change has no test, state the concrete reason.

## Definition of Done

Use Bun commands only (`bun run`, `bunx`; never `npx`).

For code changes, run:

```bash
bun run check       # read-only format + lint verification
bun run typecheck
bun run test        # when tests exist for the affected behavior
```

Run `bun run build` for runtime, routing, SSR, dependency, or configuration
changes. Documentation-only changes do not require typecheck or build.

`bun run fix` modifies files. Use it only intentionally, review its scope, and
never let it rewrite unrelated work.
