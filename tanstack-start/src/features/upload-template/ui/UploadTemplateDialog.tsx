import { templateKeys } from '@/entities/template'
import { templateMutations } from '@/entities/template'
import type { BodyUploadTemplateApiV1AdminTemplatesPost } from '@/shared/api/admin'
import type { DialogProps } from '@/shared/ui/dialog-provider'

import { useAppForm } from '@/shared/ui/form'
import { requiredString } from '@/shared/lib/schemas'
import { Button } from '@/shared/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

const fileRequiredMessage = 'Выберите файл шаблона'
const pptxExtensionMessage = 'Поддерживаются только файлы с расширением .pptx'

const uploadTemplateSchema = z.object({
  name: requiredString
    .min(4, { message: 'Название должно содержать минимум 4 символа' })
    .max(64, { message: 'Название должно содержать максимум 64 символа' }),
  file: z
    .custom<File | null>((value) => value instanceof File, {
      error: fileRequiredMessage,
    })
    .refine((file) => file instanceof File && file.name.toLowerCase().endsWith('.pptx'), {
      error: pptxExtensionMessage,
    }),
  max_capacity_chars: z
    .number({ message: 'Недопустимое значение' })
    .int()
    .min(64, { message: 'Минимальная ёмкость — 64 символа' })
    .max(10000, { message: 'Максимальная ёмкость — 10000 символов' }),
})

type UploadTemplateFormValues = z.infer<typeof uploadTemplateSchema>

export function UploadTemplateDialog({ onClose }: DialogProps<Record<string, never>>) {
  const queryClient = useQueryClient()
  const [conflictName, setConflictName] = useState<string | null>(null)
  const defaultValues: UploadTemplateFormValues = {
    name: '',
    file: null,
    max_capacity_chars: 10000,
  }
  const navigate = useNavigate()

  const mutation = useMutation({
    ...templateMutations.uploadTemplate(),
    onSuccess: (data) => {
      setConflictName(null)
      void queryClient.invalidateQueries({ queryKey: templateKeys.templates() })
      toast.success('Шаблон успешно загружен')
      onClose()
      void navigate({ to: '/templates/$templateId', params: { templateId: data.id } })
    },
  })

  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: uploadTemplateSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.file) {
        toast.error('Выберите файл шаблона')
        return
      }

      const body: BodyUploadTemplateApiV1AdminTemplatesPost = {
        name: value.name,
        file: value.file,
        max_capacity_chars: value.max_capacity_chars ?? 10000,
      }

      try {
        await mutation.mutateAsync(body)
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 409) {
          setConflictName(value.name)
        }
      }
    },
  })

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Загрузить шаблон</DialogTitle>
        <DialogDescription>Загрузите новый шаблон презентации в формате PPTX.</DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="gap-6 flex flex-col"
      >
        <form.AppField name="name">
          {(field) => (
            <field.TextFieldForm
              label="Название"
              placeholder="Мой шаблон"
              description="Человекочитаемое название шаблона."
            />
          )}
        </form.AppField>

        <form.AppField name="max_capacity_chars">
          {(field) => (
            <field.NumberFieldForm
              label="Макс. ёмкость (символы)"
              mode="integer"
              description="Максимальное количество символов для генерации."
            />
          )}
        </form.AppField>

        <form.AppField name="file">
          {(field) => (
            <field.FileFieldForm
              label="Файл шаблона"
              accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              allowedExtensions={['.pptx']}
              allowedMimeTypes={[
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              ]}
              invalidFileMessage="Поддерживаются только файлы с расширением .pptx"
              description="Файл презентации в формате PPTX."
            />
          )}
        </form.AppField>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Отмена
          </Button>
          <form.AppForm>
            <form.Subscribe selector={(state) => state.values.name}>
              {(name) => (
                <form.SubmitButton disabled={conflictName === name}>Загрузить</form.SubmitButton>
              )}
            </form.Subscribe>
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
