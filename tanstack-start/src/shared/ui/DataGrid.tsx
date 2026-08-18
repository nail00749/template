import { Link, useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { memo, useMemo, useState } from 'react'
import type { LinkOptions } from '@tanstack/react-router'
import type { JSX, MouseEvent } from 'react'
import type { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/table-core'
import { cn } from '@/shared/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Spinner } from '@/shared/ui/spinner.tsx'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination'

type DataGridRowLink<T> =
  | {
      kind: 'href'
      href: (row: T) => LinkOptions
    }
  | {
      kind: 'callback'
      onClick: (row: T) => void
    }

type Props<T> = {
  columns: Array<ColumnDef<T>>
  rows: Array<T> | undefined
  totalCount: number | undefined
  isLoading?: boolean
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  enableSorting?: boolean
  hidePagination?: boolean
  rowLink?: DataGridRowLink<T>
}

const DEFAULT_COLUMN_SIZE = 150

const getColumnSize = (column: ColumnDef<unknown>): number => {
  const size = column.size
  return typeof size === 'number' ? size : DEFAULT_COLUMN_SIZE
}

const getTableMinWidth = (columns: Array<ColumnDef<unknown>>): number => {
  return columns.reduce<number>((sum, column) => sum + getColumnSize(column), 0)
}

const Component = <T,>(props: Props<T>) => {
  const {
    columns,
    rows = [],
    totalCount = 0,
    isLoading,
    pagination: paginationProp,
    onPaginationChange: onPaginationChangeProp,
    sorting: sortingProp,
    onSortingChange: onSortingChangeProp,
    enableSorting = true,
    hidePagination = false,
    rowLink,
  } = props

  const navigate = useNavigate()

  const [sortingState, setSortingState] = useState<SortingState>([])
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const sorting = sortingProp ?? sortingState
  const pagination = paginationProp ?? paginationState

  const handleSortingChange = useMemo<OnChangeFn<SortingState>>(
    () => (updater) => {
      const nextSorting = typeof updater === 'function' ? updater(sorting) : updater
      if (onSortingChangeProp) {
        onSortingChangeProp(nextSorting)
        return
      }
      setSortingState(nextSorting)
    },
    [onSortingChangeProp, sorting],
  )

  const handlePaginationChange = useMemo<OnChangeFn<PaginationState>>(
    () => (updater) => {
      const nextPagination = typeof updater === 'function' ? updater(pagination) : updater
      if (onPaginationChangeProp) {
        onPaginationChangeProp(nextPagination)
        return
      }
      setPaginationState(nextPagination)
    },
    [onPaginationChangeProp, pagination],
  )

  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowCount: totalCount,
    manualPagination: true,
    columnResizeMode: 'onChange',
    defaultColumn: {
      minSize: 50,
      maxSize: 1000,
      enableResizing: true,
      size: 150,
      enableSorting,
    },
    state: {
      pagination,
      sorting,
    },
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
  })

  const isEmpty = table.getRowModel().rows.length === 0 && !isLoading
  const pageCount = table.getPageCount()
  const currentPage = pageCount === 0 ? 0 : pagination.pageIndex + 1
  const hasPagination = !hidePagination && pageCount > 1
  const pageStart = totalCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const pageEnd =
    totalCount === 0 ? 0 : Math.min(pageStart + table.getRowModel().rows.length - 1, totalCount)

  return (
    <div className="w-full">
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-xl border border-gray-200 bg-card/95 text-card-foreground shadow-md">
        <Table
          className="table-fixed w-full"
          style={{
            minWidth: getTableMinWidth(columns as Array<ColumnDef<unknown>>),
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/90 backdrop-blur-sm border-b shadow-sm hover:bg-muted/90 sticky top-0 z-10"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="relative box-border"
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={[
                          'flex w-full items-center gap-1 text-left text-muted-foreground',
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : 'cursor-default',
                        ].join(' ')}
                      >
                        <span className="truncate">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-muted-foreground">
                            {header.column.getIsSorted() === 'asc' && (
                              <ChevronUpIcon className="size-4" />
                            )}
                            {header.column.getIsSorted() === 'desc' && (
                              <ChevronDownIcon className="size-4" />
                            )}
                            {/* {!header.column.getIsSorted() && (
                              <ChevronsUpDown className="size-4" />
                            )}*/}
                          </span>
                        )}
                      </button>
                    )}
                    <div
                      {...{
                        onDoubleClick: () => header.column.resetSize(),
                        // onMouseDown: header.getResizeHandler(),
                        // onTouchStart: header.getResizeHandler(),
                        className: [
                          'absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none',
                          'bg-transparent hover:bg-muted/70',
                          header.column.getIsResizing() ? 'bg-muted/70' : '',
                        ].join(' '),
                        style: {
                          transform: header.column.getIsResizing()
                            ? `translateX(${
                                (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
                                (table.getState().columnSizingInfo.deltaOffset ?? 0)
                              }px)`
                            : '',
                        },
                      }}
                    />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center align-middle text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Spinner />
                    <div>Загрузка данных...</div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isEmpty &&
              table.getRowModel().rows.map((row) => {
                const linkProps = rowLink?.kind === 'href' ? rowLink.href(row.original) : null
                const isClickable = linkProps !== null || rowLink?.kind === 'callback'

                return (
                  <TableRow
                    key={row.id}
                    onClick={
                      rowLink?.kind === 'callback'
                        ? () => rowLink.onClick(row.original)
                        : linkProps != null
                          ? () => navigate(linkProps)
                          : undefined
                    }
                    className={cn(isClickable && 'relative cursor-pointer')}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const isFirstCell = cellIndex === 0
                      const noTruncate = cell.column.columnDef.meta?.noTruncate

                      return (
                        <TableCell
                          key={cell.id}
                          className="box-border overflow-hidden"
                          style={{ width: cell.column.getSize() }}
                        >
                          {isFirstCell && linkProps && (
                            <Link
                              {...linkProps}
                              aria-label="Открыть"
                              className="absolute inset-0 z-0 rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                              onClick={(e: MouseEvent) => e.stopPropagation()}
                            />
                          )}
                          <div
                            className={cn(
                              'relative',
                              !noTruncate && 'truncate',
                              linkProps && 'z-10 pointer-events-none',
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            {isEmpty && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-13 text-center align-middle text-sm text-muted-foreground"
                >
                  Нет данных для отображения
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {totalCount === 0
            ? 'Нет данных для отображения'
            : `Показано ${pageStart}-${pageEnd} из ${totalCount}`}
        </div>

        {hasPagination && (
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Назад"
                  aria-disabled={!table.getCanPreviousPage()}
                  className={!table.getCanPreviousPage() ? 'pointer-events-none opacity-50' : ''}
                  onClick={(event) => {
                    event.preventDefault()
                    if (!table.getCanPreviousPage()) {
                      return
                    }
                    table.previousPage()
                  }}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive
                  size="default"
                  onClick={(event) => {
                    event.preventDefault()
                  }}
                >
                  {currentPage} / {pageCount}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  text="Вперед"
                  aria-disabled={!table.getCanNextPage()}
                  className={!table.getCanNextPage() ? 'pointer-events-none opacity-50' : ''}
                  onClick={(event) => {
                    event.preventDefault()
                    if (!table.getCanNextPage()) {
                      return
                    }
                    table.nextPage()
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}

export const DataGrid = memo(Component) as <T>(props: Props<T>) => JSX.Element
export type { DataGridRowLink }
