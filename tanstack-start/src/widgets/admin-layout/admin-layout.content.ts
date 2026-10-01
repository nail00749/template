import { t, type Dictionary } from 'intlayer'

export default {
  key: 'admin-layout',
  content: {
    templates: t({ ru: 'Шаблоны', en: 'Templates' }),
    navigation: t({ ru: 'Навигация', en: 'Navigation' }),
    logout: t({ ru: 'Выйти', en: 'Log out' }),
    adminPanel: t({ ru: 'Панель администратора', en: 'Admin panel' }),
  },
} satisfies Dictionary
