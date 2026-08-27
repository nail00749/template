# Forms

Import from `@/shared/form`.

## Required Pattern

```tsx
import { useAppForm } from '@/shared/form'
import { requiredString } from '@/shared/lib/schemas'
import { z } from 'zod'

const schema = z.object({
  name: requiredString,
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

## Edit Forms (async defaults)

При редактировании сущности форму нужно заполнить данными с сервера. Порядок:

1. Пока данные грузятся — показывай `Skeleton` под layout формы.
2. Когда данные пришли — монтируй форму с `defaultValues` из query.

```tsx
export function EditItemPage({ itemId }: Props) {
  const { data: item, isLoading } = useQuery(itemQueries.detail(itemId))

  if (isLoading || !item) {
    return <EditItemFormSkeleton />
  }

  return <EditItemForm item={item} />
}

function EditItemForm({ item }: { item: Item }) {
  const form = useAppForm({
    defaultValues: {
      name: item.name,
      status: item.status,
    } satisfies FormValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({ id: item.id, ...value })
    },
  })

  return <form>...</form>
}
```

Правила:

- **Не используй** `form.reset()` в `useEffect` при смене query-данных — вместо
  этого монтируй форму через key (`<EditItemForm key={item.id} item={item} />`)
  или в отдельном компоненте, который создаётся после загрузки.
- **Не создавай** форму с пустыми defaultValues и потом не заполняй её — это
  ломает `validators.onSubmit` (Zod сравнит с дефолтами).
- При сабмите — всегда `mutateAsync`, потом `toast.success` +
  `void queryClient.invalidateQueries({ queryKey: entityKeys.all })` (обычно
  делается в `onSuccess` mutation).

## Composite Forms

For a large form, split only the UI into meaningful sections. Keep one schema,
one set of `defaultValues`, and one `formOptions` object for the whole form.
Do not create a separate `useForm` or repeat a large `FormValues` type for each
section. Types are inferred from the schema and options.

```tsx
// profile-form-options.ts
import { formOptions } from '@tanstack/react-form'
import { requiredString } from '@/shared/lib/schemas'
import { z } from 'zod'

export const profileSchema = z.object({
  fullName: requiredString,
  email: requiredString,
  address: z.object({
    city: requiredString,
    street: requiredString,
  }),
  emergencyContact: z.object({
    name: requiredString,
    phone: requiredString,
  }),
})

export const profileFormOpts = formOptions({
  defaultValues: {
    fullName: '',
    email: '',
    address: { city: '', street: '' },
    emergencyContact: { name: '', phone: '' },
  } satisfies z.infer<typeof profileSchema>,
  validators: { onSubmit: profileSchema },
})
```

```tsx
// address-fields.tsx
import { withForm } from '@/shared/form'
import { profileFormOpts } from './profile-form-options'

export const AddressFields = withForm({
  ...profileFormOpts,
  render: ({ form }) => (
    <fieldset>
      <legend>Address</legend>
      <form.AppField name="address.city">
        {(field) => <field.TextFieldForm label="City" />}
      </form.AppField>
      <form.AppField name="address.street">
        {(field) => <field.TextFieldForm label="Street" />}
      </form.AppField>
    </fieldset>
  ),
})
```

```tsx
// profile-form.tsx
import { useAppForm } from '@/shared/form'
import { AddressFields } from './address-fields'
import { profileFormOpts } from './profile-form-options'

export const ProfileForm = () => {
  const form = useAppForm({
    ...profileFormOpts,
    onSubmit: async ({ value }) => {
      await saveProfile(value)
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="fullName">
        {(field) => <field.TextFieldForm label="Full name" />}
      </form.AppField>
      <AddressFields form={form} />

      <form.AppForm>
        <form.SubmitButton>Save</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
```

`AddressFields` receives the existing form instance and uses nested field
names such as `address.city`. Other sections (`EmergencyContactFields`,
`BillingFields`, etc.) follow the same pattern. The parent owns submission;
child sections must not create their own form or duplicate validation.

## Available Field Components

| Component           | Usage               |
| ------------------- | ------------------- |
| `TextFieldForm`     | Текстовый input     |
| `TextAreaForm`      | Многострочный текст |
| `SelectFieldForm`   | Выпадающий список   |
| `CheckboxForm`      | Чекбокс             |
| `DatePickerForm`    | Дата                |
| `ComboboxFieldForm` | Combobox с поиском  |
| `FileFieldForm`     | Загрузка файла      |
| `RadioGroupForm`    | Radio-группа        |

Перед использованием проверь `@/shared/form/index.ts` — список может пополняться.

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
- For form loading states, follow the common `Skeleton` loading rule from
  `.docs/ui.md` and match the final form layout
- After creating an entity, navigate to its detail page when that route exists;
  do not leave the user on the empty create form
- For edit forms — mount the form only after the entity loads; never
  `form.reset()` in `useEffect` (см. «Edit Forms» выше)
- Form on modal vs page: use a dialog form when the create/edit is a quick
  action from a list (1–3 fields, fits in a dialog); use a page form when the
  entity is large (multiple sections), needs its own URL, or has complex
  dependencies between fields
