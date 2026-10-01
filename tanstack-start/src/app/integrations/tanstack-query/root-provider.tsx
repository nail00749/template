import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getRetryDelay, shouldRetryQuery } from './query-retry'
import { getBrowserLocale, type AppLocale } from '@/shared/lib/i18n'
import { getMessageFromError } from '@/shared/lib/utils'

function showErrorToast(
  error: unknown,
  meta: { disableToast?: boolean } | undefined,
  locale: AppLocale,
) {
  if (meta?.disableToast) {
    return
  }

  toast.error(
    getMessageFromError(
      error,
      undefined,
      typeof document === 'undefined' ? locale : getBrowserLocale(),
    ),
  )
}

export function getContext(locale: AppLocale = 'ru') {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
        onError: (error: unknown, _v, _r, context) => {
          showErrorToast(error, context.meta, locale)
        },
      },
      queries: {
        retry: shouldRetryQuery,
        retryDelay: getRetryDelay,
        throwOnError: (error: unknown, query) => {
          showErrorToast(error, query.meta, locale)
          return false
        },
      },
    },
  })

  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
