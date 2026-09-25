# Case plan checks

`check-plans.mjs` parses every `cases/TC-*.yaml` under the project cwd and
validates with Ajv draft 2020-12 against the package SSOT
`schemas/testcase.schema.json` (resolved from this package, not the destination
cwd). Override only for tests via `FLOWGRID_TESTCASE_SCHEMA`.

Change testcase validation rules in that schema rather than in the checker.

**schemaVersion: 2** — requires `testMatrix` (facet enum) and `steps` (min 1). Align with `flowgrid audit testcase` on the same file. Golden template: `harness/tests/templates/TC.example.yaml`.

**Release gate:** `flowgrid cases:gate [--strict] [--docs-root …] [--json] [--no-coverage]` — schema + TC audit + bundle `traceability` + per-screen matrix facets + `cases:coverage`. Use `--strict` before IT/release.
