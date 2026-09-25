---
name: architecture
description: /architecture — Routes to child architecture skills based on layer. DO NOT invent topology.
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Use `flowgrid_docs_route`, `flowgrid_docs_list_ids`, or glob search to resolve target path before authoring.

# /architecture — Architecture Router

---

## Rule: Layer → Child Skill Routing

- **[MANDATORY]** Route based on the layer being authored:

  | Layer | Child Skill |
  |---|---|
  | Product overview / operational areas | `/overview` |
  | Business/interaction surfaces | `/surfaces` |
  | Common UX/UI rules (Markdown) | `/common` |
  | Common technical bundles for codegen (YAML) | `/common-spec` / `/grill-common-spec` |
  | Module / CMP box | `/module` |
  | Screen / API detail | `/spec` |
  | Where it runs / Infrastructure | `/deployment` |
  | Architectural decisions | `/decision` |
  | Architecture grill / interview | `/grill` / `/architecture-grill` |

---

## Rule: Architecture vs Business Spec Boundary

- **[MANDATORY]** Architecture = PURELY technical: system topology, internal services, cronjobs, database infrastructure, long cross-cutting technical flows.
- **[STRICTLY FORBIDDEN]** `architecture/01-introduction` MUST NOT repeat Personas or detailed user use-cases. Mention user entry point lightly then jump to technical system composition.
- **[STRICTLY FORBIDDEN]** API endpoints and contracts belong to Function detail (`/spec`, `/api-spec`), NOT architecture.
- **[MANDATORY]** Treat Surfaces as business interaction surfaces (e.g. Admin Portal, Customer Web), not repositories or software projects.
- **[MANDATORY]** Product Code (`W-*` / `API-*`) stays in `surfaces/<surface>/CMP-*/<slug>/code/`.

---

## Rule: Diagrams

- **[MANDATORY]** Format: MD + Mermaid (`flowchart` or `sequenceDiagram`).
- **[MANDATORY]** Every Mermaid diagram MUST explicitly model error paths and exception handling (e.g. Redirect on 401/403 IDOR, validation fail states).
- **[MANDATORY]** Deployment diagrams → C4 `DEP-*` only when physical placement matters. Use a stub by default if placement is not confirmed.
- One concern per edit.

---

## Verification Checklist

- [ ] Used `flowgrid_docs_route` or `flowgrid_docs_get_element` to locate target element.
- [ ] Routed to correct child skill.
- [ ] Architecture boundary respected (no Personas, no UI copy, no API contracts).
