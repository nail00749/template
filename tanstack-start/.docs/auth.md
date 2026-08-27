# Auth

## Архитектура

Аутентификация — через cookie-сессию (`withCredentials: true` в axios).
Токен хранится в `httpOnly`-cookie, имя cookie — в `env.VITE_AUTH_HEADER`.

## Защита роутов

Роуты, требующие авторизации, защищаются в `beforeLoad`:

```ts
export const Route = createFileRoute('/_admin')({
  beforeLoad: async ({ context }) => {
    const auth = await context.queryClient.ensureQueryData(meQueryOptions())
    if (!auth.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminLayout,
})
```

- Используй `ensureQueryData(meQueryOptions())`, а не прямой вызов API.
- Если `auth.user` отсутствует — `throw redirect({ to: '/login' })`.
- Публичные роуты (`/login`) делают reverse-проверку: редирект на `/`, если
  пользователь уже авторизован.

## meQueryOptions

```ts
export const meQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.me(),
    queryFn: () => api.getMe(),
    staleTime: 1000 * 60 * 5, // 5 минут
  })
```

- Ключ: `authKeys.me()`.
- staleTime: 5 минут (сессия не меняется часто).
- Не используй `refetchOnWindowFocus` для me — при возврате на вкладку будет
  лишний запрос. Вместо этого роуты сами вызывают `ensureQueryData` при
  навигации.

## Ошибки 401

Axios перехватчик в `@/shared/api/client.ts` **не** делает автоматический
редирект на login. Редирект происходит двумя путями:

1. **На уровне роута** — `beforeLoad` бросает `redirect({ to: '/login' })`.
2. **На уровне UI** — `RootErrorBoundary` ловит `AuthError` (см.
   `.docs/error-handling.md`).

## useLogout

```ts
const logoutMutation = useLogout({
  onSuccess: () => {
    router.navigate({ to: '/login', replace: true })
  },
})
```

- После успешного logout — `navigate({ to: '/login', replace: true })`.
- `replace: true` — чтобы нельзя было вернуться назад через browser back.

## Файлы

- `features/auth/api/auth.queries.ts` — meQueryOptions
- `features/auth/api/auth.keys.ts` — authKeys
- `features/auth/api/auth.mutations.ts` — useLogout, useLogin
- `features/auth/hooks/useLogout.ts` — обёртка над mutation

## SSR Cookie

На сервере axios автоматически проксирует auth-cookie из входящего запроса
в исходящий (см. `getServerCookieHeader` в `@/shared/api/client.ts`). Это
позволяет делать авторизованные запросы из loader.
