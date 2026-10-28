---
name: git-workflow
description: >
  Create a branch, write a commit message or prepare a pull request in this
  repository. Use whenever the user asks for a git operation; it defines the
  branch naming and the [TICKET-ID] commit message format.
---

# Git workflow

Contract (authoritative): [.docs/git.md](../../../.docs/git.md).

Run git operations only when the user asks for them.

## Steps

1. Ask for the tracker ticket ID when it is not given. Without a ticket use
   `[NO-TICKET]` in commits.
2. Branch: `feature/{TICKET-ID}/{short_description}` or
   `fix/{TICKET-ID}/{short_description}`; `fix/{short_description}` only when
   no ticket exists.
3. Before committing run the Definition of Done checks from `AGENTS.md` for the
   changed behavior and stage only the files of this change.
4. Commit message: `[{TICKET-ID}] {description}` — uppercase ID in brackets,
   short English description starting with a verb.

## Checklist

- [ ] Ticket ID uppercase and in square brackets
- [ ] Description in English
- [ ] Unrelated working-tree changes are not staged
