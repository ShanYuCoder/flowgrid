---
name: ui-proposal
extractBundle: ux-common
description: /ui-proposal — analyze and propose UI gaps after DSL mapping; does not replace /spec or /update-spec.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this `SKILL.md` via file-read. Do not rely on memory.
> **[MANDATORY]** Follow rule `flowgrid-ux-common.mdc` (flow, output template, CMN IDs).
> **[MANDATORY]** Load checklists from `.cursor/extracts/ux-common-patterns.md` (`extractBundle: ux-common`).

# /ui-proposal — UI gap analysis

**Owner:** Common harness.

## Use when

- Member or agent needs **analysis or proposals** for UI affordances (breadcrumb, filters, delete flow, disabled reasons, …) that are **not** mapped in DSL or are under-specified.
- Supplement `/spec` zone brainstorm — **do not** write bundles on behalf of `/spec` or `/update-spec`.

## Out of scope

| Need | Route |
|------|--------|
| Full bundle | `/spec` |
| Delta bundle | `/update-spec` |
| Codegen / production UI | `/prototype` or FE skills |
