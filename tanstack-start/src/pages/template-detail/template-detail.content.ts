import { t, type Dictionary } from 'intlayer'

export default {
  key: 'template-detail-page',
  content: {
    back: t({ ru: 'К шаблонам', en: 'Back to templates' }),
    template: t({ ru: 'Шаблон', en: 'Template' }),
    created: t({ ru: 'Создан:', en: 'Created:' }),
    reupload: t({ ru: 'Повторно загрузить PPTX', en: 'Reupload PPTX' }),
    edit: t({ ru: 'Редактировать шаблон', en: 'Edit template' }),
    empty: t({ ru: 'Нет слайдов для отображения', en: 'No slides to display' }),
    slide: t({ ru: 'Слайд', en: 'Slide' }),
    deleteSlide: t({ ru: 'Удалить слайд', en: 'Delete slide' }),
    deleteSlidePrompt: t({
      ru: 'Вы уверены, что хотите удалить слайд',
      en: 'Are you sure you want to delete slide',
    }),
    delete: t({ ru: 'Удалить', en: 'Delete' }),
  },
} satisfies Dictionary
