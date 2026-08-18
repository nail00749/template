import { toast } from 'sonner'
import type { ChangeEvent, FC } from 'react'
import { Input } from '@/shared/ui/input'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from '@/shared/form/index'

interface FileFieldFormProps {
  label?: string
  description?: string
  accept?: string
  allowedExtensions?: readonly string[]
  allowedMimeTypes?: readonly string[]
  invalidFileMessage?: string
}

const getFileExtension = (fileName: string): string => {
  const dotIndex = fileName.toLowerCase().lastIndexOf('.')
  return dotIndex === -1 ? '' : fileName.slice(dotIndex)
}

export const FileFieldForm: FC<FileFieldFormProps> = ({
  label,
  description,
  accept,
  allowedExtensions,
  allowedMimeTypes,
  invalidFileMessage,
}) => {
  const field = useFieldContext<File | null>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null

    if (file) {
      const extension = getFileExtension(file.name)
      const mime = file.type?.toLowerCase() ?? ''

      const extensionOk = allowedExtensions === undefined || allowedExtensions.includes(extension)
      const mimeOk =
        allowedMimeTypes === undefined || mime === '' || allowedMimeTypes.includes(mime)

      if (!extensionOk || !mimeOk) {
        toast.error(invalidFileMessage ?? 'Выбран файл недопустимого формата')
        e.target.value = ''
        field.handleChange(null)
        return
      }
    }

    field.handleChange(file)
  }

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <div className="flex items-center gap-3">
        <label
          tabIndex={0}
          htmlFor={field.name}
          className="cursor-pointer"
          onBlur={field.handleBlur}
        >
          <div className="hover:bg-accent hover:text-accent-foreground rounded-md border border-dashed border-input bg-background px-4 py-2 text-sm transition-colors">
            Выбрать файл
          </div>

          <Input
            id={field.name}
            name={field.name}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={handleChange}
          />
        </label>

        <span className="text-muted-foreground truncate text-sm">
          {field.state.value?.name ?? 'Файл не выбран'}
        </span>
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
