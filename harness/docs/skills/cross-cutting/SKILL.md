---
name: cross-cutting
description: /cross-cutting — arc42 §08 cross-cutting concerns (Security, Logging, Caching, etc.).
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /cross-cutting — Cross-Cutting Concerns (§08)

---

## Rule: Output

- **[MANDATORY]** Path: `architecture/08-cross-cutting/` — topic section or `{topic}.md`.
- **[MANDATORY]** Template: `.cursor/extracts/tpl-cross-cutting.md`.
- **[MANDATORY]** MUST include: Intent + Owner (or TBD) + Approach stub. No AI waffle.
- **[MANDATORY]** Use `docskit_route` for §08 topics; `docskit_validate_links` after adding a new section.

## Topics (seed)

Security · Logging · Observability · Caching · Messaging · Configuration · Exception · Validation · Localization · Authorization

---

## Rule: Scope Boundaries

- **[STRICTLY FORBIDDEN]** No Full OpenAPI / UI DSL / E2E plans in cross-cutting.
- **[STRICTLY FORBIDDEN]** Do NOT duplicate business journeys here (those belong to `/journey`).

Parent: `/architecture`
