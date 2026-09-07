import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import ts from 'typescript'

const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']
const slicedLayers = new Set(['pages', 'widgets', 'features', 'entities'])

// Keep TanStack Start's conventional paths; these modules belong to app logically.
function layerOf(path: string): string {
  if (
    path.startsWith('routes/') ||
    ['router.tsx', 'client.tsx', 'routeTree.gen.ts'].includes(path)
  ) {
    return 'app'
  }
  return path.split('/')[0]
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      return sourceFiles(path)
    }
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : []
  })
}

function resolveImport(source: string, specifier: string, root: string) {
  const cleanSpecifier = specifier.split('?')[0]
  let path: string
  if (cleanSpecifier.startsWith('@/')) {
    path = resolve(root, cleanSpecifier.slice(2))
  } else if (cleanSpecifier.startsWith('.')) {
    path = resolve(dirname(source), cleanSpecifier)
  } else {
    return undefined
  }
  return [path, `${path}.ts`, `${path}.tsx`, join(path, 'index.ts'), join(path, 'index.tsx')].find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  )
}

export function checkArchitecture(root: string): string[] {
  const errors: string[] = []
  const files = sourceFiles(root)

  for (const file of files) {
    const sourcePath = relative(root, file).split(sep).join('/')
    const layer = layerOf(sourcePath)
    const slice = sourcePath.split('/')[1]
    const sourceLevel = layers.indexOf(layer)
    if (sourceLevel === -1) {
      errors.push(`${sourcePath}: source must live in an FSD layer`)
      continue
    }
    if (slicedLayers.has(layer) && !existsSync(join(root, layer, slice, 'index.ts'))) {
      errors.push(`${sourcePath}: slice needs a public index.ts`)
    }
    const ast = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)

    function check(specifier: string, node: ts.Node) {
      if (!specifier.startsWith('@/') && !specifier.startsWith('.')) {
        return
      }
      const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1
      const report = (message: string) =>
        errors.push(`${sourcePath}:${line}: ${message} (${specifier})`)
      const target = resolveImport(file, specifier, root)
      if (!target) {
        report('unresolved local import')
        return
      }
      const targetPath = relative(root, target).split(sep).join('/')
      const targetLayer = layerOf(targetPath)
      const targetSlice = targetPath.split('/')[1]
      const targetLevel = layers.indexOf(targetLayer)
      if (targetLevel === -1 || targetLevel < sourceLevel) {
        report('import must point to the same slice or a lower layer')
        return
      }
      if (targetLayer === layer && slicedLayers.has(layer)) {
        if (targetSlice !== slice) {
          report('cross-slice import on the same layer')
        } else if (!specifier.startsWith('.')) {
          report('use a relative import within a slice')
        }
      } else if (
        slicedLayers.has(targetLayer) &&
        targetPath !== `${targetLayer}/${targetSlice}/index.ts`
      ) {
        report('import the slice public API')
      }
      if (
        /^shared\/api\/(admin|auth)\/(endpoints|model)\//.test(targetPath) &&
        !sourcePath.startsWith('shared/api/')
      ) {
        report('use the focused shared/api/admin or shared/api/auth entry point')
      }
    }

    function visit(node: ts.Node) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        check(node.moduleSpecifier.text, node)
      } else if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        check(node.arguments[0].text, node)
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        check(node.argument.literal.text, node)
      }
      ts.forEachChild(node, visit)
    }
    visit(ast)
  }
  return errors
}

if (import.meta.main) {
  const errors = checkArchitecture(resolve(import.meta.dir, '../src'))
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exitCode = 1
  } else {
    console.log('FSD architecture: layer direction, slice isolation and public APIs passed.')
  }
}
