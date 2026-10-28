---
name: review
description: >
  Review changes in the tanstack-start frontend against the project contracts
  before a commit or pull request. Use when asked to review, self-check or
  verify a diff, branch or PR, or before reporting a task as done.
---

# Review

Review the change, not the whole codebase. Report findings with file and line;
do not fix unasked.

## Steps

1. Collect the diff: `git diff` and `git diff --staged` for local work,
   `git diff main...HEAD` for a branch.
2. Classify each changed file and load the checklist of the matching skill:

   | Changed area                                   | Checklist from              |
   | ---------------------------------------------- | --------------------------- |
   | `src/routes/**`, new page/widget slice         | `new-screen`                |
   | `entities/*/api/**`, keys, query/mutation use  | `api-query`                 |
   | `useAppForm`, `*form*`                         | `form`                      |
   | `DataGrid`, columns, list search schema        | `datagrid-table`            |
   | `useDialog`, `DialogContent`, `ConfirmDialog`  | `dialog`                    |
   | `FileFieldForm`, `buildFormData`               | `file-upload`               |
   | `package.json`, lockfiles, Docker, `vendor/`   | `dependency-update`         |
   | `*.test.ts(x)` or a bug fix                    | `testing`                   |

3. Check every change against the always-on rules:
   - "Architecture invariants", "Runtime invariants" and "TypeScript and code
     style" in `AGENTS.md`;
   - one owner per error ([.docs/error-handling.md](../../../.docs/error-handling.md));
   - user-facing text in `*.content.ts` with `ru` and `en` ([.docs/i18n.md](../../../.docs/i18n.md));
   - no edits to generated files.
4. Check that `.docs/*` and the matching skill were updated when a rule changed.
5. Run the Definition of Done commands from `AGENTS.md` for the changed behavior.

## Report

Group findings by severity:

- **Must fix** — contract violation, bug, failing check, missing regression test.
- **Should fix** — duplication of an existing shared utility, unclear ownership.
- **Note** — optional improvements.

End with the commands that were run and their results. If nothing is found,
say so and list what was checked.
