# Dependencies and runtime

Use Bun 1.4.3. `packageManager` controls the GitHub Actions runtime; the
development Docker image must use the same version. Keep both `bun.lock` and
`package-lock.json` aligned with the manifest: the Node Dockerfile uses npm ci.
Copy `vendor/` before dependency installation in either Dockerfile.

## Local braces security fix

The root `devDependencies.braces` uses `file:vendor/braces`, and
`overrides.braces` references it with `$braces`. This avoids resolving a relative
file path from a transitive consumer's directory. The private package is the
`@template/braces@3.0.3-hardened.0` fork. Upstream braces 3.0.3 has no published
fix for [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
The fork retains its MIT license and normal glob behavior, but rejects AST
nesting deeper than 128 before recursive parsing/compilation/expansion.
The provenance and mitigation limits are documented in `vendor/braces/README.md`.

## Local deepmerge security fix

`devDependencies.deepmerge` uses `file:vendor/deepmerge`, and
`overrides.deepmerge` references it with `$deepmerge`, in the same way as braces.
The private package is the `@template/deepmerge@4.3.1-hardened.0` fork.
Upstream deepmerge 4.3.1 has no published fix for
[GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4); shadcn,
`@shadcn/registry` and the `@svgr/*` plugins all require `^4.3.1`. The fork
copies the published CommonJS build and never writes an own `__proto__` key to
a merge result. The provenance and mitigation limits are documented in
`vendor/deepmerge/README.md`.

## Security suites for local forks

`bun run test` runs the application Vitest suite and the dedicated Bun
security suites (`scripts/braces-security.test.ts`,
`scripts/deepmerge-security.test.ts`). Verify fresh Bun and npm installs:
existing node_modules can contain unused upstream copies. Tests resolve each
fork from its actual transitive consumers (micromatch; shadcn, `@shadcn/registry`
and `@svgr/*`) to check that the override is effective.

Do not suppress the advisories or treat a clean registry audit as evidence that
a private fork is secure. Keep the regression tests and inspect the patch.
Replace each local fork when an upstream fixed release becomes available.

## Security patches for pinned transitive dependencies

The October 2026 audit requires shadcn 4.22.1 or newer within major 4; its
registry uses Zod 4, so the application does not need a global Zod major override.
Intlayer's config and backend-contract packages still pin Zod 4.6.5. Scoped
overrides keep their Zod dependency on the patched 4.6.7 release. Scalar's
json-magic package pins Undici 7.29.1; its scoped override uses patched Undici
7.30.1 and preserves major 7 for that consumer. Other Undici consumers retain
their own major versions. Express and body-parser (via shadcn's MCP SDK) resolve
qs 6.16.x, affected by GHSA-6pq8-jhm2-2vcw; the `qs` override pins patched
6.17.0 within major 6. Keep these rules in both package-manager lockfiles,
and remove each override when its parent dependency adopts a safe release.

These are dependency replacements, not advisory suppressions. Verify fresh
installs with both package managers and retain the existing audit gate.

## Verification

Run frozen installation, registry audits, check, typecheck, test and build.
Check the npm installation and Node build in an isolated directory too. Keep
Node type definitions on major 24 while Dockerfile.node uses Node 24.
The project uses stable TypeScript 6 and Vitest 5. Keep the standalone Bun
security suite excluded from Vitest, while retaining the existing script tests.
Keep TypeScript 6 for both application typechecking and the FSD checker's
JavaScript Compiler API; no native compiler or compatibility alias is used.
Nitro is pinned to `3.0.260903-beta`. Verify both Bun and Node presets and
production SSR when changing its beta version.
