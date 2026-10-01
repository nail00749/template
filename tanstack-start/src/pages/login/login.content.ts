import { t, type Dictionary } from 'intlayer'

export default {
  key: 'login-page',
  content: {
    title: t({ ru: 'Вход в систему', en: 'Sign in' }),
    corporateLogin: t({
      ru: 'Войти через корпоративный аккаунт',
      en: 'Sign in with your corporate account',
    }),
  },
} satisfies Dictionary
