# Dependency Modernization Implementation Plan

> **Spec:** In-chat design approved by the user on 2026-09-02. Preserve all development-tool dependencies, especially `@tanstack/react-form-devtools`.

**Goal:** Restore a reproducible green baseline, migrate supported dependencies to current compatible releases, and add automated dependency/CI safeguards without removing devtools.

**Architecture:** Recover the repository's own lost auth/admin sources from local Git objects and regenerate API clients from the recovered OpenAPI snapshot. Keep each dependency major isolated and verified so it can be reverted independently. Treat TypeScript 7 as blocked unless every compiler-API consumer supports it.

**Tech stack:** Bun 1.4, React 19, TanStack Start/Form/Table, Vite, Vitest, TypeScript, Nitro, Orval, GitHub Actions, Renovate.

---

## Task 1: Restore the green baseline

**Files:**

- Temporarily recover and then remove: `src/shared/api/openapi.json`
- Create: lost handwritten files under `src/features/auth/` and `src/features/admin/`
- Regenerate: `src/features/*/api/endpoints/` and `src/features/*/api/model/`

1. Map each unreachable Git blob to its original path and distinguish handwritten from generated sources.
2. Temporarily restore the OpenAPI snapshot and handwritten sources with `apply_patch`.
3. Run `bun run generate-api` rather than hand-editing generated clients, then remove the snapshot and require `OPENAPI_URL` for future regeneration.
4. Run `bun run check`, `bun run typecheck`, `bun run test`, and `bun run build`; fix only evidence-backed recovery regressions.

## Task 2: Finish the safe dependency cleanup

**Files:**

- Modify: `package.json`
- Modify: `bun.lock`

1. Preserve all devtool dependencies.
2. Keep the already verified removals of `react-dropzone` and `web-vitals`.
3. Keep stable Nitro, Form, jsdom, and formatter upgrades.
4. Verify a frozen install and `bun audit`.

## Task 3: Migrate TanStack Table v8 to v9

**Files:**

- Modify: `src/shared/ui/DataGrid.test.tsx`
- Modify: `src/shared/ui/DataGrid.tsx`
- Modify: `src/shared/hooks/use-data-grid-sorting.ts` if v9 types require it
- Modify: `src/app/app.d.ts`
- Modify: `.docs/datagrid.md`
- Modify: `package.json`
- Modify: `bun.lock`

1. Add characterization coverage for controlled sorting and server pagination.
2. Upgrade only `@tanstack/react-table` and install v9.
3. Replace `useReactTable` with `useTable`, register the exact sizing/resizing/sorting/pagination features, and update feature-aware generics.
4. Update the documented import/type examples.
5. Run focused tests, typecheck, full tests, and build.

## Task 4: Modernize TypeScript within ecosystem support

**Files:**

- Modify: `package.json`
- Modify: `bun.lock`
- Modify: TypeScript configuration or source only for compiler-confirmed incompatibilities

1. Align the manifest with the already resolved TypeScript 5.9 baseline.
2. Upgrade TypeScript alone to the latest compatible 6.x release.
3. Run all verification gates and make only compiler-required fixes.
4. Do not install TypeScript 7 while Orval/TypeDoc or other compiler-API consumers do not support its native compiler architecture; record that as a deferred boundary rather than forcing an incompatible upgrade.
5. Keep Node/Bun ambient types aligned with the actual Bun production runtime; do not blindly move `@types/node` beyond supported consumers.

## Task 5: Add dependency automation and CI gates

**Files:**

- Create: `.github/workflows/ci.yml`
- Create: `renovate.json5`
- Modify: runtime version metadata if required for reproducibility

1. Pin the CI Bun version used by the verified local toolchain.
2. Add frozen install, audit, format/lint, typecheck, test, and production build jobs with non-secret validation environment values.
3. Configure Renovate for Bun lockfile maintenance, grouped non-major updates, and separate major upgrades.
4. Validate YAML/JSON5 structure and run the same commands locally.

## Task 6: Final regression review

1. Review the complete diff for accidental source, route, generated-file, or devtool removal.
2. Run `bun install --frozen-lockfile --ignore-scripts`, `bun audit`, `bun run check`, `bun run typecheck`, `bun run test`, and `bun run build`.
3. Have a read-only reviewer inspect correctness, security, regressions, and missing tests.
4. Report completed upgrades and explicitly list compatibility-deferred items.
