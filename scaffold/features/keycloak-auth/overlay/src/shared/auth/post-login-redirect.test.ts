import { describe, expect, it } from 'vitest'
import { normalizePostLoginRedirect } from './post-login-redirect'

describe('normalizePostLoginRedirect', () => {
  it.each([
    ['/templates', '/templates'],
    ['/templates/42?tab=slides', '/templates/42?tab=slides'],
    ['/templates?page=2#results', '/templates?page=2#results'],
    ['/', '/'],
    ['/future-protected-route', '/future-protected-route'],
  ])('accepts internal application target %s', (value, expected) => {
    expect(normalizePostLoginRedirect(value)).toBe(expected)
  })

  it.each([
    undefined,
    '',
    'templates',
    '/login',
    '/api/v1/auth/logout',
    '//evil.example/steal',
    'https://evil.example/steal',
    '/templates/../../api/v1/auth/logout',
    '/api%2Fv1/auth/logout',
    '/login%2Fcallback',
    '/%2F%2Fevil.example/steal',
    '/%252e%252e/api/v1/auth/logout',
  ])('rejects unsafe target %s', (value) => {
    expect(normalizePostLoginRedirect(value)).toBeUndefined()
  })

  it('rejects an oversized target', () => {
    expect(normalizePostLoginRedirect(`/templates?q=${'a'.repeat(2_048)}`)).toBeUndefined()
  })
})
