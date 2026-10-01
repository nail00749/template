#!/usr/bin/env bun

import {
  cancel,
  confirm,
  intro,
  isCancel,
  multiselect,
  note,
  outro,
  spinner,
  text,
} from '@clack/prompts'
import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  checkoutRepository,
  createCheckoutDirectory,
  discoverFeatures,
  scaffoldProject,
} from './core'

const DEFAULT_REPOSITORY = 'https://github.com/nail00749/template.git'
const DEFAULT_REF = 'main'

export interface CliOptions {
  target?: string
  repository: string
  ref: string
  featureIds?: Array<string>
  install?: boolean
  initGit?: boolean
  help?: boolean
}

function splitOption(argument: string): [string, string | undefined] {
  const separator = argument.indexOf('=')
  if (separator === -1) {
    return [argument, undefined]
  }
  return [argument.slice(0, separator), argument.slice(separator + 1)]
}

function requireOptionValue(
  option: string,
  inlineValue: string | undefined,
  args: Array<string>,
  index: number,
): [string, number] {
  if (inlineValue !== undefined) {
    if (inlineValue.length === 0) {
      throw new Error(`${option} requires a value`)
    }
    return [inlineValue, index]
  }

  const value = args[index + 1]
  if (!value || value.startsWith('-')) {
    throw new Error(`${option} requires a value`)
  }
  return [value, index + 1]
}

function setBooleanOption(
  current: boolean | undefined,
  next: boolean,
  positiveOption: string,
  negativeOption: string,
): boolean {
  if (current !== undefined && current !== next) {
    throw new Error(`Cannot combine ${positiveOption} and ${negativeOption}`)
  }
  return next
}

export function parseCliArgs(args: Array<string>): CliOptions {
  const options: CliOptions = {
    repository: DEFAULT_REPOSITORY,
    ref: DEFAULT_REF,
  }
  const featureIds: Array<string> = []
  let parseOptions = true

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--' && parseOptions) {
      parseOptions = false
      continue
    }

    if (!parseOptions || !argument.startsWith('-')) {
      if (options.target !== undefined) {
        throw new Error(`Unexpected positional argument: ${argument}`)
      }
      options.target = argument
      continue
    }

    const [option, inlineValue] = splitOption(argument)
    switch (option) {
      case '--repo': {
        const [value, nextIndex] = requireOptionValue(option, inlineValue, args, index)
        options.repository = value
        index = nextIndex
        break
      }
      case '--ref': {
        const [value, nextIndex] = requireOptionValue(option, inlineValue, args, index)
        options.ref = value
        index = nextIndex
        break
      }
      case '--feature': {
        const [value, nextIndex] = requireOptionValue(option, inlineValue, args, index)
        for (const id of value.split(',').map((part) => part.trim())) {
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
            throw new Error(`Invalid feature id: ${id}`)
          }
          if (!featureIds.includes(id)) {
            featureIds.push(id)
          }
        }
        index = nextIndex
        break
      }
      case '--install':
        if (inlineValue !== undefined) throw new Error(`Unknown option: ${argument}`)
        options.install = setBooleanOption(options.install, true, '--install', '--no-install')
        break
      case '--no-install':
        if (inlineValue !== undefined) throw new Error(`Unknown option: ${argument}`)
        options.install = setBooleanOption(options.install, false, '--install', '--no-install')
        break
      case '--init-git':
        if (inlineValue !== undefined) throw new Error(`Unknown option: ${argument}`)
        options.initGit = setBooleanOption(options.initGit, true, '--init-git', '--no-init-git')
        break
      case '--no-init-git':
        if (inlineValue !== undefined) throw new Error(`Unknown option: ${argument}`)
        options.initGit = setBooleanOption(options.initGit, false, '--init-git', '--no-init-git')
        break
      case '--help':
      case '-h':
        if (inlineValue !== undefined) throw new Error(`Unknown option: ${argument}`)
        options.help = true
        break
      default:
        throw new Error(`Unknown option: ${argument}`)
    }
  }

  if (featureIds.length > 0) {
    options.featureIds = featureIds
  }
  return options
}

function printHelp(): void {
  console.log(`Create a TanStack Start project from the shared template.

Usage:
  create-tanstack [target] [options]

Options:
  --repo <url-or-path>       Source Git repository
  --ref <branch-or-tag>      Source ref (default: main)
  --feature <id[,id...]>     Apply one or more feature overlays
  --install | --no-install   Run bun install or skip it
  --init-git | --no-init-git Initialize a fresh Git repository or skip it
  -h, --help                 Show this help

Interactive feature selection uses ↑/↓ to move, Space to toggle, and Enter to confirm.`)
}

class PromptCancelledError extends Error {}

function unwrapPrompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    throw new PromptCancelledError()
  }
  if (typeof value === 'symbol') {
    throw new Error('Unexpected prompt result')
  }
  return value
}

