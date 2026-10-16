# Locally hardened braces

This private CommonJS fork copies `index.js`, `lib/*.js`, and the MIT license
from [micromatch/braces 3.0.3](https://github.com/micromatch/braces/tree/3.0.3).
It is identified as `@template/braces@3.0.3-hardened.0`, not an upstream release.
The application overrides the transitive `braces` dependency with this directory.

Local mitigation for [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm):

- Parsing rejects nesting above 128 brace/parenthesis blocks before allocating
  the next nested block. Mixed nesting shares the same ceiling. Literal escaped,
  quoted, and square-bracket content retains upstream parsing behavior.
- `compile`, `expand`, and `stringify` validate AST child depth iteratively before
  their recursive walkers run. Direct `lib` imports have the same protection,
  including when callers supply ASTs instead of strings.
- The ceiling is fixed and cannot be disabled with options.

Ordinary glob/range behavior and the upstream range/character limits are retained.
Patterns beyond the ceiling now deliberately throw `SyntaxError`. This protects
against stack exhaustion from nested patterns; it does not introduce a global
expansion/output budget or promise safety for arbitrary malformed AST objects.
Audit results for this private package are not proof of upstream remediation.
Replace this fork with an upstream patched release once available, reviewing the
security regression tests in `scripts/braces-security.test.ts` first.
