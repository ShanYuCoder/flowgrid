---
name: openapi
description: /openapi — generate 02-openapi.yaml from 01-backend-spec.yaml on the docs hub (Docskit).
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /openapi — OpenAPI YAML (docs hub)

**Owner:** Docskit (`--type=docs`). OpenAPI is a **docs artifact**, not Codegenkit.

One generator: **OpenAPI 3.0.3** from `01-backend-spec.yaml`. Merge/UI stays `openapi:render` + Redocly bundle.

---

## Rule: Generation Commands

- **[MANDATORY]** Generate `02-openapi.yaml` from the corresponding `01`:
  ```bash
  docskit openapi:gen --spec surfaces/<surface>/CMP-*/<NN…>/api/<seq>/01-backend-spec.yaml
  # Or from docs hub root (all 01-backend-spec.yaml under surfaces):
  docskit openapi:gen
  # Validate only:
  docskit api:check --spec …/01-backend-spec.yaml
  ```
- **[MANDATORY]** After generation: run `docskit openapi:render` to merge fragments into `docs/openapi/api.yaml`.

---

## Rule: Patch vs Reinvent

- **[MANDATORY]** If fragment is too thin (error $refs, missing examples): patch **`01-backend-spec.yaml`** and regenerate.
- **[STRICTLY FORBIDDEN]** Do NOT hand-edit `02-openapi.yaml` as SSOT.
- **[STRICTLY FORBIDDEN]** Do NOT run Codegenkit `--type=docs` or `nestjs --openapi`. Do NOT invent a second generator per stack.
- **[STRICTLY FORBIDDEN]** BE `/api` generates implementation code from the contract — it does NOT own OpenAPI YAML.
