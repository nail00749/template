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
    onSuccess: (_res, _req, _, context) => {
      void context.client.invalidateQueries({
        queryKey: legalKeys.contractTypesAll(),
      })
    },
  })
```

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

## Rules

- Never duplicate API methods that Orval already generates
- Always use `queryOptions` / `mutationOptions` wrappers — not raw `useQuery` options inline
- Never manually type response shapes — import from generated `model.ts`
