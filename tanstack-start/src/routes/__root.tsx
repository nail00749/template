import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '@/shared/styles/styles.css?url'

import { NotFound } from '@/widgets/NotFound'
import { RootErrorBoundary } from '@/widgets/RootErrorBoundary'
import { Toaster } from '@/shared/ui/sonner'
import { Providers } from '@/app/providers'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Admin Panel',
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>

      <body>
        <Providers>
          {children}

          <Toaster position="top-right" />

          {/* <Devtools />*/}
        </Providers>

        <Scripts />
      </body>
    </html>
  )
}
