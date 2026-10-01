import type { FieldType, ZoneResponseSource } from '@/shared/api/admin'

export const ALL_FIELD_TYPES: FieldType[] = [
  'text_large',
  'text_medium',
  'text_small',
  'subheading',
  'date',
  'person_name',
  'phone',
  'email',
  'address',
  'company',
  'job_title',
  'caption',
  'slide_number',
  'image',
  'table',
  'chart',
  'logo',
  'unknown',
]

export const SOURCE_COLORS: Record<ZoneResponseSource, string> = {
  per_template_override: 'bg-blue-100 text-blue-800',
  layout_override: 'bg-yellow-100 text-yellow-800',
  heuristic: 'bg-gray-100 text-gray-800',
}

export const SOURCE_BORDER_COLORS: Record<ZoneResponseSource, string> = {
  per_template_override: 'border-blue-500',
  layout_override: 'border-yellow-500',
  heuristic: 'border-gray-400',
}
