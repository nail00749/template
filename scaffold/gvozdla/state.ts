import { createHash } from 'node:crypto'
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  assertSafePath,
  identifier,
  keys,
  ownerOf,
  parseGroup,
  parseManifest,
  record,
  safePath,
  type GroupDefinition,
} from './manifest'

export interface ProjectConfig {
  schemaVersion: 1
  template: { id: string; repository: string; ref: string; manifest: 'template.manifest.json' }
  features: string[]
  parameters: Record<string, never>
}
export interface FileBase {
  group: string
  hash: string
  origin: string
  mode: number
}
export interface GroupBase {
  revision: string
  manifestHash: string
  definition: GroupDefinition
}
export interface ProjectLock {
  schemaVersion: 1
  templateId: string
  configurationHash: string
  renderer: { id: 'gvozdla-files'; version: 1 }
  groups: Record<string, GroupBase>
  files: Record<string, FileBase>
}
export interface ProjectState {
  project: ProjectConfig
  lock: ProjectLock
  projectText: string
  lockText: string
}
export const hash = (content: string | Uint8Array): string =>
  createHash('sha256').update(content).digest('hex')
export const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const validHash = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
const validRevision = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{40,64}$/.test(value)

export function parseProject(value: unknown): ProjectConfig {
  if (!record(value)) throw new Error('Invalid gvozdla project config')
  keys(value, ['schemaVersion', 'template', 'features', 'parameters'], 'project')
  if (value.schemaVersion !== 1 || !record(value.template))
    throw new Error('Unsupported project config')
  keys(value.template, ['id', 'repository', 'ref', 'manifest'], 'template source')
  const template = value.template
  if (
    !identifier(template.id) ||
    typeof template.repository !== 'string' ||
    !template.repository ||
    template.repository.startsWith('-') ||
    typeof template.ref !== 'string' ||
    !template.ref ||
    template.ref.startsWith('-') ||
    template.manifest !== 'template.manifest.json'
  )
    throw new Error('Invalid template source')
  if (
    !Array.isArray(value.features) ||
    !value.features.every(identifier) ||
    new Set(value.features).size !== value.features.length
  )
    throw new Error('Invalid project features')
  if (!record(value.parameters) || Object.keys(value.parameters).length)
    throw new Error('Parameters are not supported by renderer version 1')
  return value as unknown as ProjectConfig
}
export function parseLock(value: unknown): ProjectLock {
  if (!record(value)) throw new Error('Invalid gvozdla lock')
  keys(
    value,
    ['schemaVersion', 'templateId', 'configurationHash', 'renderer', 'groups', 'files'],
    'lock',
  )
  if (
    value.schemaVersion !== 1 ||
    !validHash(value.configurationHash) ||
    !identifier(value.templateId) ||
    !record(value.renderer) ||
    value.renderer.id !== 'gvozdla-files' ||
    value.renderer.version !== 1 ||
    !record(value.groups) ||
    !record(value.files)
  )
    throw new Error('Unsupported gvozdla lock')
  keys(value.renderer, ['id', 'version'], 'locked renderer')
  const groups: Record<string, GroupBase> = {}
  for (const [id, entry] of Object.entries(value.groups)) {
    if (!identifier(id) || !record(entry)) throw new Error(`Invalid locked group: ${id}`)
    keys(entry, ['revision', 'manifestHash', 'definition'], 'locked group')
    if (!validRevision(entry.revision) || !validHash(entry.manifestHash))
      throw new Error(`Invalid version for group ${id}`)
    const definition = parseGroup(entry.definition, id)
    if (definition.update !== 'merge') throw new Error(`Locked group is not mergeable: ${id}`)
    groups[id] = { revision: entry.revision, manifestHash: entry.manifestHash, definition }
  }
  const ownership = Object.keys(groups).length
    ? parseManifest({
        schemaVersion: 1,
        id: value.templateId,
        sourceRoot: 'template',
        renderer: value.renderer,
        groups: Object.fromEntries(
          Object.entries(groups).map(([id, group]) => [id, group.definition]),
        ),
      })
    : undefined
  const files: Record<string, FileBase> = Object.create(null)
  for (const [path, entry] of Object.entries(value.files)) {
    safePath(path)
    if (!record(entry)) throw new Error(`Invalid file base: ${path}`)
    keys(entry, ['group', 'hash', 'origin', 'mode'], 'file base')
    if (
      !identifier(entry.group) ||
      !groups[entry.group] ||
      !validHash(entry.hash) ||
      ![0o644, 0o755].includes(entry.mode as number)
    )
      throw new Error(`Invalid file base: ${path}`)
    if (!ownership || ownerOf(ownership, path) !== entry.group)
      throw new Error(`File base does not match group ownership: ${path}`)
    files[path] = {
      group: entry.group,
      hash: entry.hash,
      origin: safePath(entry.origin, 'Origin'),
      mode: entry.mode as number,
    }
  }
  return {
    schemaVersion: 1,
    templateId: value.templateId,
    configurationHash: value.configurationHash,
    renderer: { id: 'gvozdla-files', version: 1 },
    groups,
    files,
  }
}
export async function readProjectState(root: string): Promise<ProjectState> {
  await assertSafePath(root, '.template/project.json', true)
  await assertSafePath(root, '.template/lock.json', true)
  const projectText = await readFile(join(root, '.template/project.json'), 'utf8')
  const lockText = await readFile(join(root, '.template/lock.json'), 'utf8')
  const project = parseProject(JSON.parse(projectText))
  const lock = parseLock(JSON.parse(lockText))
  if (project.template.id !== lock.templateId)
    throw new Error('Project and lock template IDs differ')
  if (hash(json(project)) !== lock.configurationHash)
    throw new Error(
      'Project configuration differs from the locked generation; migration is required',
    )
  return { project, lock, projectText, lockText }
}
export async function readObject(root: string, digest: string): Promise<Buffer> {
  if (!validHash(digest)) throw new Error('Invalid object hash')
  const path = `.template/objects/${digest}`
  await assertSafePath(root, path, true)
  const content = await readFile(join(root, path))
  if (hash(content) !== digest) throw new Error(`Corrupt baseline object: ${digest}`)
  return content
}
export async function writeObject(root: string, digest: string, content: Buffer): Promise<void> {
  if (!validHash(digest) || hash(content) !== digest)
    throw new Error('Object content does not match its hash')
  const path = `.template/objects/${digest}`
  await assertSafePath(root, path, true)
  await mkdir(join(root, '.template/objects'), { recursive: true })
  try {
    await writeFile(join(root, path), content, { flag: 'wx' })
  } catch (error: any) {
    if (error.code !== 'EEXIST') throw error
    await readObject(root, digest)
  }
}
export async function readWorkingFile(
  root: string,
  path: string,
): Promise<{ content: Buffer; mode: number } | null> {
  await assertSafePath(root, path)
  try {
    const stats = await lstat(join(root, path))
    return { content: await readFile(join(root, path)), mode: stats.mode & 0o111 ? 0o755 : 0o644 }
  } catch (error: any) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}
