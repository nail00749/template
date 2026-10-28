# Locally hardened deepmerge

This private CommonJS fork copies the published `dist/cjs.js` build (as
`index.js`, with `is-mergeable-object` already inlined), `index.d.ts`, and the
MIT license from [TehShrike/deepmerge 4.3.1](https://github.com/TehShrike/deepmerge/tree/v4.3.1).
It is identified as `@template/deepmerge@4.3.1-hardened.0`, not an upstream release.
The application overrides the transitive `deepmerge` dependency with this directory.

Local mitigation for [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4):

- `mergeObject` never writes an own `__proto__` key to the returned object,
  whether it comes from the target or the source argument. Upstream already
  skipped a source-only `__proto__`, but copied the target's own `__proto__`
  (for example from `JSON.parse`) onto the result, replacing its prototype.
- The rule applies to nested merges, cloning, `deepmerge.all` and `customMerge`,
  because they all go through `mergeObject`.

Other keys, array merging, options and the upstream `propertyIsUnsafe` check are
unchanged. An own `__proto__` data key is dropped from merge results by design.
Audit results for this private package are not proof of upstream remediation.
Replace this fork with an upstream patched release once available, reviewing the
security regression tests in `scripts/deepmerge-security.test.ts` first.
