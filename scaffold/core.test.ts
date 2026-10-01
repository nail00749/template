import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkoutRepository, discoverFeatures, scaffoldProject } from './core'

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

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  )
})

describe('feature catalog', () => {
  test('discovers manifests in a stable order', async () => {
    const checkout = await createTemporaryDirectory('tanstack-catalog-')
    await writeFixture(
      join(checkout, 'scaffold/features/keycloak-auth/feature.json'),
      JSON.stringify({
        id: 'keycloak-auth',
        label: 'Keycloak authentication',
        description: 'OIDC login through the auth service',
        overwrites: [],
      }),
    )
    await writeFixture(
      join(checkout, 'scaffold/features/telemetry/feature.json'),
      JSON.stringify({
        id: 'telemetry',
        label: 'Telemetry',
        description: 'Tracing and metrics',
        overwrites: [],
      }),
    )

    const features = await discoverFeatures(checkout)

    expect(features.map((feature) => feature.id)).toEqual(['keycloak-auth', 'telemetry'])
  })
})

describe('project scaffolding', () => {
  test('copies the TanStack template and applies only selected feature overlays', async () => {
    const checkout = await createTemporaryDirectory('tanstack-checkout-')
    const outputRoot = await createTemporaryDirectory('tanstack-output-')
    const target = join(outputRoot, 'new-app')

    await writeFixture(join(checkout, 'tanstack-start/package.json'), '{"name":"base"}\n')
    await writeFixture(join(checkout, 'tanstack-start/src/base.ts'), 'export const base = true\n')
    await writeFixture(
      join(checkout, 'scaffold/features/keycloak-auth/feature.json'),
      JSON.stringify({
        id: 'keycloak-auth',
        label: 'Keycloak authentication',
        description: 'OIDC login through the auth service',
        overwrites: ['package.json'],
      }),
    )
    await writeFixture(
      join(checkout, 'scaffold/features/keycloak-auth/overlay/package.json'),
      '{"name":"with-keycloak"}\n',
    )
    await writeFixture(
      join(checkout, 'scaffold/features/keycloak-auth/overlay/src/auth.ts'),
      'export const auth = true\n',
    )

    await scaffoldProject({
      checkoutDirectory: checkout,
      targetDirectory: target,
      featureIds: ['keycloak-auth'],
      source: { repository: 'https://example.test/template.git', ref: 'main' },
    })

    expect(await readFile(join(target, 'package.json'), 'utf8')).toBe('{"name":"with-keycloak"}\n')
    expect(await readFile(join(target, 'src/base.ts'), 'utf8')).toBe('export const base = true\n')
    expect(await readFile(join(target, 'src/auth.ts'), 'utf8')).toBe('export const auth = true\n')
    expect(JSON.parse(await readFile(join(target, '.template.json'), 'utf8'))).toEqual({
      source: {
        repository: 'https://example.test/template.git',
        ref: 'main',
        templatePath: 'tanstack-start',
      },
      features: ['keycloak-auth'],
    })
  })

  test('refuses undeclared overwrites from a feature', async () => {
    const checkout = await createTemporaryDirectory('tanstack-conflict-')
    const outputRoot = await createTemporaryDirectory('tanstack-output-')

    await writeFixture(join(checkout, 'tanstack-start/src/config.ts'), 'base\n')
    await writeFixture(
      join(checkout, 'scaffold/features/keycloak-auth/feature.json'),
      JSON.stringify({
        id: 'keycloak-auth',
        label: 'Keycloak authentication',
        description: 'OIDC login through the auth service',
        overwrites: [],
      }),
    )
    await writeFixture(
      join(checkout, 'scaffold/features/keycloak-auth/overlay/src/config.ts'),
      'feature\n',
    )

    await expect(
      scaffoldProject({
        checkoutDirectory: checkout,
        targetDirectory: join(outputRoot, 'new-app'),
        featureIds: ['keycloak-auth'],
        source: { repository: 'local', ref: 'main' },
      }),
    ).rejects.toThrow('Feature keycloak-auth cannot overwrite src/config.ts')
  })

  test('rejects symbolic links in the template and at the overlay root', async () => {
    const checkout = await createTemporaryDirectory('tanstack-symlink-checkout-')
    const outputRoot = await createTemporaryDirectory('tanstack-symlink-output-')
    const external = await createTemporaryDirectory('tanstack-symlink-external-')

    await writeFixture(join(checkout, 'tanstack-start/package.json'), '{}\n')
    await writeFixture(join(external, 'secret.txt'), 'outside\n')
    await symlink(join(external, 'secret.txt'), join(checkout, 'tanstack-start/leak.txt'))

    await expect(
      scaffoldProject({
        checkoutDirectory: checkout,
        targetDirectory: join(outputRoot, 'template-link'),
        featureIds: [],
        source: { repository: 'local', ref: 'main' },
      }),
    ).rejects.toThrow('Template cannot contain symbolic links')

    await rm(join(checkout, 'tanstack-start/leak.txt'))
    await writeFixture(
      join(checkout, 'scaffold/features/keycloak-auth/feature.json'),
      JSON.stringify({
        id: 'keycloak-auth',
        label: 'Keycloak authentication',
        description: 'OIDC login through the auth service',
        overwrites: [],
      }),
    )
    await symlink(external, join(checkout, 'scaffold/features/keycloak-auth/overlay'))

    await expect(
      scaffoldProject({
        checkoutDirectory: checkout,
        targetDirectory: join(outputRoot, 'overlay-link'),
        featureIds: ['keycloak-auth'],
        source: { repository: 'local', ref: 'main' },
      }),
    ).rejects.toThrow('Feature keycloak-auth cannot contain symbolic links')
  })

  test('rejects collisions between selected feature overlays', async () => {
    const checkout = await createTemporaryDirectory('tanstack-feature-conflict-')
    const outputRoot = await createTemporaryDirectory('tanstack-feature-output-')

    await writeFixture(join(checkout, 'tanstack-start/package.json'), '{}\n')
    for (const id of ['keycloak-auth', 'telemetry']) {
      await writeFixture(
        join(checkout, `scaffold/features/${id}/feature.json`),
        JSON.stringify({
          id,
          label: id,
          description: `${id} feature`,
          overwrites: ['src/config.ts'],
        }),
      )
      await writeFixture(join(checkout, `scaffold/features/${id}/overlay/src/config.ts`), `${id}\n`)
    }

    await expect(
      scaffoldProject({
        checkoutDirectory: checkout,
        targetDirectory: join(outputRoot, 'new-app'),
        featureIds: ['keycloak-auth', 'telemetry'],
        source: { repository: 'local', ref: 'main' },
      }),
    ).rejects.toThrow('Feature telemetry conflicts with keycloak-auth at src/config.ts')
  })

  test('refuses to write into an existing target directory', async () => {
    const checkout = await createTemporaryDirectory('tanstack-existing-')
    const outputRoot = await createTemporaryDirectory('tanstack-output-')
    const target = join(outputRoot, 'existing-app')

    await writeFixture(join(checkout, 'tanstack-start/package.json'), '{}\n')
    await mkdir(target)

    await expect(
      scaffoldProject({
        checkoutDirectory: checkout,
        targetDirectory: target,
        featureIds: [],
        source: { repository: 'local', ref: 'main' },
      }),
    ).rejects.toThrow('Target directory already exists')
  })
})

