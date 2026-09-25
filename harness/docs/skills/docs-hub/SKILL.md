---
name: docs-hub
extractBundle: docs-hub
description: /docs-hub — FlowGrid docs lane MCP index (arc42 × C4 hub).
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Prefer targeted `flowgrid_docs_*` tool results over dumping `architecture/**`.

# /docs-hub

FlowGrid **docs lane**: index, validate, and route architecture/product Markdown from the configured docs hub (`FLOWGRID_DOCS_ROOT`). Consumer installs on FE/BE/test repos still read the member-selected docs checkout — never the code repo tree as SSOT.

## Protocol

```text
flowgrid_docs_layout / flowgrid_docs_route / flowgrid_docs_list_ids
  → flowgrid_docs_get_element
  → flowgrid_docs_deps_of / flowgrid_docs_dependents_of
  → flowgrid_docs_orphans / flowgrid_docs_validate_links
```

## Root and setup

Document Hub:

```bash
cd /path/to/docs-hub
flowgrid init   # project type: Document
```

Code / test consumer (pointer to docs hub):

```bash
cd /path/to/code-or-tests-repo
flowgrid init   # set docs root when prompted
```

`FLOWGRID_DOCS_ROOT` must point at a tree with `architecture/`. Tools also accept `docsRoot` per call.

## Index routing

- **[MANDATORY]** Route by intent — do NOT merge repositories into one workspace graph:
  - Architecture ID / C4 path → docs lane (`FLOWGRID_DOCS_ROOT`). **[STRICTLY FORBIDDEN]** CodeGraph for architecture Markdown.
  - IR / registry for codegen → same `FLOWGRID_DOCS_ROOT` on consumer repos.
  - Test plans / FLOW → `FLOWGRID_TESTS_ROOT` when authoring on a test repo.
  - Symbol / call-graph for repo X → CodeGraph MCP of repo X. **[STRICTLY FORBIDDEN]** hand-edit MCP config for platform wiring.
  - ArtifactGraph stays local-only.

## Harness scope

Docs install syncs `/architecture`, `/spec`, `/adopt`, legacy variants, and the `architecture-core` extract bundle. Consumer install syncs `/docs-hub`, its rule/schema, and phase hooks.

## Accelerators (optional)

ArtifactGraph is optional hints only; docs lane never requires it. If unavailable, glob/read scoped Markdown under `architecture/` and `surfaces/`.

At run start, assign one stable `runId`. After optional fallback reads, emit one `flowgrid.missing-optional` event per schema `.cursor/schemas/flowgrid-docs/missing-optional-event.schema.json`.

## Verification Checklist
- [ ] Index routing respected (`FLOWGRID_DOCS_ROOT` vs CodeGraph vs ArtifactGraph).
- [ ] Hub contains `architecture/`.
- [ ] Optional accelerator events emitted when ArtifactGraph was skipped.
