import { z } from 'zod'

export const requiredString = z.string().trim().min(1, { message: 'Обязательное поле' })

export const fileSchema = z.custom<File>((val) => val instanceof File, {
  message: 'Неверный формат файла',
})
