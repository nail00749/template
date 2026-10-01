export const APP_LOCALES = ['ru', 'en'] as const
export type AppLocale = (typeof APP_LOCALES)[number]
export const DEFAULT_LOCALE: AppLocale = 'ru'
export const LOCALE_COOKIE_NAME = 'APP_LOCALE'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'ru' || value === 'en'
}

export function resolveLocale(value: unknown): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE
}

export function readLocaleCookie(cookieHeader: string): AppLocale {
  const cookie = cookieHeader
    .split(';')
    .find((part) => part.trim().startsWith(`${LOCALE_COOKIE_NAME}=`))
  if (!cookie) {
    return DEFAULT_LOCALE
  }
  try {
    return resolveLocale(decodeURIComponent(cookie.trim().slice(LOCALE_COOKIE_NAME.length + 1)))
  } catch {
    return DEFAULT_LOCALE
  }
}

export function serializeLocaleCookie(locale: AppLocale, secure: boolean): string {
  const cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`
  return secure ? `${cookie}; Secure` : cookie
}

export function getBrowserLocale(): AppLocale {
  return typeof document === 'undefined' ? DEFAULT_LOCALE : readLocaleCookie(document.cookie)
}

export function persistLocale(
  locale: AppLocale,
  secure = window.location.protocol === 'https:',
): void {
  document.cookie = serializeLocaleCookie(locale, secure)
}
