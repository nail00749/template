import { t, type Dictionary } from 'intlayer'

export default {
  key: 'root-error-boundary',
  content: {
    unknown: t({ ru: 'Неизвестная ошибка', en: 'Unknown error' }),
    genericTitle: t({ ru: 'Что-то пошло не так', en: 'Something went wrong' }),
    genericDescription: t({
      ru: 'Что-то пошло не так. Попробуйте обновить страницу.',
      en: 'Something went wrong. Try refreshing the page.',
    }),
    retry: t({ ru: 'Повторить', en: 'Retry' }),
    retryAria: t({ ru: 'Повторить попытку', en: 'Try again' }),
    authUnavailableTitle: t({
      ru: 'Сервер авторизации недоступен',
      en: 'Authentication server unavailable',
    }),
    authUnavailableDescription: t({
      ru: 'Не получилось связаться с сервером. Проверьте интернет-соединение и попробуйте снова.',
      en: 'Could not connect to the server. Check your internet connection and try again.',
    }),
    sessionExpiredTitle: t({ ru: 'Сессия истекла', en: 'Session expired' }),
    sessionExpiredDescription: t({
      ru: 'Ваша сессия закончилась. Войдите снова, чтобы продолжить.',
      en: 'Your session has ended. Sign in again to continue.',
    }),
    authCheckTitle: t({
      ru: 'Не удалось проверить авторизацию',
      en: 'Could not verify authentication',
    }),
    goToLogin: t({ ru: 'Перейти ко входу', en: 'Go to sign in' }),
  },
} satisfies Dictionary
