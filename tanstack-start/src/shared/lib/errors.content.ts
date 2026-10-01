import { t, type Dictionary } from 'intlayer'

export default {
  key: 'shared-errors',
  content: {
    unknown: t({ ru: 'Неизвестная ошибка', en: 'Unknown error' }),
    uploadFailed: t({ ru: 'Не удалось загрузить файл', en: 'Failed to upload the file' }),
    required: t({ ru: 'Обязательное поле', en: 'Required field' }),
    invalidFile: t({ ru: 'Неверный формат файла', en: 'Invalid file format' }),
    file: {
      empty_file: t({ ru: 'Загруженный файл пуст', en: 'The uploaded file is empty' }),
      missing_filename: t({
        ru: 'Не удалось определить имя файла',
        en: 'Could not determine the file name',
      }),
      unsupported_extension: t({
        ru: 'Неподдерживаемый формат файла',
        en: 'Unsupported file format',
      }),
      broken_structure: t({
        ru: 'Структура файла повреждена',
        en: 'The file structure is corrupted',
      }),
      invalid_pdf: t({
        ru: 'Не удалось прочитать PDF — файл повреждён или защищён',
        en: 'Could not read the PDF — the file is corrupted or protected',
      }),
      invalid_docx: t({
        ru: 'Не удалось прочитать DOCX — файл повреждён',
        en: 'Could not read the DOCX — the file is corrupted',
      }),
      invalid_xlsx: t({
        ru: 'Не удалось прочитать XLSX — файл повреждён',
        en: 'Could not read the XLSX — the file is corrupted',
      }),
      missing_header: t({
        ru: 'В файле отсутствует строка заголовков',
        en: 'The file has no header row',
      }),
      missing_required_columns: t({
        ru: 'В файле отсутствуют обязательные колонки (Условие, Пояснение)',
        en: 'The file is missing required columns (Condition, Explanation)',
      }),
      no_data_rows: t({
        ru: 'Файл не содержит строк с данными',
        en: 'The file contains no data rows',
      }),
      empty_required_cells: t({
        ru: 'В строках есть пустые обязательные ячейки',
        en: 'Some required cells are empty',
      }),
      invalid_reference: t({
        ru: 'Эталон недоступен для использования',
        en: 'The reference is unavailable',
      }),
    },
  },
} satisfies Dictionary
