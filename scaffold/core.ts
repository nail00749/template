import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'

const TEMPLATE_PATH = 'tanstack-start'
const FEATURES_PATH = 'scaffold/features'
const FEATURE_MANIFEST = 'feature.json'
const FEATURE_OVERLAY = 'overlay'

export interface FeatureDefinition {
  id: string
  label: string
  description: string
  overwrites: Array<string>
  directory: string
}

export interface TemplateSource {
  repository: string
  ref: string
}

export interface CheckoutRepositoryOptions extends TemplateSource {
  destination: string
}

export interface ScaffoldProjectOptions {
  checkoutDirectory: string
  targetDirectory: string
  featureIds: Array<string>
  source: TemplateSource
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await lstat(path)
    return true
  } catch (error) {
    if (isRecord(error) && error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

function normalizeRelativePath(path: string): string {
  return path.split(sep).join('/')
}

function validateRelativePath(path: string, label: string): string {
  const normalized = normalizeRelativePath(path)
  if (
    normalized.length === 0 ||
    normalized.startsWith('/') ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    throw new Error(`${label} must be a safe relative path: ${path}`)
  }
  return normalized
}

function parseFeatureManifest(value: unknown, directory: string): FeatureDefinition {
  if (!isRecord(value)) {
    throw new Error(`Invalid feature manifest in ${directory}`)
  }

  const { id, label, description, overwrites } = value
  if (
    typeof id !== 'string' ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ||
    typeof label !== 'string' ||
    label.length === 0 ||
    typeof description !== 'string' ||
    description.length === 0 ||
    !Array.isArray(overwrites) ||
    !overwrites.every((path) => typeof path === 'string')
  ) {
    throw new Error(`Invalid feature manifest in ${directory}`)
  }

  if (id !== basename(directory)) {
    throw new Error(`Feature id ${id} must match its directory name ${basename(directory)}`)
  }

  return {
    id,
    label,
    description,
    overwrites: overwrites.map((path) => validateRelativePath(path, `Overwrite in ${id}`)),
    directory,
  }
}

export async function discoverFeatures(
  checkoutDirectory: string,
): Promise<Array<FeatureDefinition>> {
  const featuresDirectory = join(checkoutDirectory, FEATURES_PATH)
  if (!(await pathExists(featuresDirectory))) {
    return []
  }

  const entries = await readdir(featuresDirectory, { withFileTypes: true })
  const features = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const directory = join(featuresDirectory, entry.name)
        const manifestPath = join(directory, FEATURE_MANIFEST)
        const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as unknown
        return parseFeatureManifest(manifest, directory)
      }),
  )

  return features.sort((left, right) => left.id.localeCompare(right.id))
}

async function listOverlayFiles(directory: string, label: string): Promise<Array<string>> {
  if (!(await pathExists(directory))) {
    return []
  }

  const directoryStats = await lstat(directory)
  if (directoryStats.isSymbolicLink()) {
    throw new Error(`${label} cannot contain symbolic links: ${directory}`)
  }
  if (!directoryStats.isDirectory()) {
    throw new Error(`${label} overlay must be a directory: ${directory}`)
  }

  const files: Array<string> = []
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isSymbolicLink()) {
      throw new Error(`${label} cannot contain symbolic links: ${path}`)
    }
    if (entry.isDirectory()) {
      files.push(...(await listOverlayFiles(path, label)))
      continue
    }
    if (entry.isFile()) {
      files.push(path)
    }
  }
  return files
}

async function assertNoSymlinks(directory: string, label: string): Promise<void> {
  const directoryStats = await lstat(directory)
  if (directoryStats.isSymbolicLink()) {
    throw new Error(`${label} cannot contain symbolic links: ${directory}`)
  }
  if (!directoryStats.isDirectory()) {
    throw new Error(`${label} must be a directory: ${directory}`)
  }

  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isSymbolicLink()) {
      throw new Error(`${label} cannot contain symbolic links: ${path}`)
    }
    if (entry.isDirectory()) {
      await assertNoSymlinks(path, label)
    }
  }
}

