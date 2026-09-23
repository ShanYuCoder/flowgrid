---
name: grill-api-spec
description: EXCLUSIVE /grill-api-spec — ONLY for auditing backend API contracts under surfaces/ (Portal FE backed). DO NOT generate Markdown reports.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read entire `ir/design.yaml`. If `ir/` is missing, read entire `*.bundle.yaml`.

# /grill-api-spec — API Contract Audit (Portal FE)

After `/api-spec`. Before Codegenkit BE `/api`. No code implementation on docs hub.

Shared extracts: `spec-evolution.md`, `api-spec-sync.md`, `entity-relationship.md`, `api-codegen-readiness.md`, `api-codegen-tags.md`, `agent-discipline.md`, `verify-gate.md`

---

## Rule: Scope

- **[MANDATORY]** Audit `…/api/<seq>/01-backend-spec.yaml`; never a `01` directly on the function slug leaf itself.
- **[STRICTLY FORBIDDEN]** No BQA 3-Pillars reports. No framework code snippets. No writing `ir/*`.

---

## Rule: Audit Steps

- **[MANDATORY]** Step 1 — Reuse check: `#reuse-api` actions/items must have NO extra trio; `reuseFrom` must point to an existing `01`.
- **[MANDATORY]** Step 2 — Cross-check requirements vs endpoints, entities, permissions, validations, errors.
- **[MANDATORY]** Step 3 — Engineering & Error hashtag audit:
  - Verify `#call-external`, `#cross-service`, `#cross-entity-service`, `#derived-data`.
  - `#tech-debt:*` MUST be `#tech-debt:QA-<feature.id>-NNNN` with a matching file in `qa/open/`.
  - Endpoint error storming: `{id}` routes → `#err:not-found` (404) + `#err:idor-violation` (403); POST/PUT → `#err:validation` (422); authed routes → `#err:permission-denied` (403).
- **[MANDATORY]** Step 4 — Enrich `01` with: `codegen.profile|entity|module`, `api.endpoints[].action`, `#gen:*` tags, `approval`.
- **[MANDATORY]** Step 5 — Run gates:
  - `docskit api:check --spec surfaces/<surface>/CMP-*/<NN…>/api/<seq>/01-backend-spec.yaml`
  - `docskit openapi:gen --spec …/01-backend-spec.yaml`
  - `docskit openapi:render`
- **[MANDATORY]** Only ask member for product decisions; resolve technical gaps from codebase/Portal evidence.

---

## Rule: Missing Information

- **[MANDATORY]** Unknown facts → `AskQuestion` wizard, one question at a time, ≥3 options: (1) Recommended, (2) Other, (3) "Log as Tech Debt".
- **[STRICTLY FORBIDDEN]** No `openQuestions` in YAML. No inventing endpoint logic.

---

## Verification Checklist

- [ ] `#reuse-api` actions have no extra trio; `reuseFrom` points to existing `01`.
- [ ] Target: `01-backend-spec.yaml` under `…/api/<seq>/` or `…/common/yaml/<slug>/`.
- [ ] Error matrix: `{id}` → 404 + 403 IDOR; POST/PUT → 422; global via OpenAPI `$ref`.
- [ ] `#gen:*` + `action` populated on new `01` files.
- [ ] Gates executed: `docskit api:check` + `openapi:gen` + `openapi:render` exit 0.
- [ ] `approval.status` updated on new `01` YAML.
