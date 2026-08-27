import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { ShieldXIcon, TriangleAlertIcon } from 'lucide-react'
import { AuthUnavailableError, authKeys } from '@/features/auth'
import { getMessageFromError } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { PageState } from '@/shared/ui/page-state'

function isAuthUnavailable(error: unknown): boolean {
  return error instanceof AuthUnavailableError
}

function isConfirmedUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401
}

interface ErrorPresentation {
  title: string
  description: string
  icon: typeof TriangleAlertIcon
}

const GENERIC_FALLBACK = 'Неизвестная ошибка'

function pickFallbackDescription(rawMessage: string): string {
  if (!rawMessage || rawMessage === GENERIC_FALLBACK) {
    return 'Что-то пошло не так. Попробуйте обновить страницу.'
  }

  return rawMessage
}

function resolvePresentation(error: unknown): ErrorPresentation {
  if (isAuthUnavailable(error)) {
    return {
      title: 'Сервер авторизации недоступен',
      description:
        'Не получилось связаться с сервером. Проверьте интернет-соединение и попробуйте снова.',
      icon: TriangleAlertIcon,
    }
  }

  if (isConfirmedUnauthorized(error)) {
    return {
      title: 'Сессия истекла',
      description: 'Ваша сессия закончилась. Войдите снова, чтобы продолжить.',
      icon: ShieldXIcon,
    }
  }

  return {
    title: 'Не удалось проверить авторизацию',
    description: pickFallbackDescription(getMessageFromError(error)),
    icon: ShieldXIcon,
  }
}

/**
 * Route error UI for failures from a fresh `meQueryOptions()` request.
 *
 * AuthUnavailableError is retryable, a confirmed 401 leads to login, and
 * unexpected failures retain a generic recovery action.
 */
export function AuthError({ error, reset }: ErrorComponentProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const unauthorized = isConfirmedUnauthorized(error)
  const { title, description, icon } = resolvePresentation(error)

  const handleRetry = async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.all })
    reset()
  }

  const handleLoginRedirect = async () => {
    queryClient.removeQueries({ queryKey: authKeys.all })
    await router.navigate({ to: '/login', replace: true })
  }

  return (
    <PageState
      icon={icon}
      title={title}
      description={description}
      tone="destructive"
      actions={
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={() => void handleRetry()}
            aria-label="Повторить попытку"
          >
            Повторить
          </Button>
          {unauthorized && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleLoginRedirect()}
            >
              Перейти ко входу
            </Button>
          )}
        </div>
      }
    />
  )
}
