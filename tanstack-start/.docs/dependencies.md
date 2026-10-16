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

`bun run test` runs both the application Vitest suite and the dedicated Bun
security suite. Verify fresh Bun and npm installs: existing node_modules can
contain unused upstream copies. Tests resolve braces from its actual micromatch
consumer to check that the override is effective.

Do not suppress the advisory or treat a clean registry audit as evidence that
the private fork is secure. Keep the regression tests and inspect the patch.
Replace the local fork when an upstream fixed release becomes available.

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
