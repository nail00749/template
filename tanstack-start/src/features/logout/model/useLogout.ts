import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '@/entities/session'
import { logoutMutationOptions } from '@/entities/session'

interface UseLogoutOptions {
  onSuccess?: () => void
}

export function useLogout({ onSuccess }: UseLogoutOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...logoutMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.all })
      onSuccess?.()
    },
  })
}
