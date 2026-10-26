import { lstat, readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

export const MANIFEST_PATH = 'template.manifest.json'
export interface GroupDefinition {
  description?: string
  include: string[]
  exclude: string[]
  requires: string[]
  update: 'merge' | 'create-only'
}
export interface TemplateManifest {
  schemaVersion: 1
  id: string
  name?: string
  sourceRoot: string
  renderer: { id: 'gvozdla-files'; version: 1 }
  groups: Record<string, GroupDefinition>
}
export function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
export function keys(value: Record<string, unknown>, allowed: string[], label: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`Unsupported ${label} field: ${key}`)
  }
}
export function identifier(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) &&
    !['constructor', 'prototype'].includes(value)
  )
}
export function safePath(value: unknown, label = 'Path', glob = false): string {
  if (
    typeof value !== 'string' ||
    !value ||
    value.includes('\\') ||
    Array.from(value).some((character) => {
      const code = character.charCodeAt(0)
      return code < 32 || code === 127
    }) ||
    value.startsWith('/') ||
    /^[a-zA-Z]:/.test(value)
  ) {
    throw new Error(`${label} must be a safe relative path`)
  }
  const parts = value.split('/')
  if (
    parts.some((part) => !part || part === '.' || part === '..') ||
    (!glob && /[*?{}[\]]/.test(value))
  ) {
    throw new Error(`${label} must be a safe relative path: ${value}`)
  }
  if (
    parts.some((part) =>
      ['.git', '.template', '.template.json', 'node_modules'].includes(part.toLowerCase()),
    )
  ) {
    throw new Error(`${label} uses a reserved path: ${value}`)
  }
  return value
}
export function parseGroup(value: unknown, label: string): GroupDefinition {
  if (!record(value)) throw new Error(`Invalid group ${label}`)
  keys(value, ['description', 'include', 'exclude', 'requires', 'update'], `group ${label}`)
  if (value.description !== undefined && typeof value.description !== 'string')
    throw new Error(`Invalid group description: ${label}`)
  const patterns = (field: string, required = false): string[] => {
    const input = value[field] ?? (required ? undefined : [])
    if (!Array.isArray(input) || (required && input.length === 0))
      throw new Error(`Invalid ${field} in group ${label}`)
    return input.map((path) => safePath(path, `${label}.${field}`, true))
  }
  const requires = value.requires ?? []
  if (!Array.isArray(requires) || !requires.every(identifier))
    throw new Error(`Invalid requires in group ${label}`)
  if (value.update !== 'merge' && value.update !== 'create-only')
    throw new Error(`Invalid update policy in group ${label}`)
  return {
    ...(typeof value.description === 'string' ? { description: value.description } : {}),
    include: patterns('include', true),
    exclude: patterns('exclude'),
    requires: [...new Set(requires)],
    update: value.update,
  }
}
export function parseManifest(value: unknown): TemplateManifest {
  if (!record(value)) throw new Error('Invalid template manifest')
  keys(value, ['schemaVersion', 'id', 'name', 'sourceRoot', 'renderer', 'groups'], 'manifest')
  if (
    value.schemaVersion !== 1 ||
    !identifier(value.id) ||
    (value.name !== undefined && typeof value.name !== 'string')
  )
    throw new Error('Unsupported or invalid template manifest')
  if (!record(value.renderer)) throw new Error('Invalid renderer')
  keys(value.renderer, ['id', 'version'], 'renderer')
  if (value.renderer.id !== 'gvozdla-files' || value.renderer.version !== 1)
    throw new Error('Unsupported renderer')
  if (!record(value.groups) || Object.keys(value.groups).length === 0)
    throw new Error('Manifest must define groups')
  const groups: Record<string, GroupDefinition> = {}
  for (const [id, group] of Object.entries(value.groups)) {
    if (!identifier(id)) throw new Error(`Invalid group id: ${id}`)
    groups[id] = parseGroup(group, id)
  }
  const visited = new Set<string>()
  const visit = (id: string, stack = new Set<string>()): void => {
    if (!groups[id]) throw new Error(`Unknown required group: ${id}`)
    if (stack.has(id)) throw new Error(`Group dependency cycle at ${id}`)
    if (visited.has(id)) return
    const next = new Set(stack).add(id)
    for (const dependency of groups[id].requires) {
      if (groups[id].update === 'merge' && groups[dependency]?.update === 'create-only')
        throw new Error(`Merge group ${id} requires create-only group ${dependency}`)
      visit(dependency, next)
    }
    visited.add(id)
  }
  Object.keys(groups).forEach((id) => visit(id))
  return {
    schemaVersion: 1,
    id: value.id,
    ...(typeof value.name === 'string' ? { name: value.name } : {}),
    sourceRoot: safePath(value.sourceRoot, 'sourceRoot'),
    renderer: { id: 'gvozdla-files', version: 1 },
    groups,
  }
}
export async function assertSafePath(root: string, path: string, metadata = false): Promise<void> {
  if (!metadata) safePath(path)
  const parts = path.split('/')
  let current = root
  const rootStats = await lstat(root)
  if (rootStats.isSymbolicLink() || !rootStats.isDirectory())
    throw new Error(`Unsafe project root: ${root}`)
  for (let i = 0; i < parts.length; i++) {
    current = join(current, parts[i])
    let stats
    try {
      stats = await lstat(current)
    } catch (error: any) {
      if (error.code === 'ENOENT') return
      throw error
    }
    if (stats.isSymbolicLink()) throw new Error(`Symbolic links are not supported: ${path}`)
    if (i < parts.length - 1 && !stats.isDirectory())
      throw new Error(`Path parent is not a directory: ${path}`)
    if (i === parts.length - 1 && !stats.isFile())
      throw new Error(`Path is not a regular file: ${path}`)
  }
}
export async function readManifest(
  checkout: string,
): Promise<{ manifest: TemplateManifest; text: string }> {
  await assertSafePath(checkout, MANIFEST_PATH)
  const text = await readFile(join(checkout, MANIFEST_PATH), 'utf8')
  const manifest = parseManifest(JSON.parse(text))
  // Ancestors of sourceRoot must not redirect rendering outside the checkout.
  await assertSafeDirectory(checkout, manifest.sourceRoot)
  return { manifest, text }
}
export async function assertSafeDirectory(root: string, path: string): Promise<void> {
  let current = root
  for (const part of path.split('/')) {
    current = join(current, part)
    const stats = await lstat(current)
    if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error(`Unsafe directory: ${path}`)
  }
}
export async function listFiles(root: string, prefix = ''): Promise<string[]> {
  const results: string[] = []
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not supported: ${path}`)
    if (entry.isDirectory()) results.push(...(await listFiles(root, path)))
    else if (entry.isFile()) results.push(path)
    else throw new Error(`Unsupported file: ${path}`)
  }
  return results.sort()
}
export function ownerOf(manifest: TemplateManifest, path: string): string | undefined {
  const owners = Object.entries(manifest.groups)
    .filter(
      ([, group]) =>
        group.include.some((pattern) => new Bun.Glob(pattern).match(path)) &&
        !group.exclude.some((pattern) => new Bun.Glob(pattern).match(path)),
    )
    .map(([id]) => id)
  if (owners.length > 1) throw new Error(`Overlapping groups for ${path}: ${owners.join(', ')}`)
  return owners[0]
}
