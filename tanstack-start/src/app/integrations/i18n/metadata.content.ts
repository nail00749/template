import { t, type Dictionary } from 'intlayer'

export default {
  key: 'route-metadata',
  content: {
    admin: t({ ru: 'Панель управления', en: 'Admin Panel' }),
    login: t({ ru: 'Вход — Admin Panel', en: 'Sign in — Admin Panel' }),
    templates: t({
      ru: 'Шаблоны презентаций — Admin Panel',
      en: 'Presentation templates — Admin Panel',
    }),
    template: t({ ru: 'Шаблон', en: 'Template' }),
  },
} satisfies Dictionary
