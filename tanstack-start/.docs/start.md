# TanStack Start

## Router Setup

Router создаётся в `src/router.tsx` через `getRouter()` — фабрика нужна для
SSR (новый router на каждый запрос).

```ts
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext()
  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: 'intent',
  })
  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })
  return router
}
```

- `defaultPreload: 'intent'` — prefetch при наведении на `<Link>`.
- `setupRouterSsrQueryIntegration` — связывает queryClient с SSR-пайплайном,
  чтобы loader-данные стримились на клиент.

## Isomorphic Code

Используй `createIsomorphicFn` из `@tanstack/react-start` для кода, который
должен работать по-разному на сервере и клиенте:

```ts
import { createIsomorphicFn } from '@tanstack/react-start'

const getBaseURL = createIsomorphicFn()
  .client(() => env.VITE_API_BASE_URL ?? '')
  .server(() => env.SERVER_API_BASE_URL ?? env.VITE_API_BASE_URL ?? '')
```

Для `import.meta.env.SSR` условий — динамический импорт внутри `.server()`:

```ts
.server(async () => {
  const { getCookie } = await import('@tanstack/react-start/server')
  // ...
})
```

## Loaders

`loader` — для данных, которые должны быть загружены **до** рендера страницы
(документы, сущности по ID, SEO-критичные данные).

```ts
export const Route = createFileRoute('/_admin/templates/$templateId')({
  loader: ({ params, context }) => {
    return context.queryClient.ensureQueryData(adminQueries.templateDetail(params.templateId))
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Шаблон ${loaderData?.name} — Admin Panel` }],
  }),
  component: TemplateDetailPageComponent,
})
```

Правила:

- Всегда используй `context.queryClient.ensureQueryData(...)` вместо прямых
  API-вызовов — это кладёт данные в кэш TanStack Query, и компонент получит их
  через `useQuery` без повторного запроса.
- Не используй `loader` для списков — списки живут в `useQuery` + skeleton.
- Доступ к loader-данным в компоненте: `Route.useLoaderData()` или через
  `getRouteApi('/path')` для родительских данных.

```ts
const loaderData = Route.useLoaderData()
// или для доступа к данным родителя:
const parentData = getRouteApi('/_admin').useLoaderData()
```

## Search Params

См. `.docs/router.md`. Правило: `validateSearch` с Zod + `.catch()` на каждом
поле.

## SSR и Query

`@tanstack/react-router-ssr-query` автоматически стримит query-данные
(из loader) в HTML. На клиенте они «подхватываются» без перезапроса.

Чтобы это работало, компонент должен использовать **тот же** `queryKey` и
`queryFn`, что и в loader:

```ts
// loader
loader: ({ context }) =>
  context.queryClient.ensureQueryData(adminQueries.templateDetail(id)),

// component
const { data } = useQuery(adminQueries.templateDetail(id))
```

Если ключи не совпадают — будет двойной запрос.

## Server Functions

Не используются в текущем проекте. API-вызовы идут через Orval + axios
(`@/shared/api/client.ts`). Если понадобятся — добавить правило сюда.

## Environment Variables

Доступ через `@/env` (`t3-env`). Схема в `src/env.ts`:

- `VITE_*` — клиентские.
- `SERVER_*` — серверные (SSR).

Никогда не обращайся к `import.meta.env` напрямую.
