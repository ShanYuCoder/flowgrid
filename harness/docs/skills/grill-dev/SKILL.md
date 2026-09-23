---
name: grill-dev
extractBundle: dev-grill
description: EXCLUSIVE /grill-dev — ONLY for engineering codegen tags and bundle.gen. DO NOT trigger for BQA, BA, or UI design grills.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read entire `ir/design.yaml`. If `ir/` is missing, read entire `*.bundle.yaml`. NEVER filter partial keys.
> **[MANDATORY]** Expect `grillStatus.bqaOpen: done` (or `bqaFacts`) before starting.

# /grill-dev — Dev / Codegen Grill

**Scope:** Author `bundle.gen` + `api/<seq>/01-backend-spec.yaml` only. No prose, no BQA reports, no framework code snippets.

**Doc hub:** `platform/toolchain/PORTAL-CODEGEN.md`
**Extracts:** `extractBundle: dev-grill` → `codegen/readiness.md`, `platform-mark-detect.md`

---

## Rule: Load Policy

| Read (whole file) | Write | NEVER Read |
|---|---|---|
| **`ir/design.yaml`** (layout, ui, projected api, entities, codegen, tags) | `bundle.gen` on `*.bundle.yaml` → `pnpm spec:split` | `ir/spec.yaml` prose, generated `*.md` |
| **`api/<seq>/01-backend-spec.yaml`** (endpoint action/path) | endpoint `action` / path on **01** only — NOT `bundle.spec.api` | |

---

## Rule: Missing Information / Hard Gate & Workload Threshold (Law 2)

- **[MANDATORY]** If `gen.codegen.profile` is missing, OR `entity`/`module` is empty for list/create/admin-crud/auth/change-password, OR sibling `01` endpoints lack `action` + path suffix:
  → **Proactively brainstorm** logical suggestions from business context in Vietnamese (e.g. login page → suggest `module: auth, entity: user`).
  - **Small Scope (≤5 questions):** Trigger `AskQuestion` wizard — **one question at a time**, ≥3 options: (1) `(Recommended)`, (2) `Other` (free text), (3) `Log as Tech Debt (Pending)`. Wait for member answer before showing next question.
  - **Large Scope (≥10 gaps/endpoints):** **[MANDATORY HARD STOP IN CHAT]**. Do not spam single questions in chat. Generate an implementation plan / Plan Mode document partitioned into sequential Phases (3–5 endpoints/gaps per phase) with disk offloading at boundaries.
  - ✅ If member selects "Log as Tech Debt" → create `qa/open/QA-<bundle.id>-NNNN.yaml`; maintain `grillStatus.dev: pending`.
  - ❌ Do NOT set `grillStatus.dev: done` until profile + entity/module + endpoint actions are all verified and confirmed.

---

## Rule: Codegen Profile Mapping

- **[MANDATORY]** Use correct profile per page type:

| profile | Pages | Next.js output |
|---|---|---|
| `auth` | login, forgot, reset | `src/app/(auth)/…` — no admin chrome |
| `change-password` | change password (logged-in) | `src/app/(dashboard)/…` |
| `public` | marketing / other public | `src/app/(public)/…` |
| `not-found` | 404 | `src/app/not-found.tsx` |
| `error` | 503 / error | `src/app/error.tsx` |
| `list` / `create` / `admin-crud` | admin CRUD | `src/app/(dashboard)/…` |

- **[STRICTLY FORBIDDEN]** Never use `create` for auth pages. `auth` covers login/forgot/reset.

---

## Rule: bundle.gen Required Fields

- **[MANDATORY]** `bundle.gen` MUST contain:
  ```yaml
  gen:
    codegen:
      profile: "auth"   # or list | create | admin-crud | public | not-found | error | change-password
      entity: ""
      module: ""
    tags:
      - "#gen:test-schema"
      - "#gen:test-service"
    ui:
      filters: []
      columns: []
      composition: null
      testIds: null
  ```
- **[MANDATORY]** Tags by profile: `list` → `#gen:test-schema` + `#gen:test-service`; `create` → `#gen:test-validation`.

---

## Rule: UI Component & Registry

