# @flome/agent-skills

Agent Skills monorepo. Holds two independently versionable skills:

- `prove-it/` — multidimensional verification checkpoints. Package `@flome/prove-it`.
- `hone-it/` — bounded, gated recursive improvement of a project. Package `@flome/hone-it`.

Each subdirectory is a standalone npm package and can be installed into an
agent's Skills directory independently.

## Development

```bash
pnpm install
pnpm test
```

Test runs each workspace's own test script.