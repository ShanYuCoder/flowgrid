---
name: architecture-grill
description: /architecture-grill — Specialized architecture interview/grill for higher-level design; prefer /grill for general layer discovery.
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /architecture-grill — Architecture Interview & Gap Fill

**Scope:** Higher-level design — business flows, context boundaries, and data models above the `Functions` layer.

---

## Rule: When to Use

- **[MANDATORY]** Use `/architecture-grill` when conducting interviews at the architecture level: system boundaries, service responsibilities, data ownership, cross-cutting decisions.
- **[RECOMMENDED]** For general layer discovery (determining which specific skill to use) → use `/grill` instead.

---

## Rule: Missing Information Handling

- **[MANDATORY]** For any architecture gaps → trigger `AskQuestion` wizard, presenting one question at a time with ≥3 options: (1) Recommended, (2) Alternative, (3) "Log as Tech Debt".
- **[STRICTLY FORBIDDEN]** Do NOT invent system topology, service ownership, or data models without explicit user confirmation.

**Target Paths:** Applied across architecture layers above `Functions`.
