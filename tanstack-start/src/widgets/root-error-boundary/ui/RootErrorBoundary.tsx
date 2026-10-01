import { AlertCircleIcon } from 'lucide-react'
import { isAxiosError } from 'axios'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { useIntlayer } from 'react-intlayer'
import { AuthUnavailableError } from '@/entities/session'
import { Button } from '@/shared/ui/button'
import { PageState } from '@/shared/ui/page-state'
import { getMessageFromError } from '@/shared/lib/utils'
import { useAppLocale } from '@/shared/lib/i18n'
import { AuthError } from './AuthError'

function isAuthError(error: unknown): boolean {
  if (error instanceof AuthUnavailableError) {
    return true
  }

  return isAxiosError(error) && error.response?.status === 401
}

interface UnknownErrorFallbackProps {
  error: unknown
  reset: () => void
}

function UnknownErrorFallback({ error, reset }: UnknownErrorFallbackProps) {
  const { locale } = useAppLocale()
  const content = useIntlayer('root-error-boundary')
  const message = getMessageFromError(error, content.unknown.value, locale)

  return (
    <PageState
      icon={AlertCircleIcon}
      title={content.genericTitle.value}
      description={message}
      tone="destructive"
      actions={
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={reset}
          >
            {content.retry}
          </Button>
        </div>
      }
    />
  )
}

export function RootErrorBoundary({ error, reset }: ErrorComponentProps) {
  if (isAuthError(error)) {
    return (
      <AuthError
        error={error}
        reset={reset}
      />
    )
  }

  return (
    <UnknownErrorFallback
      error={error}
      reset={reset}
    />
  )
}
