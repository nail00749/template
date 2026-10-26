# gvozdla architecture

Status: MVP implementation in this repository. The long-term design includes reverse
contributions; the current commands are `create`, `status`, and `update`.

## Goals and boundaries

gvozdla maintains a relationship between independently evolving projects and their Git
templates. A generated project has its own Git history. No shared Git ancestor is required.
The engine understands files and groups rather than React or a particular backend language.
The first template is the existing TanStack Start directory and its feature overlays.

One coordinating pipeline resolves sources, renders a template, plans changes, and applies
them. Terminal prompts and hosting-provider APIs stay outside the synchronization engine.
The existing `create-tanstack` entry point remains available as a legacy generator; it does
not create the new update state. New maintained projects must use `gvozdla create`.

## Modules

| Module                         | Responsibility                                                 |
| ------------------------------ | -------------------------------------------------------------- |
| `scaffold/core.ts`             | Git checkout, file rendering, declared feature overlays        |
| `scaffold/gvozdla/manifest.ts` | Strict manifest validation, path ownership, group dependencies |
| `scaffold/gvozdla/state.ts`    | Project/lock validation and content-addressed baseline objects |
| `scaffold/gvozdla/sync.ts`     | Initial state, local status, update planning and application   |
| `scaffold/gvozdla/cli.ts`      | Commands, flags, human and JSON output                         |

## Manifest and ownership

`template.manifest.json` belongs to the source repository. `schemaVersion: 1` describes
the format; `renderer: {"id":"gvozdla-files","version":1}` identifies rendering semantics.
`sourceRoot` is relative to that repository. The checked-in manifest is the executable
example of the supported schema.

A group contains `include` patterns, optional `exclude`, optional `requires`, and
`update: "merge" | "create-only"`. Patterns match paths relative to the generated project,
using Bun glob syntax. Dependencies are group IDs in the same manifest. Cycles, unknown
dependencies, unsafe paths, unsupported fields, and ambiguous ownership are errors.
Overlap is checked against actual rendered and tracked files, not a proof that arbitrary
glob expressions will never intersect in a future release. Every render is checked again.

Only files owned by a `merge` group receive baselines and updates. `create-only` and
unclaimed files are copied at creation and remain project-owned. A local file added under
a managed directory is not automatically adopted: it has no baseline. If a future template
introduces the same path with different contents, update reports an add/add conflict.

Features change the rendered file set; groups assign update ownership to its final paths.
The existing `scaffold/features/<id>/feature.json` format declares overlay overwrites.
Generation rejects competing overlay ownership. Stored file provenance points to either
the base source path or the selected overlay source path.

The initial template groups common UI, shared utilities, and development tooling. Generated
API clients, application pages, application environment configuration, `package.json`, and
dependency lockfiles are not managed in this MVP. Updating all of `shared` would incorrectly
claim application-specific API code. Tooling group paths are deliberately explicit.

Group dependencies are conservative: selecting a group includes its transitive dependencies
at the same target SHA. This is an update boundary, not a guarantee of runtime compatibility.
Removing/changing ownership of a tracked file or removing an existing group requires an
explicit future migration; the MVP fails closed instead of silently abandoning its baseline.

## Project state and versions

Commit the complete `.template/` directory alongside the application:

```text
.template/
  project.json          source, template identity, tracking ref, selected features
  lock.json             exact source revisions, manifest, renderer and per-file baselines
  objects/<sha256>      original bytes of managed template files
```

Project state has a format version. Template releases can use Git tags, but resolved commit
SHAs determine identity. The CLI package version, template revision, renderer version, and
state schema version have separate meanings. The MVP fetches a named branch or tag; it
records the resolved SHA. It does not yet implement a semantic-version release registry.

Each merge group stores its accepted source revision separately. Updating `ui` and `utils`
does not advance `tooling`. Per-file records include the group, baseline hash, source path,
and relevant file-mode information. Baselines contain rendered upstream bytes, never the
locally merged result. The manifest snapshot records the ownership rules used at that base.

Objects are stored locally and verified by SHA-256 before use. They make ordinary merging
independent of access to the old source repository or old rendering code. They duplicate
some application content; garbage collection and remote object storage are deferred.
Only selected template-owned files enter the baseline, not arbitrary project files/secrets.

Features are fixed for an update. Parameter substitution, feature reconfiguration, and
project-level custom exclusion rules are future schema extensions. Unsupported configuration
is rejected rather than accepted without effect. Never edit `lock.json` to mark an update
as accepted. The old `.template.json` is retained for compatibility, but is not the update
authority and does not contain enough information for automatic adoption of old projects.

## Creation

1. Resolve and fetch the requested Git branch/tag into a temporary checkout.
2. Validate the manifest, renderer and selected features.
3. Copy `sourceRoot` into a new target and apply declared feature overlays.
4. Determine managed ownership and provenance of final rendered files.
5. Save exact revisions and content-addressed baselines.
6. Optionally install dependencies and initialize a new Git repository.

