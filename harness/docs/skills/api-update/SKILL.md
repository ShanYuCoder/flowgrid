---
name: api-update
description: EXCLUSIVE /api-update — ONLY for updating/syncing backend contract under surfaces/ when Portal spec changes or BE-only requirements update. DO NOT generate Markdown reports.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /api-update — Portal Sync & BE-Only Updates

No Laravel code. No `codegen` / `#gen:*` — grill adds those after sync.

Shared extracts: `api-spec-sync.md`, `spec-evolution.md`, `entity-relationship.md`, `derived-data.md`, `agent-discipline.md`

---

## Rule: Modes

- **[MANDATORY]** Select the correct mode from user prompt:

  | Mode | Prompt | Action |
  |---|---|---|
  | `portal-sync` (default) | `/api-update <ID or path>` | Diff portal `ir/design.yaml` → patch `01` (+ mock); **regen** `02` via `openapi:gen` |
  | `be-only` | `/api-update <ID or path> --be-only` | Only `beOnlyRequirements`, `derivedData`, internal validation — do NOT change FE contract |

---

## Rule: ID Resolution & Folder Location

- **[MANDATORY]** If an ID is provided (e.g. `CMP-ADM-000-001`, `W-AD-AUTH-001`) → use `docskit_route` or glob to resolve to `…/api/<seq>/01-backend-spec.yaml`. Do NOT force user to provide full filesystem path.
- **[MANDATORY]** Trio lives under `api/<seq>/` — never adjacent to `*.bundle.yaml`.
- Common APIs: `…/common/yaml/<slug>/01-backend-spec.yaml` (one trio per API).

---

## Rule: Portal-Sync Workflow

1. **[MANDATORY]** Read entire `ir/design.yaml` (page actions/items, `apiRefs`, `#reuse-api`, `reuseFrom`).
   - `#reuse-api` actions → do NOT create a new `01`.
   - Do NOT treat projected `design.api` as BE SSOT.
2. **[MANDATORY]** Diff requirements, endpoints, acceptance vs `01-backend-spec.yaml`.
3. **[MANDATORY]** Patch `01-backend-spec.yaml` (+ `03-mock-data.yaml` if samples change).
4. **[MANDATORY]** Run: `docskit api:check --spec …/01-backend-spec.yaml` → `docskit openapi:gen --spec …/01-backend-spec.yaml` (writes sibling `02`).
5. **[MANDATORY]** Bump `feature.version` + add `changeLog` entry.
6. **[STRICTLY FORBIDDEN]** Never hand-edit `02-openapi.yaml` as SSOT. Never write `.md` directly.

---

## Rule: Missing Information / Unknown Facts

- **[MANDATORY]** External integrations or unknowns → trigger `AskQuestion` wizard, presenting ≥3 options: (1) Recommended, (2) Other, (3) "Log as Tech Debt (Pending)".
  - ✅ "Log as Tech Debt" → create `qa-inbox.md` entry; close later with `/qa-resolve`.
  - ❌ Never write `openQuestions` in YAML.
- Export/import/custom → add endpoint stub + `pendingTechDebt.expectedWhenDone` if not merging this session.

---

## Rule: Guardrails

- **[STRICTLY FORBIDDEN]** Do NOT split slug folder for child functions in the same bounded context.
- **[STRICTLY FORBIDDEN]** Do NOT rename API fields for FE convenience.
- **[STRICTLY FORBIDDEN]** No BQA reports, no framework code snippets.

---

## Done Criteria

- Portal delta in `01`; or if deferred: `pendingTechDebt` with `id: QA-<feature.id>-NNNN` + `qa/open/` file.
- `source.portalRefs` current.
- `changeLog` + version bumped.
- Handoff: `/grill-api-spec {slug}` (re-run gates + codegen tags).

---

## Verification Checklist

- [ ] Target is `…/api/<seq>/01-backend-spec.yaml` (or `common/yaml/<slug>/`), not a `01` on the FE leaf.
- [ ] `01` patched; `02` regenerated via `openapi:gen` (not hand-edited).
- [ ] Gates passed: `docskit api:check` + `docskit openapi:gen`.
- [ ] `changeLog` + `feature.version` bumped.
- [ ] No `.md` written directly. No `openQuestions` in YAML.
