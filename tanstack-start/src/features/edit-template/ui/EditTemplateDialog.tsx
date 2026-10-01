import { createRequiredString } from '@/shared/lib/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import type { DialogProps } from '@/shared/ui/dialog-provider'
import type { TemplateUpdate } from '@/shared/api/admin'
import { templateMutations } from '@/entities/template'
import { templateKeys } from '@/entities/template'
import { useAppForm } from '@/shared/ui/form'
import { getMessageFromError } from '@/shared/lib/utils'
import { useAppLocale, type AppLocale } from '@/shared/lib/i18n'
import { useIntlayer } from 'react-intlayer'
import { Button } from '@/shared/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

interface EditTemplateValidationMessages {
  nameMin: string
  nameMax: string
  invalidNumber: string
  capacityMin: string
  capacityMax: string
}

const createEditTemplateSchema = (messages: EditTemplateValidationMessages, locale: AppLocale) =>
  z.object({
    name: createRequiredString(locale)
      .min(4, { message: messages.nameMin })
      .max(64, { message: messages.nameMax }),
    max_capacity_chars: z
      .number({ message: messages.invalidNumber })
      .int({ message: messages.invalidNumber })
      .min(64, { message: messages.capacityMin })
      .max(10000, { message: messages.capacityMax }),
  })

type EditTemplateFormValues = z.infer<ReturnType<typeof createEditTemplateSchema>>

interface EditTemplateDialogProps {
  templateId: string
  initialName: string
  initialMaxCapacityChars: number
}

export function EditTemplateDialog({
  templateId,
  initialName,
  initialMaxCapacityChars,
  onClose,
}: DialogProps<EditTemplateDialogProps>) {
  const { locale } = useAppLocale()
  const content = useIntlayer('edit-template')
  const editTemplateSchema = createEditTemplateSchema(
    {
      nameMin: content.nameMin.value,
      nameMax: content.nameMax.value,
      invalidNumber: content.invalidNumber.value,
      capacityMin: content.capacityMin.value,
      capacityMax: content.capacityMax.value,
    },
    locale,
  )
  const queryClient = useQueryClient()
  const [conflictName, setConflictName] = useState<string | null>(null)
  const defaultValues = {
    name: initialName,
    max_capacity_chars: initialMaxCapacityChars,
  } satisfies EditTemplateFormValues

  const mutation = useMutation({
    ...templateMutations.updateTemplate(),
    onSuccess: () => {
      setConflictName(null)
      void queryClient.invalidateQueries({ queryKey: templateKeys.templates() })
      void queryClient.invalidateQueries({
        queryKey: templateKeys.templateDetail(templateId),
      })
      toast.success(content.updated.value)
      onClose()
    },
  })

  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: editTemplateSchema,
    },
    onSubmit: async ({ value }) => {
      const data: TemplateUpdate = {
        name: value.name,
        max_capacity_chars: value.max_capacity_chars,
      }

      try {
        await mutation.mutateAsync({ templateId, data })
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 409) {
          setConflictName(value.name)
        }
        toast.error(getMessageFromError(e, undefined, locale))
      }
    },
  })

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{content.title}</DialogTitle>
        <DialogDescription>{content.description}</DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.AppField name="name">
          {(field) => <field.TextFieldForm label={content.name.value} />}
        </form.AppField>

        <form.AppField name="max_capacity_chars">
          {(field) => (
            <field.NumberFieldForm
              label={content.capacity.value}
              mode="integer"
            />
          )}
        </form.AppField>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {content.cancel}
          </Button>
          <form.AppForm>
            <form.Subscribe selector={(state) => state.values.name}>
              {(name) => (
                <form.SubmitButton disabled={conflictName === name}>
                  {content.save}
                </form.SubmitButton>
              )}
            </form.Subscribe>
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
