---
name: module
description: EXCLUSIVE /module — Handles business modules (CMP-*). DO NOT output fake Markdown reports.
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Path SSOT: `surfaces/<surface>/CMP-*/` — NO `modules/` segment.

# /module — Business Module (CMP-*)

**Target Paths:**
- Module folder: `surfaces/[Surface]/[CMP-ID]/`
- Main doc: `surfaces/[Surface]/[CMP-ID]/[CMP-ID].md`

---

## Rule: ID Resolution

- **[MANDATORY]** When a CMP ID or module name is provided → use `docskit_route` or glob to resolve to `surfaces/[Surface]/[CMP-ID]/`. Do NOT demand the full path from the user.
- **[MANDATORY]** Sub-folder IDs (function/sub-module) MUST use pure numeric hierarchical segments (e.g. `01/01/02/`). NO textual slugs in sub-folder path segments.
- VitePress/publish menu uses **Document Code** (e.g. `SPEC-PORTAL-AUTH-00`) as menu text, not the H1 heading.

---

## Rule: Common Scope for `/module … common`

- **[MANDATORY]** When called with `common` modifier:
  - Default: `surfaces/[Surface]/[CMP-ID]/common/` (`patterns/`, `yaml/`, `processes/`).
  - If user names a cluster (e.g. `02`, draft `2-*`) → `…/[CMP-ID]/02/common/` (or deeper if sub-prefix specified).
  - **[STRICTLY FORBIDDEN]** Do NOT create `surfaces/[Surface]/common` from `/module` — that scope requires `/surfaces`.

---

## Rule: Common Scope by Breadth

- Module-wide share only → `CMP-*/common/`.
- Cluster-only share → `CMP-*/NN/common/`.
- Do NOT create a wider common scope than necessary.
- Refer to `.cursor/extracts/common-scope.md` for LCA resolution.

---

## Modifier: `/legacy`

- **[MANDATORY]** If `adoption-inventory.md` is missing at workspace root → STOP: *"Run `@docskit /adopt` first."*
- **[MANDATORY]** If file exists: look up CMP ID → get legacy file path → write `surfaces/[Surface]/[CMP-ID]/legacy-module.md`.
- **[STRICTLY FORBIDDEN]** Do NOT read `adoption-inventory.md` for Greenfield commands.

---

## Verification Checklist

- [ ] CMP ID resolved to `surfaces/[Surface]/[CMP-ID]/`.
- [ ] Main module doc `[CMP-ID].md` created or updated.
- [ ] No textual slugs in numeric sub-folder paths.
