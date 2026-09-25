---
name: decision
description: /decision — arc42 §09 ADRs (ADR-*); system decisions.
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /decision — Architectural Decision Records (§09)

---

## Rule: Output

- **[MANDATORY]** Path: `architecture/09-decisions/ADR-{NNN}-{slug}.md` + index table entry.
- **[MANDATORY]** Template: `.cursor/extracts/tpl-adr.md`.
- **[MANDATORY]** Link related entities: `CMP-*` / `CTR-*` / `FLOW-*` as needed.
- **[MANDATORY]** Use `flowgrid_docs_list_ids kind:ADR` + `flowgrid_docs_validate_links` after creating a new ADR.

---

## Rule: Scope Boundaries

- **[STRICTLY FORBIDDEN]** Do NOT place ADRs under `shared/adr` (redirect stub only if migration needed).
- **[STRICTLY FORBIDDEN]** Do NOT move `api-catalog` / `data-model` into §09.
- **[STRICTLY FORBIDDEN]** Platform process how-tos → `platform/` handbook, not §09.

Parent: `/architecture`
