// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('Orval formatting', () => {
  it('formats generated files with the hook config while normal checks exclude them', () => {
    const directory = mkdtempSync(join(tmpdir(), 'orval-format-'))
    try {
      for (const name of ['.oxfmtrc.json', '.oxfmtrc.orval.json', '.oxfmt-orval-ignore']) {
        copyFileSync(join(project, name), join(directory, name))
      }
      const target = 'src/shared/api/admin/model/Response.ts'
      mkdirSync(dirname(join(directory, target)), { recursive: true })
      const source = 'export const value={name:"ready"};\n'
      writeFileSync(join(directory, target), source)
      const run = (config: string) =>
        spawnSync(
          join(project, 'node_modules/.bin/oxfmt'),
          [
            '--write',
            `--config=${config}`,
            '--ignore-path=.oxfmt-orval-ignore',
            'src/shared/api/admin/',
          ],
          { cwd: directory, encoding: 'utf8' },
        )
      const normal = run('.oxfmtrc.json')
      expect(normal.status).toBe(2)
      expect(readFileSync(join(directory, target), 'utf8')).toBe(source)

      const generated = run('.oxfmtrc.orval.json')
      expect(generated.error).toBeUndefined()
      expect(generated.status, generated.stdout + generated.stderr).toBe(0)
      expect(generated.stdout + generated.stderr).not.toContain('Expected at least one target file')
      expect(readFileSync(join(directory, target), 'utf8')).toBe(
        "export const value = { name: 'ready' }\n",
      )
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('keeps the same formatting options for handwritten and generated code', () => {
    const normal = JSON.parse(readFileSync(join(project, '.oxfmtrc.json'), 'utf8'))
    const generated = JSON.parse(readFileSync(join(project, '.oxfmtrc.orval.json'), 'utf8'))
    expect({ ...generated, ignorePatterns: normal.ignorePatterns }).toEqual(normal)
  })
})
