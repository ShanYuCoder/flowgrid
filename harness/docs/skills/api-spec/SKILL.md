---
name: api-spec
description: EXCLUSIVE /api-spec — ONLY for authoring backend API contract YAML trio per function slug under surfaces/. DO NOT merge multiple modules into single markdown files.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read template `.flowgrid/templates/backend-api.bundle.yaml` BEFORE generating any YAML.
> If missing → STOP: *"Template missing. Run `flowgrid init`."*
> **[MANDATORY]** Read entire `ir/design.yaml` first (actions + nested items with `apiRefs`). If `ir/` is missing, read `*.bundle.yaml`.

# /api-spec — Backend API Contract

**SSOT:** `…/api/<seq>/01-backend-spec.yaml` only. Do **not** write `bundle.spec.api`.

Shared extracts: `spec-evolution.md`, `api-spec-sync.md`, `entity-relationship.md`, `derived-data.md`, `agent-discipline.md`, `verify-gate.md`.

Hashtag extracts: `#call-external` → `call-external.md`; `#cross-entity-service` → `cross-entity-service.md`.

---

## Rule: Audit Interlock

- **[MANDATORY]** Always run static audit first: `flowgrid audit api <target-api.bundle.yaml>`.
  - ✅ Consume JSON gap report to fix issues or trigger AskQuestion wizard (≥3 options).
  - ❌ Do not skip audit and proceed to authoring directly.

---

## Rule: Missing Information Handling & Workload Threshold (Law 2)

- **[MANDATORY]** When API facts are unknown or ambiguous, evaluate total missing volume:
  - **Small Scope (≤5 questions):** Trigger `AskQuestion` wizard — one question at a time, **≥3 options**: (1) `(Recommended)`, (2) `Other` (free text), (3) `Log as Tech Debt (Pending)`.
  - **Large Scope (≥10 gaps/endpoints):** **[MANDATORY HARD STOP IN CHAT]**. Do not spam single questions in chat. Generate an implementation plan / Plan Mode document partitioned into sequential Phases (3–5 endpoints/gaps per phase) with disk offloading at boundaries.
  - ✅ If member selects "Log as Tech Debt" → create `qa-inbox.md` entry `QA-<feature.id>-NNNN`. Set `pendingTechDebt[].id` to same ID.
  - ❌ Never write `openQuestions` in YAML. Do not invent endpoint logic.

---

## Rule: API Reuse (Search Before Creating)

- **[MANDATORY]** Before creating any new contract trio, scan in hierarchical order:
  1. Sibling screens on this `CMP-*`: `surfaces/<surface>/CMP-*/<NN…>/api/<seq>/`
  2. LCA `common/yaml/` (cluster → module → surface → global)
  3. Other modules on the same surface
- **[MANDATORY]** If existing `01-backend-spec.yaml` is found for this action: tag `#reuse-api` + `reuseFrom: <path>` on the **page action/item** in `ir/design.yaml`. Do NOT duplicate the contract.
- **[STRICTLY FORBIDDEN]** Do NOT create `api/<seq>/` folders for `#reuse-api` actions.
- **[STRICTLY FORBIDDEN]** Do NOT run `openapi:gen` for reused APIs. If every action is `#reuse-api` → zero `api/` folders created.
- Only author a new trio for **NEW unique** `apiRefs` with no existing `01`.

---

## Rule: Middleware Injection

- **[MANDATORY]** Before authoring: scan `surfaces/<surface>/common/yaml/` and `surfaces/common/yaml/` for common middlewares (auth, rate-limit).
  - ✅ If found: inject `#middleware: <id>` on endpoint; do not duplicate logic.
  - ❌ Never duplicate middleware logic in individual endpoint specs.

---

## Rule: Explicit URI Naming

- **[MANDATORY]** All endpoints MUST use explicit action suffixes:
  - `POST /api/v1/…/create`
  - `PUT /api/v1/…/{id}/update`
  - `POST /api/v1/…/{id}/duplicate`
  - `DELETE /api/v1/…/{id}/delete`
  - `GET /api/v1/…/{id}/detail`
  - `GET /api/v1/…/list` or `/search`
- **[STRICTLY FORBIDDEN]** Never use ambiguous RESTful paths without action suffixes (e.g. bare `PUT /users/{id}`).

---

## Rule: Endpoint Error Storming

- **[MANDATORY]** Apply `#err:*` tags based on endpoint nature:
  - Endpoint with `{id}` parameter → MUST have `#err:not-found` (404) + `#err:idor-violation` (403 TENANT_IDOR_VIOLATION).
  - Form submit (POST/PUT) → MUST have `#err:validation` (422) with explicit field rules.
  - Permission-checked route → MUST have `#err:permission-denied` (403 PERMISSION_DENIED).
  - Conflict/duplicate actions → MUST have `#err:conflict` (409 RESOURCE_DUPLICATE / STATE_INVALID).
  - Public/master-data routes with `auth: false` → omit IDOR/auth errors.
- **[RECOMMENDED]** Global errors (`401`, `503`, `500`) → handled by OpenAPI `$ref: '#/components/responses/…'`; do NOT duplicate per-endpoint.

---

## Rule: Folder Structure

- **[MANDATORY]** Function API trio placed AT the leaf alongside FE bundle:
  ```
  surfaces/<surface>/CMP-*/01/01/01/
    <slug>.bundle.yaml
    ir/design.yaml / ir/spec.yaml
    api/01/
      01-backend-spec.yaml   ← VALID YAML (double-quote all colons)
      02-openapi.yaml
      03-mock-data.yaml
  ```
- **[MANDATORY]** Common APIs → LCA `common/yaml/<component-slug>/`.
- **[MANDATORY]** One `01-backend-spec.yaml` = one module + one primary entity. Never dump every screen API into one file.
- **[STRICTLY FORBIDDEN]** Never write `.md` directly. Never combine multiple modules/screens into one gross monolithic file.

---

## Rule: YAML Syntax Safety

- **[MANDATORY]** All strings containing `:` must be double-quoted.
  - ✅ `summary: "Create: New Employee Registration"`
  - ❌ `summary: Create: New Employee Registration`
- **[MANDATORY]** Run `flowgrid check --spec …/api/01/01-backend-spec.yaml` before handoff.
- **[MANDATORY]** Domain tags only (`#call-external`, `#cross-entity-service`, `#err:*`). No `#gen:*` or `codegen` block from this skill.

---

## Workflow

1. Identify feature group, module prefix, Platform/Tenant, aggregates, and pivot M-N relationships.
2. List every action/item from `ir/design.yaml` with `apiRefs` or `#reuse-api`.
3. Scan sibling + common APIs; apply reuse or create new trio.
4. Apply explicit URI action suffixes.
5. Apply error storming `#err:*` per endpoint nature.
6. Run `flowgrid openapi_gen --spec …/api/<seq>/01-backend-spec.yaml` to generate `02-openapi.yaml`.
7. AskQuestion wizard for any unresolved unknowns.
8. Update `.harness/progress.md`.

---

## Verification Checklist

- [ ] Audit script run; all gaps resolved or wizard triggered.
- [ ] Every action/item is either `#reuse-api + reuseFrom` or has new `api/<seq>/` trio.
- [ ] No duplicate trio created for reused APIs.
- [ ] All new endpoints use explicit action URI suffixes.
- [ ] `#err:*` tags applied per endpoint nature (not-found + IDOR on `{id}`, validation on POST/PUT, etc.).
- [ ] Strings with `:` in YAML are double-quoted. No `.md` written directly.
- [ ] `flowgrid check` passed with zero errors.
