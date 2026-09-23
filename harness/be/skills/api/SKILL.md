---
name: api
description: /api — backend API generation through Codegenkit BE adapters.
disable-model-invocation: true
---

# /api — Backend API

**Owner:** Codegenkit (`--type=be`)  
**Adapters:** `fastapi` · `laravel` · `dotnet-integration` · `nestjs`

## Generate

```bash
npm run codegen:api:dry -- --spec /path/to/api/01/01-backend-spec.yaml
npm run codegen:api -- --spec /path/to/api/01/01-backend-spec.yaml
npm run codegen:api -- --spec /path/to/api/01/01-backend-spec.yaml --force
npm run codegen:api:unit:dry -- --spec /path/to/api/01/01-backend-spec.yaml

# Fallback direct CLI if wrappers missing:
codegenkit api-gen:dry --adapter=fastapi -- --spec /path/to/api/01/01-backend-spec.yaml
codegenkit api-gen --adapter=fastapi -- --spec /path/to/api/01/01-backend-spec.yaml
codegenkit api-gen --adapter=fastapi -- --spec /path/to/api/01/01-backend-spec.yaml --force
codegenkit api-unit-gen:dry --adapter=fastapi -- --spec /path/to/api/01/01-backend-spec.yaml

codegenkit api-gen:dry --adapter=laravel -- --spec /path/to/api/01/01-backend-spec.yaml
codegenkit api-gen --adapter=laravel -- --spec /path/to/api/01/01-backend-spec.yaml

codegenkit api-unit-gen:dry --adapter=laravel -- --spec /path/to/api/01/01-backend-spec.yaml
codegenkit api-registry --adapter=laravel
codegenkit api-unit-registry --adapter=laravel

# After init, engine lives at src/.codegenkit/ (PHP only; requires symfony/yaml require-dev):
# php src/.codegenkit/bin/unit-gen.php --spec … [--dry-run] [--force] [--phase all]

codegenkit api-gen:dry --adapter=nestjs -- --spec /path/to/api/01/01-backend-spec.yaml
codegenkit api-unit-gen:dry --adapter=nestjs -- --spec /path/to/api/01/01-backend-spec.yaml
codegenkit api-registry --adapter=nestjs
```

BE never reads `ir/design.yaml` or `ir/spec.yaml`. `--id CMP-*` globs every `01-backend-spec.yaml` under that module (`…/api/<seq>/`) and generates them in order (stop on first failure). `--spec <dir>` does the same.

FE models (not this skill): `codegenkit contract-gen:dry -- --spec /path/to/ir/design.yaml` on the **FE** lane.

## Docs Root Resolution

1. If `CODEGENKIT_DOCS_ROOT` is set (non-empty), use it as the canonical
   pointer for locating `01-backend-spec.yaml`.
2. If `CODEGENKIT_DOCS_ROOT` is **not** set, fall back to Platform DNA
   configuration (`platform-dna`) to resolve the docs hub path.
   Platform DNA discovery is slower and more error-prone, so always prefer
   an explicit `CODEGENKIT_DOCS_ROOT` when available.

## Route

Architecture/C4 → Docskit (`DOCSKIT_ROOT`); IR via explicit `--spec` /
`CODEGENKIT_DOCS_ROOT` when configured — never ArtifactGraph as the docs
bridge. This-repo conventions → local CodeGraph if present; other repo X →
only Platform DNA-wired `codegraph-<key>`. ArtifactGraph = local allowlist
hints only.

The selected backend repository is the only write target. Never infer a sibling
docs hub or frontend checkout. Never Write `ir/*` or `*.bundle.yaml` on the docs hub;
missing `codegen.profile` on **01-backend-spec.yaml** → STOP, hand off to docs `/grill-api-spec`.

Laravel supports the detected `modules-v1` profile only. FastAPI requires an
explicit Python runtime or target virtual environment.

`dotnet-integration` requires the .NET 8 SDK (`CODEGENKIT_DOTNET`, then
`dotnet`) and supports the pilot-specific `mes-downtime` profile. Its API pass
already emits test source; it has no separate API unit-generation engine.

FastAPI generates all nested module entities, with flat `entities` and legacy
`codegen.entity` compatibility. Code and unit manifests retain SHA-256
ownership: identical and unmodified managed files are safe, while unmanaged or
locally modified files block the whole batch. Inspect dry-run statuses before
using `--force`, which explicitly overwrites conflicts. Ambiguous global
endpoints in a multi-entity spec are not shared across entities; the generator
warns and uses entity-local CRUD defaults.

## Review requirements

- Replace generated auth/authorization placeholders with project policy.
- Verify validation, resources/presenters, transactions and error mapping.
- Run backend tests and `/business-impact-review` for risky changes.

## Accelerators (optional)

```text
if ArtifactGraph available: allowlist/recommend API generation
else: execute Codegenkit adapter directly

if CodeGraph available for this checkout (`codegraph-<key>`): inspect existing module conventions/callers
else: targeted repository search — never a workspace-parent graph
else: targeted repository search and reads
```

Missing accelerators never block API generation. Complete each documented
direct or targeted-local fallback first, then follow
`.cursor/rules/codegenkit-optional-integrations.mdc` for deduplicated
once-per-run-and-optional telemetry with observed metrics only.

## Translation Rule (i18n)
Always wrap static text with native framework i18n helpers (e.g. `__('key')`, `_localizer["key"]`, `i18n.t('key')`).
- **[MANDATORY]** Read the `i18n` block from `ir/design.yaml`.
- **[MANDATORY]** Automatically generate or update the corresponding translation locale files (`.json` for NodeJS/PHP/Python, or `.resx` for .NET).
- **[STRICTLY FORBIDDEN]** Do NOT return unlocalized static raw error messages without an i18n wrapper.

## Profile Handling Behavior
**[CRITICAL INTERLOCK]** AI MUST NOT rewrite code from scratch. The CLI command `codegenkit api-gen` (Script Engine) MUST run first to emit the foundation scaffolding. Depending on `gen.codegen.profile`, AI reads the scaffolded base and enriches the targeted logic:
- **`profile: auth`**: Inject authentication logic (Login, JWT token, bcrypt password hashing).
- **`profile: select-item`**: Streamline into a lightweight selection list returning `id`, `name`/`label` for dropdown components.
- **`profile: setting`**: Adapt scaffold to read/write static Key-Value configurations or JSON store.
- **`profile: free`**: Implement domain-specific requirements according to the spec's `summary` / `purpose`.
- **`profile: export`**: Implement large-dataset retrieval and file export generation (CSV/Excel).
- **`profile: import`**: Implement file upload parsing, bulk validation, and batch insert.
- **`profile: dashboard-stats`**: Implement aggregation queries, grouping data to return statistical metrics.
