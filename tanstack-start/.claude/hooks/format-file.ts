// PostToolUse hook: formats the edited file with the project's oxfmt config.
interface HookInput {
  tool_input?: { file_path?: string }
}

const input: HookInput = await Bun.stdin.json()
const filePath = input.tool_input?.file_path

if (filePath && /\.(ts|tsx|js|jsx|json|md|css)$/.test(filePath)) {
  // Paths matched by ignorePatterns in .oxfmtrc.json are skipped by oxfmt itself.
  Bun.spawnSync(['bunx', 'oxfmt', '--no-error-on-unmatched-pattern', filePath], {
    cwd: process.env.CLAUDE_PROJECT_DIR,
    stdout: 'ignore',
    stderr: 'ignore',
  })
}
