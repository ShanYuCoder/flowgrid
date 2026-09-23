---
name: background-logic
description: /background-logic — Manage, enrich, and update background processing logic, async jobs, cron triggers, and message dispatchers for business flows (FLOW-*).
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /background-logic — Background Processing Logic

**Purpose:** Specialize in managing, auditing, enriching, and updating background processing tasks (Async Jobs, Workers, Event Triggers, Scheduled Cronjobs, Message Dispatchers) for `FLOW-*` processes or screen clusters `W-*`.

**Principle:** Maintain strict separation between the stable UI presentation layer and automated background logic — adjust background operations without disrupting UI screen specifications.

---

## Rule: When to Use /background-logic

- **[MANDATORY]** Use this skill when:
  1. A `FLOW-*` business process has established UI steps but requires background automation (e.g. dispatching Zalo/SMS notifications upon booking creation, auto-cancelling orders after 15 minutes of non-payment).
  2. Existing background logic needs updating (changing dispatch channels, modifying filtering conditions, adjusting retry policies, updating storage buckets).
  3. Auditing background tasks for comprehensive error scenarios, retry strategies, and idempotency guarantees.
- **[STRICTLY FORBIDDEN]** Do NOT use this skill to edit UI screen specifications (use `/update-spec`) or author new APIs (use `/api-spec`).

---

## Rule: Missing Information Handling

- **[MANDATORY]** Prior to authoring background logic, clarify the following 5 dimensions via `AskQuestion` wizard (one question at a time, ≥3 options):
  1. **Trigger:** When does activation occur? (Immediately post-save / cron schedule / event message).
  2. **Matching:** What are the exact evaluation criteria?
  3. **Action:** What operation does the worker execute? (Dispatch notifications, synchronize ERP, generate PDF assets, etc.).
  4. **Idempotency & Retry:** How is duplicate processing prevented? What is the retry count and backoff schedule?
  5. **Feedback:** How is the outcome reflected on user screens? (Status badge / retry action trigger).
- **[STRICTLY FORBIDDEN]** Do NOT invent triggers, matching rules, or retry policies — always confirm with user.

---

## Rule: 4 Mandatory Sections in `FLOW-*.md`

### Section 1 — System Story (`## 2. Multi-tier User Stories`)
- **[MANDATORY]** Add `### System Story: Automated Background Processing & Deduplication`:
  ```markdown
  ### System Story: Automated Background Processing & Deduplication
  > **As an** Automated System (Background Job Worker),
  > **I want to** capture [Event Name] and validate data against [Rule Name],
  > **So that** [Action] is executed towards [Destination Channel] with guaranteed idempotency.
  ```

### Section 2 — Business Rules (`## 3. Business Rules`)
- **[MANDATORY]** Specify 3 core rules:
  - **Idempotency:** Unique identifier processed exactly once.
  - **Retry Policy:** Retry attempts (e.g. 3 attempts), backoff curve (30s → 2m → 5m), terminal exit on 4xx client errors.
  - **State Transitions:** `PENDING_TRIGGER` → `PROCESSING` → `SENT` / `FAILED` / `SKIPPED`.

### Section 3 — Processing Journey (`## 4. Detailed Journey Stages`)
- **[MANDATORY]** Detail lifecycle: Worker wakes up → Reads payload → Evaluates conditions → Dispatches external call → Logs result + updates state.
- **[MANDATORY]** Failure scenarios: On connection drop or invalid data → Record error log + surface UI alert badge with manual fallback action.

### Section 4 — Mermaid Diagram (`## 6. Sequence Diagram`)
- **[MANDATORY]** Enclose worker logic within a highlighted `rect rgb(...)` block:
  ```mermaid
  rect rgb(245, 255, 245)
    Note over Core, Customer: Background Processing Phase
    Core->>Job: Trigger event (ID: BKG-XXXX)
    Job->>Storage: Read entity & evaluate conditions
    alt Conditions satisfied
      Job->>Gateway: Dispatch message
      Gateway-->>Customer: Confirmation received
      Job->>Storage: Write log → status = 'SENT'
      Job-->>ScreenDetail: Push status badge "Sent"
    else Dispatch failed (after retry limit)
      Job->>Storage: Write error log → status = 'FAILED'
      Job-->>ScreenDetail: Push alert badge "Failed" (Retry button enabled)
    end
  end
  ```
- **[STRICTLY FORBIDDEN]** Do NOT include low-level DDL schema definitions or HTTP endpoint paths in FLOW documents.

---

## Workflow

1. Identify target `FLOW-*.md` (or scaffold if not yet existing).
2. Assess current state: verify presence of background logic; propose additions or isolate deltas.
3. Clarify the 5 dimensions via AskQuestion wizard (one question at a time, ≥3 options).
4. Update all 4 mandatory sections in `FLOW-*.md`.

---

## Verification Checklist

- [ ] Target `FLOW-*.md` accurately located.
- [ ] System Story explicitly details background actor responsibilities.
- [ ] Idempotency, Retry Policy, and State Transitions fully specified.
- [ ] Mermaid diagram includes `rect` container with `alt / else` error branches.
- [ ] No technical DDL or HTTP paths present in FLOW document.
- [ ] AskQuestion wizard used for all ambiguous background requirements.
