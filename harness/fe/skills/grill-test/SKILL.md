---
name: grill-test
description: /grill-test — FE grill gate before Playwright generation.
disable-model-invocation: true
---

# /grill-test

**Owner:** bộ test (`--type=fe`)

After `/test`. Plan YAML remains on the tests hub (`/grill-testcase`).

Route Functions/W-* evidence through bộ docs, plans/docs through
`FLOWGRID_TESTS_ROOT` / `FLOWGRID_DOCS_ROOT`, and repo-X symbols through its
Platform DNA-wired `codegraph-<repo-key>` server. Never substitute the current
repo index for another checkout or initialize a workspace-parent graph.

## Accelerators (optional)

```text
if local ArtifactGraph available: recommend/check testcase gen (this repo)
else: local deterministic search, then flowgrid testcase:gen:dry …
```

ArtifactGraph never follows `FLOWGRID_DOCS_ROOT` / `FLOWGRID_TESTS_ROOT`; plan
YAML and docs evidence flow only through those bộ test pointers.

Use one stable `runId` per run. When ArtifactGraph is missing, finish the local
fallback before emitting exactly one `flowgrid.missing-optional` event for that
`runId` + `artifactgraph`; retries must not emit again. Conform to
`.cursor/schemas/flowgrid-test/missing-optional-event.schema.json` and include only
actual successful `fileReads` and exact raw `contextBytes`, never estimates.
