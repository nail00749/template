# API

Use Orval-generated endpoints only. Never write manual axios/fetch clients.

## Query Options Pattern

```ts
// <entity>.queries.ts
import { queryOptions, mutationOptions } from '@tanstack/react-query'
import { getLegal } from '@/features/legal/api/endpoints/legal/legal'
import { legalKeys } from '@/features/legal/api/legal.keys'

const api = getLegal()

export const contractTypesQueryOptions = (params?: Params) =>
  queryOptions({
    queryKey: legalKeys.contractTypes(params),
    queryFn: () => api.listContractTypesApiLegalContractTypesGet(params),
  })

export const createContractTypeMutationOptions = () =>
  mutationOptions({
    mutationFn: (payload: ContractTypeCreate) =>
      api.createContractTypeApiLegalContractTypesPost(payload),
    onSuccess: (_result, _payload, _context, mutationContext) => {
      void mutationContext.client.invalidateQueries({
        queryKey: legalKeys.contractTypesAll(),
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
// legal.keys.ts
export const legalKeys = {
  all: ['legal'] as const,
  contractTypesAll: () => [...legalKeys.all, 'contract-types'] as const,
  contractTypes: (params?: Params) => [...legalKeys.contractTypesAll(), params ?? {}] as const,
  contractType: (id: string) => [...legalKeys.contractTypesAll(), 'detail', id] as const,
}
```

Rules:

- Never inline query keys — always use the keys factory
- Always invalidate via `*All()` parent key when mutation affects a list
- One `*.keys.ts` file per domain feature

## Retry and Error Handling

Глобальные настройки — в `src/app/integrations/tanstack-query/root-provider.tsx`:

- **Queries** — `retry` по умолчанию пропускает 4xx (кроме 408, 425) и
  повторяет 5xx/сетевые ошибки с учётом `Retry-After`.
- **Mutations** — `retry: false`, ошибки показываются через глобальный `onError`
  → `toast.error(getMessageFromError(error))`.

Глобальный обработчик уже показывает toast на ошибки mutations. Не дублируй
`toast.error` в `onError` каждой mutation — используй только если нужна
кастомная логика (например, показать специфичное сообщение).

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
- Never manually type response shapes — import from generated `model.ts`
- Orval regeneration: `bun run generate-api` — никогда не редактируй файлы в `api/endpoints/`
