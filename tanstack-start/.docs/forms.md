# Forms

Import from `@/shared/form`.

## Required Pattern

```tsx
import { Form, useAppForm } from '@/shared/form'
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
  <Form form={form}>
    <form.AppField name="name">{(field) => <field.TextFieldForm label="Название" />}</form.AppField>

    <form.SubmitButton>Сохранить</form.SubmitButton>
  </Form>
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

  return <Form form={form}>...</Form>
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
import { Form, useAppForm } from '@/shared/form'
import { AddressFields } from './address-fields'
import { profileFormOpts } from './profile-form-options'

export function ProfileForm() {
  const form = useAppForm({
    ...profileFormOpts,
    onSubmit: async ({ value }) => {
      await saveProfile(value)
    },
  })

  return (
    <Form form={form}>
      <form.AppField name="fullName">
        {(field) => <field.TextFieldForm label="Full name" />}
      </form.AppField>
      <AddressFields form={form} />

      <form.SubmitButton>Save</form.SubmitButton>
    </Form>
  )
}
```

`AddressFields` receives the existing form instance and uses nested field
names such as `address.city`. Other sections (`EmergencyContactFields`,
`BillingFields`, etc.) follow the same pattern. The parent owns submission;
child sections must not create their own form or duplicate validation.

## Available Field Components

| Component                | Usage               |
| ------------------------ | ------------------- |
| `TextFieldForm`          | Текстовый input     |
| `NumberFieldForm`        | Число               |
| `TextAreaForm`           | Многострочный текст |
| `SelectFieldForm`        | Выпадающий список   |
| `CheckboxForm`           | Чекбокс             |
| `DatePickerForm`         | Дата                |
| `ComboboxFieldForm`      | Combobox с поиском  |
| `AsyncComboboxFieldForm` | Server-side поиск   |
| `FileFieldForm`          | Загрузка файла      |
| `RadioGroupForm`         | Radio-группа        |
| `FieldArrayForm`         | Повторяемые поля    |

Перед использованием проверь `@/shared/form/index.ts` — список может пополняться.

## Numeric fields

Use `NumberFieldForm` for numeric form values. Its field value is always
`number | null`; intermediate input such as `-` remains editable without leaking
a string into form state. Use `mode="integer"` when decimal separators are not
allowed:

```tsx
const schema = z.object({
  amount: z.number().positive().nullable().refine((value) => value !== null, {
    message: 'Обязательное поле',
  }),
  count: z.number().int().nonnegative().nullable().refine((value) => value !== null, {
    message: 'Обязательное поле',
  }),
})

const defaultValues = {
  amount: null,
  count: null,
}

<form.AppField name="amount">
  {(field) => <field.NumberFieldForm label="Сумма" />}
</form.AppField>
<form.AppField name="count">
  {(field) => <field.NumberFieldForm label="Количество" mode="integer" />}
</form.AppField>
```

The Zod schema owns required, range, and business validation. Numeric form state
contains only `number | null`, never a numeric string. Do not use `valueType` on
`TextFieldForm` or call `Number(...)` again in `onSubmit`.

## Combobox and radio bindings

`ComboboxFieldForm` provides the controlled field props to a dedicated reusable
combobox. Forward all of them to preserve value, blur validation, labels, and
accessibility:

```tsx
<form.AppField name="contractTypeId">
  {(field) => (
    <field.ComboboxFieldForm label="Тип договора">
      {(fieldProps) => <ContractTypeSelect {...fieldProps} />}
    </field.ComboboxFieldForm>
  )}
</form.AppField>
```

`RadioGroupForm` requires a group `label` and accepts string values. Keep option
values stable and map them to API-specific representations at the request
boundary when necessary.

## Form error summary

Place `form.FormErrorSummary` near the beginning of long forms. It appears only
after a failed submit, links each error to its field, and the shared `Form`
focuses the first invalid control automatically:

```tsx
<Form form={form}>
  <form.FormErrorSummary getFieldLabel={(fieldName) => fieldLabels[fieldName] ?? fieldName} />

  {/* fields */}
</Form>
```

Use stable field names as component `id` values. For array fields, the label
mapper must understand names such as `participants[0].name`. Do not add a second
toast for validation errors.

## Async combobox

The feature owns TanStack Query, option mapping, and pagination. The shared
field owns debouncing and loading/error/empty UI:

```tsx
const contracts = useContractOptions()

<form.AppField name="contractId">
  {(field) => (
    <field.AsyncComboboxFieldForm
      label="Договор"
      options={contracts.options}
      selectedOption={contracts.selectedOption}
      isLoading={contracts.isLoading}
      isFetching={contracts.isFetching}
      errorMessage={contracts.errorMessage}
      hasNextPage={contracts.hasNextPage}
      isLoadingMore={contracts.isFetchingNextPage}
      onSearchValueChange={contracts.setSearch}
      onLoadMore={() => void contracts.fetchNextPage()}
    />
  )}
</form.AppField>
```

`onSearchValueChange` receives an already debounced value. Keep the selected
option available through `selectedOption` when it is not present in the current
result page. Never make API requests directly from the shared field.

## Field arrays

Use `mode="array"` and provide a stable UI key. Do not use the array index as a
React key because remove/reorder operations would move local component state:

```tsx
<form.AppField
  name="participants"
  mode="array"
>
  {(field) => (
    <field.FieldArrayForm
      label="Участники"
      itemLabel="Участник"
      addLabel="Добавить участника"
      createItem={() => ({ clientId: crypto.randomUUID(), name: '' })}
      getItemKey={(item) => item.clientId}
      minItems={1}
    >
      {({ index }) => (
        <form.AppField name={`participants[${index}].name`}>
          {(nameField) => <nameField.TextFieldForm label="ФИО" />}
        </form.AppField>
      )}
    </field.FieldArrayForm>
  )}
</form.AppField>
```

Strip UI-only keys in the feature request mapper. `FieldArrayForm` owns add,
remove, and reorder controls; the feature owns item fields and API mapping.

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
- Always render fields and submit controls inside `<Form form={form}>`. It owns
  the native submit event, TanStack form context, and `noValidate`; do not
  duplicate `preventDefault()` or call `form.handleSubmit()` from JSX
- Use `validators.onSubmit` by default — no client-side `parse`/`safeParse` for validation
- Use `validators.onChange` when a field renders validation state reactively, including `FileFieldForm`
- Always `mutateAsync` inside `onSubmit`, never `mutate`
- Do not catch `mutateAsync` only to repeat the global error toast. For a custom
  field/toast error, first set `meta: { disableToast: true }` on the mutation;
  see `.docs/error-handling.md`
- Type `defaultValues` with `satisfies FormValues` or explicit type annotation
- Initialize text/select/combobox/radio fields with `''`, booleans with `false`,
  and number/date/file fields with `null`; never switch a field between
  uncontrolled and controlled modes
- Render `form.SubmitButton` inside the shared `Form`
- Use `form.FormErrorSummary` for long forms; do not duplicate its error list or
  focus behavior locally
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
