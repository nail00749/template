# gvozdla

A Bun CLI to create projects from Git templates, inspect local changes, and merge selected
template updates. The first template is TanStack Start with optional feature overlays.
Requires Bun >= 1.2 and Git.

## Usage documentation

- [Руководство для пользователей](docs/gvozdla-guide.md): установка, первый проект,
  обновления, конфликты и устранение ошибок.
- [Инструкции для AI-агентов](docs/gvozdla-agents.md): воспроизводимые команды,
  JSON, коды завершения и правила работы с проектом.
- [Architecture](docs/gvozdla-architecture.md): manifest, baselines and merge design.

These guides describe the released gvozdla 0.1.0 commands. The new guide files will
also be included in the next npm release; the existing npm 0.1.0 archive is unchanged.

## Installation

With Bun and Git available on your PATH:

```bash
npm install -g gvozdla
gvozdla --version
gvozdla create ./my-app --template tanstack --init-git
```

The npm package contains the CLI and documentation. Template files are fetched from Git
when creating/updating a project. To run the CLI from this source checkout, use
`bun run gvozdla -- <command>` as shown below.

## Create a maintained project

```bash
git clone https://github.com/nail00749/template.git
cd template
bun install
bun run gvozdla -- create ./my-app --template tanstack --init-git
```

In a terminal, create asks for a missing target, feature selection, dependency installation,
and Git initialization. For scripts, pass a target and explicit flags:

```bash
bun run gvozdla -- create ./my-app \
  --repo https://github.com/nail00749/template.git \
  --ref main --feature keycloak-auth --no-install --init-git
```

The source ref must contain `template.manifest.json`. To use a custom template source,
pass `--repo /path/to/committed/repository` or a Git URL.
The generated project contains the template contents, selected overlays, compatibility
`.template.json`, and `.template/` baseline state. The source `.git` is not copied.

Commit the generated files **including `.template/`** before the first update. Dependency
installation is optional and may execute package lifecycle scripts.

## Inspect and update

Run the CLI from its checkout, selecting the generated project directory:

```bash
bun run gvozdla -- status --project ./my-app
bun run gvozdla -- status --project ./my-app --remote --json
bun run gvozdla -- update --project ./my-app --only ui,tooling --dry-run
bun run gvozdla -- update --project ./my-app --only ui,tooling
```

Alternatively, run `bun /absolute/path/to/template/scaffold/gvozdla/cli.ts status` from the
generated project's root. `gvozdla` is also the package's binary entry point when linked.

`status` is offline by default. `--remote` compares the current tracking ref. Update expands
group dependencies, performs three-way merging, and preserves nonconflicting local edits.
`--ref <branch-or-tag>` selects a source for this operation without changing the tracking ref.
Use `--json` for machine-readable summaries. Exit codes: 0 success, 1 error, 2 conflicts.

Applying updates requires a clean Git repository rooted at the generated project with an
initial commit. Updates create a `feat/gvozdla-update-*` branch and leave an uncommitted diff
for review. Conflicts block the complete update without changing project files or baselines.
There is no interactive conflict continuation in this MVP. Run your project checks and review
the diff before committing; template hooks and dependency installs do not run on update.

The checked-in manifest manages `ui`, `utils`, and `tooling`; `ui` also updates `utils`.
API clients, application pages/configuration, package dependencies and lockfiles remain
project-owned. Groups are update boundaries, not a runtime compatibility guarantee.

See [architecture and MVP boundaries](docs/gvozdla-architecture.md) for the manifest,
versioning, baseline, conflict and future reverse-contribution design. `contribute`, `adopt`,
structured JSON ownership and automatic migrations are future work.

## Feature overlays

The first available feature is `keycloak-auth`. It adds a backend-owned OIDC login flow with a
validated return-to path for protected routes. Its backend contract and production requirements
are written into `.docs/auth.md` in the generated project.

## Legacy scaffold compatibility

The original entry point still works, but creates only legacy `.template.json` provenance.
It does not initialize update baselines; use `gvozdla create` for maintained projects.

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
