import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  realpath,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { discoverFeatures, scaffoldProject, type ScaffoldProjectOptions } from '../core'
import {
  assertSafeDirectory,
  assertSafePath,
  listFiles,
  MANIFEST_PATH,
  ownerOf,
  readManifest,
  safePath,
  type TemplateManifest,
} from './manifest'
import {
  hash,
  json,
  parseLock,
  parseProject,
  readObject,
  readProjectState,
  readWorkingFile,
  writeObject,
  type ProjectConfig,
  type ProjectLock,
} from './state'

async function git(root: string, args: string[], trim = true): Promise<string> {
  const proc = Bun.spawn(['git', ...args], {
    cwd: root,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const [code, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])
  if (code) throw new Error(`git ${args[0]} failed: ${stderr.trim()}`)
  return trim ? stdout.trim() : stdout
}
async function checkoutRevision(root: string): Promise<string> {
  if (
    (await realpath(root)) !== (await realpath(await git(root, ['rev-parse', '--show-toplevel'])))
  )
    throw new Error('Template checkout must be a Git repository root')
  if (await git(root, ['status', '--porcelain', '--untracked-files=all']))
    throw new Error('Template checkout must be clean to record an exact revision')
  return git(root, ['rev-parse', 'HEAD'])
}
interface Rendered {
  files: Map<string, { content: Buffer; mode: number; origin: string; group?: string }>
  manifest: TemplateManifest
  manifestHash: string
  revision: string
}
async function render(
  checkout: string,
  features: string[],
  source: { repository: string; ref: string },
): Promise<Rendered> {
  const { manifest, text } = await readManifest(checkout)
  const revision = await checkoutRevision(checkout)
  const tracked = new Set(
    (await git(checkout, ['ls-files', '-z'], false)).split('\0').filter(Boolean),
  )
  const requireTracked = (path: string): void => {
    if (!tracked.has(path)) throw new Error(`Template input is not tracked by Git: ${path}`)
  }
  requireTracked(MANIFEST_PATH)
  const featuresPath = join(checkout, 'scaffold/features')
  const hasFeatures = await lstat(featuresPath).then(
    () => true,
    (error: any) => {
      if (error.code === 'ENOENT') return false
      throw error
    },
  )
  if (hasFeatures) {
    await assertSafeDirectory(checkout, 'scaffold/features')
    // Validate feature manifests before discovery reads them, including their ancestors.
    for (const entry of await readdir(featuresPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const path = `scaffold/features/${entry.name}/feature.json`
      await assertSafePath(checkout, path)
      requireTracked(path)
    }
  }
  const temp = await mkdtemp(join(tmpdir(), 'gvozdla-render-'))
  const target = join(temp, 'project')
  try {
    // Validate all generated paths, not merely currently managed paths.
    for (const path of await listFiles(join(checkout, manifest.sourceRoot))) {
      safePath(path)
      requireTracked(`${manifest.sourceRoot}/${path}`)
    }
    for (const feature of await discoverFeatures(checkout)) {
      if (!features.includes(feature.id)) continue
      await assertSafeDirectory(checkout, `scaffold/features/${feature.id}/overlay`)
      for (const path of await listFiles(join(feature.directory, 'overlay'))) {
        safePath(path)
        requireTracked(`scaffold/features/${feature.id}/overlay/${path}`)
      }
    }
    await scaffoldProject({
      checkoutDirectory: checkout,
      targetDirectory: target,
      featureIds: features,
      source,
      templatePath: manifest.sourceRoot,
    })
    const overlays = new Map<string, string>()
    for (const feature of await discoverFeatures(checkout)) {
      if (!features.includes(feature.id)) continue
      const directory = join(feature.directory, 'overlay')
      for (const path of await listFiles(directory)) {
        safePath(path)
        overlays.set(path, relative(checkout, join(directory, path)).split('\\').join('/'))
      }
    }
    const files: Rendered['files'] = new Map()
    for (const path of await listFiles(target)) {
      if (path === '.template.json') continue // Legacy provenance is never a sync input.
      safePath(path)
      if (
        /(^|\/)\.env(?:\.[^/]+)?$/.test(path) &&
        !/\.env\.(?:example|sample|template)$/.test(path)
      )
        throw new Error(`Secret environment files cannot be shipped by templates: ${path}`)
      const local = (await readWorkingFile(target, path))!
      const origin = overlays.get(path) ?? `${manifest.sourceRoot}/${path}`
      requireTracked(origin)
      files.set(path, { ...local, origin, group: ownerOf(manifest, path) })
    }
    if ((await checkoutRevision(checkout)) !== revision)
      throw new Error('Template checkout changed while rendering')
    return { files, manifest, manifestHash: hash(text), revision }
  } finally {
    await rm(temp, { recursive: true, force: true })
  }
}
function freshLock(project: ProjectConfig): ProjectLock {
  return {
    schemaVersion: 1,
    templateId: project.template.id,
    configurationHash: hash(json(project)),
    renderer: { id: 'gvozdla-files', version: 1 },
    groups: {},
    files: Object.create(null),
  }
}
export async function createProject(options: ScaffoldProjectOptions): Promise<void> {
  const checkout = resolve(options.checkoutDirectory)
  const root = resolve(options.targetDirectory)
  const rendered = await render(checkout, options.featureIds, options.source)
  const project: ProjectConfig = {
    schemaVersion: 1,
    template: {
      id: rendered.manifest.id,
      repository: options.source.repository,
      ref: options.source.ref,
      manifest: MANIFEST_PATH,
    },
    features: [...options.featureIds],
    parameters: {},
  }
  parseProject(project)
  const lock = freshLock(project)
  // Render once, then copy exactly those immutable bytes into a newly reserved target.
  await mkdir(dirname(root), { recursive: true })
  await mkdir(root)
  let completed = false
  try {
    for (const [path, file] of rendered.files) {
      await mkdir(dirname(join(root, path)), { recursive: true })
      await writeFile(join(root, path), file.content)
      await chmod(join(root, path), file.mode)
    }
    await writeFile(
      join(root, '.template.json'),
      json({
        source: { ...options.source, templatePath: rendered.manifest.sourceRoot },
        features: options.featureIds,
      }),
    )
    for (const [id, definition] of Object.entries(rendered.manifest.groups)) {
      if (definition.update === 'merge')
        lock.groups[id] = {
          revision: rendered.revision,
          manifestHash: rendered.manifestHash,
          definition,
        }
    }
    for (const [path, file] of rendered.files) {
      if (!file.group || !lock.groups[file.group]) continue
      const digest = hash(file.content)
      lock.files[path] = { group: file.group, hash: digest, origin: file.origin, mode: file.mode }
      await writeObject(root, digest, file.content)
    }
    await mkdir(join(root, '.template'), { recursive: true })
    await writeFile(join(root, '.template/project.json'), json(project))
    await writeFile(join(root, '.template/lock.json'), json(lock))
    completed = true
  } finally {
    if (!completed) await rm(root, { recursive: true, force: true })
  }
}
export interface StatusChange {
  path: string
  group: string
  status: 'modified' | 'deleted'
}
export async function getStatus(root: string) {
  const state = await readProjectState(root)
  const changes: StatusChange[] = []
  for (const [path, base] of Object.entries(state.lock.files)) {
    await readObject(root, base.hash)
    const local = await readWorkingFile(root, path)
    if (!local) changes.push({ path, group: base.group, status: 'deleted' })
    else if (hash(local.content) !== base.hash || local.mode !== base.mode)
      changes.push({ path, group: base.group, status: 'modified' })
  }
  return {
    templateId: state.project.template.id,
    source: state.project.template,
    groups: Object.entries(state.lock.groups).map(([id, group]) => ({
      id,
      revision: group.revision,
      files: Object.values(state.lock.files).filter((file) => file.group === id).length,
      modified: changes.filter((file) => file.group === id && file.status === 'modified').length,
      deleted: changes.filter((file) => file.group === id && file.status === 'deleted').length,
    })),
    changes,
  }
}
export interface UpdateAction {
  path: string
  group: string
  kind: 'add' | 'update' | 'delete' | 'keep'
  beforeHash: string | null
  beforeMode: number | null
  afterHash: string | null
  afterMode: number | null
}
export interface UpdatePlan {
  templateId: string
  root: string
  revision: string
  groups: string[]
  actions: UpdateAction[]
  conflicts: { path: string; group: string; reason: string }[]
  changed: boolean
  objects: Record<string, string>
  expected: { projectText: string; lockText: string }
  nextLock: ProjectLock
}
function same(a: Buffer | null, b: Buffer | null): boolean {
  return a === null ? b === null : b !== null && a.equals(b)
}
async function mergeText(local: Buffer, base: Buffer, next: Buffer): Promise<Buffer | null> {
  // git merge-file expects text. Invalid UTF-8 and NUL-containing files are opaque.
  if (
    [local, base, next].some(
      (content) => content.includes(0) || !Buffer.from(content.toString('utf8')).equals(content),
    )
  )
    return null
  const temp = await mkdtemp(join(tmpdir(), 'gvozdla-merge-'))
  try {
    const paths = ['local', 'base', 'next'].map((name) => join(temp, name))
    await Promise.all(paths.map((path, index) => writeFile(path, [local, base, next][index])))
    const proc = Bun.spawn(['git', 'merge-file', '--stdout', '--', ...paths], {
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const [code, output, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).arrayBuffer(),
      new Response(proc.stderr).text(),
    ])
    if (code === 0) return Buffer.from(output)
    if (code >= 1 && code <= 127) return null
    throw new Error(`Text merge failed: ${stderr.trim()}`)
  } finally {
    await rm(temp, { recursive: true, force: true })
  }
}
export async function planUpdate(
  rootInput: string,
  options: { checkoutDirectory: string; only?: string[]; ref?: string },
): Promise<UpdatePlan> {
  const root = resolve(rootInput)
  const state = await readProjectState(root)
  const rendered = await render(resolve(options.checkoutDirectory), state.project.features, {
    repository: state.project.template.repository,
    ref: options.ref ?? state.project.template.ref,
  })
  if (rendered.manifest.id !== state.project.template.id)
    throw new Error('Source template ID differs from this project')
  const selected = new Set<string>()
  const select = (id: string): void => {
    const group = rendered.manifest.groups[id]
    if (!group) throw new Error(`Unknown or removed group: ${id}; migration required`)
    if (group.update !== 'merge') throw new Error(`Group ${id} is create-only`)
    if (selected.has(id)) return
    selected.add(id)
    for (const dependency of group.requires) select(dependency)
  }
  const requested = options.only ?? [
    ...new Set([
      ...Object.keys(state.lock.groups),
      ...Object.keys(rendered.manifest.groups).filter(
        (id) => rendered.manifest.groups[id].update === 'merge',
      ),
    ]),
  ]
  if (requested.length === 0) throw new Error('No update groups selected')
  requested.forEach(select)
  const nextLock = structuredClone(state.lock)
  nextLock.files = Object.assign(Object.create(null), state.lock.files)
  const plan: UpdatePlan = {
    templateId: rendered.manifest.id,
    root,
    revision: rendered.revision,
    groups: [...selected].sort(),
    actions: [],
    conflicts: [],
    changed: false,
    objects: {},
    expected: { projectText: state.projectText, lockText: state.lockText },
    nextLock,
  }
  for (const id of plan.groups)
    nextLock.groups[id] = {
      revision: rendered.revision,
      manifestHash: rendered.manifestHash,
      definition: rendered.manifest.groups[id],
    }
  const paths = new Set([
    ...Object.keys(state.lock.files).filter((path) => selected.has(state.lock.files[path].group)),
    ...[...rendered.files.entries()]
      .filter(([, file]) => file.group && selected.has(file.group))
      .map(([path]) => path),
  ])
  for (const path of [...paths].sort()) {
    const oldBase = state.lock.files[path]
    const next = rendered.files.get(path)
    const group = oldBase?.group ?? next!.group!
    if (oldBase && !selected.has(oldBase.group))
      throw new Error(`File ownership changed for ${path}; migration required`)
    if (oldBase && next && next.group !== oldBase.group)
      throw new Error(`File ownership changed or removed for ${path}; migration required`)
    if (!oldBase && next?.group && !selected.has(next.group))
      throw new Error(`Invalid group selection for ${path}`)
    const base = oldBase ? await readObject(root, oldBase.hash) : null
    const localFile = await readWorkingFile(root, path)
    const local = localFile?.content ?? null
    const incoming = next?.content ?? null
    let merged: Buffer | null = null
    let conflict: string | undefined
    if (same(local, incoming)) merged = local
    else if (same(local, base) && (localFile?.mode ?? null) === (oldBase?.mode ?? null))
      merged = incoming
    else if (same(incoming, base) && (next?.mode ?? null) === (oldBase?.mode ?? null))
      merged = local
    else if (local && base && incoming) {
      merged = await mergeText(local, base, incoming)
      if (!merged) conflict = 'Overlapping text changes or divergent binary changes'
    } else
      conflict = !base
        ? 'New template file collides with a project file'
        : !incoming
          ? 'Template deleted a locally modified file'
          : 'Project deleted a file changed by the template'
    let mode: number | null = null
    if (merged) {
      const b = oldBase?.mode ?? null,
        l = localFile?.mode ?? null,
        n = next?.mode ?? null
      if (l === n) mode = l
      else if (l === b) mode = n
      else if (n === b) mode = l
      else if (l === null) mode = n
      else if (n === null) mode = l
      else conflict = 'File mode changed differently in project and template'
    }
    const beforeHash = local === null ? null : hash(local)
    if (conflict) {
      plan.conflicts.push({ path, group, reason: conflict })
      // Capture every examined path for optimistic revalidation, even conflicts.
      plan.actions.push({
        path,
        group,
        kind: 'keep',
        beforeHash,
        beforeMode: localFile?.mode ?? null,
        afterHash: beforeHash,
        afterMode: localFile?.mode ?? null,
      })
      continue
    }
    const afterHash = merged === null ? null : hash(merged)
    if (merged) plan.objects[afterHash!] = merged.toString('base64')
    plan.actions.push({
      path,
      group,
      kind:
        beforeHash === afterHash && (localFile?.mode ?? null) === mode
          ? 'keep'
          : merged === null
            ? 'delete'
            : local === null
              ? 'add'
              : 'update',
      beforeHash,
      beforeMode: localFile?.mode ?? null,
      afterHash,
      afterMode: mode,
    })
    if (next) {
      const digest = hash(next.content)
      nextLock.files[path] = { group, hash: digest, origin: next.origin, mode: next.mode }
      plan.objects[digest] = next.content.toString('base64')
    } else delete nextLock.files[path]
  }
  if (!plan.conflicts.length) parseLock(nextLock)
  plan.changed =
    json(nextLock) !== state.lockText || plan.actions.some((action) => action.kind !== 'keep')
  return plan
}
export function summarizePlan(plan: UpdatePlan) {
  return {
    templateId: plan.templateId,
    revision: plan.revision,
    groups: plan.groups,
    actions: plan.actions.map(({ path, group, kind }) => ({ path, group, kind })),
    conflicts: plan.conflicts,
    changed: plan.changed,
  }
}
async function requireCleanProject(root: string): Promise<void> {
  if (
    (await realpath(root)) !== (await realpath(await git(root, ['rev-parse', '--show-toplevel'])))
  )
    throw new Error('Update requires a dedicated Git repository at the project root')
  await git(root, ['rev-parse', '--verify', 'HEAD'])
  if (await git(root, ['status', '--porcelain', '--untracked-files=all']))
    throw new Error('Update requires a clean Git working tree; commit or stash changes first')
}
export async function applyUpdate(
  rootInput: string,
  plan: UpdatePlan,
): Promise<{ branch: string | null }> {
  const root = resolve(rootInput)
  if (root !== plan.root) throw new Error('Update plan belongs to another project')
  if (plan.conflicts.length)
    throw new Error(`Update has ${plan.conflicts.length} conflict(s); no files were changed`)
  const state = await readProjectState(root)
  if (state.projectText !== plan.expected.projectText || state.lockText !== plan.expected.lockText)
    throw new Error('Project metadata changed after planning; rerun update')
  for (const action of plan.actions) {
    const local = await readWorkingFile(root, action.path)
    if (
      (local ? hash(local.content) : null) !== action.beforeHash ||
      (local?.mode ?? null) !== action.beforeMode
    )
      throw new Error(`Project file changed after planning: ${action.path}`)
  }
  if (!plan.changed) return { branch: null }
  await requireCleanProject(root)
  const previousBranch = await git(root, ['symbolic-ref', '--short', 'HEAD']).catch(() => '')
  const previousHead = await git(root, ['rev-parse', 'HEAD'])
  const branch = `feat/gvozdla-update-${randomUUID().slice(0, 8)}`
  const backups = new Map<string, { content: Buffer; mode: number } | null>()
  const createdDirectories: string[] = []
  const createdObjects: string[] = []
  const ensureDirectory = async (directory: string): Promise<void> => {
    if (directory === root) return
    try {
      const stat = await lstat(directory)
      if (!stat.isDirectory() || stat.isSymbolicLink())
        throw new Error(`Unsafe directory: ${directory}`)
      return
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error
    }
    await ensureDirectory(dirname(directory))
    await mkdir(directory)
    createdDirectories.push(directory)
  }
  await git(root, ['-c', 'core.hooksPath=/dev/null', 'switch', '-c', branch])
  try {
    for (const action of plan.actions) {
      if (action.kind === 'keep') continue
      await assertSafePath(root, action.path)
      backups.set(action.path, await readWorkingFile(root, action.path))
      if (action.afterHash === null) await rm(join(root, action.path))
      else {
        const encoded = plan.objects[action.afterHash]
        if (typeof encoded !== 'string') throw new Error(`Missing planned object: ${action.path}`)
        const content = Buffer.from(encoded, 'base64')
        if (hash(content) !== action.afterHash)
          throw new Error(`Corrupt planned object: ${action.path}`)
        await ensureDirectory(dirname(join(root, action.path)))
        await writeFile(join(root, action.path), content)
        await chmod(join(root, action.path), action.afterMode!)
      }
    }
    for (const file of Object.values(plan.nextLock.files)) {
      const encoded = plan.objects[file.hash]
      if (encoded === undefined) continue
      const objectPath = `.template/objects/${file.hash}`
      await assertSafePath(root, objectPath, true)
      const existed = await lstat(join(root, objectPath)).then(
        () => true,
        (error: any) => {
          if (error.code === 'ENOENT') return false
          throw error
        },
      )
      await ensureDirectory(join(root, '.template/objects'))
      await writeObject(root, file.hash, Buffer.from(encoded, 'base64'))
      if (!existed) createdObjects.push(join(root, objectPath))
    }
    await assertSafePath(root, '.template/lock.json', true)
    await writeFile(join(root, '.template/lock.json'), json(plan.nextLock))
    return { branch }
  } catch (error) {
    // Roll back this operation only; unrelated project paths are never reset.
    for (const [path, backup] of [...backups].reverse()) {
      if (backup) {
        await writeFile(join(root, path), backup.content)
        await chmod(join(root, path), backup.mode)
      } else await rm(join(root, path), { force: true })
    }
    await writeFile(join(root, '.template/lock.json'), state.lockText)
    for (const path of createdObjects) await rm(path, { force: true })
    for (const directory of createdDirectories.reverse()) await rmdir(directory)
    await git(root, [
      '-c',
      'core.hooksPath=/dev/null',
      'switch',
      ...(previousBranch ? [previousBranch] : ['--detach', previousHead]),
    ])
    await git(root, ['branch', '-D', branch])
    throw error
  }
}
