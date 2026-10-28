---
name: dependency-update
description: >
  Update dependencies, Bun, Node, Nitro or TypeScript in the tanstack-start
  frontend, or handle a dependency security advisory. Covers both lockfiles,
  the vendored braces fork, scoped overrides and the verification matrix.
---

# Dependency update

Contract (authoritative): [.docs/dependencies.md](../../../.docs/dependencies.md).
Background for larger upgrades: [docs/dependency-modernization-guide.md](../../../docs/dependency-modernization-guide.md).

## Steps

1. Read the current overrides and the `vendor/braces` notes before changing
   versions; do not remove an override until its parent ships a safe release.
2. Update `package.json`, then refresh both `bun.lock` and `package-lock.json`.
3. Bun version changes: update `packageManager` and the development Docker
   image together.
4. Nitro beta changes: verify both Bun and Node presets and production SSR.

## Checklist

- [ ] `bun.lock` and `package-lock.json` match the manifest
- [ ] Node types stay on the Dockerfile.node major
- [ ] No advisory suppressed; braces regression tests kept
- [ ] Fresh Bun and npm installs verified, npm/Node build in an isolated directory

## Verify

```bash
bun install --frozen-lockfile
bun audit
bun run check
bun run typecheck
bun run test
bun run build
```
