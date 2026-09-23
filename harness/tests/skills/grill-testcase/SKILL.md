---
name: grill-testcase
description: /grill-testcase — audit E2E plan YAML/MD on the tests hub.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /grill-testcase

**Owner:** Testkit (`--type=tests`)

Audit plans only. Spec holes hand off to docs-hub `/update-spec` or `/grill-bqa` (Docskit), never invent acceptance. **[MANDATORY]** When handing off, you MUST output a comprehensive gap report in the Chat Thread formatted as a complete, ready-to-use prompt starting with `@docskit` (e.g., `@docskit /update-spec [details...]`). This prompt must detail exactly what business rules or coverage are missing, enabling the user to copy-paste it directly to run the docs-hub skill.

Route Functions/W-* evidence through Docskit and symbol/call-graph evidence
for repo X through its Platform DNA-wired `codegraph-<repo-key>` server. Use
`TESTKIT_DOCS_ROOT` / `TESTKIT_TESTS_ROOT` for pointer evidence; never build or
query a workspace-parent graph.

## Target / ID Resolution Rule

- User prompt MAY specify a screen ID, module ID, or short slug (e.g. `W-AD-AUTH-001`, `CMP-ADM-000`, `login`).
- **[MANDATORY]** Agent MUST use `docskit_route` or `docskit_get_element` (or glob search under `TESTKIT_DOCS_ROOT` / `surfaces/...`) to resolve target paths.
- **[MANDATORY]** Read the entire `ir/design.yaml` (do not filter keys). Do not load `*.bundle.yaml`.
- If `userStories.scenarios` or `userStories.acceptance` in design are too thin or missing, **enrich design** (docs-hub `/update-spec` / grill-dev + split). **[STRICTLY FORBIDDEN]** Do NOT audit against `ir/spec.yaml` prose.
- **[STRICTLY FORBIDDEN]** Do NOT read generated `*.md`.
- If auditing **SC-***, the YAML/MD path MUST mirror the docs `FLOW-*.md` (cluster/module/surface `common/processes/` or `architecture/03-business-process/`). Flag `scenarios/auth/…` or `common/` leftovers.

## Audit Rules

- **Audit Coverage against Scenarios & testMatrix:** **[MANDATORY]** You MUST cross-reference authored test cases with `userStories.scenarios`, `validation`, and `actions` in `ir/design.yaml`.
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
`/update-spec` (Docskit), not through ArtifactGraph.

Use one stable `runId` per run. When ArtifactGraph is missing, finish the local
fallback before emitting exactly one `testkit.missing-optional` event for that
`runId` + `artifactgraph`; retries must not emit again. Conform to
`.cursor/schemas/testkit/missing-optional-event.schema.json` and include only
actual successful `fileReads` and exact raw `contextBytes`, never estimates.
