import { t } from 'intlayer'
import type { Dictionary } from 'intlayer'

const content = {
  key: 'reupload-template',
  content: {
    title: t({ ru: 'Перезагрузить PPTX', en: 'Replace PPTX' }),
    descriptionBeforeName: t({
      ru: 'Замените файл шаблона "',
      en: 'Replace the file for template "',
    }),
    descriptionAfterName: t({
      ru: '". Новый файл PPTX заменит существующие слайды.',
      en: '". The new PPTX file will replace the existing slides.',
    }),
    file: t({ ru: 'Файл шаблона', en: 'Template file' }),
    fileDescription: t({
      ru: 'Файл презентации в формате PPTX.',
      en: 'A presentation file in PPTX format.',
    }),
    fileRequired: t({ ru: 'Выберите файл шаблона', en: 'Select a template file' }),
    pptxExtension: t({
      ru: 'Поддерживаются только файлы с расширением .pptx',
      en: 'Only .pptx files are supported',
    }),
    updated: t({ ru: 'Файл шаблона обновлён', en: 'Template file updated' }),
    cancel: t({ ru: 'Отмена', en: 'Cancel' }),
    update: t({ ru: 'Обновить', en: 'Update' }),
  },
} satisfies Dictionary

export default content
