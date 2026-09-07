import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DataGrid } from './DataGrid'
import type { DataGridColumnDef } from './DataGrid'
import { Button } from './button'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

interface Item {
  id: string
  name: string
}

const rows: Array<Item> = [
  { id: '1', name: 'Beta' },
  { id: '2', name: 'Alpha' },
]

const columns: Array<DataGridColumnDef<Item>> = [
  {
    accessorKey: 'name',
    header: 'Название',
    enableSorting: true,
  },
]

afterEach(cleanup)

describe('DataGrid', () => {
  it('does not sort the current page client-side', () => {
    render(
      <DataGrid
        columns={columns}
        rows={rows}
        totalCount={rows.length}
        hidePagination={true}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Название' }))

    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['Beta', 'Alpha'])
  })

  it('reports controlled server-side sorting without reordering rows', () => {
    const onSortingChange = vi.fn()

    render(
      <DataGrid
        columns={columns}
        rows={rows}
        totalCount={rows.length}
        sorting={[]}
        onSortingChange={onSortingChange}
        hidePagination={true}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Название' }))

    expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }])
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['Beta', 'Alpha'])
  })

  it('reports controlled server-side pagination', () => {
    const onPaginationChange = vi.fn()

    render(
      <DataGrid
        columns={columns}
        rows={rows}
        totalCount={25}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onPaginationChange={onPaginationChange}
      />,
    )

    expect(screen.getByText('1 / 3')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))

    expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 })
  })

  it('does not show the empty state during initial loading', () => {
    const { rerender } = render(
      <DataGrid
        columns={columns}
        rows={[]}
        totalCount={0}
        isLoading={true}
        hidePagination={true}
      />,
    )

    expect(screen.queryByText('Нет данных для отображения')).toBeNull()

    rerender(
      <DataGrid
        columns={columns}
        rows={[]}
        totalCount={0}
        isLoading={false}
        hidePagination={true}
      />,
    )

    expect(screen.getByText('Нет данных для отображения')).not.toBeNull()
  })

  it('keeps nested actions separate from the row callback', () => {
    const onRowClick = vi.fn()
    const columnsWithAction: Array<DataGridColumnDef<Item>> = [
      ...columns,
      {
        id: 'actions',
        cell: () => <Button type="button">Действие</Button>,
      },
    ]

    render(
      <DataGrid
        columns={columnsWithAction}
        rows={rows}
        totalCount={rows.length}
        hidePagination={true}
        rowLink={{ kind: 'callback', onClick: onRowClick }}
      />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Действие' })[0])
    expect(onRowClick).not.toHaveBeenCalled()

    fireEvent.click(screen.getAllByRole('button', { name: 'Открыть' })[0])
    expect(onRowClick).toHaveBeenCalledOnce()
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
  })
})
