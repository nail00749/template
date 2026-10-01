import { createIsomorphicFn } from '@tanstack/react-start'
import { getBrowserLocale, LOCALE_COOKIE_NAME, resolveLocale } from './locale'

export const getRequestLocale = createIsomorphicFn()
  .client(async () => getBrowserLocale())
  .server(async () => {
    const { getCookie } = await import('@tanstack/react-start/server')
    return resolveLocale(getCookie(LOCALE_COOKIE_NAME))
  })
