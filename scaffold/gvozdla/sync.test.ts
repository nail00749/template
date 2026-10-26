import { afterEach, describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { chmod, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyUpdate, createProject, getStatus, planUpdate } from './sync'

const temporaryDirectories: Array<string> = []
const identity = [
  '-c',
  'user.name=Gvozdla Test',
  '-c',
  'user.email=gvozdla@example.test',
  '-c',
  'core.hooksPath=/dev/null',
  '-c',
  'commit.gpgsign=false',
]

async function temp(prefix: string): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), prefix))
  temporaryDirectories.push(path)
  return path
}

async function put(root: string, path: string, content: string): Promise<void> {
  const fullPath = join(root, path)
  await mkdir(join(fullPath, '..'), { recursive: true })
  await writeFile(fullPath, content)
}

async function git(root: string, ...args: Array<string>): Promise<string> {
  const process = Bun.spawn(['git', ...identity, ...args], {
    cwd: root,
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const [exitCode, stdout, stderr] = await Promise.all([
    process.exited,
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
  ])
  if (exitCode !== 0) throw new Error(stderr || stdout)
  return stdout.trim()
}

async function commit(root: string, message: string): Promise<string> {
  await git(root, 'add', '-A')
  await git(root, 'commit', '-m', message)
  return git(root, 'rev-parse', 'HEAD')
}

async function repository(): Promise<string> {
  const root = await temp('gvozdla-template-')
  await git(root, 'init', '--initial-branch=main')
  await put(
    root,
    'template.manifest.json',
    `${JSON.stringify(
      {
        schemaVersion: 1,
        id: 'tanstack',
        name: 'TanStack',
        sourceRoot: 'tanstack-start',
        renderer: { id: 'gvozdla-files', version: 1 },
        groups: {
          ui: {
            include: ['src/shared/ui/**'],
            exclude: [],
            requires: ['utils'],
            update: 'merge',
          },
          utils: { include: ['src/shared/lib/**'], update: 'merge' },
          tooling: { include: ['package.json'], update: 'merge' },
          starter: { include: ['src/pages/seed.tsx'], update: 'create-only' },
        },
      },
      null,
      2,
    )}\n`,
  )
  await put(
    root,
    'tanstack-start/src/shared/ui/button.tsx',
    'export const label = "base"\nconst gap1 = 1\nconst gap2 = 2\nconst gap3 = 3\nconst gap4 = 4\nexport const tone = "blue"\n',
  )
  await put(
    root,
    'tanstack-start/src/shared/lib/format.ts',
    'export const format = (value: string) => value\n',
  )
  await put(root, 'tanstack-start/package.json', '{"name":"starter"}\n')
  await put(root, 'tanstack-start/src/pages/home.tsx', 'export const home = true\n')
  await put(root, 'tanstack-start/src/pages/seed.tsx', 'export const seed = "v1"\n')
  await put(root, 'tanstack-start/src/shared/ui/icon.png', '\u0000base-image')
  await put(
    root,
    'scaffold/features/keycloak-auth/feature.json',
    `${JSON.stringify(
      {
        id: 'keycloak-auth',
        label: 'Keycloak auth',
        description: 'OIDC',
        overwrites: [],
      },
      null,
      2,
    )}\n`,
  )
  await put(
    root,
    'scaffold/features/keycloak-auth/overlay/src/shared/ui/auth-button.tsx',
    'export const authButton = true\n',
  )
  await commit(root, 'template v1')
  return root
}

async function project(
  template: string,
  name = 'generated',
): Promise<{ root: string; sha: string }> {
  const root = join(await temp('gvozdla-project-root-'), name)
  const sha = await git(template, 'rev-parse', 'HEAD')
  await createProject({
    checkoutDirectory: template,
    targetDirectory: root,
    featureIds: ['keycloak-auth'],
    source: { repository: template, ref: sha },
  })
  await git(root, 'init', '--initial-branch=main')
  await git(root, 'add', '-A')
  await git(root, ...identity, 'commit', '-m', 'generated from template')
  return { root, sha }
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  )
})

