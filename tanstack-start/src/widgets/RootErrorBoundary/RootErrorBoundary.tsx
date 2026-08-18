import { AlertCircleIcon } from 'lucide-react'
import { isAxiosError } from 'axios'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { AuthUnavailableError } from '@/features/auth/api/auth.queries'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { getMessageFromError } from '@/shared/lib/utils'
import { AuthError } from '@/widgets/AuthError'

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
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircleIcon
              className="size-6"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="mt-2">Что-то пошло не так</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            type="button"
            onClick={reset}
          >
            Повторить
          </Button>
        </CardContent>
      </Card>
    </div>
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
