---
name: testcase
description: /testcase — author E2E plan YAML/MD on the tests hub (not Playwright).
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read entire `ir/design.yaml` for the target screen BEFORE authoring any test case.

# /testcase — E2E Test Case Authoring (Tests Hub)

**Owner:** Testkit (`--type=tests`). Design rules stay on docs hub. Playwright generation is FE `/test`.

---

## Rule: Audit Interlock & Workload Threshold (Law 2)

- **[MANDATORY]** Always run static audit first: `node engines/spec/lib/audit-testcase-gaps.mjs <target-test.yaml>`.
  - ✅ Consume JSON gap report to fix coverage gaps.
  - **Threshold Interlock (Law 2):**
    - **Small Scope (≤5 missing testcases/gaps):** Resolve inline in chat thread.
    - **Large Scope (≥10 missing testcases/gaps):** **[MANDATORY HARD STOP IN CHAT]**. Generate an implementation plan / Plan Mode document partitioned into sequential Phases (3–5 testcases per phase) with disk offloading at boundaries.
  - ❌ Do not skip audit and proceed to authoring directly.

---

## Rule: Missing Scenarios / Acceptance Criteria

- **[MANDATORY]** If `userStories.scenarios` or `userStories.acceptance` is missing in `ir/design.yaml`:
  → **STOP**. Output a complete gap report in chat formatted as a ready-to-paste prompt: `@docskit /update-spec [exact missing details]`. Do NOT invent test cases.
- **[STRICTLY FORBIDDEN]** Do NOT write docs hub files (`ir/*`, `*.bundle.yaml`). Do NOT read `ir/spec.yaml` for testcase authoring. Do NOT read generated `*.md`.

---

## Rule: ID Resolution

- **[MANDATORY]** Use `docskit_route` or `docskit_get_element` (or glob under `TESTKIT_DOCS_ROOT` / `surfaces/…`) to resolve target paths from ID or slug.
- **[STRICTLY FORBIDDEN]** Do NOT demand full filesystem path from user when ID or slug is given.

---

## Rule: Directory Mirroring (Docs SSOT)

- **[MANDATORY]** Mirror function folder: `cases/<relative-path>/TC-*.yaml`.
  - ✅ `surfaces/admin/CMP-ADM-002/02/01/login/` → `cases/admin/CMP-ADM-002/02/01/login/TC-*.yaml`
  - ❌ `cases/admin/auth/W-…` — invented path not matching docs structure.
- Cross-flow plans → `/scenario` (mirror `common/processes/FLOW-*` or `architecture/03-business-process/FLOW-*`).

---

## Rule: Test Case Content Requirements & Equivalence Partitioning (testMatrix)

- **[MANDATORY]** Read `userStories.scenarios`, `validation`, and `actions` from `ir/design.yaml`.
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
  - Functions/`W-*` → Docskit
  - Plan/docs → `TESTKIT_TESTS_ROOT` / `TESTKIT_DOCS_ROOT`
  - Symbols for repo X → `codegraph-<repo-key>` (Platform DNA-wired server)
- **[STRICTLY FORBIDDEN]** Never query one workspace-wide graph. Never hand-edit MCP config.

---

## Verification Checklist

- [ ] Audit script run; all coverage gaps resolved or gap report generated for docs hub.
- [ ] `ir/design.yaml` read in full (not partial slices).
- [ ] All `userStories.scenarios` covered by corresponding test cases.
- [ ] Equivalence Partitioning & Boundary Value Analysis `testMatrix` declared (min/max boundary, regex failure, duplicate 409, double-submit lock, offline preservation).
- [ ] Scenario markdown (`SC-*.md`) formatted with IEEE 29119 Boundary Analysis Table & Gherkin BDD.
- [ ] `meaning` + `purpose` used for step descriptions.
- [ ] `id` short; `title` ≤20 chars; `description` is rich and business-meaningful.
- [ ] YAML syntax valid — no JS expressions in test data values.
- [ ] Directory structure mirrors docs SSOT path exactly.
