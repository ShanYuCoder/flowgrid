---
name: model
description: /model — Zod models and TS types in models/ / validations/ (bộ code FE).
disable-model-invocation: true
---

# /model — FE contract models

**Owner:** bộ code (`--type=fe`) · Adapters: `nuxt4` | `nextjs`  
Not synced for `dotnet-line` (WinForms contracts live outside Zod `models/`).

## Scope

Write/update **Zod schemas + TS types** under `models/` and `validations/` from
Docs hub (`FLOWGRID_DOCS_ROOT`): **Read the entire `ir/design.yaml`**. Do not cherry-pick `entities`/`api` keys from the bundle or from `ir/spec.yaml` prose.

| Load | Do not load |
|------|-------------|
| Entire feature `ir/design.yaml` | `ir/spec.yaml` prose, generated `*.md`, `*.bundle.yaml` |
| Target files under `models/`, `validations/` | Trace, full `bundle.legacy` unless gap |
| Progressive path resolve only if FE↔BE needed | Full `legacy-api-migration` dumps |

## Workflow

1. Resolve feature via `--id` / `--spec` through `FLOWGRID_DOCS_ROOT`
   (never CodeGraph or ArtifactGraph for architecture/registry).
   (same docs-root rules as `/prototype`; never sibling inference)
   - If `FLOWGRID_DOCS_ROOT` is **not** set, fall back to Platform DNA
     configuration (`platform-dna`) to resolve the docs hub path.
     Platform DNA discovery is slower and more error-prone, so always prefer
     an explicit `FLOWGRID_DOCS_ROOT` when available.
2. Align `models/` + `validations/` with entities/api in the IR
3. Do not rewrite unrelated UI or API server code here

## Handoff

→ `/wire` when forms/services need the updated schemas  
→ `/api` (bộ code BE) when the backend contract must catch up

## Accelerators (optional)

```text
if local ArtifactGraph available: local FE tag/allowlist hints only
else: scoped IR + registry evidence only
```

Canonical IR/registry evidence always comes through the bộ code docs pointer,
not through ArtifactGraph.
