import { t, type Dictionary } from 'intlayer'

export default {
  key: 'shared-ui-data-grid',
  content: {
    noData: t({ ru: 'Нет данных для отображения', en: 'No data to display' }),
    loading: t({ ru: 'Загрузка данных...', en: 'Loading data...' }),
    updating: t({ ru: 'Обновление данных...', en: 'Updating data...' }),
    open: t({ ru: 'Открыть', en: 'Open' }),
    previous: t({ ru: 'Назад', en: 'Previous' }),
    next: t({ ru: 'Вперед', en: 'Next' }),
    summary: t({
      ru: 'Показано {{start}}-{{end}} из {{total}}',
      en: 'Showing {{start}}-{{end}} of {{total}}',
    }),
  },
} satisfies Dictionary
