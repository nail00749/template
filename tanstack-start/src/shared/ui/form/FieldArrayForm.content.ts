import { t, type Dictionary } from 'intlayer'

export default {
  key: 'shared-ui-field-array',
  content: {
    add: t({ ru: 'Добавить', en: 'Add' }),
    empty: t({ ru: 'Элементы не добавлены', en: 'No items added' }),
    item: t({ ru: 'Элемент', en: 'Item' }),
    moveUp: t({ ru: 'Переместить {{item}} {{index}} вверх', en: 'Move {{item}} {{index}} up' }),
    moveDown: t({ ru: 'Переместить {{item}} {{index}} вниз', en: 'Move {{item}} {{index}} down' }),
    remove: t({ ru: 'Удалить {{item}} {{index}}', en: 'Remove {{item}} {{index}}' }),
  },
} satisfies Dictionary
