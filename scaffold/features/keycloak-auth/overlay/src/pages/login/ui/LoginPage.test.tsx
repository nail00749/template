import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

const loginModel = vi.hoisted(() => ({
  login: vi.fn(),
  useLogin: vi.fn(() => ({ isPending: false, login: loginModel.login })),
}))

vi.mock('../model/useLogin', () => ({ useLogin: loginModel.useLogin }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('starts login while preserving the requested protected route', () => {
    render(<LoginPage returnTo="/templates/42?tab=slides" />)

    fireEvent.click(screen.getByRole('button', { name: 'Войти через корпоративный аккаунт' }))

    expect(loginModel.useLogin).toHaveBeenCalledWith('/templates/42?tab=slides')
    expect(loginModel.login).toHaveBeenCalledOnce()
  })
})
