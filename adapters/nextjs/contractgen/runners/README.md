# Contract codegen (`contract-gen`)

Zod contract SSOT in `packages/models` — shared by Next FE and Nest.

## Input

IR `…/ir/design.yaml` with `entities[].fields[]` (`kind`, `scopes`, `contract`,
`persistence`). Discovery order when `--spec` is omitted:

1. `--yaml-root <path>`
2. `FLOWGRID_DOCS_ROOT` (and `…/product`, `…/docs/features/yaml`)
3. `$FLOWGRID_PROJECT_ROOT/docs/features/yaml`

When `entities` is empty, infers scalar/relation fields from `ui.columns`
(pilot fallback).

## Commands

```bash
flowgrid contract-registry
flowgrid contract-gen:dry -- --spec path/to/ir/design.yaml
flowgrid contract-gen -- --spec path/to/ir/design.yaml
flowgrid contract-gen -- --spec … --force
```

## Registry ownership

| Layer | Path |
|-------|------|
| Toolkit default (SSOT schema) | `adapters/nextjs/registries/contract-field.registry.json` |
| Product policy (synced on init for `--adapter=nextjs`) | `registries/contract-field.registry.json` |

Validator resolves **product first**, then adapter default.

## Output

| Path | Purpose |
|------|---------|
| `packages/models/src/{entity}/*.read.schema.ts` | Response / list contract |
| `packages/models/src/{entity}/*.write.schema.ts` | Create/update command payload |
| `packages/models/src/{entity}/*.relationships.meta.ts` | ORM-agnostic relation meta |
| `{function}/generated/contract.manifest.json` | Plan + written paths |

`flowgrid gen` does **not** emit models — run `flowgrid contract-gen` first.

Stale product-root `contractgen/` trees are reported by `flowgrid status` and
removed by `flowgrid prune --yes` when present.
