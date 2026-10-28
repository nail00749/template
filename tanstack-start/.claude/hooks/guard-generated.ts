// PreToolUse hook: blocks hand edits of generated files and points to the generator.
import { relative } from 'node:path'

interface HookInput {
  cwd?: string
  tool_input?: { file_path?: string }
}

const generated: Array<{ pattern: RegExp; hint: string }> = [
  {
    pattern: /^src\/routeTree\.gen\.ts$/,
    hint: 'Change files under src/routes/; `bun run dev` or `bun run build` regenerates the tree.',
  },
  {
    pattern: /^src\/shared\/api\/(admin|auth)\/(endpoints|model)\//,
    hint: 'Regenerate with `OPENAPI_URL=... bun run generate-api`; put wrappers in an entity slice.',
  },
  {
    pattern: /^\.intlayer\//,
    hint: 'Edit the co-located *.content.ts dictionary; `bun run i18n:build` regenerates output.',
  },
]

const input: HookInput = await Bun.stdin.json()
const filePath = input.tool_input?.file_path

if (filePath) {
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd()
  const path = relative(projectDir, filePath)
  const match = generated.find(({ pattern }) => pattern.test(path))

  if (match) {
    console.error(`${path} is generated and must not be edited by hand. ${match.hint}`)
    process.exit(2)
  }
}
