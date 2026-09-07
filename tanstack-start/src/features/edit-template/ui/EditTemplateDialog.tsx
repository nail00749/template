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
import { requiredString } from '@/shared/lib/schemas'
import { Button } from '@/shared/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

const editTemplateSchema = z.object({
  name: requiredString
    .min(4, { message: 'Название должно содержать минимум 4 символа' })
    .max(64, { message: 'Название должно содержать максимум 64 символа' }),
  max_capacity_chars: z
    .number({ message: 'Недопустимое значение' })
    .int()
    .min(64, { message: 'Минимальная ёмкость — 64 символа' })
    .max(10000, { message: 'Максимальная ёмкость — 10000 символов' }),
})

type EditTemplateFormValues = z.infer<typeof editTemplateSchema>

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
      toast.success('Шаблон обновлён')
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
        toast.error(getMessageFromError(e))
      }
    },
  })

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Редактировать шаблон</DialogTitle>
        <DialogDescription>Измените название шаблона презентации.</DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.AppField name="name">
          {(field) => <field.TextFieldForm label="Название шаблона" />}
        </form.AppField>

        <form.AppField name="max_capacity_chars">
          {(field) => (
            <field.NumberFieldForm
              label="Макс. ёмкость (символы)"
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
            Отмена
          </Button>
          <form.AppForm>
            <form.Subscribe selector={(state) => state.values.name}>
              {(name) => (
                <form.SubmitButton disabled={conflictName === name}>Сохранить</form.SubmitButton>
              )}
            </form.Subscribe>
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
