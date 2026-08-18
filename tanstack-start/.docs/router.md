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
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .catch(1)
    .transform((v) => v ?? 1),
  limit: z.coerce
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

- Optional string params: `.optional().catch(undefined)`
- Optional enums: `.enum([...]).optional().catch(undefined)`
- Numeric params from URL: `z.coerce.number().catch(1)` — use `coerce` because URL values are always strings
- Booleans: `z.coerce.boolean().catch(false)`

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

## Rules

- Always `validateSearch` with Zod — never read raw `window.location.search`
- Always `.catch()` on every field — no field should throw on invalid input
- Use `Route.useSearch()`, not `useRouterState`
- Schema lives in route file when simple, in `features/<domain>/model/` when it needs a mapper or is reused
- Mapper function (`map*SearchToParams`) converts search state to API params — keeps route component clean
- Preserve existing params via spread in updater functions
