import { t } from 'intlayer'
import type { Dictionary } from 'intlayer'

const content = {
  key: 'sync-template',
  content: {
    synced: t({ ru: 'Шаблон синхронизирован с каталогом', en: 'Template synced with catalog' }),
  },
} satisfies Dictionary

export default content
