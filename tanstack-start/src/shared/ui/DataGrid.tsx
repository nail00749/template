import { Link, useNavigate } from '@tanstack/react-router'
import {
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  flexRender,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { LinkOptions } from '@tanstack/react-router'
import type { MouseEvent, ReactNode } from 'react'
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  RowData,
  SortingState,
} from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination'

const dataGridFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnVisibilityFeature,
})

type DataGridFeatures = typeof dataGridFeatures

export type DataGridColumnDef<T extends RowData> = ColumnDef<DataGridFeatures, T>

export type DataGridRowLink<T extends RowData> =
  | {
      kind: 'href'
      href: (row: T) => LinkOptions
    }
  | {
      kind: 'callback'
      onClick: (row: T) => void
    }

export interface DataGridProps<T extends RowData> {
  columns: Array<DataGridColumnDef<T>>
  rows: Array<T> | undefined
  totalCount: number | undefined
  isLoading?: boolean
  isFetching?: boolean
  emptyContent?: ReactNode
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  enableSorting?: boolean
  hidePagination?: boolean
  rowLink?: DataGridRowLink<T>
}

const DEFAULT_COLUMN_SIZE = 150

const getColumnSize = <T extends RowData>(column: DataGridColumnDef<T>): number => {
  const size = column.size
  return typeof size === 'number' ? size : DEFAULT_COLUMN_SIZE
}

const getTableMinWidth = <T extends RowData>(columns: Array<DataGridColumnDef<T>>): number => {
  return columns.reduce<number>((sum, column) => sum + getColumnSize(column), 0)
}

function getResizeTransform(
  isResizing: boolean,
  direction: 'ltr' | 'rtl' | undefined,
  deltaOffset: number | null | undefined,
): string {
  if (!isResizing) {
    return ''
  }

  const directionMultiplier = direction === 'rtl' ? -1 : 1
  return `translateX(${directionMultiplier * (deltaOffset ?? 0)}px)`
}

interface DataGridSkeletonRowsProps {
  columnCount: number
  rowCount: number
}

function DataGridSkeletonRows({ columnCount, rowCount }: DataGridSkeletonRowsProps) {
  return Array.from({ length: rowCount }, (_, rowIndex) => (
    <TableRow key={rowIndex}>
      {Array.from({ length: columnCount }, (_, columnIndex) => (
        <TableCell key={columnIndex}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

function isInteractiveTarget(event: MouseEvent): boolean {
  const target = event.target
  if (!(target instanceof Element)) {
    return false
  }

  const interactiveElement = target.closest(
    'a, button, input, select, textarea, [role="button"], [role="link"]',
  )
  return interactiveElement !== null && interactiveElement !== event.currentTarget
}

export function DataGrid<T extends RowData>(props: DataGridProps<T>) {
  const {
    columns,
    rows = [],
    totalCount = 0,
    isLoading,
    isFetching,
    emptyContent = 'Нет данных для отображения',
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

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const nextSorting = typeof updater === 'function' ? updater(sorting) : updater
      if (onSortingChangeProp) {
        onSortingChangeProp(nextSorting)
        return
      }
      setSortingState(nextSorting)
    },
    [onSortingChangeProp, sorting],
  )

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const nextPagination = typeof updater === 'function' ? updater(pagination) : updater
      if (onPaginationChangeProp) {
        onPaginationChangeProp(nextPagination)
        return
      }
      setPaginationState(nextPagination)
    },
    [onPaginationChangeProp, pagination],
  )

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: rows,
    rowCount: totalCount,
    manualPagination: true,
    manualSorting: true,
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

  const showSkeleton = Boolean(isLoading && rows.length === 0)
  const isEmpty = table.getRowModel().rows.length === 0 && !showSkeleton
  const pageCount = table.getPageCount()
  const currentPage = pageCount === 0 ? 0 : pagination.pageIndex + 1
  const hasPagination = !hidePagination && pageCount > 1
  const pageStart = totalCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const pageEnd =
    totalCount === 0 ? 0 : Math.min(pageStart + table.getRowModel().rows.length - 1, totalCount)
  let dataSummary = `Показано ${pageStart}-${pageEnd} из ${totalCount}`
  if (showSkeleton) {
    dataSummary = 'Загрузка данных...'
  } else if (totalCount === 0) {
    dataSummary = 'Нет данных для отображения'
  }

  return (
    <div className="w-full">
      <div
        className="grid min-h-[200px] overflow-x-auto overflow-y-auto max-h-[600px] rounded-xl border border-gray-200 bg-card/95 text-card-foreground shadow-md"
        aria-busy={Boolean(isLoading || isFetching)}
      >
        {isFetching && !showSkeleton && (
          <span
            className="sr-only"
            role="status"
          >
            Обновление данных...
          </span>
        )}
        <Table
          className="table-fixed w-full"
          style={{
            minWidth: getTableMinWidth(columns),
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
                          transform: getResizeTransform(
                            header.column.getIsResizing(),
                            table.options.columnResizeDirection,
                            table.state.columnResizing.deltaOffset,
                          ),
                        },
                      }}
                    />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {showSkeleton && (
              <DataGridSkeletonRows
                columnCount={columns.length}
                rowCount={Math.min(pagination.pageSize, 5)}
              />
            )}

            {!showSkeleton &&
              !isEmpty &&
              table.getRowModel().rows.map((row) => {
                const linkProps = rowLink?.kind === 'href' ? rowLink.href(row.original) : null
                const isClickable = linkProps !== null || rowLink?.kind === 'callback'

                const handleRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
                  if (isInteractiveTarget(event)) {
                    return
                  }

                  if (rowLink?.kind === 'callback') {
                    rowLink.onClick(row.original)
                    return
                  }

                  if (linkProps !== null) {
                    void navigate(linkProps)
                  }
                }

                return (
                  <TableRow
                    key={row.id}
                    onClick={isClickable ? handleRowClick : undefined}
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
                            />
                          )}
                          {isFirstCell && rowLink?.kind === 'callback' && (
                            <button
                              type="button"
                              aria-label="Открыть"
                              className="absolute inset-0 z-0 rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                              onClick={() => rowLink.onClick(row.original)}
                            />
                          )}
                          <div
                            className={cn(
                              'relative',
                              !noTruncate && 'truncate',
                              isClickable &&
                                'z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_select]:pointer-events-auto [&_textarea]:pointer-events-auto',
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
                  className="h-40 text-center align-middle text-sm text-muted-foreground"
                >
                  {emptyContent}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(showSkeleton || totalCount > 0) && (
        <div className="flex flex-col gap-3 px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">{dataSummary}</div>

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
      )}
    </div>
  )
}
