#!/usr/bin/env bun

import { rm } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { runCli as runCreateCli } from '../cli'
import { checkoutRepository, createCheckoutDirectory } from '../core'
import { readProjectState } from './state'
import { readManifest } from './manifest'
import { applyUpdate, createProject, getStatus, planUpdate, summarizePlan } from './sync'
import { version } from '../../package.json'

const HELP = `gvozdla — create and maintain projects from Git templates.

Usage:
  gvozdla --version
  gvozdla create [target] [--template tanstack] [create options]
  gvozdla status [--project path] [--remote] [--ref branch-or-tag] [--json]
  gvozdla update [--project path] [--only ui,utils,tooling] [--ref branch-or-tag]
                 [--dry-run] [--json]

Create options:
  --repo <url-or-path>       Source Git repository (default: public TanStack template)
  --ref <branch-or-tag>      Source ref (default: main)
  --feature <id[,id...]>     Select feature overlays (repeatable)
  --install | --no-install   Install dependencies with Bun (may run lifecycle scripts)
  --init-git | --no-init-git Initialize a fresh Git repository

Status is offline unless --remote is supplied. Update fetches the saved source.
--ref overrides the source for this operation; the saved tracking ref stays unchanged.
Updates require a clean, committed Git repository rooted at the project directory.
Conflicts abort without changing project files. No template hooks run on update.
Commit .template/ with your project. Run project checks after applying an update.

Exit codes: 0 success, 1 error, 2 update conflicts.
This MVP does not implement contribute, adopt, migration or conflict continuation.
`

export interface SyncOptions {
  project: string
  remote: boolean
  json: boolean
  dryRun: boolean
  only?: string[]
  ref?: string
}

export function parseSyncArgs(command: 'status' | 'update', args: string[]): SyncOptions {
  const options: SyncOptions = { project: '.', remote: false, json: false, dryRun: false }
  for (let index = 0; index < args.length; index++) {
    const argument = args[index]!
    const separator = argument.indexOf('=')
    const key = separator < 0 ? argument : argument.slice(0, separator)
    const inline = separator < 0 ? undefined : argument.slice(separator + 1)
    if (['--project', '--only', '--ref'].includes(key)) {
      const value = inline ?? args[++index]
      if (!value || value.startsWith('-')) throw new Error(`${key} requires a value`)
      if (key === '--project') options.project = value
      if (key === '--ref') options.ref = value
      if (key === '--only') {
        if (command !== 'update') throw new Error('--only is available for update')
        const groups = value.split(',')
        if (!groups.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))) {
          throw new Error('Invalid group list')
        }
        options.only = [...new Set([...(options.only ?? []), ...groups])]
      }
    } else if (key === '--json' && inline === undefined) {
      options.json = true
    } else if (key === '--remote' && inline === undefined && command === 'status') {
      options.remote = true
    } else if (key === '--dry-run' && inline === undefined && command === 'update') {
      options.dryRun = true
    } else {
      throw new Error(`Unknown option: ${argument}`)
    }
  }
  if (command === 'status' && options.ref && !options.remote) {
    throw new Error('--ref requires --remote for status')
  }
  return options
}

// Convert local repositories before changing the command's working directory.
function normalizeRepository(repository: string): string {
  if (isAbsolute(repository)) return repository
  if (repository.startsWith('.') || (!repository.includes(':') && !repository.includes('@'))) {
    return resolve(repository)
  }
  return repository
}

export async function runGvozdla(args: string[]): Promise<number> {
  const [command, ...rest] = args
  if (command === '--version' || command === '-v') {
    console.log(version)
    return 0
  }
  if (!command || command === '--help' || command === '-h' || command === 'help') {
    console.log(HELP)
    return 0
  }
  if (!['create', 'status', 'update'].includes(command)) {
    throw new Error(`Unknown command: ${command}. Run gvozdla --help.`)
  }
  if (rest.includes('--help') || rest.includes('-h')) {
    console.log(HELP)
    return 0
  }
  if (command === 'create') {
    let template: string | undefined
    const forwarded: string[] = []
    for (let index = 0; index < rest.length; index++) {
      const value = rest[index]!
      if (value === '--template' || value.startsWith('--template=')) {
        template = value === '--template' ? rest[++index] : value.slice('--template='.length)
        if (!template || template.startsWith('-')) throw new Error('--template requires a value')
        if (template !== 'tanstack') throw new Error(`Unknown template: ${template}`)
      } else {
        forwarded.push(value)
      }
    }
    await runCreateCli(
      forwarded,
      async (options) => {
        if (template && (await readManifest(options.checkoutDirectory)).manifest.id !== template) {
          throw new Error(`Source repository does not provide template: ${template}`)
        }
        await createProject({
          ...options,
          source: { ...options.source, repository: normalizeRepository(options.source.repository) },
        })
      },
      'gvozdla',
    )
    return 0
  }

  const options = parseSyncArgs(command as 'status' | 'update', rest)
  const root = resolve(options.project)
  if (command === 'status' && !options.remote) {
    const status = await getStatus(root)
    if (options.json) console.log(JSON.stringify(status, null, 2))
    else {
      console.log(`Template: ${status.templateId}`)
      for (const group of status.groups) {
        console.log(
          `${group.id}: ${group.revision.slice(0, 12)}, ${group.modified} modified, ${group.deleted} deleted`,
        )
      }
      for (const change of status.changes) console.log(`  ${change.status} ${change.path}`)
    }
    return 0
  }

  const { project } = await readProjectState(root)
  const checkoutRoot = await createCheckoutDirectory()
  try {
    const checkoutDirectory = resolve(checkoutRoot, 'repository')
    await checkoutRepository({
      repository: project.template.repository,
      ref: options.ref ?? project.template.ref,
      destination: checkoutDirectory,
    })
    const plan = await planUpdate(root, { checkoutDirectory, only: options.only, ref: options.ref })
    const summary = summarizePlan(plan)
    if (command === 'status' || options.dryRun || plan.conflicts.length) {
      if (options.json) console.log(JSON.stringify(summary, null, 2))
      else printPlan(summary)
      return plan.conflicts.length ? 2 : 0
    }
    const result = await applyUpdate(root, plan)
    if (options.json)
      console.log(JSON.stringify({ ...summary, branch: result.branch, applied: true }, null, 2))
    else {
      printPlan(summary)
      console.log(
        result.branch
          ? `Applied on ${result.branch}. Run project checks, review and commit the diff.`
          : 'Already up to date.',
      )
    }
    return 0
  } finally {
    await rm(checkoutRoot, { recursive: true, force: true })
  }
}

function printPlan(plan: ReturnType<typeof summarizePlan>): void {
  console.log(`Template: ${plan.templateId} → ${plan.revision.slice(0, 12)}`)
  console.log(`Groups: ${plan.groups.join(', ')}`)
  for (const action of plan.actions) {
    if (action.kind !== 'keep') console.log(`  ${action.kind} ${action.path}`)
  }
  for (const conflict of plan.conflicts)
    console.log(`  conflict ${conflict.path}: ${conflict.reason}`)
  if (plan.conflicts.length)
    console.log('Nothing applied. Resolve local differences or defer these groups, then retry.')
}

if (import.meta.main) {
  try {
    process.exitCode = await runGvozdla(Bun.argv.slice(2))
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}
