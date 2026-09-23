---
name: db-erd
description: /db-erd — Models shared business data and database ERD (entities, ownership, relationships).
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /db-erd — Business Data Model (ERD)

**Target Path:** `<LCA>/common/db-erd.md` — LCA resolved from `.cursor/extracts/common-scope.md`.
VitePress/publish menu label: **`db-erd`** (not the H1 heading).

---

## Rule: Modeling Approach

- **[MANDATORY]** Use Mermaid `erDiagram`. Start from business entities and domain data ownership — NOT from a raw repository schema dump.
- **[MANDATORY]** Place shared entities in the common scope when reused by multiple surfaces or modules.
- **[STRICTLY FORBIDDEN]** Do NOT use this skill as a per-repository ORM/schema export unless the repository boundary strictly represents the actual data boundary.

---

## Modifier: `/legacy`

- **[MANDATORY]** Reference source mappings from `legacy-repos.local.json`.
- **[MANDATORY]** Map legacy schema to the business data model and entity ownership.
