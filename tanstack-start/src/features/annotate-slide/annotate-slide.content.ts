import { t } from 'intlayer'
import type { Dictionary } from 'intlayer'

const content = {
  key: 'annotate-slide',
  content: {
    title: t({ ru: 'Разметка зон шаблона', en: 'Template zone annotations' }),
    description: t({
      ru: 'Настройте типы полей для автоматического заполнения. Зоны показаны для всех слайдов шаблона.',
      en: 'Set field types for automatic filling. Zones are shown for all template slides.',
    }),
    loadError: t({ ru: 'Ошибка загрузки:', en: 'Loading error:' }),
    noZones: t({ ru: 'Зоны не найдены', en: 'No zones found' }),
    slide: t({ ru: 'Слайд', en: 'Slide' }),
    unsavedChanges: t({
      ru: 'Есть несохраненные изменения',
      en: 'Unsaved changes',
    }),
    noChanges: t({ ru: 'Нет изменений', en: 'No changes' }),
    saved: t({ ru: 'Аннотации сохранены', en: 'Annotations saved' }),
    cancel: t({ ru: 'Отмена', en: 'Cancel' }),
    save: t({ ru: 'Сохранить', en: 'Save' }),
    placeholderIndex: t({ ru: 'Индекс плейсхолдера:', en: 'Placeholder index:' }),
    noGeometry: t({ ru: 'Без геометрии', en: 'No geometry' }),
    fieldTypes: {
      text_large: t({ ru: 'Текст (большой)', en: 'Text (large)' }),
      text_medium: t({ ru: 'Текст (средний)', en: 'Text (medium)' }),
      text_small: t({ ru: 'Текст (маленький)', en: 'Text (small)' }),
      subheading: t({ ru: 'Подзаголовок', en: 'Subheading' }),
      date: t({ ru: 'Дата', en: 'Date' }),
      person_name: t({ ru: 'Имя человека', en: 'Person name' }),
      phone: t({ ru: 'Телефон', en: 'Phone' }),
      email: t({ ru: 'Email', en: 'Email' }),
      address: t({ ru: 'Адрес', en: 'Address' }),
      company: t({ ru: 'Компания', en: 'Company' }),
      job_title: t({ ru: 'Должность', en: 'Job title' }),
      caption: t({ ru: 'Подпись', en: 'Caption' }),
      slide_number: t({ ru: 'Номер слайда', en: 'Slide number' }),
      image: t({ ru: 'Изображение', en: 'Image' }),
      table: t({ ru: 'Таблица', en: 'Table' }),
      chart: t({ ru: 'Диаграмма', en: 'Chart' }),
      logo: t({ ru: 'Логотип', en: 'Logo' }),
      unknown: t({ ru: 'Неизвестно', en: 'Unknown' }),
    },
    sources: {
      per_template_override: t({ ru: 'Шаблон', en: 'Template' }),
      layout_override: t({ ru: 'Макет', en: 'Layout' }),
      heuristic: t({ ru: 'Авто', en: 'Auto' }),
    },
  },
} satisfies Dictionary

export default content