async function runCommand(
  command: string,
  args: Array<string>,
  cwd: string,
  quiet: boolean,
): Promise<void> {
  if (quiet) {
    const process = Bun.spawn([command, ...args], {
      cwd,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const [exitCode, stdout, stderr] = await Promise.all([
      process.exited,
      new Response(process.stdout).text(),
      new Response(process.stderr).text(),
    ])
    if (exitCode !== 0) {
      const details = stderr.trim() || stdout.trim()
      throw new Error(
        `${command} ${args.join(' ')} exited with code ${exitCode}${details ? `: ${details}` : ''}`,
      )
    }
    return
  }

  const process = Bun.spawn([command, ...args], {
    cwd,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  })
  const exitCode = await process.exited
  if (exitCode !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with code ${exitCode}`)
  }
}

async function runWithSpinner<T>(
  enabled: boolean,
  pendingMessage: string,
  successMessage: string,
  task: () => Promise<T>,
): Promise<T> {
  if (!enabled) {
    return task()
  }

  const progress = spinner()
  progress.start(pendingMessage)
  try {
    const result = await task()
    progress.stop(successMessage)
    return result
  } catch (error) {
    progress.error(`${pendingMessage} failed`)
    throw error
  }
}

export async function runCli(args: Array<string>): Promise<void> {
  const options = parseCliArgs(args)
  if (options.help) {
    printHelp()
    return
  }

  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY)
  if (interactive) {
    intro('create-tanstack')
  }

  try {
    if (options.target === undefined) {
      if (!interactive) {
        throw new Error('Target directory is required in non-interactive mode')
      }
      options.target = unwrapPrompt(
        await text({
          message: 'Where should the project be created?',
          placeholder: './tanstack-app',
          defaultValue: './tanstack-app',
        }),
      )
    }

    const targetDirectory = resolve(options.target)
    const checkoutRoot = await createCheckoutDirectory()
    const checkoutDirectory = resolve(checkoutRoot, 'repository')

    try {
      if (!interactive) {
        console.log(`Fetching ${options.repository}#${options.ref}...`)
      }
      await runWithSpinner(
        interactive,
        `Fetching ${options.repository}#${options.ref}`,
        'Template fetched',
        () =>
          checkoutRepository({
            repository: options.repository,
            ref: options.ref,
            destination: checkoutDirectory,
          }),
      )

      const features = await discoverFeatures(checkoutDirectory)
      if (options.featureIds === undefined && interactive && features.length > 0) {
        options.featureIds = unwrapPrompt(
          await multiselect({
            message: 'Select features',
            options: features.map((feature) => ({
              value: feature.id,
              label: feature.label,
              hint: feature.description,
            })),
            required: false,
            maxItems: 8,
          }),
        )
      }

      options.featureIds ??= []
      const knownFeatureIds = new Set(features.map((feature) => feature.id))
      for (const id of options.featureIds) {
        if (!knownFeatureIds.has(id)) {
          throw new Error(`Unknown feature: ${id}`)
        }
      }

      if (options.install === undefined) {
        options.install = interactive
          ? unwrapPrompt(
              await confirm({
                message: 'Install dependencies with Bun?',
                initialValue: true,
              }),
            )
          : false
      }
      if (options.initGit === undefined) {
        options.initGit = interactive
          ? unwrapPrompt(
              await confirm({
                message: 'Initialize a fresh Git repository?',
                initialValue: true,
              }),
            )
          : false
      }

      await runWithSpinner(interactive, 'Creating project', 'Project files created', () =>
        scaffoldProject({
          checkoutDirectory,
          targetDirectory,
          featureIds: options.featureIds!,
          source: { repository: options.repository, ref: options.ref },
        }),
      )

      if (options.install) {
        if (!interactive) {
          console.log('\nInstalling dependencies...')
        }
        await runWithSpinner(interactive, 'Installing dependencies', 'Dependencies installed', () =>
          runCommand('bun', ['install'], targetDirectory, interactive),
        )
      }
      if (options.initGit) {
        await runWithSpinner(interactive, 'Initializing Git', 'Git repository initialized', () =>
          runCommand('git', ['init', '--initial-branch=main'], targetDirectory, interactive),
        )
      }

      if (interactive) {
        note(
          [
            `Project: ${targetDirectory}`,
            ...(!options.install ? ['Install dependencies with bun install.'] : []),
            'Start development with bun run dev.',
          ].join('\n'),
          'Next steps',
        )
        outro('Project ready')
      } else {
        console.log(`\nCreated ${targetDirectory}`)
        if (!options.install) {
          console.log('Next: open the new project directory and run bun install')
        }
      }
    } finally {
      await rm(checkoutRoot, { recursive: true, force: true })
    }
  } catch (error) {
    if (error instanceof PromptCancelledError) {
      cancel('Operation cancelled')
      return
    }
    throw error
  }
}

if (import.meta.main) {
  try {
    await runCli(Bun.argv.slice(2))
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}
