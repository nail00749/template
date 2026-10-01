const MAX_POST_LOGIN_REDIRECT_LENGTH = 2_048
const VALIDATION_ORIGIN = 'https://app.invalid'

export function normalizePostLoginRedirect(value: unknown): string | undefined {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_POST_LOGIN_REDIRECT_LENGTH ||
    !value.startsWith('/') ||
    value.startsWith('//')
  ) {
    return undefined
  }

  let target: URL

  try {
    target = new URL(value, VALIDATION_ORIGIN)
  } catch {
    return undefined
  }

  if (target.origin !== VALIDATION_ORIGIN) {
    return undefined
  }

  let decodedPathname = target.pathname
  for (let depth = 0; depth < 16; depth += 1) {
    let nextPathname: string
    try {
      nextPathname = decodeURIComponent(decodedPathname)
    } catch {
      break
    }
    if (nextPathname === decodedPathname) {
      break
    }
    decodedPathname = nextPathname
  }

  const decodedTarget = new URL(decodedPathname, VALIDATION_ORIGIN)
  if (decodedTarget.origin !== VALIDATION_ORIGIN) {
    return undefined
  }

  const isLoginRoute =
    decodedTarget.pathname === '/login' || decodedTarget.pathname.startsWith('/login/')
  const isApiRoute = decodedTarget.pathname === '/api' || decodedTarget.pathname.startsWith('/api/')

  if (isLoginRoute || isApiRoute) {
    return undefined
  }

  return `${target.pathname}${target.search}${target.hash}`
}
