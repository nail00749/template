# Code Conventions

## Required

- No nested ternaries
- Always use braces for conditionals and loops — no inline/brace-less bodies. The body always goes in a `{}` block on its own lines, for `if`, `else`, `for`, `while` and every other construct. Never `if (x) doThing()` on one line.

```ts
// Wrong
if (isEmpty) return null
for (const item of items) process(item)

// Correct
if (isEmpty) {
  return null
}
for (const item of items) {
  process(item)
}
```

- One exported component per file. Small private render helpers may stay
  co-located when they have no independent responsibility.
- Exported component props use `interface`, not `type`.
- Use relative imports inside one feature/widget/shared module. Use `@/` for
  imports across slices or layers. External packages keep package imports.

## TypeScript

- `strict: true` is enforced — no workarounds
- Never use `any` — use `unknown` or proper generics
- Avoid type assertions (`as X`). At a validated/generated boundary, keep an
  unavoidable assertion local and document the runtime guarantee.
- `noUnusedLocals` and `noUnusedParameters` are enforced — remove dead code.
  Underscore-prefix (`_payload`, `_result`) разрешён **только** для обязательных
  позиционных параметров callback-функций (например, `onSuccess: (_r, _p) => ...`),
  где сигнатура фиксирована библиотекой. Для собственных функций — просто убери
  неиспользуемый параметр.
- Infer types from Zod schemas: `type FormValues = z.infer<typeof schema>`
- Import types with `import type` when the value is only used as a type

## CSS

Allowed:

- Tailwind utility classes
- `cn()` helper for conditional classes
- CSS modules for complex or reused styles

Avoid:

- Inline `style` objects
- `style` tags inside JSX

## Error Handling & Notifications

Use `sonner` for toasts. Always extract error messages via `getMessageFromError`:

```ts
import { toast } from 'sonner'
import { getMessageFromError } from '@/shared/lib/utils'

await mutation.mutateAsync(payload)
toast.success('Сохранено')
```

- Never use `e.message` directly — it won't handle Axios/API error shapes.
- Mutation errors use the global toast by default. A local error toast is
  allowed only after `meta: { disableToast: true }`; see
  `.docs/error-handling.md`.
- Show `toast.success` after successful user-visible mutations. Standard text:
  `'Сохранено'` / `'Создано'` / `'Удалено'`.
- For floating promises (e.g. `invalidateQueries`), prefix with `void`:

```ts
void context.client.invalidateQueries({ queryKey: legalKeys.all })
```

## Date Formatting

Always use `formatDate` + `DATE_FORMATS` from `@/shared/lib/formatDate`:

```ts
import { formatDate, DATE_FORMATS } from '@/shared/lib/formatDate'

formatDate(item.created_at, DATE_FORMATS.DATE_TIME) // '24.01.2025 14:30'
formatDate(item.created_at, DATE_FORMATS.SHORT_DATE) // '24.01.2025'
formatDate(item.created_at, DATE_FORMATS.FULL_DATE) // '24 января 2025'
```

Never call `date-fns/format` directly or use `toLocaleDateString()`.

## Presentation Files

Data-driven display logic (enum/status label maps, badge variants, repeated
option arrays) lives in `*Presentation.ts` next to the component:

```ts
// checklistVersionPresentation.ts
export const VERSION_STATUS_LABELS: Record<ChecklistVersionStatus, string> = {
  draft: 'Черновик',
  active: 'Активна',
  archived: 'Архив',
}

export const getVersionStatusBadgeVariant = (status: ChecklistVersionStatus) => {
  if (status === 'active') {
    return 'default'
  }
  if (status === 'draft') {
    return 'secondary'
  }
  return 'outline'
}
```

Do not hardcode enum/status mappings inside JSX. Ordinary one-off UI copy such
as a button label or page heading may remain in JSX.

## Shared Utilities

Before writing a helper, check `@/shared/lib`:

Do not add unrelated helpers to `utils.ts`. Prefer a focused module when a new
utility has its own responsibility.

| Utility                 | Import                    | Use for                         |
| ----------------------- | ------------------------- | ------------------------------- |
| `cn()`                  | `@/shared/lib/utils`      | Conditional Tailwind classes    |
| `getMessageFromError()` | `@/shared/lib/utils`      | API/Axios error → string        |
| `downloadFile()`        | `@/shared/lib/utils`      | Trigger file download from Blob |
| `formatFileSize()`      | `@/shared/lib/utils`      | Bytes → human-readable string   |
| `formatDate()`          | `@/shared/lib/formatDate` | Date → localised string         |
| `DATE_FORMATS`          | `@/shared/lib/formatDate` | Predefined format strings       |
| `requiredString`        | `@/shared/lib/schemas`    | Zod schema for non-empty string |

## Shared Hooks

Before rolling your own debounce / throttle / media-query logic in a component, check `@/shared/hooks`:

| Hook                | Import                                 | Use for                                                                                                  |
| ------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `useDebouncedValue` | `@/shared/hooks/use-debounced-value`   | Debounce any value (search input, slider, etc.). Trailing edge, cleans up on unmount, defaults to 250ms. |
| `useIsMobile`       | `@/shared/hooks/use-mobile`            | `true` below 768px viewport width                                                                        |
| `useDataGridState`  | `@/shared/hooks/use-data-grid-sorting` | DataGrid pagination / sorting state bound to URL                                                         |

## Component Structure

```tsx
// 1. imports
// 2. interface Props
// 3. export function Component({ ... }: Props)
```

No default exports for components — always named exports.

## Page and Hook Structure

- Keep non-presentational logic separate from page JSX in a co-located
  `use<Feature>` hook when that logic is non-trivial.
- The page component should call the hook and render its own JSX. Do not add a
  proxy component that only forwards hook output to `<PageName>View`.
- Do not create `<PageName>View` automatically. Use a separate View component
  only when it is reused or when splitting a genuinely large page makes the
  code clearer.
- Do not extract trivial local UI state or one-line handlers into a hook just
  to satisfy the naming convention.

```tsx
// Preferred
export function CreatePostPage() {
  const { form, isPending } = useCreatePost()

  return (
    <CreatePostForm
      form={form}
      isPending={isPending}
    />
  )
}
```
