---
name: scenario
description: /scenario — author cross-flow E2E scenario YAML/MD on the tests hub.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /scenario

**Owner:** bộ test (`--type=tests`)

Author cross-flow scenarios (SC) on the current tests hub. Design rules stay on the docs hub.

Scenarios test a **business process** (`FLOW-*`) that spans multiple screens (`W-*`) or modules. They mirror the docs FLOW file **after** bộ docs LCA `common/` placement (not a flat `common/` tree).

## Output Rules

- **Rich Business Descriptions:** **[MANDATORY]** When generating YAML scenarios, you MUST provide a detailed `description` (or `story`) field. Do not leave them empty or write sparse 1-liners.
- Explain the **Business Context**: Why does this cross-flow exist? What is the real-world process?
- Outline the **Expected Outcome**: Detail what the end-to-end user journey should achieve.
- Include metadata like `priority`, `status`, `module`, and `tags` if available.
- **[MANDATORY]** Frontmatter MUST list every `W-*` touched by the journey: `screens: [W-…, W-…]` (keep legacy `screen:` for primary screen if needed).
- **[MANDATORY]** After authoring, run `flowgrid audit scenario <SC file> --tests-root <tests-hub-root>`; fix `SC_SCREEN_NO_TC` gaps with `cases/**/TC-*.yaml` or `coverage_deferred` + `QA-*` per screen.
- **Valid YAML Syntax:** **[MANDATORY]** Do NOT write raw JavaScript expressions directly into YAML values. If you need a long string, wrap the exact code expression entirely in single quotes (e.g., `value: '"a".repeat(256)'`).
- **Concise Naming Convention:** **[MANDATORY]** The `id` must be short (e.g., `SC-CHK-01`). The `title` MUST be extremely short and concise (limit 15-20 characters, e.g., `Guest Checkout`, `Refund Flow`). Put long explanations into `description`, not `title` or `id`.

## Target / ID Resolution Rule

- **[MANDATORY]** Agent MUST locate the **`FLOW-*.md`** file on the docs hub (`FLOWGRID_DOCS_ROOT`) via `flowgrid_docs_route` / `flowgrid_docs_get_element` / glob. Filenames are `FLOW-…md`, not `flow-*`.
- Search in this order (same LCA as bộ docs `common-scope.md`):
  1. `surfaces/<surface>/<CMP-id>/<NN>/common/processes/FLOW-*.md` (cluster)
  2. `surfaces/<surface>/<CMP-id>/common/processes/FLOW-*.md` (module)
  3. `surfaces/<surface>/common/processes/FLOW-*.md` (surface)
  4. `surfaces/common/processes/FLOW-*.md` (cross-surface product common)
  5. `architecture/03-business-process/FLOW-*.md` (org catalog only)
- **Strict:** Only author a scenario if that `FLOW-*.md` exists. Missing FLOW or thin business rules → hand off to docs-hub `/business-process` or `/update-spec`, do not invent SC. **[MANDATORY]** When handing off, you MUST output a comprehensive gap report (formatted as a complete, ready-to-use prompt starting with `/docs-hub`) detailing exactly what flows or business rules are missing, so the user can copy-paste it directly to run the docs-hub skill.
- **[STRICTLY FORBIDDEN]** Do not treat `common/yaml/` or `common/patterns/` as scenario sources.

## Directory Mirroring Rule (Docs SSOT)

Mirror the FLOW file path onto the tests hub. Strip **only** these prefixes:

| Docs FLOW path | Tests hub |
|----------------|-----------|
| `surfaces/<rest>/common/processes/FLOW-checkout.md` | `scenarios/<rest>/common/processes/FLOW-checkout/SC-*.yaml` |
| `architecture/03-business-process/FLOW-checkout.md` | `scenarios/architecture/03-business-process/FLOW-checkout/SC-*.yaml` |

Examples:

- Docs `surfaces/admin/CMP-ADM-002/02/common/processes/FLOW-checkout.md` → `scenarios/admin/CMP-ADM-002/02/common/processes/FLOW-checkout/SC-*.yaml`
- Docs `surfaces/admin/CMP-ADM-002/common/processes/FLOW-onboard.md` → `scenarios/admin/CMP-ADM-002/common/processes/FLOW-onboard/SC-*.yaml`

Do **not** flatten to `scenarios/auth/…`. Do **not** use `common/` (legacy). Keep numeric cluster folders (`02/`) in the tests path.

## Accelerators (optional)

```text
if local ArtifactGraph available: taxonomy/coverage/gap hints from this tests hub
else: local deterministic coverage/search from scoped plan + docs evidence
```

ArtifactGraph on the tests hub uses `--type=common,test` and indexes this repo only. Docs-hub FLOW/design evidence comes through explicit docs references, never through ArtifactGraph.
