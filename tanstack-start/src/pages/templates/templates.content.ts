import { t, type Dictionary } from 'intlayer'

export default {
  key: 'templates-page',
  content: {
    title: t({ ru: 'Шаблоны презентаций', en: 'Presentation templates' }),
    description: t({ ru: 'Управление шаблонами', en: 'Manage templates' }),
    upload: t({ ru: 'Загрузить шаблон', en: 'Upload template' }),
    allTemplates: t({ ru: 'Все шаблоны', en: 'All templates' }),
    name: t({ ru: 'Название', en: 'Name' }),
    slides: t({ ru: 'Слайды', en: 'Slides' }),
    createdAt: t({ ru: 'Дата создания', en: 'Created at' }),
    open: t({ ru: 'Открыть', en: 'Open' }),
    edit: t({ ru: 'Редактировать', en: 'Edit' }),
    delete: t({ ru: 'Удалить', en: 'Delete' }),
    actions: t({ ru: 'Действия', en: 'Actions' }),
  },
} satisfies Dictionary
