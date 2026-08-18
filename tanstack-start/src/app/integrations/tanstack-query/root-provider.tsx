import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { getMessageFromError } from '@/shared/lib/utils.ts'

/**
 * Глобальное правило retry для query-запросов.
 *
 * По умолчанию не ретраим: 4xx (кроме 408 Request Timeout и 425 Too Early),
 * AbortError и любые не-сетевые ошибки — повтор их не починит.
 *
 * Ретраим: 5xx, 408, 425, 429 (с учётом `Retry-After` ниже),
 * сетевые ошибки без статуса (offline, ECONNRESET, таймауты).
 */
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) {
    return false
  }

  if (isAxiosError(error)) {
    const status = error.response?.status

    if (status === undefined) {
      return true
    }

    if (status >= 400 && status < 500 && status !== 408 && status !== 425) {
      return false
    }

    return true
  }

  return false
}

/**
 * Парсит значение HTTP-заголовка `Retry-After`.
 *
 * Поддерживает два формата согласно RFC 7231:
 * 1. Число секунд: `"120"` → 120 000 мс.
 * 2. HTTP-date: `"Sun, 08 Jun 2026 12:00:00 GMT"` → разница до этой даты в мс.
 *
 * Возвращает `null`, если формат не распознан или дата в прошлом.
 */
function parseRetryAfter(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Math.max(0, Number(trimmed) * 1000)
  }

  const timestamp = Date.parse(trimmed)
  if (!Number.isNaN(timestamp)) {
    return Math.max(0, timestamp - Date.now())
  }

  return null
}

/**
 * Задержка между попытками. Уважаем `Retry-After` для 429/503,
 * иначе — экспоненциальный backoff (500ms, 1500ms).
 */
function getRetryDelay(failureCount: number, error: unknown): number {
  if (isAxiosError(error)) {
    const retryAfter = error.response?.headers?.['retry-after']
    if (retryAfter) {
      const ms = parseRetryAfter(retryAfter)
      if (ms !== null) {
        return Math.min(ms, 30_000)
      }
    }
  }

  return Math.min(500 * 2 ** failureCount, 30_000)
}

function showErrorToast(error: unknown, meta: { disableToast?: boolean } | undefined) {
  if (meta?.disableToast) {
    return
  }

  toast.error(getMessageFromError(error))
}

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
        onError: (error: unknown, _v, _r, context) => {
          showErrorToast(error, context.meta)
        },
      },
      queries: {
        retry: shouldRetryQuery,
        retryDelay: getRetryDelay,
        throwOnError: (error: unknown, query) => {
          showErrorToast(error, query.meta)
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
