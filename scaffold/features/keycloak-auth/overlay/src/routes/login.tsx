import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { meQueryOptions } from '@/entities/session'
import { LoginPage } from '@/pages/login'
import { consumePostLoginRedirect, normalizePostLoginRedirect } from '@/shared/auth'

const loginSearchSchema = z.object({
  redirect: z
    .string()
    .optional()
    .catch(undefined)
    .transform((value) => normalizePostLoginRedirect(value)),
})

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Вход — Admin Panel' }] }),
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const auth = await context.queryClient.fetchQuery({
      ...meQueryOptions(),
      staleTime: 0,
    })

    if (auth.user) {
      const storedReturnTo = await consumePostLoginRedirect()
      const returnTo = search.redirect ?? storedReturnTo

      if (returnTo) {
        throw redirect({ href: returnTo, replace: true })
      }
      throw redirect({ to: '/', replace: true })
    }
  },
  component: LoginRoute,
})

function LoginRoute() {
  const { redirect: returnTo } = Route.useSearch()

  return <LoginPage returnTo={returnTo} />
}
