import { t } from 'intlayer'
import type { Dictionary } from 'intlayer'

const content = {
  key: 'edit-template',
  content: {
    title: t({ ru: 'Редактировать шаблон', en: 'Edit template' }),
    description: t({
      ru: 'Измените название шаблона презентации.',
      en: 'Change the presentation template name.',
    }),
    name: t({ ru: 'Название шаблона', en: 'Template name' }),
    capacity: t({ ru: 'Макс. ёмкость (символы)', en: 'Max. capacity (characters)' }),
    required: t({ ru: 'Обязательное поле', en: 'Required field' }),
    nameMin: t({
      ru: 'Название должно содержать минимум 4 символа',
      en: 'Name must be at least 4 characters long',
    }),
    nameMax: t({
      ru: 'Название должно содержать максимум 64 символа',
      en: 'Name must be at most 64 characters long',
    }),
    invalidNumber: t({ ru: 'Недопустимое значение', en: 'Invalid value' }),
    capacityMin: t({
      ru: 'Минимальная ёмкость — 64 символа',
      en: 'Minimum capacity is 64 characters',
    }),
    capacityMax: t({
      ru: 'Максимальная ёмкость — 10000 символов',
      en: 'Maximum capacity is 10,000 characters',
    }),
    updated: t({ ru: 'Шаблон обновлён', en: 'Template updated' }),
    cancel: t({ ru: 'Отмена', en: 'Cancel' }),
    save: t({ ru: 'Сохранить', en: 'Save' }),
  },
} satisfies Dictionary

export default content
