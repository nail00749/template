import { describe, expect, it } from 'vitest'
import { formatDate, DATE_FORMATS } from './formatDate'

describe('formatDate locale', () => {
  const date = new Date(2026, 0, 24, 12, 30)
  it('localizes month names using an explicit locale', () => {
    expect(formatDate(date, DATE_FORMATS.FULL_DATE, undefined, 'ru')).toBe('24 января 2026')
    expect(formatDate(date, DATE_FORMATS.FULL_DATE, undefined, 'en')).toBe('24 January 2026')
  })
})
