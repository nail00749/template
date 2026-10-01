import { createRequiredString } from '@/shared/lib/schemas'
import { useAppLocale, type AppLocale } from '@/shared/lib/i18n'
import { templateKeys } from '@/entities/template'
import { templateMutations } from '@/entities/template'
import type { BodyUploadTemplateApiV1AdminTemplatesPost } from '@/shared/api/admin'
import type { DialogProps } from '@/shared/ui/dialog-provider'

import { useAppForm } from '@/shared/ui/form'
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
import { useIntlayer } from 'react-intlayer'

interface UploadTemplateValidationMessages {
  nameMin: string
  nameMax: string
  fileRequired: string
  pptxExtension: string
  invalidNumber: string
  capacityMin: string
  capacityMax: string
}

const createUploadTemplateSchema = (
  messages: UploadTemplateValidationMessages,
  locale: AppLocale,
) =>
  z.object({
    name: createRequiredString(locale)
      .min(4, { message: messages.nameMin })
      .max(64, { message: messages.nameMax }),
    file: z
      .custom<File | null>((value) => value instanceof File, {
        error: messages.fileRequired,
      })
      .refine((file) => file instanceof File && file.name.toLowerCase().endsWith('.pptx'), {
        error: messages.pptxExtension,
      }),
    max_capacity_chars: z
      .number({ message: messages.invalidNumber })
      .int({ message: messages.invalidNumber })
      .min(64, { message: messages.capacityMin })
      .max(10000, { message: messages.capacityMax }),
  })

type UploadTemplateFormValues = z.infer<ReturnType<typeof createUploadTemplateSchema>>

export function UploadTemplateDialog({ onClose }: DialogProps<Record<string, never>>) {
  const { locale } = useAppLocale()
  const content = useIntlayer('upload-template')
  const uploadTemplateSchema = createUploadTemplateSchema(
    {
      nameMin: content.nameMin.value,
      nameMax: content.nameMax.value,
      fileRequired: content.fileRequired.value,
      pptxExtension: content.pptxExtension.value,
      invalidNumber: content.invalidNumber.value,
      capacityMin: content.capacityMin.value,
      capacityMax: content.capacityMax.value,
    },
    locale,
  )
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
      toast.success(content.uploaded.value)
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
        toast.error(content.fileRequired.value)
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
        <DialogTitle>{content.title}</DialogTitle>
        <DialogDescription>{content.description}</DialogDescription>
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
              label={content.name.value}
              placeholder={content.namePlaceholder.value}
              description={content.nameDescription.value}
            />
          )}
        </form.AppField>

        <form.AppField name="max_capacity_chars">
          {(field) => (
            <field.NumberFieldForm
              label={content.capacity.value}
              mode="integer"
              description={content.capacityDescription.value}
            />
          )}
        </form.AppField>

        <form.AppField name="file">
          {(field) => (
            <field.FileFieldForm
              label={content.file.value}
              accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              allowedExtensions={['.pptx']}
              allowedMimeTypes={[
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              ]}
              invalidFileMessage={content.pptxExtension.value}
              description={content.fileDescription.value}
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
            {content.cancel}
          </Button>
          <form.AppForm>
            <form.Subscribe selector={(state) => state.values.name}>
              {(name) => (
                <form.SubmitButton disabled={conflictName === name}>
                  {content.upload}
                </form.SubmitButton>
              )}
            </form.Subscribe>
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
