import { useEffect, useState } from 'react'

const DEFAULT_DEBOUNCE_MS = 250

export function useDebouncedValue<T>(value: T, delay: number = DEFAULT_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebounced(value)
    }, delay)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [value, delay])

  return debounced
}
