import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { templateKeys } from '@/entities/template'
import { templateMutations } from '@/entities/template'
import { getMessageFromError } from '@/shared/lib/utils'

interface UseTemplateActionsOptions {
  templateId: string
}

export function useDeleteSlide({ templateId }: UseTemplateActionsOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    ...templateMutations.deleteSlide(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: templateKeys.templateDetail(templateId),
      })
    },
    onError: (e) => {
      toast.error(getMessageFromError(e))
    },
  })
}
