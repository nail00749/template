import { ShieldCheckIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useLogin } from '../model/useLogin'

export interface LoginPageProps {
  returnTo?: string
}

export function LoginPage({ returnTo }: LoginPageProps) {
  const { isPending, login } = useLogin(returnTo)

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
            loading={isPending}
            onClick={login}
          >
            Войти через корпоративный аккаунт
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
