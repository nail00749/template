# Repository skills

These skills are installed only in this repository and support the frontend in
`tanstack-start/`. Upstream files are kept unchanged, including their references.

- **shadcn**: [shadcn-ui/ui](https://github.com/shadcn-ui/ui/tree/5c7072da672b0048bc6771e3204063a2537df91a/skills/shadcn).
- **feature-sliced-design**: [feature-sliced/skills](https://github.com/feature-sliced/skills/tree/e7eac044ee7405b0e82abe8e54cab7a1e9e8bc0c/feature-sliced-design).

`sources.json` records the upstream commit and SHA-256 of each installed file.
Review upstream changes before updating; refresh this manifest after an update.
No runtime packages or global agent configuration are installed by these skills.

Apply skills only to relevant tasks. Follow `tanstack-start/AGENTS.md` and its
`.docs/` contracts when an upstream example differs from the current project.
The frontend uses Bun, Base UI, TanStack Form and its existing Sonner integration.
Run UI CLI commands inside `tanstack-start/`, where `components.json` lives.

Codex discovers repository `.agents/skills` from the working directory and its
ancestors. This root location covers tasks launched from the repository root
and from `tanstack-start/`.
