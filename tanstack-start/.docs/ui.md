# UI

Use components from `@/shared/ui`.

## Available Components

| Component                              | Import path                 |
| -------------------------------------- | --------------------------- |
| Button                                 | `@/shared/ui/button`        |
| Dialog, DialogContent, DialogHeader... | `@/shared/ui/dialog`        |
| Card, CardHeader, CardContent...       | `@/shared/ui/card`          |
| Select, SelectTrigger...               | `@/shared/ui/select`        |
| DropdownMenu...                        | `@/shared/ui/dropdown-menu` |
| Tabs, TabsList...                      | `@/shared/ui/tabs`          |
| Badge                                  | `@/shared/ui/badge`         |
| Spinner                                | `@/shared/ui/spinner`       |
| DataGrid                               | `@/shared/ui/DataGrid`      |
| Combobox                               | `@/shared/ui/combobox`      |

## Base UI — render prop instead of asChild

Components are built on **`@base-ui/react`**, not Radix UI. Base UI uses a `render` prop for polymorphism — there is no `asChild`.

**Wrong (Radix pattern — does not work here):**

```tsx
<DialogPrimitive.Close asChild>
  <Button variant="ghost" />
</DialogPrimitive.Close>
```

**Correct (Base UI pattern):**

```tsx
<DialogPrimitive.Close render={<Button variant="ghost" />}>
  <XIcon />
</DialogPrimitive.Close>
```

The `render` prop accepts a React element. The primitive merges its own props (event handlers, aria attributes) onto that element. Children of the primitive become children of the rendered element.

Use `render` whenever a Base UI primitive needs to render as a different component (e.g., a `Button` instead of a plain `<button>`).

## Button — loading state

Use the built-in `loading` prop for async/pending state. It renders the spinner and disables the button for you.

**Wrong — manual spinner + disabled:**

```tsx
<Button disabled={isPending}>{isPending ? <Spinner /> : 'Сохранить'}</Button>
```

**Correct:**

```tsx
<Button loading={isPending}>Сохранить</Button>
```

Do not combine a spinner in `children` with `disabled={true}` to fake loading — it's a bug.

## Controlled vs uncontrolled — verify the API first

Base UI locks a component into controlled or uncontrolled mode on its **first render**, based on whether the relevant prop (`value`, `checked`, etc.) is `undefined`. Switching later throws:

> A component is changing the uncontrolled value state of Select to be controlled. Elements should not switch from uncontrolled to controlled (or vice versa).

Rules to avoid it:

- Pick one mode per component and keep it for the whole lifetime.
- Controlled: initialize state to a concrete value (`""`, `null`, `false`) — never `undefined`. If the value comes from an async source, don't render the input until it's defined, or fall back to a concrete default.
- Uncontrolled: use `defaultValue` / `defaultChecked` and never pass `value` / `checked`.
- **Before writing any form or Base UI component, check its props and controlled model in the Base UI docs (use context7).** Do not guess prop names or state handling — verify against the API.

## Select

Import from `@/shared/ui/select`. Always use `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` — never build a custom dropdown.

**`SelectValue` does not auto-render the label.** Unlike Radix UI, base-ui's `Select.Value` does not read the text content of the matching `SelectItem` — it renders the raw `value` string unless you pass children explicitly.

**Wrong:**

```tsx
<SelectTrigger>
  <SelectValue /> {/* shows "blocking", not "Блокирующий" */}
</SelectTrigger>
```

**Correct — pass the display label as children:**

```tsx
<SelectTrigger>
  <SelectValue>{SEVERITY_LABELS[currentValue]}</SelectValue>
</SelectTrigger>
```

For a static options array (e.g. `SEVERITY_OPTIONS = [{ value, label }]`), derive the label at render time:

```tsx
const label = SEVERITY_OPTIONS.find((o) => o.value === value)?.label ?? value

<SelectTrigger size="sm">
  <SelectValue>{label}</SelectValue>
</SelectTrigger>
<SelectContent>
  {SEVERITY_OPTIONS.map((opt) => (
    <SelectItem key={opt.value} value={opt.value}>
      {opt.label}
    </SelectItem>
  ))}
</SelectContent>
```

Use `size="sm"` for compact contexts (table cells, toolbars). Default size is for forms.

Options arrays and label maps belong in `*Presentation.ts`, not inline in JSX.

## Combobox

Import from `@/shared/ui/combobox`. Use for searchable dropdowns backed by API data (e.g. selecting a contract type from a list).

Use `ComboboxSelectTrigger` + `ComboboxValue` as the trigger, not `SelectTrigger`. The same `SelectValue`-children rule **does not apply** — `ComboboxValue` renders its `placeholder` by default; the selected label comes from the option text automatically.

When building a reusable select backed by a query, wrap it in a dedicated component (e.g. `ContractTypeSelect.tsx`) and accept `value` / `onChange` props.

## Rules

- **Never create custom Button, Select, Input, Dialog, Badge, Card, Tabs, DropdownMenu** — they already exist in `@/shared/ui`. Using native HTML or rolling your own is a bug.
- If a component doesn't exist in `@/shared/ui`, check if it can be composed from existing ones before creating a new file.
- Use `cn()` helper for conditional class merging
- Use Tailwind utility classes for layout and spacing
- Avoid inline `style` objects
- Complex or reused styling goes into CSS modules
- Do not use raw `<table>` / `<Table>` for new list views — use `DataGrid`
- Never use `asChild` — this is Base UI, use `render` prop instead
