import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedCallback } from './use-debounced-callback'

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('runs only the latest call after the delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 100))

    act(() => {
      result.current.run('first')
      vi.advanceTimersByTime(50)
      result.current.run('latest')
      vi.advanceTimersByTime(99)
    })

    expect(callback).not.toHaveBeenCalled()
    expect(result.current.isPending()).toBe(true)

    act(() => vi.advanceTimersByTime(1))

    expect(callback).toHaveBeenCalledExactlyOnceWith('latest')
    expect(result.current.isPending()).toBe(false)
  })

  it('supports cancelling and flushing a pending call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 100))

    act(() => {
      result.current.run('cancelled')
      result.current.cancel()
      vi.advanceTimersByTime(100)
    })
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      result.current.run('flushed')
      result.current.flush()
    })
    expect(callback).toHaveBeenCalledExactlyOnceWith('flushed')
    expect(result.current.isPending()).toBe(false)
  })

  it('cancels on unmount and calls the latest callback', () => {
    const firstCallback = vi.fn()
    const latestCallback = vi.fn()
    const { result, rerender, unmount } = renderHook(
      ({ callback }) => useDebouncedCallback(callback, 100),
      { initialProps: { callback: firstCallback } },
    )

    act(() => result.current.run('updated'))
    rerender({ callback: latestCallback })
    act(() => vi.advanceTimersByTime(100))
    expect(firstCallback).not.toHaveBeenCalled()
    expect(latestCallback).toHaveBeenCalledExactlyOnceWith('updated')

    act(() => result.current.run('unmounted'))
    unmount()
    act(() => vi.advanceTimersByTime(100))
    expect(latestCallback).toHaveBeenCalledTimes(1)
  })
})
