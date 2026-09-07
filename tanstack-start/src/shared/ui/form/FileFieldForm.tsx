import { toast } from 'sonner'
import { useRef } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import { XIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from './form-context'

export interface FileFieldFormProps {
  label?: string
  description?: string
  accept?: string
  allowedExtensions?: readonly string[]
  allowedMimeTypes?: readonly string[]
  invalidFileMessage?: string
}

const getFileExtension = (fileName: string): string => {
  const dotIndex = fileName.toLowerCase().lastIndexOf('.')
  return dotIndex === -1 ? '' : fileName.slice(dotIndex).toLowerCase()
}

function normalizeExtension(extension: string): string {
  const normalized = extension.trim().toLowerCase()

  if (normalized === '' || normalized.startsWith('.')) {
    return normalized
  }

  return `.${normalized}`
}

export function FileFieldForm({
  label,
  description,
  accept,
  allowedExtensions,
  allowedMimeTypes,
  invalidFileMessage,
}: FileFieldFormProps) {
  const field = useFieldContext<File | null>()
  const inputRef = useRef<HTMLInputElement>(null)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null

    if (file) {
      const extension = getFileExtension(file.name)
      const mime = file.type?.toLowerCase() ?? ''

      const extensionOk =
        allowedExtensions === undefined ||
        allowedExtensions.some((allowedExtension) => {
          return normalizeExtension(allowedExtension) === extension
        })
      const mimeOk =
        allowedMimeTypes === undefined ||
        mime === '' ||
        allowedMimeTypes.some((allowedMime) => allowedMime.trim().toLowerCase() === mime)

      if (!extensionOk || !mimeOk) {
        toast.error(invalidFileMessage ?? 'Выбран файл недопустимого формата')
        e.target.value = ''
        field.handleChange(null)
        return
      }
    }

    field.handleChange(file)
  }

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    event.currentTarget.value = ''
  }

  const clearFile = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }

    field.handleChange(null)
    field.handleBlur()
  }

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <div className="flex min-w-0 items-center gap-3">
        <label className="has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 hover:bg-accent hover:text-accent-foreground relative shrink-0 cursor-pointer overflow-hidden rounded-md border border-dashed border-input bg-background px-4 py-2 text-sm transition-[color,box-shadow] has-[:focus-visible]:ring-[3px]">
          <span>Выбрать файл</span>

          <Input
            ref={inputRef}
            id={field.name}
            name={field.name}
            type="file"
            accept={accept}
            aria-label={label ?? 'Выбрать файл'}
            aria-invalid={isInvalid}
            className="absolute inset-0 h-full cursor-pointer opacity-0"
            onClick={handleClick}
            onChange={handleChange}
            onBlur={field.handleBlur}
          />
        </label>

        <span className="text-muted-foreground min-w-0 truncate text-sm">
          {field.state.value?.name ?? 'Файл не выбран'}
        </span>

        {field.state.value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Удалить файл ${field.state.value.name}`}
            onClick={clearFile}
          >
            <XIcon />
          </Button>
        )}
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
