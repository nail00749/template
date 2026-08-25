# DataGrid

Import from `@/shared/ui/DataGrid`. Use for all new tables — never use raw `<Table>`.

## Basic Usage

```tsx
import { DataGrid } from '@/shared/ui/DataGrid'
import { useDataGridState } from '@/shared/hooks/use-data-grid-sorting'
import type { ColumnDef } from '@tanstack/table-core'

interface Item {
  id: string
  name: string
}

const columns: Array<ColumnDef<Item>> = [
  { accessorKey: 'name', header: 'Название' },
  {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => <ActionsMenu item={row.original} />,
  },
]

function MyPage() {
  const { sorting, onSortingChange, pagination, onPaginationChange } = useDataGridState()

  const { data, isLoading } = useQuery(itemsQueryOptions({ ...sortState, ...paginationState }))

  return (
    <DataGrid
      columns={columns}
      rows={data?.items}
      totalCount={data?.total}
      isLoading={isLoading}
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

## Rules

- Always use `useDataGridState` for API-backed tables
- Keep `columns` in a separate file or a `const` outside the component
- Do not create local `DataTable` wrappers around `DataGrid`
- Do not use `ColumnDef` with `any` — always type the row data
- Pass the query loading state to `DataGrid.isLoading`; do not replace the
  table with a generic spinner while its data is loading
- When an entity has a detail page, make the row navigate to it with `rowLink`
  (`href`); keep action controls in the action column for their own operations
