import { act, fireEvent, within, waitFor } from '@testing-library/react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { useIntlayer } from 'react-intlayer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleSwitcher } from '@/features/change-locale'
import { RootDocument } from '@/routes/__root'

const router = vi.hoisted(() => ({
  options: { context: { locale: 'en' } },
  update: vi.fn(),
  invalidate: vi.fn(),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useRouter: () => router,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({
      matches: [{ staticData: { titleKey: 'login' } }],
    }),
  HeadContent: () => null,
  Scripts: () => null,
}))
vi.mock('@/shared/config/env', () => ({ env: { NODE_ENV: 'development' } }))
vi.mock('@/widgets/root-error-boundary', () => ({ RootErrorBoundary: () => null }))
vi.mock('@/widgets/not-found', () => ({ NotFound: () => null }))
vi.mock('@/shared/ui/sonner', () => ({ Toaster: () => null }))

let root: Root | undefined

afterEach(async () => {
  if (root) {
    await act(async () => root?.unmount())
    root = undefined
  }
  document.open()
  document.write('<!doctype html><html><head></head><body></body></html>')
  document.close()
  document.cookie = 'APP_LOCALE=; Path=/; Max-Age=0'
  vi.clearAllMocks()
})

function Probe() {
  const content = useIntlayer('login-page')
  return (
    <>
      <p>{content.title}</p>
      <LocaleSwitcher />
    </>
  )
}

const documentTree = (
  <RootDocument>
    <Probe />
  </RootDocument>
)

describe('locale document', () => {
  it('hydrates using the server locale, then switches cookie, text and metadata without running guards', async () => {
    router.options.context.locale = 'en'
    const serverHtml = renderToString(documentTree)
    expect(serverHtml).toContain('lang="en"')
    expect(serverHtml).toContain('Sign in')
    document.open()
    document.write(serverHtml)
    document.close()
    // A cookie changed after the request must not change the first hydration render.
    document.cookie = 'APP_LOCALE=ru; Path=/'
    const recoverableErrors: unknown[] = []
    await act(async () => {
      root = hydrateRoot(document, documentTree, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      })
    })
    expect(recoverableErrors).toEqual([])
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('Sign in — Admin Panel')

    fireEvent.click(within(document.body).getByRole('combobox', { name: 'Interface language' }))
    fireEvent.keyDown(await within(document.body).findByRole('option', { name: 'Русский' }), {
      key: 'Enter',
    })
    await waitFor(() => expect(document.documentElement.lang).toBe('ru'))
    expect(within(document.body).getByText('Вход в систему')).toBeTruthy()
    expect(document.title).toBe('Вход — Admin Panel')
    expect(document.cookie).toContain('APP_LOCALE=ru')
    expect(router.update).toHaveBeenCalledWith({ context: { locale: 'ru' } })
    expect(router.invalidate).not.toHaveBeenCalled()

    fireEvent.click(within(document.body).getByRole('combobox', { name: 'Язык интерфейса' }))
    fireEvent.keyDown(await within(document.body).findByRole('option', { name: 'English' }), {
      key: 'Enter',
    })
    await waitFor(() => expect(document.documentElement.lang).toBe('en'))
    expect(document.cookie).toContain('APP_LOCALE=en')
    expect(document.title).toBe('Sign in — Admin Panel')
    expect(router.invalidate).not.toHaveBeenCalled()
  })
})
