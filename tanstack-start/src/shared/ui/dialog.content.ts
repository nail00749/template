import { t, type Dictionary } from 'intlayer'

export default {
  key: 'shared-ui-dialog',
  content: {
    close: t({ ru: 'Закрыть', en: 'Close' }),
    confirm: t({ ru: 'Подтвердить', en: 'Confirm' }),
    cancel: t({ ru: 'Отмена', en: 'Cancel' }),
  },
} satisfies Dictionary