async function applyFeature(
  feature: FeatureDefinition,
  targetDirectory: string,
  overlayOwners: Map<string, string>,
): Promise<void> {
  const overlayDirectory = join(feature.directory, FEATURE_OVERLAY)
  const overwriteSet = new Set(feature.overwrites)
  const files = await listOverlayFiles(overlayDirectory, `Feature ${feature.id}`)

  for (const sourcePath of files) {
    const relativePath = validateRelativePath(
      normalizeRelativePath(relative(overlayDirectory, sourcePath)),
      `Overlay path in ${feature.id}`,
    )
    const targetPath = resolve(targetDirectory, relativePath)
    if (!targetPath.startsWith(`${resolve(targetDirectory)}${sep}`)) {
      throw new Error(`Feature ${feature.id} contains an unsafe path: ${relativePath}`)
    }

    const previousOwner = overlayOwners.get(relativePath)
    if (previousOwner) {
      throw new Error(`Feature ${feature.id} conflicts with ${previousOwner} at ${relativePath}`)
    }

    if ((await pathExists(targetPath)) && !overwriteSet.has(relativePath)) {
      throw new Error(`Feature ${feature.id} cannot overwrite ${relativePath}`)
    }

    await mkdir(dirname(targetPath), { recursive: true })
    await cp(sourcePath, targetPath, { force: true })
    overlayOwners.set(relativePath, feature.id)
  }
}

export async function scaffoldProject(options: ScaffoldProjectOptions): Promise<void> {
  const checkoutDirectory = resolve(options.checkoutDirectory)
  const targetDirectory = resolve(options.targetDirectory)
  const templateDirectory = join(checkoutDirectory, TEMPLATE_PATH)

  if (await pathExists(targetDirectory)) {
    throw new Error(`Target directory already exists: ${targetDirectory}`)
  }
  if (!(await pathExists(templateDirectory))) {
    throw new Error(`Template directory is missing: ${templateDirectory}`)
  }
  await assertNoSymlinks(templateDirectory, 'Template')

  const features = await discoverFeatures(checkoutDirectory)
  const featuresById = new Map(features.map((feature) => [feature.id, feature]))
  const selectedFeatures = options.featureIds.map((id) => {
    const feature = featuresById.get(id)
    if (!feature) {
      throw new Error(`Unknown feature: ${id}`)
    }
    return feature
  })

  const targetParent = dirname(targetDirectory)
  await mkdir(targetParent, { recursive: true })
  try {
    await mkdir(targetDirectory)
  } catch (error) {
    if (isRecord(error) && error.code === 'EEXIST') {
      throw new Error(`Target directory already exists: ${targetDirectory}`)
    }
    throw error
  }

  let completed = false

  try {
    await cp(templateDirectory, targetDirectory, { recursive: true, errorOnExist: true })
    const overlayOwners = new Map<string, string>()
    for (const feature of selectedFeatures) {
      await applyFeature(feature, targetDirectory, overlayOwners)
    }

    await writeFile(
      join(targetDirectory, '.template.json'),
      `${JSON.stringify(
        {
          source: {
            repository: options.source.repository,
            ref: options.source.ref,
            templatePath: TEMPLATE_PATH,
          },
          features: selectedFeatures.map((feature) => feature.id),
        },
        null,
        2,
      )}\n`,
    )
    completed = true
  } finally {
    if (!completed) {
      await rm(targetDirectory, { recursive: true, force: true })
    }
  }
}

export async function checkoutRepository(options: CheckoutRepositoryOptions): Promise<void> {
  if (options.repository.length === 0 || options.repository.startsWith('-')) {
    throw new Error('Repository must be a Git URL or local path')
  }
  if (options.ref.length === 0 || options.ref.startsWith('-')) {
    throw new Error('Git ref must not be empty or start with a dash')
  }

  const process = Bun.spawn(
    [
      'git',
      'clone',
      '--depth',
      '1',
      '--branch',
      options.ref,
      '--filter=blob:none',
      '--no-tags',
      options.repository,
      options.destination,
    ],
    { stdout: 'inherit', stderr: 'pipe' },
  )
  const [exitCode, error] = await Promise.all([process.exited, new Response(process.stderr).text()])
  if (exitCode !== 0) {
    throw new Error(`Git clone failed: ${error.trim()}`)
  }
}

export async function createCheckoutDirectory(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'tanstack-template-'))
}
