import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { templateKeys } from '@/entities/template'
import { templateMutations } from '@/entities/template'
import { getMessageFromError } from '@/shared/lib/utils'
import { useAppLocale } from '@/shared/lib/i18n'

interface UseTemplateActionsOptions {
  templateId: string
}

export function useDeleteSlide({ templateId }: UseTemplateActionsOptions) {
  const { locale } = useAppLocale()
  const queryClient = useQueryClient()

  return useMutation({
    ...templateMutations.deleteSlide(),
    meta: { disableToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: templateKeys.templateDetail(templateId),
      })
    },
    onError: (e) => {
      toast.error(getMessageFromError(e, undefined, locale))
    },
  })
}
