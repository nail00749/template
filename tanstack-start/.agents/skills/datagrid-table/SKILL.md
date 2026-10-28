---
name: datagrid-table
description: >
  Build or change a table or list in the tanstack-start frontend with the
  shared DataGrid: columns, sorting, URL-backed pagination and filters,
  clickable rows, action columns, empty and loading states, row selection.
---

# DataGrid table

Contracts (authoritative, read before writing code):

- [.docs/datagrid.md](../../../.docs/datagrid.md) — DataGrid API and rules
- [.docs/router.md](../../../.docs/router.md) — search schema and mapper for filters
- [.docs/api.md](../../../.docs/api.md) — list query options and keys
- Reference implementation: `src/pages/templates`

## Steps

1. Define the list search schema (page, perPage, filters) with `.catch()` on
   every field — in the route when simple, in `pages/<name>/model` with a
   `map*SearchToParams` mapper otherwise.
2. Add or reuse list `queryOptions` in the entity.
3. Define typed `columns: Array<DataGridColumnDef<Row>>` outside the component,
   preferably in its own file in the page slice.
4. Use `useDataGridState` for sorting and pagination; for URL pagination derive
   `pageIndex` from `search.page - 1` and update the URL in `search(prev)`.
5. Pass `rows`, `totalCount`, `isLoading`, `isFetching` to `DataGrid`.
6. Detail page exists: `rowLink={{ kind: 'href', href: (row) => linkOptions(...) }}`;
   row operations go in an `actions` column.

## Checklist

- [ ] No raw `<Table>` and no local `DataTable` wrapper
- [ ] No `any` in column defs
- [ ] No spinner replacing the table; no empty state while loading
- [ ] Filter change sets `page: 1` in the same URL update
- [ ] URL pagination is not copied into local state
- [ ] Selection state is local, not in the URL

## Verify

```bash
bun run check
bun run typecheck
bun run test
```
