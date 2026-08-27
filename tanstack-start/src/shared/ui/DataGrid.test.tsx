import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ColumnDef } from '@tanstack/react-table'
import { DataGrid } from './DataGrid'
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

const columns: Array<ColumnDef<Item>> = [
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
    const columnsWithAction: Array<ColumnDef<Item>> = [
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
