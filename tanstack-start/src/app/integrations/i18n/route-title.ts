import { getIntlayer } from 'intlayer'
import type { AppLocale } from '@/shared/lib/i18n'

export function getLocalizedRouteTitle(
  titleKey: string,
  locale: AppLocale,
  loaderData?: unknown,
): string | undefined {
  const content = getIntlayer('route-metadata', locale)
  switch (titleKey) {
    case 'admin':
      return content.admin
    case 'login':
      return content.login
    case 'templates':
      return content.templates
    case 'template': {
      let name = ''
      if (
        typeof loaderData === 'object' &&
        loaderData !== null &&
        'name' in loaderData &&
        typeof loaderData.name === 'string'
      ) {
        name = loaderData.name
      }
      return `${content.template} ${name} — Admin Panel`
    }
    default:
      return undefined
  }
}
