# Files

## FileFieldForm

Для загрузки файлов в форму используй `FileFieldForm` из `@/shared/form`:

```tsx
<form.AppField name="attachment">
  {(field) => (
    <field.FileFieldForm
      label="Вложение"
      accept=".pdf,.docx"
      allowedExtensions={['.pdf', '.docx']}
      allowedMimeTypes={[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]}
      invalidFileMessage="Только PDF и DOCX"
    />
  )}
</form.AppField>
```

Параметры:

- `accept` — стандартный HTML-атрибут для input type="file".
- `allowedExtensions` — массив допустимых расширений (включая точку).
- `allowedMimeTypes` — массив допустимых MIME-типов.
- `invalidFileMessage` — кастомное сообщение об ошибке.

По умолчанию поле опционально. Чтобы сделать обязательным — добавь в Zod-схему:

```ts
const schema = z.object({
  attachment: z.instanceof(File, { message: 'Выберите файл' }),
})
```

## buildFormData

Для отправки multipart/form-data используй `buildFormData` из
`@/shared/api/formData`:

```ts
import { buildFormData } from '@/shared/api/formData'

const formData = buildFormData({
  name: value.name,
  file: value.file, // File или Blob
})

await api.uploadDocument(formData)
```

`buildFormData` автоматически:

- Пропускает `undefined` и `null`.
- Обрабатывает массивы (каждый элемент — отдельное поле).
- Поддерживает `Blob` и `string`.

## Валидация файлов на клиенте

`FileFieldForm` валидирует по расширению и MIME-типу. Не дублируй это в
Zod-схеме — Zod не имеет доступа к MIME-типу File в браузере.

Проверяй размер файла, если нужно, в `onChange` поля или в `onSubmit` формы
перед вызовом API.

## Ошибки с сервера

Серверные ошибки валидации файлов приходят с кодом (см.
`@/shared/lib/fileValidationErrorMessages`). Используй
`getFileValidationErrorMessage(code)` для отображения:

```ts
import { getFileValidationErrorMessage } from '@/shared/lib/fileValidationErrorMessages'

// Для локальной обработки mutation должна иметь meta: { disableToast: true }
const message = getFileValidationErrorMessage(error.code, 'Не удалось загрузить файл')
toast.error(message)
```

## Preview

Для preview изображений используй `URL.createObjectURL(file)` в `useEffect`:

```ts
const previewUrl = useMemo(() => {
  if (!file) return null
  return URL.createObjectURL(file)
}, [file])

// Не забудь revokeObjectURL при размонтировании/смене файла
useEffect(() => {
  return () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }
}, [previewUrl])
```

Для не-изображений (PDF, DOCX) показывай иконку + имя файла, не пытайся
рендерить содержимое.

## Правила

- Всегда используй `FileFieldForm` — не создавай кастомный input file.
- Не используй `z.instanceof(File)` для опциональных полей — добавляй
  `.optional()` или `.nullable()`.
- После успешной загрузки показывай `toast.success(...)`.
- По умолчанию ошибку загрузки показывает глобальный mutation handler.
- Если нужен file-specific или field-level текст, установи
  `meta: { disableToast: true }` и покажи ровно один локальный toast через
  `getFileValidationErrorMessage`/`getMessageFromError`.
