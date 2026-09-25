---
name: unit
description: /unit — unit test generation from codegen manifests via bộ code.
disable-model-invocation: true
---

# /unit

**Owner:** bộ code (`--type=fe`)

```bash
npm run codegen:unit:dry -- --id W-AD-AUTH-001
npm run codegen:unit -- --id W-AD-AUTH-001

# Fallback direct CLI if wrappers missing:
flowgrid unit-gen:dry --adapter=nuxt4 --docs-root=/path/to/docs-hub -- --id W-AD-AUTH-001
flowgrid unit-gen --adapter=nuxt4 --docs-root=/path/to/docs-hub -- --id W-AD-AUTH-001
flowgrid unit-registry --adapter=nuxt4
```

You MUST run the codegen script (`npm run codegen:unit` or `flowgrid unit-gen`) FIRST to generate the skeleton and basic implementation from IR, before attempting to fill in any gaps, implement logic, or add missing tests manually.

Requires a prior codegen manifest under the docs hub `generated/` folder (when applicable).
`--docs-root` / `FLOWGRID_DOCS_ROOT` is the canonical registry/IR pointer;
local ArtifactGraph never replaces it.

## Docs Root Resolution

1. If `FLOWGRID_DOCS_ROOT` is set (non-empty), use it as the canonical
   registry/IR pointer for locating codegen manifests.
2. If `FLOWGRID_DOCS_ROOT` is **not** set, fall back to Platform DNA
   configuration (`platform-dna`) to resolve the docs hub path.
   Platform DNA discovery is slower and more error-prone, so always prefer
   an explicit `FLOWGRID_DOCS_ROOT` when available.

## Route

Architecture/C4 → bộ docs (`FLOWGRID_DOCS_ROOT`); IR/registry/gen →
`FLOWGRID_DOCS_ROOT`; symbols/call-graph for repo X → Platform DNA-wired
`codegraph-<repo-key>`. Never workspace-parent graphs or member-edited MCP.
Local ArtifactGraph is allowlist/tag hints for this repo only.

`dotnet-line` is not supported by these separate unit commands: its primary
`gen` pass already bundles generated test source.

## Accelerators (optional)

```text
if local ArtifactGraph available: recommend/check the FE repo's unit-gen allowlist
else: run flowgrid unit-gen directly
```

Missing ArtifactGraph never blocks unit generation. Complete the direct,
deterministic bộ code fallback first, then follow
`.cursor/rules/flowgrid-code-optional-integrations.mdc` for once-per-run telemetry.
