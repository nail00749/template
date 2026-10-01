import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getRequestLocale, resolveLocale, type AppLocale } from '@/shared/lib/i18n'
import { routeTree } from './routeTree.gen'
import * as TanstackQuery from '@/app/integrations/tanstack-query/root-provider'

// Import the generated route tree

// Create a new router instance
export const getRouter = async () => {
  const locale = await getRequestLocale()
  const rqContext = TanstackQuery.getContext(locale)

  const router = createRouter({
    routeTree,
    context: {
      ...rqContext,
      locale,
    },

    defaultPreload: 'intent',
    dehydrate: (): { locale: AppLocale } => ({ locale: router.options.context.locale }),
    hydrate: (data) => {
      router.update({ context: { ...router.options.context, locale: resolveLocale(data.locale) } })
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

  return router
}
