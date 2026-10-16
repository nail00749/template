import { describe, expect, it } from 'bun:test'
import { createRequire } from 'node:module'

interface AstNode {
  type: string
  value?: string
  nodes?: AstNode[]
}

interface Braces {
  (input: string | string[], options?: Record<string, unknown>): string[]
  parse: (input: string, options?: Record<string, unknown>) => AstNode
  compile: (input: string | AstNode, options?: Record<string, unknown>) => string
  expand: (input: string | AstNode, options?: Record<string, unknown>) => string[]
  stringify: (input: string | AstNode, options?: Record<string, unknown>) => string
}

// These CommonJS boundaries load the known upstream-compatible package API.
const braces: Braces = require('../vendor/braces')
const parse: Braces['parse'] = require('../vendor/braces/lib/parse')
const compile: Braces['compile'] = require('../vendor/braces/lib/compile')
const expand: Braces['expand'] = require('../vendor/braces/lib/expand')
const stringify: Braces['stringify'] = require('../vendor/braces/lib/stringify')

const depth = 128
const deeplyNested = (opening: string, closing: string, count = 10_000) =>
  opening.repeat(count) + 'a,b' + closing.repeat(count)

const externalAst = (count: number) => {
  let node: AstNode = { type: 'text', value: 'a' }
  for (let index = 0; index < count; index++) {
    node = { type: 'root', nodes: [node] }
  }
  return { type: 'root', nodes: [node] }
}

describe('braces nesting hardening', () => {
  for (const [name, opening, closing] of [
    ['braces', '{', '}'],
    ['parentheses', '(', ')'],
    ['mixed blocks', '{(', ')}'],
  ]) {
    for (const balanced of [true, false]) {
      const input = deeplyNested(opening, balanced ? closing : '')
      it(`rejects oversized and deeply nested ${balanced ? 'balanced' : 'unclosed'} ${name}`, () => {
        const guardedInput = deeplyNested(opening, balanced ? closing : '', 2_000)
        expect(guardedInput.length).toBeLessThan(10_000)
        for (const operation of [braces.parse, braces.compile, braces.expand, braces.stringify]) {
          expect(() => operation(input)).toThrow(SyntaxError)
          // Smaller reproductions pass the upstream 10k character ceiling.
          expect(() => operation(guardedInput)).toThrow('maximum depth (128)')
        }
        expect(() => parse(input)).toThrow(SyntaxError)
      })
    }
  }

  it('does not let mismatched closing characters reduce the active block depth', () => {
    for (const input of ['{)'.repeat(2_000), '(}'.repeat(2_000)]) {
      expect(() => braces.parse(input)).toThrow('maximum depth (128)')
    }
  })

  it('does not permit caller options to raise or disable the depth ceiling', () => {
    for (const operation of [braces.parse, braces.compile, braces.expand, braces.stringify]) {
      expect(() =>
        operation(deeplyNested('(', ')', depth + 1), {
          maxLength: Infinity,
          maxDepth: Infinity,
          depthLimit: false,
        }),
      ).toThrow('maximum depth (128)')
    }
  })

  it('accepts depth 128 and rejects depth 129 before recursive processing', () => {
    for (const [opening, closing] of [
      ['{', '}'],
      ['(', ')'],
    ]) {
      const permitted = deeplyNested(opening, closing, depth)
      for (const operation of [braces.parse, braces.compile, braces.expand, braces.stringify]) {
        expect(() => operation(permitted)).not.toThrow()
        expect(() => operation(deeplyNested(opening, closing, depth + 1))).toThrow(SyntaxError)
      }
    }
    expect(() => braces.parse(deeplyNested('{(', ')}', depth / 2))).not.toThrow()
    expect(() => braces.parse(deeplyNested('{(', ')}', depth / 2 + 1))).toThrow(SyntaxError)
    expect(() => braces.parse('('.repeat(depth) + 'a')).not.toThrow()
    expect(() => braces.parse('('.repeat(depth + 1) + 'a')).toThrow(SyntaxError)
  })

  it('counts actual parser blocks rather than escaped, quoted, or bracketed literals', () => {
    for (const input of [
      '\\{\\('.repeat(1_000),
      '"' + '{('.repeat(1_000) + '"',
      "'" + '{('.repeat(1_000) + "'",
      '`' + '{('.repeat(1_000) + '`',
      '[' + '{('.repeat(1_000) + ']',
    ]) {
      for (const operation of [braces.parse, braces.compile, braces.expand, braces.stringify]) {
        expect(() => operation(input)).not.toThrow()
      }
    }
  })

  it('rejects externally supplied deep ASTs through public and direct lib APIs', () => {
    for (const operation of [
      braces.compile,
      braces.expand,
      braces.stringify,
      compile,
      expand,
      stringify,
    ]) {
      expect(() => operation(externalAst(10_000))).toThrow(SyntaxError)
      expect(() => operation(externalAst(depth + 1))).toThrow('maximum depth (128)')
      expect(() => operation(externalAst(depth))).not.toThrow()
    }
  })

  it('rejects cyclic child graphs without recursive overflow', () => {
    const ast: AstNode = { type: 'root', nodes: [] }
    ast.nodes?.push(ast)
    for (const operation of [compile, expand, stringify]) {
      expect(() => operation(ast)).toThrow(SyntaxError)
    }
  })

  it('preserves ordinary globs, ranges, options, and stringification', () => {
    expect(braces('src/{app,pages}/**/*.{ts,tsx}')).toEqual(['src/(app|pages)/**/*.(ts|tsx)'])
    expect(braces.expand('file-{01..03}.{js,ts}')).toEqual([
      'file-01.js',
      'file-01.ts',
      'file-02.js',
      'file-02.ts',
      'file-03.js',
      'file-03.ts',
    ])
    expect(braces.compile('x{a,b{c,d}}y')).toBe('x(a|b(c|d))y')
    expect(braces.stringify(braces.parse('x{a,b{c,d}}y'))).toBe('x{a,b{c,d}}y')
    expect(braces.expand('{a,a,,b}', { nodupes: true, noempty: true })).toEqual(['a', 'b'])
    expect(braces.expand('{1..1000}')).toHaveLength(1000)
    expect(() => braces.expand('{1..1001}')).toThrow(RangeError)
    expect(braces.expand('{1..1002}', { rangeLimit: false })).toHaveLength(1002)
    expect(braces(['{a,b}', '{1..2}'], { expand: true })).toEqual(['a', 'b', '1', '2'])
  })

  it('resolves the dependency alias to the hardened local fork', () => {
    // Resolve where the real transitive consumer imports braces, including Bun's
    // nested layout; a stale unrelated top-level copy is not evidence.
    const consumerRequire = createRequire(require.resolve('micromatch'))
    const installed: Braces = consumerRequire('braces')
    const manifest: { name: string; version: string } = consumerRequire('braces/package.json')
    expect(manifest.name).toBe('@template/braces')
    expect(manifest.version).toBe('3.0.3-hardened.0')
    expect(installed.compile('{a,b}')).toBe('(a|b)')
    expect(() => installed.compile(deeplyNested('(', ')', 2_000))).toThrow('maximum depth (128)')
  })
})
