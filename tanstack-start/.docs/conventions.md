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

- One component per file
- Props via `interface`, not `type`
- All imports via `@/` alias

## TypeScript

- `strict: true` is enforced — no workarounds
- Never use `any` — use `unknown` or proper generics
- Never use type assertions (`as X`) except when working with Orval-generated code where the shape is guaranteed
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

try {
  await mutation.mutateAsync(payload)
  toast.success('Сохранено')
} catch (e) {
  toast.error(getMessageFromError(e))
}
```

- Never use `e.message` directly — it won't handle Axios/API error shapes
- Always show `toast.success` after successful mutations — глобальный toast.error
  уже показывает ошибки (см. `.docs/error-handling.md`), но успех нужно
  подтверждать явно. Стандартная строка: `'Сохранено'` / `'Создано'` / `'Удалено'`.
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

Display-only logic (labels, badge variants, status mappers) lives in `*Presentation.ts` next to the component:

```ts
// checklistVersionPresentation.ts
export const VERSION_STATUS_LABELS: Record<ChecklistVersionStatus, string> = {
  draft: 'Черновик',
  active: 'Активна',
  archived: 'Архив',
}

export const getVersionStatusBadgeVariant = (status: ChecklistVersionStatus) => {
  if (status === 'active') return 'default'
  if (status === 'draft') return 'secondary'
  return 'outline'
}
```

Never hardcode display strings or status → style mappings inside JSX.

## Shared Utilities

Before writing a helper, check `@/shared/lib`:

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
