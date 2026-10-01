import { getIntlayer } from 'intlayer'
import type { AppLocale } from './i18n/locale'
import { z } from 'zod'

export function createRequiredString(locale: AppLocale) {
  return z
    .string()
    .trim()
    .min(1, { message: getIntlayer('shared-errors', locale).required })
}

export const requiredString = createRequiredString('ru')

export function createFileSchema(locale: AppLocale) {
  return z.custom<File>((value) => typeof File !== 'undefined' && value instanceof File, {
    message: getIntlayer('shared-errors', locale).invalidFile,
  })
}

export const fileSchema = createFileSchema('ru')
