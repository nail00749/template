import { describe, expect, it } from 'vitest'
import { readLocaleCookie, resolveLocale, serializeLocaleCookie } from './locale'

describe('cookie locale contract', () => {
  it('accepts only supported locales and uses Russian for absent or invalid values', () => {
    expect(resolveLocale('en')).toBe('en')
    for (const value of [undefined, null, '', 'fr', 'EN', '<script>']) {
      expect(resolveLocale(value)).toBe('ru')
    }
  })

  it('reads the exact cookie name independently of other cookies', () => {
    expect(readLocaleCookie('session=secret; APP_LOCALE=en; preference=ru')).toBe('en')
    expect(readLocaleCookie('OTHER_APP_LOCALE=en')).toBe('ru')
    expect(readLocaleCookie('APP_LOCALE=%65%6e')).toBe('en')
    expect(readLocaleCookie('APP_LOCALE=%E0%A4%A')).toBe('ru')
    expect(readLocaleCookie('APP_LOCALE=fr')).toBe('ru')
  })

  it('persists a JavaScript-readable cookie shared across routes', () => {
    expect(serializeLocaleCookie('en', true)).toBe(
      'APP_LOCALE=en; Path=/; Max-Age=31536000; SameSite=Lax; Secure',
    )
    expect(serializeLocaleCookie('ru', false)).not.toContain('Secure')
    expect(serializeLocaleCookie('en', true)).not.toContain('HttpOnly')
  })
})
