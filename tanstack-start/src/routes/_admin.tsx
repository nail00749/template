import { createFileRoute, redirect } from '@tanstack/react-router'
import { meQueryOptions } from '@/entities/session'
import { AdminLayout } from '@/widgets/admin-layout'

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
