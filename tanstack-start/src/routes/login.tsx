import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/pages/login'
import { meQueryOptions } from '@/entities/session'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }): Promise<void> => {
    const auth = await context.queryClient.fetchQuery({
      ...meQueryOptions(),
      staleTime: 0,
    })

    if (auth.user) {
      throw redirect({ to: '/' })
    }
  },
  staticData: { titleKey: 'login' },
  component: LoginPage,
})
