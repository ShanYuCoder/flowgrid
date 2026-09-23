---
name: grill
description: /grill — General discovery/gap-fill grill before authoring any skill. Routes to the correct specialized grill.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /grill — Discovery & Gap Fill Router

**Mindset:** Discovery and resolution of ambiguity — not authoring. Route to the correct specialized grill.

---

## Rule: Routing Logic

- **[MANDATORY]** Route based on what is unclear or incomplete:

  | Context | Route to |
  |---|---|
  | UI/UX acceptance, copy, layout gaps | `/grill-bqa` |
  | Codegen tags, API contracts, `bundle.gen` | `/grill-dev` |
  | Backend API spec trio (Portal FE exists) | `/grill-api-spec` |
  | Integration contract (webhook/partner/no FE) | `/grill-integration-spec` |
  | Architecture-level design (services, C4) | `/architecture-grill` |
  | Common YAML bundle audit | `/grill-common-spec` |
  | Doc hub content quality | `/grill-docs` |

- **[STRICTLY FORBIDDEN]** Do NOT use `/grill` as a catch-all that attempts to resolve all gaps inline — always route to the specialized grill for that domain.

---

## Rule: Missing Information Protocol

- **[MANDATORY]** All discovered gaps → trigger `AskQuestion` wizard per specialized skill guidelines. Present one question at a time with **≥3 options**.
- **[MANDATORY]** After member answers → route to the appropriate specialized skill.
- **[STRICTLY FORBIDDEN]** Do NOT invent business rules, API contracts, or UI copy during general grill.

---

## Verification Checklist

- [ ] Identified correct specialized grill for the gap type.
- [ ] Gaps surfaced via AskQuestion wizard (≥3 options).
- [ ] Routed to correct specialized skill with gap context.
