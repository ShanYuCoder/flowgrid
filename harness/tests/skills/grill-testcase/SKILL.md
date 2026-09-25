---
name: grill-testcase
description: /grill-testcase — audit E2E plan YAML/MD on the tests hub.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /grill-testcase

**Owner:** bộ test (`--type=tests`)

Audit plans only. Spec holes hand off to docs-hub `/update-spec` or `/grill-bqa` (bộ docs), never invent acceptance. **[MANDATORY]** When handing off, you MUST output a comprehensive gap report in the Chat Thread formatted as a complete, ready-to-use prompt starting with `/docs-hub` (e.g., `/docs-hub /update-spec [details...]`). This prompt must detail exactly what business rules or coverage are missing, enabling the user to copy-paste it directly to run the docs-hub skill.

Route Functions/W-* evidence through bộ docs and symbol/call-graph evidence
for repo X through its Platform DNA-wired `codegraph-<repo-key>` server. Use
`FLOWGRID_DOCS_ROOT` / `FLOWGRID_TESTS_ROOT` for pointer evidence; never build or
query a workspace-parent graph.

## Target / ID Resolution Rule

- User prompt MAY specify a screen ID, module ID, or short slug (e.g. `W-AD-AUTH-001`, `CMP-ADM-000`, `login`).
- **[MANDATORY]** Agent MUST use `flowgrid_docs_route` or `flowgrid_docs_get_element` (or glob search under `FLOWGRID_DOCS_ROOT` / `surfaces/...`) to resolve target paths.
- **[MANDATORY]** Read the entire function **`*.bundle.yaml`** (sibling of `ir/`). Cross-reference plans against bundle `userStories`, `acceptanceCriteria`, `spec.ui`, and `design.*` — not split IR files.
- If scenarios/acceptance are thin or missing → hand off docs-hub `/update-spec` or `/spec` (paste-ready prompt). Do not patch bundle from tests hub.
- **[STRICTLY FORBIDDEN]** Do NOT read generated `*.md`.
- If auditing **SC-***, the YAML/MD path MUST mirror the docs `FLOW-*.md` (cluster/module/surface `common/processes/` or `architecture/03-business-process/`). Flag `scenarios/auth/…` or `common/` leftovers.

## Audit Rules

- **[MANDATORY]** Run **`flowgrid cases:gate --strict --docs-root $FLOWGRID_DOCS_ROOT`** before sign-off (replaces ad-hoc check + audit only).
- **[MANDATORY]** Per-file spot check: `flowgrid audit testcase <TC.yaml> --bundle <resolved.bundle.yaml>` when fixing one file.
- Cross-flow SC: `flowgrid audit scenario <SC.md> --tests-root <FLOWGRID_TESTS_ROOT>`
- **Audit Coverage against Scenarios & testMatrix:** **[MANDATORY]** Cross-reference test cases with `userStories.scenarios`, validation inventory, and `design.actions` in the **bundle** (consume `bundleCrossGaps` from audit JSON).
  - Ensure that every scenario defined in the design has corresponding test cases and that all `acceptance` criteria are verified.
  - **[MANDATORY]** Verify that the test case contains a comprehensive `testMatrix` covering: `positive_boundary`, `negative_length/format`, `negative_duplicate`, `concurrency_double_submit`, and `network_interruption`. Flag plans that only test the happy path as incomplete coverage.
- **Check Business Descriptions:** **[MANDATORY]** When auditing plans, ensure that `description` or `story` fields are present, detailed, and align with the element `meaning` / `purpose`. Flag plans that have sparse 1-liners or lack clear business context and expected outcomes. Advise the user or authoring agent to provide richer business logic.
- **Check YAML Syntax Integrity:** **[MANDATORY]** Ensure YAML files do not contain raw JavaScript expressions embedded as values (e.g., `"a".repeat(256)`) without being properly wrapped in single quotes. If you spot JS expressions that would cause a YAML parser to crash (`Unexpected scalar at node end`), flag them immediately.

## Accelerators (optional)

```text
if local ArtifactGraph available: taxonomy/coverage/gap slice from this tests hub
else: local deterministic coverage/search over targeted plan/docs evidence
```

ArtifactGraph indexes this tests hub only; spec-hole handoffs go to docs-hub
`/update-spec` (bộ docs), not through ArtifactGraph.

Use one stable `runId` per run. When ArtifactGraph is missing, finish the local
fallback before emitting exactly one `flowgrid.missing-optional` event for that
`runId` + `artifactgraph`; retries must not emit again. Conform to
`.cursor/schemas/flowgrid-test/missing-optional-event.schema.json` and include only
actual successful `fileReads` and exact raw `contextBytes`, never estimates.
