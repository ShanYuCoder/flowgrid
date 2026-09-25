---
name: grill-integration-spec
description: EXCLUSIVE /grill-integration-spec — ONLY for auditing backend integration contracts under surfaces/integrations/. DO NOT generate Markdown reports.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /grill-integration-spec — Integration Contract Audit

After `/api-integration`. Before bộ code BE `/api`. No code on docs hub.

Shared extracts: `api-integration-spec.md`, `api-codegen-readiness.md`, `api-codegen-tags.md`, `call-external.md`, `entity-relationship.md`, `agent-discipline.md`, `verify-gate.md`

---

## Rule: Goal & Scope

- **[MANDATORY]** Contract must be sufficient to implement webhook and partner APIs.
- **[MANDATORY]** OpenAPI `securitySchemes` and mock definitions must match `01-backend-spec.yaml`.
- **[MANDATORY]** Codegen-ready: `flowgrid check` + `flowgrid openapi_gen` / `openapi:render` must pass.
- **[STRICTLY FORBIDDEN]** Do NOT use `ir/design.yaml` as BE input (integrations usually have no FE IR).
- **[STRICTLY FORBIDDEN]** No BQA reports, no framework code snippets, no writing `ir/*`.

---

## Rule: Workflow Steps

- **[MANDATORY]** Step 1: Resolve `surfaces/integrations/<provider>/<slug>/api/<seq>/01-backend-spec.yaml`. Never a `01` directly on the slug leaf.
- **[MANDATORY]** Step 2: Audit authentication, `securitySchemes`, idempotency keys, retry policies, and non-CRUD actions.
- **[MANDATORY]** Step 3: Enrich `01` with codegen tags (`#gen:*`, `#manual-service`, `#call-external`), `codegen.profile|entity|module`, and `endpoints[].action`.
- **[MANDATORY]** Step 4: Run gates:
  - `flowgrid check --spec surfaces/integrations/<provider>/<slug>/api/<seq>/01-backend-spec.yaml`
  - `flowgrid openapi_gen --spec …/01-backend-spec.yaml`
  - `flowgrid openapi_render`
- **[MANDATORY]** Step 5: Set `approval.status: reviewed` (or `approved`) in YAML.

---

## Verification Checklist

- [ ] Target: `01-backend-spec.yaml` under `…/integrations/…/api/<seq>/`.
- [ ] Auth + idempotency keys + retry policy verified and populated.
- [ ] Gates executed: `api:check` + `openapi:gen` + `openapi:render` exit 0.
- [ ] `approval.status` set to `reviewed` or `approved`.
- [ ] No `openQuestions` in YAML; no `.md` written directly.

## Handoff

- `approval.status: approved` → bộ code `--type=be` `/api` with `--spec …/01-backend-spec.yaml`
