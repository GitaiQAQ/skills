# ai-skills

Agent Skills monorepo. Each subdirectory is one skill and shares the same
install flow.

| Skill | Purpose | npm package |
| --- | --- | --- |
| `technical-writing-zh/` | Review and rewrite Chinese technical documents | — |
| `behavior-as-source/` | Executable, versioned behavior registry as the product source | — |
| `hone-it/` | Bounded, gated recursive improvement of a project | `@flome/hone-it` |
| `prove-it/` | Structured multidimensional verification checkpoints | `@flome/prove-it` |

## Install

Install with the Skills CLI:

```bash
npx skills add GitaiQAQ/skills -l                     # list the skills in this repo
npx skills add GitaiQAQ/skills -g -y                  # install all, user-level
npx skills add GitaiQAQ/skills --skill hone-it -g -y  # install one skill
npx skills update -g                                     # update installed skills later
```

Drop `-g` to install into the current project instead of `~/.agents/skills`.

## Development

Skills are linked into the user-level directory, so edits apply immediately:

```bash
ln -s "$PWD/hone-it" ~/.agents/skills/hone-it
```

```bash
pnpm install
pnpm test
```

`pnpm test` runs the test script of each workspace package.

## Adding a skill

1. Create `<name>/SKILL.md` with `name` and `description` frontmatter.
2. Link it into the user-level directory: `ln -s "$PWD/<name>" ~/.agents/skills/<name>`.
3. Verify discovery: `npx skills add . -l`.

Discovery searches subdirectories recursively, so the skill directory name does
not need to match any fixed layout.
