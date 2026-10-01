import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PaginationState } from '@tanstack/react-table'
import { useDataGridState } from './use-data-grid-sorting'

afterEach(cleanup)

describe('useDataGridState pagination', () => {
  it('retains local pagination and resets the page on size or sorting changes', () => {
    const { result } = renderHook(() =>
      useDataGridState<{ name: string }>({
        initialPageIndex: 3,
        initialPageSize: 20,
      }),
    )
    act(() =>
      result.current.onPaginationChange((previous) => ({
        ...previous,
        pageIndex: previous.pageIndex + 1,
      })),
    )
    expect(result.current.pagination).toEqual({ pageIndex: 4, pageSize: 20 })
    act(() => result.current.setPageSize(50))
    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 50 })
    act(() => result.current.setPageIndex(2))
    act(() => result.current.setSort('name', 'desc'))
    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 50 })
  })

  it('uses external state immediately and delegates updates without changing it locally', () => {
    const onPaginationChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ pagination }) =>
        useDataGridState({
          pagination,
          onPaginationChange,
        }),
      { initialProps: { pagination: { pageIndex: 3, pageSize: 20 } } },
    )
    act(() => result.current.setPageIndex(5))
    expect(result.current.pagination).toEqual({ pageIndex: 3, pageSize: 20 })
    const updater = onPaginationChange.mock.calls[0]?.[0]
    expect(updater({ pageIndex: 8, pageSize: 50 })).toEqual({ pageIndex: 5, pageSize: 50 })
    rerender({ pagination: { pageIndex: 1, pageSize: 50 } })
    expect(result.current.pagination).toEqual({ pageIndex: 1, pageSize: 50 })
    expect(result.current.queryParams).toEqual({ page: 1, limit: 50, offset: 50 })
    expect(onPaginationChange).toHaveBeenCalledTimes(1)
  })

  it('delegates page size and sorting resets in controlled mode', () => {
    let pagination: PaginationState = { pageIndex: 4, pageSize: 20 }
    const { result } = renderHook(() =>
      useDataGridState<{ name: string }>({
        pagination,
        onPaginationChange: (updater) => {
          pagination = typeof updater === 'function' ? updater(pagination) : updater
        },
      }),
    )
    act(() => result.current.setPageSize(50))
    expect(pagination).toEqual({ pageIndex: 0, pageSize: 50 })
    pagination = { pageIndex: 6, pageSize: 50 }
    act(() => result.current.setSort('name', 'asc'))
    expect(pagination).toEqual({ pageIndex: 0, pageSize: 50 })
  })
})
