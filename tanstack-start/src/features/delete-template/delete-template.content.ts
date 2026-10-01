import { t } from 'intlayer'
import type { Dictionary } from 'intlayer'

const content = {
  key: 'delete-template',
  content: {
    title: t({ ru: 'Удалить шаблон', en: 'Delete template' }),
    descriptionBeforeName: t({
      ru: 'Вы уверены, что хотите удалить шаблон "',
      en: 'Are you sure you want to delete template "',
    }),
    descriptionAfterName: t({
      ru: '"? Это действие нельзя отменить.',
      en: '"? This action cannot be undone.',
    }),
    hardDelete: t({
      ru: 'Удалить без возможности восстановления',
      en: 'Delete permanently',
    }),
    cancel: t({ ru: 'Отмена', en: 'Cancel' }),
    delete: t({ ru: 'Удалить', en: 'Delete' }),
  },
} satisfies Dictionary

export default content
