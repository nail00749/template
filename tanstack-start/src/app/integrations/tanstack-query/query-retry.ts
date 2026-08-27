import { isAxiosError } from 'axios'

const MAX_RETRY_COUNT = 2
const MAX_RETRY_DELAY_MS = 30_000

/** Retry network failures and transient HTTP responses at most twice. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRY_COUNT) {
    return false
  }

  if (!isAxiosError(error)) {
    return false
  }

  const status = error.response?.status
  if (status === undefined) {
    return true
  }

  return status >= 500 || status === 408 || status === 425 || status === 429
}

/** Parse Retry-After seconds or an HTTP date into milliseconds. */
export function parseRetryAfter(value: string, now = Date.now()): number | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Math.max(0, Number(trimmed) * 1000)
  }

  const timestamp = Date.parse(trimmed)
  if (Number.isNaN(timestamp)) {
    return null
  }

  return Math.max(0, timestamp - now)
}

/** Respect Retry-After, otherwise use capped exponential backoff. */
export function getRetryDelay(failureCount: number, error: unknown): number {
  if (isAxiosError(error)) {
    const retryAfter = error.response?.headers?.['retry-after']
    if (typeof retryAfter === 'string' || typeof retryAfter === 'number') {
      const retryAfterMs = parseRetryAfter(String(retryAfter))
      if (retryAfterMs !== null) {
        return Math.min(retryAfterMs, MAX_RETRY_DELAY_MS)
      }
    }
  }

  return Math.min(500 * 2 ** failureCount, MAX_RETRY_DELAY_MS)
}
