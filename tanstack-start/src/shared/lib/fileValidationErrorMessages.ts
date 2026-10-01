import { getIntlayer } from 'intlayer'
import { getBrowserLocale, type AppLocale } from './i18n/locale'

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

export function getFileValidationErrorMessage(
  code: string,
  fallback?: string,
  locale: AppLocale = getBrowserLocale(),
): string {
  const content = getIntlayer('shared-errors', locale)
  const message = Object.entries(content.file).find(([key]) => key === code)?.[1]
  return message ?? fallback ?? content.uploadFailed
}
