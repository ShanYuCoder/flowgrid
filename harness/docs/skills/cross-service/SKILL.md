---
name: cross-service
description: /cross-service — Models inter-service and inter-system integrations (sync/async, RPC, events, messages).
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /cross-service — Inter-Service & Inter-System Integrations

**Target Path:** `<LCA>/common/cross-service.md` — LCA resolved from `.cursor/extracts/common-scope.md`.

---

## Rule: When to Use

- **[MANDATORY]** Use when a flow crosses a service, system, or boundary: sync RPC, async messaging, event-driven handoffs, retries, idempotency, integration contracts.
- **[STRICTLY FORBIDDEN]** Do NOT use for internal code execution paths inside a single service — that belongs in architecture internals.
- **[STRICTLY FORBIDDEN]** Do NOT use for business action flows on a surface → use `/business-process`.
- **[STRICTLY FORBIDDEN]** Do NOT use for runtime journey narratives focusing on user/system step order across the whole product → use `/journey`.

---

## Rule: Diagram Requirements

- **[MANDATORY]** Use Mermaid `sequenceDiagram` for sync/async RPC, events, and messages.
- **[MANDATORY]** Model: contract, direction, ownership, and handoff between services/systems.
- **[MANDATORY]** Keep emphasis strictly on integration contracts and boundary ownership.

---

## Modifier: `/legacy`

- **[MANDATORY]** Reference source mappings from `legacy-repos.local.json`.
- **[MANDATORY]** Trace communication flows between legacy services/systems/boundaries.
