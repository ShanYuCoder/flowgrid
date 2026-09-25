# Artifact completeness roadmap (SSOT chain)

**Responsibility boundary:** FlowGrid ships skills, audits, and gates — not release quality when members skip steps. See [Tool vs team responsibility](./tool-vs-team-responsibility.md).

Assumes team **chooses** to follow harness flow (bundle → audit → grill → split → testcase / prototype / API).

**Out of scope (product):** human compliance, deploy/CI ownership (DevOps), PM sketch lane, ALM/sprint, forcing full BQA before quick UI.

## Resolved: test traceability SSOT

**Policy:** `/testcase` and `/grill-testcase` read the **function `*.bundle.yaml`** (sibling of `ir/`) in full — not `ir/spec.yaml` + `ir/design.yaml` separately.

- `userStories`, `acceptanceCriteria` live on bundle top-level.
- `design.actions`, `design.sections`, `spec.ui.*` live under bundle sections.
- **Write** remains docs-hub only (`/update-spec`, `/spec`); tests hub does not patch bundle.

If `*.bundle.yaml` is missing → STOP. If `flowgrid check` reports IR out of sync → hand off docs-hub to split from bundle before grilling tests.

---

## Phase A — `audit testcase` ↔ bundle (deterministic) — **implemented**

| Item | Deliverable |
|------|-------------|
| A1 | `flowgrid audit testcase <TC.yaml> --bundle <path>` optional flag |
| A2 | Cross-check: each `userStories.scenarios[].name` has ≥1 TC referencing it (or `scenarioRef`) |
| A3 | Cross-check: each `acceptanceCriteria` line tagged in TC `tags` or `verifiesAcceptance` |
| A4 | Cross-check: design `actions[]` with `outcomes` have exception/happy TC keywords or explicit `actionRef` |
| A5 | Tests in `test/audit-engines.test.mjs` |

Engine: `engines/spec/lib/audit-testcase-bundle-cross.mjs` (merged by `audit-testcase-gaps.mjs`).

**Outcome:** Pass audit TC + pass bundle cross-audit ⇒ much lower scenario leak without relying on agent memory.

---

## Phase B — FE ↔ BE contract gate — **implemented (audit + grill-dev)**

| Item | Deliverable |
|------|-------------|
| B1 | Document mandatory order in lifecycle: design change → `api-update` / `grill-api-spec` → `openapi:gen` when applicable |
| B2 | `flowgrid audit fe-be <bundle.yaml> [--backend-spec …]` — `engines/spec/lib/audit-fe-be-alignment.mjs`; grill-dev checklist |
| B3 | Close or track open items in `docs/4-contracts/portal-to-fastapi.md` per pilot (envelope, list E2E) |

**Outcome:** Fewer integration bugs when both lanes followed.

---

## Phase C — FLOW ↔ W-* coverage — **implemented (audit + scenario skill)**

| Item | Deliverable |
|------|-------------|
| C1 | `/scenario` template lists `screens: [W-*…]` required |
| C2 | `flowgrid audit scenario <SC.yaml> --tests-root` — `engines/spec/lib/audit-scenario-coverage.mjs` |
| C3 | Optional: adopt inventory `W-*` status `not_started | specced | tested` (manual field, no PM tool) |

**Outcome:** Cross-screen journeys do not rely on per-screen audits alone.

---

## Phase D — `update-spec` delta safety — **implemented (skill rules)**

| Item | Deliverable |
|------|-------------|
| D1 | `update-spec` SKILL: any delta touching `design.actions` or `spec.ui` triggers **bundle-level** `userStories` / AC touch checklist (same table as bundle-authoring UX ↔ userStories) |
| D2 | `flowgrid audit spec` re-run mandatory after `/update-spec` before merge/split |

**Outcome:** PM/quick deltas do not desync business prose from tech.

---

## Phase F — TC schema v2 + release gate — **done**

| Item | Deliverable |
|------|-------------|
| F1 | `audit-testcase-tc.mjs` for `TC-*.yaml`; legacy plan → `audit-testcase-plan-gaps.mjs` |
| F2 | `schemas/testcase.schema.json` `schemaVersion: 2` + `testMatrix` facet enum |
| F3 | Golden `harness/tests/templates/TC.example.yaml` + `test/testcase-schema.test.mjs` |
| F4 | `flowgrid cases:gate` — `engines/cases/gate.mjs` (schema, audit, `audit-tc-traceability`, per-screen facets, SC coverage) |

---

## Phase E — CI wiring (**DevOps / repo owners — not FlowGrid product**)

Gợi ý khi team muốn gắn CLI vào PR; toolkit **không** ship pipeline.

| Item | Gợi ý lệnh |
|------|------------|
| E1 | Docs hub PR: `flowgrid check` on `*.bundle.yaml` |
| E2 | Tests hub PR: `flowgrid cases:gate --strict` + `FLOWGRID_DOCS_ROOT` |
| E3 | `flowgrid doctor` / branding — onboarding doc |

**Outcome:** Nếu DevOps bật CI, gap sớm hơn; nếu không, member vẫn chạy gate local theo skill.

---

## Priority

1. **Done (policy):** bundle read for testcase (skills + bundle-authoring).
2. **Done:** Phases A–D (audit engines + skills).
3. **E** — optional; DevOps only (see tool-vs-team doc).
4. **B3 / C3** — pilot contracts & optional W-* inventory (manual).