describe('Git checkout', () => {
  test('clones the requested ref without exposing the source repository metadata', async () => {
    const repository = await createTemporaryDirectory('tanstack-source-repository-')
    const checkoutRoot = await createTemporaryDirectory('tanstack-source-checkout-')
    const checkout = join(checkoutRoot, 'repository')

    const initialize = Bun.spawn(
      [
        'git',
        '-c',
        'user.name=Scaffold Test',
        '-c',
        'user.email=scaffold@example.test',
        'init',
        '--initial-branch=main',
      ],
      { cwd: repository, stdout: 'ignore', stderr: 'pipe' },
    )
    expect(await initialize.exited).toBe(0)
    await writeFixture(join(repository, 'tanstack-start/README.md'), 'template\n')
    const add = Bun.spawn(['git', 'add', '.'], {
      cwd: repository,
      stdout: 'ignore',
      stderr: 'pipe',
    })
    expect(await add.exited).toBe(0)
    const commit = Bun.spawn(
      [
        'git',
        '-c',
        'user.name=Scaffold Test',
        '-c',
        'user.email=scaffold@example.test',
        'commit',
        '-m',
        'fixture',
      ],
      { cwd: repository, stdout: 'ignore', stderr: 'pipe' },
    )
    expect(await commit.exited).toBe(0)

    await checkoutRepository({ repository, ref: 'main', destination: checkout })

    expect(await readFile(join(checkout, 'tanstack-start/README.md'), 'utf8')).toBe('template\n')
  })
})
