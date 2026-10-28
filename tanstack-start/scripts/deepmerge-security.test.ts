import { describe, expect, it } from 'bun:test'
import { createRequire } from 'node:module'

interface Options {
  clone?: boolean
  customMerge?: (key: string) => ((target: unknown, source: unknown) => unknown) | undefined
}

interface Deepmerge {
  <T>(target: unknown, source: unknown, options?: Options): T
  all: <T>(objects: unknown[], options?: Options) => T
}

type Merged = Record<string, unknown> & { isAdmin?: unknown; nested?: Merged }

// The CommonJS boundary loads the known upstream-compatible package API.
const deepmerge: Deepmerge = require('../vendor/deepmerge')

// JSON.parse creates an own enumerable `__proto__` key instead of a prototype.
const poisoned = () => JSON.parse('{"__proto__":{"isAdmin":true},"name":"input"}')

function expectPlainObject(value: Merged) {
  expect(Object.getPrototypeOf(value)).toBe(Object.prototype)
  expect(value.isAdmin).toBeUndefined()
}

describe('deepmerge prototype hardening', () => {
  it('ignores an own __proto__ key in the target', () => {
    const result = deepmerge<Merged>(poisoned(), { extra: 1 })
    expectPlainObject(result)
    expect(result).toEqual({ name: 'input', extra: 1 })
  })

  it('ignores __proto__ when both target and source carry it', () => {
    expectPlainObject(deepmerge<Merged>(poisoned(), poisoned()))
  })

  it('ignores __proto__ in the source, as upstream did', () => {
    expectPlainObject(deepmerge<Merged>({}, poisoned()))
  })

  it('applies to nested objects, clones, all() and customMerge', () => {
    const nested = deepmerge<Merged>({ nested: poisoned() }, { nested: poisoned() })
    expectPlainObject(nested.nested ?? {})
    expectPlainObject(deepmerge.all<Merged>([poisoned(), poisoned(), { done: true }]))
    expectPlainObject(deepmerge<Merged>(poisoned(), {}, { clone: true }))

    const custom = deepmerge<Merged>(
      { nested: poisoned() },
      { nested: { value: 1 } },
      { customMerge: () => (target, source) => deepmerge(target, source) },
    )
    expectPlainObject(custom.nested ?? {})
    expect(custom.nested?.value).toBe(1)
  })

  it('does not pollute Object.prototype', () => {
    deepmerge(poisoned(), poisoned())
    expect(({} as Merged).isAdmin).toBeUndefined()
  })

  it('keeps ordinary merge behavior', () => {
    expect(deepmerge({ a: [1], b: { c: 1 } }, { a: [2], b: { d: 2 } })).toEqual({
      a: [1, 2],
      b: { c: 1, d: 2 },
    })
    expect(deepmerge({ constructor: 'kept' }, { prototype: 'kept' })).toEqual({
      constructor: 'kept',
      prototype: 'kept',
    })
    const date = new Date(0)
    expect(deepmerge<{ when: Date }>({}, { when: date }).when).toBe(date)
  })

  it('resolves the dependency alias to the hardened local fork for every consumer', () => {
    // Resolve where the real transitive consumers import deepmerge, including Bun's
    // nested layout; a stale unrelated top-level copy is not evidence.
    for (const consumer of [
      'shadcn',
      '@shadcn/registry',
      '@svgr/plugin-svgo',
      '@svgr/plugin-prettier',
    ]) {
      const consumerRequire = createRequire(require.resolve(consumer))
      const manifest: { name: string; version: string } = consumerRequire('deepmerge/package.json')
      expect(manifest.name).toBe('@template/deepmerge')
      expect(manifest.version).toBe('4.3.1-hardened.0')
      const installed: Deepmerge = consumerRequire('deepmerge')
      expectPlainObject(installed<Merged>(poisoned(), {}))
    }
  })
})
