import type { OnChangeFn, PaginationState } from '@tanstack/react-table'
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
    const onPaginationChange = vi.fn<OnChangeFn<PaginationState>>()

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
    fireEvent.click(screen.getByRole('button', { name: 'Перейти на следующую страницу' }))

    expect(onPaginationChange).toHaveBeenCalledOnce()
    const updater = onPaginationChange.mock.calls[0]?.[0]
    expect(typeof updater).toBe('function')
    if (typeof updater === 'function') {
      expect(updater({ pageIndex: 0, pageSize: 10 })).toEqual({ pageIndex: 1, pageSize: 10 })
      expect(updater({ pageIndex: 3, pageSize: 20 })).toEqual({ pageIndex: 4, pageSize: 20 })
    }
  })

  it('keeps the horizontal scroll area at the bottom with a single row', () => {
    render(
      <DataGrid
        columns={columns}
        rows={[rows[0]]}
        totalCount={1}
        hidePagination={true}
      />,
    )

    const table = screen.getByRole('table')
    const scrollArea = table.parentElement
    const container = table.closest('[aria-busy]')
    expect(container?.classList.contains('min-h-[200px]')).toBe(true)
    expect(container?.classList.contains('grid')).toBe(true)
    expect(scrollArea?.parentElement).toBe(container)
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
    expect(screen.getByRole('table').querySelectorAll('[data-slot="skeleton"]')).toHaveLength(5)
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByText('Загрузка данных...')).toBeNull()

    rerender(
      <DataGrid
        columns={columns}
        rows={[]}
        totalCount={0}
        isLoading={false}
        hidePagination={true}
      />,
    )

    const emptyState = screen.getByText('Нет данных для отображения')
    expect(emptyState).not.toBeNull()
    expect(emptyState.closest('[role="status"]')).not.toBeNull()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('renders the empty state outside the table for wide columns and hides the zero-count footer', () => {
    const wideColumns: Array<DataGridColumnDef<Item>> = [
      { accessorKey: 'id', header: 'ID', size: 1000 },
      { accessorKey: 'name', header: 'Название', size: 1000 },
    ]

    render(
      <DataGrid
        columns={wideColumns}
        rows={[]}
        totalCount={0}
      />,
    )

    const emptyState = screen.getByRole('status')
    expect(emptyState.textContent).toBe('Нет данных для отображения')
    expect(emptyState.classList.contains('min-w-0')).toBe(true)
    expect(emptyState.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.queryByRole('columnheader')).toBeNull()
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByText(/Показано/)).toBeNull()
  })

  it('keeps existing rows visible during a background update even when isLoading is set', () => {
    render(
      <DataGrid
        columns={columns}
        rows={rows}
        totalCount={rows.length}
        isLoading
        isFetching
      />,
    )

    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['Beta', 'Alpha'])
    expect(screen.getByRole('table').querySelector('[data-slot="skeleton"]')).toBeNull()
    expect(screen.queryByText('Нет данных для отображения')).toBeNull()
    expect(screen.getByRole('status').textContent).toBe('Обновление данных...')
    expect(screen.getByRole('table').closest('[aria-busy]')?.getAttribute('aria-busy')).toBe('true')
  })

  it('supports interactive ReactNode content in the empty state', () => {
    const onCreate = vi.fn()

    render(
      <DataGrid
        columns={columns}
        rows={[]}
        totalCount={0}
        emptyContent={
          <div>
            <p>Пока пусто</p>
            <Button onClick={onCreate}>Создать</Button>
          </div>
        }
      />,
    )

    const action = screen.getByRole('button', { name: 'Создать' })
    expect(action.closest('[role="status"]')).not.toBeNull()
    fireEvent.click(action)
    expect(onCreate).toHaveBeenCalledOnce()
  })

  it.each([5, 25])('keeps navigation back from an empty page with %i total rows', (totalCount) => {
    const onPaginationChange = vi.fn<OnChangeFn<PaginationState>>()

    render(
      <DataGrid
        columns={columns}
        rows={[]}
        totalCount={totalCount}
        pagination={{ pageIndex: 3, pageSize: 10 }}
        onPaginationChange={onPaginationChange}
      />,
    )

    expect(screen.getByText(`Показано 0-0 из ${totalCount}`)).not.toBeNull()
    expect(screen.getByRole('navigation')).not.toBeNull()
    const previous = screen.getByRole('button', { name: 'Перейти на предыдущую страницу' })
    expect(previous.getAttribute('aria-disabled')).toBe('false')
    fireEvent.click(previous)
    expect(onPaginationChange).toHaveBeenCalledOnce()
    const updater = onPaginationChange.mock.calls[0]?.[0]
    if (typeof updater === 'function') {
      expect(updater({ pageIndex: 3, pageSize: 10 })).toEqual({ pageIndex: 2, pageSize: 10 })
    } else {
      throw new Error('Expected a functional pagination updater')
    }
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
