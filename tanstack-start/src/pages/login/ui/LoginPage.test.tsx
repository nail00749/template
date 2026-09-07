import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

vi.mock('@/shared/config/env', () => ({
  env: {
    VITE_API_BASE_URL: 'https://api.example.test/base',
  },
}))

afterEach(cleanup)

describe('LoginPage', () => {
  it('links to the backend OIDC login endpoint', () => {
    render(<LoginPage />)

    const loginLink = screen.getByRole('button', { name: 'Войти через корпоративный аккаунт' })
    expect(loginLink.getAttribute('href')).toBe('https://api.example.test/api/v1/auth/login')
  })
})
