import { AlertCircleIcon } from 'lucide-react'
import { isAxiosError } from 'axios'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { AuthUnavailableError } from '@/entities/session'
import { Button } from '@/shared/ui/button'
import { PageState } from '@/shared/ui/page-state'
import { getMessageFromError } from '@/shared/lib/utils'
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
  const message = getMessageFromError(error, 'Неизвестная ошибка')

  return (
    <PageState
      icon={AlertCircleIcon}
      title="Что-то пошло не так"
      description={message}
      tone="destructive"
      actions={
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={reset}
          >
            Повторить
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
