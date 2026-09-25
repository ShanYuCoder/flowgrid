---
name: wire
description: /wire — replace prototype mocks with real API wiring (bộ code FE lane).
disable-model-invocation: true
---

# /wire

**Owner:** bộ code (`--type=fe`)

Use after `/prototype` when tags/handoff mark `#wire-only` or real API integration is required.
Keep generation through bộ code adapters; resolve canonical docs evidence
through `FLOWGRID_DOCS_ROOT` and do not invent sibling layout.

## Docs Root Resolution

1. If `FLOWGRID_DOCS_ROOT` is set (non-empty), use it as the canonical
   pointer for resolving IR/handoff evidence.
2. If `FLOWGRID_DOCS_ROOT` is **not** set, fall back to Platform DNA
   configuration (`platform-dna`) to resolve the docs hub path.
   Platform DNA discovery is slower and more error-prone, so always prefer
   an explicit `FLOWGRID_DOCS_ROOT` when available.

## Route

IR/handoff via `FLOWGRID_DOCS_ROOT`; architecture IDs via bộ docs
(`FLOWGRID_DOCS_ROOT`); BE/FE symbols via per-repo `codegraph-<key>`; ArtifactGraph
local tags only. Never workspace-parent graphs or member-edited MCP.

## Accelerators (optional)

```text
if local ArtifactGraph available: local FE tags/allowlist slice for wire readiness
else: model review from scoped HANDOFF + registry evidence
```

Missing ArtifactGraph never blocks wiring. Complete the scoped model fallback
first, then follow `.cursor/rules/flowgrid-code-optional-integrations.mdc` for
once-per-run telemetry with observed metrics only.
