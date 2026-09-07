# Auth

Auth domain code lives in `entities/session`; its public API is
`authKeys`, `meQueryOptions`, `AuthUnavailableError`, and
`logoutMutationOptions`. Logout orchestration may be composed by the
`features/logout` slice. The FSD migration changes ownership and import paths;
it does not change authentication behavior or backend authorization.

## Security boundary

Authentication uses an `httpOnly` cookie and Axios `withCredentials: true`.
The cookie name comes from `env.VITE_AUTH_HEADER`.

A frontend route guard improves navigation UX; it is **not authorization**.
The backend must authenticate and authorize every protected operation, including
object-level permissions.

## Protected routes

Auth guards must make a freshness decision explicitly. Calling
`ensureQueryData` without revalidation can return an old cached user and is not
a session check.

For a guard that must verify the current session on every entry:

```ts
export const Route = createFileRoute('/_admin')({
  beforeLoad: async ({ context }) => {
    const auth = await context.queryClient.fetchQuery({
      ...meQueryOptions(),
      staleTime: 0,
    })

    if (!auth.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminLayout,
})
```

- Use the same pattern for the reverse `/login` check.
- An anonymous response redirects to `/login`.
- A network/auth-service failure must throw and reach `AuthError`; never convert
  it to an anonymous response.
- If per-navigation verification becomes too expensive, change the guard's
  explicit stale-time contract here; do not rely on accidental cache behavior.

## meQueryOptions

```ts
export const meQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.me(),
    queryFn: () => api.getMe(),
    staleTime: 1000 * 60 * 5,
  })
```

The five-minute `staleTime` is suitable for ordinary UI consumers. Auth guards
override it with `staleTime: 0` when a synchronous session check is required.

Do not enable `refetchOnWindowFocus` for `me` without a product decision: an
unexpected focus refetch can replace the current screen with an auth error.

## Login/logout cache transitions

Auth mutations must update both server state and client routing state:

- After login, refresh/set `authKeys.me()`, invalidate the router so guards see
  the new user, then navigate to the intended protected route.
- After logout, remove auth queries before navigating to `/login`; use
  `replace: true` and invalidate the router when needed.
- Do not leave a successful authenticated `me` value in cache after logout.
- Keep this cache transition inside the auth feature hook/mutation, not copied
  into every button.

```ts
onSuccess: async () => {
  queryClient.removeQueries({ queryKey: authKeys.all })
  await router.navigate({ to: '/login', replace: true })
}
```

## 401 handling

The Axios client does not redirect automatically. Redirect ownership remains
with route guards and explicit auth flows. This avoids navigation side effects
inside transport code and keeps SSR behavior deterministic.

`RootErrorBoundary`/`AuthError` may present a confirmed 401 encountered while a
critical route is loading. Mutation errors continue to follow the global toast
rules from `.docs/error-handling.md`.

## SSR cookie forwarding

On the server, the API client forwards only the configured auth cookie from the
incoming request. A new QueryClient/router is created for each SSR request, so
one user's cached auth data cannot leak into another request.

Never log cookie values, expose them to client code, or disable TLS certificate
validation. Development certificates must be trusted through the configured CA
chain.
