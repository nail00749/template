import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterContextProvider,
} from '@tanstack/react-router'
import { IntlayerProvider } from 'react-intlayer'
import { templateKeys } from '@/entities/template'
import type { AppLocale } from '@/shared/lib/i18n'
import { AdminBreadcrumbs } from './AdminBreadcrumbs'

vi.mock('@/shared/config/env', () => ({
  env: { VITE_API_BASE_URL: 'https://api.example.test', NODE_ENV: 'development' },
}))

afterEach(cleanup)

function setup(templateId?: string, name = 'Договор') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const root = createRootRoute()
  const list = createRoute({ getParentRoute: () => root, path: '/templates' })
  const detail = createRoute({ getParentRoute: () => root, path: '/templates/$templateId' })
  const router = createRouter({
    routeTree: root.addChildren([list, detail]),
    history: createMemoryHistory({
      initialEntries: [templateId ? `/templates/${templateId}` : '/templates'],
    }),
  })
  if (templateId) {
    client.setQueryData(templateKeys.templateDetail(templateId), { name })
  }
  const tree = (locale: AppLocale = 'ru') => (
    <IntlayerProvider locale={locale}>
      <QueryClientProvider client={client}>
        <RouterContextProvider router={router}>
          <AdminBreadcrumbs templateId={templateId} />
        </RouterContextProvider>
      </QueryClientProvider>
    </IntlayerProvider>
  )
  return { client, tree }
}

describe('Admin breadcrumbs', () => {
  it('marks the templates list as the current page without a self link or a detail query', () => {
    const { client, tree } = setup()
    const { container } = render(tree())
    expect(screen.getByRole('navigation', { name: 'Путь навигации' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Шаблоны' }).getAttribute('aria-current')).toBe('page')
    expect(container.querySelectorAll('a')).toHaveLength(0)
    expect(client.getQueryCache().getAll()).toHaveLength(0)
  })

  it('renders a typed parent link and the name from the existing detail cache', () => {
    const { client, tree } = setup('template-1')
    const { container } = render(tree())
    expect(screen.getByRole('link', { name: 'Шаблоны' }).getAttribute('href')).toBe('/templates')
    expect(screen.getByRole('link', { name: 'Шаблоны' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByRole('link', { name: 'Договор' }).getAttribute('aria-current')).toBe('page')
    expect(container.querySelectorAll('a')).toHaveLength(1)
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
    expect(client.getQueryState(templateKeys.templateDetail('template-1'))?.fetchStatus).toBe(
      'idle',
    )
  })

  it('updates the template name after a cache update without a new request', async () => {
    const { client, tree } = setup('template-1')
    render(tree())
    await act(async () => {
      client.setQueryData(templateKeys.templateDetail('template-1'), { name: 'Новое имя' })
    })
    const renamedPage = await screen.findByRole('link', { name: 'Новое имя' })
    expect(renamedPage.getAttribute('aria-current')).toBe('page')
    expect(client.getQueryState(templateKeys.templateDetail('template-1'))?.fetchStatus).toBe(
      'idle',
    )
  })

  it('reacts to locale changes and keeps the full long name available', () => {
    const name = 'Очень длинное имя шаблона '.repeat(20).trim()
    const { tree } = setup('template-1', name)
    const { rerender } = render(tree())
    const page = screen.getByRole('link', { name })
    expect(page.getAttribute('title')).toBe(name)
    expect(page.classList.contains('truncate')).toBe(true)
    rerender(tree('en'))
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Templates' }).getAttribute('href')).toBe('/templates')
    expect(screen.getByRole('link', { name }).getAttribute('aria-current')).toBe('page')
  })
})
