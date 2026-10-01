import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'

const DEFAULT_DEBOUNCE_MS = 250

export interface DebouncedCallback<TArgs extends unknown[]> {
  run: (...args: TArgs) => void
  cancel: () => void
  flush: () => void
  isPending: () => boolean
}

export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number = DEFAULT_DEBOUNCE_MS,
): DebouncedCallback<TArgs> {
  const callbackRef = useRef(callback)
  const argsRef = useRef<TArgs | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useLayoutEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    argsRef.current = null
  }, [])

  const invoke = useCallback(() => {
    const args = argsRef.current
    argsRef.current = null
    timerRef.current = null
    if (args !== null) {
      callbackRef.current(...args)
    }
  }, [])

  const run = useCallback(
    (...args: TArgs) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      argsRef.current = args
      timerRef.current = setTimeout(invoke, delay)
    },
    [delay, invoke],
  )

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      invoke()
    }
  }, [invoke])

  const isPending = useCallback(() => timerRef.current !== null, [])

  useEffect(() => cancel, [cancel, delay])

  return useMemo(() => ({ run, cancel, flush, isPending }), [cancel, flush, isPending, run])
}
