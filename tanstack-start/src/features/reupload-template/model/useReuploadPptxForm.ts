import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { templateKeys } from '@/entities/template'
import { templateMutations } from '@/entities/template'
import type { BodyReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut } from '@/shared/api/admin'
import { useAppForm } from '@/shared/ui/form'
import { getMessageFromError } from '@/shared/lib/utils'

const reuploadPptxSchema = z.object({
  file: z
    .custom<File | null>((value) => value instanceof File, {
      error: 'Выберите файл шаблона',
    })
    .refine((file) => file instanceof File && file.name.toLowerCase().endsWith('.pptx'), {
      error: 'Поддерживаются только файлы с расширением .pptx',
    }),
})

type ReuploadPptxFormValues = z.infer<typeof reuploadPptxSchema>

interface UseReuploadPptxFormParams {
  templateId: string
  onClose: () => void
}

export function useReuploadPptxForm({ templateId, onClose }: UseReuploadPptxFormParams) {
  const queryClient = useQueryClient()
  const defaultValues: ReuploadPptxFormValues = {
    file: null,
  }

  const mutation = useMutation({
    ...templateMutations.reuploadTemplatePptx(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.templatesAll() })
      toast.success('Файл шаблона обновлён')
      onClose()
    },
    onError: (e) => {
      toast.error(getMessageFromError(e))
    },
  })

  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: reuploadPptxSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.file) {
        return
      }

      const body: BodyReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut = {
        file: value.file,
      }
      await mutation.mutateAsync({ templateId, body })
    },
  })

  return { form, isPending: mutation.isPending }
}
