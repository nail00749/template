import { afterEach, describe, expect, test } from 'bun:test'
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseCliArgs } from './cli'

const temporaryDirectories: Array<string> = []

async function createTemporaryDirectory(prefix: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

async function writeFixture(path: string, contents: string): Promise<void> {
  await mkdir(join(path, '..'), { recursive: true })
  await writeFile(path, contents)
}

async function runGit(repository: string, args: Array<string>): Promise<void> {
  const process = Bun.spawn(['git', ...args], {
    cwd: repository,
    stdout: 'ignore',
    stderr: 'pipe',
  })
  const [exitCode, error] = await Promise.all([process.exited, new Response(process.stderr).text()])

  if (exitCode !== 0) {
    throw new Error(error)
  }
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  )
})

describe('CLI arguments', () => {
  test('uses the public template repository and interactive defaults', () => {
    expect(parseCliArgs([])).toEqual({
      repository: 'https://github.com/nail00749/template.git',
      ref: 'main',
    })
  })

  test('accepts a target and repeatable feature flags for non-interactive use', () => {
    expect(
      parseCliArgs([
        'my-app',
        '--repo',
        '/tmp/template',
        '--ref=release',
        '--feature',
        'keycloak-auth,telemetry',
        '--feature=search',
        '--no-install',
        '--init-git',
      ]),
    ).toEqual({
      target: 'my-app',
      repository: '/tmp/template',
      ref: 'release',
      featureIds: ['keycloak-auth', 'telemetry', 'search'],
      install: false,
      initGit: true,
    })
  })

  test('rejects unknown options and contradictory boolean flags', () => {
    expect(() => parseCliArgs(['--unknown'])).toThrow('Unknown option: --unknown')
    expect(() => parseCliArgs(['app', '--install', '--no-install'])).toThrow(
      'Cannot combine --install and --no-install',
    )
  })
})

describe('CLI generation', () => {
  test('clones a Git source, copies only tanstack-start, and applies the selected feature', async () => {
    const repository = await createTemporaryDirectory('tanstack-cli-repository-')
    const outputRoot = await createTemporaryDirectory('tanstack-cli-output-')
    const target = join(outputRoot, 'generated-app')

    await writeFixture(join(repository, 'tanstack-start/package.json'), '{"name":"base"}\n')
    await writeFixture(join(repository, 'tanstack-start/src/base.ts'), 'export const base = true\n')
    await writeFixture(join(repository, 'root-only.txt'), 'do not copy\n')
    await writeFixture(
      join(repository, 'scaffold/features/keycloak-auth/feature.json'),
      JSON.stringify({
        id: 'keycloak-auth',
        label: 'Keycloak authentication',
        description: 'OIDC login through the auth service',
        overwrites: [],
      }),
    )
    await writeFixture(
      join(repository, 'scaffold/features/keycloak-auth/overlay/src/auth.ts'),
      'export const auth = true\n',
    )

    await runGit(repository, ['init', '--initial-branch=main'])
    await runGit(repository, ['add', '.'])
    await runGit(repository, [
      '-c',
      'user.name=Scaffold Test',
      '-c',
      'user.email=scaffold@example.test',
      'commit',
      '-m',
      'fixture',
    ])

    const process = Bun.spawn(
      [
        'bun',
        join(import.meta.dir, 'cli.ts'),
        target,
        '--repo',
        repository,
        '--ref',
        'main',
        '--feature',
        'keycloak-auth',
        '--no-install',
        '--no-init-git',
      ],
      { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
    )
    const [exitCode, stdout, stderr] = await Promise.all([
      process.exited,
      new Response(process.stdout).text(),
      new Response(process.stderr).text(),
    ])

    expect(stderr).toBe('')
    expect(exitCode).toBe(0)
    expect(stdout).toContain(`Created ${target}`)
    expect(await readFile(join(target, 'src/base.ts'), 'utf8')).toBe('export const base = true\n')
    expect(await readFile(join(target, 'src/auth.ts'), 'utf8')).toBe('export const auth = true\n')
    await expect(lstat(join(target, 'root-only.txt'))).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(lstat(join(target, '.git'))).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
