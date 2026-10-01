import { t, type Dictionary } from 'intlayer'

export default {
  key: 'shared-ui-file-field',
  content: {
    invalid: t({
      ru: 'Выбран файл недопустимого формата',
      en: 'The selected file has an unsupported format',
    }),
    choose: t({ ru: 'Выбрать файл', en: 'Choose file' }),
    none: t({ ru: 'Файл не выбран', en: 'No file selected' }),
    remove: t({ ru: 'Удалить файл {{name}}', en: 'Remove file {{name}}' }),
  },
} satisfies Dictionary