Creation refuses an existing target. Rendering/state failures remove the incomplete target.
Dependency installation is explicitly selected and can execute package lifecycle scripts;
its failure leaves the created project available for inspection. No source Git history is
copied. Local source paths are saved as absolute paths so later commands are independent
of the caller's working directory.

## Status

`status` is offline by default. It compares tracked managed files to baseline objects and
reports local modifications/deletions with each group's accepted SHA. It does not claim
to inventory every application file, and it cannot detect upstream releases offline.

`status --remote` fetches the saved tracking ref and uses the update planner without applying
anything. `--json` emits a summary without baseline contents. Missing/corrupt objects or
invalid state are errors rather than an assumption that a file is unchanged.

## Update planning

For each selected group, compare:

- **B**: saved upstream baseline;
- **L**: current project contents;
- **N**: newly rendered upstream template.

| Condition                                             | Result                           |
| ----------------------------------------------------- | -------------------------------- |
| Only upstream changed                                 | Use N                            |
| Only project changed                                  | Keep L                           |
| Both changed identically                              | Keep the common result           |
| Both changed differently                              | Three-way text merge or conflict |
| Upstream removed an unchanged file                    | Delete it                        |
| Upstream removed a locally modified file              | Conflict                         |
| Project removed a file modified upstream              | Conflict                         |
| New upstream path occupied by different local content | Conflict                         |
| Divergent binary contents                             | Conflict                         |

Text merging uses Git's merge-file algorithm in a temporary directory. It does not use
shell interpolation or insert unresolved conflict markers into project files. Binary and
unsupported file-type/mode situations are handled conservatively. Renames are additions
and deletions in the MVP; filesystem topology changes can require a future migration.

`--dry-run` fetches and renders but does not mutate the project or create a branch. A plan
includes selected/dependency groups, target SHA, actions and conflicts. Any conflict blocks
the complete selected update and leaves files, baselines and group revisions untouched.

## Application and recovery

Application requires a clean Git worktree with an initial commit, rooted at the generated
project. A parent repository is insufficient. After planning, recheck file contents and
metadata to reject stale plans. Applicable updates create a fresh `feat/gvozdla-update-*`
branch and leave a reviewable uncommitted diff. gvozdla does not create commits or publish.
No-op updates do not create branches.

Successful acceptance advances only selected/dependency groups. The new baseline is N,
even where L contributed retained customizations. Saving the merged result as a baseline
would erase the distinction between project code and template code on subsequent updates.

The engine attempts in-process rollback on application errors. This is not a filesystem
transaction or crash-proof journal: power loss/process termination can leave a partial
application. The original committed Git state remains the recovery point. Inspect status
and diff before recovery; there is no automatic reset of user changes. Persistent pending
operations, `--continue`, and `--abort` are not implemented in the MVP.

Update never executes downloaded hooks or installs dependencies automatically. Run project
typechecks/tests after applying and before committing. A clean text merge is not a semantic
compatibility proof. Updating components that need new dependencies may need a manual
dependency change until structured ownership is implemented.

## Future structured ownership

`package.json` requires ownership of individual JSON pointers, not an entire file per UI
group. Each pointer has one group owner; old/current/new values use the same three-way
rules. Concurrent divergent dependency versions are conflicts rather than automatic
selection of the highest version. Lockfiles are regenerated with the package manager.
This schema and engine are intentionally not part of the MVP.

## Future reverse contributions

`contribute` will calculate selected project hunks relative to their stored baseline, map
them to source paths, and replay them onto the current template branch in an isolated
checkout. This uses B (baseline), P (selected project change), and T (current template).
Already-present changes produce no PR. Conflicts are resolved in the template checkout.

Direct file copies and direct overlays have reversible provenance. Files assembled from
multiple inputs or parameter substitutions require explicit reversible mappings or manual
export; global replacement of a project name is unsafe. Run template checks on the resulting
patch and show its final diff before an explicit PR/MR creation command. GitHub/GitLab
adapters publish an already-prepared result; they do not own merge logic. Creating a PR does
not advance project baselines; normal update accepts it after upstream integration.

## Deferred capabilities

- `contribute` and GitHub/GitLab publication adapters;
- adoption of projects with missing or uncertain baselines;
- template catalog, semantic-version channels and independently versioned components;
- parameter rendering and feature changes after creation;
- JSON-key ownership and dependency/lockfile coordination;
- explicit migrations for ownership moves, renames and incompatible state formats;
- persisted conflict resolution, operation journaling and concurrent-operation locking;
- trusted opt-in checks/hooks and standalone executables without a Bun runtime.

## Verification contract

Engine tests use local committed template repositories and independently committed generated
projects. They exercise creation/provenance, repeated and partial updates, local changes,
three-way merge/conflict behavior, additions/deletions, dependency expansion, baseline
integrity, path safety, and mutation guards. CLI tests cover parsing and actual subprocess
output/exit codes. Existing scaffold and authentication redirect tests remain in the root
test command. No production service or external Git hosting is required by these tests.
