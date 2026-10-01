import { format } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import type { FormatOptions } from 'date-fns'

const DEFAULT_FORMAT = 'd MMMM yyyy'
import type { AppLocale } from '@/shared/lib/i18n'

const dateLocales = { ru, en: enUS }

export function formatDate(
  date: Date | string | number,
  formatString: string = DEFAULT_FORMAT,
  options?: Omit<FormatOptions, 'locale'>,
  locale: AppLocale = 'ru',
): string {
  const dateObj = date instanceof Date ? date : new Date(date)

  return format(dateObj, formatString, {
    locale: dateLocales[locale],
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
