import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { ShieldXIcon, TriangleAlertIcon } from 'lucide-react'
import { useIntlayer } from 'react-intlayer'
import { AuthUnavailableError, authKeys } from '@/entities/session'
import { useAppLocale, type AppLocale } from '@/shared/lib/i18n'
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

interface AuthErrorLabels {
  unknown: string
  genericDescription: string
  authUnavailableTitle: string
  authUnavailableDescription: string
  sessionExpiredTitle: string
  sessionExpiredDescription: string
  authCheckTitle: string
}

function pickFallbackDescription(rawMessage: string, labels: AuthErrorLabels): string {
  if (!rawMessage || rawMessage === labels.unknown || rawMessage === 'Неизвестная ошибка') {
    return labels.genericDescription
  }

  return rawMessage
}

function resolvePresentation(
  error: unknown,
  labels: AuthErrorLabels,
  locale: AppLocale,
): ErrorPresentation {
  if (isAuthUnavailable(error)) {
    return {
      title: labels.authUnavailableTitle,
      description: labels.authUnavailableDescription,
      icon: TriangleAlertIcon,
    }
  }

  if (isConfirmedUnauthorized(error)) {
    return {
      title: labels.sessionExpiredTitle,
      description: labels.sessionExpiredDescription,
      icon: ShieldXIcon,
    }
  }

  return {
    title: labels.authCheckTitle,
    description: pickFallbackDescription(
      getMessageFromError(error, labels.unknown, locale),
      labels,
    ),
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
  const { locale } = useAppLocale()
  const content = useIntlayer('root-error-boundary')
  const queryClient = useQueryClient()
  const router = useRouter()
  const unauthorized = isConfirmedUnauthorized(error)
  const { title, description, icon } = resolvePresentation(
    error,
    {
      unknown: content.unknown.value,
      genericDescription: content.genericDescription.value,
      authUnavailableTitle: content.authUnavailableTitle.value,
      authUnavailableDescription: content.authUnavailableDescription.value,
      sessionExpiredTitle: content.sessionExpiredTitle.value,
      sessionExpiredDescription: content.sessionExpiredDescription.value,
      authCheckTitle: content.authCheckTitle.value,
    },
    locale,
  )

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
            aria-label={content.retryAria.value}
          >
            {content.retry}
          </Button>
          {unauthorized && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleLoginRedirect()}
            >
              {content.goToLogin}
            </Button>
          )}
        </div>
      }
    />
  )
}
