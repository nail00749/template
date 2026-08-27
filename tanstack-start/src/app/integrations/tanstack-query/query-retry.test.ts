import { describe, expect, it } from 'vitest'
import { getRetryDelay, parseRetryAfter, shouldRetryQuery } from './query-retry'

function createAxiosError(status?: number, retryAfter?: string | number): unknown {
  return {
    isAxiosError: true,
    response:
      status === undefined
        ? undefined
        : {
            status,
            headers: retryAfter === undefined ? {} : { 'retry-after': retryAfter },
          },
  }
}

describe('shouldRetryQuery', () => {
  it.each([408, 425, 429, 500, 503])('retries transient status %i', (status) => {
    expect(shouldRetryQuery(0, createAxiosError(status))).toBe(true)
  })

  it.each([302, 400, 401, 403, 404, 422])('does not retry non-transient status %i', (status) => {
    expect(shouldRetryQuery(0, createAxiosError(status))).toBe(false)
  })

  it('retries network errors without a response', () => {
    expect(shouldRetryQuery(0, createAxiosError())).toBe(true)
  })

  it('does not retry non-Axios errors', () => {
    expect(shouldRetryQuery(0, new Error('boom'))).toBe(false)
  })

  it('stops after two retries', () => {
    expect(shouldRetryQuery(2, createAxiosError(503))).toBe(false)
  })
})

describe('parseRetryAfter', () => {
  it('parses seconds', () => {
    expect(parseRetryAfter('1.5')).toBe(1500)
  })

  it('parses HTTP dates relative to the supplied time', () => {
    const now = Date.parse('2026-06-08T11:59:58.000Z')
    expect(parseRetryAfter('Mon, 08 Jun 2026 12:00:00 GMT', now)).toBe(2000)
  })

  it('returns null for invalid values', () => {
    expect(parseRetryAfter('not-a-date')).toBeNull()
  })
})

describe('getRetryDelay', () => {
  it('uses and caps Retry-After', () => {
    expect(getRetryDelay(0, createAxiosError(429, '2'))).toBe(2000)
    expect(getRetryDelay(0, createAxiosError(503, '120'))).toBe(30_000)
  })

  it('falls back to exponential backoff', () => {
    expect(getRetryDelay(0, createAxiosError(503))).toBe(500)
    expect(getRetryDelay(1, createAxiosError(503))).toBe(1000)
  })
})
