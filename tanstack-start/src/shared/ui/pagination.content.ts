import { t, type Dictionary } from 'intlayer'

export default {
  key: 'shared-ui-pagination',
  content: {
    pagination: t({ ru: 'Пагинация', en: 'Pagination' }),
    previous: t({ ru: 'Назад', en: 'Previous' }),
    previousPage: t({ ru: 'Перейти на предыдущую страницу', en: 'Go to previous page' }),
    next: t({ ru: 'Вперед', en: 'Next' }),
    nextPage: t({ ru: 'Перейти на следующую страницу', en: 'Go to next page' }),
    morePages: t({ ru: 'Другие страницы', en: 'More pages' }),
  },
} satisfies Dictionary
