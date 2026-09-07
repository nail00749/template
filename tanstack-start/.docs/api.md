# API

Use Orval-generated endpoints only. Never write manual axios/fetch clients.
Generated endpoint and model files live in `@/shared/api/admin/{endpoints,model}`
and `@/shared/api/auth/{endpoints,model}`. The handwritten
`@/shared/api/admin` and `@/shared/api/auth` modules are focused facades for
those generated clients and types.

Entity query contracts are exposed from `@/entities/session` and
`@/entities/template`. The FSD move preserves existing query-key values; do
not rename key segments while relocating code.

## Query Options Pattern

```ts
// entities/template/api/template.queries.ts
import { queryOptions, mutationOptions } from '@tanstack/react-query'
import { getAdmin } from '@/shared/api/admin'
import type { ListTemplatesApiV1AdminTemplatesGetParams, TemplateUpdate } from '@/shared/api/admin'
import { templateKeys } from './template.keys'

const api = getAdmin()

export const templatesQueryOptions = (params?: ListTemplatesApiV1AdminTemplatesGetParams) =>
  queryOptions({
    queryKey: templateKeys.templateList(params),
    queryFn: () => api.listTemplatesApiV1AdminTemplatesGet(params),
  })

export const updateTemplateMutationOptions = () =>
  mutationOptions({
    mutationFn: ({ templateId, data }: { templateId: string; data: TemplateUpdate }) =>
      api.updateTemplateApiV1AdminTemplatesTemplateIdPut(templateId, data),
    onSuccess: (_result, _payload, _context, mutationContext) => {
      void mutationContext.client.invalidateQueries({
        queryKey: templateKeys.templatesAll(),
      })
    },
  })
```

> Underscore-prefixed args (`_result`, `_payload`) — это контракт с
> `noUnusedParameters`: мы объявляем позицию, но не используем значение.
> Без `_` линтер выдаст ошибку; используй `_` **только** для обязательных
> позиционных параметров callback-функций.

## Query Keys

Keys live in `<domain>.keys.ts` and use a factory pattern:

```ts
// entities/template/api/template.keys.ts (list keys excerpt)
export const templateKeys = {
  all: ['admin'] as const,
  templatesAll: () => [...templateKeys.all, 'templates'] as const,
  templateList: (params?: ListTemplatesApiV1AdminTemplatesGetParams) =>
    [...templateKeys.templatesAll(), 'list', params] as const,
}
```

Rules:

- Never inline query keys — always use the keys factory
- Always invalidate via `*All()` parent key when mutation affects a list
- One `*.keys.ts` file per entity

## Retry and Error Handling

Глобальные настройки QueryClient — в
`src/app/integrations/tanstack-query/root-provider.tsx`:

- **Queries** — `retry` по умолчанию пропускает 4xx (кроме 408, 425, 429) и
  повторяет 5xx/сетевые ошибки с учётом `Retry-After`.
- **Mutations** — `retry: false`, ошибки показываются через глобальный `onError`
  → `toast.error(getMessageFromError(error))`.

Глобальный обработчик уже показывает toast на ошибки mutations. Не дублируй
`toast.error` в `onError`, `catch` формы или обработчике кнопки.

Если UI должен показать специальное сообщение или привязать ошибку к полю:

1. Добавь `meta: { disableToast: true }` в mutation options.
2. Обработай ошибку локально ровно один раз.

Success toast и навигация относятся к пользовательскому flow и остаются в
`use<Feature>`/компоненте, а cache invalidation — в mutation options.

Чтобы **подавить** глобальный toast для отдельной query/mutation, добавь
`meta: { disableToast: true }`:

```ts
queryOptions({
  queryKey: legalKeys.contractTypes(),
  queryFn: ...,
  meta: { disableToast: true },
})
```

## Dependent Queries

Используй `enabled` для запросов, зависящих от данных другого запроса:

```ts
const { data: user } = useQuery(meQueryOptions())
const { data: permissions } = useQuery({
  ...permissionsQueryOptions(user?.id),
  enabled: !!user?.id,
})
```

- Всегда ставь `enabled: !!param` — никогда не вызывай запрос с `undefined`
  в queryFn, даже если queryFn его игнорирует.
- Ключ включает параметр — TanStack Query автоматически дедуплицирует.

## Infinite Queries

Используй `infiniteQueryOptions` для «загрузить ещё»: курсор хранится в
`pageParam`, UI — кнопка «Загрузить ещё» или `IntersectionObserver`. Для всех
новых таблиц предпочитай пагинацию (`page`/`limit`) — она дружелюбнее к URL и
to DataGrid.

## Suspense

Не используем `<Suspense>` + `useSuspenseQuery` по умолчанию. Сначала
рендерим Skeleton (см. `.docs/ui.md`), а данные прилетают из обычного
`useQuery`. Suspense-режим добавляет гонки при SSR-стриминге.

## Rules

- Never duplicate API methods that Orval already generates
- Always use `queryOptions` / `mutationOptions` wrappers — not raw `useQuery` options inline
- Never manually type response shapes — import types through `@/shared/api/admin`
  or `@/shared/api/auth`
- Orval regeneration: `OPENAPI_URL=... bun run generate-api` — никогда не
  редактируй файлы в `shared/api/*/{endpoints,model}/`
- Query/mutation options own API binding and cache consistency; navigation,
  dialogs, forms, and success feedback belong to the calling user flow
- External consumers import query options through the entity's `index.ts`;
  relative deep imports are allowed only inside the same slice