describe('gvozdla project state', () => {
  test('create stores the exact source revision, rendered base bytes, and feature origin', async () => {
    const template = await repository()
    const { root, sha } = await project(template)
    const lock = JSON.parse(await readFile(join(root, '.template/lock.json'), 'utf8')) as {
      template: { ref: string }
      groups: Record<string, { revision: string }>
      files: Record<string, { hash: string; origin: string }>
    }
    const projectConfig = JSON.parse(await readFile(join(root, '.template/project.json'), 'utf8'))
    const baseline = Buffer.from(
      await readFile(join(root, '.template/objects', lock.files['src/shared/ui/button.tsx']!.hash)),
    )

    expect(lock.groups.ui!.revision).toBe(sha)
    expect(projectConfig.template.ref).toBe(sha)
    expect(projectConfig.features).toEqual(['keycloak-auth'])
    expect(baseline.toString()).toContain('tone = "blue"')
    expect(createHash('sha256').update(baseline).digest('hex')).toBe(
      lock.files['src/shared/ui/button.tsx']!.hash,
    )
    expect(lock.files['src/shared/ui/auth-button.tsx']?.origin).toContain('keycloak-auth')
    expect(await readFile(join(root, 'src/pages/home.tsx'), 'utf8')).toContain('home')
  })

  test('status reports edits and deletions relative to the saved base', async () => {
    const template = await repository()
    const { root } = await project(template)
    await put(root, 'src/shared/ui/button.tsx', 'locally changed\n')
    await rm(join(root, 'src/shared/lib/format.ts'))

    const status = await getStatus(root)
    expect(status.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'src/shared/ui/button.tsx', status: 'modified' }),
        expect.objectContaining({ path: 'src/shared/lib/format.ts', status: 'deleted' }),
      ]),
    )
  })
})

