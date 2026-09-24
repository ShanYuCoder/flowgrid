---
name: business-process
description: /business-process (or /flow) — Models business action flows (actor + surface + action + outcome) as FLOW-*.
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /business-process (Alias: /flow)

**Mindset:** Model the process by **business actions on surfaces**, not by repository or service topology.

---

## Rule: Audit Interlock

- **[MANDATORY]** Always run static audit first: `node engines/spec/lib/audit-flow-gaps.mjs <target-flow.md>`.
  - ✅ Consume JSON gap report to fix issues or trigger AskQuestion wizard (≥3 options).
  - ❌ Do not skip audit and proceed to authoring directly.

---

## Rule: Missing Information Handling & Workload Threshold (Law 2)

- **[MANDATORY]** When required flow sections are absent, evaluate total missing volume:
  - **Small Scope (≤5 questions):** Trigger `AskQuestion` wizard — one question at a time, **≥3 options**: (1) `(Recommended)`, (2) `Other`, (3) `Log as Tech Debt (Pending)`.
  - **Large Scope (≥10 gaps/steps):** **[MANDATORY HARD STOP IN CHAT]**. Do not spam single questions in chat. Generate an implementation plan / Plan Mode document partitioned into sequential Phases (3–5 gaps per phase) with disk offloading at boundaries.
- **[STRICTLY FORBIDDEN]** Do NOT invent actors, permissions, or background logic — always confirm with user.

---

## Rule: Target Path Resolution

- **[MANDATORY]** Resolve placement path via `.cursor/extracts/common-scope.md` §4.
  - Surface-level: `surfaces/**/common/processes/FLOW-*.md`
  - Architecture-level: `architecture/03-business-process/`
- **[STRICTLY FORBIDDEN]** Do NOT use an unstandardized path like `[Target Path]/Common/Business processes`.

---

## Rule: Placement by Co-activation Context

### When co-activated with `/common` or for surfaces:
- **[MANDATORY]** Write pure Markdown describing business logic at the **UI surface level**.
- **[MANDATORY]** Structure MUST follow the 6-section "Deep-dive Business Flow Specification":

  1. `## 1. Context & Business Authorization Matrix` — trigger, actor table, permissions per screen `[W-*]`.
  2. `## 2. Multi-tier User Story Chain` — Setup Story, Primary Story, Tracking Story, **System Story** (if background logic exists).
  3. `## 3. Business Rules (BR-*) & State Lifecycle` — BR-* table + state transition matrix.
  4. `## 4. Stage-by-Stage Journey Specification` — user actions, Data Handoff between screens (fields passed, destination targets), background processing (idempotency, retry), state feedback.
  5. `## 5. Traceability Matrix` — 1:1 table: User Story Step ↔ Screen `[W-*]` ↔ Sequence Diagram ↔ Technical Component.
  6. `## 6. Cross-Screen Business Sequence Diagram` — Mermaid `sequenceDiagram` showing screen-to-screen journey, actors, button actions, storage (DB Table, S3), and `rect` segments for background workers.

- **[STRICTLY FORBIDDEN]** Do NOT include raw HTTP verbs (`POST /api/v1/...`), SQL queries, or DB column schema in this file.

### When co-activated with `/architecture`:
- **[MANDATORY]** Focus on technical `sequenceDiagram` for entire long-running flow: backend services, DB interactions, cronjobs, external APIs, 3rd-party handshakes.
- Placement: `architecture/03-business-process/`.

---

## Rule: Background Logic

- **[RECOMMENDED]** Pure CRUD flows do NOT require background logic sections — diagram ends at data persistence.
- **[MANDATORY]** When a flow **has** background jobs / event triggers / 3rd-party sync:
  1. Add **System Story** in Section 2 describing what the system executes autonomously.
  2. Add **Retry / Timeout / Fallback** rules + failure scenarios in Sections 3 & 4.
  3. Add `rect rgb(...)` segment in Mermaid diagram showing the Worker flow.

---

## Rule: Diagram Quality

- **[MANDATORY]** Use `sequenceDiagram` when interactions between actors/surfaces/screens matter; `flowchart` when decision branching paths dominate.
- **[MANDATORY]** Every Mermaid diagram MUST explicitly model error paths using `alt / else` (e.g.: invalid data, 3rd-party gateway failure, timeout, with UI recovery path).
  - ✅ `alt Invalid data error` → `else Timeout failure` block
  - ❌ Happy-path-only diagrams without error branches.

---

## Rule: Publishing & Naming

- **[MANDATORY]** FLOW file must use **Process Code** as VitePress menu key (e.g. `FLOW-PORTAL-AUTH-CHANGE`), not the H1 heading.
- **[STRICTLY FORBIDDEN]** Do NOT write FLOW files adjacent to a single function bundle.

---

## Modifier: `/legacy`

- **[MANDATORY]** If `adoption-inventory.md` does NOT exist at workspace root → STOP: *"Run `@docskit /adopt` first."*
- **[MANDATORY]** If file exists: look up `FLOW-*` candidates and map legacy module/screens. Write with `legacy-` prefix (e.g. `legacy-FLOW-checkout.md`).
- **[MANDATORY - CROSS-FLOW LEGACY AUDIT]**: When analyzing legacy business processes (`/legacy /business-process`), Agent **MUST PROACTIVELY AUDIT END-TO-END FLOW GAPS**:
  - Compare Data Output at Step $N$ (e.g., Screen 1 / API 1) with Input expectations at Step $N+1$ (e.g., Screen 2 / API 2) to identify schema or status misalignments.
  - Flag orphan steps/APIs (not attached to any valid flow step) or processes lacking Confirmation / Rollback / Idempotency handling on failure.
  - Tag issues with `[LEGACY_FLOW_GAP]` and generate Open Questions for member resolution.
- **[STRICTLY FORBIDDEN]** Do NOT read `adoption-inventory.md` for Greenfield commands.

---

## Verification Checklist

- [ ] Audit script run; all gaps resolved or AskQuestion wizard triggered.
- [ ] All 6 sections present (surface-level flow) or technical `sequenceDiagram` (architecture-level flow).
- [ ] System Story + Retry/Fallback rules present when background logic exists.
- [ ] Mermaid diagram includes `alt / else` error paths.
- [ ] No raw HTTP verbs, SQL, or DB columns in surface-level FLOW file.
- [ ] File placed at correct path per `common-scope.md`; named with `FLOW-*` prefix.
