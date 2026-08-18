import { createFileRoute, redirect } from '@tanstack/react-router'
import { ShieldCheckIcon } from 'lucide-react'
import { meQueryOptions } from '@/features/auth/api/auth.queries'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Вход — Admin Panel' }] }),
  beforeLoad: async ({ context }) => {
    const auth = await context.queryClient.ensureQueryData(meQueryOptions())
    if (auth.user) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="h-6 w-6" />
              Вход в систему
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            className="w-full"
          >
            Войти
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
