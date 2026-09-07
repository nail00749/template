import { AuthMeResponse } from '@/shared/api/auth'
import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { authKeys } from './auth.keys'
import { getAuth } from '@/shared/api/auth'

export class AuthUnavailableError extends Error {
  readonly phase = 'auth-unavailable'

  constructor(message: string) {
    super(message)
    this.name = 'AuthUnavailableError'
  }
}

export function isNetworkLikeError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === undefined
}

export const meQueryOptions = () =>
  queryOptions<AuthMeResponse>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        return await getAuth().meApiV1AuthMeGet()
      } catch (error) {
        if (!isAxiosError(error)) {
          throw error
        }
        const status = error.response?.status
        if (status === 401 || status === 403) {
          return { user: null }
        }
        if (isNetworkLikeError(error)) {
          throw new AuthUnavailableError('Не удалось связаться с сервером авторизации')
        }
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

export const logoutMutationOptions = () =>
  mutationOptions({
    mutationFn: async () => {
      return await getAuth().logoutApiV1AuthLogoutPost()
    },
  })
