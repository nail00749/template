import { createIsomorphicFn } from '@tanstack/react-start'
import { env } from '@/shared/config/env'
import { normalizePostLoginRedirect } from './post-login-redirect'

export { normalizePostLoginRedirect } from './post-login-redirect'

const LOGIN_PATH = '/api/v1/auth/login'
const SECURE_POST_LOGIN_COOKIE = '__Host-tanstack-return-to'
const DEVELOPMENT_POST_LOGIN_COOKIE = 'tanstack-return-to'
const POST_LOGIN_REDIRECT_MAX_AGE_SECONDS = 10 * 60

function readStoredPostLoginRedirect(value: string | undefined): string | undefined {
  const directValue = normalizePostLoginRedirect(value)

  if (directValue) {
    return directValue
  }
  if (!value) {
    return undefined
  }

  try {
    return normalizePostLoginRedirect(decodeURIComponent(value))
  } catch {
    return undefined
  }
}

function setBrowserPostLoginRedirect(returnTo: string | undefined): void {
  const secure = window.location.protocol === 'https:'
  const cookieName = secure ? SECURE_POST_LOGIN_COOKIE : DEVELOPMENT_POST_LOGIN_COOKIE
  const value = returnTo ? encodeURIComponent(returnTo) : ''
  const maxAge = returnTo ? POST_LOGIN_REDIRECT_MAX_AGE_SECONDS : 0
  const secureAttribute = secure ? '; Secure' : ''

  if (secure) {
    document.cookie = `${DEVELOPMENT_POST_LOGIN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
  }
  document.cookie = `${cookieName}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secureAttribute}`
}

export function persistPostLoginRedirect(returnTo: unknown): void {
  setBrowserPostLoginRedirect(normalizePostLoginRedirect(returnTo))
}

export async function consumeBrowserPostLoginRedirect(): Promise<string | undefined> {
  const cookieNames = [SECURE_POST_LOGIN_COOKIE, DEVELOPMENT_POST_LOGIN_COOKIE]
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim())
  const storedValue = cookieNames
    .map((name) => cookies.find((cookie) => cookie.startsWith(`${name}=`)))
    .find((cookie) => cookie !== undefined)
    ?.split('=', 2)[1]

  setBrowserPostLoginRedirect(undefined)
  return readStoredPostLoginRedirect(storedValue)
}

export const consumePostLoginRedirect = createIsomorphicFn()
  .client(consumeBrowserPostLoginRedirect)
  .server(async () => {
    const { deleteCookie, getCookie } = await import('@tanstack/react-start/server')
    const secureValue = getCookie(SECURE_POST_LOGIN_COOKIE)
    const developmentValue = getCookie(DEVELOPMENT_POST_LOGIN_COOKIE)

    if (secureValue !== undefined) {
      deleteCookie(SECURE_POST_LOGIN_COOKIE, {
        path: '/',
        sameSite: 'lax',
        secure: true,
      })
    }
    if (developmentValue !== undefined) {
      deleteCookie(DEVELOPMENT_POST_LOGIN_COOKIE, {
        path: '/',
        sameSite: 'lax',
      })
    }

    return readStoredPostLoginRedirect(secureValue ?? developmentValue)
  })

export function startLogin(returnTo?: string): void {
  const loginUrl = new URL(LOGIN_PATH, env.VITE_API_BASE_URL)

  persistPostLoginRedirect(returnTo)
  window.location.assign(loginUrl.href)
}
