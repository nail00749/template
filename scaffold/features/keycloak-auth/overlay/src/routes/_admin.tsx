import type { QueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { meQueryOptions } from '@/entities/session'
import { consumePostLoginRedirect, normalizePostLoginRedirect } from '@/shared/auth'
import { AdminLayout } from '@/widgets/admin-layout'

export async function guardAdminRoute(queryClient: QueryClient, locationHref: string) {
  const auth = await queryClient.fetchQuery({
    ...meQueryOptions(),
    staleTime: 0,
  })

  if (!auth.user) {
    throw redirect({
      to: '/login',
      search: { redirect: normalizePostLoginRedirect(locationHref) },
    })
  }

  const returnTo = await consumePostLoginRedirect()
  if (returnTo && returnTo !== locationHref) {
    throw redirect({ href: returnTo, replace: true })
  }
}

export const Route = createFileRoute('/_admin')({
  beforeLoad: ({ context, location }) => guardAdminRoute(context.queryClient, location.href),
  component: AdminLayout,
})
