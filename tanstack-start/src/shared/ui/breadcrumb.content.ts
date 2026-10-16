import { t, type Dictionary } from 'intlayer'

export default {
  key: 'shared-ui-breadcrumb',
  content: {
    label: t({ ru: 'Путь навигации', en: 'Breadcrumb' }),
    more: t({ ru: 'Ещё', en: 'More' }),
  },
} satisfies Dictionary