describe('gvozdla updates', () => {
  test('updates additions, deletions, and independent local edits without advancing unrelated groups', async () => {
    const template = await repository()
    const { root } = await project(template)
    const initialLock = JSON.parse(await readFile(join(root, '.template/lock.json'), 'utf8'))
    await put(
      root,
      'src/shared/ui/button.tsx',
      'export const label = "local"\nconst gap1 = 1\nconst gap2 = 2\nconst gap3 = 3\nconst gap4 = 4\nexport const tone = "blue"\n',
    )
    await git(root, 'add', '-A')
    await git(root, ...identity, 'commit', '-m', 'local label')

    await put(
      template,
      'tanstack-start/src/shared/ui/button.tsx',
      'export const label = "base"\nconst gap1 = 1\nconst gap2 = 2\nconst gap3 = 3\nconst gap4 = 4\nexport const tone = "green"\n',
    )
    await put(template, 'tanstack-start/src/shared/ui/new.ts', 'export const fresh = true\n')
    await rm(join(template, 'tanstack-start/src/shared/lib/format.ts'))
    const nextRevision = await commit(template, 'template v2')

    const plan = await planUpdate(root, { checkoutDirectory: template, only: ['ui'] })
    expect(plan.conflicts).toEqual([])
    expect(plan.groups).toContain('utils')
    await applyUpdate(root, plan)

    const button = await readFile(join(root, 'src/shared/ui/button.tsx'), 'utf8')
    expect(button).toContain('label = "local"')
    expect(button).toContain('tone = "green"')
    expect(await readFile(join(root, 'src/shared/ui/new.ts'), 'utf8')).toContain('fresh')
    const updatedLock = JSON.parse(await readFile(join(root, '.template/lock.json'), 'utf8'))
    expect(updatedLock.groups.ui.revision).toBe(nextRevision)
    expect(updatedLock.groups.utils.revision).toBe(nextRevision)
    expect(updatedLock.groups.tooling.revision).toBe(initialLock.groups.tooling.revision)
    await expect(readFile(join(root, 'src/shared/lib/format.ts'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })

  test('reports overlapping edits and leaves files and lock unchanged when conflicted', async () => {
    const template = await repository()
    const { root } = await project(template)
    await put(
      root,
      'src/shared/ui/button.tsx',
      'export const label = "local"\nconst gap1 = 1\nconst gap2 = 2\nconst gap3 = 3\nconst gap4 = 4\nexport const tone = "blue"\n',
    )
    await git(root, 'add', '-A')
    await git(root, ...identity, 'commit', '-m', 'local label')
    await put(
      template,
      'tanstack-start/src/shared/ui/button.tsx',
      'export const label = "upstream"\nexport const tone = "blue"\n',
    )
    await commit(template, 'conflicting upstream edit')
    const originalLock = await readFile(join(root, '.template/lock.json'), 'utf8')

    const plan = await planUpdate(root, { checkoutDirectory: template })
    expect(plan.conflicts.map((conflict) => conflict.path)).toContain('src/shared/ui/button.tsx')
    await expect(applyUpdate(root, plan)).rejects.toThrow()
    expect(await readFile(join(root, '.template/lock.json'), 'utf8')).toBe(originalLock)
    expect(await readFile(join(root, 'src/shared/ui/button.tsx'), 'utf8')).toContain(
      'label = "local"',
    )
  })

  test('keeps the template base separate from merged project content on the next update', async () => {
    const template = await repository()
    const { root } = await project(template)
    await put(
      root,
      'src/shared/ui/button.tsx',
      'export const label = "local"\nconst gap1 = 1\nconst gap2 = 2\nconst gap3 = 3\nconst gap4 = 4\nexport const tone = "blue"\n',
    )
    await git(root, 'add', '-A')
    await git(root, ...identity, 'commit', '-m', 'local edit')
    await put(
      template,
      'tanstack-start/src/shared/ui/button.tsx',
      'export const label = "base"\nconst gap1 = 1\nconst gap2 = 2\nconst gap3 = 3\nconst gap4 = 4\nexport const tone = "green"\n',
    )
    await commit(template, 'v2')
    await applyUpdate(root, await planUpdate(root, { checkoutDirectory: template }))
    await git(root, 'add', '-A')
    await git(root, ...identity, 'commit', '-m', 'apply template v2')

    await put(
      template,
      'tanstack-start/src/shared/ui/button.tsx',
      'export const label = "base"\nconst gap1 = 1\nconst gap2 = 2\nconst gap3 = 3\nconst gap4 = 4\nexport const tone = "red"\n',
    )
    await commit(template, 'v3')
    const secondPlan = await planUpdate(root, { checkoutDirectory: template })
    expect(secondPlan.conflicts).toEqual([])
    await applyUpdate(root, secondPlan)
    const content = await readFile(join(root, 'src/shared/ui/button.tsx'), 'utf8')
    expect(content).toContain('label = "local"')
    expect(content).toContain('tone = "red"')
  })

  test('fails closed when a binary file changes on both sides', async () => {
    const template = await repository()
    const { root } = await project(template)
    const binaryPath = 'src/shared/ui/icon.png'
    await put(root, binaryPath, '\u0000local-image')
    await git(root, 'add', '-A')
    await git(root, ...identity, 'commit', '-m', 'local binary change')
    await put(template, `tanstack-start/${binaryPath}`, '\u0000upstream-image')
    await commit(template, 'upstream binary change')

    const plan = await planUpdate(root, { checkoutDirectory: template })
    expect(plan.conflicts.map((conflict) => conflict.path)).toContain(binaryPath)
    await expect(applyUpdate(root, plan)).rejects.toThrow()
    expect((await readFile(join(root, binaryPath))).toString()).toBe('\u0000local-image')
  })

  test('rejects unsafe manifest paths before creating a project', async () => {
    const template = await repository()
    const manifestPath = join(template, 'template.manifest.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    manifest.groups.ui.include = ['../outside/**']
    await writeFile(manifestPath, JSON.stringify(manifest))
    await commit(template, 'unsafe manifest')

    await expect(project(template, 'unsafe')).rejects.toThrow(/safe relative path|unsafe/i)
  })

  test('rejects ignored template inputs that are absent from the source commit', async () => {
    const template = await repository()
    await put(template, '.gitignore', 'tanstack-start/*.ignored\n')
    await commit(template, 'ignore local-only files')
    await put(template, 'tanstack-start/leaked.ignored', 'untracked input\n')

    await expect(project(template, 'ignored-input')).rejects.toThrow(/not tracked/i)
  })

  test('keeps create-only and unclaimed generated files after their source changes', async () => {
    const template = await repository()
    const { root } = await project(template)
    await put(template, 'tanstack-start/src/pages/seed.tsx', 'export const seed = "v2"\n')
    await put(template, 'tanstack-start/src/pages/home.tsx', 'export const home = false\n')
    await commit(template, 'change starter pages')

    const plan = await planUpdate(root, { checkoutDirectory: template })
    expect(plan.actions.map((action) => action.path)).not.toContain('src/pages/seed.tsx')
    expect(plan.actions.map((action) => action.path)).not.toContain('src/pages/home.tsx')
    await applyUpdate(root, plan)
    expect(await readFile(join(root, 'src/pages/seed.tsx'), 'utf8')).toContain('seed = "v1"')
    expect(await readFile(join(root, 'src/pages/home.tsx'), 'utf8')).toContain('home = true')
  })

  test('detects a corrupted content-addressed baseline object', async () => {
    const template = await repository()
    const { root } = await project(template)
    const lock = JSON.parse(await readFile(join(root, '.template/lock.json'), 'utf8'))
    const digest = lock.files['src/shared/ui/button.tsx'].hash
    await writeFile(join(root, '.template/objects', digest), 'tampered')
    await expect(getStatus(root)).rejects.toThrow(/corrupt|hash/i)
  })

  test('rejects a symlink inserted into a managed project path', async () => {
    const template = await repository()
    const { root } = await project(template)
    await rename(join(root, 'src/shared/ui'), join(root, 'src/shared/ui-real'))
    await symlink(join(root, 'src/shared/ui-real'), join(root, 'src/shared/ui'))
    await expect(getStatus(root)).rejects.toThrow(/symbolic link/i)
  })

  test('rejects a dirty project before applying an update', async () => {
    const template = await repository()
    const { root } = await project(template)
    await put(template, 'tanstack-start/src/shared/ui/button.tsx', 'upstream\n')
    await commit(template, 'v2')
    const plan = await planUpdate(root, { checkoutDirectory: template })
    await put(root, 'src/local.ts', 'uncommitted\n')
    await expect(applyUpdate(root, plan)).rejects.toThrow(/clean|dirty/i)
  })

  test('treats a local mode-only edit as a modification when upstream deletes the file', async () => {
    const template = await repository()
    const { root } = await project(template)
    const path = 'src/shared/ui/button.tsx'
    await chmod(join(root, path), 0o755)
    await git(root, 'add', '-A')
    await git(root, ...identity, 'commit', '-m', 'make local file executable')
    await rm(join(template, 'tanstack-start', path))
    await commit(template, 'delete button')

    const plan = await planUpdate(root, { checkoutDirectory: template })
    expect(plan.conflicts.map((conflict) => conflict.path)).toContain(path)
  })

  test('reports a conflict when the project deletes a file whose upstream mode changed', async () => {
    const template = await repository()
    const { root } = await project(template)
    const path = 'src/shared/ui/button.tsx'
    await rm(join(root, path))
    await git(root, 'add', '-A')
    await git(root, ...identity, 'commit', '-m', 'delete button locally')
    await chmod(join(template, 'tanstack-start', path), 0o755)
    await commit(template, 'make button executable upstream')

    const plan = await planUpdate(root, { checkoutDirectory: template })
    expect(plan.conflicts.map((conflict) => conflict.path)).toContain(path)
  })

  test('rejects project metadata or managed-file changes made after planning', async () => {
    const template = await repository()
    const { root } = await project(template)
    await put(template, 'tanstack-start/src/shared/ui/button.tsx', 'upstream\n')
    await commit(template, 'v2')

    const statePlan = await planUpdate(root, { checkoutDirectory: template })
    const statePath = join(root, '.template/project.json')
    const stateText = await readFile(statePath, 'utf8')
    await writeFile(statePath, `${stateText} `)
    await expect(applyUpdate(root, statePlan)).rejects.toThrow(/metadata changed/i)
    await writeFile(statePath, stateText)

    const filePlan = await planUpdate(root, { checkoutDirectory: template })
    await put(root, 'src/shared/ui/button.tsx', 'changed after planning\n')
    await expect(applyUpdate(root, filePlan)).rejects.toThrow(/changed after planning/i)
  })

  test('requires the generated project root to be its own Git repository', async () => {
    const template = await repository()
    const parent = await temp('gvozdla-parent-repository-')
    const root = join(parent, 'app')
    const sha = await git(template, 'rev-parse', 'HEAD')
    await createProject({
      checkoutDirectory: template,
      targetDirectory: root,
      featureIds: ['keycloak-auth'],
      source: { repository: template, ref: sha },
    })
    await git(parent, 'init', '--initial-branch=main')
    await git(parent, 'add', '-A')
    await git(parent, ...identity, 'commit', '-m', 'parent repo')
    await put(template, 'tanstack-start/src/shared/ui/button.tsx', 'upstream\n')
    await commit(template, 'v2')

    const plan = await planUpdate(root, { checkoutDirectory: template })
    await expect(applyUpdate(root, plan)).rejects.toThrow(/dedicated Git repository/i)
  })

  test('rolls back earlier file writes and branch changes after a later write fails', async () => {
    const template = await repository()
    const { root } = await project(template)
    const packagePath = 'package.json'
    const buttonPath = 'src/shared/ui/button.tsx'
    const packageBefore = await readFile(join(root, packagePath), 'utf8')
    const buttonBefore = await readFile(join(root, buttonPath), 'utf8')
    const lockBefore = await readFile(join(root, '.template/lock.json'), 'utf8')
    const branchBefore = await git(root, 'symbolic-ref', '--short', 'HEAD')
    await put(template, `tanstack-start/${packagePath}`, '{"name":"updated"}\n')
    await put(template, `tanstack-start/${buttonPath}`, 'upstream\n')
    await commit(template, 'change package and button')
    const plan = await planUpdate(root, { checkoutDirectory: template })
    const laterAction = plan.actions.find((action) => action.path === buttonPath)!
    plan.objects[laterAction.afterHash!] = 'corrupt planned object'

    await expect(applyUpdate(root, plan)).rejects.toThrow(/corrupt planned object/i)
    expect(await readFile(join(root, packagePath), 'utf8')).toBe(packageBefore)
    expect(await readFile(join(root, buttonPath), 'utf8')).toBe(buttonBefore)
    expect(await readFile(join(root, '.template/lock.json'), 'utf8')).toBe(lockBefore)
    expect(await git(root, 'symbolic-ref', '--short', 'HEAD')).toBe(branchBefore)
    expect(await git(root, 'branch', '--list', 'feat/gvozdla-update-*')).toBe('')
  })

  test('rejects unknown manifest fields, dependency cycles, and overlapping file groups', async () => {
    const cases: Array<{ label: string; mutate: (manifest: any) => void; pattern: RegExp }> = [
      {
        label: 'unknown field',
        mutate: (manifest) => {
          manifest.unknown = true
        },
        pattern: /unsupported.*field/i,
      },
      {
        label: 'dependency cycle',
        mutate: (manifest) => {
          manifest.groups.utils.requires = ['ui']
        },
        pattern: /cycle/i,
      },
      {
        label: 'overlap',
        mutate: (manifest) => {
          manifest.groups.tooling.include.push('src/shared/ui/**')
        },
        pattern: /overlapping groups/i,
      },
    ]
    for (const item of cases) {
      const template = await repository()
      const path = join(template, 'template.manifest.json')
      const manifest = JSON.parse(await readFile(path, 'utf8'))
      item.mutate(manifest)
      await writeFile(path, JSON.stringify(manifest))
      await commit(template, item.label)
      await expect(project(template, item.label.replaceAll(' ', '-'))).rejects.toThrow(item.pattern)
    }
  })
})
