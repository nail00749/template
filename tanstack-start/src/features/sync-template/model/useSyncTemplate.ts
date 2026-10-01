import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useIntlayer } from 'react-intlayer'
import { templateKeys } from '@/entities/template'
import { templateMutations } from '@/entities/template'
import { getMessageFromError } from '@/shared/lib/utils'
import { useAppLocale } from '@/shared/lib/i18n'

interface UseTemplateActionsOptions {
  templateId: string
}

export function useSyncTemplate({ templateId }: UseTemplateActionsOptions) {
  const { locale } = useAppLocale()
  const content = useIntlayer('sync-template')
  const queryClient = useQueryClient()

  return useMutation({
    ...templateMutations.syncTemplate(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: templateKeys.templateDetail(templateId),
      })
      toast.success(content.synced.value)
    },
    onError: (e) => {
      toast.error(getMessageFromError(e, undefined, locale))
    },
  })
}