- **[MANDATORY]** Before tagging `#needs-component`, match widget against `design.registry` and existing `#ui:` tags.
  - Shadcn primitive → `#ui: <Primitive>` (FE installs via `shadcn add`).
  - Unknown widget → `#needs-ui:` or prompt member. Never invent an arbitrary shadcn component name.
  - ≥2 **domain** structural blocks → `#needs-component: MoBlockName`.
  - **[STRICTLY FORBIDDEN]** Do NOT tag shadcn primitives (`Dialog`, `Button`, `Table`) as `#needs-component`.
- **[MANDATORY]** Pages with ≥3 levels of nested UI (Page → Tab → Card → Sub-table) → suggest `#use-store` (Pinia/Zustand).
- **[MANDATORY]** Forms MUST be extracted as independent SPA components. `ui.form` must be properly defined; do NOT merge form layout into page shell.

---

## Rule: Hashtag & Error Verification

- **[MANDATORY]** Verify and apply these tags from `ir/design.yaml` evidence:
  - Domain: `#call-external`, `#cross-service`, `#cross-entity-service`, `#derived-data`, `#tech-debt:*`
  - Errors: `#err:validation`, `#err:idor-violation`, `#err:not-found`, `#err:permission-denied`
  - Code-size: `#split-hook:columns` (>8 cols), `#split-hook:filters` (>3 filters), `#split-hook:export`, `#split-hook:form-sections` (>6 fields)

---

## Rule: API Reuse & Explicit Suffix

- **[MANDATORY]** Scan `common/yaml/` (LCA) + sibling `…/api/<seq>/` for existing `01` files. If found → tag `#reuse-api` + `reuseFrom` on page action/item; skip new trio.
- **[MANDATORY]** All endpoint paths MUST use explicit suffixes: `/create`, `/{id}/update`, `/{id}/duplicate`, `/{id}/delete`, `/{id}/detail`.

---

## Rule: Common Candidates Review

- **[MANDATORY]** After scanning columns/toolbar/filters/composables, present a **Common Candidates** summary table (in Vietnamese) to member. Provide selectable options (A/B/C). Record confirmed common promotions via `artifactgraph_remember` (when available).
- `render: custom` → `#needs-component: cell-{key}:MoXxx` or matching Mo* in design registry.
- Repeating logic (export, auth) → ask for `#common:` / `#needs-common:`.

---

## Rule: Done Gate

- **[MANDATORY]** Set `grillStatus.dev: done` ONLY when ALL are satisfied:
  1. `gen.codegen.profile` is set (double-quoted string).
  2. `entity` + `module` are non-empty (for list/create/admin-crud/auth/change-password/public).
  3. Sibling `01` endpoint `action` + path suffix are explicitly set.
- **[MANDATORY]** Run `docskit_bundle_split` after editing bundle; user runs `docs_render`.
- **[MANDATORY]** If ArtifactGraph is available: call `artifactgraph_allowlist_check(commandKey=genDry)` then `artifactgraph_recommend_command`. Do NOT execute code generation in docs hub.

---

## Out of Scope

- **[STRICTLY FORBIDDEN]** No BQA 3-Pillars reports, no framework code (FastAPI, Pydantic, Axios, i18n), no UX prose, no full E2E, no `portal:gen` execution.

---

## Handoff

- FE Codegenkit dry pass → `/prototype`
- BQA↔Dev conflict → `/grill-docs`
- Legacy fact gap → `/update-spec-legacy`
- Confirmed common promote → `/platform-mark` (same session or before `/prototype`)

---

## Verification Checklist

- [ ] `grillStatus.bqaOpen: done` confirmed before starting.
- [ ] `bundle.gen.codegen.profile` set with correct profile per page type.
- [ ] `gen.ui`: `filters`, `columns`, `composition`, `testIds` all present (empty arrays OK).
- [ ] Profile-specific gen tags applied (`#gen:test-schema`, `#gen:test-service`, `#gen:test-validation`).
- [ ] `#err:*` tags applied for each endpoint's nature (IDOR on `{id}`, validation on POST/PUT).
- [ ] UI components: `#ui:` for primitives, `#needs-component:` for domain Mo* blocks only.
- [ ] `grillStatus.dev: done` set only with profile + entity/module + endpoint actions confirmed.
- [ ] Bundle split run with zero errors; no `bundle.spec.api` authored.
