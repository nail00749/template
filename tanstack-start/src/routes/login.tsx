import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage, meQueryOptions } from '@/features/auth'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Вход — Admin Panel' }] }),
  beforeLoad: async ({ context }) => {
    const auth = await context.queryClient.fetchQuery({
      ...meQueryOptions(),
      staleTime: 0,
    })

    if (auth.user) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})
