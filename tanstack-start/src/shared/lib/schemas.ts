import { z } from 'zod'

export const requiredString = z.string().trim().min(1, { message: 'Обязательное поле' })

export const fileSchema = z.custom<File>(
  (value) => typeof File !== 'undefined' && value instanceof File,
  { message: 'Неверный формат файла' },
)
