# UI

Use components from `@/shared/ui`.

## Available Components

Полный актуальный список смотри в `src/shared/ui/` — там лежат все примитивы.
Перед созданием нового компонента проверь эту папку и `@/shared/ui/form`,
`@/shared/ui/dialog-provider`.

Часто используемые:

- **Buttons & inputs**: `button`, `input`, `input-group`, `textarea`, `checkbox`,
  `radio-group`, `switch`, `slider`, `native-select`
- **Pickers**: `select`, `combobox`, `date-picker`, `calendar`
- **Overlays**: `dialog`, `alert-dialog`, `drawer`, `sheet`, `popover`,
  `dropdown-menu`, `tooltip`
- **Layout**: `card`, `tabs`, `separator`, `scroller`, `scroll-area`,
  `container`, `sidebar`
- **Feedback**: `badge`, `spinner`, `skeleton`, `progress`, `sonner` (Toaster)
- **Data**: `DataGrid`, `table`, `pagination`, `cells/TruncatedCell`
- **Branding**: `Logo`, `LogoMts`, `Picture`, `Typography`, `avatar`

Отсутствующий компонент не автоматически относится к `shared/ui`:

- domain-specific или one-off компонент остаётся в owning page/feature `ui/`;
- generic component сначала композируется из существующих primitives;
- в `shared/ui` он переносится только при отсутствии business semantics и
  реальном повторном использовании.

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

## Loading states — Skeleton

Use `Skeleton` from `@/shared/ui/skeleton` for loading pages and content. The
placeholder must match the final layout, including detail pages, forms, and
table content. Do not render empty content or use a generic spinner as the
page-level loader. For `DataGrid`, pass its loading state through `isLoading` so
the table can render its loading placeholders; use `isFetching` for background
refetches while existing rows remain visible.

## Full-page status

Use `PageState` from `@/shared/ui/page-state` for generic full-page states such
as root errors and not-found screens. It owns the accessible title, card layout,
icon treatment, and optional action area. Domain-specific query states should
remain inside their feature when they need domain-specific recovery or content.

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

Use `Combobox`/`ComboboxFieldForm` for relations to other entities or whenever
the available values are not known in advance. This includes searching remote
entities by name, code, or other text. Use `Select`/`SelectFieldForm` only for
short, predefined option lists.

Use `ComboboxSelectTrigger` + `ComboboxValue` as the trigger, not `SelectTrigger`. The same `SelectValue`-children rule **does not apply** — `ComboboxValue` renders its `placeholder` by default; the selected label comes from the option text automatically.

When building a reusable select backed by a query, wrap it in a dedicated component (e.g. `ContractTypeSelect.tsx`) and accept `value` / `onChange` props.

## Links

Типобезопасные ссылки — только через TanStack Router. Для построения параметров
используй `linkOptions`:

```tsx
import { Link, linkOptions } from '@tanstack/react-router'

const link = linkOptions({
  to: '/items/$id',
  params: { id: item.id },
  search: { tab: 'files' },
})

<Link {...link}>Открыть</Link>
```

Никогда не собирай путь строкой (`<Link to={`/items/${id}`}>`) — теряется
типизация params/search. См. `.docs/router.md`.

## Rules

- **Never create custom Button, Select, Input, Dialog, Badge, Card, Tabs, DropdownMenu** — they already exist in `@/shared/ui`. Using native HTML or rolling your own is a bug.
- Use shared/shadcn components instead of raw native controls in pages and
  features: use `Select`/`NativeSelect` instead of `<select>`, `DatePicker` (or
  `DatePickerForm`) instead of `<input type="date">`, and the existing shared
  time field component instead of `<input type="time">` when one exists. If an
  equivalent does not exist, compose it from shared primitives locally first;
  promote it only after the shared-component criteria below are met.
- If a component doesn't exist in `@/shared/ui`, compose it from existing
  primitives locally first. Promote it to shared only when it is generic and
  demonstrably reused.
- Use `cn()` helper for conditional class merging
- Use Tailwind utility classes for layout and spacing
- Avoid inline `style` objects
- Complex or reused styling goes into CSS modules
- Do not use raw `<table>` / `<Table>` for new list views — use `DataGrid`
- Never use `asChild` — this is Base UI, use `render` prop instead
