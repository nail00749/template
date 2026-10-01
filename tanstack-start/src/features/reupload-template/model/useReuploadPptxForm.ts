import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useIntlayer } from 'react-intlayer'
import { templateKeys } from '@/entities/template'
import { templateMutations } from '@/entities/template'
import type { BodyReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut } from '@/shared/api/admin'
import { useAppForm } from '@/shared/ui/form'
import { getMessageFromError } from '@/shared/lib/utils'
import { useAppLocale } from '@/shared/lib/i18n'

const createReuploadPptxSchema = (fileRequired: string, pptxExtension: string) =>
  z.object({
    file: z
      .custom<File | null>((value) => value instanceof File, {
        error: fileRequired,
      })
      .refine((file) => file instanceof File && file.name.toLowerCase().endsWith('.pptx'), {
        error: pptxExtension,
      }),
  })

type ReuploadPptxFormValues = z.infer<ReturnType<typeof createReuploadPptxSchema>>

interface UseReuploadPptxFormParams {
  templateId: string
  onClose: () => void
}

export function useReuploadPptxForm({ templateId, onClose }: UseReuploadPptxFormParams) {
  const { locale } = useAppLocale()
  const content = useIntlayer('reupload-template')
  const reuploadPptxSchema = createReuploadPptxSchema(
    content.fileRequired.value,
    content.pptxExtension.value,
  )
  const queryClient = useQueryClient()
  const defaultValues: ReuploadPptxFormValues = {
    file: null,
  }

  const mutation = useMutation({
    ...templateMutations.reuploadTemplatePptx(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.templatesAll() })
      toast.success(content.updated.value)
      onClose()
    },
    onError: (e) => {
      toast.error(getMessageFromError(e, undefined, locale))
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
