export type FileValidationErrorCode =
  | 'empty_file'
  | 'missing_filename'
  | 'unsupported_extension'
  | 'broken_structure'
  | 'invalid_pdf'
  | 'invalid_docx'
  | 'invalid_xlsx'
  | 'missing_header'
  | 'missing_required_columns'
  | 'no_data_rows'
  | 'empty_required_cells'
  | 'invalid_reference'

const FILE_VALIDATION_ERROR_MESSAGES: Record<FileValidationErrorCode, string> = {
  empty_file: 'Загруженный файл пуст',
  missing_filename: 'Не удалось определить имя файла',
  unsupported_extension: 'Неподдерживаемый формат файла',
  broken_structure: 'Структура файла повреждена',
  invalid_pdf: 'Не удалось прочитать PDF — файл повреждён или защищён',
  invalid_docx: 'Не удалось прочитать DOCX — файл повреждён',
  invalid_xlsx: 'Не удалось прочитать XLSX — файл повреждён',
  missing_header: 'В файле отсутствует строка заголовков',
  missing_required_columns: 'В файле отсутствуют обязательные колонки (Условие, Пояснение)',
  no_data_rows: 'Файл не содержит строк с данными',
  empty_required_cells: 'В строках есть пустые обязательные ячейки',
  invalid_reference: 'Эталон недоступен для использования',
}

export function getFileValidationErrorMessage(code: string, fallback?: string): string {
  if (code in FILE_VALIDATION_ERROR_MESSAGES) {
    return FILE_VALIDATION_ERROR_MESSAGES[code as FileValidationErrorCode]
  }
  return fallback ?? 'Не удалось загрузить файл'
}
