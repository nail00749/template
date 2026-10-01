import { t, type Dictionary } from 'intlayer'

export default {
  key: 'not-found',
  content: {
    title: t({ ru: 'Страница не найдена', en: 'Page not found' }),
    description: t({
      ru: 'Проверьте адрес или вернитесь к списку шаблонов.',
      en: 'Check the address or return to the templates list.',
    }),
    templates: t({ ru: 'К шаблонам', en: 'Back to templates' }),
  },
} satisfies Dictionary
