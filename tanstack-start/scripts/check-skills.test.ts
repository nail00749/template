// @vitest-environment node
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { checkSkills } from './check-skills'

const roots: string[] = []

function fixture(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'skills-check-'))
  roots.push(root)
  for (const [name, content] of Object.entries(files)) {
    const path = join(root, name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
  return join(root, '.agents/skills')
}

function skill(name: string, body = '', description = '>\n  Does a task.') {
  return `---\nname: ${name}\ndescription: ${description}\n---\n\n# Skill\n${body}\n`
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

describe('skill checks', () => {
  it('accepts valid frontmatter and links to existing docs', () => {
    const skillsDir = fixture({
      '.docs/forms.md': '# Forms',
      '.agents/skills/form/SKILL.md': skill(
        'form',
        '[forms](../../../.docs/forms.md#rules) [site](https://example.test)',
      ),
    })
    expect(checkSkills(skillsDir)).toEqual([])
  })

  it('reports broken links, a mismatched name and a missing description', () => {
    const skillsDir = fixture({
      '.agents/skills/form/SKILL.md': skill('forms', '[gone](../../../.docs/gone.md)', ''),
    })
    expect(checkSkills(skillsDir)).toEqual([
      '.agents/skills/form/SKILL.md: name "forms" must match directory "form"',
      '.agents/skills/form/SKILL.md: missing description',
      '.agents/skills/form/SKILL.md: broken link ../../../.docs/gone.md',
    ])
  })

  it('skips link checks for upstream skills listed in sources.json', () => {
    const skillsDir = fixture({
      '.agents/skills/sources.json': JSON.stringify({ skills: [{ name: 'vendor' }] }),
      '.agents/skills/vendor/SKILL.md': skill('vendor', '[ref](./missing.md)'),
    })
    expect(checkSkills(skillsDir)).toEqual([])
  })

  it('reports a skill directory without SKILL.md', () => {
    const skillsDir = fixture({ '.agents/skills/empty/notes.md': '' })
    expect(checkSkills(skillsDir)).toEqual(['.agents/skills/empty: missing SKILL.md'])
  })
})
