# Error Handling

## Single-owner rule

Every error is presented once. Do not combine a global toast, a local toast,
and an error boundary for the same failure.

| Failure                                          | Default owner                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| Mutation (create/update/delete)                  | global mutation `onError` toast                                              |
| Background/list query                            | global query toast plus the component's non-blocking error state when needed |
| Loader/critical detail query                     | nearest route `errorComponent`                                               |
| Missing/expired session                          | auth guard redirect or auth boundary                                         |
| Error intentionally handled by a field/custom UI | local handler with global toast disabled                                     |

## Mutation errors

Global QueryClient configuration already calls:

```ts
toast.error(getMessageFromError(error))
```

The normal form flow therefore does not catch an error only to show another
toast:

```ts
onSubmit: async ({ value }) => {
  await mutation.mutateAsync(value)
  toast.success('Сохранено')
}
```

When a mutation requires custom presentation, opt out first:

```ts
const mutation = useMutation({
  ...updateItemMutationOptions(),
  meta: { disableToast: true },
})

try {
  await mutation.mutateAsync(value)
} catch (error) {
  toast.error(getMessageFromError(error))
}
```

Never use `error.message` directly. Use `getMessageFromError(error)` for
Axios/API/unknown error shapes.

## Root error boundary

`RootErrorBoundary` is the root router `errorComponent`. It distinguishes auth
availability/401 failures from an unexpected application crash and provides a
recovery action.

Use the root boundary by default. Add a route-local `errorComponent` only when
the surrounding layout can remain useful or the route needs a domain-specific
recovery action.

```ts
export const Route = createFileRoute('/items/$id')({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(itemQueries.detail(params.id)),
  errorComponent: ItemErrorBoundary,
})
```

Do not add a local boundary merely to repeat the global fallback.

## Loader and query errors

- A loader error propagates to the nearest route boundary.
- A non-blocking `useQuery` screen should render a retry/empty/error state when
  the screen remains usable.
- QueryClient may also show the default toast. Use
  `meta: { disableToast: true }` when the local UI already presents the error.
- Never replace a failed critical detail query with fake empty data.

## Auth errors

- An anonymous result from the auth guard redirects to `/login`.
- An unavailable auth server is not the same as an anonymous user; it reaches
  the auth error boundary with retry.
- A frontend route guard is UX only. Backend authorization remains mandatory.

## Retry policy

Global retry logic lives in
`src/app/integrations/tanstack-query/query-retry.ts` and is wired into the
QueryClient by `root-provider.tsx`:

- 4xx except 408/425/429 are not retried;
- 5xx, 408, 425, 429, and network failures retry at most twice;
- `Retry-After` is respected with a 30-second cap.

Do not override `retry` locally without a documented reason.
Keep the focused retry-policy tests passing when these statuses or delays
change.
