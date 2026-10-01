import { t } from 'intlayer'
import type { Dictionary } from 'intlayer'

const content = {
  key: 'upload-template',
  content: {
    title: t({ ru: 'Загрузить шаблон', en: 'Upload template' }),
    description: t({
      ru: 'Загрузите новый шаблон презентации в формате PPTX.',
      en: 'Upload a new presentation template in PPTX format.',
    }),
    name: t({ ru: 'Название', en: 'Name' }),
    namePlaceholder: t({ ru: 'Мой шаблон', en: 'My template' }),
    nameDescription: t({
      ru: 'Человекочитаемое название шаблона.',
      en: 'A readable name for the template.',
    }),
    capacity: t({ ru: 'Макс. ёмкость (символы)', en: 'Max. capacity (characters)' }),
    capacityDescription: t({
      ru: 'Максимальное количество символов для генерации.',
      en: 'Maximum number of characters for generation.',
    }),
    file: t({ ru: 'Файл шаблона', en: 'Template file' }),
    fileDescription: t({
      ru: 'Файл презентации в формате PPTX.',
      en: 'A presentation file in PPTX format.',
    }),
    fileRequired: t({ ru: 'Выберите файл шаблона', en: 'Select a template file' }),
    pptxExtension: t({
      ru: 'Поддерживаются только файлы с расширением .pptx',
      en: 'Only .pptx files are supported',
    }),
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
    uploaded: t({ ru: 'Шаблон успешно загружен', en: 'Template uploaded' }),
    cancel: t({ ru: 'Отмена', en: 'Cancel' }),
    upload: t({ ru: 'Загрузить', en: 'Upload' }),
  },
} satisfies Dictionary

export default content
