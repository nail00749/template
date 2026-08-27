# Dialogs

Import from `@/shared/dialog`.

## Opening a Dialog

```tsx
import { useDialog } from '@/shared/dialog'
import { MyDialog } from './MyDialog'

const { open, close } = useDialog()

// Open
open(MyDialog, 'my-dialog-id', { someProp: value })

// Close
close('my-dialog-id')
```

## Dialog Component Pattern

A dialog component receives `onClose` via `DialogProps<T>` and returns `DialogContent` only — never wraps itself in `Dialog`.

```tsx
import type { DialogProps } from '@/shared/dialog'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'

export interface MyDialogProps {
  itemId: string
}

export function MyDialog({ itemId, onClose }: DialogProps<MyDialogProps>) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Заголовок</DialogTitle>
      </DialogHeader>

      {/* content */}

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Отмена
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
```

## Confirmation Flow

Use `ConfirmDialog` for all destructive actions:

```tsx
open(ConfirmDialog, 'confirm-delete', {
  title: 'Удалить запись?',
  description: 'Это действие необратимо.',
  onConfirm: () => mutation.mutateAsync(id),
})
```

## Rules

- Use `useDialog` — do not store local `open` state for business dialogs
- Dialog IDs must be stable string literals (not dynamic/random)
- Dialog component returns `DialogContent` only, never `<Dialog>`
- `onClose` comes from `DialogProps`, not a local state setter
- Use `ConfirmDialog` for all destructive confirmations
- In async confirms, `onConfirm` must return a Promise — `ConfirmDialog` will
  keep its loading state until it resolves and stay open if it rejects

## Async Confirm (mutation inside dialog)

Когда кнопка подтверждения запускает mutation, не закрывай диалог до завершения:

```tsx
open(ConfirmDialog, 'confirm-delete', {
  title: 'Удалить запись?',
  description: 'Это действие необратимо.',
  onConfirm: async () => {
    await deleteMutation.mutateAsync(id) // бросит — диалог не закроется
  },
})
```

`ConfirmDialog` сам показывает loading на кнопке подтверждения и закрывается
только после успешного `onConfirm`. Если `onConfirm` бросит, диалог останется
открытым и ошибку покажет глобальный `onError` (см. `.docs/api.md`).

Для собственных диалогов с формой:

```tsx
export function CreateItemDialog({ onClose }: DialogProps) {
  const form = useAppForm({
    // ...
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value)
      onClose() // закроет диалог
    },
  })

  return (
    <DialogContent>
      {/* form fields */}
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Отмена
        </Button>
        <form.AppForm>
          <form.SubmitButton>Сохранить</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </DialogContent>
  )
}
```

## Dialog width on mobile

`<DialogContent>` has `w-full max-w-[95vw]` by default, which gives a near-full-width dialog on phones. When you add a custom width, you must keep that mobile behavior — otherwise the dialog squeezes the content on narrow viewports.

Always prepend `max-w-[95vw]` and apply the original cap at the `sm` breakpoint:

```tsx
// Wrong — caps the dialog at 24rem on every viewport, including phones
<DialogContent className="max-w-sm">

// Right — 95vw on mobile, the original cap from sm and up
<DialogContent className="max-w-[95vw] sm:max-w-lg">
```

The same pattern applies to all sizes: `sm:max-w-xl`, `sm:max-w-2xl`, `sm:max-w-4xl`, etc.
