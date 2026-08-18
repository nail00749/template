import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { FormatOptions } from 'date-fns'

const DEFAULT_FORMAT = 'd MMMM yyyy'
const DEFAULT_LOCALE = ru

export function formatDate(
  date: Date | string | number,
  formatString: string = DEFAULT_FORMAT,
  options?: Omit<FormatOptions, 'locale'>,
): string {
  const dateObj = date instanceof Date ? date : new Date(date)

  return format(dateObj, formatString, {
    locale: DEFAULT_LOCALE,
    ...options,
  })
}

export const DATE_FORMATS = {
  FULL_DATE: 'd MMMM yyyy',
  SHORT_DATE: 'dd.MM.yyyy',
  DATE_TIME: 'dd.MM.yyyy HH:mm',
  ABBREVIATED: 'd MMM yyyy',
  MONTH_YEAR: 'LLLL yyyy',
} as const
