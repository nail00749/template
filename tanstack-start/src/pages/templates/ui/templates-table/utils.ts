import { formatDate } from '@/shared/lib/formatDate'
import type { AppLocale } from '@/shared/lib/i18n'

export const formatTemplateCreatedAt = (
  createdAt: string | null | undefined | Date,
  locale: AppLocale = 'ru',
) => {
  if (!createdAt) {
    return '-'
  }

  return formatDate(createdAt, undefined, undefined, locale)
}
