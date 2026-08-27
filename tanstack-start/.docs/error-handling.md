# Error Handling

## Глобальный Error Boundary

`RootErrorBoundary` в `src/widgets/RootErrorBoundary/` — корневой `errorComponent`
роутера. Ловит все необработанные ошибки рендера и loader'ов.

```ts
// __root.tsx
export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: NotFound,
  errorComponent: RootErrorBoundary,
  // ...
})
```

## Три категории ошибок

`RootErrorBoundary` различает три типа:

1. **`AuthUnavailableError`** — сервер авторизации недоступен (network error
   на /auth/me). Показывает «Сервер авторизации недоступен» + retry.
2. **`AxiosError` 401** — подтверждённый logout. Показывает «Сессия истекла»
   - кнопка «Перейти ко входу».
3. **Всё остальное** — generic fallback с `getMessageFromError(error)`.

## Loader Errors

Если `loader` бросает ошибку, она попадает в ближайший `errorComponent`.

```ts
export const Route = createFileRoute('/items/$id')({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(itemQueries.detail(params.id)),
  errorComponent: ItemErrorBoundary, // локальный, если нужен
})
```

По умолчанию используй глобальный `RootErrorBoundary`. Локальный `errorComponent`
нужен только если ошибка не должна «убить» весь layout (например, список
ошибок, а не детальная страница).

## Toast vs ErrorBoundary

- **Mutation errors** (create/update/delete) — всегда `toast.error(...)`.
  Это ожидаемые ошибки, пользователь может исправить ввод и повторить.
- **Query errors** (load/fetch) — показываются в UI через error state или
  error boundary, если страница не может рендериться без данных.
- **Auth errors** — редирект на login через `beforeLoad`.

```ts
// Правильно: mutation ошибка — toast
onSubmit: async ({ value }) => {
  try {
    await mutation.mutateAsync(value)
    toast.success('Сохранено')
  } catch (e) {
    toast.error(getMessageFromError(e))
  }
}

// Неправильно: mutation ошибка — throw в error boundary
// Пользователь потеряет форму и введённые данные
```

## Retry-политика

Глобальная retry-логика в `src/app/integrations/tanstack-query/root-provider.tsx`:

- **4xx** (кроме 408, 425) — не ретраим.
- **5xx, 408, 425, 429** — ретраим (макс 2 раза, exponential backoff).
- **Сетевые ошибки** (offline, ECONNRESET) — ретраим.
- **`Retry-After` заголовок** — уважаем для 429/503, макс 30 секунд.

Никогда не переопределяй `retry` локально без явной причины.

## getMessageFromError

Всегда используй `getMessageFromError` из `@/shared/lib/utils` для toast'ов.
Она обрабатывает AxiosError, Error, и unknown-объекты.

```ts
import { getMessageFromError } from '@/shared/lib/utils'

toast.error(getMessageFromError(error))
// Не: toast.error(error.message) — не сработает для AxiosError
```
