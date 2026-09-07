import type { FieldType, ZoneResponseSource } from '@/shared/api/admin'

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text_large: 'Текст (большой)',
  text_medium: 'Текст (средний)',
  text_small: 'Текст (маленький)',
  subheading: 'Подзаголовок',
  date: 'Дата',
  person_name: 'Имя человека',
  phone: 'Телефон',
  email: 'Email',
  address: 'Адрес',
  company: 'Компания',
  job_title: 'Должность',
  caption: 'Подпись',
  slide_number: 'Номер слайда',
  image: 'Изображение',
  table: 'Таблица',
  chart: 'Диаграмма',
  logo: 'Логотип',
  unknown: 'Неизвестно',
}

export const SOURCE_COLORS: Record<ZoneResponseSource, string> = {
  per_template_override: 'bg-blue-100 text-blue-800',
  layout_override: 'bg-yellow-100 text-yellow-800',
  heuristic: 'bg-gray-100 text-gray-800',
}

export const SOURCE_LABELS: Record<ZoneResponseSource, string> = {
  per_template_override: 'Шаблон',
  layout_override: 'Макет',
  heuristic: 'Авто',
}

export const SOURCE_BORDER_COLORS: Record<ZoneResponseSource, string> = {
  per_template_override: 'border-blue-500',
  layout_override: 'border-yellow-500',
  heuristic: 'border-gray-400',
}
