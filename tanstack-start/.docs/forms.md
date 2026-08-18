# Forms

Import from `@/shared/form`.

## Required Pattern

```tsx
import { useAppForm } from '@/shared/form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  name: '',
}

const form = useAppForm({
  defaultValues,
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => {
    await mutation.mutateAsync(value)
  },
})

return (
  <form
    onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }}
  >
    <form.AppField name="name">{(field) => <field.TextFieldForm label="Название" />}</form.AppField>

    <form.AppForm>
      <form.SubmitButton>Сохранить</form.SubmitButton>
    </form.AppForm>
  </form>
)
```

## Available Field Components

| Component           | Usage               |
| ------------------- | ------------------- |
| `TextFieldForm`     | Текстовый input     |
| `TextAreaForm`      | Многострочный текст |
| `SelectFieldForm`   | Выпадающий список   |
| `CheckboxForm`      | Чекбокс             |
| `DatePickerForm`    | Дата                |
| `ComboboxFieldForm` | Combobox с поиском  |

## Shared Schema Primitives

Use `requiredString` from `@/shared/lib/schemas` for non-empty string fields:

```ts
import { requiredString } from '@/shared/lib/schemas'

const schema = z.object({
  name: requiredString,
  label: requiredString.max(50, { message: 'Максимум 50 символов' }),
  description: z.string(), // optional — plain z.string() is fine
})
```

Never write `z.string().min(1, { message: 'Обязательное поле' })` manually.

## Rules

- Always use `useAppForm`, not raw `useForm`
- Use `validators.onSubmit` by default — no client-side `parse`/`safeParse` for validation
- Use `validators.onChange` when a field renders validation state reactively, including `FileFieldForm`
- Always `mutateAsync` inside `onSubmit`, never `mutate`
- Type `defaultValues` with `satisfies FormValues` or explicit type annotation
- Wrap `SubmitButton` in `form.AppForm`
- One Zod schema per form — it's the single source of truth
- Use `requiredString` for required string fields — not raw `z.string().min(1)`
