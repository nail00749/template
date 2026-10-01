import { HeadContent, Scripts, createRootRouteWithContext, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { IntlayerProvider } from 'react-intlayer'
import { isAppLocale, persistLocale, type AppLocale } from '@/shared/lib/i18n'
import type { QueryClient } from '@tanstack/react-query'
import { env } from '@/shared/config/env'
import appCss from '@/app/styles/styles.css?url'

import { NotFound } from '@/widgets/not-found'
import { RootErrorBoundary } from '@/widgets/root-error-boundary'
import { Toaster } from '@/shared/ui/sonner'
import { Providers } from '@/app/providers'
import { LocalizedTitle } from '@/app/integrations/i18n/LocalizedTitle'

interface MyRouterContext {
  locale: AppLocale
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  staticData: { titleKey: 'admin' },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFound,
  errorComponent: RootErrorBoundary,
  shellComponent: RootDocument,
})

export function RootDocument({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [locale, setLocale] = useState(router.options.context.locale)

  const changeLocale = (value: string) => {
    if (!isAppLocale(value)) {
      return
    }
    persistLocale(value, env.NODE_ENV === 'production' || window.location.protocol === 'https:')
    setLocale(value)
    router.update({ context: { ...router.options.context, locale: value } })
  }

  return (
    <html
      lang={locale}
      dir="ltr"
    >
      <head>
        <HeadContent />
        <LocalizedTitle locale={locale} />
      </head>

      <body>
        <IntlayerProvider
          locale={locale}
          setLocale={changeLocale}
          isCookieEnabled={false}
        >
          <Providers>
            {children}

            <Toaster position="top-right" />

            {/* <Devtools />*/}
          </Providers>
        </IntlayerProvider>

        <Scripts />
      </body>
    </html>
  )
}
