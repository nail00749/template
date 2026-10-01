# TanStack project scaffold

The repository contains a Bun CLI that fetches `tanstack-start` from Git and applies optional,
versioned feature overlays. The generated project contains only the contents of `tanstack-start`,
the selected overlays, and a `.template.json` provenance file; the source repository `.git` and
other root directories are not copied.

## Interactive use

```bash
git clone https://github.com/nail00749/template.git
cd template
bun install
bun run create
```

The CLI asks for the target directory, displays features discovered in `scaffold/features` as a
checkbox list, and asks whether to install dependencies and initialize a fresh Git repository.
Use the arrow keys to move, Space to toggle features, and Enter to confirm.

The first available feature is `keycloak-auth`. It adds a backend-owned OIDC login flow with a
validated return-to path for protected routes. Its backend contract and production requirements
are written into `.docs/auth.md` in the generated project.

## Non-interactive use

```bash
bun run create -- ./my-app \
  --feature keycloak-auth \
  --install \
  --init-git
```

Use another source or a pinned branch/tag when needed:

```bash
bun run create -- ./my-app \
  --repo https://github.com/nail00749/template.git \
  --ref main \
  --feature keycloak-auth \
  --no-install \
  --no-init-git
```

Run `bun run create -- --help` for all flags. In a non-interactive environment, the target is
required; dependency installation and Git initialization default to off unless explicitly
enabled.

## Adding a feature

Each feature is an overlay with this structure:

```text
scaffold/features/<feature-id>/
├── feature.json
└── overlay/
    └── <paths relative to tanstack-start>
```

`feature.json` provides the CLI label and description. Its `overwrites` list must name every
existing template file that the overlay intentionally replaces. Undeclared overwrites, unknown
features, unsafe paths, symbolic links, and existing target directories stop generation.

Verify the scaffold itself with:

```bash
bun run test
```
