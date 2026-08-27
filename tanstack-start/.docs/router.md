# Search Params & Routing

## Where to put search schemas

**Simple routes** (1–3 params, no API mapping needed) — schema directly in the route file:

```ts
// routes/admin/suggestions/index.tsx
const suggestionsSearchSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']).optional().catch(undefined),
  contract_type: z.string().optional().catch(undefined),
})

export type SuggestionsSearch = z.infer<typeof suggestionsSearchSchema>

export const Route = createFileRoute('/admin/suggestions/')({
  validateSearch: suggestionsSearchSchema,
  component: SuggestionsRoute,
})

function SuggestionsRoute() {
  const { status, contract_type } = Route.useSearch()
  return <SuggestionsPage status={status} contractTypeId={contract_type} />
}
```

**Complex routes** (pagination, date ranges, API param mapping) — schema + mapper in `features/<domain>/model/`:

```ts
// features/legal/model/checked-contracts-search.ts
export const checkedContractsSearchSchema = z.object({
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .catch(1)
    .transform((v) => v ?? 1),
  limit: z
    .number()
    .int()
    .min(1)
    .optional()
    .catch(10)
    .transform((v) => v ?? 10),
  contract_type_id: z.string().optional().catch(undefined),
  checked_from: z.string().optional().catch(undefined),
  checked_to: z.string().optional().catch(undefined),
})

export type CheckedContractsSearch = z.infer<typeof checkedContractsSearchSchema>

export const mapCheckedContractsSearchToParams = (
  search: CheckedContractsSearch,
): ListContractsParams => ({
  page: search.page - 1,
  offset: (search.page - 1) * search.limit,
  limit: search.limit,
  contract_type_id: search.contract_type_id || undefined,
})
```

Then import the schema into the route:

```ts
// routes/admin/contracts/index.tsx
export const Route = createFileRoute('/admin/contracts/')({
  validateSearch: checkedContractsSearchSchema,
  component: CheckedContractsRegistryPage,
})
```

## `.catch()` Rules

TanStack Router parses search params as JSON before validation, so top-level
numbers and booleans arrive as `number`/`boolean`, not only as strings. With Zod
v4, pass the schema directly to `validateSearch`; no adapter or coercion is
needed.

- Optional string params: `.optional().catch(undefined)`
- Optional enums: `.enum([...]).optional().catch(undefined)`
- Numbers: `z.number().int().min(1).catch(1)`
- Booleans: `z.boolean().catch(false)`
- Never use `z.coerce.boolean()` here: if a non-Router string reaches it, the
  string `'false'` coerces to `true`.

Use `.catch(fallback)` for user-editable URLs so malformed values recover to a
safe state. Use `.default()` only when invalid input should throw into the
route's `VALIDATE_SEARCH` error flow.

## Reading Search Params

```ts
const { page, status } = Route.useSearch()
```

## Updating Search Params

Always spread `prev` — never replace the entire object:

```ts
navigate({
  search: (prev) => ({ ...prev, page: 2 }),
})
```

## Programmatic Navigation

- `useNavigate()` — в компонентах и `use<Feature>` хуках.
- `router.navigate(...)` — в `onSuccess` callbacks, вне компонентов (например,
  после logout).
- `redirect({ to: '/login' })` — только в `beforeLoad` / `loader`. Бросать как исключение: `throw redirect(...)`.

```ts
const navigate = useNavigate()

navigate({
  to: '/items/$id',
  params: { id: item.id },
  replace: true, // для logout, delete и других «без возврата» переходов
})
```

Используй `replace: true` когда нет смысла возвращаться на предыдущую
страницу (delete-confirmation, logout, post-create redirect).

## type-safe Links

Всегда используй `linkOptions` для построения ссылок с params/search:

```ts
import { Link, linkOptions } from '@tanstack/react-router'

const link = linkOptions({
  to: '/items/$id',
  params: { id: item.id },
})

<Link {...link}>...</Link>
```

Никогда не собирай path строкой — потеряешь типизацию.

## Route.useParams / Route.useSearch

В route adapter используй `Route.useSearch()` / `Route.useParams()` от самого
роута и передавай валидированные значения вниз через props. Feature/widget не
должен импортировать `Route` из верхнего слоя.

Для доступа к родительским route-данным внутри другого route adapter допустим
`getRouteApi('/_admin')`.

## Rules

- Always `validateSearch` with Zod — never read raw `window.location.search`
- Always `.catch()` on every field — no field should throw on invalid input
- Use `Route.useSearch()`, not `useRouterState`
- Read Route params/search only in route files; feature/widget entry points
  receive them through typed props
- Schema lives in route file when simple, in `features/<domain>/model/` when it needs a mapper or is reused
- Mapper function (`map*SearchToParams`) converts search state to API params — keeps route component clean
- Preserve existing params via spread in updater functions
