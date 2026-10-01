import { useRouterState } from '@tanstack/react-router'
import type { AppLocale } from '@/shared/lib/i18n'
import { getLocalizedRouteTitle } from './route-title'

interface LocalizedTitleProps {
  locale: AppLocale
}

export function LocalizedTitle({ locale }: LocalizedTitleProps) {
  const match = useRouterState({
    select: (state) =>
      state.matches
        .slice()
        .reverse()
        .find((item) => item.staticData.titleKey),
  })
  const title = getLocalizedRouteTitle(
    match?.staticData.titleKey ?? 'admin',
    locale,
    match?.loaderData,
  )
  return <title>{title}</title>
}
