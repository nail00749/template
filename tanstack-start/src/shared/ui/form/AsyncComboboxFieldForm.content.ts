import { t, type Dictionary } from 'intlayer'

export default {
  key: 'shared-ui-async-combobox-field',
  content: {
    placeholder: t({ ru: 'Начните вводить для поиска', en: 'Start typing to search' }),
    empty: t({ ru: 'Ничего не найдено', en: 'No results found' }),
    loadMore: t({ ru: 'Показать ещё', en: 'Show more' }),
    loading: t({ ru: 'Загрузка вариантов', en: 'Loading options' }),
    updating: t({ ru: 'Обновление результатов поиска', en: 'Updating search results' }),
  },
} satisfies Dictionary
