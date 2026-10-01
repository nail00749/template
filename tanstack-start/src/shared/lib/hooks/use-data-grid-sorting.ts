import { useCallback, useMemo, useState } from 'react'
import type { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'

type SortDirection = 'asc' | 'desc'

type SortState<T> = {
  key: keyof T
  direction: SortDirection
}

type Options<T> = {
  initialSort?: SortState<T>
  initialPageIndex?: number
  initialPageSize?: number
} & (
  | { pagination: PaginationState; onPaginationChange: OnChangeFn<PaginationState> }
  | { pagination?: never; onPaginationChange?: never }
)

export const useDataGridState = <T>(options: Options<T> = {}) => {
  const { initialSort, initialPageIndex = 0, initialPageSize = 10 } = options

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (!initialSort) {
      return []
    }
    return [
      {
        id: String(initialSort.key),
        desc: initialSort.direction === 'desc',
      },
    ]
  })
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  })

  const sortState = useMemo<SortState<T> | null>(() => {
    const current = sorting[0]
    if (!current) {
      return null
    }
    return {
      key: current.id as keyof T,
      direction: current.desc ? 'desc' : 'asc',
    }
  }, [sorting])

  const pagination = options.pagination ?? localPagination
  const controlledOnPaginationChange = options.onPaginationChange

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      if (controlledOnPaginationChange) {
        controlledOnPaginationChange(updater)
        return
      }
      setLocalPagination(updater)
    },
    [controlledOnPaginationChange],
  )

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      setSorting(updater)
      onPaginationChange((previous) => ({ ...previous, pageIndex: 0 }))
    },
    [onPaginationChange],
  )

  const setSort = useCallback(
    (key: keyof T, direction: SortDirection) => {
      onSortingChange([
        {
          id: String(key),
          desc: direction === 'desc',
        },
      ])
    },
    [onSortingChange],
  )

  const setPageIndex = useCallback(
    (pageIndex: number) => {
      onPaginationChange((previous) => ({ ...previous, pageIndex }))
    },
    [onPaginationChange],
  )

  const setPageSize = useCallback(
    (pageSize: number) => {
      onPaginationChange({ pageIndex: 0, pageSize })
    },
    [onPaginationChange],
  )

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    }),
    [pagination],
  )

  return {
    pagination,
    sorting,
    onSortingChange,
    onPaginationChange,
    queryParams,
    sortState,
    setSort,
    setPageIndex,
    setPageSize,
  }
}

export const useDataGridSorting = <T>(options: Options<T> = {}) => {
  const { sorting, onSortingChange, sortState, setSort } = useDataGridState<T>(options)

  return {
    sorting,
    onSortingChange,
    sortState,
    setSort,
  }
}
