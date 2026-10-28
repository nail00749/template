---
name: dialog
description: >
  Open or build a dialog in the tanstack-start frontend with useDialog and
  DialogContent: confirmation of destructive actions with ConfirmDialog,
  async confirms that run a mutation, dialogs with forms, dialog width.
---

# Dialog

Contracts (authoritative, read before writing code):

- [.docs/dialogs.md](../../../.docs/dialogs.md) — provider, component pattern, async confirm
- [.docs/ui.md](../../../.docs/ui.md) — shared UI primitives
- Dialog with a form: also the `form` skill

## Steps

1. Destructive action: `open(ConfirmDialog, '<stable-id>', { title, description, onConfirm })`
   where `onConfirm` returns the `mutateAsync` promise.
2. Custom dialog: a component taking `DialogProps<Props>` that returns
   `DialogContent` only; close through the provided `onClose`.
3. Open it with `useDialog().open(Component, '<stable-id>', props)`.
4. Form in a dialog: `await mutation.mutateAsync(value)` then `onClose()` in `onSubmit`.

## Checklist

- [ ] No local `open` state for business dialogs
- [ ] Dialog IDs are stable string literals
- [ ] Component never renders `<Dialog>` itself
- [ ] Custom width keeps `max-w-[95vw]` and applies the cap at `sm:`
- [ ] Cancellation logic runs on real cancel events, not effect cleanup
- [ ] Mutation errors are left to the global handler

## Verify

```bash
bun run check
bun run typecheck
```
