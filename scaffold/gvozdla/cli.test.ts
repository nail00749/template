import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseSyncArgs } from './cli'

const temporaryDirectories: string[] = []
afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  )
})

async function execute(args: string[], cwd: string) {
  const child = Bun.spawn(args, { cwd, stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' })
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ])
  return { code, stdout, stderr }
}
async function git(cwd: string, ...args: string[]) {
  const result = await execute(
    [
      'git',
      '-c',
      'user.name=gvozdla Test',
      '-c',
      'user.email=gvozdla@example.test',
      '-c',
      'core.hooksPath=/dev/null',
      '-c',
      'commit.gpgsign=false',
      ...args,
    ],
    cwd,
  )
  if (result.code) throw new Error(result.stderr)
  return result.stdout.trim()
}
const cli = (cwd: string, ...args: string[]) =>
  execute(['bun', join(import.meta.dir, 'cli.ts'), ...args], cwd)

describe('gvozdla command arguments', () => {
  test('parses partial update and repeatable groups', () => {
    expect(
      parseSyncArgs('update', [
        '--only=ui,tooling',
        '--only',
        'ui,utils',
        '--dry-run',
        '--json',
        '--project',
        '/tmp/app',
        '--ref=release',
      ]),
    ).toEqual({
      project: '/tmp/app',
      remote: false,
      json: true,
      dryRun: true,
      only: ['ui', 'tooling', 'utils'],
      ref: 'release',
    })
  })
  test('rejects invalid, missing and command-specific flags', () => {
    for (const args of [['--only', '../secret'], ['--project'], ['--json=true'], ['--remote']]) {
      expect(() => parseSyncArgs('update', args)).toThrow()
    }
    expect(() => parseSyncArgs('status', ['--only', 'ui'])).toThrow()
    expect(() => parseSyncArgs('status', ['--ref', 'main'])).toThrow('--remote')
    expect(() => parseSyncArgs('status', ['--dry-run'])).toThrow()
  })
})

describe('gvozdla subprocess', () => {
  test('help and unknown commands have useful exit codes', async () => {
    const help = await cli(import.meta.dir, '--help')
    expect(help.code).toBe(0)
    expect(help.stdout).toContain('gvozdla create')
    const unknown = await cli(import.meta.dir, 'contribute')
    expect(unknown.code).toBe(1)
    expect(unknown.stderr).toContain('Unknown command')
    const template = await cli(import.meta.dir, 'create', '--template', 'missing')
    expect(template.code).toBe(1)
    expect(template.stderr).toContain('Unknown template')
  })

  test('create, offline/remote status, dry-run, update and conflicts through real Git', async () => {
    const root = await mkdtemp(join(tmpdir(), 'gvozdla-cli-'))
    temporaryDirectories.push(root)
    const source = join(root, 'source')
    const app = join(root, 'app')
    await mkdir(join(source, 'tanstack-start/src/shared/ui'), { recursive: true })
    await writeFile(
      join(source, 'template.manifest.json'),
      JSON.stringify({
        schemaVersion: 1,
        id: 'tanstack',
        sourceRoot: 'tanstack-start',
        renderer: { id: 'gvozdla-files', version: 1 },
        groups: { ui: { include: ['src/shared/ui/**'], update: 'merge' } },
      }),
    )
    const relativeFile = 'src/shared/ui/example.ts'
    await writeFile(join(source, 'tanstack-start', relativeFile), 'export const value = 1\n')
    await git(source, 'init', '--initial-branch=main')
    await git(source, 'add', '.')
    await git(source, 'commit', '-m', 'base')
    const baseRevision = await git(source, 'rev-parse', 'HEAD')

    const created = await cli(
      root,
      'create',
      app,
      '--repo',
      './source',
      '--template',
      'tanstack',
      '--no-install',
      '--init-git',
    )
    expect(created.code).toBe(0)
    expect(created.stdout).toContain(`Created ${app}`)
    const project = JSON.parse(await readFile(join(app, '.template/project.json'), 'utf8'))
    expect(await realpath(project.template.repository)).toBe(await realpath(source))
    await git(app, 'add', '.')
    await git(app, 'commit', '-m', 'generated')
    const local = await cli(app, 'status', '--json')
    expect(local.code).toBe(0)
    expect(JSON.parse(local.stdout).groups[0].revision).toBe(baseRevision)
    expect(JSON.parse(local.stdout).changes).toEqual([])

    await writeFile(join(source, 'tanstack-start', relativeFile), 'export const value = 2\n')
    await git(source, 'add', '.')
    await git(source, 'commit', '-m', 'upstream')
    const upstreamRevision = await git(source, 'rev-parse', 'HEAD')
    const lockBefore = await readFile(join(app, '.template/lock.json'), 'utf8')
    const remote = await cli(app, 'status', '--remote', '--json')
    expect(remote.code).toBe(0)
    expect(JSON.parse(remote.stdout).revision).toBe(upstreamRevision)
    const preview = await cli(app, 'update', '--only', 'ui', '--dry-run', '--json')
    expect(preview.code).toBe(0)
    expect(JSON.parse(preview.stdout).actions[0].kind).toBe('update')
    expect(await readFile(join(app, '.template/lock.json'), 'utf8')).toBe(lockBefore)
    expect(await git(app, 'branch', '--show-current')).toBe('main')

    const updated = await cli(app, 'update', '--only', 'ui', '--json')
    expect(updated.code).toBe(0)
    expect(JSON.parse(updated.stdout).branch).toStartWith('feat/gvozdla-update-')
    expect(await readFile(join(app, relativeFile), 'utf8')).toBe('export const value = 2\n')
    await git(app, 'add', '.')
    await git(app, 'commit', '-m', 'update')
    const noOp = await cli(app, 'update', '--json')
    expect(noOp.code).toBe(0)
    expect(JSON.parse(noOp.stdout).branch).toBeNull()

    await writeFile(join(app, relativeFile), 'export const value = 100\n')
    await git(app, 'add', '.')
    await git(app, 'commit', '-m', 'customization')
    await writeFile(join(source, 'tanstack-start', relativeFile), 'export const value = 3\n')
    await git(source, 'add', '.')
    await git(source, 'commit', '-m', 'upstream conflict')
    const previousLock = await readFile(join(app, '.template/lock.json'), 'utf8')
    const previousBranch = await git(app, 'branch', '--show-current')
    const conflicted = await cli(app, 'update', '--json')
    expect(conflicted.code).toBe(2)
    expect(JSON.parse(conflicted.stdout).conflicts).toHaveLength(1)
    expect(await readFile(join(app, relativeFile), 'utf8')).toBe('export const value = 100\n')
    expect(await readFile(join(app, '.template/lock.json'), 'utf8')).toBe(previousLock)
    expect(await git(app, 'branch', '--show-current')).toBe(previousBranch)
    expect(await git(app, 'status', '--porcelain')).toBe('')
  }, 20000)
})
