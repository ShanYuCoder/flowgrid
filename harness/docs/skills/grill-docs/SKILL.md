---
name: grill-docs
extractBundle: grill-docs
description: EXCLUSIVE /grill-docs — ONLY for reconciling BQA vs Dev conflicts. DO NOT trigger for standalone /grill-dev or /grill-bqa.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read entire `ir/design.yaml` + `ir/spec.yaml`. Never cherry-pick keys from `*.bundle.yaml`.

# /grill-docs — Reconcile BQA ↔ Dev Conflicts + Codegen Gate

**Purpose:** Merge and reconcile contradictions between BQA business requirements and Dev technical specifications. Do NOT author page inventory from scratch.

| Skill | Owns |
|---|---|
| `/grill-bqa` | UI layout, copy, acceptance criteria — NO API/DB debates |
| `/grill-dev` | DB tables, API routes, codegen tags — NO BQA business rules |
| `/grill-docs` | Reconciles contradictions between BOTH above |

---

## Rule: Load Policy

| Read (whole file) | Write | NEVER Read |
|---|---|---|
| **`ir/design.yaml`** | Patch `*.bundle.yaml` → `pnpm spec:split` | Generated `*.md` |
| **`ir/spec.yaml`** (prose vs tech conflicts) | | |

---

## Rule: Missing Information / Conflict Resolution

- **[MANDATORY]** Conflicts → `AskQuestion` wizard — one question at a time, **≥3 options**: (1) Recommended, (2) Other, (3) "Log as Tech Debt".
  - ✅ Member picks → author the spec. "Log as Tech Debt" → create QA file + pointer.
  - ❌ No `openQuestions` left on the bundle.
- **[MANDATORY]** Deferred gaps from `qa-inbox.md` → resolve using `/qa-resolve`, NOT this skill.

---

## Rule: Codegen Gate

- **[MANDATORY]** `bundle.gen.codegen.profile` (+ entity/module when required) MUST be set.
  - Login/forgot/reset → `auth` (NOT `create`).
  - ❌ If missing or wrong → do NOT set `grillStatus.full: done`. Report and hand back to `/grill-dev`.
- **[MANDATORY]** After bundle is reconciled: `docskit_bundle_split` → `docs_render`.
- **[RECOMMENDED]** If ArtifactGraph is available: use `artifactgraph_allowlist_check` + `artifactgraph_recommend_command` for `genDry`; never execute FE generation here.

---

## Workflow

1. Resolve spec ↔ legacyEvidence ↔ design conflicts in bundle via AskQuestion wizard.
2. Reconcile common patterns (BQA flows ↔ Dev `#pattern`, `#split-hook:` tags).
3. Reconcile `#reuse-api` on page actions/items (no duplicate `api/<seq>/` for reused APIs).
4. Verify codegen gate: `bundle.gen.codegen.profile` set correctly.
5. Write/fix `bundle.gen` → `docskit_bundle_split` → `docs_render`.
6. Handoff ID/path + recommendation to FE Codegenkit.

---

## Out of Scope

- **[STRICTLY FORBIDDEN]** No legacy source archaeology. No UI/API implementation. No `ir/*` direct writes.

---

## Handoff

→ `/prototype` after FE Codegenkit dry-run passes.

---

## Verification Checklist

- [ ] Conflicts reconciled in `*.bundle.yaml`, or deferred with `qa/open/QA-…`. No `openQuestions`.
- [ ] `bundle.gen.codegen.profile` present and correct.
- [ ] `docskit split` succeeded with zero errors.
