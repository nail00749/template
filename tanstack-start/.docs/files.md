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
- `allowedExtensions` — массив допустимых расширений. Регистр и начальная точка
  нормализуются (`pdf`, `.pdf`, `.PDF` эквивалентны).
- `allowedMimeTypes` — массив допустимых MIME-типов.
- `invalidFileMessage` — кастомное сообщение об ошибке.

Default field value is `null`. Use the shared SSR-safe `fileSchema`; to make the
field required, refine the nullable initial value in the form schema:

```ts
import { fileSchema } from '@/shared/lib/schemas'

const schema = z.object({
  attachment: fileSchema.nullable().refine((file) => file !== null, {
    message: 'Выберите файл',
  }),
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

Проверяй размер файла в Zod-схеме через `.refine(...)`; MIME и расширение
остаются ответственностью `FileFieldForm`.

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
- Поле уже поддерживает keyboard focus, повторный выбор того же файла и очистку;
  не дублируй эти controls на уровне feature.
- Не используй `z.instanceof(File)` для опциональных полей — добавляй
  `.optional()` или `.nullable()`.
- После успешной загрузки показывай `toast.success(...)`.
- По умолчанию ошибку загрузки показывает глобальный mutation handler.
- Если нужен file-specific или field-level текст, установи
  `meta: { disableToast: true }` и покажи ровно один локальный toast через
  `getFileValidationErrorMessage`/`getMessageFromError`.
