import { formatDate } from '@/shared/lib/formatDate'

export const formatTemplateCreatedAt = (createdAt: string | null | undefined | Date) => {
  if (!createdAt) {
    return '-'
  }

  return formatDate(createdAt)
}
