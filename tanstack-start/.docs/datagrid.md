# DataGrid

Import from `@/shared/ui/DataGrid`. Use for all new tables — never use raw `<Table>`.

## Basic Usage

```tsx
import { DataGrid } from '@/shared/ui/DataGrid'
import type { DataGridColumnDef } from '@/shared/ui/DataGrid'
import { useDataGridState } from '@/shared/lib/hooks/use-data-grid-sorting'

interface Item {
  id: string
  name: string
}

const columns: Array<DataGridColumnDef<Item>> = [
  { accessorKey: 'name', header: 'Название' },
  {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => <ActionsMenu item={row.original} />,
  },
]

function MyPage() {
  const { sorting, onSortingChange, pagination, onPaginationChange } = useDataGridState()

  const { data, isLoading, isFetching } = useQuery(
    itemsQueryOptions({ ...sortState, ...paginationState }),
  )

  return (
    <DataGrid
      columns={columns}
      rows={data?.items}
      totalCount={data?.total}
      isLoading={isLoading}
      isFetching={isFetching}
      sorting={sorting}
      onSortingChange={onSortingChange}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
    />
  )
}
```

## Column Definitions

- `accessorKey` — for direct field access
- `accessorFn` + `id` — for computed or nested values
- `cell` — only for custom rendering (badges, buttons, formatted dates)
- `header` — string or component

## Action Columns

```ts
{
  id: 'actions',
  enableSorting: false,
  size: 60,
  cell: ({ row }) => <RowActions item={row.original} />,
}
```

## Clickable Rows

Pass `rowLink` to make the entire row act as a single clickable surface (cursor changes to pointer). Two variants:

### `href` — wrap the row in a TanStack Router `<Link>`

Renders a stretched `<Link>` inside the first cell. Cmd/right-click "open in new tab", copy link and prefetch work out of the box.

```tsx
import { linkOptions } from '@tanstack/react-router'
;<DataGrid
  columns={columns}
  rows={rows}
  totalCount={total}
  rowLink={{
    kind: 'href',
    href: (row) =>
      linkOptions({
        to: '/admin/items/$id',
        params: { id: row.id },
      }),
  }}
/>
```

### `callback` — run an arbitrary click handler

Use when the action is not a route navigation (open a dialog, toggle a row, etc.).

```tsx
<DataGrid
  columns={columns}
  rows={rows}
  totalCount={total}
  rowLink={{
    kind: 'callback',
    onClick: (row) => openDetails(row),
  }}
/>
```

### Combining with interactive cells

The stretched link uses `z-0`; cell content stacks above it in the normal flow. Any interactive child (button, badge-as-button) inside a cell receives clicks as expected — they do not trigger the link. No `stopPropagation` needed in cell renderers.

## Empty State

DataGrid показывает empty state из коробки. Для кастомного содержимого передай
`emptyContent`; DataGrid сам не покажет его во время initial loading:

```tsx
<DataGrid
  {...props}
  emptyContent={<EmptyState action={<Button>Создать первый</Button>} />}
/>
```

Никогда не показывай empty state во время загрузки — передавай `isLoading` для
первой загрузки и `isFetching` для фонового обновления. DataGrid сохраняет
старые строки во время refetch и объявляет обновление assistive technology.

## Filtering via Search Params

Фильтры таблицы — в URL search params (см. `.docs/router.md`):

```tsx
// routes/admin/items/index.tsx — adapter
export const Route = createFileRoute('/admin/items/')({
  validateSearch: itemsSearchSchema,
  component: ItemsRoute,
})

function ItemsRoute() {
  const search = Route.useSearch()
  return <ItemsPage search={search} />
}

// pages/items/ui/ItemsPage.tsx
function ItemsPage({ search }: ItemsPageProps) {
  const params = mapItemsSearchToParams(search)
  const gridState = useDataGridState()

  const { data, isLoading } = useQuery(itemsQueryOptions({ ...params, ...gridState }))

  return (
    <>
      <ItemsFilters /> {/* внутри navigate({ search: (prev) => ({ ...prev, status: 'active' }) }) */}
      <DataGrid ... />
    </>
  )
}
```

## Selection

Для массовых операций используй row selection. Состояние — локальное
(в `use<Feature>` хуке или компоненте страницы), не в URL — selection
эфемерен и не должен переживать перезагрузку.

Подробности API — в исходниках `@/shared/ui/DataGrid` (selection column
добавляется автоматически при передаче соответствующих props).

## Rules

- Always use `useDataGridState` for API-backed tables
- Keep `columns` in a separate file or a `const` outside the component
- Do not create local `DataTable` wrappers around `DataGrid`
- Do not use `ColumnDef` with `any` — always type the row data
- Pass the query loading state to `DataGrid.isLoading`; do not replace the
  table with a generic spinner while its data is loading
- When an entity has a detail page, make the row navigate to it with `rowLink`
  (`href`); keep action controls in the action column for their own operations
