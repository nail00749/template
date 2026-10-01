import { ShieldCheckIcon } from 'lucide-react'
import { useIntlayer } from 'react-intlayer'
import { LocaleSwitcher } from '@/features/change-locale'
import { env } from '@/shared/config/env'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function LoginPage() {
  const content = useIntlayer('login-page')
  const loginUrl = new URL('/api/v1/auth/login', env.VITE_API_BASE_URL).href

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="h-6 w-6" />
              {content.title}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            render={<a href={loginUrl} />}
            nativeButton={false}
            className="w-full"
          >
            {content.corporateLogin}
          </Button>
          <div className="mt-4 flex justify-center">
            <LocaleSwitcher />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
