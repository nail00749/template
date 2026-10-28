import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

interface SkillSources {
  skills: Array<{ name: string }>
}

function frontmatterField(frontmatter: string, field: string): string | undefined {
  const match = new RegExp(`^${field}:[ \\t]*(.*)$`, 'm').exec(frontmatter)
  if (!match) {
    return undefined
  }
  // Folded scalars (`description: >`) keep their text on the indented lines below.
  if (match[1].trim() === '>' || match[1].trim() === '|') {
    const rest = frontmatter
      .slice(match.index + match[0].length)
      .split('\n')
      .slice(1)
    const end = rest.findIndex((line) => !/^\s+\S/.test(line))
    return rest
      .slice(0, end === -1 ? undefined : end)
      .join(' ')
      .trim()
  }
  return match[1].trim()
}

// Upstream skills are verified by sources.json hashes; only project skills get link checks.
function upstreamSkills(skillsDir: string): Set<string> {
  const manifest = join(skillsDir, 'sources.json')
  if (!existsSync(manifest)) {
    return new Set()
  }
  const sources: SkillSources = JSON.parse(readFileSync(manifest, 'utf8'))
  return new Set(sources.skills.map((skill) => skill.name))
}

export function checkSkills(skillsDir: string): string[] {
  const errors: string[] = []
  const upstream = upstreamSkills(skillsDir)
  const projectRoot = resolve(skillsDir, '../..')

  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }
    const skillFile = join(skillsDir, entry.name, 'SKILL.md')
    const label = relative(projectRoot, skillFile)
    if (!existsSync(skillFile)) {
      errors.push(`${relative(projectRoot, join(skillsDir, entry.name))}: missing SKILL.md`)
      continue
    }

    const content = readFileSync(skillFile, 'utf8')
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(content)?.[1]
    if (frontmatter === undefined) {
      errors.push(`${label}: missing frontmatter`)
      continue
    }
    const name = frontmatterField(frontmatter, 'name')
    if (name !== entry.name) {
      errors.push(`${label}: name "${name ?? ''}" must match directory "${entry.name}"`)
    }
    if (!frontmatterField(frontmatter, 'description')) {
      errors.push(`${label}: missing description`)
    }

    if (upstream.has(entry.name)) {
      continue
    }
    for (const [, target] of content.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z]+:/i.test(target) || target.startsWith('#')) {
        continue
      }
      const path = resolve(dirname(skillFile), target.split('#')[0])
      if (!existsSync(path)) {
        errors.push(`${label}: broken link ${target}`)
      }
    }
  }
  return errors
}

if (import.meta.main) {
  const errors = checkSkills(resolve(import.meta.dir, '../.agents/skills'))
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exitCode = 1
  } else {
    console.log('Skills: frontmatter and local links passed.')
  }
}
