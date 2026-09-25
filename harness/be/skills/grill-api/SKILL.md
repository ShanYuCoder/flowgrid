---
name: grill-api
description: /grill-api — audit generated FastAPI/Laravel/Nest API before integration.
disable-model-invocation: true
---

# /grill-api

Run after `npm run codegen:api:dry` / `flowgrid api-gen:dry` and after implementation.

**Owner:** bộ code (`--type=be`). Docs hub is **read-only**.

## Target / ID Resolution Rule

- User prompt MAY specify a function ID, API slug, or short name (e.g. `API-AUTH-001`, `login`, `CMP-ADM-009`).
- Agent MUST resolve **`…/api/<seq>/01-backend-spec.yaml`** via `FLOWGRID_DOCS_ROOT` or `flowgrid_docs_route` (screen leaf `CMP-*/<NN…>/api/<seq>/`, or `common/yaml/<slug>/`, or `integrations/…/api/<seq>/`).
- **Read the entire `01-backend-spec.yaml`**. Do **not** use `ir/design.yaml` or `ir/spec.yaml` as BE contract.
- Compare generated routes/code against that 01 file. Missing 01 → STOP, hand off to docs `/grill-api-spec`.
- Do NOT demand full filesystem paths from the user if an ID is given.

## Docs Root Resolution

1. If `FLOWGRID_DOCS_ROOT` is set (non-empty), use it as the canonical
   pointer for locating `01-backend-spec.yaml`.
2. If `FLOWGRID_DOCS_ROOT` is **not** set, fall back to Platform DNA
   configuration (`platform-dna`) to resolve the docs hub path.
   Platform DNA discovery is slower and more error-prone, so always prefer
   an explicit `FLOWGRID_DOCS_ROOT` when available.

Check:

- Routes/methods/statuses match `01-backend-spec.yaml` (action-suffix paths).
- AuthZ and tenant scope use trusted context.
- Validation does not accept request-bag noise.
- Null/empty/error semantics remain distinct.
- Writes are transaction-safe; async retries are idempotent.
- Generated placeholders are replaced before ship.

## Accelerators (optional)

```text
if ArtifactGraph available: local contract/tag/parity hints only
else: scoped contract-to-code comparison

if codegraph-<repo-key> for this checkout: callers/routes/jobs/listeners
else: targeted repository search

architecture IDs / C4 → bộ docs (FLOWGRID_DOCS_ROOT), never CodeGraph
```

Missing accelerators never block the grill. Complete each scoped model or
targeted-local fallback first, then follow
the remainder of this skill.

## Translation Rule (i18n)
Always wrap static text with native framework i18n helpers (e.g. `__('key')`, `_localizer["key"]`, `i18n.t('key')`).
- **[MANDATORY]** Read the `i18n` block from `ir/design.yaml`.
- **[MANDATORY]** Automatically generate or update the corresponding translation locale files (`.json` for NodeJS/PHP/Python, or `.resx` for .NET).
- **[STRICTLY FORBIDDEN]** Do NOT return unlocalized static raw error messages without an i18n wrapper.

## Profile Handling Behavior
**[CRITICAL INTERLOCK]** AI MUST NOT rewrite code from scratch. The CLI command `flowgrid api-gen` (Script Engine) MUST run first to emit the foundation scaffolding. Depending on `gen.codegen.profile`, AI reads the scaffolded base and enriches the targeted logic:
- **`profile: auth`**: Inject authentication logic (Login, JWT token, bcrypt password hashing).
- **`profile: select-item`**: Streamline into a lightweight selection list returning `id`, `name`/`label` for dropdown components.
- **`profile: setting`**: Adapt scaffold to read/write static Key-Value configurations or JSON store.
- **`profile: free`**: Implement domain-specific requirements according to the spec's `summary` / `purpose`.
- **`profile: export`**: Implement large-dataset retrieval and file export generation (CSV/Excel).
- **`profile: import`**: Implement file upload parsing, bulk validation, and batch insert.
- **`profile: dashboard-stats`**: Implement aggregation queries, grouping data to return statistical metrics.
