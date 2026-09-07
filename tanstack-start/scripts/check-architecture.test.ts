// @vitest-environment node
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { checkArchitecture } from './check-architecture'

const roots: string[] = []

function fixture(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'fsd-check-'))
  roots.push(root)
  for (const [name, content] of Object.entries(files)) {
    const path = join(root, name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
  return root
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

describe('FSD import boundaries', () => {
  it('treats standard Start entries and routes as app-level adapters', () => {
    const root = fixture({
      'router.tsx': "import './routeTree.gen'; import './app/providers'",
      'client.tsx': "import './router'",
      'routeTree.gen.ts': "export { Route } from './routes/index'",
      'routes/index.tsx': "import '@/pages/list'; export const Route = {}",
      'app/providers.ts': 'export const providers = {}',
      'pages/list/index.ts': 'export const Page = {}',
    })
    expect(checkArchitecture(root)).toEqual([])
  })

  it('still rejects upward route imports and arbitrary files at the source root', () => {
    const root = fixture({
      'routes/index.tsx': 'export const Route = {}',
      'router.tsx': 'export const router = {}',
      'pages/list/index.ts': "import '../../routes'; import '@/router'",
      'helpers.ts': 'export const value = 1',
    })
    const errors = checkArchitecture(root)
    expect(errors.filter((error) => error.includes('lower layer'))).toHaveLength(2)
    expect(errors).toContain('helpers.ts: source must live in an FSD layer')
  })

  it('allows downward public APIs and relative imports within a slice', () => {
    const root = fixture({
      'pages/list/index.ts': "export { Page } from './ui/Page'",
      'pages/list/ui/Page.tsx':
        "import { model } from '@/entities/item'; export const Page = model",
      'entities/item/index.ts': 'export const model = 1',
    })
    expect(checkArchitecture(root)).toEqual([])
  })

  it('rejects upward and sibling imports even when they use relative paths', () => {
    const root = fixture({
      'features/edit/index.ts': "export { value } from '../remove'",
      'features/remove/index.ts': 'export const value = 1',
      'shared/lib/bad.ts': "import '../../pages/list'",
      'pages/list/index.ts': 'export const Page = 1',
    })
    expect(checkArchitecture(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('cross-slice import'),
        expect.stringContaining('lower layer'),
      ]),
    )
  })

  it('rejects deep imports, including dynamic and type imports', () => {
    const root = fixture({
      'app/router.ts':
        "import('@/features/edit/model'); type Model = import('../features/edit/model').Model",
      'features/edit/index.ts': "export type { Model } from './model'",
      'features/edit/model.ts': 'export interface Model {}',
    })
    expect(checkArchitecture(root)).toHaveLength(2)
    expect(checkArchitecture(root).every((error) => error.includes('public API'))).toBe(true)
  })

  it('rejects direct generated imports and missing public APIs', () => {
    const root = fixture({
      'entities/item/model.ts': "import type { Item } from '@/shared/api/admin/model/item'",
      'shared/api/admin/model/item.ts': 'export interface Item {}',
    })
    expect(checkArchitecture(root)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('slice needs a public index.ts'),
        expect.stringContaining('focused shared/api'),
      ]),
    )
  })
})
