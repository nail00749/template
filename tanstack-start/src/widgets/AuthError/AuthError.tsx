import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { ShieldXIcon, TriangleAlertIcon } from 'lucide-react'
import { isAxiosError } from 'axios'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { AuthUnavailableError } from '@/features/auth/api/auth.queries'
import { authKeys } from '@/features/auth/api/auth.keys'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { getMessageFromError } from '@/shared/lib/utils'

interface AuthErrorProps extends ErrorComponentProps {
  /**
   * Optional callback for navigating the user to the login screen
   * after a confirmed auth failure. If not provided, the
   * "Перейти ко входу" button is hidden.
   */
  onLoginRedirect?: () => void
}

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
 * errorComponent for routes that gate on `ensureQueryData(meQueryOptions())`.
 *
 * Three error categories:
 * 1. AuthUnavailableError → server is unreachable. Show retry button.
 * 2. AxiosError with 401 → confirmed logged out. Show "Go to login" button.
 * 3. Anything else → unexpected. Show generic "try again" prompt.
 */
export function AuthError({ error, reset, onLoginRedirect }: AuthErrorProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const unauthorized = isConfirmedUnauthorized(error)
  const { title, description, icon: Icon } = resolvePresentation(error)

  const handleRetry = () => {
    void queryClient.invalidateQueries({ queryKey: authKeys.all })
    reset()
  }

  const handleLoginRedirect = () => {
    if (onLoginRedirect) {
      onLoginRedirect()
      return
    }

    void router.navigate({ to: '/login' })
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Icon
              className="size-6"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="mt-2">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={handleRetry}
            aria-label="Повторить попытку"
          >
            Повторить
          </Button>
          {unauthorized && (
            <Button
              type="button"
              variant="outline"
              onClick={handleLoginRedirect}
            >
              Перейти ко входу
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
