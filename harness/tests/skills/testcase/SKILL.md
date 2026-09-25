---
name: testcase
description: /testcase — author E2E plan YAML/MD on the tests hub (not Playwright).
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read the entire function **`*.bundle.yaml`** (sibling of `ir/` on docs hub) BEFORE authoring any test case. Do not split-read `ir/spec.yaml` + `ir/design.yaml` for coverage traceability.

# /testcase — E2E Test Case Authoring (Tests Hub)

**Owner:** bộ test (`--type=tests`). Design rules stay on docs hub. Playwright generation is FE `/test`.

---

## Rule: Audit Interlock & Workload Threshold (Law 2)

- **[MANDATORY]** Always run static audit first: `flowgrid audit testcase <cases/.../TC-*.yaml> --bundle <function.bundle.yaml>` (bundle path = same leaf you read for SSOT).
- **[MANDATORY]** Every new TC file MUST declare **`schemaVersion: 2`** and pass `flowgrid cases:check` (JSON Schema) plus audit (matrix facets).
  - ✅ Consume JSON gap report to fix coverage gaps.
  - **Threshold Interlock (Law 2):**
    - **Small Scope (≤5 missing testcases/gaps):** Resolve inline in chat thread.
    - **Large Scope (≥10 missing testcases/gaps):** **[MANDATORY HARD STOP IN CHAT]**. Generate an implementation plan / Plan Mode document partitioned into sequential Phases (3–5 testcases per phase) with disk offloading at boundaries.
  - ❌ Do not skip audit and proceed to authoring directly.

---

## Rule: Bundle SSOT (read)

- **[MANDATORY]** Resolve the function leaf via `flowgrid_docs_route` / glob → read **`…/<slug>.bundle.yaml`** (exactly one bundle per function folder).
- **[MANDATORY]** Trace coverage from bundle: `userStories` (top-level), `acceptanceCriteria`, `spec.ui`, `design.sections`, `design.actions`, `design.stateMatrix`.
- **[MANDATORY]** If bundle missing or `userStories.scenarios` / `acceptanceCriteria` empty → **STOP**; hand off `/docs-hub /update-spec` or `/spec` (paste-ready gap prompt). Do NOT invent tests.
- **[MANDATORY]** If `flowgrid check` / split:check fails on that bundle → hand off docs-hub to reconcile bundle ↔ `ir/*` before testcase grill.
- **[STRICTLY FORBIDDEN]** Write docs hub (`ir/*`, `*.bundle.yaml`). Do NOT use generated `*.md` as SSOT.

**Codegen / Playwright** still consume **`ir/design.yaml`** on FE repo after split; bundle is the **authoring** SSOT for test design.

---

## Rule: ID Resolution

- **[MANDATORY]** Use `flowgrid_docs_route` or `flowgrid_docs_get_element` (or glob under `FLOWGRID_DOCS_ROOT` / `surfaces/…`) to resolve target paths from ID or slug.
- **[STRICTLY FORBIDDEN]** Do NOT demand full filesystem path from user when ID or slug is given.

---

## Rule: Directory Mirroring (Docs SSOT)

- **[MANDATORY]** Mirror function folder: `cases/<relative-path>/TC-*.yaml`.
  - ✅ `surfaces/admin/CMP-ADM-002/02/01/login/` → `cases/admin/CMP-ADM-002/02/01/login/TC-*.yaml`
  - ❌ `cases/admin/auth/W-…` — invented path not matching docs structure.
- Cross-flow plans → `/scenario` (mirror `common/processes/FLOW-*` or `architecture/03-business-process/FLOW-*`).

---

## Rule: Test Case Content Requirements & Equivalence Partitioning (testMatrix)

- **[MANDATORY]** Root field **`schemaVersion: 2`** on every `TC-*.yaml` (release gate SSOT).
- **[MANDATORY]** Populate **`traceability`** (`bundleScreen`, `bundleScenarios[]` slugs, `acceptanceRefs[]` as `AC-01`…, `actionRefs[]` as `btn_*`) from bundle before grill sign-off — required for `cases:gate --strict`.
- **[MANDATORY]** Map cases to `userStories.scenarios`, field `validation`, and `design.actions` from the **bundle** (whole file).
- **[MANDATORY]** Every test case file MUST declare a structured `testMatrix` covering:
  1. `positive_boundary`: Minimum / maximum valid lengths and ranges.
  2. `negative_length` / `negative_format`: Under min, over max, and regex pattern violations with expected localized error messages.
  3. `negative_duplicate`: Server-side remote uniqueness violation (expected 409).
  4. `concurrency_double_submit`: Immediate button disablement and idempotency check.
  5. `network_interruption` / `exception`: Offline banner and form state preservation.
- **[MANDATORY]** Consult `meaning` + `purpose` fields of UI elements when writing step descriptions and test data.
- **[MANDATORY]** `description` / `story` field MUST be rich — explain business context, real-world scenario, expected outcome from user perspective.
  - ✅ Multi-sentence description covering why case exists + what user should experience.
  - ❌ Single-liner `"Test login form"`.
- **[MANDATORY]** `id`: short (e.g. `TC-AUTH-01`). `title`: max 15-20 characters (e.g. `Valid Login`, `Empty Email`). All long explanations belong in `description`.
- **[MANDATORY]** Include: `priority`, `status`, `module`, `tags`, verification of `userStories.acceptance` criteria.
- **[MANDATORY]** YAML test data must be valid YAML — no raw JavaScript expressions (e.g. `"a".repeat(256)` → write the actual repeated string or wrap in single quotes).

---

## Rule: Route Cross-Repo Evidence

- **[MANDATORY]** Route evidence by owner:
  - Functions/`W-*` → bộ docs
  - Plan/docs → `FLOWGRID_TESTS_ROOT` / `FLOWGRID_DOCS_ROOT`
  - Symbols for repo X → `codegraph-<repo-key>` (Platform DNA-wired server)
- **[STRICTLY FORBIDDEN]** Never query one workspace-wide graph. Never hand-edit MCP config.

---

## Verification Checklist

- [ ] Audit script run; all coverage gaps resolved or gap report generated for docs hub.
- [ ] Function `*.bundle.yaml` read in full (not partial slices).
- [ ] All `userStories.scenarios` covered by corresponding test cases.
- [ ] Equivalence Partitioning & Boundary Value Analysis `testMatrix` declared (min/max boundary, regex failure, duplicate 409, double-submit lock, offline preservation).
- [ ] Scenario markdown (`SC-*.md`) formatted with IEEE 29119 Boundary Analysis Table & Gherkin BDD.
- [ ] `meaning` + `purpose` used for step descriptions.
- [ ] `id` short; `title` ≤20 chars; `description` is rich and business-meaningful.
- [ ] YAML syntax valid — no JS expressions in test data values.
- [ ] Directory structure mirrors docs SSOT path exactly.
