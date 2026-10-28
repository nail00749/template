---
name: form
description: >
  Build or change a form in the tanstack-start frontend with useAppForm, the
  shared <Form> wrapper, Zod v4 schemas and shared field components. Use for
  create/edit forms, composite forms with withForm, numeric, combobox, async
  combobox, radio and field-array fields, and form submit/error behavior.
---

# Form

Contracts (authoritative, read before writing code):

- [.docs/forms.md](../../../.docs/forms.md) — required pattern, edit forms, field components
- [.docs/ui.md](../../../.docs/ui.md) — Skeleton and shared UI
- [.docs/error-handling.md](../../../.docs/error-handling.md) — submit errors
- In a dialog: also the `dialog` skill; file fields: the `file-upload` skill
- Labels and messages: [.docs/i18n.md](../../../.docs/i18n.md)

## Steps

1. Check `@/shared/ui/form/index.ts` for available field components.
2. Write one Zod schema; infer `FormValues` with `z.infer`.
3. Type `defaultValues` (`satisfies FormValues`): `''` for text/select/combobox/
   radio, `false` for booleans, `null` for number/date/file.
4. `useAppForm({ defaultValues, validators: { onSubmit: schema }, onSubmit })`;
   in `onSubmit` call `mutation.mutateAsync(value)`, then `toast.success`.
5. Render inside `<Form form={form}>` with `form.AppField` and
   `form.SubmitButton`. Add `form.FormErrorSummary` to long forms.
6. Edit form: render a Skeleton until the entity loads, then mount the form
   with defaults from the query data (use `key={item.id}`).
7. After creating an entity, navigate to its detail page when one exists.

## Checklist

- [ ] No raw `useForm`, `preventDefault()` or `form.handleSubmit()` in JSX
- [ ] No `parse`/`safeParse` for validation; no `form.reset()` in `useEffect`
- [ ] Required strings use `requiredString` / `createRequiredString(locale)`
- [ ] Numeric values stay `number | null`; no `Number(...)` in `onSubmit`
- [ ] Field arrays use a stable item key, not the index
- [ ] Composite forms share one schema and one `formOptions`
- [ ] No second toast for validation or mutation errors
- [ ] Dialog vs page chosen by the rule at the end of `.docs/forms.md`

## Verify

```bash
bun run check
bun run typecheck
bun run test
```
