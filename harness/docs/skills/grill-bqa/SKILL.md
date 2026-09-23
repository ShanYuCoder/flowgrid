---
name: grill-bqa
extractBundle: bqa-grill
description: EXCLUSIVE /grill-bqa — ONLY for BA/BQA UI acceptance criteria. Gaps use AskQuestion in-session; do not persist openQuestions in YAML. DO NOT trigger for dev codegen tags.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read entire `ir/design.yaml` + `ir/spec.yaml`. If `ir/` is missing, read entire `*.bundle.yaml`.

# /grill-bqa — Spec Validation (BQA / UI)

**Mindset:** Spec Validation + Decision Resolution — **not** domain archaeology. Do NOT author `design.zones[].items[]` or `spec.ui.list|form` from scratch; `/spec` already populated inventory when info existed.

**Extracts:** `extractBundle: bqa-grill` → `.cursor/extracts/grill/validation.md`

---

## Rule: Load Policy

| Read (whole file) | Write | NEVER Read |
|---|---|---|
| **`ir/design.yaml`** (UI inventory, copy, visual, actions) | After Confirm: patch `*.bundle.yaml` → `pnpm spec:split` | Generated `*.md` |
| **`ir/spec.yaml`** (requirements/acceptance prose — only when auditing) | | `bundle.gen` |

---

## Rule: Missing Information / Gap Handling & Workload Threshold (Law 2)

- **[MANDATORY]** For `#missing_info` / open gaps: re-check ArtifactGraph → micro-scope → evaluate total gap volume:
  - **Small Scope (≤5 questions):** `AskQuestion` wizard in chat thread — **one question at a time**, **≥3 options**: (1) `(Recommended)`, (2) `Other` (free text), (3) `Log as Tech Debt (Pending)`.
  - **Large Scope (≥10 gaps):** **[MANDATORY HARD STOP IN CHAT]**. Do not spam single questions in chat. Generate an implementation plan / Plan Mode document partitioned into sequential Phases (3–5 gaps per phase) with disk offloading at boundaries.
- **[MANDATORY]** If member selects "Log as Tech Debt" → create `qa-inbox.md` entry. Close later with `/qa-resolve`.
- **[STRICTLY FORBIDDEN]** Never write `openQuestions` in YAML. Never silently overwrite settled SSOT without explicit confirmation.

---

## Rule: UI Error Handling (3 Outcomes)

- **[MANDATORY]** Every user action / API call in `design.yaml` MUST have the 6-block Action Flow and 4-tier outcomes documented:
  1. `preconditions`: UI validity, record status, RBAC permissions, disabled reason.
  2. `interactionControl`: `preventDoubleSubmit: true`, loading text, confirm dialog.
  3. `payloadTransformation`: Trimming, sanitation, type casting.
  4. `executionContract`: Idempotency key, timeout, optimistic locking.
  5. `outcomes`:
     - **`onSuccess` (200/201):** Action feedback, state transition, toast/modal, navigation, background trigger.
     - **`onBusinessErrors` (422/409):** Inline field error placement (`errors: {field: [msg]}`) and duplicate warnings.
     - **`onSecurityErrors` (401/403):** Session expiry and IDOR safety redirect.
     - **`onSystemErrors` (500/504/Offline):** Gateway timeout lock, offline data preservation banner.
- **[STRICTLY FORBIDDEN]** Do NOT skip documenting error outcomes or concurrency protection, even for "simple" forms.

---

## Rule: Business & Stakeholder Audit (Step A)

- **[MANDATORY]** Audit these 6 dimensions before proceeding:
  1. `summary` tells business story in 100% Non-tech language (Arc42 style: goals, user scenarios).
  2. `validation` depth: Reject specs that only declare `required: true` without prototype format, boundary limits, or explicit localized error copy.
  3. `stateMatrix`: Declares UI editability and button visibility across record lifecycles and user roles.
  4. `actions`: All mutations declare preconditions, double-submit protection, payload transformation, and 4-tier outcomes.
  5. `custom UI blocks`: If a section does NOT map to a standard base component / Shadcn primitive, verify it has explicit dimension boundaries, color tokens, typography metrics, and micro-interaction states. Reject vague custom UI placeholders.
  6. CSS properties (font-size, exact colors) are NOT in feature spec unless they are explicit Design System overrides.
- **[MANDATORY]** Cross-check common patterns: walk up from function → nearest `common/patterns/` → module → surface → `surfaces/common/patterns/` (per `common-scope.md`).
- **[MANDATORY]** Set `grillStatus.bqaFacts: done` after Step A completes.
- **[STRICTLY FORBIDDEN]** Do NOT run Step B wizard before `grillStatus.bqaFacts: done`.

---

## Rule: Proactive Member Wizard (Step B)

- **[MANDATORY]** AskQuestion wizard for remaining gaps — one question at a time, ≥3 options per question.
- **[PROACTIVE BRAINSTORMING INTERLOCK]**: When member inputs are brief or missing boundary rules, the Agent MUST NOT ask open-ended questions like "How should this be validated?". Instead, the Agent MUST synthesize realistic candidate validations (e.g. `(Recommended): phone_vn with 10 digits and duplicate DB check`) and provide them as selectable options.
- **[MANDATORY]** After member picks named option or writes "Other with text" → apply to `design` / `review`.
- **[MANDATORY]** Set `grillStatus.bqaOpen: done` when all answers or QA pointer files are on disk. Leftover `#missing_info` with `QA-…` id is allowed (does not block).

---

## Workflow

**Step A — fact-lock** (`grillStatus.bqaFacts`):
1. Compare `design.zones/behavior/actions` vs `legacy.ui` vs common UI.
2. Audit business focus (summary, requirements, CSS, error flows).
3. Cross-check common patterns.
4. Audit UI error handling flows (all 3 outcomes per action).
5. Patch bundle → `docskit split`.
6. Set `grillStatus.bqaFacts: done`.

**Step B — member wizard** (`grillStatus.bqaOpen`):
7. AskQuestion for remaining gaps (batches ≤5).
8. Apply member decisions to bundle.
9. Set `grillStatus.bqaOpen: done`.
10. User runs `docs_render` / `docskit render`.

---

## Out of Scope

- **[STRICTLY FORBIDDEN]** `codegen`, `gen`, `ui.filters/columns`, `portal:gen`, implement UI.

---

## Handoff

→ `/grill-dev`

---

## Verification Checklist

- [ ] Load policy complied (did not load codegen, legacy source code, or generated `*.md`).
- [ ] Step A completed with `grillStatus.bqaFacts: done` before Step B.
- [ ] Every action/API call in `design.yaml` has all 3 error outcomes (Success + CommonError + SpecificError).
- [ ] `summary` is 100% Non-tech; `spec.requirements` covers Validations, State Machine, Permissions, Edge Cases.
- [ ] All gaps used AskQuestion wizard + member confirm (or `QA-*` pointer). No `openQuestions` in YAML.
- [ ] `grillStatus.bqaOpen: done` after this pass.
- [ ] Bundle split + docs render executed with zero errors.
